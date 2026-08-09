---
title: 'Rebuilding this site in the open - Joomla to a static site, with an AI assistant'
date: 2026-08-09
category: 'Open source'
tags:
  - 'Open source'
  - 'Eleventy'
  - 'Accessibility'
  - 'AI'
excerpt: 'How I moved fifteen years of content off Joomla onto a fast, low-maintenance, open source static site - built in the open with an AI coding agent as my thought partner - and why I made the choices I did.'
image: '/assets/img/blog/rebuilding-this-site-in-the-open.jpg'
imageAlt: 'A flat illustration of two people building a website: one lifts a long search bar up to the other, who slots it into a browser window labelled Home Page.'
imageCaption: 'Image by Freepik'
---

This site you're reading has just been rebuilt from the ground up. It used to run on Joomla!, the content management system I've contributed to and campaigned for over many years. Now it's a static site: a pile of plain HTML, CSS and a little JavaScript, generated from Markdown files, with no database, no cookies, and no third-party trackers watching you read this.

I did the rebuild working alongside an AI coding agent as a kind of tireless thought partner and coding buddy. I want to share a bit about why I made the choices I did, the open source projects that made it possible, how I dragged fifteen years of Joomla content across, and - because a few people have asked - how I actually worked with the AI, with some example prompts - either the actual prompt I used or in some cases a tidied up version (because sometimes I am just way too verbose!) which you can borrow.

## Why rebuild at all?

Two things came together. I took a new name at my ordination, so the site needed a new home at a new domain. Mostly, honestly, I was tired of the upkeep on a site that was overly complex for my needs.

Just to be clear, I still love Joomla both as a tool for building websites, and as an open source project and community. Using Joomla has meant I've always owned my own data, rather than have it live in a proprietary tool I can't easily leave. This decision was purely about *maintenance*. 

Joomla is a full content management system - a database, PHP, an admin panel which can do really amazing things. It does, however, come with steady drumbeat of updates and security patches to stay on top of thanks to all the amazing volunteers who keep it running and secure (not to mention all the third party plugins, templates, etc) - and for a personal site that's a lot of moving parts to look after just to publish the odd post. It felt like a lot of unnecessary effort, and definitely something I could simplify. 

What I wanted was something I could run with a simple, Git-based workflow and the least possible technical overhead: my content as plain Markdown files, no database, and no server-side application to keep patched. Keeping my readers' data to themselves - no cookies, no trackers - mattered to me too, and a static site made that fairly easy.

My goals were pretty simple to state and rather harder to deliver by myself, having very little experience in this area:

- **Low to look after.** Content as Markdown in a git repository; no database, no CMS to patch.
- **Respect readers.** No cookies, no trackers, no third-party requests. At all.
- **Be fast and cheap.** A static site that is quick to access worldwide, secure, and costs almost nothing to run.
- **Be accessible.** WCAG 2.2 AA as a hard requirement, checked automatically.
- **Stay open source.** Keeping a manifest of everything I used.

