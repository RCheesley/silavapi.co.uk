/**
 * Primary navigation — flat, no dropdowns (BUILD_SPEC change #1).
 * `key` matches the `navActive` value a page sets in its front matter, so the
 * active item gets aria-current="page". Pages not listed here (e.g. Privacy)
 * mark no item active.
 */
export default {
  primary: [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'about', label: 'About', href: '/#about' },
    { key: 'dharma', label: 'Dharma', href: '/dharma/' },
    { key: 'blog', label: 'Blog', href: '/blog/' },
    { key: 'contact', label: 'Contact', href: '/contact/' },
  ],
};
