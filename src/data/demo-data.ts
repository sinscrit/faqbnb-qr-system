// Demo data for static deployment
export const demoItems = [
  {
    id: '1',
    publicId: '12345',
    name: 'Samsung Washing Machine',
    description: 'Front-loading washing machine with smart features and energy efficiency.',
    links: [
      {
        id: '1',
        title: 'User Manual',
        linkType: 'pdf' as const,
        url: 'https://www.samsung.com/us/support/owners/product/front-load-washer-wf45r6100aw',
        thumbnailUrl: '',
        displayOrder: 1,
      },
      {
        id: '2',
        title: 'Installation Video',
        linkType: 'youtube' as const,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: '',
        displayOrder: 2,
      },
      {
        id: '3',
        title: 'Troubleshooting Guide',
        linkType: 'text' as const,
        url: 'https://www.samsung.com/us/support/troubleshooting/',
        thumbnailUrl: '',
        displayOrder: 3,
      },
    ],
  },
  {
    id: '2',
    publicId: 'tv-001',
    name: 'Smart TV',
    description: '65" QLED TV with streaming capabilities and voice control.',
    links: [
      {
        id: '4',
        title: 'Quick Setup Guide',
        linkType: 'pdf' as const,
        url: 'https://example.com/tv-setup.pdf',
        thumbnailUrl: '',
        displayOrder: 1,
      },
      {
        id: '5',
        title: 'Smart Features Demo',
        linkType: 'youtube' as const,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: '',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '3',
    publicId: 'coffee-maker',
    name: 'Coffee Maker',
    description: 'Keurig single-serve coffee maker with multiple brew sizes.',
    links: [
      {
        id: '6',
        title: 'Brewing Guide',
        linkType: 'pdf' as const,
        url: 'https://example.com/brewing-guide.pdf',
        thumbnailUrl: '',
        displayOrder: 1,
      },
      {
        id: '7',
        title: 'Maintenance Tips',
        linkType: 'text' as const,
        url: 'https://example.com/maintenance',
        thumbnailUrl: '',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '4',
    publicId: 'thermostat',
    name: 'Smart Thermostat',
    description: 'Nest learning thermostat with energy-saving features.',
    links: [
      {
        id: '8',
        title: 'Programming Guide',
        linkType: 'pdf' as const,
        url: 'https://example.com/thermostat-guide.pdf',
        thumbnailUrl: '',
        displayOrder: 1,
      },
      {
        id: '9',
        title: 'Energy Saving Tips',
        linkType: 'text' as const,
        url: 'https://example.com/energy-tips',
        thumbnailUrl: '',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '5',
    publicId: 'dishwasher',
    name: 'Dishwasher',
    description: 'Bosch 800 series dishwasher with quiet operation.',
    links: [
      {
        id: '10',
        title: 'Loading Guide',
        linkType: 'image' as const,
        url: 'https://example.com/loading-guide.jpg',
        thumbnailUrl: '',
        displayOrder: 1,
      },
      {
        id: '11',
        title: 'Cycle Selection',
        linkType: 'text' as const,
        url: 'https://example.com/cycles',
        thumbnailUrl: '',
        displayOrder: 2,
      },
    ],
  },
];

export function getItemByPublicId(publicId: string) {
  return demoItems.find(item => item.publicId === publicId);
}

export function getAllItems() {
  return demoItems;
}

