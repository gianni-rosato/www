+++
title = "Who Has the Best Hardware AV1 Encoder?"
author = "Gianni Rosato"
date = 2023-04-15
+++

This article compares Nvidia's NVENC encoder to Intel's QSV encoder for AV1, as
well as for other codecs. Who will win?

<!-- more -->

_Please be aware that this page contains JPEG XL images. In unsupported
browsers, images may not load properly._

## Why?

Nobody really knows which hardware accelerated AV1 encoder is better right now.

There are other resources available, but they don't use good metrics. Everyone's
favorite bad, obsolete, easily tricked metric is VMAF, which was good for a time
but simply isn't good anymore. You can check out
[this Twitter thread](https://nitter.poast.org/jonsneyers/status/1573371624132419585)
to see what I'm talking about; these aren't edge cases either. You can produce a
"better quality" video according to VMAF using Contrast Adaptive Sharpening
filters which inherently do not improve video fidelity in any way.

Other metrics are PSNR, SSIM, MS-SSIM, SSIMULACRA, Butteraugli, & SSIMULACRA2.
PSNR doesn't accurately represent our visual system as humans, SSIM was good for
its time but is now old and also provides inconsistent/misleading results, &
MS-SSIM does better but also doesn't correlate as well with our visual systems
as newer metrics. The distance-based Butteraugli metric isn't bad, but
SSIMULACRA2 is currently considered the gold standard for a visual quality
metric.

You can read more about why this metric is great
[here](https://github.com/cloudinary/ssimulacra2), but SSIMULACRA2 (ssimu2) is,
in my opinion, the only way to really measure subjective visual quality right
now. The scores it produces correlate best with my eyes, and many others agree.

Here's how SSIMULACRA2 assesses quality:

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

In my
[Image Codec Comparison](https://giannirosato.com/blog/post/image-comparison/)
benchmark, I said "Because of the irrelevance of negative SSIMULACRA2 scores, I
stopped the vertical axis on the graph(s) at 0." I still maintain this logic was
correct for the image benchmark, but with livestreams, it isn't unusual to see a
low bitrate stream due to a poor network connection on either a streamer's end
or your own. This test is also more about how the encoders perform at certain
target bitrates, as mentioned above, and since the goal isn't necessarily always
to target a certain quality like it is with images, I think some of the less
relevant data (eg target 500kb/s) is still important to include because of how
it frames the more useful data (eg the 2000-6000kb/s range popular with
streamers).

Anyway, I've seen testing from many using VMAF, and their conclusions are varied
relative to which hardware encoder is the best.
[These tests](https://rigaya.github.io/vq_results/) are more thorough than mine,
but aren't accompanied by much explanation or any VAAPI results for Linux. They
also use VMAF, so everything must be taken with a grain of salt. I still think
they're useful in judging the quality of many hardware encoders that I haven't
tested here (like AMD's stuff) so I'll still recommend you go take a look if
you're interested. So, what did we find in our own testing?

## Methodology (Gaming Corpus)

In order to understand who uses hardware encoders and where, look no further
than livestreaming. Livestreaming can be done via OBS, and you have a choice to
decide between CBR, VBR, & CQP encoding. Many choose to opt for CBR or VBR,
since your connection is most likely the bottleneck & you can target a certain
bitrate. I'd personally opt for VBR so that the encoder can intelligently
allocate more or less bits when necessary while still targeting a specific
bitrate on average. This also allows us to get better overall quality per bit,
so the viewer can see a higher quality stream while using less data on average.
It is more reliable for data usage & bandwidth than CQP which targets quality, &
more efficient than CBR which will give every scene the same amount of bits no
matter its content.

With help from a couple friends online (namely
[BlacKnight](https://github.com/Bl4cKn1gh7) &
[Maik](https://github.com/Maikurosofuto)), I tested hardware & software encoders
from target 500kb/s to target 8500kb/s in increments of 500. This gave us 16
data points per encoder per clip to work with. I used two clips from DERF's Test
Media - namely the CSGO clip & the Minecraft clip under "Gaming" - and
transcoded them to h264 with `crf 1` to provide the encoders with near
mathematically lossless video that they could effectively decode. The loss
introduced by reencoding at such high quality is miniscule & should have a
nearly undetectable effect on the benchmark results.

Here's a screenshot from the CSGO clip:

![csgo](/static/images/csgo.jxl)

& here's one from the Minecraft clip:

![minecraft](/static/images/minecraft.jxl)

All hardware encoders were on their highest effort preset
(-compression\_level 7) for optimal quality. It didn't have a massive effect on
speed in my testing.

The encoders tested for the CSGO clip were the following:

- h264 (UHD770 VAAPI)
- h264 (Arc A770 VAAPI)
- HEVC (UHD770 VAAPI)
- HEVC (Arc A770 VAAPI)
- HEVC (Arc A770 VAAPI, 10 bit)
- VP9 (UHD770 VAAPI)
- x264 (slower preset)
- SVT-AV1 (preset 6, 10 bit)
- SVT-AV1 (preset 8)
- SVT-AV1 (preset 8, 10 bit)
- Nvenc AV1 (RTX 4090)
- Nvenc AV1 (RTX 4090, 10 bit)
- QSV AV1 (Arc A770)
- QSV AV1 (Arc A770, 10 bit)

The encoders tested for the Minecraft clip were the following:

- x265 (medium preset, 10 bit)
- SVT-AV1 (preset 4, 10 bit)
- SVT-AV1 (preset 6, 10 bit)
- SVT-AV1 (preset 8, 10 bit)
- Nvenc AV1 (RTX 4090, 10 bit)
- QSV AV1 (Arc A770, 10 bit)

You may be wondering why there is such an emphasis on 10 bit encoding despite
the 8 bit source. In my testing, even just with my eyes, encoding to 10 bit
video with most lossy video codecs (HEVC & AV1 in particular) yields better
coding efficiency than encoding to 8 bit. I can't tell you exactly why, but I'm
sure others on the [AV1 Community Discord](https://discord.gg/Ecu428C) can.

You may also be wondering about the lack of AMD numbers. I have a Radeon Rx
6600xt & myself and others found it very difficult to properly test AMD's
hardware encoders. You can look at the results I linked above that report VMAF
numbers - the massive discrepancy in AMD's AV1 performance compared to other AV1
encoders should be enough to let you know how good AMD's results are.

## Results

Finally, we come to the graphs. It is also worth noting that the default GOP
size for the hardware encoders is around 300 frames; leaving it on "auto" in
FFmpeg generally yielded _slightly_ better results by a few fractions of a point
in ssimu2, so that is what we did.

### CSGO

Here is a graph for target bitrate (VBR) with the CSGO clip:

![csgo_results](/static/images/csgo_results.svg)

And a log scale version that we can use to see discrepancies better:

![csgo_results_log](/static/images/csgo_results_log.svg)

This is kind of a lot to unpack, as there are a considerable number of
overlapping lines here. I've attached a CSV file
[here](https://github.com/gianni-rosato/hwenc-ssimu2-plotter/blob/main/csgo_results.csv)
so that you can visualize this data on your own in any way you please, but I
think we can come to a couple interesting conclusions given this current
visualization. For this clip:

- There are clear, marked differences in coding efficiency depending on the
  encoder even if the codec is the same. So, just because your video is h264
  doesn't mean that is was encoded as efficiently as every other h264 video. You
  can see here that the Arc A770's h264 encoder yields better quality per bit
  than the h264 encoder that's part of the iGPU on my 13700k. The fixed function
  hardware Intel is deploying for these two implementations is distinct, and
  Arc's is clearly better. The software x264 encoder that runs directly on the
  CPU is certainly slower, but you can see how that pays off in spades.
- SVT-AV1 is in a class by itself. Preset 8 dominates the hardware encoders
  across the board by a not insignificant margin, & Preset 6 pulls ahead even
  further. While hardware encoders are very fast and a gem for streaming,
  software encoders still take home the efficiency crown.
- NVENC AV1 is more efficient than QSV AV1 on Arc, even if the advantage is
  slight. Even when comparing 8 bit NVENC to 10 bit QSV, NVENC still manages to
  pull ahead ever so slightly.

If you came here to rub salt in Arc users' wounds, I wouldn't say the advantage
is significant enough to warrant purchasing a 40-series card over an Arc card
_solely_ for encoding especially considering the price discrepancy. However, the
advantage is still there, and shouldn't be ignored. My takeaway is if you have
more money than you know what to do with, don't buy an Arc GPU for encoding if
you have a 40-series card from Nvidia already. Spend it on a nice bowl of ramen
instead (or a couple nice bowls of ramen, realistically).

### Minecraft

Let's see what else we can find looking at the Minecraft results:

![minecraft_results](/static/images/minecraft_results.svg)

Here's another log scale version:

![minecraft_results_log](/static/images/minecraft_results_log.svg)

This one is more stripped down, & everything is easier to see. Here are my
takeaways:

- Now that we have x265 in the mix, we can see NVENC beat it across the board &
  QSV came close. This is pretty impressive, as x265 medium isn't a fast setting
  by any stretch of the imagination.
- SVT-AV1 preset 4's performance leaves us with some clues about our final
  conclusion, seeing as software AV1 encoding (even with SVT-AV1, which doesn't
  produce as good quality per bit as AOM encoder forks like aom-av1-lavish)
  continues to pull ahead significantly the more time & effort we allow it to
  use. It may be possible to stream using SVT-AV1 preset 8 on higher end systems
  right now, but more likely you'd be using preset 9 or 10, which is where I
  think SVT-AV1 is probably on par with hardware encoders. As CPUs become more
  powerful, this will become easier, & it is clear that dedicated streaming
  hardware may continue to provide value for streamers who can afford it.

## Conclusion

### Who Won?

Nvidia's hardware acceleration for AV1 video encoding is superior in these two
clips. It is a tiny margin, and it is important to judge subjective visual
quality for yourself when evaluating tiny discrepancies like this, but
SSIMULACRA2 says that Nvidia has the better solution. I don't think that's the
most important takeaway here, though, considering our peek at the potential
software encoders have.

### Software vs hardware?

Software encoders are run on the CPU without any fixed function hardware
designed around any specific codec. Hardware accelerated video encoding takes
place on specialized ASICs that are attached to most consumer GPUs, & encoding
with hardware acceleration means the encoder can also make use of a GPU's highly
parallel compute to further accelerate certain video encoding functions.
Developing these ASICs is expensive, and dedicating valuable silicon real estate
on GPUs to such features must prove to be well worth a company's time and money.
Nvidia & Intel both seem to agree that AV1 has enough of a future to make it
financially sane to put fast dedicated hardware in the hands of every consumer
who has one of their latest GPUs, which is pretty cool.

The issue regarding efficiency is that this fixed function hardware is designed
to be fast above all else, & implementing less important codec features into
this hardware can inflate costs without helping efficiency meaningfully. In
software, while slower, encoders can pick and choose to enable/disable whatever
features they like based on user specified parameters or internal defaults for
each preset. This makes the use cases for both solutions very different.

### When should I use hardware encoders?

As I mentioned earlier, livestreaming is where hardware accelerated video
encoding is most popular. Nvidia has turned their NVENC hardware into a
differentiating feature because of the popularity of livestreaming, & as sites
like Twitch & YouTube roll out AV1 for the masses, livestreamers will appreciate
having a powerful hardware implementation for the more efficient codec to stream
with given their hardware readily supports it.

Hardware encoding can also be great for screen recording, capturing clips in
games, and trancoding media on the fly for a media server or something similar.
When speed is the priority over coding efficiency, hardware encoders are a
fantastic choice.

Here are some places where you _probably shouldn't_ use hardware encoders:

- Transcoding media you legally own for later consumption (unless you are
  burdened by a time limit or it is too painful to encode at less than real
  time)
- Re-encoding home video that needs to take up less space somewhere or needs to
  be shared easily
- Producing a final copy of a video project of some sort to be shared with
  others
- Illegally releasing pirated media that has been transcoded to achieve a
  smaller filesize for viewer convenience (I cannot recommend this regardless)

You should never transcode something that has already been transcoded unless you
have to - it is best to search for the source. If you have a BluRay collection
that you transcoded to h264 ten years ago, don't go re-encoding it to AV1 now -
find the source & do it over, else you risk preserving artifacts from the
original encode. And do it with a software encoder. If you're exporting a video
for a project or something similar, it may be worth encoding to a lossless or
near lossless file & reencoding as efficiently as possible later when you can
afford the time so you can optimize for quality per bit.

SVT-AV1 is great for that sweet spot balance of speed & efficiency for AV1
video. Rav1e, my personal favorite software AV1 encoder, isn't the best, but it
is great for high fidelity & should never segfault.
[aom-av1-lavish](https://github.com/Clybius/aom-av1-lavish) is the reigning
champ for coding efficiency in a software encoder. Use at speed 4 or lower for
excellent results; they will be results you'll have to wait very long for,
though. Tools like [av1an](https://github.com/master-of-zen/Av1an) can help.

You can try my SVT-AV1 GUI, [Aviator](https://github.com/gianni-rosato/aviator),
if you'd like to mess around with SVT-AV1 without using the command line.
[rAV1ator](https://github.com/gianni-rosato/aviator/tree/rAV1ator) it its
cousin, powered by av1an & rav1e instead of SVT-AV1 & FFmpeg. Please give them a
look if you're interested in getting started with AV1. Once you'd like to dive
down the rabbit hole, feel free to look into
[this article](https://rentry.co/av1) for a detailed guide written by a talented
encoder. Thanks for reading!
