+++
title = "Comparing Video Encoders"
author = "Gianni Rosato"
date = 2025-03-15
+++

Comparing video encoders involves using synthetic metrics to assess visual
quality, helping generate data that can be visualized. Plotting encoder
performance in different ways helps determine the best encoder for specific
implementation needs.

<!-- more -->

{{ hero(src="/static/img/skygb.avif", width="1536", height="864", alt="Sky") }}

## Why?

Comparing video encoders isn't hard; in fact, it is usually quite easy. However,
it is very often done incorrectly.

That's a bit of an oversimplification. Comparing video encoders extremely well
_is_ rather difficult, and it is the focus of a lot of impactful research that
aims to produce metrics that can properly assess how good a video looks to our
eyes. The human eye is very complex, and guiding compression algorithms to care
about the human visual system can get very interesting (I wrote a bit about
[perceptual color encoding in JPEG](https://giannirosato.com/blog/post/jpegli-xyb/)
with the XYB colorspace used in JPEG XL, it can be very cool stuff).

This article is more about what we can do now with the tools that we have,
regardless of the metric we're interested in. Many people, including the SVT-AV1
team, make use of [PSNR](https://wiki.x266.mov/docs/metrics/PSNR),
[SSIM](https://wiki.x266.mov/docs/metrics/SSIM), and
[VMAF](https://wiki.x266.mov/docs/metrics/VMAF), but today we're going to be
(mainly) focusing on [XPSNR](https://wiki.x266.mov/docs/metrics/XPSNR), a
perceptual metric by Fraunhofer HHI that is readily available in FFmpeg 7.1.

Now that we have established the problem space, we can talk about:

- The tools we have available to compute metrics in a useful way
- How we can use them to compare video encoders

## Tools

A helpful toolbox of various scripts is provided by the `metrics` utility by the
[Psychovisual Experts Group](https://github.com/psy-ex). You can find the code
via [this GitHub link](https://github.com/psy-ex/metrics).

This tool lets us compute some image-focused metrics that we will use for video,
and Weighted XPSNR, a video metric based on XPSNR that includes chroma
information (officially, XPSNR is recommended to be luma-only).

## Comparisons

There are three "tiers" of comparisons, each involving a bit more data than the
last:

- Comparing a single video to another single video
- Comparing a series of encoders in terms of compression efficiency
- Comparing a series of encoders in terms of overall efficiency

We'll start with simple two-video comparisons.

## Comparing Two Videos

XPSNR is what we call a _full-reference distortion metric_, which means we
compare a distorted video to its source to get a score. Since we're encoding a
source video with a video encoder, we can compare the source and the encode with
`scores.py`:

`./scores.py [source] [encode]`

You can also use `encode.py` to encode the video for you. Either one will give
us various statistics for the metrics we have available to us. Given we used the
GPU for computation of SSIMULACRA2/Butteraugli (more on that in a second),
you'll get something like this output:

```
SSIMULACRA2 scores for every 1 frame:
Average:       75.22395
Std Deviation: 3.19206
10th Pctile:   70.52215
Butteraugli scores for every 1 frame:
Distance:      0.80522
Max Distance:  0.97927
XPSNR scores:
XPSNR Y:       34.80490
XPSNR U:       38.48910
XPSNR V:       37.42110
W-XPSNR:       35.61793
```

You'll notice that this is a lot more than just a single data point. We're just
supposed to compare two videos and get a number for how the encode looks, right?
Ideally, yes, but with the imperfect tools we have, we must do the best we can.

[SSIMULACRA2](https://wiki.x266.mov/docs/metrics/SSIMULACRA2)

- The average, or the arithmetic mean, is simple; now we know how our frames
  look, on average, according to an image metric.
- The harmonic mean could pull our average down toward the lower scores present
  in our per-frame score dataset that we're interpreting. This is theoretically
  a bit more informative than the average, as our eyes are going to be more
  sensitive to variability in the video's fidelity, so we make consistency
  desirable by favoring the lower-scoring frames. Note that we haven't reported
  the harmonic mean with SSIMULACRA2 here, as SSIMULACRA2 is capable of
  producing negative scores which are incompatible with the harmonic mean.
- The standard deviation tells us more about the video's consistency.
- The 10th percentile lets us know how our least desirable frames are scoring.

So, lots of ways to try to make an image fidelity metric useful for video.

[Butteraugli](https://github.com/google/butteraugli)

The way we use Butteraugli in `metrics`, we use 3pnorm, which weighs and
averages certain parts of the frame, leaning toward more noticeable differences.
So for our use case:

- The "Distance" is the average of per-frame 3pnorm scores
- The "Max Distance" is the maximum 3pnorm score we saw in a frame

And finally, Weighted XPSNR, or W-XPSNR. This is kind of simple:

- Y XPSNR is "real" XPSNR, luma-only
- U & V XPSNR are for chroma
- W-XPSNR extrapolates mean square error from each of the three scores and
  computes a weighted average favoring luma, then computes back to the dB units
  that PSNR-derived metrics (and others) use for reporting fidelity.

So, Weighted XPSNR is just a weighted average for luma and chroma scores that
aims to fairly favor luma since that is what our eyes care most about.

## Comparing Compression Efficiency

Now we have scores for one video. But, what size is it? How does it compare to
another video from another encoder that's a slightly different size with
slightly different scores? You can interpret this subjectively, like saying your
1.74MB video at XPSNR 34.03 from Encoder A _feels_ like a better option than a
1.81MB video that scores 34.21 from Encoder B, but how can we know for sure?

The best way we can do this is by looking at a curve that plots size-to-score
for a series of clips, which is meant to allow us to see which encoder (or
configuration) achieves the best compression efficiency.

Here's a plot comparing various SVT-AV1 speed settings:

![SVT-AV1 Speed Plot](/static/images/compression_efficiency.svg)

You can see that despite the fact that Preset 4 & Preset 2 produce smaller files
at each CRF level, they are not the most efficient presets, because Preset 0
displays the best compression efficiency according to the curve. Each one of
these curves came from an invocation of `stats.py` that provided us with the
data we wanted.

Here's an example of how to use `stats.py`:

```
./stats.py \
-i source.mkv \
-q "20 21 24 26 30" \
-o ./stats.csv \
-g 4 \
svtav1 -- --preset 8 --tune 2
```

This encodes `source.mkv` at 5 CRF values, then outputs the results to
`stats.csv` which include metrics and encode time. We use 4 GPU threads, and we
pass a couple of options to SVT-AV1.

We picked our 5 CRF values by choosing our bounds and the number of values we
want, according to a formula (in Python):

`min_q + (max_q - min_q) * ((step / (q_steps - 1)) ** 1.5) for step in range(q_steps)`

Rounding our results to integers (necessary with current SVT-AV1) gave us 5 CRF
values between 20 and 30, according to my input. We use this formula to focus
more of our data points on higher fidelity encodes, where the difference in
filesize may be larger for smaller differences in fidelity. This is more helpful
when working with much higher fidelity than we care about here, but it is a good
thing to remember, because we want a curve with less data points to look more
like one with a greater number of data points.

Now, we can compare encoders by generating multiple curves. We have the data,
and we can use `plot.py` with our data inputs for a simple plot.

For a hobbyist use case, this may be a fine place to stop. If it encodes in
reasonable time, and it is closer to the upper left on the curve, it may satisfy
you to use the more compression efficient encoder. But, what about at production
scale, where you care more about time?

## Comparing Overall Efficiency

Before moving on, consider what we need for this graph:

- A value representing the metric difference between two curves
- A value representing the time difference between the encoder/configuration
  used for each curve
- A graph that compares these two for various steps on a curve, which we can use
  to compare other curves for other encoders

That final encoder curve describes an encoder's overall efficiency according to
a given metric. Now, let's explore how to gather each value.

**BD-Rate** (Bjontegaard Delta Rate) is a way to compare the efficiency of two
curves. It answers the question: "For the same quality level, how much more or
less data does method B need compared to method A?"

If you stopped at the end of the previous section and ran `plot.py`, you'd
notice that it provides BD-Rate numbers for each stats file you provided it,
relative to the first stats file. So, if the BD-Rate is -20% between A & B, it
means the second method needs 20% less data to achieve the same quality as the
first method, which is a good improvement.

`plot.py` writes these BD-Rate values to a CSV, along with the average time
computed across the encodes in each stats file.

Now, your next `plot.py` invocation (for the next stats files belonging to the
next encoder) _needs_ to use the _previous_ worst stats file as the first
argument in order to compute BD-Rates relative to the encoder you're now
comparing against. You'll get another CSV output.

Here's an example result, comparing SVT-AV1 v3.0.0 to SVT-AV1-PSY v2.3.0-B:

![SVT-AV1 BD-Rate Plot](/static/images/encoder_efficiency.svg)

_BD-Rates computed relative to SVT-AV1-PSY v2.3.0-B's Preset 10, which is why
that data point has a BD-Rate of 0%._

You can see that SVT-AV1 v3.0.0 is able to produce smaller BD-Rates relative to
v2.3.0-B in less time, so it would be considered the more efficient encoder,
according to W-XPSNR. Again, even though Preset 10 in SVT-AV1 v3.0.0 has a worse
BD-Rate than Preset 10 in SVT-AV1-PSY v2.3.0-B, the time difference means that
along the curve SVT-AV1 v3.0.0 is more efficient overall.

## Conclusion

That's all for now. I hope you found this blog post helpful in understanding how
to compare encoders, because it is a crucial part of encoder development and can
help you make an informed decision about which encoder to use for your specific
needs. Happy encoding!

### Sponsor Me on GitHub Sponsors

Help support my open source efforts - a little goes a long way!

[Sponsor](https://github.com/sponsors/gianni-rosato?o=esc)
