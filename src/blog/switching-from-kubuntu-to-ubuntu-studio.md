---
title: 'Switching from Kubuntu to Ubuntu Studio'
date: 2022-08-17
category: 'Geek'
image: '/assets/img/blog/Ubuntu-Studio-blog-header.png'
imageAlt: 'Ubuntu studio logo on the dark wallpaper which is black with a mottled grey image of the ubuntu studio logo on the right side - a circle with several concentric circles outside it.'
excerpt: 'Having started to learn the flute three years ago and taking up piano during lockdown to help me with learning how to compose, I''ve increasingly been…'
sourceUrl: '/blog/geek/switching-from-kubuntu-to-ubuntu-studio'
---

Having started to learn the flute three years ago and taking up piano during lockdown to help me with learning how to compose, I've increasingly been tinkering with open source digital audio tooling to record and tweak various musical endeavours.

Some time ago after complaining about the challenges of getting audio (and specifically MIDI) working under Kubuntu, someone happened to suggest taking a look at [Ubuntu Studio](https://ubuntustudio.org/) - a distribution of Ubuntu specifically aimed towards creative folks.

When the time came to rebuild my desktop machine with a new SSD (byebye my last spinny drive!) I decided to take a chance and go for Ubuntu Studio.  Having been a 10+ year Kubuntu user I was somewhat apprehensive!

## What's special about Ubuntu Studio?

Well, first and foremost it is based on Ubuntu, so some of it should be relatively familiar based on what I am used to. That was definitely a deciding factor, having to learn an entirely new OS is not something I really have time for at the moment!

The main thing for me is that the entire OS is focused around the needs of the creative, so all the tooling and resources you have available are specifically curated with their needs at the forefront.

According to the website, Ubuntu Studio is:

> **_... the most widely used multimedia-orientated operating system in the world. It comes preinstalled with a selection of the most common [free](http://en.wikipedia.org/wiki/FLOSS) multimedia applications available, and is configured for best performance for various purposes: [Audio](https://ubuntustudio.org/tour/audio/), Graphics, [Video](https://ubuntustudio.org/tour/video/), [Photography](https://ubuntustudio.org/tour/photography/) and Publishing._**  
> _~ ubuntustudio.org_

In addition to my music, I do also get involved with a fair amount of work with videos and graphics for the voluntary organisations I am involved with, so it seemed like a great match.

Also, I had previously spent far too many hours trying to get JACK to play nicely with my system and to have my MIDI devices coming in correctly, so my main hopes were that with a system which is purposely designed for this, I might stand more of a chance of actually getting it working!

## Installing Ubuntu Studio

The installation process was no different to regular Ubuntu - boot from the DVD/USB drive and follow the steps on the screen. Super easy.

After installing on my desktop I subsequently installed on my Dell XPS 15 laptop which had the same issues I've had with every single Linux installation on that hardware - a lack of Broadcom drivers. See [this thread](https://ubuntuforums.org/showthread.php?t=2214110) for the solution (now firmly favourited after spending way too much time trying to track it down again!).

## First thoughts

The first thing that really excited me was seeing all of the apps that are included by default with Ubuntu Studio - many of which I had never come across before. Plenty of rainy-day exploring ahead!

It also ships with the open source Digital Audio Workstation (DAW) that I use, [Ardour](https://ardour.org/). I tried several open source DAWs with different licensing models and features, and Ardour is the one that I have settled on.  Although I actually use the installers provided by Ardour, it's great to see it bundled with the OS. Hopefully that brings more people into using these tools!

## Getting set up

As Ubuntu Studio is based on Ubuntu it was really easy for me to find, install and configure the other tools that I needed. I had literally everything set up and working within about an hour or so (most of which was spent scratching my head trying to think what had before - now have this written down in a note for future reference!)

Everything was easy to find, and I even discovered some new open source tools that I had not used before, always fun!

The interface is really smooth, nicely designed and just feels more up to date and modern.

## So, about the audio!

By default, JACK is installed and can be managed with the Studio Tools application for audio - trying to get it set up under Kubuntu was a hellish experience so this was definitely a plus.

I figured what's the worst that could happen ... let's fire up Ardour and see what is broken!

I was totally shocked to discover that my digital piano was picked up and working in Ardour, in addition to my audio interface and my Akai MPK Mini. Holy moly! Definitely a huge step forward already.

On the surface, everything seemed to be working a hundred times better than I had it working in Kubuntu. Later I found an issue with headphone switching which led me to change from JACK to Pipewire, which you can [read in my blog](/blog/swapping-out-jack-for-pipewire-in-ubuntu-studio-22-04/), but other than that, everything is running absolutely perfectly!

I'm about a month into using Ubuntu Studio now and it has been awesome so far - long may it continue!
