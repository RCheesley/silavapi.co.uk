---
title: 'Organising digital events in the Mautic Community'
date: 2021-10-30
category: 'Mautic'
image: '/assets/img/joomlart/article/ba1b7eb9b8ad142948e3b9dce300b4c6.jpg'
imageAlt: 'Our photobooth at MautiCon 2020'
imageCaption: 'Our photobooth at MautiCon 2020'
excerpt: 'Rewind just over two years and we were about to organise our first ever Mautic World Conference - MautiCon for short - at Acquia''s head office in Boston…'
sourceUrl: '/blog/mautic/organising-digital-events-in-the-mautic-community'
---

Rewind just over two years and we were about to organise our first ever Mautic World Conference - MautiCon for short - at Acquia's head office in Boston.  Then came the global pandemic, and two years of varying lockdown levels, forcing many communities to pivot unexpectedly from the in-person events which are the lifeblood of an Open Source community to finding a way to digitise these events.

In the Mautic community, we had never organised an in-person event, let alone a digital event, so it was definitely breaking new ground!

Having now run two successful events, I have promised several folks to write up how we did it....so herewith the long overdue writeup!

## Collaboration

From the start, we decided to keep everything we did - from recordings of calls to notes, research, contracts, marketing comms and design files - in a shared Google Drive folder. This meant that we could always find the information we needed, and made it simple to create the next event because all the information from the previous year was easily accessible.  We met fortnightly until around two months before the event when we switched to weekly meetings.

We used a Jira project to work in two-weekly sprints, identifying tasks that needed to be done and assigning them to people in our working groups. This had varying success, as sometimes we would forget to update the board or would end up working on things which weren't on the Jira board....it takes discipline to keep things moving forward effectively!

## Design

