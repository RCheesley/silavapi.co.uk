---
title: 'Using projects to transparently manage financial resources on Open Collective'
date: 2022-12-29
category: 'Open source'
image: '/assets/img/blog/projects-in-open-collective-cropped.png'
imageAlt: 'Screenshot of projects in Open Collective'
excerpt: 'Often as an Open Source project grows there becomes a need to allocate funding resources to specific projects, teams or initiatives. It can be challenging…'
sourceUrl: '/blog/open-source/using-projects-to-transparently-manage-financial-resources-on-open-collective'
---

Often as an Open Source project grows there becomes a need to allocate funding resources to specific projects, teams or initiatives. It can be challenging to do this in an open and transparent way, effectively ring fencing the funds for specific purposes.

Here’s how we achieved this with Open Collective, some of the gotchas we encountered, and how it’s working out for us.

Within the Mautic Project, when we established our governance model it was decided that we would have five core teams - Community, Education, Legal & Finance, Marketing and Product.

Over time, expenses have arisen across most of these teams which need to be paid out of our core budget, along with Strategic Initiatives we wanted to fund and working groups who were focusing on specific projects.

In 2021 we created a community-wide budget to forecast our income and plan our expenditure across the whole project.

We decided that it would be good practice to separate off the funds that we have allocated for specific things within the community - both so that we know we have the funds in one place and can track how we are doing against our budget, and also because in some cases we wanted to allow people in the community to financially contribute to specific projects.

## Using Projects in Open Collective

[Projects](https://docs.opencollective.com/help/collectives/projects) were rolled out by Open Collective in 2022, which were a great help in this regard.

A project on Open Collective is a bit like having a separate bank account - they are: 

> “a lightweight way for collectives to manage budgets for initiatives independent of their parent collectives.”

Within the Mautic collective we created a project for each team, working group or initiative that needed to hold funds, and when the budget was finalised we transferred the balance to each project.

![A screenshot of projects in Open Collective](/assets/img/projects-in-open-collective.png)

This allows us to ring-fence the funds as described, and also to make payments and receive donations associated with each project, team or working group.

An example below shows the transactions from the Marketplace Initiative.![A screenshot of the Marketplace project transactions](/assets/img/transactions-marketplace.png)

You can also use the features like setting a goal for the project, or having the facility to send updates to everybody who has supported that project. It’s also possible to change the visual appearance of each project as well, if you wanted to have a particular colour scheme for example, and to fire [webhooks](https://docs.opencollective.com/help/collectives/collective-settings/integrations#webhooks-generic-slack-discord) when actions happen (for example to pipe a notification into the right channel to inform the team about a transaction).

More recently came the availability of [Virtual Cards](https://docs.opencollective.com/help/expenses-and-getting-paid/virtual-cards) at a project level, which allowed us to make sure that any regular payments were going straight out of the relevant project. For anything that did not allow us to use a card, we could raise an invoice (for example paying contractors) or a reimbursement request (for example when reimbursing travel expenses).

You can also turn on the new budget user interface which gives a nice report of the activity in your project broken down by tags and by one-time or recurring donations. Make sure you tag everything so that it’s properly allocated, and use a tagging strategy that is consistent with your main collective.

![Screenshot of budget section for a project](/assets/img/project-budget.png)

### Using tiers to fund specific things within a project

Within projects, it’s possible to create contribution tiers just like you can do on a main collective. This allows different levels of support, which we are currently planning to use in one of our projects to allow us to fund specific projects in our general RFP fund.

![Screenshot of tiers within a project, allowing funding at different levels.](/assets/img/screenshot-of-tiers-in-project.png)

This can work really well if you want to provide people with a link to support at a specific tier or price point.

## Gotchas to be aware of

### Financial reporting

If you are expecting to be able to see a high level report of what money you are holding where - for example seeing what balances are in each project - you can’t currently do that. I’ve reported it on the GitHub issue [here](https://github.com/opencollective/opencollective/issues/5967#issuecomment-1340690078) - currently it’s a bit of a manual process.

Also, sometimes it’s a bit challenging to get a rolled up review of the financial status of your collective. Although the new budget user interface update has vastly improved the situation, it’s still mostly focused on the main collective and not projects.

### Using tags to organise expenses

I highly recommend that you use tags across your collective in a consistent way, as this really helps to improve the budget overview, but it’s not made easy for you by Open Collective currently.

Tags used in the main collective aren’t reproduced in projects or events (probably with good reasoning), so you have to create them anew to use them in your projects. I expect in the future that you may be able to see and filter expenses in projects as well as in the main collective from the budget on the main collective, so it’s best to plan for that, and be consistent from the start!

### Team members

Team members are controlled at the collective level, and it’s an all or nothing basis. 

You either have access to admin the entire collective and hence projects, or you don’t. There’s no possibility to add someone as an administrator of a specific project.

There is an [open feature request](https://github.com/opencollective/opencollective/issues/4611) accepting bounties so I am hopeful that it might possibly be implemented in the future, which would give a lot more flexibility for teams to manage their own budget and approve expenses.

## Conclusion

Overall, the projects feature of Open Collective has been a great way to organise our finances and provide transparency to the community. There are a few areas where things could be improved but on the whole, it’s a really helpful tool for budgeting and planning!
