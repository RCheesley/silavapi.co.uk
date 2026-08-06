/** The set of built pages exercised by the functional + a11y suites. */
export const PAGES = [
  { path: '/', name: 'Home', h1: /Hello, I'm Sīlavāpi\./ },
  { path: '/dharma/', name: 'Dharma', h1: /A practice, not a hobby/ },
  { path: '/blog/', name: 'Blog', h1: /Writing on open source, dharma and life/ },
  {
    path: '/blog/introducing-silavapi/',
    name: 'Article',
    h1: /Introducing Sīlavāpi/,
  },
  { path: '/contact/', name: 'Contact', h1: /Fancy a coffee\? Drop me a line!/ },
  { path: '/privacy/', name: 'Privacy', h1: /How privacy works here/ },
  { path: '/accessibility/', name: 'Accessibility', h1: /Accessibility statement/ },
  { path: '/404.html', name: '404', h1: /Page not found/ },
  { path: '/dev/components/', name: 'Components', h1: /Component gallery/ },
];
