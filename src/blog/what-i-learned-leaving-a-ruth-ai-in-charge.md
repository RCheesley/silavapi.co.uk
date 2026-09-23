---
title: 'What I learned leaving a Ruth AI in charge'
date: 2026-09-23
category: 'AI'
tags:
  - 'Mautic'
  - 'AI'
  - 'Leadership'
  - 'Documentation'
excerpt: 'Before my three-month ordination retreat I built a Ruth AI so our Mautic team could keep going without me. The AI turned out to be the smaller part of the story.'
image: '/assets/img/blog/2026/what-i-learned-leaving-a-ruth-ai-in-charge.png'
imageAlt: 'The Sīlavāpi lotus mark above the words Ruth AI on a deep aubergine banner, with the strapline Using AI for business continuity.'
imageCaption: 'Using AI for business continuity'
---

In November last year I sent a slightly nervous message to our Mautic leadership team and Council. I was going to be away for three months in 2026, on retreat to be ordained, and I wanted to leave them something that could answer the questions that usually land with me. So I built a 'Ruth AI'.

It was an idea I heard in passing in the [Exit Five podcast](https://exitfive.com/podcast/), to create an AI preset that knew everything about you to deputise in your absence. The concept was that this would be the first place for the leadership team and council to look, and to take some of the weight off the people who were generously covering my work while I was offline.

Now I'm back and have had time to look through what happened while I was away, I want to share how I set it up, what worked, what didn't, and the lessons learned.

## Why I needed it

Most of what a Project Lead does in an open source community isn't written in a job description. It's the accumulated knowledge of who decides what, which form goes where, how we pay expenses, which account a bill is paid from, and what 'on brand' sounds like for a Mautic blog post.

When one person holds a lot of that, a long absence becomes a risk for the whole community. I had three months where I would be completely unreachable, and I didn't want our volunteers and small team to spend that time guessing. I also had almost a year's notice - so I had the time to set this up. I'd suggest this is useful to have running alongside you day to day - you never know when you might need it, and actually it stopped a whole bunch of questions coming my way while we were trialling and refining it, as people found the answer themselves.

## How I set it up

The tool itself was simple. Ruth AI was a custom Gem in Google Gemini, which is a saved set of instructions plus uploaded reference files that others can use. Gems can be shared with other people in the same way you would share a document, so I shared it with the leadership team, the Council, and the two people most likely to need it day to day - my EA and my direct report.

The instructions described how I think and write. Our values around digital sovereignty and transparency, how our governance works, what our house style is, and how I would approach responding to a tricky email. By the time I left it had around ten files attached and a very long prompt.

The context behind it was where the real work happened, and it came from three places.

The first was my own AI chat history. I exported all of my AI conversations that were relevant to my work, and used them as context, because years of me thinking out loud, drafting replies and working through problems turned out to be a pretty good record of how I reason and what I know.

The second was a private Obsidian vault I created for our leadership team. I had started this half-heartedly a while back, but in the 12 months leading up to me departing I made sure to document in detail every single step I took. It also held everyone I work with, how to reach them, who they are and what kind of things they do for Mautic, so the team would know who to turn to for what. We created a shared Google Sheet of all the daily, weekly, monthly and quarterly tasks that I did and those were assigned out to specific named people, so that Ruth AI knew who was taking care of what.

In the weeks before I left I reorganised the vault so every note sat in one folder, which meant I could export the whole thing as a PDF using the [Better Export PDF](https://github.com/l1xnan/obsidian-better-export-pdf) plugin and upload it to the Gem. Every time someone asked me a question when the answer couldn't already be found via Ruth AI, I wrote it up in the vault and refreshed the upload.

The third was everything we already publish. Our documentation, the Community Handbook and our other web resources were all part of its context, so it could point people to the public source as well as the internal one.

I also asked it to do one job I care a lot about (as anyone who has written for Mautic will know!), which was critiquing content for our website. It would review a draft the way I would, catching spelling and grammar, checking tone, and if someone had left an obvious AI-ism in the text it would gently roast them with a meme gif. That last part was just my fun way of introducing a bit of spice into the mix!

## What worked

The team used it. Looking back through our Slack, I can see people asking it where to send a bill, which email address to use for our fiscal host, how to reply to a prospective user asking about Mautic for small businesses, and how translation review works. One person noted that it was "very busy today", which made me smile when I read it on my return in July.

It was especially helpful for newer team members. Someone who doesn't yet know who to ask, or who feels awkward asking a 'basic' question, could ask Ruth AI first without worrying about taking up anyone's time.

It also helped with drafting. When a first draft came back with feedback sounding like me, people had something to react to and work with, and a lot of the value was in the conversation that followed rather than the draft itself.

## What didn't work

It wasn't perfect, of course!

When the documentation had a gap, the AI tried its best to fill it with something plausible. A contributor looking for our release documentation was confidently directed to a folder that didn't exist, then to three more alternative folders that also didn't exist. Another person testing it before I left found that it had invented how two of our services were being paid for. It sounded exactly like me, which made the wrong answers more convincing, not less.

Some questions it simply couldn't answer because the knowledge was never written down, or it was specific to one person's account setup. In those cases it gave back answers people had already tried. And early on, a couple of people hit technical errors about missing files that I had to untangle.

The pattern was consistent. Ruth AI was exactly as good as the documentation behind it, and the effort that was put into setting it up for success.

## Lessons learned

Earlier this month I was at a board meeting for another charity I support, and we were talking about continuity planning. I found myself explaining that the AI was helpful, but the thing that really made the difference was the documenting.

Preparing for three months away forced me to write down what I do weekly, monthly and annually, and how. It was a good audit. There were plenty of moments where I asked myself why on earth I was still doing a particular task. Some habits were clearly depleting, and I could let them go. This work led me to realise how under-prepared many of us are for succession planning, and to create a side project at [beyondthebusfactor.org](https://beyondthebusfactor.org).

That documentation that I wrote as part of this exercise is still there now I'm back. It lives in a vault our leadership team owns, as plain text markdown files that we can read, improve and take anywhere, and several people have already added to it. The Gem is one way to query it, but the knowledge itself belongs to the team, not to a tool or to me - it's Mautic's guide to how Mautic runs.

This connects to something I keep coming back to about AI. I think we get the most from it when we use it to help people find where knowledge lives, while the knowledge itself stays written down, owned by us and understood by humans. It's the same principle behind the digital sovereignty work at the heart of Mautic, applied to how we hold what we know together.

## If you're planning something similar

A few things I would do again, or differently.

- Start early. I shared it about four months before I left, which gave people time to try it and tell me where it fell short.
- Make sure that the tooling you're using is set to **not** train on your data before sharing resources with it.
- Treat every question as a documentation gap. If someone had to ask a human, write the answer down and feed it back in.
- Keep the knowledge in plain text you own, like an Obsidian vault and ideally version controlled, so you're not locked into one proprietary provider and can export it and use it in whichever tool you use.
- Your own AI chat history is a surprisingly rich source of context, but read what you're sharing first. Redact anything you don't want to be exposed!
- Keep people's contact details (other than the basics) and anything sensitive in a private space for the people who need it, separate from what you publish.
- Tell people plainly that it can be confidently wrong, and to check anything that involves money, access or decisions with a human.
- Make sure there are named humans who are taking on the tasks when you are away. Ours was the Council, and they did a wonderful job.

## Over to you

I'm curious how others handle long absences, whether that's a sabbatical, parental leave or simply a much needed break. Have you tried something like this, and what did you learn about the knowledge that only lived in one person's head? Do you think this might help you to prepare for the more long term transition planning if the worst were to happen?

## References

Google *Use Gems in Gemini Apps*. Available at https://support.google.com/gemini/answer/15146780 (Accessed 23 September 2026).

Google Workspace Updates (2025) *Introducing Gems sharing in the Gemini app, including admin controls*. Available at https://workspaceupdates.googleblog.com/2025/09/gem-sharing-gemini-app-workspace.html (Accessed 23 September 2026).

Mautic *Mautic Community Handbook*. Available at https://contribute.mautic.org/ (Accessed 23 September 2026).
