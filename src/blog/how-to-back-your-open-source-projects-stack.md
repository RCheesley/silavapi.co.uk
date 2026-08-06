---
title: 'How to back your open source project''s stack'
date: 2022-01-20
category: 'Open source'
image: '/assets/img/blog/plant-in-hands-give-to-the-world-2021-08-30-20-35-25-utc.jpg'
imageAlt: 'Photo of a person''s hands cupped together holding some soil with a seedling growing strongly towards bright sunshine'
imageCaption: 'Image by Johnstocker on Envato'
excerpt: 'Identify your open source project''s dependencies through the Back Your Stack initiative and consider one of the many creative ways to show support…'
sourceUrl: '/blog/open-source/how-to-back-your-open-source-projects-stack'
---

On [GivingTuesday](https://en.wikipedia.org/wiki/GivingTuesday), the Mautic project—an open source marketing automation platform—shared its intention to allocate part of its budget each year to [financially support the other open source projects on which it depends](https://www.mautic.org/blog/community/giving-tuesday-mautic-backs-their-stack-support-open-source-projects-they-depend), as part of the _Back Your Stack_ initiative.

## What is Back Your Stack?

What is Back Your Stack, and why should open source projects follow Mautic's lead?

Sustainability is a huge challenge in open source.

We've seen several cases in recent years where critical tools which are literally keeping the internet and the world of technology running are being maintained by a very small number of people, at times as a hobby rather than their full-time occupation. Sometimes this only comes to light when those people decide that enough is enough and either stop maintaining it or sell/transfer it to another organisation to support.

[Tidelift](https://opensource.com/article/21/3/open-source-maintainer-survey) recently reported that [46% of open source maintainers are not paid](https://tidelift.com/about/press-releases/survey-finds-many-open-source-maintainers-are-stressed-out-and-underpaid-but-persist-so-they-can-make-a-positive-impact). Only 26% earn more than $1,000 from their maintenance work. The same survey also reported that around half felt demotivated, stressed, and undervalued because there was no recognition for the "thankless work" involved in maintaining these projects.

While some projects and maintainers may genuinely not want to receive any funds for their work, the vast majority have various channels through which they can be compensated, whether it be the cost of a coffee or a more substantial donation, once or on a regular basis.

The finger is often pointed at the end-users of software and there is pressure on them to fund open source projects directly. However, once an open source project has any significant budget, I believe it is the project's responsibility to support those on whom it relies—its dependencies.

Without dependencies, open source projects would not be able to do all the awesome things that they do. Even if every open source project with an annual budget of over $50,000 per year decided to support their top ten dependencies at a relatively low amount of $200, I am sure that the maintainers would find a massive benefit in the support, if only in terms of a morale boost for being appreciated!

## Identify dependencies with open source tools

There are some great tools out there to help you identify the projects on which you depend.

First, if you're a composer-based project, you can use the command below to get a list of all the dependencies actively seeking funding (this uses the [funding markup](https://getcomposer.org/doc/04-schema.md#funding) in the composer.json, so if you're a project seeking funding, make sure you add it!).

`$ composer fund`

You can also use [backyourstack.com](https://backyourstack.com/) to identify dependencies through your GitHub organisation or upload a dependency file—they support package.json, composer.json, \*.csproj, packages.config, Gopkg.lock, Gemfile.lock, and requirements.txt files.

This gives you a list of projects on Open Collective and a useful list of all your dependencies that you can then use to research funding opportunities.

## How much should I contribute?

How much you contribute depends on your budget and how much money you have available outside of your "must cover" expenses.

Personally, I would like Mautic to be at 10% so that we could support all of our dependencies at a basic level, but we haven't got the financial stability just yet to reach that. For now, we're allocating 4% of our budget to support the top 10 projects as prioritized by our community—it's not much, but it's a starting point.

## But I don't have the money!

I hear you. It's tough to get to a point where you have enough funds available to support your dependencies, so what about getting creative about how you support them?

-   Organise a documentation swarm, where you bring some of your contributors to improve the documentation for one of your dependencies in a _giving back_ initiative.
-   Give a project feedback, and help them improve the contributor experience by sharing what's worked well for your project or where you find things difficult with their project.
-   Allow a developer on your team to work on a dependency project for some portion of each week.
-   Find a project on [github.com/opensourcedesign](https://github.com/opensourcedesign/jobs/tree/master/jobs) and assign a designer on your team to help out.

In the survey from Tidelift, 90% of maintainers suggested that the primary non-financial ways they are looking for help are improving documentation and improving the experience for new users and contributors.

What about donating a percentage of the ticket sales from your next conference or event towards supporting your dependencies, or adding it as a power-up for your community members to pay more in order to support your dependencies?

There are many creative ways to collectively help open source projects become more sustainable, through which we all grow stronger.

Are you backing your stack currently? What ideas do you have for backing your stack? If you're a maintainer, what are your thoughts on the most helpful way for people to support your projects if they depend on you for their own products or services?

Feel free to share in a comment below.

This article was originally shared on [opensource.com](https://opensource.com/article/22/1/back-your-stack).
