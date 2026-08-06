---
title: 'Automating new contributor swag with Mautic, n8n and Sticker Space'
date: 2023-04-04
category: 'Community'
image: '/assets/img/blog/Stickerspace/mautic-stickers.png'
imageAlt: 'Photo of Mautic stickers in a star shape'
excerpt: 'Saying thank you is a great way to recognise and appreciate the time people have spent making a contribution to an open source project, but how do you…'
sourceUrl: '/blog/community-management/automating-new-contributor-swag-with-mautic-n8n-and-sticker-space'
---

Saying thank you is a great way to recognise and appreciate the time people have spent making a contribution to an open source project, but how do you actually do it?

About a year ago we started the Year of the Contributor initiative in the Mautic community, focusing on improving the experiences for both new and existing contributors.

One thing we wanted to do was to send some stickers out to people who made their first contribution to Mautic, and naturally we wanted to automate as much of the process as we could. Here’s how I did this using [Savannah CRM](https://www.savannahhq.com/), [Mautic](https://www.mautic.org), [n8n](https://n8n.io) and [Sticker Space](https://sticker.space).

## Identifying new contributions

Savannah CRM picks up contributions from across the many channels that we monitor. We can use this as a trigger for n8n in two ways - one by exporting the list of new contributors into a Google Sheet at regular intervals, or two, by using the new Webhooks functionality. I currently use the former, but am trialling the latter.

Next, we filter the results with n8n [if nodes](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/) to determine if the date of the first contribution was within a specified timeline - in our case 90 days - and whether we have an email address for the person. 

💡Some channels pass the email address but others do not, therefore it can take a while until we have a way to contact the person (for example if they engage in another channel). This is why we have the 90 day window.

## Have they already claimed some stickers?

If we do have a valid email address for the contributor, the next step is to check if they have already been sent their stickers. We do this by querying Mautic (with the [http request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest) node) to find whether they are already a member of the sticker swag claim segment.

If they have not already received their stickers, we then make a request to Sticker Space via the [API](https://sticker.space/developers) to generate a unique link for the contributor to claim their stickers. This is returned and stored into a custom field in Mautic, and the user is added to the Sticker Swag Claim segment

Now we need to tell the contributor the good news!

## Sending the contributor their unique code

In Mautic we have a campaign which sends out an email to folks in this segment, providing them with their unique link (via a token which is replaced by the custom field value) and inviting them to claim their sticker pack.

We have this email translated in multiple languages, so if they are already in our systems (for example by downloading Mautic from the website or signing up to our newsletter at some point in the past, which is often the case) and we know a preferred language which we have a translation for, that one will automatically be sent.

The user then clicks on the link and provides a delivery address to Sticker Space who will then print and despatch the stickers around the world.

The Sticker Space administrator has to approve the sticker requests, so we do have a manual step in place mainly to prevent abuse, but so far it has not been needed.

We also then drop them into a GDPR consent workflow, explaining that we gained the email address through their contribution, but if they would like to continue to hear from us they can let us know their communication preferences. If they don't do this within two weeks, we delete them from our systems.

## Next steps

This process works great for us, the next steps I would like to have include getting the webhook up and running so there’s less manual intervention required, posting back to Savannah to tell it that we sent them a gift, and also to be able to ping me to send out our exclusive sticker packs when people reach 10 contributions.

How are you automating your contributor swag process? I’d love to here, please comment below!
