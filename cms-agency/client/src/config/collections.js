export const collectionRegistry = {
  'blog-posts': {
    label: 'Blog Posts',
    singular: 'Blog Post',
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'slug', type: 'text', label: 'Slug', required: true },
      { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
      { name: 'content', type: 'textarea', label: 'Content' },
      { name: 'featuredImage', type: 'image', label: 'Featured Image' },
      { name: 'category', type: 'text', label: 'Category' },
      { name: 'tags', type: 'text', label: 'Tags (comma separated)' },
    ],
    hasStatus: true,
  },
  testimonials: {
    label: 'Testimonials',
    singular: 'Testimonial',
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'role', type: 'text', label: 'Role / Title' },
      { name: 'quote', type: 'textarea', label: 'Quote', required: true },
      { name: 'image', type: 'image', label: 'Photo' },
      { name: 'rating', type: 'number', label: 'Rating (1-5)' },
      { name: 'sourceUrl', type: 'text', label: 'Source URL (Google Maps link)' },
    ],
  },
  faqs: {
    label: 'FAQs',
    singular: 'FAQ',
    fields: [
      { name: 'question', type: 'text', label: 'Question', required: true },
      { name: 'answer', type: 'textarea', label: 'Answer', required: true },
    ],
  },
  services: {
    label: 'Services',
    singular: 'Service',
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'icon', type: 'text', label: 'Icon Name' },
      { name: 'image', type: 'image', label: 'Image' },
      { name: 'price', type: 'text', label: 'Price' },
      { name: 'category', type: 'select', label: 'Category', options: ['Detailing', 'Ceramic Coating', 'Protection'] },
      { name: 'features', type: 'textarea', label: 'Features (one per line)' },
    ],
  },
  packages: {
    label: 'Packages',
    singular: 'Package',
    fields: [
      { name: 'title', type: 'text', label: 'Title', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'category', type: 'select', label: 'Category', options: ['Detailing', 'Ceramic Coating'] },
      { name: 'price', type: 'text', label: 'Price' },
      { name: 'priceLabel', type: 'text', label: 'Price Label (e.g. Starting at)' },
      { name: 'features', type: 'textarea', label: 'Features (one per line)' },
      { name: 'isFeatured', type: 'boolean', label: 'Featured Package?' },
      { name: 'image', type: 'image', label: 'Image' },
    ],
  },
  vehicles: {
    label: 'Vehicles',
    singular: 'Vehicle Type',
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'image', type: 'image', label: 'Image' },
    ],
  },
  team: {
    label: 'Team Members',
    singular: 'Team Member',
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'role', type: 'text', label: 'Role', required: true },
      { name: 'bio', type: 'textarea', label: 'Bio' },
      { name: 'image', type: 'image', label: 'Photo' },
      { name: 'email', type: 'text', label: 'Email' },
    ],
  },
};

export const getCollectionDefaults = (name) => {
  const registry = collectionRegistry[name];
  if (!registry) return {};
  const defaults = {};
  registry.fields.forEach((field) => {
    if (field.type === 'number') defaults[field.name] = 0;
    else defaults[field.name] = '';
  });
  return defaults;
};
