---
title: 'How secure is your Joomla! website? Top tips for business owners to ensure your site is safe'
date: 2012-12-16
category: 'Geek'
image: '/assets/img/blog/warning-light.jpg'
imageAlt: 'Photo of a red warning light in the foreground of a grey nondescript background.'
imageCaption: 'Image by FabrikaPhoto on Envato'
excerpt: 'NOTE: This article is quite outdated and remains here for archive purposes. Joomla! is fast becoming one of the most popular content management systems in…'
sourceUrl: '/blog/geek/how-secure-is-your-joomla-website-top-tips-for-business-owners-to-ensure-your-site-is-safe'
---

**NOTE: This article is quite outdated and remains here for archive purposes.**

Joomla! is fast becoming one of the most popular content management systems in the world, powering almost 3% of the web and exceeding 30 million downloads - the chances are during your day you probably browse at least one website using Joomla!

Many businesses rely on Joomla! for their web presence, but often business owners are not empowered to ensure that their website is being managed properly, or is up to date with the latest security patches. This article gives Joomla! website owners some simple tips to ensure that your website is up to date, and some tools to make that process easier!

## Is your website using the latest secure version of Joomla!

The most fundamental task any owner of a Joomla! website must carry out is to keep the base Joomla! installation up to date. Like any software, bugs and security vulnerabilities are identified and fixed regularly, and a 'patch' will be released periodically to resolve these issues.

