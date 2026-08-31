---
title: 'What I''ve been working on this month'
date: 2026-08-28
category: 'Open source'
tags:
  - 'Open source'
  - 'Mautic'
  - 'Community'
  - 'Women of Open Source'
  - 'AI'
excerpt: 'A look back over the month across my work leading Mautic, from a community led AI initiative and our first paid certifications to rebooting Women of Open Source and rebuilding this site.'
---

If you'd glanced over my shoulder this month, you might have caught me reconciling membership records, scheduling award deadline reminders, drafting a kickoff for a community AI initiative around a contributor's own plugin, or being sternly reminded to stand up by an app of my own making. Here's what the month has held.

## Keeping Mautic sustainable

A good deal of my month went into the less visible side of leading an open source project, making sure it can fund what our community needs. I connected Claude to our CRM and payment systems to cross-check membership records against actual payments, flag renewal dates that didn't match reality, and surface deals that had gone dormant, then draft reconnection emails in my writing style for me to review and send. It now runs as a weekly rhythm, with every figure verified against the CRM before Claude writes the pipeline plan into my Obsidian vault, recording what cleared, what's still open, and what's blocked.

Alongside that, I drafted a funding and sponsorship acceptance policy for the community to review, and caught up on several months of Open Startup report backlog. Claude pulled the balance summaries and metrics into a consistent structure each month while I wrote the narrative and checked the numbers, and we turned the whole process into a written methodology so producing these reports becomes a habit I can sustain.

Two milestones landed too. Nominations opened for the 2026 Mautic Awards, now grown from four categories to six (Mautic, 2026a). I had Claude pull the details straight from our community portal instead of working from memory, which is how it caught that the old Impact Award has become Project of the Year, and it scheduled three deadline reminders into our announcements channel ahead of the 13 September close. Separately, our certification programme sold its first paid exams this month, turning a quiet partnership into a live revenue share for the first time, with a small recurring task now doing that arithmetic on its own.

I also keep our public funding.json file current, the manifest that lets funding bodies like FLOSS/fund discover projects that need support (funding.json, 2026). While updating it this month, Claude caught an unreconciled figure in one of our own published financial reports, worth a second look before I quote it anywhere else.

## Building AI into Mautic, together

The build I'm most excited about this month wasn't one I did alone. We're launching a community initiative to bring AI capability into Mautic's core, anchored on a contributor's own work, not a blank whiteboard. José Fernandes had already shipped an open source AI Email Sections plugin and passed it through the Marketplace's security review, so I used Claude to draft the kickoff discussion around his actual architecture, a layered AI bundle built on Symfony AI that the wider community can extend safely. It follows the same async format we use for all our proposals, giving contributors in every timezone room to shape it before a line of core code gets written.

This is the shape of AI adoption I actually believe in. Not a vendor's roadmap handed down to us, but a community deciding together how the tool gets built into the product it already owns.

That same insistence on getting it right over getting it fast showed up when we launched our no tracking approach to privacy more widely. Someone challenged our claim to be leading the field, and my first drafted reply, with Claude, conceded more than it should have. When I pushed back, it went back and properly checked what other platforms' tracking controls actually do, and came back having reversed its own conclusion. We ended up dropping the one claim that couldn't be proven and defending the one that could.

## Rebooting Women of Open Source

Our Women of Open Source community has been gathering momentum, and this month we launched a refreshed website with a public speakers directory, so event organisers looking for women speakers in open source now have somewhere to find them. Both trace back to the community discovery interviews I ran last October, and the lesson I'm carrying into implementing their findings is to commit to a small number of things properly, and hold the bigger programmes until volunteers step forward to help carry them. We also started a weekly WOOS Hour and a simple wins of the month thread, small enough that they can keep going without anyone needing to be a hero to sustain them. AI's role here was in the launch itself, drafting the announcement and social posts from my notes and in my voice, for me to edit before publishing.

## Rebuilding this site in the open

This site itself is part of the month's work. Following my ordination and taking a new name, I've moved my personal site to its new home at silavapi.co.uk, from Joomla to a fast, static, privacy-respecting setup with no cookies and no trackers. I started in Claude Design with every brand resource my designer created years ago, then built it in Claude Code with accessibility checked automatically. The habit that made the biggest difference was insisting the AI interview me first, one question at a time, so it built what I actually wanted. I've written up the whole story in [Rebuilding this site in the open](/blog/rebuilding-this-site-in-the-open/), so I won't repeat it here.

## Other projects

A few smaller builds rounded out the month. I built an application with Claude that makes me sit and stand regularly through the day, the kind of small personal tool that would never have justified building from scratch before, but now takes an evening. Mautic has a large backlog of GitHub Security Advisories, so I've been building a triage tool that uses Drukbox to spin up disposable sandboxes, giving each advisory a contained environment to reproduce and verify issues safely. And a handful of smaller ones: sketching out a tiny side venture in LED conference badges built on FOSSASIA's open source Badge Magic project (FOSSASIA, 2026), writing up the story of our support chatbot for the blog, a guest piece for OpenUK on why contribution is becoming the new CV, and a personal reflection on a recent Buddhist convention.

## How the days hold together

Underneath the projects sits a set of workflows anchored in my Obsidian vault. I've integrated [Meetily](https://meetily.ai), an open source meeting note taker, so my meetings are captured without shipping the conversation to a third party. Each morning a scheduled Claude task sweeps my calendar, email and Slack and writes a prep note into the vault, then I run a short live prioritisation session with Claude, sorting tasks into Base Camp for quick wins, the Climb for steady work, and the Summit for the single hardest push of the day. The same vault feeds a live daily dashboard, built with a small deterministic script Claude runs, instead of rebuilding the page from scratch each time, since that kept losing small details.

A thank you belongs here too. Much of this experimentation has been possible because Anthropic gifted open source maintainers a six month Claude subscription, which I gratefully received.

## Over to you

I'm curious about the threads running through your own work at the moment. What would you notice if you stepped back and looked at your month as a whole? I'd love to hear about it, and if any of the above sparked something, whether that's Mautic's sustainability work, the new AI initiative, or the Women of Open Source community, all three doors are wide open.

## References

funding.json (2026) *funding.json, an open manifest schema for open source projects*. Available at https://fundingjson.org/ (Accessed 13 August 2026).

FOSSASIA (2026) *Badge Magic documentation*. Available at https://badgemagic.fossasia.org (Accessed 13 August 2026).

Mautic (2026a) *Nominations are open for the 2026 Mautic Awards*. Available at https://mautic.org/blog/nominations-are-open-for-the-2026-mautic-awards/ (Accessed 13 August 2026).

Meetily (2026) *Meetily, open source meeting note taker*. Available at https://meetily.ai (Accessed 10 August 2026).

Sīlavāpi (2026) *Rebuilding this site in the open*. Available at https://silavapi.co.uk/blog/rebuilding-this-site-in-the-open/ (Accessed 10 August 2026).
