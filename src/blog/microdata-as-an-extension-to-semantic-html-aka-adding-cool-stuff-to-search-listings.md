---
title: 'Microdata as an extension to Semantic HTML (aka adding cool stuff to search listings)'
date: 2012-12-16
category: 'Geek'
image: '/assets/img/blog/network-gradient.jpg'
imageAlt: 'Illustration of a complex network connected by multiple small dots on a dark blue gradient background'
imageCaption: 'Image by Freepik'
excerpt: 'NOTE: This article is quite outdated and remains here for archive purposes. You may have noticed recently that extra bits of information have started…'
sourceUrl: '/blog/geek/microdata-as-an-extension-to-semantic-html-aka-adding-cool-stuff-to-search-listings'
---

**NOTE: This article is quite outdated and remains here for archive purposes.**

You may have noticed recently that extra bits of information have started appearing in search results, perhaps photos of the author, reviews of a product, maps showing the location of a store or links which allow you to jump to a certain location within a page.

This article will give a brief overview of how you can make some small changes to your website which may increase the chances of your links containing these extra pieces of information.

Computers are as thick as two short planks when it comes down to it, and rely on correct interpretation of data to function. Much effort has been put into developing the structure of how a website is laid out in order to allow for better interpretation of its content and hence identification of key information.

Clearly, it is of great benefit to a search engine to be able to quickly and accurately ascertain key facts about a webpage – who wrote it, what topics it is about, if it is an offer or a review and so forth in order to provide that information to the person searching.

## Understanding Semantic HTML

Semantic HTML is a term often thrown around in web design circles without its meaning being understood. Semantics means:

