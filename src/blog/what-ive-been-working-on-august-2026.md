---
title: 'What I''ve been up to in August 2026'
date: 2026-08-28
category: 'Open source'
tags:
  - 'Open source'
  - 'Mautic'
  - 'Community'
  - 'Women of Open Source'
  - 'AI'
excerpt: 'A look back over the month across my work leading Mautic, from a community led AI initiative and our first paid certifications to rebooting Women of Open Source and rebuilding this site.'
image: '/assets/img/blog/2026/what-ive-been-working-on-august-2026.png'
imageAlt: 'The Sīlavāpi lotus mark beside the words August 2026, on a deep aubergine monthly round-up banner.'
imageCaption: 'Monthly round-up - August 2026'
---

If you'd glanced over my shoulder this month, you might have caught me reconciling membership records, scheduling award deadline reminders, drafting a kickoff for a community AI initiative, or being sternly reminded to stand up by an app of my own making. Here's what I've been working on and building (some with AI) this month.

A thank you belongs here too. Much of the work I've been doing this month has been possible because Anthropic gifted open source maintainers a six month Claude subscription, which I gratefully received.

## Keeping Mautic sustainable

A good deal of my month went into the less visible side of leading an open source project, making sure it can fund what our community needs. 

Having an oversight of where we're at financially both in the here and now, and also in respect of our established budget, is something that's really important for the Mautic Council. Without it we can't steer the ship effectively.

To help with this, I've connected Claude to our CRM and payment systems to cross-check membership records against actual payments, flag renewal dates that didn't match reality, and surface deals that had gone dormant. 

I created a dashboard I can use each day to identify what I need to prioritise, encouraging me to follow up based on deal size, likelihood to convert, and recent activity, and helping me to write better reconnection emails in my writing style. This last part is taking quite some patience to get right ... I'm still getting quite robotic AI-ism filled text which isn't truly in my own voice at times, so it'll take a bit of refining and tweaking. 

Alongside that, I finally got around to drafting a funding and sponsorship acceptance policy for the community to review - important as we've recently been approached by some inappropriate organisations wanting to sponsor us, but we had no clear guidelines on this. This is the typical kind of thing that you can just throw at an AI agent with some concrete guidelines and have it do its thing, and review - saving me a lot of time in the basics like researching other policies, drafting up content, etc. 

I've managed to get caught up on several months of Open Startup report backlog from my time away. Claude pulled the balance summaries and metrics into a consistent structure each month while I wrote the narrative and checked the numbers, and we turned the whole process into a written methodology, so that producing these reports becomes a much easier process. In the past, this took somewhere in the region of 4-5 hours per month to pull down, clean up, interpret and analyse the data, then about an hour to draft the article. Now, we're down to no more than an hour end-to-end.

Two milestones landed as well. Nominations opened for the 2026 Mautic Awards, now grown from four categories to six. I had Claude pull the details straight from our community portal instead of working from memory, and it scheduled three deadline reminders into our announcements channel ahead of the 13 September closing date. Separately, our certification programme sold its first paid exams this month, kicking off another revenue channel for the first time. I now have a small recurring task doing that arithmetic on its own, and also built an authenticated dashboard with Claude, which both Mautic and our partners Axelerant can access, allowing everyone to have clear oversight on sales and exam attempts.

I finally got around to updating our public funding.json file, the manifest that lets funding bodies like FLOSS/fund discover projects that need support (funding.json, 2026), with last year's published figures from our financial report. While updating it this month, Claude caught an unreconciled figure in one of our own published financial reports, which was helpful to identify and fix. It also helpfully updated it to the latest specifications - which I didn't even realise had been released. Thanks, Claude!

## Building AI into Mautic, together

For some time we've been trying to get Mautic's AI Initiative off the ground - this month we've started to make some headway. I used Claude to draft the kickoff discussion around the proposed architecture, a layered AI bundle built on Symfony AI that the wider community can extend safely. We held the meeting asynchronously as it's quite challenging to get a time that works for multiple different continents.

We've drafted the big-picture strategic plan and the operational plan for the first stage, and started to explore funding models to support the work. Claude has been helpful in identifying potential sources of funding, and also exploring ways we could combine grant funding with sponsorship and volunteer work to get the ball rolling.

## The Mautic Privacy Project

