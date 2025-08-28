+++
title = "Aviator Versus Handbrake; Visual Quality Assessment"
author = "Gianni Rosato"
date = 2023-02-12
+++

In this test, we will compare the latest Aviator release to the latest Handbrake
release in terms of visual quality per bit.

<!-- more -->

_Note: [rAV1ator](https://giannirosato.com/blog/post/aviator-1/) isn't compared
in this test because it is based on different underlying technologies that would
be hard to compare directly to Aviator & Handbrake, especially for very short
clips._

# Overview

This blog post illustrates a comparison between Aviator 0.2.0 & Handbrake 1.6.1
using two sources that illustrate different use cases; the first being the 2160p
`crowd_run.y4m` source from
[Derf's Test Media](https://media.xiph.org/video/derf/) & the other being a
short clip of an animated sequence from a popular animated show.

## Conditions

This is a relevant comparison because both
[Aviator](https://beta.flathub.org/apps/net.natesales.Aviator) &
[Handbrake](https://beta.flathub.org/apps/fr.handbrake.ghb) use the SVT-AV1
encoder under the hood, and both can encode videos with 10 bit color (default
for Aviator) which should increase the visual quality of the output. Because of
the similarity of the two programs when outputting AV1 video, I was initially
under the impression that upon beginning the test I'd be incapable of discerning
a difference between the two based on how well they scored. I was mistaken.

Aviator settings: - Resolution: 3840x2160 for crowd\_run, 1920x1080 for
animation - CRF: 25-50 (10-60 for the expanded set) - Speed: 6 for crowd\_run, 4
for animation - Container: MKV

Handbrake settings: - Format: Matroska - Resolution Limit: None (defaults to
same as Aviator) - All Filters Off - Video Encoder: AV1 10-bit (SVT) -
Framerate: Same as Source - RF: 25-50 (10-60 for the expanded set) - Speed: 6
for crowd\_run, 4 for animation

## Notes

- While encoding, both used a similar amount of RAM under load but Handbrake
  used 10gb in the background even after the encode had completed for each trial
  with crowd\_run. This meant that I had to restart it every time I wanted to
  encode another iteration of the test.
- Handbrake failed to copy the subtitle track by default for the animated
  source, which can be a problem when encoding any kind of animation where the
  audio isn't in your native language.
- Handbrake's "Tune" dropdown explains in the tooltip that it can "improve
  efficiency for particular source characteristics" without specifying such
  characteristics, so this was left alone. Its dropdown had one option, which
  was to tune for PSNR. I know PSNR is not an accurate gauge of visual quality,
  but the average user may not because there is no tooltip explaining what this
  acronym means.
- The results for the animation tests were calculated using the overall bitrate
  of the file, not just the video portion; this means that for Aviator, the
  subtitle track was factored into that overall bitrate. This shouldn't have
  hurt the results very much, but offers a minute disadvantage to Aviator.
- Film grain synthesis was not used on the crowd\_run source, despite the
  presence of grain. While Aviator offers this functionality, Handbrake does
  not, and most visual quality metrics don't understand the benefits of grain
  synthesis anyway despite the improvement to visual quality offered by the
  feature for sources with grain present.

# Results

These tests were run using the
[SSIMULACRA2](https://github.com/cloudinary/ssimulacra2) visual quality metric
via [ssimulacra2\_rs](https://github.com/rust-av/ssimulacra2). This metric is
designed to model human vision far better than VMAF, SSIM, PSNR, & other less
effective alternatives.

First, the crowd\_run results from CRF 25 through 50.

![crowd_run](/static/images/aviator_handbrake_crowdrun.svg)

This is a clear and decisive victory for Aviator by a larger margin than I
initially thought possible between the two utilities, considering that they're
both using 10 bit SVT-AV1. Aviator's out-of-the box tuning for visual quality
has paid off.

It is important to note that these are incredibly high bitrates. The scene is
very complex, and the video being 2160p50 makes it require a lot of bits to
achieve a watchable level of visual quality.

SVT-AV1 defaluts to CRF 35 internally, while Aviator defaults to CRF 32 &
Handbrake defaults to RF 30. The results above were done in increments of 5 from
CRF/RF 25 through 50 (25, 30, 35, etc). In order to get the bigger picture, I
tested a wider quality range from 10 through 60 that dips into the realm of
impracticality a bit given the obscene bitrate approached by lower CRF/RF values
& the relatively low quality image produced with higher CRF.

Here's the expanded results, with CRF 10 through 60.

![crowd_run_expanded](/static/images/aviator_handbrake_expanded.svg)

Here, we see the two become relatively the same at lower & higher quality. While
Aviator has a tiny advantage at lower quality, Handbrake looks to take the lead
by an almost imperceptible margin at higher quality. For this source, because
the bitrate skyrockets beyond CRF/RF 25 & the quality plummets beyond CRF/RF 50,
I would consider this a win for Aviator in the range I'd consider usable that
encompasses the default quality levels for Aviator, Handbrake, & SVT-AV1's stock
behavior.

For the animation test, CRF 25 through 50 were tested.

![animation](/static/images/aviator_handbrake_animation.svg)

This sees less of a performance delta than the more lifelike crowd\_run source,
and also sees bitrates reach an acceptable level that would be more common to
see from an animated 1080p24 source. Aviator sees an advantage here still, with
the gap widening at slightly higher bitrates.

# Conclusion

It is clear that Aviator's prioritization of visual quality performance has paid
off, even with SSIMULACRA2 being a synthetic benchmark. It appears that
Handbrake is only worth using when dipping below CRF/RF 20, but when fine detail
preservation at very high bitrate is a priority it may be worth using another
codec (which Handbrake will offer you the option to use, seeing its diverse
selection of codecs besides AV1). Even then, the quality difference is minute &
may vary between sources. Aviator is the undisputed AV1 champ between the two,
and appears to win in situations where AV1 is most useful.

## Grain Synth

While it is hard to benchmark, it is worth mentioning that Aviator supports film
grain synthesis ("Grain Synth") while Handbrake does not. This can improve the
visual quality of any source with grain present by removing it & reapplying a
synthesized version at decode time. This allows the encoder to spend less bits
compressing grain (which is notoriously difficult to compress) and instead apply
it artificially with little to no discernible difference to the viewer. The
crowd\_run source (or any live action source that hasn't been heavily denoised)
has grain present, and while SSIMULACRA2 doesn't totally understand the benefits
of grain synthesis, it is clear to even the untrained eye the advantage it
offers.

## Sources

If you'd like the encoded clips I used to run this test, I will give them to you
for crowd\_run. Otherwise, feel free to replicate the crowd\_run segment for
yourself or the animation segment using another animated source of your
choosing. Thanks for reading!
