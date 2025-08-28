+++
title = "XYB JPEG"
author = "Gianni Rosato"
date = 2023-07-16
+++

A brand new JPEG implementation from Google – called jpegli – supports the use
of a perceptual colorspace to improve compression efficiency. How does it fare
against other codecs, like WebP and AVIF?

<!-- more -->

# XYB JPEG

This is going to be a shorter post because I have done this kind of visual
quality evaluation three times now, so if you're not sure what you're reading,
please look at my
[Image Codec Comparison](https://giannirosato.com/blog/post/image-comparison/)
post from March & my
[Mini Image Codec Comparison](https://giannirosato.com/blog/post/jpegli/) from
just last month. This may be the last one of these kinds of posts for a while
unless something interesting can be wrung out of another SSIMULACRA2 plot. Maybe
with comparing speeds next time?

The reason I'm making this post is that I just discovered that the `ssimulacra2`
binary that comes with libjxl can properly decode & benchmark XYB JPEG encoded
with `cjpegli` & I wanted to test it for myself. The source images & results are
published here, but first I think it is worth explaining in greater detail what
the XYB color space is.

## Perceptual Color

A perceptual color space is a color space designed to work around certain
assumptions about the human visual system. One of these assumptions is
trichromacy, which implies we can perceptually understand three independent
color channels; the response from each channel can be attenuated or bolstered by
the stimulus it receives, which allows us to see a myriad of different colors
due to different wavelengths of light in the visual spectrum interacting at
different intensities. We assume trichromacy in humans due to the presence of
three types of cones in our eyes: one that receives green light, another that
receives red, & a final cone that can perceive blue light. These are the three
additive primaries in our trichromatic visual system. Our cones & their
respective responses are illustrated in the graph below.

![cones_response](/static/images/cones_response.svg) _Wikimedia Commons. CC BY
3.0_

If you were to place two coordinates in a perfect perceptual color space, the
distance between the coordinates should map perfectly to our perception of their
color difference. The problem is color perception is non-Euclidian, & this is an
impossible problem to completely solve. W. David Wright & John Guild were up to
the challenge, however, & built the CIE XYZ colorspace to map more perfectly to
our human visual system than prior attempts. Instead of a red, green, & blue
channel, XYZ specifies a luminance channel Y (like the commonly used YCbCr) &
chromaticity channels Z ("quasi-equal" to blue) & X (another chromaticity
coefficient based on psychovisual testing by Wright & Guild; "a mix of the three
CIE RGB curves chosen to be nonnegative"). If you want to try to visualize it,
here's an example of our visual gamut under D65 illumination visualized within
the XYZ color space:

[xyz\_visual](https://upload.wikimedia.org/wikipedia/commons/transcoded/3/34/Visible_gamut_within_CIEXYZ_color_space_D65_whitepoint_mesh.webm/Visible_gamut_within_CIEXYZ_color_space_D65_whitepoint_mesh.webm.480p.vp9.webm)
_Wikimedia Commons. CC BY-SA 4.0_

### XYB Color

Now, that's the _XYZ_ color space. [XYB](https://youtu.be/rvhf6feXw7w) is an
LMS-based color space. LMS stands for long, medium, and short, representing the
response our cones have to different visible spectra, & is newer than XYZ. The
same general principle of modeling colors based on our cone response still
applies to both, though, & I think talking about XYZ is the best way to explain
perceptual color on a basic level. The labels on the cones\_response SVG above
show our L, M, & S cones. A 3x3 matrix operation can be applied to LMS to
produce XYB, & you will find that XYB justifies allocating fewer bits to the S
channel (blue) due to the
[lower density of blue cones in our eyes](https://en.wikipedia.org/wiki/LMS_color_space#Image_processing).
This allows perceptual quantization of color values that map better to our
visual system, spending bits where we can see them instead of where they aren't
salient to us. JPEG XL already uses XYB internally.

If you're interested in how jpegli works, see my
[Mini Image Codec Comparison](https://giannirosato.com/blog/post/jpegli/).

## Methodology

Here are the encoders I used for this test:

- **cjpegli** from the libjxl repos, in 4:4:4 RGB, 4:4:4 XYB, 4:2:2 XYB, & 4:2:0
  XYB modes
- **mozjpeg** `mozjpeg version 4.1.3 (build 20230612)`
- **cwebp** `cwebp 1.3.1 | libsharpyuv: 0.2.1`
- **cjxl** `cjxl v0.9.0 2a6f1f2c [AVX2]`
- **avifenc** via aom-av1-lavish, latest git (Endless\_Merging branch)

And here are their parameters:

- `cjpegli input -q [quality] N/A/--xyb --chroma_subsampling=[444/422/420] output.jpg`
- `cjpeg -q [quality] input > [output.jpg]`
- `cwebp -m 6 -q [quality] input -o output.webp`
- `cjxl input output.jxl -q [quality] -e 6 -p`
- `avifenc -c aom -s 8 -j 12 -d 10 -y 444 --min 1 --max 63 -a end-usage=q -a cq-level=[quality] -a tune=ssim [input] [output.avif]`

I'm also using the standard `ssimulacra2` binary instead of `ssimulacra2_rs`
because it seems to be much faster & can decode both JPEG & JXL natively.

### Faster AVIF & JXL encoding

Last blog post, Jon Sneyers suggested I use more realistic encoding speeds for
`cjxl` & `avifenc` as opposed to slower, more thorough speeds to test what
people might realistically end up using outside hobbyist work where codec nerds
are eager to wait an excruciatingly long time for encoding to finish. Besides, I
already have plenty of material published regarding high-effort `cjxl` &
`avifenc`, so let's see what they can both do with a little speed this time
around.

One thing to note is that I'm using 12 threads to encode AVIF despite having a
24-thread system. It seems that allowing avifenc to use all available threads
harms encoding performance a bit on my machine, as was the case in my previous
blog post. At speed 8, 12 threads seemed to outperform 8, so I decided to
specify `-j 12` to give AVIF encoding its best shot for speed.

I decided on JXL effort 6 & AVIF speed 8 based on the following speed test
results on my laptop with a different image not present in this corpus. While
AVIF is still slower, they both seem to line up well enough here. `avifenc` is
better for overall user time & much better for system time in this
configuration, but `cjxl` wins when it comes down to how much real time it takes
to perform the benchmark which correlates to how fast it actually is between
hitting the figurative "start" & "stop" buttons. Because this is likely due to
`cjxl` utilizing system resources better, I won't fault it for using more user &
system time versus avifenc.

![avifenc_v_jxl_speed](/static/images/avifenc_cjxl_speed.svg)

Log scale:

![avifenc_v_jxl_speed](/static/images/avifenc_cjxl_speed_log.svg)

Here are some speed benchmarks for each, using the parameters I specified
earlier. Parameter modifications are disclosed. Benchmarked with `hyperfine`,
tested on the first image in the corpus (test1.png).

`hyperfine --warmup 5 --runs 20 "command"`

`zsh inxi -v CPU: 16-core (8-mt/8-st) 13th Gen Intel Core i7-13700K (-MST AMCP-) speed/min/max: 1512/800/5400 MHz Kernel: 6.4.3-zen1-1-zen x86_64 Up: 5h 5m Mem: 6.95/31.12 GiB (22.3%) Storage: 6.83 TiB (2.6% used) Procs: 523 Shell: Zsh inxi: 3.3.28`

**avifenc** speed 8 j12 _182.4 kB_

`% hyperfine --warmup 5 --runs 20 "avifenc -c aom -s 8 -j 12 -d 10 -y 444 --min 1 --max 63 -a end-usage=q -a cq-level=21 -a tune=ssim test1.png out.avif"`
Benchmark 1: avifenc -c aom -s 8 -j 12 -d 10 -y 444 --min 1 --max 63 -a
end-usage=q -a cq-level=21 -a tune=ssim test1.png out.avif

> Time (mean ± σ): 249.9 ms ± 6.2 ms \[User: 397.2 ms, System: 19.5 ms\] Range
> (min … max): 243.4 ms … 271.7 ms 20 runs

**cjxl** e6 _180.9 kB_

`% hyperfine --warmup 5 --runs 20 "cjxl test1.png out.jxl -d 1.0 -e 6 -p -v"`
Benchmark 1: cjxl test1.png out.jxl -d 1.0 -e 6 -p -v

> Time (mean ± σ): 192.1 ms ± 2.3 ms \[User: 641.1 ms, System: 666.6 ms\] Range
> (min … max): 188.7 ms … 199.7 ms 20 runs

**cwebp** m6 _177.2 kB_

`% hyperfine --warmup 5 --runs 20 "cwebp -m 6 -q 90 test1.png -o out.webp"`
Benchmark 1: cwebp -m 6 -q 90 test1.png -o out.webp

> Time (mean ± σ): 342.9 ms ± 1.0 ms \[User: 337.4 ms, System: 4.5 ms\] Range
> (min … max): 341.0 ms … 344.9 ms 20 runs

cjpeg (**mozjpeg**) _184.1 kB_

`% hyperfine --warmup 5 --runs 20 "cjpeg -q 80 test1.png > out.jpeg"` Benchmark
1: cjpeg -q 80 test1.png > out.jpeg

> Time (mean ± σ): 196.7 ms ± 1.2 ms \[User: 191.2 ms, System: 5.1 ms\] Range
> (min … max): 195.3 ms … 199.7 ms 20 runs

cjpegli **4:4:4 rgb** _184.8 kB_

`% hyperfine --warmup 5 --runs 20 "cjpegli test1.png -d 1.4 --chroma_subsampling=444 out_444.jpeg"`
Benchmark 1: cjpegli test1.png -d 1.4 --chroma\_subsampling=444 out\_444.jpeg

> Time (mean ± σ): 139.8 ms ± 0.8 ms \[User: 132.0 ms, System: 7.5 ms\] Range
> (min … max): 138.3 ms … 141.5 ms 20 runs

cjpegli **4:4:4 xyb** _179.5 kB_

`% hyperfine --warmup 5 --runs 20 "cjpegli test1.png --xyb -d 1.4 --chroma_subsampling=444 out_444-xyb.jpeg"`
Benchmark 1: cjpegli test1.png --xyb -d 1.4 --chroma\_subsampling=444
out\_444-xyb.jpeg

> Time (mean ± σ): 156.7 ms ± 0.8 ms \[User: 148.7 ms, System: 7.6 ms\] Range
> (min … max): 155.4 ms … 158.3 ms 20 runs

cjpegli **4:2:2 xyb** _178.9 kB_

`% hyperfine --warmup 5 --runs 20 "cjpegli test1.png --xyb -d 0.9 --chroma_subsampling=422 out_422-xyb.jpeg"`
Benchmark 1: cjpegli test1.png --xyb -d 0.9 --chroma\_subsampling=422
out\_422-xyb.jpeg

> Time (mean ± σ): 149.8 ms ± 0.8 ms \[User: 141.9 ms, System: 7.5 ms\] Range
> (min … max): 148.4 ms … 151.8 ms 20 runs

cjpegli **4:2:0 xyb** _186.4 kB_

`% hyperfine --warmup 5 --runs 20 "cjpegli test1.png --xyb -d 0.5 --chroma_subsampling=420 out_420-xyb.jpeg"`
Benchmark 1: cjpegli test1.png --xyb -d 0.5 --chroma\_subsampling=420
out\_420-xyb.jpeg

> Time (mean ± σ): 147.8 ms ± 0.7 ms \[User: 139.8 ms, System: 7.6 ms\] Range
> (min … max): 146.5 ms … 149.0 ms 20 runs

![speedtest_all](/static/images/enc_speeds_faster.svg)

## Photographic Images

Here are some lossy previews of the four images that were tested. _These will
load properly on a browser supporting JXL, and on other browsers will fall back
to XYB JPEG._

![XYB Test 1 Image](/static/images/test1-xyb.jpg)
![XYB Test 2 Image](/static/images/test2-xyb.jpg)
![XYB Test 3 Image](/static/images/test3-xyb.jpg)
![XYB Test 4 Image](/static/images/test4-xyb.jpg)

Here are the test results for each image!

![test1_results_xyb](/static/images/xyb-test1.svg)

This was an incredibly shocking first showing for XYB JPEG, outperforming other
JPEGs, WebP, & even AVIF at the critical high-fidelity range. There's some
weirdness going on with mixing chroma subsampling & XYB color for some reason,
with an incredibly low quality ceiling that is hit very quickly. For 4:4:4, this
is impressive to see XYB JPEG come second only to JXL.

![test2_results_xyb](/static/images/xyb-test2.svg)

Here, once again, XYB JPEG impresses by surpassing AVIF entirely at medium &
higher fidelity while putting the other JPEG encoders to shame. I am floored by
how well this performs, although JXL remains a better option overall.

![test3_results_xyb](/static/images/xyb-test3.svg)

This is more what I'd expect out of AVIF, as it seems to be suffering in these
other tests due to the faster preset we're using. I'm still impressed with XYB
JPEG's ability to surpass WebP at 75+ SSIMU2.

![test4_results_xyb](/static/images/xyb-test4.svg)

Pretty similar to before, XYB JPEG handily beats WebP while still being
outperformed by AVIF. I'm still wowed by the fact that the _ancient_ JPEG is
still even reasonably competitive with AVIF, but seeing how much better JXL does
throughout these tests, it is clear the modern formats still have hope.

## Extrapolations

![avg_xyb_results](/static/images/xyb_results_avg.svg)

On average, seeing such a good showing from XYB JPEG has inspired me to start
using the format more often. Anywhere ICC profiles are supported along with
JPEG, XYB JPEG will be supported. I'm interested to see how it'd perform on a
bigger dataset against higher effort JXL & AVIF, but for now, I'm satisfied with
its performance enough to argue for its adoption.

The one snag is ICC color management support, although I've yet to run into a
modern browser that doesn't pass
[these tests](https://cameratico.com/tools/web-browser-color-management-test/).
You can try it for yourself if you like, I'm not sure which browsers _don't_
support ICCv2 color management, but those would not deal with XYB JPEG properly.

Inspiration & Sources:

[en.wikipedia.org/wiki/CIE\_1931\_color\_space#Definition\_of\_the\_CIE\_XYZ\_color\_space](https://en.wikipedia.org/wiki/CIE_1931_color_space#Definition_of_the_CIE_XYZ_color_space)

[raphlinus.github.io/color/2021/01/18/oklab-critique.html](https://raphlinus.github.io/color/2021/01/18/oklab-critique.html)

[https://en.wikipedia.org/wiki/LMS\_color\_space#Image\_processing](https://en.wikipedia.org/wiki/LMS_color_space#Image_processing)

[observablehq.com/@mattdesl/perceptually-smooth-multi-color-linear-gradients](https://observablehq.com/@mattdesl/perceptually-smooth-multi-color-linear-gradients)

Thanks for reading!

### Sponsor Me on GitHub Sponsors

Help support my open source efforts - a little goes a long way!

[Sponsor](https://github.com/sponsors/gianni-rosato?o=esc)
