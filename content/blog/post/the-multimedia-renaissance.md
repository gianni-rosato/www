+++
title = "The Multimedia Renaissance"
author = "Gianni Rosato"
date = 2025-08-18
+++

The best open source video and image compression algorithms have improved
significantly over the past year, and developer tools have miraculously kept up
with this rapid pace. There has never been a better time for video.

<!-- more -->

{{ hero(src="/static/img/leaves.avif", width="1536", height="864", alt="Green
Leaves") }}

## Purpose

When you work on anything, I think it is worth thinking about why you are
working on it aside from whether or not it provides some instant gratification.
Thinking about what the core purpose of video and image compression might be, it
is easy to land on a simple conclusion: smaller images and (especially) videos
make the internet cheaper. Video makes up the vast majority of internet
bandwidth, so small gains add up. However, this prompts further questioning;
what might the end game be for compression? For the average person, what is the
deliverable derived from compression technology indistinguishable from magic?

I believe this final goal is beautiful multimedia accessible anywhere. In other
words, an artist's vision is not served half-baked to any sub-section of their
audience. Compression doesn't just make the internet cheaper, it also makes it
more beautiful.

## Timeline

The most revolutionary compression technology has been able to unlock new
experiences for people creating and experiencing art. If you look at the history
of video, this is illustrated by certain major leaps made over time. Every
breakthrough represents a widening of the pipeline between artist and audience.
Let's look at the timeline.

1. Video begins as something you experience at a theater; people travel to see
   certain videos at specific times, and then maybe never again. Video doesn't
   look that great, and for a while, it doesn't have sound or color.
2. Analog broadcast television lets people see certain videos at specific times
   anywhere that has the right equipment. At some point, video gets color.
3. VCRs enable time-shifted viewing; you can see certain videos at almost any
   time.
4. Digital optical discs improve upon the last step by providing better looking
   videos.
5. The world of digital internet video emerges through peer-to-peer downloads.
   Now you can see pretty much any video anywhere after waiting for a download.
   Regardless of your internet connection, a smaller file means a faster
   download.
6. Streaming platforms make on-demand web video real; now you can watch pretty
   much any video anywhere with a good internet connection almost instantly.
7. Smartphones proliferate; smarter compression and streaming technology means
   we can do what we did in the last step on most internet connections, allowing
   people to access virtually any video almost anywhere on Earth.
8. Today, beautiful video is no longer exclusive to Blu-ray; high-end streaming
   services provide access to high-fidelity video anywhere with decent internet.
   Additionally, live video platforms let anyone show lots of people a window
   into their life from almost anywhere.

Through the combined efforts of better internet and better compression, we could
see more breakthroughs in the future. Emerging immersive formats (360° video,
VR/AR) and cloud gaming are opportunities for more innovation, and could unlock
compelling art with enough accessibility.

For now, it is worth acknowledging that we've come a really long way.

## Present Day

The past two years have been incredibly consequential for video. I would argue
this is the strongest the ecosystem has been in over a decade from a
technological standpoint. The best open-source video encoder in the world is
beginning to show signs of maturity, web-first image compression had its first
major breakthrough since JPEG, and life has become a lot easier for developers.
Let's walk through each of these stories.

## Video

SVT-AV1 is the best open-source video encoder in the world, according to a lot
of metrics. Despite this, it is still not the most mature (that title goes to
x264). For SVT-AV1 to fully supersede x264, it needs to always be better; it
cannot just be mostly better. Metrics say we are already here, but subjective
testing tells a different story.

One year ago (August 2024), the predominant narrative around AV1 was that it was
"blurry". Time and energy were invested in swaying this perception, but it
ultimately still held. To address this, I had started the SVT-AV1-PSY project
earlier that year with the stated goal of building and testing research-grade
features for subjective quality based on user feedback.

In August 2025, this perception has mostly been shattered. A number of the
aforementioned research-grade features have been upgraded to production-grade,
with more progress happening every day. Additionally, the number of features has
ballooned; SVT-AV1-PSY saw a number of additional releases, and as the project
was put to rest, a few new forks emerged to perpetuate the effort.

Utilities for using video encoders have improved dramatically as well; the
popular chunked encoding script called Av1an saw a development resurgence to
reinvigorate some older features, and other tools with similar functionality
arrived on the scene to provide more options to users.

The implications of these dramatic improvements are numbered. As an enthusiast,
it is no longer as easy to avoid producing good-looking AV1 video. SVT-AV1 is
arguably more mature than x265, and x264 is the final available contender.
Considering it takes the better part of a decade to develop a robust video
encoder, the fact that so much is in motion right now is exciting news.

## Images

In August 2024, the image compression story was looking unfortunate compared to
video. WebP failed to deliver exceptional compression improvements over modern
JPEG encoders, and AVIF was looking promising but underwhelming. It suffered
from the same "blurriness" as AV1, but it was far more severe in a world where
modern image encoders tend to be well-optimized for human perception. The best
standard by far was JPEG XL, which had been removed from Chrome, effectively
killing any chance of ubiquitous use of the format on the web.

While all of this held true, in August Julio Barba and I were working on
image-focused enhancements for SVT-AV1-PSY. We announced our results publicly,
and while they were promising, the implementation was limited to our
community-supported video encoder.

In 2025, Julio has worked diligently with Google to bring our work to libaom,
the reference implementation of AV1. Due to its more complete feature set, it
already has a number of image-specific performance considerations, so it was a
perfect fit. The new improvements are wrapped into Tune IQ in libaom, and
websites like The Guardian are already benefiting from its vastly improved
consistency and compression gains. Before Tune IQ, AVIF would occasionally lose
to JPEG; this is no longer true.

## Developers

In August 2024, everyone's favorite metric is SSIMULACRA2. It is incredibly
accurate to human visual perception, and helped guide certain decisions made
during SVT-AV1-PSY development. It had a couple of issues, though.

- The reference implementation in C doesn't support videos
- The Rust implementation ssimulacra2_rs is not fast
- The Zig implementation is decently fast, but still not as fast as VMAF, SSIM
  or PSNR

Enter Vship, an SSIMULACRA2 and Butteraugli implementation that uses the GPU.
Better developer tools enable new development paradigms, and Vship's 10–100x
speed improvement opened the doors for encoder testing frameworks like PSY-EX
`metrics` that allow for streamlined encoder benchmarking automation. My blog
post on comparing video encoders would have been a lot longer and more complex
in 2024, but now testing an encoder's convex hull is as simple as running a
single Bash script to call PSY-EX metrics tooling powered by Vship.

## What's Next

I have a lot of hope that AV2 will rally intense community efforts in open
source like AV1 did. There is a lot of performance left on the table with a
standard as complex as AV2, and I hope in the next decade it will be properly
realized.

For now, I think we should celebrate what has happened so far.

AV1 currently features:

- An innovative open-source decoder (dav1d) that has outperformed everyone's
  initial expectations for AV1
- A performant, competitive reference encoder that is still seeing developments
  right now, for both images and videos
- A competitive, performant open-source production encoder that has driven
  dedicated psychovisual feature implementations
- An independent encoder in Rust
- Some proprietary solutions that offer extra value (features, performance,
  quality, etc) to select clients
- Vibrant online compression communities that are drawn to the field out of pure
  passion

In the past year, we've seen:

- Major advances in maturity in the world's best open-source video encoder
- The first image compression implementation available on any browser that
  meaningfully surpasses JPEG
- Faster, easier-to-use developer tools than ever before

I'm excited for what the next year of development has to offer.
