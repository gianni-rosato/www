+++
title = "The End of SVT-AV1-PSY"
author = "Gianni Rosato"
date = 2024-11-26
+++

SVT-AV1-PSY, a community fork of the SVT-AV1 video encoder, was created to
enhance perceptual quality and ease of use for AV1 encoding. I co-created and
currently maintain the project. Our new goal is to merge our features into
SVT-AV1.

<!-- more -->

## Why?

If you aren't familiar with codecs or AV1, I'm not sure why you're on my site.
Nevertheless, here's some background:

- AV1 is a modern video codec, meant to make videos smaller and better looking
- Unlike H.264 and H.265, AV1 is royalty-free, meaning you don't have to pay to
  use it
- There are three very popular AV1 encoders that can be used to produce AV1
  video: libaom, rav1e, and SVT-AV1

### Encoders

There are three main AV1 encoders, as mentioned above: libaom from Google, rav1e
from xiph, and SVT-AV1 from Intel, Netflix, Meta, and others. Historically,
SVT-AV1 has been noteworthy for its impressive speed and parallelism, while
libaom was known for its great quality and class-leading still image performance
(AV1 has an image format associated with it called AVIF).

### Forks

The libaom team at Google is largely insulated from community influence; this
means a random individual submitting some new code has a low chance of it being
accepted. This led to a community culture of forking, with the first noteworthy
fork being [aom-av1-psy](https://github.com/BlueSwordM/aom-av1-psy) by
BlueSwordM.

The goal of this fork was to enhance libaom (aomenc) with better perceptual
quality. This means that the encoder would be able to make better decisions
about what to keep and what to throw away according to our eyes, instead of
chasing metric scores that, while important, don't always reflect the
characteristics of the human visual system. BlueSwordM retired aom-av1-psy in
September of 2022 to focus on other work.

Perceptual fidelity is not a new concept; encoders like x264 and x265 have a
number of perceptually focused features like "psy-rd" and "psy-trellis" (you can
read more about these elsewhere). x264 and x265 are very mature encoders for
older formats, so mainstream AV1 encoders haven't had the same level of
development in this area. This helped aom-av1-psy become very popular among AV1
enthusiasts, and its legacy lives on in the form of two newer forks:
[aom-av1-lavish](https://wiki.x266.mov/docs/encoders/aom-av1-lavish) (retired as
of June 2024) and [aom-psy101](https://wiki.x266.mov/docs/encoders/aom-psy101)
(still maintained at the time of writing).

Usually, forks were maintained by a single individual – all of the forks I've
mentioned so far have been or currently are. Coding isn't the only thing that
goes into maintaining a project, so a solo dev is often responsible for
documentation, community management, releases, bug reports, feature requests,
testing, and more. This puts pressure on a singular developer to manage a rather
complex project with a lot of eyes on it, which is difficult and has often led
to project maintenance issues.

All of this had been swirling around in my head at the time, because compiling
aom-av1-lavish by collecting the latest experimental patches floating around
Discord was kind of difficult and I was keenly interested in what a new project
isolated from the aom-av1-psy legacy might look like. This brings us to
SVT-AV1-PSY.

## How It Started

I had entertained little discussions with friends about what kind of potential
SVT-AV1 might have in 2023. The community often doesn't care much about speed
versus perceptual quality, so many weren't that invested in seeing what could
come out of SVT-AV1 as the aomenc forks were (and have always been) quite good.
The rav1e encoder already had a perceptual lean, so many thought the path
forward was clearly to invest as much community time as possible into rav1e. I
thought this would be a herculean effort that would likely not pay off, and I
was convinced that SVT-AV1 had something to offer with the incredible year over
year speed improvements we kept on seeing. However, I never once thought of
forking.

Coincidentally, at this point
[a perceptual quality-related issue](https://gitlab.com/AOMediaCodec/SVT-AV1/-/issues/2105)
appeared in the SVT-AV1 GitLab repository. This piqued my attention immediately,
and the initial results that Variance Boost was producing looked extremely
promising. While the author, Julio Barba, was sharing patch files to communicate
with the dev team, excited community members were manually patching the source
code and building the encoder to test it out. I was one of those people, and I
was very impressed with the results, but the patching workflow was cumbersome
and reminded me of my current woes with aom-av1-lavish. So, I hastily put
together a GitHub repository with the patch applied to the SVT-AV1 source code
alongside some minor tweaks from an SVT-AV1 fork maintained by BlueSwordM. I
called it SVT-AV1-PSY, named after aom-av1-psy.

Julio ended up appearing across the various AV1 Discord servers run by community
members, and BlueSwordM was able to get in touch with me about how I was
integrating and testing his work. I offered to maintain the project while Julio
and BlueSwordM would act as the primary contributors, so they could focus on
code while I dealt with everything else. We made our first release in February
of 2024, and the project began to gain traction from there.

## How It's Going

Although I didn't intend to do much programming to start, it was too
tantalizing, and I had just begun learning C in October of 2023 so I thought I
would try my hand. In the end, everyone on the dev team ended up contributing
code, and we also attracted the attention of Clybius – the maintainer of
aom-av1-lavish – who stopped working on his aom-av1-psy fork to join us. Trix, a
noteworthy encoder known for their work with animation, also joined the team and
provided us with a lot of valuable feedback through their extensive testing in
the [SVT-AV1 Deep Dive](https://wiki.x266.mov/blog/svt-av1-third-deep-dive) blog
series.

I could not have asked for a better group of people to work with. The amount I
have learned through them, especially Julio, has been immeasurable, and I
wouldn't be nearly as competent as I am now without them. I am very grateful for
their time and effort, and I am proud of what we have accomplished together.

Here's a short list of what has been achieved with SVT-AV1-PSY:

- We've authored over 20 highly effective features, aimed at improving
  perceptual quality and ease of use
- We have produced a total of 13 releases at the time of writing, introducing
  our own release cadence to help push finished features to users faster
- We've built a community of over 500 members on the
  [AV1 for Dummies](https://discord.gg/bbQD5MjDr3) Discord server, where
  discussion mainly revolves around SVT-AV1-PSY and related projects
- We've racked up over 250 stars on GitHub at the time of writing (more than
  SVT-AV1! Though that's likely due to GitHub vs GitLab)
- We have a [website](https://svt-av1-psy.com/) for showing off our results,
  where we notably demonstrate our
  [AVIF performance](https://svt-av1-psy.com/avif/). At its inception, AVIF with
  SVT-AV1-PSY was the best in the world by a wide margin; libaom is competitive
  now due to the introduction of our breakthrough changes into libaom
- We've recently forged a relationship with the incredibly responsive and
  talented mainline SVT-AV1 team, and we are working to get our features merged
  into the mainline encoder so everyone can enjoy them

SVT-AV1-PSY is the most popular community fork of a major AV1 encoder, and I am
very proud of what we have accomplished. I am excited to see where we go from
here, and I am grateful for the opportunity to have worked with such talented
and dedicated individuals. I am also grateful for the community that has
supported us, and I hope we can continue to provide you even more exciting
compression technology in the future.

## How It Ended (?)

Full disclosure, SVT-AV1-PSY isn't "ending," per se – that was just some
clickbait. We are in the process of getting as many of our features as possible
merged into the mainline SVT-AV1 encoder, and we are working closely with the
mainline team to see that through. What's happening next is that we are slowly
rolling back our involvement in SVT-AV1-PSY.

Due to life, work, and other extenuating circumstances, both myself and Julio
are going to be taking a step back from heavily contributing to the project for
the time being. I am still going to be around to help out as the maintainer, but
we are going to be less active in the day-to-day operations of the project. As
of January 2025, I'm going to be stepping back from authoring perceptual quality
and performance changes for reasons I will disclose soon; my involvement will
mostly consist of maintaining the project and helping out with the mainline
integration going forward through December.

Hopefully this isn't a disappointing announcement; I think it is incredibly
exciting that the community is in a position to contribute to mainline SVT-AV1
directly, and a fork only serves to duplicate efforts on that front. SVT-AV1-PSY
was always meant to be a temporary project, and started as a playground for
testing new features that may not have been production-ready immediately. I am
very proud of what we have accomplished, and I am excited to see what the future
holds for SVT-AV1.

## Next Steps

I am a big believer in the idea that breakthrough compression performance
enables brand-new applications for multimedia tech, and compression doesn't
solely exist to make video files smaller for the benefit of the corporate bottom
line. Saying good compression only exists to save X% bandwidth is akin to saying
post production only exists to drive X% more sales; post production and visual
art are creative and expressive, and compression is a tool to enable that
creativity in ways that we likely can't imagine yet.

I am humbled to be a part of a community that is pushing the boundaries of what
is possible with video compression, and to have contributed my drop in the
bucket with SVT-AV1-PSY. I am excited to see where things go from here, and I'm
hopefully not leaving the multimedia compression world anytime soon.

Thank you to Julio, BlueSwordM, and Clybius for all of your help, and thank you
to the community for your support. I am excited to see what the future holds!

### Sponsor Me on GitHub Sponsors

Help support my open source efforts - a little goes a long way!

[Sponsor](https://github.com/sponsors/gianni-rosato?o=esc)
