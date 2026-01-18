// Demo data for static deployment
// NOTE: These publicIds are UUIDs from the actual database
export const demoItems = [
  {
    id: '1',
    publicId: '8d678bd0-e4f7-495f-b4cd-43756813e23a', // Samsung Washing Machine
    name: 'Samsung Washing Machine',
    description: 'Front-loading washing machine with smart features and energy efficiency.',
    links: [
      {
        id: '1',
        title: 'How to Start a Load',
        linkType: 'youtube' as const,
        url: 'https://www.youtube.com/watch?v=SmXsu2MWu0c',
        thumbnailUrl: 'https://img.youtube.com/vi/SmXsu2MWu0c/maxresdefault.jpg',
        displayOrder: 1,
      },
      {
        id: '2',
        title: 'User Manual',
        linkType: 'pdf' as const,
        url: 'https://www.samsung.com/us/support/owners/product/front-load-washer-wf45r6100aw',
        thumbnailUrl: 'https://images.samsung.com/is/image/samsung/p6pim/us/wf45r6100aw/gallery/us-front-load-washer-wf45r6100aw-wf45r6100aw-a2-thumb-536673329',
        displayOrder: 2,
      },
      {
        id: '3',
        title: 'Detergent Compartments Guide',
        linkType: 'image' as const,
        url: 'https://images.samsung.com/is/image/samsung/assets/us/support/home-appliances/how-to-use-detergent-compartments-in-samsung-washing-machines/how-to-use-detergent-compartments-in-samsung-washing-machines-1.jpg',
        thumbnailUrl: 'https://images.samsung.com/is/image/samsung/assets/us/support/home-appliances/how-to-use-detergent-compartments-in-samsung-washing-machines/how-to-use-detergent-compartments-in-samsung-washing-machines-1.jpg',
        displayOrder: 3,
      },
      {
        id: '4',
        title: 'Troubleshooting Guide',
        linkType: 'text' as const,
        url: 'https://www.samsung.com/us/support/troubleshooting/',
        thumbnailUrl: 'https://images.samsung.com/is/image/samsung/assets/us/support/product-help/support-icon.png',
        displayOrder: 4,
      },
    ],
  },
  {
    id: '2',
    publicId: '9659f771-6f3b-40cc-a906-57bbb451788f', // Samsung Smart TV
    name: 'Smart TV',
    description: '65" QLED TV with streaming capabilities and voice control.',
    links: [
      {
        id: '4',
        title: 'Quick Setup Guide',
        linkType: 'pdf' as const,
        url: 'https://www.samsung.com/us/support/owners/product/qled-tv-q70t',
        thumbnailUrl: 'https://images.samsung.com/is/image/samsung/p6pim/us/qn65q70tafxza/gallery/us-qled-4k-q70t-qn65q70tafxza-frontblack-thumb-295958863',
        displayOrder: 1,
      },
      {
        id: '5',
        title: 'Smart Features Demo',
        linkType: 'youtube' as const,
        url: 'https://www.youtube.com/watch?v=y7wyfTsIm1k',
        thumbnailUrl: 'https://img.youtube.com/vi/y7wyfTsIm1k/maxresdefault.jpg',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '3',
    publicId: 'f2b82987-a2a4-4de2-94db-f8924dc096d5', // Keurig Coffee Maker
    name: 'Coffee Maker',
    description: 'Keurig single-serve coffee maker with multiple brew sizes.',
    links: [
      {
        id: '6',
        title: 'Brewing Guide',
        linkType: 'pdf' as const,
        url: 'https://www.keurig.com/support',
        thumbnailUrl: 'https://www.keurig.com/dw/image/v2/AAHV_PRD/on/demandware.static/-/Sites-keurig-master-catalog/default/dw5c123456/images/support/k-elite-brewing-guide-thumb.jpg',
        displayOrder: 1,
      },
      {
        id: '7',
        title: 'Maintenance Tips',
        linkType: 'text' as const,
        url: 'https://www.keurig.com/support/maintenance',
        thumbnailUrl: 'https://www.keurig.com/dw/image/v2/AAHV_PRD/on/demandware.static/-/Sites-keurig-master-catalog/default/dw789012/images/support/maintenance-icon.png',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '4',
    publicId: '0d92cbeb-a61f-4492-9346-6ab03363fdab', // Nest Thermostat
    name: 'Smart Thermostat',
    description: 'Nest learning thermostat with energy-saving features.',
    links: [
      {
        id: '8',
        title: 'Programming Guide',
        linkType: 'pdf' as const,
        url: 'https://support.google.com/googlenest/answer/9247296',
        thumbnailUrl: 'https://lh3.googleusercontent.com/support/nest-thermostat-guide-thumb.jpg',
        displayOrder: 1,
      },
      {
        id: '9',
        title: 'Energy Saving Tips',
        linkType: 'text' as const,
        url: 'https://support.google.com/googlenest/answer/9247296',
        thumbnailUrl: 'https://lh3.googleusercontent.com/support/energy-tips-icon.png',
        displayOrder: 2,
      },
    ],
  },
  {
    id: '5',
    publicId: '1c8e4723-5186-41f3-b4bd-11b614a77bdb', // Bosch Dishwasher
    name: 'Dishwasher',
    description: 'Bosch 800 series dishwasher with quiet operation.',
    links: [
      {
        id: '10',
        title: 'Loading Guide',
        linkType: 'image' as const,
        url: 'https://media.bosch.com/binary/SG9tZS1BcHBsaWFuY2VzL0VuZ2luZWVyaW5nL1RlY2hub2xvZ3kvaW1hZ2UvQ2xvc2UtaW4tMQ==/Close-in-1.jpg',
        thumbnailUrl: 'https://media.bosch.com/binary/SG9tZS1BcHBsaWFuY2VzL0VuZ2luZWVyaW5nL1RlY2hub2xvZ3kvaW1hZ2UvQ2xvc2UtaW4tMQ==/Close-in-1.jpg',
        displayOrder: 1,
      },
      {
        id: '11',
        title: 'Cycle Selection',
        linkType: 'text' as const,
        url: 'https://www.bosch-home.com/us/experience-bosch/dishwashers',
        thumbnailUrl: 'https://media.bosch.com/binary/SG9tZS1BcHBsaWFuY2VzL0VuZ2luZWVyaW5nL1RlY2hub2xvZ3kvaW1hZ2UvQ2xvc2UtaW4tMQ==/dishwasher-cycles-icon.png',
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