We [announced this month](https://mautic.org/blog/marketing-without-surveillance-funded-by-nlnet/) that we'd received over €70,000 in funding from NLNet to work on our Privacy Project, fantastic news for Mautic and privacy-respecting marketing in general! I've been working on refining our MOU, getting the resourcing plan right, and putting together the proposed milestones. We're due to kick off next month, all being well.

## Rebooting the Women of Open Source community

Our [Women of Open Source](https://womenofopensource.org) community has been gathering momentum since I started to focus a bit more time and energy on it, and this month we launched a refreshed website with a public speakers directory thanks to Claude helping me finish off the project which was started around a year ago and never completed. A few prompts later, and we had the working first draft of the website and speakers directory which we've tweaked and refined.

Event organisers looking for women speakers in open source now have somewhere to find them. Hurrah!

Both trace back to the discovery interviews I ran last October with the community to learn about why people did and didn't engage, what they wanted from the community, and what would be the most impactful things we could offer. 

We also continued our monthly community meetup, along with a monthly wins thread and some other small rituals within the community. AI's role here was in the website launch itself, drafting the announcement and social posts from my notes and in my voice, for me to edit before publishing. Claude Design also did a great job of creating the imagery for the social posts, too - I was pleasantly surprised by how good a job it did!

## Rebuilding this site in the open

This site itself is part of the month's work. Following my ordination and taking a new name, I've moved my personal site to its new home at silavapi.co.uk, from Joomla to a fast, static, privacy-respecting setup with no cookies and no trackers. 

I started in Claude Design with every brand resource my designer created years ago, then built it in Claude Code with accessibility checked automatically. 

The habit that made the biggest difference was insisting the AI interview me first, one question at a time, so it built what I actually wanted. 

I've written up the whole story in [Rebuilding this site in the open](/blog/rebuilding-this-site-in-the-open/), so I won't repeat it here.

## Other projects

A few smaller builds rounded out the month. I built an application with Claude that makes me [sit and stand regularly through the day](https://github.com/rcheesley/standyouup), the kind of small personal tool that would never have justified building from scratch before, but now takes a couple of hours and has been *remarkably* successful in making me stand up and sit down regularly throughout the day!

Mautic has a large backlog of GitHub Security Advisories, so I've been building a triage tool that uses [Druks](https://druks.ai) to spin up disposable sandboxes, giving each advisory a contained environment to reproduce and verify issues safely across each version of Mautic. So far it's helped a lot with identifying duplicates and triaging, but I've had less success with creating the harnesses to test the proof of concepts and actually testing the vulnerabilities. Some kinds of vulnerabilities are easier to test than others, so it's been quite the learning curve.

Also a handful of smaller tasks like writing up the story of our support chatbot for the blog, a guest piece for OpenUK on why contribution is becoming the new CV, and a personal reflection on a recent Buddhist convention have come across my desk.

## Getting stuff done more efficiently

Underneath the projects sits a set of workflows I've been developing, anchored in my [Obsidian](https://obsidian.md) vault. I've been using [Meetily](https://meetily.ai), an open source meeting note taker, with great success, so my meetings are captured and transcribed locally. 

Each morning a scheduled Claude task sweeps my calendar, email and Slack and writes a daily prep note into the vault for me to review, then I run a short live prioritisation session with Claude, checking that what *it* thinks I should prioritse is aligned with what *I* think I should prioritise, and then sorting tasks into a quasi-gamified challenge, with a Base Camp for quick wins, the Climb for steady work, and the Summit for the single hardest push of the day. 

The same vault feeds a live daily dashboard, built with a small deterministic script Claude runs. I've also got a dashboard that pulls in the data from HubSpot so I can immediately see what's next up for my sales follow up focus sessions. I might eventually pull this all out into an independent app so I'm not so dependent on Claude Desktop, but for now it's been very helpful.

## What I'm reading this month

I've been reading some interesting books this month, mostly fuelled by mentions on podcasts I listen to, or topics I want to know more about. Also some of general interest, and of course the odd 'chill out and relax' fiction books!

### Tech / business books

- [Disciplined Entrepreneurship](https://www.d-eship.com/) by Bill Aulet was recommended reading in another book I read last month, so I picked up a copy on ABE Books and have been making my way through it. So far I am really appreciating the clarity with which he explores the 24-step framework and how this drives success in innovation-focused entrepreneurship.

### Dharma books

- [No Time To Lose](https://www.shambhala.com/no-time-to-lose.html) by Pema Chödrön is a firm favourite, and something I come back to time and again. I find it a really accessible commentary on the Bodhicaryavatara, a key Mayahana Buddhist text. It's been on my reading list this month, as I often open it to a page which almost always contains something relevant to whatever I'm working with at that moment.

- [The Radical Embrace](https://www.radicalembrace.org/books) by Singhasri came out this month, it's a must-read - I'm just getting started so it's early days, but I've been on retreat with Singasri a few times before and always found their teachings to be incredibly helpful.

### Fiction books

- A new book that came across my radar on the Order convention this month is [Closer Than You Think](https://www.amazon.co.uk/Closer-Than-Think-Srivati-Skelton/dp/B0H7CP6WZF/) by Srivati Skelton - I've not got very far with it yet, but the excerpts I heard at the book launch sounded really great!

- I confess to a love of all things Bridgerton, so just recently I've been listening to the audiobooks of Queen Charlotte again, and the Bridgerton books will likely follow. Great for a bit of light relief while cooking in the kitchen or driving!

## Over to you

I'm curious about the threads running through your own work at the moment. What would you notice if you stepped back and looked at your month as a whole? I'd love to hear about it, and if any of the above sparked something, whether that's Mautic's sustainability work, the new AI initiative, the Women of Open Source community, or something else, feel free to leave a comment!

## References

funding.json (2026) *funding.json, an open manifest schema for open source projects*. Available at https://fundingjson.org/ (Accessed 13 August 2026).

Meetily (2026) *Meetily, open source meeting note taker*. Available at https://meetily.ai (Accessed 10 August 2026).