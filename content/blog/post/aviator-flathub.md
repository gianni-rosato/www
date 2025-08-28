+++
title = "Aviator 0.2.0"
author = "Gianni Rosato"
date = 2023-02-11
+++

Aviator aims to enable simple, accessible AV1 encoding for everyone with a GUI
powered by a fast AV1 encoder.

<!-- more -->

## Why?

First, you can install
[here](https://flathub.org/apps/details/net.natesales.Aviator).

To enable simple, accessible AV1 encoding for the masses via Flathub. See my
post about rAV1ator [here](https://giannirosato.com/blog/post/aviator-1/) for
the rav1e + av1an based version of this utility.

Aviator has used SVT-AV1 & FFmpeg for a while, but has been missing a couple key
features including a progress bar, a stop encode button, and more buttons on the
header bar then just the close button. I've been glad to make this release
available on Flathub, but I think it has surfaced some serious issues with how
Flathub allows you to build applications.

## rAV1ator vs Aviator: Flathub

There's [an open issue](https://github.com/flathub/flathub/issues/3392)
regarding exactly my complaint here, which is that Flathub doesn't allow
`--share=network` in the build-args. This places an undue burden on the
developer to jump through extra hoops to make "reproducible builds," which I
could guess there is potential to do with crypto instead of putting it on the
dev. I champion Flatpak because of its superb user experience and seamless
integration with the Linux desktop, but from a developer standpoint it is a
nightmare of quirks & workarounds that require a depth of experience that many
simply do not possess. Even if I did have such experience, I'm not sure how I'd
be able to ship rAV1ator on Flathub with such a hurdle.

Aviator is great, and I'd easily recommend to anyone interested in video
encoding. But I'd like it to be the best I can make it, and Flathub is simply
not allowing this to happen. Hopefully with enough complaining we'll be able to
fix things, but the light at the end of the tunnel doesn't seem to be
approaching very quickly.