The Joomla! project has a [Security Strike Team](http://developer.joomla.org/security.html "Joomla! Security Strike Team") who are tasked with investigating and fixing security vulnerabilities, with patches for critical and high severity being released immediately, and other lower severity patches are released within the regular release cycle. Joomla! updates are generally widely publicised, on the [Joomla! website](http://www.joomla.org "Joomla! Website"), [Facebook page](http://www.facebook.com/Joomla "Joomla! on Facebook"), [Twitter](http://www.twitter.com/Joomla "Joomla! on Twitter"), and the [Google+ Community](https://plus.google.com/u/0/communities/103500906097842801714 "Joomla! Google+ Community").

There are two ways to find out what version of Joomla! you are using, both require you to log into the 'back end' of your Joomla! website (by visiting [www.yoursite.com/administrator](http://www.yoursite.com/administrator)). If you can't log in here (you will get a message saying you don't have access) you don't have an administrator level account, so you'll need to speak to your developers.

There are several versions of Joomla!:

-   **Joomla! 1.0.x** - this has been deprecated for a very long time and is no longer supported in any way, but there are still websites using it (shame on you!). Generally denoted by a red stripe across the top of the page, you will find the version number at the bottom of the page. The latest stable version is 1.0.15.
-   **Joomla! 1.5.x** - this version has recently been deprecated so there are still a lot of websites using this version, however official support is being withdrawn and many extension developers are not supporting this version any longer. Denoted by a green stripe across the top of the page, you will find the version number near the top right of the page. The latest stable version to date is 1.5.26.
-   **Joomla! 1.6.x and 1.7.x** - these were short term releases which are no longer supported. Denoted by a blue stripe across the top of the page, the version number will be displayed at the bottom of the page. Update urgently, as there were several security vulnerabilities which were patched in the 1.7->2.5 update.
-   **Joomla! 2.5.x** - this is the current stable version of Joomla! and is denoted by a blue stripe across the top of the page. The version number will be displayed at the bottom of the page.

If you can't see the version number, it is possible to visit the System Information page, which displays the Joomla! version number in addition to other information about your Joomla! installation and hosting environment.

## How do I update?

Updating your site need not be a cause for concern, however it is important to back up your site first (see below). You can either download the patch files manually from the Joomla! website (in versions prior to 1.7.x) and upload these to your site using FTP, or you can use [Admin Tools](https://www.akeebabackup.com/products/admin-tools.html "Akeeba Admin Tools") to update with a single click!

### Should I migrate?

If you're running Joomla! 1.0.x, 1.5.x, 1.6.x or 1.7.x you should be seriously considering migrating to the latest stable version of 2.5.x. The reason for this is that the Joomla! Security Strike Force only support the latest version, and many extensions are now unavailable for older versions of Joomla! - meaning that vulnerabilities and bugs which are identified will not be fixed for your version.

It is important to remember that migrating from 1.0.x to 1.5.x, or 1.5.x to any higher version requires a **migration**, and generally will require reinstalling your extensions, and adjusting or replacing your template with one which supports Joomla! 2.5.x. Unless you are experienced with Joomla! I would recommend you asking a specialist to carry out this work.

## Are your extensions up to date?

Second only to maintaining Joomla! is the importance of keeping your extensions up to date. Many site compromises I deal with are due to vulnerable extensions rather than Joomla! itself - and in almost all cases the site owner has not applied patched provided by the extension developers.

If a vulnerable extension is identified and reported, it is tested by security experts and added to the [Vulnerable Extensions List](http://docs.joomla.org/Vulnerable_Extensions_List "Joomla! Vulnerable Extensions List") with details of the type of vulnerability and versions affected, alongside updates from the developers of the extension. Those displayed in red have not yet been resolved.

### How do I update Joomla! extensions?

Updating extensions should be a case of simply installing the new version - in Joomla! 2.5.x and later you can automatically update extensions (if the extensions support it) via the update facility.  Check first with the extension developer, as they generally provide upgrade recommendations. Remember to take a backup before you update, just in case any customisation has been done which needs to be re-applied after the update.

The best way to find out about new extension updates is to sign up for their mailing lists - most developers will send out an email whenever a new version is available.

## Is your administrator portal publicly accessible?

If you can browse to [www.mysite.com/administrator](http://www.mysite.com/administrator) so can anybody who knows (or suspects) that your website is using Joomla! - it's one less barrier in the way of them being able to compromise your website.

### How do I hide my administrators portal?

There are several ways in which you can hide this part of your website, the most popular being to use a 'secret word' which must be appended to the URL in order to access the administrators login screen. An example would be [www.mysite.com/administrator/?mysecretword](http://www.mysite.com/administrator/?mysecretword). This way, if the user doesn't have the secret word, they can't even get to the login page for your administrator portal.

[Admin Tools](https://www.akeebabackup.com/products/admin-tools.html "Admin Tools") has this facility built in, or you can use any number of other extensions which provide this facility in the [Joomla! Extensions Directory](http://extensions.joomla.org "Joomla! Extensions Directory").

## Is your default administrator still enabled?

When you create a website using versions earlier than 2.5.x the default administrator was created using a set ID - in 1.5.x and earlier this was #62, and in 1.6.x and later #42. The username was also 'admin' - both of which are often not changed.

So what, you might say! If someone is trying to compromise your website and they know that an account exists with the user ID of #62 or #42 which has full access to your site, this is the first thing they will attempt with any vulnerabilities - to gain access to that account so that they can log into your site with administrator privileges (and effectively do whatever they want, including defacing your site or installing malicious code).

### How to deal with default administrator accounts

The best thing to do is to disable this account, and use a separate account to do your administrator tasks.

The basic rule of thumb is to have the absolute minimum number of administrator accounts that you require, and ensure they have strong passwords. If you create an administrator account for somebody to work on a part of your site, remember to disable it afterwards.

Think of the administrator account as the keys to your house or expensive car, which you would most definitely not want to be in the wrong hands!

## Are you backing up your site to a secure off-site location regularly?

If the worst happens and your site goes offline, you fall out with your hosting provider or (heaven forbid!) you make a mistake and need to quickly recover your website, could you do it?

As a business owner, this should feature highly in your continuity plans and considered a risk to the business, especially if a large proportion of your work comes via your website.

### How do I back up my site?

The facility exists to back up your sites automatically, even to push those backups to a remote storage facility such as Dropbox or Amazon S3, and to notify you if there are any problems. The best extension for doing this is without a doubt [Akeeba Backup](http://www.akeebabackup.com "Akeeba Backup"), which is tried and tested by thousands of Joomla! users around the world. The professional version also allows you to back up other databases (for example if you're running a separate Ecommerce store or learning environment).

Backing up your site is only one part of the risk management however - make sure you test your backups regularly rather than when you're in the heat of the moment! You can do this quickly using Kickstart from Akeeba, which lets you recreate your site in minutes.

## How do I keep on top of this?

Managing one site it's fairly easy to add a reminder to your calendar or keep an eye on the Joomla! news to ensure you keep up to date, but when you are a busy person or you manage lots of sites it is easy to miss an update announcement or forget to update a site.

It is important to remember that as soon as a Joomla! update announcement is made, vulnerabilities which are fixed by that update are out 'in the wild' - and therefore the longer you leave your site unpatched, the higher risk you are at from being compromised.

Both Admin Tools and Akeeba Backup have built-in notification systems which will alert you regularly if your website is out of date or if your backup fails, but this can be quite inefficient when you're managing multiple websites.
Automating and remotely monitoring sites

When I was at the Joomla! World Conference I got chatting to Victor Drover - the face behind the popular Joomla! extension provider [Anything Digital](http://www.anything-digital.com "Anything Digital") (JCal Pro, sh404, Josetta and more) - and we got chatting about their latest service, [Watchful.li,](http://www.watchful.li "Watchful.li - remote backup, update and security monitoring for Joomla from a single dashboard") which they were launching at the World Conference as a sponsor.

Watchful monitors any number of websites, and will proactively inform you if they are out of date. They can also monitor your backups, and check your homepage for a specific word - if it is absent it might be a sign that your site has been altered without your consent.

Backups can also be triggered directly from the Watchful.li dashboard, as can updates for sites which are running 2.5.x and greater.

We have recently started to move all our websites over to Watchful.li and continue to be impressed with the new features that are being introduced.

I would really recommend checking it out - Victor also kindly provided a code for readers of this article which will give you 3 months for $3, just use the code VIRYA3 - and there is also a 20% discount code on your dashboard for Akeeba if you sign up at Watchful!

## Conclusion

In conclusion, I have presented just a handful of what I consider to be important considerations in making sure that your Joomla! website is secure, all of which are well within the capabilities of a regular website owner. There are also tools which allow a large proportion of this to be automated, which I really recommend if you're a busy person!

Please note that while this provides you with the core security precautions to keep your site safe, there are many other factors which can be considered such as the security of your hosting provider and more, but these five tips should set you in good stead.
