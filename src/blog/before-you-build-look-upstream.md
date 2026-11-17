---
title: 'Before you build, look upstream'
date: 2026-11-17
category: 'Open source'
tags:
  - 'AI'
  - 'Open source'
  - 'Contributing'
excerpt: 'So many shiny new AI-built side projects turn out to be things an open source project already does - here are some prompts and agent instructions to help you research first, build on what exists and contribute upstream in a way maintainers will thank you for.'
image: '/assets/img/blog/2026/before-you-build-look-upstream.png'
imageAlt: 'The Sīlavāpi lotus mark above the words Before you build, look upstream, on a deep plum banner, with the strapline Build on what already exists.'
imageCaption: 'Build on what already exists'
---

Over the last few months I've lost count of the number of times I've seen someone launch a shiny new side project, built mostly with AI over a few evenings and weekends, and announce it to the world with huge excitement. Then I click through, have a look, and realise that what they've built already exists, in its entirety, as an open source project (sometimes one that's been around for a decade, with hundreds of contributors!).

The energy and excitement are lovely to see, and building things is a fabulous way to learn. It does make me a bit sad though, because all those tokens, all those hours and all that creativity could have gone into making something that already exists even better, for everyone who uses it.

So in this post I want to share what I've learned about doing the research before you start building, how to teach your AI agent to look upstream first, and how to contribute to an existing project in a way that makes maintainers' lives easier.

## Why this keeps happening

It's never been easier to go from idea to working prototype. You describe what you want, your AI tool of choice starts writing code, and a couple of hours later you have something that runs. That's pretty magical!

The catch is that most AI coding tools will happily build whatever you ask for. Unless you ask, they won't stop and say "hang on, have you seen that there's an open source project that does exactly this, and it's had 15 years of bug fixes?". They're optimised to do the task in front of them, and the task you gave them was 'build this'.

