import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Micro CRM SaaS',
  tagline: 'CRM B2B Multitenant — .NET 10 · React 18 · DDD',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://thiagogradev85.github.io',
  baseUrl: '/microcrm-saas-docs/',

  organizationName: 'Thiagogradev85',
  projectName: 'microcrm-saas-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Thiagogradev85/microcrm-saas-docs/tree/main/',
        },
        blog: false, // blog desativado por enquanto
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Micro CRM SaaS',
      logo: {
        alt: 'Micro CRM SaaS Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentação',
        },
        {
          href: 'https://github.com/Thiagogradev85/microcrm-saas',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            {label: 'Introdução', to: '/docs/intro'},
            {label: 'Arquitetura', to: '/docs/arquitetura/visao-geral'},
          ],
        },
        {
          title: 'Repositórios',
          items: [
            {
              label: 'Backend (.NET 10)',
              href: 'https://github.com/Thiagogradev85/microcrm-saas',
            },
            {
              label: 'Docs (este site)',
              href: 'https://github.com/Thiagogradev85/microcrm-saas-docs',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Thiago Gramuglia. Construído com Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
