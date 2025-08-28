+++
title = "Image Codec Comparison"
author = "Gianni Rosato"
date = 2023-03-16
+++

The current debate surrounding AVIF versus JPEG XL needs some third-party
quantitative data to support arguments on either side. I've compiled a dataset
of 27 high-resolution photographic images to compare performance across them all
at a wide fidelity range.

<!-- more -->

## Why?

To start things off, I have been a fan of the AVIF image format since I heard
about it, not long after I started learning about the AV1 video codec in 2020. I
figured the fact that it was backed by the Alliance for Open Media, was the
natural successor to WebP, and was based on a rather powerful video codec that
was rapidly growing in popularity was great for users & organizations alike to
easily understand what the technology stood for, where it came from, and what
benefits it provided over the existing lossy image king, JPEG. Good codecs are
open source codecs, so the fact that AVIF was open source was a big deal to me
as well. It is also already [widely supported](https://caniuse.com/avif) at the
time of writing. I thought unequivocally that AVIF would be the future of images
on the web when I first learned about it. I don't think I was entirely wrong,
but I hadn't yet heard of JPEG XL.

[JPEG XL](https://jpegxl.info/) (JXL for short) is an image codec by the JPEG
committee (yes, _the_ JPEG committee). Initially I hadn't thought much of the
codec because the compression efficiency was "the same as AVIF," so I kind of
wrote it off, as I'm sure many uninformed people have & continue to do. Upon
doing more research, my position flipped and I found myself deeply invested in
the future of JXL.

JXL's fascinating features include the highly efficient variable-blocksize
discrete cosine transform (which is superior to JPEG's DCT), usage of the XYB
colorspace which more accurately represents the response our cones in our
eyeballs have to different wavelengths of light, & a "modular" mode for
efficient lossless or near-lossless coding. It is also used while encoding lossy
JPEG XL images, but I don't know much about it & I won't pretend to. Currently
the reference encoder also supports patch detection, noise synthesis, and will
(probably) eventually support spline detection as it is present in the codec
specification. JPEG XL also supports _lossless JPEG transcoding_ that _reduces
the filesize of JPEGs_ which in my opinion is a game-changing feature. That
alone could be a revolutionary codec by itself. Progressive decode is also a
standout feature of JPEG XL, and I found
[this article](https://opensource.googleblog.com/2021/09/using-saliency-in-progressive-jpeg-xl-images.html)
very interesting regarding that.

Some more interesting JXL articles & resources:

[www.roboleary.net/webdev/2023/03/06/next-web-image-format-not-jpegxl.html](https://www.roboleary.net/webdev/2023/03/06/next-web-image-format-not-jpegxl.html)

[tonisagrista.com/blog/2023/jpegxl-vs-avif](https://tonisagrista.com/blog/2023/jpegxl-vs-avif/)

[cloudfour.com/thinks/on-container-queries-responsive-images-and-jpeg-xl](https://cloudfour.com/thinks/on-container-queries-responsive-images-and-jpeg-xl/)

[motionmill.com/2023/02/google-stopt-jpex-xl-gebruiken](https://motionmill.com/2023/02/google-stopt-jpex-xl-gebruiken/)

[ds.jpeg.org/whitepapers/jpeg-xl-whitepaper.pdf](https://ds.jpeg.org/whitepapers/jpeg-xl-whitepaper.pdf)

[cloudinary.com/blog/the-case-for-jpeg-xl](https://cloudinary.com/blog/the-case-for-jpeg-xl)

Also worth noting is the format's most outspoken pioneer
[Jon Sneyers](http://sneyers.info/) (co-author of the JPEG XL spec) as well as
other noteworthy developers are extremely active within the community and value
the feedback of the people who are passionate about their work. This should not
be as unique as it is, but it is incredibly valuable to have one's voice heard
so easily & frequently by developers who _actually care_. I commend Sneyers &
the other core JXL devs for this.

Anyway, TL;DR: JXL has a lot more to offer than just good compression. But, I
still wish to know; how does it stack up against other image formats regarding
lossy compression & lossless compression?

## Methodology (Photographic Corpus)

In order to produce an unbiased test to determine how good JPEG XL is relative
to _my_ needs, I took 27 photos (mostly consisting of landscape/architecture
photography) around my seaside hometown using my Sony a5000 at 20.1mp, edited
them in [Darktable](https://www.darktable.org/), exported them as 16-bit sRGB
PNGs (AdobeRGB had
[some](https://github.com/ImageMagick/ImageMagick/issues/6157)
[problems](https://github.com/libjxl/libjxl/issues/2289)), & finally I ran a
script written by my friend RootAtCali (check out their
[cool site](https://autocompressor.net/)) to determine each image format's
SSIMULACRA2 scores for each quality level available via the format's lossy
coding option.

I'll be certain to make my lossless sources available via an edit to this post,
& they'll be linked at the top. In the meantime, here's
[another page](https://giannirosato.com/blog/post/corpus-lossy/) with full
resolution lossy JXL photos encoded at `-d 1.0`. The images are under CC-BY-SA
4.0.

These tests were run using the
[SSIMULACRA2](https://github.com/cloudinary/ssimulacra2) visual quality metric
via [ssimulacra2\_rs](https://github.com/rust-av/ssimulacra2). This metric is
designed to model human vision far better than VMAF, SSIM, PSNR, & other less
effective alternatives. Via the readme on Github:

> Returns a score in range -inf..100, which correlates to subjective visual
> quality scores as follows:
>
> - 30 = low quality. This corresponds to the p10 worst output of mozjpeg
>   -quality 30.
> - 50 = medium quality. This corresponds to the average output of cjxl -q 40 or
>   mozjpeg -quality 40, or the p10 output of cjxl -q 50 or mozjpeg -quality 60.
> - 70 = high quality. This corresponds to the average output of cjxl -q 65 or
>   mozjpeg -quality 70, p10 output of cjxl -q 75 or mozjpeg -quality 80.
> - 90 = very high quality. Likely impossible to distinguish from the original
>   when viewed at 1:1 from a normal viewing distance. This corresponds to the
>   average output of mozjpeg -quality 95 or the p10 output of cjxl -q 95.

Because of the irrelevance of negative SSIMULACRA2 scores, I stopped the
vertical axis on the graph(s) at 0.

For context, here's an overview of the image formats tested:

- **JPEG**, the reigning champ. has been used for decades. Supports progressive
  decode
- **WebP**, based on VP8, an open-source video codec.
- **JPEG XL**, the designated successor to JPEG. Designed by the JPEG committee.
- **AVIF**, based on AV1, a modern open-source video codec.

Here's a [helpful chart](https://jpegxl.info/comparison.png) provided by
Cloudinary.

Notably absent are JPEG 2000 (J2K) & HEIC. Considering JXL is J2K's successor &
J2K never saw widespread adoption, I'm not sure including it helps anybody. HEIC
is being excluded because it sucks, & also is notably not royalty free.

Here are the encoders tested for each format:

- **JPEG** via the mozjpeg encoder
- **JPEG** via the mozjpeg encoder, tuned for MS-SSIM, using the 'Tuned for
  MS-SSIM on Kodak image set' quantization table & arithmetic coding
- **JPEG** via the elusive & mysterious jpegli encoder (more on this later)
- **WebP** via cwebp
- **JPEG XL** via the libjxl reference encoder implementation, cjxl
- **AVIF** via aom-av1-lavish, tuned for SSIM

Here's the encoder parameters I used, along with the encoder version (in the
same order as above)

`cjpeg -q [quality] "input" > "output.jpg"` | mozjpeg version 4.1.1
(build 20230217)

`cjpeg -q [quality] -quant-table 2 -tune-ms-ssim -arithmetic "input" > "output.jpg"`
| mozjpeg version 4.1.1 (build 20230217)

`benchmark_xl --input=[input] --codec=jpeg:enc-jpegli:rgb:q[quality] --save_compressed --output_dir=[outdir]`
| cjxl v0.9.0 c4927fbf

`cwebp -m 6 -q [quality] "input" -o [output.webp]` | 1.3.0 libsharpyuv: 0.2.0

`cjxl "input" "output.jxl" -q [quality] -e 7 --brotli_effort 11` | cjxl v0.9.0
c4927fbf

`avifenc -c aom -s 6 -j 16 -d 10 -y 444 --min 1 --max 63 -a end-usage=q -a cq-level=[quality] -a tune=ssim "input" "output.avif"`
| AOMedia Project AV1 Encoder Psy v3.6.0 (default)

WebP is at maximum effort & the JPEG encoders were left stock in terms of
effort. cjxl is on effort 7 (the internal default, so I didn't really need to
specify it, & `brotli_effort` is only for lossless iirc), & we encode avif at
speed 6 because it correlates best with JXL's default speed (& is also rav1e's
default speed internally although we're not using rav1e).
[Aviator](https://beta.flathub.org/apps/net.natesales.Aviator), based on
SVT-AV1, consciously defaults to speed 6 for AV1 video encoding, as does
rav1e-based [rAV1ator](https://giannirosato.com/blog/post/aviator-1/).

Benchmarking with this image dataset gave us a total of just below 18,000 data
points before averaging. For the graph, I calculated the arithmetic mean of the
bpp & SSIMULACRA2 score for each quality step for each encoder.

Here are the results:

![photographic_corpus_results](/static/images/photographic_corpus_results.svg)

Now, hold your breath, conclusions come at the end!

## Methodology (Non-photographic)

This is a shorter test with less going on, but still interesting & worth
bringing up. I'm using [this](/static/images/the_apps.png) image to test
non-photographic encoding using the same parameters as above. Here are the
results:

![nonphotographic_results](/static/images/nonphotographic_results.svg)

While this is only one image, I have universally seen AVIF take a rather large
lead with every non-photographic image I've tested.

## Lossless? Animation?

Stay tuned! While both AVIF & JXL (as well as WebP) support animation, I'd like
to cover that in a different post. I'd like to learn more about how AVIF & JXL
work relative to lossless image coding as well before I tackle a test like that.

## Conclusion

### Where does JPEG XL win?

It is clear to me that JPEG XL is going to be my choice for exporting my amateur
photographs. It performs exceptionally well at higher quality, outperforming
AVIF & the others by a significant margin. AVIF is stronger as quality
decreases, but AVIF is further weakened by the fact that encoding using more
threads generally hurts efficiency & encoding an AVIF image is generally slower
than encoding a JXL image. As for the other plethora of features JXL has to
offer, AVIF can barely compete. AVIF is also hampered by its lower maximum image
dimensions compared to competing codecs.

### Where does AVIF win?

AVIF wins at low to medium (maybe low-medium) quality. This is great for content
devilery on the web, as images don't always need to be high fidelity or retain a
ton of high-frequency detail to maintain their appeal; something that looks
pleasing and resembles the source can be more desirable. Despite the fact that
AVIF lacks progressive decode, its superior coding efficiency at lower quality
somewhat makes up for this in my opinion. AVIF is also the winner for our
non-photographic image, and if you trust that image isn't an edge case, it opens
up some cool opportunities for sharing digital art as JXL doesn't have an
encoder available with spline detection to compete right now. Being based on the
AV1 video codec, AVIF is allegedly easier to implement as well; the codec's
widespread adoption sees it already achieving a degree of success on the Web.

### How about the others?

WebP isn't very good in my opinion, plumetting at higher quality & being soundly
defeated by AVIF at lower quality. JPEG clearly _still_ has potential even years
later, and MS-SSIM tuning seems to do the encoder some favors with the
photographic dataset. The jpegli encoder borrows some of JXL's fancy coding
techniques to improve JPEG quality even further, especially at higher quality. I
didn't even test jpegli with the superior XYB colorspace (as this proved hard to
do), which to my eyes nets jpegli an even better quality improvement over
standard jpeg encoders. There's a cool
[Twitter thread](https://nitter.kitsuna.net/jyzg/status/1622900057816145922)
about this. According to
[Jyrki Alakuijala](https://research.google/people/105344/), "jpegli supports
more than 8 bits per channel (around 10.5 bits) and can codify HDR dynamics
(HLG/PQ/XYB/etc.) in the old '8-bit' format." This seems extremely promising.

### Takeaway

I want a web where both AVIF & JPEG XL can exist, and developers decide which
format to use for its merits. Google's Chromium team has rejected JXL support
for Chrome, and Mozilla remains "neutral," on JXL, keeping a flag in Firefox
Nightly to enable partial support. The Chromium team shouldn't have the absolute
authority to shoot down would-be standards like this, as it seems they are the
sole decision-maker in this space & all others must follow their lead. In my
opinion, JPEG XL & AVIF have _fundamentally different strengths_ which lend them
to different use cases. Considering JXL has been endorsed by Facebook, Adobe,
Intel and the Video Electronics Standards Association, The Guardian, Flickr and
SmugMug, Shopify, the Krita Foundation, Serif Ltd, Gaia Sky, and many more, the
market is most certainly interested. My current optimistic hope is that JXL
takes off outside the web among professionals working with tools like the Adobe
suite or alternatives, and camera manufacturers, smartphone OEMS, and others
take notice & begin to think about JXL more seriously. The benefits cannot be
ignored, and it is (in my opinion) the only image format that is in every way
superior to JPEG & offers a concrete future for the many existing JPEGs on the
Web & beyond.

While this is a non-scientific test, please share this post if you'd like to see
JPEG XL get more attention for its merits. AVIF is already widely supported, I
don't need to fight for it; JPEG XL still has a war to be won, and I'd like
anyone who wants better images & a better Web to be on JXL's side as well as
AVIF's, and to understand that JPEG XL needs our assistance as users to gain
widespread adoption. Here's what I'd recommend doing right now:

Using Chrome or another Chromium-based browser? Consider switching to
[Thorium](https://thorium.rocks/). It is available for nearly every platform,
including Windows, Linux, macOS, and Android, and has complete JXL support. It
will sync with your Google account just like Chrome will. It is also
[faster](https://giannirosato.com/blog/post/browser-benchmarks/).

Using Firefox? Not a bad choice. If your workflow permits, switching to Firefox
Nightly for casual browsing & enabling the JXL flag for partial JXL support by
searching 'jxl' in `about:config` is not a bad option. I'm attached to Firefox
myself, & using the flag on my phone works great for most things that don't
employ an alpha channel or HDR.

If you'd like to take a look at some beautiful JXL images, you can head
[here](https://people.csail.mit.edu/ericchan/hdr/hdr-jxl.php). You can test your
browser's JXL support [here](https://jpegxl.info/test-page/). Remember, the Web
may be the last platform without a proprietor, and we need to keep it that way.

### Sponsor Me on GitHub Sponsors

Help support my open source efforts - a little goes a long way!

[Sponsor](https://github.com/sponsors/gianni-rosato?o=esc)
