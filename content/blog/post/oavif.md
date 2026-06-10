+++
title = "Introducing oavif"
date = 2025-10-12
+++

oavif is a new approach to target quality encoding in image compression, designed around smarter convergence strategies and quicker scoring to be as fast as possible.

<!-- more -->

{{ hero(src="/static/img/waves.avif", width="1536", height="864", alt="Waves Crashing") }}

## Why?

Target quality encoding is one of the highest impact use cases for image compression. A target quality encoder framework aims to produce an image encoded at a particular quality set by the user according to some metric or visual quality index. This kind of encoder framework is useful for a variety of users, ranging from small website owners to content delivery networks pushing vast quantities of image data through the Web.

The value of target quality encoding is perceptual consistency. If I rely entirely on my encoder's internal quality index (often set with a "q" parameter), I may not get outputs of perfectly consistent quality when using the same "q" across different images. Relying on a metric that represents the viewer's experience is the solution to this; targeting a representative score within this metric will ensure you always receive an optimally encoded file that never undershoots and ruins image quality, and never overshoots and wastes data.

[**oavif**](https://github.com/gianni-rosato/oavif) is a tool to do target quality encoding extremely quickly. There are three core components to a target quality encoding framework: the metric, the encoder, and the convergence algorithm. oavif aims to leverage or improve the state of the art in all three categories.

{{ inline_btn(url="https://github.com/gianni-rosato/oavif", text="Source Code") }}

I think this use case has been neglected because it sits in an awkward spot, stuck between encoder development and content deployment. Considering image encoders and powerful metrics are fast, it is easy to take them for granted and build inefficient frameworks around them. Slow frameworks waste valuable resources; processing images is expensive. I built oavif with the same approach I've adopted when building encoders, where every CPU cycle counts.

## Metric

There are good metrics and bad metrics in the context of what humans care about in images. [PSNR](https://codecs.wiki/docs/metrics/PSNR) is a bad metric; targeting a PSNR score doesn't mean anything to users, because images at the same PSNR could look completely different. However, PSNR is very fast, and faster metrics lend themselves more favorably to target quality encoding.

[SSIMULACRA2](https://github.com/cloudinary/ssimulacra2) correlates highly with subjective human quality ratings, but it is comparatively slow compared to simpler metrics. I set out to remedy this with [fssimu2](https://github.com/gianni-rosato/fssimu2), a faster implementation that uses almost 40% less memory. This is what oavif uses, and it makes computing the in-loop metric much faster compared to the reference library.

Testing on a [4k test image](https://files.catbox.moe/ott1x0.png) against a [distorted sample](https://files.catbox.moe/xpab87.jpg) for an average time to score across 8 runs, Butteraugli (a perceptual metric from the [libjxl](https://github.com/libjxl/libjxl) project) took 2455ms, while the reference SSIMULACRA2 implementation took 1162ms. fssimu2 takes 631.9ms. Testing was done on my M2 MacBook Air using [`hyperfine`](https://github.com/sharkdp/hyperfine).

![fssimu2 performance graph](/static/img/fssimu2.svg)

## Encoder

AVIF is a capable Web image format. oavif uses [libaom](https://aomedia.googlesource.com/aom/) (via [libavif](https://github.com/AOMediaCodec/libavif)) because it is the best open-source image encoder available relative to its speed. I worked on [improving AVIF encoding](https://halide.cx/blog/improving-avif-in-open-source/) in 2024 during my work on [SVT-AV1-PSY](http://svt-av1-psy.com). Google (with help from [Julio Barba](http://juliobbv.com)) later adopted this work and advanced it further in libaom. It is now used by some websites you may know, such as *[The Guardian](http://theguardian.com)*.

Aside from speed, [encoder consistency](https://halide.cx/blog/consistency/) is valuable in the context of target quality encoding (I'll explain more about why later). In fact, a perfectly consistent encoder would be able to eliminate the need for targeting entirely since the encoder's user-configurable Q would map perfectly to some perceptual index. libaom has had engineering effort go into encoder consistency, which is a valuable thing.

## Convergence

A simple convergence loop looks like this:
- Decode input, pass to encoder
- Decode encoder output & compare to input with metric
- If we hit the target metric score, finish; otherwise, repeat prev. step with modified settings

The most important part here is how we decide to modify our settings. This is the convergence algorithm that allows us to search for the best encoder Q. The easiest way to do this is with [binary search](https://en.wikipedia.org/wiki/Binary_search), and some more recent implementations have utilized [clever interpolation](https://github.com/rust-av/Av1an/pull/1014) using past data to inform the next guess based on the fact that we know encoder Q and target score are likely correlated.

oavif takes inspiration from both of these, adding predictive modeling alongside error-informed search space correction to improve search times significantly. To understand why, we'll walk through each stage of the implementation.

### Binary Search

This testing was done using the [Daala subset2](https://github.com/WyohKnott/image-formats-comparison/tree/gh-pages/comparisonfiles/subset2/Original) image dataset. Importantly, I only used this dataset for validation; oavif was not designed around this specific dataset in any way. When testing, the oavif configuration was left at defaults; only the convergence implementation was modified. The threshold for meeting the target score is ±2.0 in oavif by default, and the default target score is 80.0 as measured by fssimu2 because it is a reasonable "high fidelity" target.

Everyone with some algorithms background will start with binary search. Set your bounds for encoder Q to 0..100, and divide the range in half each time you test. In oavif, a pure binary search implementation at default settings yields the following results:

```
Average encoding time: 467.95 ms ± 94.64
Average passes: 3.20 ± 0.45 (max: 4 min: 2)
```

### Interpolation

Interpolation-based target quality searches by iteratively probing, measuring, and narrowing the search interval just like binary search. The difference is that it tries to model the score-vs-quantizer curve with interpolation (linear, quadratic, etc) as more data is accumulated. This should theoretically reduce the number of necessary encodes, and can start with standard binary search when there is not enough data to interpolate with.

Metric score vs encoder Q is generally (though not perfectly) a mostly monotonic curve. Interpolation-based inverse estimation uses the measured points to approximate that curve and solve for the quantizer that would produce the target score. Higher-order methods use more shape information and are thus theoretically more accurate. Adding linear and quadratic interpolation support to oavif, we see a small reduction in the average number of passes on subset2:

```
Average encoding time: 468.98 ms ± 97.28
Average passes: 3.12 ± 0.39 (max: 4 min: 2)
```

This is a 2.5% improvement. We still need a minimum of two passes to accurately target.

### Predictive Modeling

This feature uses an exponential curve trained on the [gb82 image dataset](https://github.com/gianni-rosato/gb82-image-set) with libaom (at speed 9, 10-bit, 4:4:4 chroma). The curve looks like this:

![libaom predicted Q from SSIMULACRA2 curve](/static/img/libaom-pred.svg)

Based on this, we can write some very simple code to predict a Q value from the target score:

```zig
fn predictQFromScore(tgt: f64) u32 {
    const q = 6.83 * @exp(0.0282 * tgt);
    return @intFromFloat(@min(100.0, @round(q)));
}
```

This yields the biggest average improvement in this testing so far, decreasing average pass count by 56.4% versus interpolation search and 57.5% versus binary search.

```
Average encoding time: 218.33 ms ± 114.16
Average passes: 1.36 ± 0.78 (max: 3 min: 1)
```

The gb82 image set is fairly low-resolution mixed photographic content, while Daala subset2 is medium-resolution photographic content with less variation. The fact that the model generalizes so well is exciting.

It is at this stage that encoder consistency becomes important. A more consistent encoder will diverge from our model's predictions less frequently, and theoretically result in a faster target quality loop.

### Error Bounds

Because our initial predictions tend to be so accurate, we can use them to aggressively narrow our search space without incurring too much risk of a search space collapse.

The basis of this is that utilizing plain binary search with prediction is often unreliable. Let's say we would like to target score=80, and our model predicts we need Q=65. We score 82.38. Now we are forced to search (0..65), which is worse than if we had just avoided prediction in the first place (our search space would be 50..100 in that case). This is in spite of the fact that our prediction was very close to the target.

oavif uses the distance from the target to its advantage:

```zig
const abs_err = @abs(e.t.score - o.score_tgt);
if (pass == 0) {
    const err_bound: u32 = @intFromFloat(@ceil(abs_err) * 4.0);
    if (e.t.score - o.score_tgt > 0) {
        hi_bound = e.q;
        lo_bound = if (e.q > err_bound) e.q - err_bound else 0;
    } else {
        lo_bound = e.q;
        hi_bound = @min(100, e.q + err_bound);
    }
}
```

In this case, the error was 2.38; `@ceil()` brings this to 3, and we multiply by 4 because the midpoint of the new range tends to be very close to the target value based on my testing. The performance improves in kind:

```
Average encoding time: 194.50 ms ± 69.89
Average passes: 1.18 ± 0.39 (max: 2 min: 1)
```

This costs 13.2% fewer passes than interpolation + prediction, and 63.1% fewer passes than binary search.

![oavif Convergence Passes](/static/img/oavif-passes.svg)

The minimum number of passes necessary in a naive binary search or interpolation-informed search is now the maximum number of passes we need to converge on the target on Daala subset2. You'll also notice the standard deviation went down due to the fact that the ceiling has been lowered.

## Architecture

We've made it work and we've made it good, so now we can make it fast. oavif is written in Zig, and uses available high-performance C decoder libraries for handling inputs and decoding AVIF in the convergence loop. All image I/O during convergence is done in memory, and a buffer is kept of our latest encode to write to a file if we meet the target in the search space.

Efforts have gone into making oavif comparable to libavif's `avifenc` in terms of features as well. It supports high bit depth I/O, ICC profile handling for most formats, user-configurable encoder settings, and better defaults (until tune=iq becomes the libaom default in libavif).

## Future Directions

Architecturally, it would be trivial to keep a history of buffers active and always pick from the history, even if our loop doesn't converge on the target. I opted to avoid this for now because it dramatically increases memory usage, but if I receive widespread feedback that memory is unimportant I'll consider an implementation. In its current state, we hit the in-loop buffer the vast majority of the time anyway.

I think the future of this kind of workflow is far more accurate predictive modeling. I believe it is possible to improve what I've done if we provide details about the source image as another term in the equation (like variance or entropy) and train our prediction mechanism on this additional data. I'm optimistically convinced this could result in a very high success rate for one-shot targeting.

I'm looking forward to seeing more target quality workflows taking advantage of smarter targeting. If you've made it this far, thanks for reading, and enjoy oavif!
