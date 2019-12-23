/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

const siteConfig = {
  title: 'quick-find-in-files', // Title for your website.
  tagline: 'quick-find-in-files recursively searches sub-directories for needle matches',
  url: 'https://erikengervall.github.io', // Your website URL
  baseUrl: '/quick-find-in-files/', // Base URL for your project
  organizationName: 'erikengervall',
  projectName: 'quick-find-in-files', // Used for publishing and more

  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {
      doc: 'getting-started',
      label: 'Docs',
    },
  ],

  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#55735a',
    secondaryColor: '#3b503e',
  },
  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Erik Engervall`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'github',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Custom
  repoUrl: 'https://github.com/erikengervall/quick-find-in-files',
  npmUrl: 'https://www.npmjs.com/package/quick-find-in-files',
}

module.exports = siteConfig
