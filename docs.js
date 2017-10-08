const Docma = require('docma');
const Package = require('./package');

Docma.create()
  .build({
    app: {
      title: Package.name,
      base: '/',
      enterence: 'content:readme',
      server: Docma.ServerType.GITHUB,
    },
    src: [
      './README.md',
      './src/index.js',
    ],
    dest: './docs',
    jsdoc: {
      plugins: ['jsdoc-dynamic'],
    },
    template: {
      options: {
        title: Package.name,
        navItems: [
          {
            label: 'Readme',
            href: '#',
          },
          {
            label: 'Documentation',
            href: '#Snekfetch',
            iconClass: 'ico-book',
          },
          {
            label: 'GitHub',
            href: Package.homepage,
            target: '_blank',
            iconClass: 'ico-md ico-github',
          },
        ],
      },
    },
  })
  .catch(console.error); // eslint-disable-line no-console
