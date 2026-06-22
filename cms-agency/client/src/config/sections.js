export const sectionRegistry = {
  hero: {
    label: 'Hero Section',
    icon: 'Star',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading', required: true },
      { name: 'subheading', type: 'textarea', label: 'Subheading' },
      { name: 'buttonText', type: 'text', label: 'Button Text' },
      { name: 'buttonLink', type: 'text', label: 'Button Link' },
      { name: 'image', type: 'image', label: 'Background Image' },
    ],
  },
  about: {
    label: 'About Section',
    icon: 'Info',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading', required: true },
      { name: 'content', type: 'textarea', label: 'Content' },
      { name: 'image', type: 'image', label: 'Image' },
      { name: 'buttonText', type: 'text', label: 'Button Text' },
      { name: 'buttonLink', type: 'text', label: 'Button Link' },
    ],
  },
  services: {
    label: 'Services List',
    icon: 'Briefcase',
    fields: [
      { name: 'heading', type: 'text', label: 'Section Heading' },
      { name: 'showIcons', type: 'boolean', label: 'Show Icons?' },
      { name: 'selectedServices', type: 'relation', label: 'Select Services', collection: 'services', multiple: true },
    ],
  },
  testimonials: {
    label: 'Testimonials',
    icon: 'MessageCircle',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'testimonialIds', type: 'relation', label: 'Select Testimonials', collection: 'testimonials', multiple: true },
    ],
  },
  faq: {
    label: 'FAQ',
    icon: 'HelpCircle',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'faqIds', type: 'relation', label: 'Select FAQs', collection: 'faqs', multiple: true },
    ],
  },
  gallery: {
    label: 'Gallery',
    icon: 'Image',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'images', type: 'image', label: 'Gallery Images', multiple: true },
    ],
  },
  team: {
    label: 'Team',
    icon: 'Users',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'teamMemberIds', type: 'relation', label: 'Select Team Members', collection: 'team', multiple: true },
    ],
  },
  cta: {
    label: 'Call to Action',
    icon: 'Zap',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading', required: true },
      { name: 'subheading', type: 'textarea', label: 'Subheading' },
      { name: 'buttonText', type: 'text', label: 'Button Text' },
      { name: 'buttonLink', type: 'text', label: 'Button Link' },
      { name: 'backgroundImage', type: 'image', label: 'Background Image' },
    ],
  },
  contact: {
    label: 'Contact',
    icon: 'Mail',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'subheading', type: 'textarea', label: 'Subheading' },
      { name: 'showMap', type: 'boolean', label: 'Show Map?' },
      { name: 'mapEmbedUrl', type: 'text', label: 'Map Embed URL' },
      { name: 'formHeading', type: 'text', label: 'Form Heading' },
      { name: 'formSuccessMessage', type: 'textarea', label: 'Success Message' },
    ],
  },
  vehicles: {
    label: 'Vehicle Types',
    icon: 'Car',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'vehiclesIds', type: 'relation', label: 'Select Vehicles', collection: 'vehicles', multiple: true },
    ],
  },
  packages: {
    label: 'Packages',
    icon: 'Package',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'packagesIds', type: 'relation', label: 'Select Packages', collection: 'packages', multiple: true },
    ],
  },
  love: {
    label: 'Love / Marquee Section',
    icon: 'Heart',
    fields: [
      { name: 'heading', type: 'text', label: 'Heading' },
      { name: 'description', type: 'textarea', label: 'Description' },
    ],
  },
};

export const getSectionDefaults = (type) => {
  const registry = sectionRegistry[type];
  if (!registry) return {};
  const defaults = {};
  registry.fields.forEach((field) => {
    if (field.type === 'boolean') defaults[field.name] = false;
    else if (field.type === 'relation' && field.multiple) defaults[field.name] = [];
    else if (field.type === 'image' && field.multiple) defaults[field.name] = [];
    else if (field.type === 'number') defaults[field.name] = 0;
    else defaults[field.name] = '';
  });
  return defaults;
};