_"Of or relating to meaning, often in relation to language; the meaning or relationship of meanings of a sign or set of signs" Source: [Wikipedia](http://en.wikipedia.org/wiki/Semantics "Wikipedia definition of Semantics")_

When web developers talk about using 'Semantic HTML' they are referring to the use of HTML markup to add structure to the page, or perhaps to reinforce the structural meaning of a part of the page. On a basic level this might mean using classes, IDs and tags to reinforce what is contained within those tags, but Microdata takes this one step further.

At a basic level, we should already be using H1, H2, H3 etc to signify the structure of our headings and sub-headings on a page. We use paragraphs and line breaks to signify the structure of our text. If we have an unordered list (bullet points to the un-initiated) then we us the UL tag, if we have an ordered list (numbered list to the un-initiated) we use the OL tag.

I often used to use incorrect HTML markup to make text look pretty before I knew any better – for example I would use the heading tags to make text appear larger or bolder, or I would use the font size/colour options to make a heading look nice rather than change the CSS stylesheet - neither of these approaches provide useful semantic information about the content.

The lesson to learn here is that HTML controls what something means and its structure, whereas CSS controls how it looks. C. S. S. = Can't Structure Stuff!

## Why bother with Semantic HTML?

Semantic HTML adds an extra layer of understanding for the machines we're expecting to interpret our code. It points them directly at what we want them to know about our content. General Joe-Public couldn't give two hoots about whether you've got your heading tags in the right order, but a search engine spider certainly does!

Semantic HTML is

-   Helpful for accessibility as screen readers interpret your page as spiders do!
-   Clean and easy to read/follow when returning to your code
-   Search engine friendly – logically ordered with clear signposts about what the content contains

## What is Microdata, RDFa, Opengraph and all that jazz?

[Microdata](http://schema.org/ "Microdata at Schema.org"), [microformats](http://microformats.org/ "Microformats"), [RDFa](http://www.w3.org/TR/xhtml-rdfa-primer/ "RDFa") and [Opengraph](http://ogp.me/) are all an expansion of semantic HTML. It is another way of structuring your site to actively shove content under the nose of search engine spiders and say 'here, this is what you're looking for!' – in other words, adding the cool stuff to search engine results (if you do it properly!).

For example, imagine somebody is searching for 'handbag sale' – they're probably looking for offers which companies have available for handbags. It is possible to tag your content with the microdata to identify that it [relates to an offer](http://schema.org/Offer "Schema.org markup for Offers") \- which would indicate to the search engine that this is probably a highly relevant link for the search terms used. If they added in a brand name, you could attach [microdata relating to the product](http://schema.org/Product "Product schema from schema.org") which specifies the brand (as well as a load of other information!).

The web world still hasn't quite made up its mind which type of 'expansion' it wants to adopt as the industry standard (although whispers indicate that it's leaning towards a version of RDF in the near future), so many sites are using all, in an attempt to placate all search engines and remove those which are deprecated over time. An example of this would be Ecademy – if you [check out my profile](http://www.ecademy.com/user/ruthcheesleyjoomlaspecialist "Ruth Cheesley - Joomla Specialist - Ecademy") you will notice the heavy use of semantic markup. Just last week W3C released a working draft on the implementation of [RDFa in HTML4 and HTML5](http://www.w3.org/TR/2012/WD-rdfa-in-html-20120911/ "RDFa Working Party") – some light bedtime reading for the insomniacs among us! It is worth noting that [Google currently recommends using Microdata](http://support.google.com/webmasters/bin/answer.py?hl=en&answer=99170 "Google currently recommends using Microdata") (however whispers indicate this might change to a version of RDF in development, but existing microdata will continue to be accepted).

## What changes can I make to improve my search engine listings?

Firstly, have a look at what you've got at the moment – you can do this either by going to view source, or you can run your page through the nifty '[Rich Snippets Tool](http://www.google.com/webmasters/tools/richsnippets "Rich Snippets Testing Tool")' from Google (now called the Structured Data Query Tool) - note you can also run chunks of HTML through this tool.

### Linking up places you contribute content

For example, if I run my Ecademy profile through the [Rich Snippets tool,](http://www.google.com/webmasters/tools/richsnippets "Rich snippets testing tool") (note this is now known as the Structured Data Query Tool) I find that it shows me a Google search preview complete with my photo (which is drawn from my Google+ Profile - essential if you want to develop your author profile on the web). It also shows a link to my Author page and shows it as verified - meaning there is a reciprocal link between my Google+ page and my Ecademy page. On my Ecademy page I link to my G+ profile, on my G+ profile I have my Ecademy profile listed in the 'I contribute to' section. It also shows you other places where I am considered an author, or I contribute, which are linked to from this page - my Twitter feed for example.

If we then run [my Google+ profile](http://www.google.com/webmasters/tools/richsnippets?url=https%3A%2F%2Fplus.google.com%2F111957478638559368409%2Fabout "Inspect google+ profile in Rich Snippets testing tool") through the Rich Snippets tool, it shows other places where I am an author according to my G+ profile page. Authorship is becoming a really important part of Google search engine ranking position and is closely tied to Google+. I recommend you take a look at my earlier article on why you can't afford to ignore Google+ to explore this further.

### Adding in the extra data

It's interesting to check out the guidelines on [schema.org](http://schema.org/ "Schema.org"), [RDFa](http://www.w3.org/TR/rdfa-core/#rdfa-attributes "RDFa")/[RDFa Lite](http://www.w3.org/TR/rdfa-lite/#the-attributes "RDFa Lite") and [Microformats](http://microformats.org/wiki/get-started "Microformats") and apply them to your site by editing your templates or tweaking your overrides to include the extra data, and seeing how this affects what is returned by the Rich Snippets tool. Certainly within a few days of linking up my G+ account with other accounts I use, I noticed my profile image appearing on many of the links I have authored.

## Conclusion

The importance of semantic structure in HTML is growing, and despite the fact that there is no 'hard and fast' accepted way to incorporate microdata into your website, there are several ways you can start to dip your toe into the deep ocean that is microdata, microformats and RDFa. Please do respond in the comments if you have any experiences with any of these approaches, it's definitely something to watch closely!
