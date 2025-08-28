+++
title = "Browser Benchmarks"
author = "Gianni Rosato"
date = 2023-02-28
+++

Let's compare browser performance across a variety of architectures, operating
systems, and browsers. Which browser is the most performant?

<!-- more -->

## Why?

The web browser [Thorium](https://thorium.rocks/) claims to improve upon
Chromium's (and by extension, Chrome's) browser performance significantly. I
think Thorium's a really neat browser, & I commend their continued support for
the fantastic JPEG XL codec when most seem to have abandoned it. This isn't to
disprove or undermine their browser benchmark results in any way, I simply
wanted to do my own testing & report back my results as a means of letting
myself know how my different browsers perform. I am a Firefox user right now,
but that's always subject to change, although right now I'm not particularly
partial to Chromium-based browsers.

## Methodology

I currently use the Firefox Flatpak on my desktop & laptop, Firefox on my iPad
(being WebKit based, I didn't feel it was useful to test it), & I just recently
switched from Bromite to Firefox Nightly on my Pixel 7 for its JPEG XL support &
timely updates (where Bromite hasn't been updated since Chromium 108). For this
test, I benchmarked:

- Chromium 110.0.5481.177 on my 13700k/6600xt
- Thorium 109.0.5414.120 on my 13700k/6600xt
- Firefox 110 (Build ID 20230214051806) on my 13700k/6600xt
- Safari on my iPad Mini 6 (iOS 16.3)
- Chromium 109.0.5414.117 on my Pixel 7 (CalyxOS)
- Firefox Nightly 112.0a1 (Build ID 20230226214053) on my Pixel 7 (CalyxOS)

And, here are my system specs:

`➜ ~ inxi -v CPU: 16-core (8-mt/8-st) 13th Gen Intel Core i7-13700K (-MST AMCP-) speed/min/max: 1041/800/5400 MHz Kernel: 6.1.12-zen1-1-zen x86_64 Up: 4d 17h 40m Mem: 8923.9/31871.1 MiB (28.0%) Storage: 6.83 TiB (19.2% used) Procs: 557 Shell: Zsh inxi: 3.3.25`
Although I was on the previous kernel release when these tests were completed, a
version of kernel 6.1. I don't think that matters too much here, but I thought
it may be important to note. I didn't enable any flags for any of the browsers
except one to enable JXL support on Firefox Nightly, so all were kept almost
completely stock. Anyhow, let's get into the results:

### Speedometer 2.1

Here are my Speedometer 2.1 results:

![speedometer_2.1_results](/static/images/browser_benchmark_05.svg)

Via [browserbench.org](https://browserbench.org): _"Speedometer is a browser
benchmark that measures the responsiveness of Web applications. It uses demo web
applications to simulate user actions such as adding to-do items."_

Here we see Thorium pull ahead quite a bit, & it's a consistent theme that
Thorium takes the lead when it comes to JavaScript stuff. My iPad follows in a
closer second than anticipated considering its running a mobile chip, followed
by my desktop's other browsers & finally the Pixel. It is important to note that
the WebKit team produces this benchmark along with MotionMark & JetStream.

### MotionMark 1.2

Here are my MotionMark 1.2 results:

![motionmark_1.2_results](/static/images/browser_benchmark_03.svg)

Via [browserbench.org](https://browserbench.org): _"MotionMark is a graphics
benchmark that measures a browser’s capability to animate complex scenes at a
target frame rate.
[More details](https://browserbench.org/MotionMark1.2/about.html) about the
benchmark are available. Bigger scores are better. For accurate results, please
take your browser window full screen, or rotate your device to landscape
orientation."_

This is where we see Firefox take the lead for once on my desktop, but it is
negated by my iPad, which somehow obliterates my desktop-class Radeon GPU. I'm
not entirely sure how to interpret these results, but I guess Firefox's
WebRender really uses the GPU well & Safari does even better.

### JetStream 2

Here are my JetStream 2 results:

![jetstream_2_results](/static/images/browser_benchmark_02.svg)

Via [browserbench.org](https://browserbench.org): _"JetStream 2.1 is a
JavaScript and WebAssembly benchmark suite focused on the most advanced web
applications. It rewards browsers that start up quickly, execute code quickly,
and run smoothly. For more information, read the
[in-depth analysis](https://browserbench.org/JetStream/in-depth.html). Bigger
scores are better."_

Once again, the iPad has a fantastic showing. The Pixel surprisingly gained a
lot of ground here on Chromium, & Thorium continues to show steady & consistent
gains over Chromium.

### BaseMark Web 3.0

Here are my BaseMark Web 3.0 results:

![basemark_web_3.0_results](/static/images/browser_benchmark_01.svg)

Via [basemark.com](https://www.basemark.com/benchmarks/basemark-web/):
_"Basemark Web 3.0 is a comprehensive web browser performance benchmark that
tests how well your mobile or desktop system can use web based applications.
This benchmark includes various system and graphic tests that use the web
recommendations and features. After running the benchmark you will see how your
system performed compared to other systems and browsers in
[Basemark Power Board](https://powerboard.basemark.com/). Basemark Web 3.0
measures real-world client-side performance to detect browser bottlenecks."_

This basically shows the same results as before, with Firefox falling further
behind that I'd expect. I don't think that in everyday use it _feels_ much
slower, and actually I think the "feeling" of speed is more pronounced going
from Chromium to Thorium versus Firefox to Chromium. The iPad once again kills
it, which is also not consistent with my "feeling" when it comes to browsing the
web on that device. The Pixel's results are relatively in line with how I've
tangibly experienced the device's web performance.

### WebXPRT 4

Here are my WebXPRT 4 results:

![webxprt_4_results](/static/images/browser_benchmark_06.svg)

Via
[principledtechnologies.com](https://www.principledtechnologies.com/benchmarkxprt/webxprt/):
_"WebXPRT 4 is a browser benchmark that compares the performance of almost any
web-enabled device. It contains HTML5, JavaScript, and WebAssembly-based
scenarios created to mirror the tasks you do every day: Photo Enhancement,
Organize Album Using AI, Stock Option Pricing, Encrypt Notes and OCR Scan using
WASM, Sales Graphs, and Online Homework. Use WebXPRT to see exactly how well
different devices handle real-world tasks."_

My interpretation of WebXPRT is that it is a more applicable (albeit more
complex) indicator of web performance, and doesn't necessarily mean anything
relative to the "snappy" feeling you get when loading simple web pages. I'm
surprised to see Firefox pull ahead here, even if it's just by a tiny bit, while
the iPad's results _finally_ feel more realistic to me. The Pixel's results are
basically the same as always, although Firefox Nightly actually ekes out a win
here.

### Mozilla Kraken

Here are my Mozilla Kraken results (important that I be thorough in saying lower
is better here):

![mozilla_kraken_results](/static/images/browser_benchmark_04.svg)

Via [wiki.mozilla.org](https://wiki.mozilla.org/Kraken): _"Kraken is a
JavaScript performance benchmark
[created by Mozilla](https://blog.mozilla.org/en/mozilla/release-the-kraken-2/)
that measures the speed of several different test cases extracted from
real-world applications and libraries."_

Ultimately, this feels very similar to Speedometer & I honestly kind of doubt
Firefox's win is very noteworthy here. The iPad continues to perform really
well, & the Pixel's Firefox & Chromium results feel closer to one another. Maybe
Mozilla is optimizing JS performance to score well on this benchmark, as it is
their benchmark, after all.

## Conclusion

Here's the geometric mean of all the test results:

![geometric_mean](/static/images/geometric_mean.svg)

I calculated the geometric mean using the reciprocal of each Kraken benchmark
result because for that test lower was better, and apparently the geometric mean
is sensitive to values close to zero, so keep that in mind. If there's a better
way to do this (like normalizing the values with min-max or median
normalization) let me know.

Here's the geometric mean of all the test results besides MotionMark:

![geometric_mean_no_motion_mark](/static/images/geometric_mean_2.svg)

Just because I really doubt the iPad is _that_ performant. I'm open to being
corrected, though.

Here's the number of first place finishes each browser recieved:

![first_place_finishes](/static/images/first_place_finishes.svg)

I will leave you, the audience, to come to your own conclusions here. Overall, I
really like Thorium. Let me know if you'd like another one of these with certain
special flags, different benchmarks, browser compatibility, or different
versions of the same browser. This took me around 3 days to put together. Thanks
for reading!