## Starting with the design
I have a new name, so I needed to refresh the brand and update the brandmark. I started out by using Claude Design to create a styleguide for the brand. My designer, [Chiara Aliotta-Baras](https://untilsunday.it), created my brand some years back, and I was able to provide all the resources she gave me back then to ensure that whatever we build remains 100% faithful to that design.

Claude was able to build out the wireframes for the site, giving me pixel-perfect resources I could take into Claude Code to build the actual website.

Here's the prompt I used:

```text {.prompt}
My current website at https://ruthcheesley.co.uk is going to be migrated to https://silavapi.co.uk (new domain name, won't resolve yet) now that I am ordained and have my new name. In that process, I want to move from my dynamic, Joomla-based site to a static-site managed via a private GitHub repository. I'd like you to propose if there should be any stylistic changes to the site from what we have currently when we move to the new site. You should prioritise accessibility (I want to hit the highest standard possible) and ensure we put privacy front and foremost as this is important to me and to my audience. I do not want to change the logo, colours or fonts. Please design all the resources we'll need to build out a new site taking into account all the different views we have on the current site. Ask me one question at a time if you need further refinement. This will be handed off to Claude Code for the build phase so work accordingly.
```

This allowed me to set the scene with Claude Design, and meant that when I handed over to Claude Code, I had a set of professionally created wireframes that it could build with, which would be on-brand and aligned with my designer's vision.

## Choosing the stack

I didn't want to just reach for whatever was fashionable and came at the top of search engines, so I asked the AI to reason through the options with me. Here's a technique worth borrowing.

My most useful prompts nearly all shared a shape which I use in almost every AI query with varying levels of refinement. This comes from the [AI Driven Leader](https://link.amazon/B02b0at33) (affiliate link, also available in your book store!), a great book it's well worth reading, and is reinforced by Anthropic's own training: 

Four parts 
- **Context** - the situation, goals and constraints 
- **Role** - the role I want the AI to step into, 
- **Interview** - a step where I get it to ask me three to five questions, one at a time, before it does anything, to validate that it understands what I'm asking
- **Task** - what I actually want it to produce as an output

The Interview step often surfaces details I've forgotten to mention and headed off a lot of confident wrong turns. The Task, you'll notice in the prompts below, describes what I wanted to end up with, not how to build it - I'm not a developer and had no idea what tools to reach for, so working that out is (in most cases, but not always - sometimes I have a sense of what I want and I'm more explicit here) exactly the expert's job, not mine. Here's the prompt that started the stack decision:

```text {.prompt}
Context: I'm moving my personal blog off Joomla after fifteen years. I'm the only person who maintains it. My priorities, in order: run it with a simple Git-based workflow (content as plain files); the least possible technical overhead, ideally no database or server-side app to patch; no cookies or third-party trackers for my readers; fast and cheap to host; accessible to WCAG 2.2 AA; open source. I'm not a developer, but I'm a highly technical user, comfortable with the command line and Git.

Role: You are a pragmatic web architect who has migrated a lot of sites and is sceptical of hype. You are security minded, and you are aware of the importance of testing your code, both for code quality and accessibility.

Interview: Before you recommend anything, ask me 3-5 questions, one at a time, until you understand my constraints well enough to answer with confidence.

Task: Then walk me through the realistic options with their trade-offs, and recommend one - telling me why, not just what.
```

That last instruction matters as much as the rest, because I wanted a reasoned comparison, not a verdict, so I could push back and make the final call myself. After quite a lot of back and forths and confirming the conclusions through independent research, we landed on a static site generator, with a light touch of serverless for the couple of things that need a server.

## The stack

Everything below is open source. The site is generated by **[Eleventy](https://www.11ty.dev/)** (a wonderfully unopinionated static site generator) using **Nunjucks** templates, with content written in Markdown and processed by **markdown-it**. Styles are bundled and minified with **LightningCSS**. Search - which runs entirely in your browser, with no server and no tracking - is powered by **[Pagefind](https://pagefind.app/)**. Icons come from **Lucide**, and the little map of where I've spoken uses **@svg-maps/world**.

It's hosted on **Cloudflare Pages**, with a couple of **Cloudflare Pages Functions** doing the small amount of server-side work (the contact form and the comment system). Transactional email goes through **Resend**.

I also asked Claude to set up appropriate tests to make sure that when I add new content, improve the site, or tweak something we can catch any features that might break - as well as making sure everything remains as accessible as it can be. Every change runs through **Vitest** (unit tests), **Playwright** with **axe-core** (functional and accessibility tests in both light and dark themes), **html-validate**, **pa11y**, **Lighthouse CI**, **linkinator**, **ESLint** and **Prettier**. Nothing merges on GitHub unless all of that passes.

The migration tooling itself leaned on **Turndown** (HTML to Markdown) and **node-html-parser**. That all ran once, on my machine, to convert the old site over to the markdown files I needed for the new site.

## Migrating fifteen years of Joomla

This was the bit I was dreading when thinking about re-platforming my site. 15 years is a long time to accumulate content, even if I don't write all that frequently!

I started from a database dump of the old Joomla site. Rather than reach for a heavyweight library, I had a small, dependency-free parser written for the phpMyAdmin SQL format, so I could pull every article straight out of the dump. From there, a migration script converted each **published** article - and only the published ones, since this repository is public - from Joomla's HTML into clean Markdown, rewrote all the internal links and inline images to their new homes, and turned old Joomla shortcodes into self-hosted equivalents. Magic, I tell you!

The output was one Markdown file per article, with proper front matter, plus two things I'd have hated to do by hand: a complete map of old-URL-to-new-URL redirects, and a reconciliation report proving that every one of the 125 published articles had been accounted for - nothing silently dropped.

My talks were a separate migration. I had around 78 of them on the proprietary platform Notist, which has done an excellent job but which I felt was a bit superfluous nowadays if I could build it into my own site, so those were pulled and turned into structured data for the new speaking section. Some old photo galleries that had been trapped inside a Joomla extension were recovered too, with proper alt text added to every image.

Here's the migration prompt, in the same four-part shape. 

```text {.prompt}
Context: I need to migrate the published articles out of my old Joomla site. I have a MySQL database dump. The new site reads Markdown files with front matter. The repository is public, so unpublished, archived or trashed content must never end up in it.

Role: You are a careful data-migration engineer who assumes the input is messy and will need cleaning up and reformatting.

Interview: Ask me 3-5 questions, one at a time, about the dump's structure and the likely edge cases before you write any code.

Task: Then get my published articles across to the new site, keep every old URL working so I don't break people's links or lose search rankings, and give me a way to be confident that nothing has been dropped. You decide how.
```

That last part - asking for a way to be sure nothing had been dropped - turned out to be one of the most useful things I asked for. The answer it came back with was a reconciliation report that accounted for every single article, and it caught a handful of edge cases I'd never have spotted otherwise.

## Some other areas of focus

**Comments without needing cookies or logins.** Most static sites bolt on a third-party comment service that tracks your readers. I didn't want that. So comments here are file-based: when you leave one, a small edge function commits it as a JSON file to a holding branch on GitHub and emails me a one-click approve or reject link. Nothing appears on the site until I've approved it, no comment is ever stored on a live page unmoderated, and your email address is never stored in the public repository at all. The approval links are cryptographically signed and expire, so they can't be forged or replayed.

I described the shape and asked the AI to harden it:

```text {.prompt}
Context: I want comments on my blog, but with no third-party service and no cookies. The site is static, hosted on an edge platform, with its source in a public Git repo. Spam and abuse are a given.

Role: You are a security-minded engineer designing for a hostile internet. You're here to help me design a system that will meet my specifications but also be robust and have protections against attack.

Interview: Ask me 3-5 questions, one at a time, to pin down the moderation flow and my risk tolerance before you propose a design.

Task: Design a way for me to have moderated comments where nothing appears until I approve it, and where I can approve or reject each one with a single click, ideally without logging into anything. Then think adversarially - list how it could be abused, and how we defend against each attack.
```

The system works pretty nicely for me at the moment - we'll see how it goes. I don't get massive amounts of comments anyway, at the moment!

**Accessibility as a gate, not a hope.** Rather than test accessibility manually and hope it stays good, it's enforced in the build:

```text {.prompt}
Context: Accessibility is a hard requirement for this site - WCAG 2.2 AA - and I want it enforced automatically so a regression can never merge. The site builds in CI and supports light and dark themes.

Role: You are an accessibility specialist who is skilled at writing automated tests which test the code for a website that is being built to ensure ongoing accessiblity.

Interview: Ask me 3-5 questions, one at a time, about my build and tooling before you set anything up.

Task: Then set up automated checks that run on every change and stop anything that would make the site less accessible from being merged. You choose the right tools for the job.
```

**A privacy promise I can actually keep.** There are no cookies, no client-side analytics script, and no request to any domain other than this one. Traffic is measured server-side at the edge instead. 

## How I actually worked with an AI pair

This is the part people seem most curious about. I tried as much as possible to ensure that the AI didn't replace judgement, but sat alongside me guiding me along a decision making process, giving me advice and guidance while also helping me to evaluate my options. I still made every decision, reviewed proposed changes, and rejected plenty. It allowed me to move fairly quickly but also to flag up things that concerned me or questions I had about a proposed route forward.

A few things made the difference between a useful collaborator and a mess:

**I set standing rules once, and held to them.** Not every prompt needs the full four-part shape; some are just standing instructions you set at the start:

```text {.prompt}
Work in small pull requests, never commit straight to main. Write tests and aim for full coverage. Code defensively. After each PR, request a code review, address the feedback, and keep looping until there's nothing left.
```

**I asked it to flag rather than assume.** When it came to my own words, I didn't want anything invented. Late in the project I ran a content review - Context, Role, Interview, Task again:

```text {.prompt}
Context: My site has a set of hand-written pages (not the blog posts). Some copy may be stale - old dates, 'currently...' claims that are no longer true, things written for the previous site.

Role: You are a meticulous copy editor who never invents facts. You write in British English at all times and follow the house styleguide to the letter.

Interview: Before you start, ask me 3-5 questions, one at a time, about the site and what counts as out of date.

Task: Read the hand-written pages and flag anything stale, wrong, or in the wrong tense, with a suggested fix for each - but let me confirm every change before you make it.
```

That produced a tidy list of things to decide, rather than a pile of changes I'd have to unpick. It's a good pattern generally: ask for **proposals you approve**, not silent edits. I then went through and reviewed which ones did need updating, which ones were good to stay as they are, and which were no longer appropriate and needed removing. I think I caught them all, but if not, let me know via the contact form, please!

**I made it prove its work.** 'Is it deployed?' isn't good enough. Throughout, I had it verify things against the real, running site - following an old link through the redirects to check it landed on the right page, confirming there were genuinely no third-party requests, checking the feed and sitemap actually served. Trust that it says it did what it claims, but also verify - have it show you evidence with screenshots, for example.

**I had GitHub Copilot review all the PRs.** This gave me a secondary check to ensure that what was being proposed was sensible. It did pick up some bugs, suggested some improvements, even picked up a typo I'd made in some alt text 10 years ago!

## Sharing the savings

There's one more thing I want to do, and it matters to me because as a project lead for an open source project, I know how challenging it can be to keep your project sustainable. 

Moving to a static site on an edge network has made this site far cheaper to run than the old one, so I'm going to take what I save on hosting, add a little on top, and share it out among the open source projects I've built this on. 

Every single one made this possible - it feels only right to give something back. If you build your work on other people's freely given labour, and you can spare it, I'd gently encourage you to do the same. 

You can use [ecosyste.ms](https://ecosyste.ms/) to identify your dependencies and tools like [thanks.dev](https://thanks.dev) to help you to automate the paying out process (or just go direct to their funding links, if convenience isn't an issue).

## Was it worth it?

So far, I'd say yes. The site is faster, cheaper, more private and far less work to look after than it's ever been; it's just files in git now, which I can move anywhere; and I understand how most of it worked. The AI made a big, tedious migration feel achievable in the gaps of a busy life - but the way it came together into the site, the design, the standards and the final say were mine, and I think that's exactly the right division of labour.

The whole thing is open source in the GitHub repository, so if you'd like to see how any of it works - the comment system, the migration scripts, the accessibility setup - it's all there to read, and you're very welcome to borrow from it.

If you take one thing from this just remember that you don't have to trade away your readers' privacy, or take on a pile of maintenance, to have a lovely fast website. It's all still possible. It just takes a bit of time, and caring about it.