As a team of folks distributed around the world, we needed to find a way to work on the design elements for our events collaboratively, and using a tool which was simple to understand for non-designers. We settled on using [Canva](https://canva.com) and sharing any elements which needed to be created outside of Canva in our Google Drive folder. This allowed us to quickly remix projects that someone else had used, and to create images using the appropriate sizes for the different social networks.

## Call for speakers

We had several discussions about the call for speakers process and what tools to use, but ultimately we decided to go with a commercial tool because it provided so many features that would reduce our workload and improve the experience for speakers and attendees.

[Sessionize](https://www.sessionize.com) is a well-known and respected platform for managing Call for Papers, and also allows you to manage the schedule, embed the schedule/speakers in your website, and provides a PWA mobile application.  Free / low budget community events can also apply for a community license which gives a 50% discount.

The value this brought to our events far exceeded the cost of the tool!

For both events, we managed the CFP through Sessionize, and used their web embeds to display speakers, schedules and filtered lists of tracks.

The mobile application was also extremely helpful during the event - it allowed you to see what was happening in your own timezone, see where you were in the schedule at that point in time, and during the second event we were able to provide direct links into the specific room where a session was happening so that attendees could jump straight into the room.

Far and away the biggest plus side for me was that we didn't have to duplicate the work of creating the schedule and speakers on our website. Sessionize was the single source of truth, and we used that for any changes to the lineup or the schedule, which was immediately reproduced on our website.

## Platform

Probably the most important thing to consider when organising a digital event is the platform that you're going to use for the event.  Early on in the lockdown I also had to find a way to pivot East Anglia's largest B2B exhibition, the [Anglia Business Exhibition](https://angliabusinessexhibition.com), to a simple showcase event in a digital format with only a month's notice. 

For that event, the primary requirement was providing pre-recorded and live sessions which people could watch, but there wasn't really a need for much more than that. For this purpose, [HeySummit](https://heysummit.com/?ac=VvvZfkOb) was perfect (in the years since they have added a whole load more features, and it's still a pretty awesome platform to use!)

For Mautic, however, we wanted to offer a much more community-based event with the opportunity for 121 and group networking, and we also needed to be able to give our sponsors a way to engage with attendees.  Another plus was if there was an open source angle - for example an open source version of the software and/or a company which supported open source.

Our research led us to discovering [Veertly](https://www.veertly.com), which provided an [open source](https://github.com/veertly) and hosted event platform.  It ticked pretty much all of our boxes, except for being able to sell event tickets through the platform and a lack of room-specific chat.  We also considered [Remo](https://remo.co/) and [Airmeet](https://www.airmeet.com/hub/conference-summit/), but aside from the lack of open source roots, they also weren't quite at the level we needed when it came to features - both have evolved over the last couple of years so are well worth checking out.  We also checked out the popular [Hopin](https://hopin.com) platform but the pricing was far too high for what we could afford at the time for the events we were organising.

## Ticketing

At this point, we had no financial autonomy as a community at all - everything was funded through Acquia.  In order for us to run an event like Mautic Conference Global, we really needed to have our own financial systems which were transparent to the community and enabled us to manage our own budget.

### Open Collective

At this point we discovered [Open Collective](https://opencollective.com), which also had the facility for collectives to host events as fundraisers. I won't go into Open Collective in this post - more on that in another post - but suffice it to say this worked really well for us.

Another great bonus for us was being able to offer the tickets on a 'give what you can' basis. As a Buddhist, dana (generosity) is one of my central principles and I also am well aware that for many, high event fees prevent people from attending events - we wanted our global events to be accessible to the widest possible audience. For this reason we decided to set the minimum ticket price at $5 (with an option for people to contact us for a free ticket if the cost was a problem) and allow people to make their own decision about how much they paid, with a recommended ticket price of $20. Open Collective allowed us to do this, which was a great bonus and much appreciated by our attendees.

We also offered various sponsorship tiers which were managed through the same interface, so the money came straight into our Open Collective account (minus the fees charged to use the platform).

#### Pros of using Open Collective

The plus side of using Open Collective is that all of the transactions are shown publicly for all to see. Personal information (for example individual invoices or bank account information) is redacted from public view and only accessible by administrators, but the bulk of the information can be accessed by anybody.

This greatly improves trust, and also holds the event team accountable for the spending of their budget. No more having to produce laborious reports at the end of the event - everything is there for all to see.

The balance is also transferrable back to the main Collective once the event is finished, with the funds being instantly available after transfer.

#### Cons of using Open Collective

The big down side of using Open Collective was the lack of customisation of the ticketing form. 

Individuals and organisations can purchase one ticket for $100, or 10 tickets for $10, but only one contact point is provided. Also, with organisations, the contact point was often not the person/s who were going to be using the ticket.  It also wasn't possible to get the email address of organisations purchasing tickets via the API at all.

This was problematic for several reasons:

-   With a digital event we needed to create an individual access link for each person to attend
-   We needed to push these users into our email communication processes
-   We needed to send each person a swag coupon as part of their event swag
-   With people buying multiple tickets in one transaction we didn't know how many tickets were being purchased

In the first year of running the event, this resulted in a somewhat comical process of having to manually export from the transactions list any new registrations and cross-reference them with a metabase table which the team at Open Collective made available to us in order to determine the point of contact. We then had to manually email any multiple ticket or organisation purchases and ask for the details of the people attending, and manually send them the relevant information. We also had to manually upload the list of attendees to Veertly, manually copy the attendee link, and manually email the attendees with their access link.

You can imagine the overhead this resulted in with 300+ attendees - for this reason we had to close ticket sales when the event started because we simply could not maintain this process while the event was underway.  At this point, Veertly did not have a Zapier integration, and there was little else we could do to automate any of this workflow as a result.

In our second iteration there was a small improvement - the 'private instructions' field which shows after a ticket is purchased and on the email the user received. This allowed us to push the user over to a 'ticket claim form' hosted on our new Mautic instance.  Also Veertly developed a Zapier integration. This meant that the second time, we were able to automate much of the process using Zapier.

## Live chat

During the first event, one of the main things that attendees complained about was the lack of a room-specific live chat where they could ask questions. By the time of our second event, there still wasn't a live chat functionality, so we needed to find a way to provide this.

[Dead Simple Chat](https://deadsimplechat.com/) is exactly what it says on the tin. A super lightweight and simple live chat system which can be embedded within other tools.  It also allows you to pay for an upgraded service for a month without any long term commitment, perfect for running events. Veertly has the ability to display web applications within the rooms using a simple URL-based embed system and Dead Simple Chat allowed you to embed the chat rooms with a URL. Sounds like a perfect match!

The one thing we struggled with was finding a way to identify the attendees without them needing to create an account with Dead Simple Chat - ideally they should be authenticated by their existing Veertly session. To accomplish this, the team at Veertly introduced a neat feature which allows you to push user information from the logged in session into the URL of the embedded item - in our case, first and last name. Dead Simple Chat allows us to to use the information to assume that as the identity of the user. Perfect!

We embedded a separate chat room in each Veertly room, including the sponsor booths.

The next challenge was how to moderate these rooms as they were effectively distinct rooms, and it wasn't practical for our moderators to be hopping in and out of rooms all the time.  Veertly prevents you from having the application open in more than one location, so that wasn't really an option.

To allow our moderator team to have an overview of chat across the whole platform, we created a Mautic landing page and embedded each of the chat rooms in a separate column, side by side.

This allowed the moderators to see what was happening in each of the rooms, hop in and deal with any incidents, and still be following a track within the event platform.  Sure, it was a little bit clunky, but a great improvement on the previous year's experience and on the whole, worked really well.

## Zapier

[Zapier](https://zapier.com) (and other open source alternatives like [n8n](https://n8n.io/)) are such an awesome resource if you're using tools which aren't natively connected with each other.  For the second iteration of Mautic Conference Global we made extensive use of Zapier to:

-   Push contacts from the ticket claim form (Mautic) into Veertly as a new attendee
-   Pull the access link from Veertly and push it into a custom field in Mautic so that we could send the event access email
-   Pull a Spreadshirt code from a Google Sheet into Mautic when the attendee filled in a swag claim form to specify their region for delivery
-   Push an update to the Google Sheet when the code had been emailed out to the attendee and was therefore considered redeemed
-   Push Streamyard access codes from an email inbox into Slack when our track moderators were logging in (so they didn't all need access to the inbox)

This immensely improved our workflows and resulted in a dramatic reduction in the overheads associated with the ticket sales process.

## Mautic

Of course, we had to make use of [Mautic](https://mautic.org) once we got our new instance set up and migrated over to Acquia's [Campaign Studio](https://www.acquia.com/products/marketing-cloud/campaign-studio) (a hosted instance of Mautic).

There were several ways we made use of Mautic during the second iteration of our event:

-   General event marketing
-   Providing a landing page for attendees to 'claim' the ticket (to address the shortcomings of the Open Collective ticket signup)
-   Send the email to the attendee with their access link (pulled from Veertly by Zapier and stored in a custom field)
-   Consent the attendee to receive (or not) other information from the Mautic Community
-   Send mailshots from our sponsors
-   Manage speaker communications including proactively contacting speakers who had not submitted their pre-recorded videos after the specified date
-   Provide a landing page for attendees to claim a free swag coupon (we needed to know which region they were located in to supply the correct gift card)
-   Automate the sending of gift card codes
-   Popups/info bars and modals to make the community aware of the event and encourage them to sign up for the events

## Streamyard

Veertly has a built-in [Streamyard](https://streamyard.com) integration, but only for the main stage. In our event, we were running several tracks in parallel and didn't actually use the main stage at all. We didn't want there to be one stage which was more important than others. This meant we had to use their 'rooms' facility to create our stages.

While you can have a Jitsi video call for the room, this would mean that all attendees would be able to join the call, which isn't really what you want with presentations.

We decided to use Veertly's RTMP streaming capability, and have the sessions managed from Streamyard.

As we were running up to six tracks in parallel during the event, this meant having six different RTMP streams, and six different Streamyard accounts. We accomplished this using unique email addresses on the same mailbox - [mauticon+1@mautic.org](mailto:mauticon+1@mautic.org) for track 1, and so forth, and pushing the access codes into our Slack instance in a threaded message via Zapier. This enabled our track leads to access the code so that they could log into the appropriate account at the appropriate time. We did need to upgrade our Zapier account to ensure these came through in a timely manner, as the lower tier would only fire every 15 minutes which was too long when the event was in session.

### Challenges with Streamyard

The downside of Streamyard was that the total recording time available was less than the total session time for the track. This meant we had to create different broadcasts for the morning, afternoon and evening sessions, and the broadcast had to start at the beginning and finish at the end of that time slot. If someone inadvertently ended a broadcast prematurely (easily done due to the position of the end broadcast button!) we had to re-issue invitation links to all subsequent speakers in that time slot.

Another issue that we faced was using pre-recorded videos. At the time of our first event, it wasn't possible to upload these to Streamyard, so we had to post them to an unlisted YouTube channel and have the track lead play the video in the browser. A couple of challenges were faced - firstly remembering to check the button for sharing audio on the screenshare, and secondly that the hosts needed to have pretty fast internet connections to ensure smooth playing of the videos.

The second year we used this system, the videos could be uploaded to Streamyard in advance, so this reduced the errors and made it much easier for the track leads to play the videos. We did still experience some problems with the track lead or speaker's internet connections being unstable despite them being on a wired connection.

### Streaming to YouTube

To get around the recording limitations, and to have a backup source of recordings, we streamed to private streams on YouTube. This meant that we had a backup for the full session recording outside of StreamYard which had no time limitations - if a broadcast happened to go over the limit for Streamyard recording, it would still be captured on the YouTube recording.  All of our published recordings ended up coming from the YouTube recordings.

## Swag

Any event is incomplete without some kind of goodies for the attendees, and we wanted to be able to offer something for our events - especially because getting the Mautic brand out into the world is quite a high priority for us at this time. Being a worldwide distributed community with a relatively low budget, shipping physical swag out to attendees was cost prohibitive, so we had to get a bit creative.

For some time we have had a Spreadshirt swag shop, where people could purchase their own Mautic swag with commissions coming back to the Mautic Community from each purchase.  Our solution for our digital events was to provide an event-branded design on our swag shops, so that people could choose what they wanted to buy. We purchased in-bulk gift cards to give away to attendees, but Spreadshirt like many companies locks the gift cards to a specific region.

To get around this challenge, as we didn't ask for region in the ticket claim forms, we sent an email to confirmed attendees asking them to claim their swag codes. They filled out a simple form telling us which geographic region they wished to have the swag delivered to, and we sent them a coupon for the appropriate region.

This was automated using a Google Sheet which had one column for region, and one for the code. When the code was claimed, Zapier searched for the next row which contained the region name, and then pulled out the relevant code.  It then pushed this code into a custom field in Mautic and triggered an email to be sent when that field was no longer empty, containing their unique code.

After the code had been emailed to the attendee, the spreadsheet was updated to prefix 'USED-' in front of the region and the code so that they couldn't be issued twice.  We also entered the email address of the person claiming the code next to the code, so that people couldn't use the same email address to claim more than once.

Aside from a couple of folks picking the wrong region, and a rather slow process of Spreadshirt issuing the codes meaning that we had run out of codes at one point, the process worked well.

## Multilingual tracks

Speaking in front of your peers in a language which is not your native language is a huge thing - I am constantly in awe of the many folks who do this.  Many events assume that everybody in their community will be able to follow sessions in English without translation, which in my opinion is excluding a lot of people who could otherwise benefit from the event and/or share their amazing knowledge.

As a worldwide community, I really wanted us to enable our community members to give sessions in their native language if they preferred to do so - in some cases in addition to delivering it in English at a different time in the schedule.   During our first conference, we tried to chunk these together in sections of regular tracks which didn't work all that well for the users. The track had been in English in the morning, and when they returned in the afternoon, it was in German. Confusing, eh!

For our second event we decided to make one track fully international throughout the event, and empower our community to work together and come up with at least three sessions and someone who was willing to be the track lead if they wanted to have sessions in their language. This worked much better, because it was clear to attendees that all tracks in the international track would be non-English. It also meant that we could chunk the sessions in a time that worked best for the timezone of the speakers. For example, we had a full morning of sessions in Japanese, along with sessions in Hungarian, German, Spanish and Portuguese.

I feel this was one of the higlights of the event and was really appreciated by the folks from those communities. We'll definitely continue to offer this in our global conferences going forward, and I hope that we might even have entire tracks for specific languages.  A key learning, however, was that you need to have someone in the session review panel who speaks the language for the sessions you're accepting - otherwise it can be difficult to review the sessions and select the appropriate ones for the event.

## Timezones, timezones, timezones!

Running an event for an international community can create timezone chaos!  Organising the schedule was probably the most challenging, trying to make sure that we were putting sessions in the schedule at a time that was going to work for the speaker.  Our first event was one **very** long day, which the organising team found pretty exhausting.

For the second event, to better facilitate timezones, we decided to start the first day earlier in the morning and finish early afternoon, and have a second day which started late morning and ran into the evening. While this did extend the event over two days, we feel it made things a little easier for the team - who had time to rest! - and for speakers to be accommodated at an appropriate time.

It did mean we had some gaps in the schedule as a couple of speakers pulled out at short notice and some times were more difficult to fill than others, but generally speaking it worked pretty well.  The event app from Sessionize also allowed people to view the timings in their own timezone, along with the embedded schedules. This caused some confusion to start with until we made it clear on the website that the timings would show at the time of the browser, rather than the event, but we would always communicate timings using UTC.

I also strongly recommend using something like [everytimezone.com](https://everytimezone.com) when you are communicating with speakers about timings, and providing them with calendar holds (which Sessionize now does automatically).

## Conclusion

It certainly hasn't been an easy process running these events digitally, and has taken quite some work to bring together all the moving parts that we needed in order to create the experiences we needed for our community. I hope that some of the above will be helpful for people who are also faced with organising digital events - although some of the workarounds were somewhat hacky they did work pretty well in the second year! Going forward, we're considering our options as several event platforms have now made significant improvements. For sure one area that was very sub-par in our previous events has been the sponsors booths, so I am hopeful we will be able to provide a more impactful experience for our sponsors in our next digital events!

If you want to come along to our events, keep an eye on [https://mauticon.mautic.org](https://mauticon.mautic.org)
