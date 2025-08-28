+++
title = "Lossless Data Compression"
author = "Gianni Rosato"
date = 2023-10-02
+++

Comparing the efficacy of various lossless data compression algorithms on text
data, comparing time to compress vs output size. The algorithms tested include
ZIP, 7-zip, XZ, Brotli, Zstandard, and zpaq.

<!-- more -->

# Lossless Data Compression

While I've covered image compression a decent amount in these sorts of blog
posts, I wanted to dive into generic lossless data compression a bit more to see
what this interesting realm of compression has to offer. Inspired by the many
other existing lossless data compression comparisons, I wanted to approach this
with visualizations similar to the ones I provide in my image codec comparisons.
Because lossless data compression doesn't discard data, these graphs plot time
vs. compressed size, allowing you to compare the various compression steps of
lossless data compression algorithms relative to the time taken to
compress/decompress.

# Methodology & Algorithms

I want to make it clear upfront that I did _not_ thoroughly test every single
available compression algorithm under the sun, but instead hand-picked a couple
that I found interesting. Notably not present are gzip & bzip2; gzip has an
interesting history, but its use of Deflate & LZ77 makes it pretty much
identical to ZIP for all intents & purposes. Bzip2 is interesting, but due to
its age & effectiveness compared to more modern compression algorithms, I found
it less interesting than more modern options. It also decompresses slower than
the more space-efficient XZ. Feel free to pique my interest in these two
algorithms if you're interested in seeing them included.

I must provide the usual disclaimer as well that my testing is non-scientific &
shouldn't inform your use of one technology over another. That being said, here
are the formats I tested:

- ZIP (via 7zip)
- 7zip
- XZ
- Brotli
- Zstandard
- zpaq

& here are the parameters I used for compression, often after archiving to a
.tar:

- ZIP: `7zzs a -bso0 -tzip -mx[level] "out" "input"`
- 7zip: `7zzs a -bso0 -mx[level] "out" "input"`
- XZ: `xz -q -q -T0 -k -[level] "input" "out"`
- Brotli: `brotli -q [level] "input" -o "out"`
- Zstandard: `zstd -q --ultra -[level] -T0 "input" -o "out"`
- zpaq: `zpaq a "out" "input" -m[level]`

Finally, here are my system specs:

```
CPU: 16-core (8-mt/8-st) 13th Gen Intel Core i7-13700K (-MST AMCP-)
     speed/min/max: 888/800/5300:5400:4200 MHz Kernel: 6.5.5-zen1-1-zen x86_64
```

