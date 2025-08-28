+++
title = "Better JPEG Encoding From Google"
author = "Gianni Rosato"
date = 2023-06-14
+++

JPEG is old, but a new perceptually optimized encoder just became available from
Google called jpegli. Like the mozjpeg encoder aimed to outperform older JPEG
implementations, jpegli aims to push the format to its limits in terms of
compression efficiency.

<!-- more -->

## Why?

JPEG is a really neat codec. It has served us super well for a number of years.
JPEG's ingeniously simple design that divides an image into 8x8 pixel blocks,
separates chroma (color) from luma (luminance) into the YCbCr color space (you
can also use RGB), applies the DCT, quantizes the DCT coefficients, & passes the
data on to the decoder makes JPEG images very easy to read and write nowadays.
They look good, too; in fact, they are looking better and better as their
encoding implementations (somehow) continue to improve; MozJPEG improved quality
relative to libjpeg-turbo & older implementations, especially at low to medium
fidelity; jpegli promises to further improve over MozJPEG, potentially across
the board. JPEG also still has features that many modern codecs don't have that
are very useful, like support for progressive decode which allows parts of the
image to be sent as the image data is being transferred.
[Blurhashes](https://blurha.sh/) are very popular for their ability to send some
data before the entire image, and progressive decode enhances this even further.
WebP, HEIC, & AVIF don't support progressive decode\*, although JPEG XL does.
Outside of features, JPEG supposedly became competitive with WebP in coding
efficiency when MozJPEG released. This is contrary to the narrative that WebP is
[25%-34% smaller](https://developers.google.com/speed/webp/docs/webp_study) than
JPEG (which, if you read the article, isn't the conclusion here; Google
specifically says "We observed that the average WebP file size is 25%-34%
smaller compared to JPEG file size at equivalent SSIM index" which is important
because SSIM is a rather outdated metric at this point & largely isn't
indicative of perceptual quality. They also tested libjpeg, not mozjpeg). Could
jpegli be so efficient that it results in WebP being _entirely_ outcompeted by a
codec that's nearly _twenty years_ older?

## How Jpegli Works

Jpegli's gains are largely due to better adaptive quantization based on the
heuristics used by JPEG XL. Projects like
[Guetzli](https://github.com/google/guetzli) have achieved better JPEG
compression through similar means, but have been _really_ slow to work with. It
is outlined in the readme for Guetzli that it is not fast:

> Guetzli uses a significant amount of CPU time. You should count on using about
> 1 minute of CPU per 1 MPix of input image.

Another smart jpegli trick is usage of the XYB colorspace, which is perceptually
more in line with the human visual system compared to RGB. We haven't tested
that today because SSIMULACRA2.1 doesn't understand what it is looking at when
given XYB JPEGs (even properly transcoded to PNG, there's some sort of harmful
color shift), but JPEG XL uses the XYB color space by default for lossy image
coding and the results are clearly incredible for coding efficiency.

The way jpegli handles XYB color in a JPEG image is by applying an ICC color
profile that maps the existing JPEG color channels to XYB. This actually has the
potential to increase the bit depth of the image, which could allow 10 bit JPEGs
in the future. I'm excited to see XYB JPEG continue to improve via jpegli, but
for now we're just going going to use libjxl's included `cjpegli` binary to test
some photographic images.

## Methodology (Photographic)

Here are the encoders I used for this test:

- **cjpegli** from the libjxl repos, in 4:4:4, 4:2:2, & 4:2:0 chroma subsampling
  modes
- **mozjpeg** `mozjpeg version 4.1.1 (build 20230217)`
- **cwebp** `cwebp 1.3.0 | libsharpyuv: 0.2.0`
- **cjxl** via `cjxl v0.9.0 e2fe7bad [AVX2]`
- **avifenc** via aom-av1-lavish, latest git (Endless\_Merging branch)

And here are their parameters:

- `cjpegli input -q [quality] --chroma_subsampling=[444/422/420] output.jpg`
- `cjpeg -q [quality] input > [output.jpg]`
- `cwebp -m 6 -q [quality] input -o output.webp`
- `cjxl input output.jxl -q [quality] -e 8`
- `avifenc -c aom -s 4 -j 8 -d 10 -y 444 --min 1 --max 63 -a end-usage=q -a cq-level=[quality] -a tune=ssim [input] [output.avif]`

Here are some speed benchmarks for each, using the parameters above. Parameter
modifications are disclosed. Benchmarked with `hyperfine`, tested on the first
image in the corpus:

`hyperfine --warmup 2 --runs 20 "command"`

`inxi -v CPU: 16-core (8-mt/8-st) 13th Gen Intel Core i7-13700K (-MST AMCP-) speed/min/max: 1386/800/5400 MHz Kernel: 6.3.7-zen1-1-zen x86_64 Up: 29m Mem: 5633.8/31868.7 MiB (17.7%) Storage: 6.83 TiB (20.4% used) Procs: 520 Shell: Zsh inxi: 3.3.27`

- **cjpegli** -q 90, --chroma\_subsampling=444: _156.1 kB_

  > Time (mean ± σ): 80.1 ms ± 0.7 ms \[User: 75.7 ms, System: 4.2 ms\] Range
  > (min … max): 79.1 ms … 81.4 ms 20 runs

- **cjpegli** -q 90, --chroma\_subsampling=422: _145.4 kB_

  > Time (mean ± σ): 74.3 ms ± 0.7 ms \[User: 70.2 ms, System: 3.9 ms\] Range
  > (min … max): 73.2 ms … 76.0 ms 20 runs

- **cjpegli** -q 90, --chroma\_subsampling=420: _132.2 kB_

  > Time (mean ± σ): 70.6 ms ± 0.5 ms \[User: 66.3 ms, System: 4.1 ms\] Range
  > (min … max): 69.8 ms … 71.5 ms 20 runs

- **mozjpeg** -q 86: _154.8 kB_

  > Time (mean ± σ): 105.0 ms ± 0.9 ms \[User: 101.6 ms, System: 3.0 ms\] Range
  > (min … max): 103.5 ms … 107.6 ms 20 runs

- **cwebp** -q 90: _130.7 kB_

  > Time (mean ± σ): 194.4 ms ± 1.4 ms \[User: 190.5 ms, System: 3.6 ms\] Range
  > (min … max): 191.8 ms … 197.1 ms 20 runs

- **cjxl** -q 92: _134.0 kB_

  > Time (mean ± σ): 768.1 ms ± 7.0 ms \[User: 1068.8 ms, System: 398.4 ms\]
  > Range (min … max): 758.6 ms … 784.1 ms 20 runs

- **avifenc** cq-level=11: _155.5 kB_

  > Time (mean ± σ): 1.500 s ± 0.008 s \[User: 3.670 s, System: 0.016 s\] Range
  > (min … max): 1.493 s … 1.529 s 20 runs

- **avifenc** cq-level=11 -j all: _155.5 kB_

  > Time (mean ± σ): 1.571 s ± 0.132 s \[User: 3.778 s, System: 0.019 s\] Range
  > (min … max): 1.495 s … 1.975 s 20 runs

![test1_results](/static/images/jpegli_speeds.svg)

Using all available threads with avifenc would routinely produce slightly worse
results, and Hyperfine threw up an error every time suggesting some results were
appearing to be outliers. This is why I lowered the worker count to 8 for the
quality benchmark. I found this anomalous behavior interesting as it highlights
avifenc's trouble with scaling that stems from issues with the AVIF image
format. I would wager a guess that this scaling issue is because of AVIF's use
of certain intra-frame coding techniques like directional prediction that share
data between blocks, theoretically improving coding efficiency but reducing
parallelization & worsening generation loss. If I recall correctly, JPEG XL
specifically avoided intra coding techniques like these in order to parallelize
effectively (and improve resilience to generation loss).

## Photographic Images

Here are some lossy previews of the four images that were tested. _These will
load properly on a browser supporting JXL, and on other browsers will be
transcoded to PNG._

![test1](/static/images/jpegli_test1.jxl)

![test2](/static/images/jpegli_test2.jxl)

![test3](/static/images/jpegli_test3.jxl)

![test4](/static/images/jpegli_test4.jxl)

And, here are the test results for each image! It is worth disclosing that in my
analyses, I prefer to look at the 60-70+ range that I consider most useful.
Others may disagree, so please take my rankings for what they are: my opinions.

![test1_results](/static/images/jpegli_test1.svg)

The first image favors jpegli quite a bit here over mozjpeg. The medium-high
fidelity range from 60-80 is kind of a tie between all three chroma subsampling
modes & WebP, while mozjpeg lags behind. It is worth noting that WebP's overall
quality ceiling is lower here, with a max score of around 90.

My picks:

1. JXL
2. AVIF
3. jpegli 4:2:0
4. WebP
5. jpegli 4:4:4
6. jpegli 4:2:2
7. mozjpeg

![test2_results](/static/images/jpegli_test2.svg)

The simple lines and large sections of color in this image remind me of a
nonphotographic image, and therefore favor AVIF & WebP which are derived from
video codecs (AV1 & VP8 respectively). Although it looks like 4:4:4 jpegli does
well at scores >95, that medium-high fidelity range is dominated by mozjpeg.
WebP's quality ceiling is really low here, and it appears incapable of hitting a
score of 90 which is where SSIMULACRA2.1 starts to consider an image
perceptually lossless.

My picks:

1. AVIF
2. JXL
3. WebP
4. mozjpeg
5. jpegli 4:4:4
6. jpegli 4:2:0
7. jpegli 4:2:2

![test3_results](/static/images/jpegli_test3.svg)

This one looks like a toss-up the whole time between jpegli, mozjpeg, and webp,
with AVIF pulling ahead & JXL pulling even further ahead. Jpegli 4:4:4 is
consistent all the way across, while mozjpeg starts to drop off at higher
fidelity & WebP sadly hits its quality ceiling just before cresting the 90 mark
while still maintaining strong coding efficiency throughout the rest of the
quality scale where it is present.

My picks:

1. JXL
2. AVIF
3. jpegli 4:4:4
4. WebP
5. mozjpeg
6. jpegli 4:2:0
7. jpegli 4:2:2

![test4_results](/static/images/jpegli_test4.svg)

This is the closest of all. I am once again disappointed that WebP is
outperformed by jpegli 4:4:4 at around 83+ & can't seem to score higher than a
90, while jpegli 4:4:4 & mozjpeg cruise up to around 95. That extra headroom is
important for photography & lots of use cases outside of web delivery, which is
why it is important to me that a codec is able to perform throughout the quality
spectrum without bumping its head too early. Here we see AVIF & JXL behaving
similarly to my
[Image Codec Comparison](https://giannirosato.com/blog/post/image-comparison/)
blog post, with strong low fidelity performance from AVIF & better high fidelity
results coming out of JXL.

My picks:

1. JXL
2. AVIF
3. jpegli 4:4:4
4. WebP
5. mozjpeg
6. jpegli 4:2:0
7. jpegli 4:2:2

## Extrapolations

First, if you don't know what chroma subsampling is, I highly recommend you
check out [Master of Zen's explainer](https://master-of-zen.xyz/yuv-vs-rgb/). It
is a more detailed explanation, & it thoroughly covers the effects of chroma
subsampling.

It is worth noting that I didn't try _every_ mozjpeg tune here, and I have seen
the SSIM & MS-SSIM tunes work well compressing photographic images. I also
didn't test every chroma subsampling mode that mozjpeg has to offer, and allowed
mozjpeg to subsample chroma automatically - this automatic selection gives it a
theoretical advantage over each _individual_ jpegli chroma subsampling mode, but
wouldn't allow the encoder to display its breadth of competence like jpegli
here. In the end, I wouldn't call this a loss for mozjpeg anyhow - it is clearly
not obsolete in any case, and the only scenario in which it clearly lost was the
first image test. The overall average & three image average results make a
compelling case for mozjpeg overall.

![avg_results](/static/images/jpegli_avg.svg)

![someavg_results](/static/images/jpegli_someavg.svg)

While four images isn't anything significant to extrapolate any real conclusions
about these encoders, we can see some clear differences between the different
encoders. In particular, I think the notion that WebP is noticeably more
efficient than JPEG is almost entirely negated by modern JPEG encoders like
mozjpeg & now jpegli. WebP is especially weak outside of the Web, where higher
fidelity is more precious.

Stepping back from my personal preference for high fidelity, it is very
impressive how consistently well jpegli 4:2:0 is able to do when the target is
<50-60. This is usually WebP's territory (ignoring AVIF & JXL for a moment)
relative to JPEG, but 4:2:0 jpegli is closer than mozjpeg to WebP on every image
except the second one. 4:2:2 jpegli seems like it doesn't have much of a use at
all.

## Should I Use It?

I would say yes, given you:

- Cannot use AVIF or JXL.
- Can't use WebP, or if you can, it compresses worse.
- Prefer progressive decode & can't use JXL
- Have A/B tested against mozjpeg at the very least, & I'd recommend testing
  against other cjpegli chroma subsampling modes as well.
- Like the results more with your eyes, which are more important than metrics.

I use metrics because it'd be really difficult to articulate my visual
preferences here and extrapolate objective data based on them. On your own, try
to use your eyes as much as possible, and train yourself to look for artifacts &
recognize what they are; mosquito noise, ringing, blocking, and banding are all
terms you should be familiar with.

Now that
[Apple announced support for JXL](https://developer.apple.com/videos/play/wwdc2023/10122),
hopefully the industry tide on the Web will shift toward the new image codec &
we'll see such incredible market penetration that we don't need to use JPEG
anymore. For now, this isn't a reality, and JPEG's compatibility remains
unmatched; given the circumstances, I'd recommend that you of course use JXL
when possible. When you must use a JPEG, it wouldn't be unwise to leverage the
plethora of existing JPEG encoding tools to your advantage when you can. Thanks
for reading!

\*_AVIF kinda supports progressive decode if you ship an animated AVIF with a
single super lossy frame that loads before the actual image. There are other
tricks you can use as well, and more information about this is outlined in this
[Autocompressor blog post](https://autocompressor.net/blog/progressive-avif)._

### Sponsor Me on GitHub Sponsors

Help support my open source efforts - a little goes a long way!

[Sponsor](https://github.com/sponsors/gianni-rosato?o=esc)