There's also a bit of a buzz in building something that's ours. I get it, I really do (I've got a folder of half-finished side projects of my own!). In my experience though, the projects that last are almost never the ones built alone. They're the ones with a community around them, sharing the load of maintenance, security fixes, documentation and support.

## Do the research before you write a line of code

The good news is that the same AI tools that can build your project in an afternoon can also do a really solid first pass of research in about ten minutes. You just have to ask them to, before they start building.

Here are some prompts I've found work well. Feel free to copy and adapt them.

### Find what already exists

```text {.prompt}
I'm thinking about building [describe the tool in two or three sentences - who it's for, what problem it solves, and the main features].

Before we write any code, search the web, GitHub, GitLab and any relevant package registries for existing open source projects that already do this, or most of it.

For each one you find, tell me the licence, when it was last updated, roughly how many people contribute, and how it compares with my idea. Link to the repository and the documentation.

If you can't find something or aren't sure, say so. Don't guess.
```

### Work out the gap

Once you have a shortlist, the next step is to be clear about what's missing.

```text {.prompt}
Take the top three projects from that list. For each one, compare it feature by feature with what I described.

Group the differences into three buckets - things it already does, things it could do with configuration, a plugin or an extension, and things it doesn't do at all.

Then tell me which project is the closest fit and why.
```

More often than not, this is the moment you discover that the 'gap' is one or two features, and the other 90% of what you were going to build is already there, tested and maintained by someone else. Hurrah, you just saved yourself months of work!

### Check whether the project would welcome your idea

This is the step most people skip, and it's the one that saves the most heartache.

```text {.prompt}
For [project name], read the README, CONTRIBUTING file, code of conduct, any AI or LLM contribution policy, the roadmap if there is one, and recent issues, discussions and pull requests.

Tell me whether the feature I want has been requested or discussed before, and what maintainers said about it. Tell me whether the project has a process for proposing new features, how it prefers contributions to be made, and whether it accepts AI-assisted contributions and on what terms.

Finally, tell me whether this feature looks like something that belongs in the core project, or something better built as a plugin, extension or separate tool that integrates with it.
```

Pay real attention to that last question. Not every idea belongs in core, and that's absolutely fine. Many projects have a plugin or extension system precisely so that people can build the bits that matter to them without every feature landing on the maintainers' plate forever.

## When an existing project doesn't quite do what you need

This is where I'd love more of us to pause. If a project does most of what you need but not quite all of it, building something new from scratch is usually the most expensive option, for you and for the wider ecosystem. Contributing upstream (sending your improvement back to the original project so everyone benefits) or building on top of it is almost always a better use of your time.

The Open Source Guides from GitHub have a great section on this, and the advice that I most appreciate as a maintainer is to open an issue (or make a post wherever the project accepts feature requests/ideas/proposals) and ask before working on anything substantial, and to read the CONTRIBUTING file before you open an issue or a pull request. It sounds obvious, but you'd be amazed how often it doesn't happen.

### How we do this in Mautic

In Mautic we ask anyone who wants to propose a new feature to start by looking at our roadmap and the Ideas and Feature Requests category on our community forums, so that the idea can be discussed before anyone starts coding. Bigger pull requests that add new features affecting Mautic users should link back to a forum thread where that discussion has happened among marketers and integrators who use the product, as well as developers.

I promise we're not trying to put obstacles in anyone's way! Having that conversation first is how we make sure that a feature fits where the product is going, that someone isn't already working on the same thing, and that the community will be able to maintain it long after the person who wrote it has moved on. It also means you get feedback from people who've been living with the codebase or the product itself for years, which can save you from some nasty gotchas.

If something doesn't belong in core, Mautic also has a plugin system so you can extend it without changing the core code, and our developer documentation covers how to build plugins and themes and integrate other tools through the API. Several of our most loved features started life as plugins.

## Teaching your AI agent to look upstream first

You don't have to remember to do all of this research every time - you can teach your AI agent to prefer building on what already exists.

Most AI coding tools read a file of standing instructions from your project or your home folder (Claude Code uses CLAUDE.md, and many tools now support AGENTS.md, an open format described as a README for agents). Whatever goes in that file gets read at the start of every session, so it's the perfect place to set your agent's default behaviour.

Here's a section you can drop into yours. Tweak it as needed.

```text {.prompt}
## Build on what already exists

- Before starting any new project or significant feature, search for existing open source projects that solve the same problem, and share what you find with me before writing any code.
- If an existing project covers most of what I need, recommend contributing to it, or building a plugin or extension on top of it, before suggesting we build from scratch.
- Before proposing any change to an upstream project, read its README, CONTRIBUTING file, code of conduct, AI contribution policy, roadmap, and recent issues and pull requests. Summarise what they say about the kind of change I want to make.
- If the project has a process for proposing features (a forum, a discussions board, an RFC process), help me draft a proposal there first. Don't start on code until a maintainer has responded positively.
- Follow the upstream project's own AGENTS.md or contributor instructions if it has them, and its rules on disclosing AI use.
- Never open an issue, pull request or comment on someone else's project without my review and explicit approval.
- Keep changes small and focused on one thing, and include the tests and documentation the project expects.
- If a maintainer says no, or not now, accept it. Suggest building the feature as an extension or keeping it in our own fork.
```

That second to last line matters a lot, and I'll come back to it in a moment.

## Contributing with your AI tool, respectfully

Once you've done the research, found the right project and had a positive response to your idea, AI tools can be super helpful for the contribution itself. They can help you get the project running locally, find your way around an unfamiliar codebase, write tests and draft documentation.

The thing to keep in mind is that every pull request you send lands on a person's desk, and often that person is a volunteer. Tidelift's maintainer survey found that almost 60% of maintainers had quit or considered quitting maintaining a project, with burnout as one of the most common reasons (Grams, 2023). Anything that creates more work for them makes that worse.

We've had some pretty stark examples of what happens when AI contributions go wrong. The curl project found that around 20% of its security reports in 2025 were AI-generated slop (The Register, 2025), and in January 2026 it ended its bug bounty programme because the team was overwhelmed (The New Stack, 2026). In February a Matplotlib maintainer closed a pull request from an autonomous AI agent, and the agent responded by publishing a blog post attacking him personally (Claburn, 2026). Gosh!

It's not all doom and gloom, though. By April this year Daniel Stenberg was reporting that the slop had pretty much stopped, and that curl was now getting more high quality security reports than ever, almost all of them made with the help of AI (Stenberg, 2026). AI in the hands of someone who checks their work and understands what they're submitting can be a wonderful thing for open source.

So here are my top tips for contributing with AI in a way maintainers will thank you for.

- **Read and follow the project's AI policy.** More and more projects have one. Ghostty, for example, asks contributors to disclose any AI use and the tools they used, and says that if you can't explain what your changes do without the help of AI, you shouldn't be submitting them. Melissa Weber Mendonça keeps a handy list of AI policies from lots of different projects if you want to see how others approach it.
- **Disclose that you used AI.** Even if the project doesn't ask, a line in your pull request saying which tool you used and for what helps the reviewer know where to look.
- **Understand every line you submit.** If a reviewer asks why you did something, answer in your own words. Pasting their question into your AI tool and pasting the answer back is a fast way to lose their goodwill.
- **Keep it small.** A focused pull request that does one thing is far easier to review than a 3,000 line monster that 'also tidied up a few things while I was there'.
- **Run the tests, follow the coding standards and fill in the templates.** Ask your agent to check the project's checklist before you submit, every time.
- **Be patient.** Maintainers have lives, jobs and other priorities. A polite nudge after a week or two is fine, a daily ping is not.
- **Accept a no gracefully.** Projects get to decide what they include. If it's a no, thank them for their time, and build it as an extension or keep it in your fork.

## A little note on generosity

In my Buddhist practice we talk a lot about dāna, which is the practice of generosity, giving freely without expecting anything back. I've come to see contributing upstream as a form of dāna. When you improve a project that already exists, you're giving something to every single person who uses it, most of whom you'll never meet.

Building yet another tool that does the same thing as an existing one (and then possibly abandoning it a few months later when the excitement wears off!) tends to scatter effort. Contributing upstream gathers it together, and over time, that's what makes open source sustainable.

## Over to you

I'm curious - have you ever discovered, halfway through building something, that it already existed as an open source project? What did you do next? I'd also love to hear what you've put in your own agent instructions to help it play nicely with open source projects, so do share!

## References

Claburn, T. (2026) *AI bot seemingly shames developer for rejected pull request*. The Register, 12 February. Available at https://www.theregister.com/2026/02/12/ai_bot_developer_rejected_pull_request/ (Accessed 17 November 2026).

Ghostty *AI usage policy*. Available at https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md (Accessed 17 November 2026).

GitHub *How to contribute to open source*. Open Source Guides. Available at https://opensource.guide/how-to-contribute/ (Accessed 17 November 2026).

Grams, C. (2023) *Maintainer burnout is real. Almost 60% of maintainers have quit or considered quitting maintaining one of their projects*. Tidelift. Available at https://dev.to/tidelift/maintainer-burnout-is-real-almost-60-of-maintainers-have-quit-or-considered-quitting-maintaining-one-of-their-projects-51ma (Accessed 17 November 2026).

Stenberg, D. (2026) *High quality chaos*. 22 April. Available at https://daniel.haxx.se/blog/2026/04/22/high-quality-chaos/ (Accessed 17 November 2026).

The New Stack (2026) *cURL's Daniel Stenberg: AI slop is DDoSing open source*. 15 February. Available at https://thenewstack.io/curls-daniel-stenberg-ai-is-ddosing-open-source-and-fixing-its-bugs/ (Accessed 17 November 2026).

The Register (2025) *Curl creator mulls nixing bug bounty awards to stop AI slop*. 15 July. Available at https://www.theregister.com/2025/07/15/curl_creator_mulls_nixing_bug/ (Accessed 17 November 2026).

Weber Mendonça, M. *Open source AI contribution policies*. Available at https://github.com/melissawm/open-source-ai-contribution-policies (Accessed 17 November 2026).