If you'd like to do a deeper dive into my methodology, I have my script
`compression-plotter` available
[on GitHub](https://github.com/gianni-rosato/compression-plotter). Given you
have all the dependencies, you are free to run it yourself to cross-reference
any results you come up with against mine.

I used a 1.0GB generic Wikipedia download for this test, which makes it
text-specific. Now, let's dive into which algorithms I chose & what they do.

### ZIP (Deflate)

Most modern variants of the tried & true ZIP use the Deflate compression
algorithm, which is also famously used in PNG. Deflate acts as a combination of
LZ77 lossless coding & Huffman coding, where it can first use LZ77 to find
patterns in the data & reduce redundancy. This is followed by using Huffman
coding to assign smaller bit values to patterns found more frequently by LZ77.

Considering ZIP came out in 1989, I don't expect it to be the strongest
performer on this benchmark. I'm interested to see how 7zip's supposedly
improved ZIP encoder fares against the other standards, though; as the 7zip
website's homepage claims: "For ZIP and GZIP formats, 7-Zip provides a
compression ratio that is 2-10 % better than the ratio provided by PKZip and
WinZip."

ZIP is noteworthy for its nearly universal compatibility. "Traditional ZIP"
(compression method 8) is limited to 4 GB, though most ZIP compressors use
Deflate64(tm) (compression level 9 in the ZIP specification) to bypass this
limitation.

### 7zip

Using the static 7zip binary for Linux, I benchmarked 7zip not initially very
interested in its compression capabilities. However, as I continued to use it, I
was impressed by its usability & sane defaults; 7zip compression & decompression
both thread rather effectively, which makes the format _feel_ very fast to work
with even if system & user time tell a slightly different story. It is supported
just fine on my Arch Linux installation with GNOME, and it works on macOS by
default. To open a 7zip (.7z) archive on Windows 10, you need the well-known
[7-Zip utility](https://www.7-zip.org/).

7zip is _mostly_ based on LZMA & LZMA2, though there is
[a lot more going on](https://www.7-zip.org/7z.html) if you look deeper. LZMA2
is an improved version of LZMA, which itself is based on LZ77.

### XZ

XZ can only compress one file at a time, so making a tar archive of the files
you'd like to compress (if there are multiple) is necessary when using XZ. The
XZ format itself is an improvement on LZMA, allowing for preprocessing filters
similar to 7zip to increase the resulting archive's compression ratio. I've been
able to decompress .tar.xz archives on macOS & Linux just fine, but Windows 10
needs 7-Zip once again.

### Brotli

Brotli was designed by Google, & is commonly used as a compression format on the
Web. It was released in late 2013, & it is commonly used on the Web for content
delivery. It is a core part of the .woff2 Web Open Font Format, allowing web
fonts to be smaller when sent to users as part of a website. It is not very
common to pass around .tar.br files, so it is perfectly acceptable that such
files aren't really compatible anywhere. Brotli is almost universally compatible
across the Web, being supported by as much as 96% of the world wide web's users.

Brotli is based on LZ77 & Huffman coding, much like ZIP. It also uses context
modeling to allow the use of multiple Huffman trees for the same alphabet in the
same block; without getting into the weeds, this essentially means that based on
the _context_ of the data being compressed, it can be compressed more
efficiently especially if it contains multiple different kinds of data.

Brotli was co-authored & partially developed by Jyrki Alakuijala, who also
worked on JPEG XL & jpegli. JPEG XL's metadata information can be uncompressed
or Brotli-compressed.

### Zstandard

Zstandard is a compression algorithm by Facebook known for its extremely fast
decompression speeds. It was released in early 2015 and is used in a variety of
different contexts. It was designed to perform similarly to older Deflate-based
compression algorithms like ZIP or gzip while being overall faster. In practice,
it is said to compress similarly to pure LZMA while being much faster.

While .tar.zst archives aren't going to be very popular to find on the Internet
& elsewhere, it is already a very popular tool for compression in the world of
open-source software. It has been integrated into both the FreeBSD kernel & the
Linux kernel and is available as a filesystem compression method for the btrfs,
squashfs, bcachefs, & OpenZFS filesystems. All Arch Linux packages are
compressed at zstd level 20, allowing Arch packages to be decompressed _14
times_ faster than when Arch used XZ at the cost of an average 0.8% filesize
increase. It is popular in the game emulation scene as well, as many game file
formats for emulating console games support zstd compression. The ZIP file
format actually supports Zstandard in compression level 93 since version 6.3.8
which was published in 2020. Content encoding using zstd is supported since
Chromium 118 behind an experimental flag, meaning it might compete with Brotli
on the web in the future. Apple's LZFSE algorithm is purportedly similar to
Zstandard compression level 6.

### ZPAQ

I know much less about ZPAQ, but from what I can glean it uses a multitude of
different compression algorithms to try to achieve the best
size-to-compression-time ratio possible while producing the smallest possible
archives without much concern given to decompression performance. On the
[official ZPAQ website](https://mattmahoney.net/dc/zpaq.html), it looks like it
is designed for "realistic backups that have a lot of duplicate files and a lot
of already compressed files."

What I find very cool about ZPAQ is that it is an _incremental_ journaling
archiver, meaning you can add files to an existing archive based on if they were
changed or not which reduces the time needed to wait for a new backup to finish.
If other tools here are capable of this, I have not seen it advertised, but this
is particularly cool for ZPAQ since it is so focused on compression ratio & in
practice, this kind of feature may reduce the burden imposed by long compression
times. ZPAQ archives aren't handled by default on my Linux installation in
Nautilus.

# Results

### Compression

Here are my compression performance results, measured in real time. This graph
uses a logarithmic horizontal scale factor:

![compression_realtime_results](/static/images/compression_realtime.svg)

**My personal takeaways from this test:**

- This is very much not fair to Brotli, as the reference encoder can only use 1
  thread at a time, disadvantaging it in real clock-on-the-wall time comparisons
  like this one. Wait for the next test
- Zstandard is indeed competitive with xz & 7zip, although it isn't quite as
  good. Higher effort ZPAQ pulls far ahead of everything
- ZIP is, predictably, behind the pack by a good amount. Can't say I'm surprised
  :P
- XZ extreme vs. normal doesn't seem to have a meaningful effect on
- Low-effort Zstandard is _really_ fast, and competes with ZIP despite being
  much faster. Mission accomplished?

Here are my compression performance results, measured in _user + system_ time
(the time the computer uses across its resources, added up). This graph uses a
logarithmic horizontal scale factor:

![compression_usrtime_results](/static/images/compression_usrtime.svg)

**My personal takeaways from this test:**

- Not sure why I omitted ZPAQ from this test. Either way, we know from the
  previous test it probably would have looked the same considering it is
  multithreaded
- Now, Brotli looks much more competitive. Not sure if allowing the other
  encoders to use multiple threads hampers their performance at all, though I
  don't know why it would
- This makes zstd look much more competitive with XZ & 7zip
- ZIP still lags behind. Using this older Deflate algorithm isn't going to save
  you any compute resources compared to modern options like Brotli & zstd

### Decompression

Evaluating any of these compression standards for practical use means you must
take decompression into account. Let's look at the first batch of results for
real time, where I tested decompression performance for the **lowest & highest
levels of compression effort** for each standard. Once again, this graph uses a
logarithmic horizontal scale factor:

![decompression_realtime_results](/static/images/decompression_realtime.svg)

**My personal takeaways from this test:**

- Yikes, not looking good for ZPAQ in this test. It definitely showed its
  strengths before as an archival format, but as anything else, it doesn't look
  viable
- The gap between XZ & 7zip is pretty astonishing. I'd like to see in the next
  test if this has to do with 7zip taking advantage of multiple threads more
  effectively, but either way, 7zip clearly has the better user experience
- I'm once again left wondering how much better Brotli will perform when given
  the opportunity to level the playing field with the other standards
- ZIP still isn't good
- Considering decompression performance is one of Zstandard's highlights, 7zip
  makes a strong case for being a better choice if Zstandard can't compete in
  the next test
- That third pink X next to the one closest to the bottom for XZ is
  decompression performance for the "extreme" version of the highest compression
  level. Not much difference, again

Finally, here are the user + sys time results for decompression. This should
tell us a more complete story about why 7zip is so fast in real time. This graph
uses a logarithmic horizontal scale factor:

![decompression_usrtime_results](/static/images/decompression_usrtime.svg)

**My personal takeaways from this test:**

- ZPAQ is still not great
- The gap has closed a _lot_ between 7zip & XZ, showing that under the hood,
  7zip is really just a more advanced XZ with more thoughtfully designed
  utilities optimized for desktop use where a decoder can comfortably make use
  of multi-threading on powerful systems
- ZIP isn't that bad compared to 7zip & XZ! This is the first _real_ win ZIP
  pulls out, in my opinion, considering weaker systems may see performance more
  similar to this test for real time decompression than my previous test
- Brotli is good, but zstd is clearly in a class by itself. Now it makes a lot
  more sense why decompression performance was emphasized so much, and why zstd
  is the optimal choice for filesystem compression

# Conclusion

My conclusion overall is that there really are different scenarios where each
format shines. I'll explain for each format:

Firstly, **ZPAQ** is going to be my choice for computer backups if I ever do
them (I often don't). The incremental option alongside the incredible
compression ratio makes it the best option for this use case, in my opinion,
given you'll be willing to allow it to take its sweet time as it decompresses.
For a backup format, I don't think that's the biggest deal in the world anyway.

**7zip** seems like the best option for general desktop use, and if you're
distributing files, providing `.7z` archives might not be a terrible idea if
you're looking to phase out ZIP to save server space & bandwidth while
maintaining compatibility. The last holdout for support is Android, as Windows
11 can now decompress 7zip archives. 7zip's widespread support as well as its
good performance earn it this position. Did you know even iOS can preview the
contents of 7zip archives?

**XZ** is a bit of a black sheep here in a world where 7zip exists. 7zip & XZ
are both open source, too. Tell me if XZ has some hidden strengths I'm missing.

**Brotli** as a replacement for simpler algorithms on the Web for content
delivery makes complete sense. It decompresses fast & compresses well, and can
be parallelized using other implementations to optimize real time encode
performance. In the meantime, servers are more concerned with user & system
time, so those graphs are likely more salient when considering Brotli
performance where it is applicable.

**Zstandard** is what I'd consider to be the _future_ of all of the above
categories. In certain scenarios, if it takes off as a content delivery format,
I could see it replacing Brotli if the benefits of super-fast & super-light
decode improve the responsiveness of web pages & are worth sacrificing a bit of
compression ratio. When using the much higher effort settings, it actually beats
Brotli on all accounts. I'd be happy to pass around `.tar.zst` archives in the
future to replace 7zip & ZIP, making speedy decode a reality on systems of all
different measures of compute performance. I'm glad Zstandard is making its way
as a great format to use in the FOSS community for innovative new
implementations of compression like filesystem compression & accessible package
compression that doesn't tax your CPU when decoding, but I'd personally like to
see its use cases expand in the future.

**ZIP**'s Deflate implementation is very clearly useful for one thing:
compatibility. I'm glad the Deflate patent has expired, otherwise I'd be much
more disappointed in ZIP's standardization as the default compression archive
format in most situations. Personally, for the time being, I'm just glad we
didn't unintentionally standardize around _uncompressed_ archives, as I'd be
willing to bet many don't know ZIPs are actually compressed.

What do you think of my results? Is there anything I missed or could have done
better? Should I include bzip2 or some other algorithm next time? Let me know.
Thank you for reading!
