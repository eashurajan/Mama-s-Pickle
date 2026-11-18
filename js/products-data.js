/**
 * products-data.js — Centralized Product Catalogue Data
 * Mama's Pickle Ecommerce Website
 *
 * Contains factual product data, gallery image paths (organized under
 * assets/images/products/), jar sizes, pricing, ingredients, nutritional
 * values, and storage instructions for all nine pickle products.
 */

const buildGalleryForType = (typeName, sizeLabel) => {
  const typeSlug = typeName.toLowerCase();
  const sizeSlug = sizeLabel.toLowerCase();
  return [
    {
      src: `assets/images/products/pickle-${typeSlug}-front-with-bg-${sizeSlug}.png`,
      alt: `${typeName} Pickle (${sizeLabel}) jar in kitchen setting`,
      bgClass: 'pdp-gallery__thumb--scene',
    },
    {
      src: `assets/images/products/pickle-${typeSlug}-front-png-${sizeSlug}.png`,
      alt: `${typeName} Pickle (${sizeLabel}) front jar view`,
      bgClass: 'pdp-gallery__thumb--jar',
    },
    {
      src: `assets/images/products/pickle-${typeSlug}-back-png-${sizeSlug}.png`,
      alt: `${typeName} Pickle (${sizeLabel}) back jar view`,
      bgClass: 'pdp-gallery__thumb--jar',
    },
    {
      src: `assets/images/products/pickle-${typeSlug}-back-ingredients-${sizeSlug}.png`,
      alt: `${typeName} Pickle (${sizeLabel}) ingredients and storage label`,
      bgClass: 'pdp-gallery__thumb--label',
    },
    {
      src: `assets/images/products/pickle-${typeSlug}-back-label-${sizeSlug}.png`,
      alt: `${typeName} Pickle (${sizeLabel}) nutritional information label`,
      bgClass: 'pdp-gallery__thumb--nutrition',
    },
  ];
};

const PRODUCTS_DATA = [
  {
    id: 'chicken-pickle',
    slug: 'chicken-pickle',
    name: 'Chicken Pickle',
    pickleType: 'Chicken',
    category: 'non-veg',
    categoryLabel: 'Meat & Seafood',
    shortDescription: 'Spicy, tangy chicken pickle made with traditional Indian spices.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with chicken, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, savoury flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Chicken Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Chicken, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 18 g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 499,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 400,
        cardPrice: 499,
        jarImage: 'assets/images/products/pickle-chicken-front-png-350g.png',
        gallery: buildGalleryForType('Chicken', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 280,
        cardPrice: 329,
        jarImage: 'assets/images/products/pickle-chicken-front-png-200g.png',
        gallery: buildGalleryForType('Chicken', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-chicken-350g.png',
      heroScene: 'assets/images/products/pickle-chicken-front-with-bg-350g.png',
    },
    relatedSlugs: ['fish-pickle', 'squid-pickle', 'mutton-pickle', 'garlic-pickle'],
  },
  {
    id: 'mutton-pickle',
    slug: 'mutton-pickle',
    name: 'Mutton Pickle',
    pickleType: 'Mutton',
    category: 'non-veg',
    categoryLabel: 'Meat & Seafood',
    shortDescription: 'Rich, slow-cooked mutton pickle crafted with traditional Indian spices.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with tender mutton cuts, cold-pressed gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, savoury flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Mutton Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Mutton, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 18 g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 579,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 579,
        cardPrice: 579,
        jarImage: 'assets/images/products/pickle-mutton-front-png-350g.png',
        gallery: buildGalleryForType('Mutton', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 389,
        cardPrice: 389,
        jarImage: 'assets/images/products/pickle-mutton-front-png-200g.png',
        gallery: buildGalleryForType('Mutton', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-mutton-350g.png',
      heroScene: 'assets/images/products/pickle-mutton-front-with-bg-350g.png',
    },
    relatedSlugs: ['chicken-pickle', 'fish-pickle', 'squid-pickle', 'garlic-pickle'],
  },
  {
    id: 'fish-pickle',
    slug: 'fish-pickle',
    name: 'Fish Pickle',
    pickleType: 'Fish',
    category: 'non-veg',
    categoryLabel: 'Meat & Seafood',
    shortDescription: 'Coastal-style tangy fish pickle marinated in gingelly oil and roasted spices.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with boneless fish pieces, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, savoury flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Fish Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Fish, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 18 g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 399,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 399,
        cardPrice: 399,
        jarImage: 'assets/images/products/pickle-fish-front-png-350g.png',
        gallery: buildGalleryForType('Fish', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 249,
        cardPrice: 249,
        jarImage: 'assets/images/products/pickle-fish-front-png-200g.png',
        gallery: buildGalleryForType('Fish', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-fish-350g.png',
      heroScene: 'assets/images/products/pickle-fish-front-with-bg-350g.png',
    },
    relatedSlugs: ['chicken-pickle', 'squid-pickle', 'mutton-pickle', 'garlic-pickle'],
  },
  {
    id: 'prawn-pickle',
    slug: 'prawn-pickle',
    name: 'Prawn Pickle',
    pickleType: 'Prawn',
    category: 'non-veg',
    categoryLabel: 'Meat & Seafood',
    shortDescription: 'Succulent prawns pickled in aromatic South Indian spices and gingelly oil.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with coastal prawns, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, savoury flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Prawn Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Prawn, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 18 g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 479,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 479,
        cardPrice: 479,
        jarImage: 'assets/images/products/pickle-prawn-front-png-350g.png',
        gallery: buildGalleryForType('Prawn', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 319,
        cardPrice: 319,
        jarImage: 'assets/images/products/pickle-prawn-front-png-200g.png',
        gallery: buildGalleryForType('Prawn', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-prawn-350g.png',
      heroScene: 'assets/images/products/pickle-prawn-front-with-bg-350g.png',
    },
    relatedSlugs: ['fish-pickle', 'squid-pickle', 'mutton-pickle', 'garlic-pickle'],
  },
  {
    id: 'squid-pickle',
    slug: 'squid-pickle',
    name: 'Squid Pickle',
    pickleType: 'Squid',
    category: 'non-veg',
    categoryLabel: 'Meat & Seafood',
    shortDescription: 'Bold, spicy squid pickle slow-simmered with roasted South Indian masalas.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with tender squid, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, savoury flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Squid Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Squid, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 18 g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 449,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 449,
        cardPrice: 449,
        jarImage: 'assets/images/products/pickle-squid-front-png-350g.png',
        gallery: buildGalleryForType('Squid', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 299,
        cardPrice: 299,
        jarImage: 'assets/images/products/pickle-squid-front-png-200g.png',
        gallery: buildGalleryForType('Squid', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-squid-350g.png',
      heroScene: 'assets/images/products/pickle-squid-front-with-bg-350g.png',
    },
    relatedSlugs: ['fish-pickle', 'chicken-pickle', 'mutton-pickle', 'garlic-pickle'],
  },
  {
    id: 'tomato-pickle',
    slug: 'tomato-pickle',
    name: 'Tomato Pickle',
    pickleType: 'Tomato',
    category: 'veg',
    categoryLabel: 'Vegetarian',
    shortDescription: 'Sun-ripened tangy tomato pickle tempered with mustard, garlic, and curry leaves.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with sun-ripened tomatoes, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, tangy flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Tomato Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Tomato, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 1.9g – 3.0g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 199,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 199,
        cardPrice: 199,
        jarImage: 'assets/images/products/pickle-tomato-front-png-350g.png',
        gallery: buildGalleryForType('Tomato', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 139,
        cardPrice: 139,
        jarImage: 'assets/images/products/pickle-tomato-front-png-200g.png',
        gallery: buildGalleryForType('Tomato', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-tomato-350g.png',
      heroScene: 'assets/images/products/pickle-tomato-front-with-bg-350g.png',
    },
    relatedSlugs: ['mango-pickle', 'garlic-pickle', 'lemon-pickle', 'fish-pickle'],
  },
  {
    id: 'mango-pickle',
    slug: 'mango-pickle',
    name: 'Mango Pickle',
    pickleType: 'Mango',
    category: 'veg',
    categoryLabel: 'Vegetarian',
    shortDescription: 'Classic raw mango pickle steeped in cold-pressed gingelly oil and heirloom spices.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with crisp raw mangoes, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a rich, tangy flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Mango Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Mango, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 1.5g – 2.0g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 229,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 229,
        cardPrice: 229,
        jarImage: 'assets/images/products/pickle-mango-front-png-350g.png',
        gallery: buildGalleryForType('Mango', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 159,
        cardPrice: 159,
        jarImage: 'assets/images/products/pickle-mango-front-png-200g.png',
        gallery: buildGalleryForType('Mango', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-mango-350g.png',
      heroScene: 'assets/images/products/pickle-mango-front-with-bg-350g.png',
    },
    relatedSlugs: ['tomato-pickle', 'garlic-pickle', 'lemon-pickle', 'chicken-pickle'],
  },
  {
    id: 'lemon-pickle',
    slug: 'lemon-pickle',
    name: 'Lemon Pickle',
    pickleType: 'Lemon',
    category: 'veg',
    categoryLabel: 'Vegetarian',
    shortDescription: 'Zesty sun-cured lemon pickle bursting with tangy citrus and roasted fenugreek.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with juicy lemons, gingelly oil, and a traditional blend of Indian spices. Red chilli, garlic, ginger, mustard seeds, and aromatic curry leaves bring together a bright, zesty flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Lemon Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Lemon, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 2.0g – 4.1g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 199,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 199,
        cardPrice: 199,
        jarImage: 'assets/images/products/pickle-lemon-front-png-350g.png',
        gallery: buildGalleryForType('Lemon', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 139,
        cardPrice: 139,
        jarImage: 'assets/images/products/pickle-lemon-front-png-200g.png',
        gallery: buildGalleryForType('Lemon', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-lemon-350g.png',
      heroScene: 'assets/images/products/pickle-lemon-front-with-bg-350g.png',
    },
    relatedSlugs: ['mango-pickle', 'tomato-pickle', 'garlic-pickle', 'squid-pickle'],
  },
  {
    id: 'garlic-pickle',
    slug: 'garlic-pickle',
    name: 'Garlic Pickle',
    pickleType: 'Garlic',
    category: 'veg',
    categoryLabel: 'Vegetarian',
    shortDescription: 'Whole peeled garlic cloves slow-cooked in tangy tamarind, chilli, and gingelly oil.',
    tasteProfile: 'Spicy, tangy, sour, savory, or mild',
    fullDescription:
      'Prepared with whole garlic cloves, gingelly oil, and a traditional blend of Indian spices. Red chilli, ginger, mustard seeds, fenugreek, and aromatic curry leaves bring together a rich, savoury flavour with a distinctive spicy kick.',
    pairingSuggestions: {
      prefix: 'Enjoy Mama’s Garlic Pickle with',
      highlight: 'steamed rice, curd rice, dosa, idli, chapati, or your favorite South Indian meal.',
      suffix: 'A flavorful accompaniment for everyday lunches and dinners.',
    },
    shelfLife: {
      highlight: 'Best before 6 months',
      text: 'from the date of packing, subject to confirmation against your validated shelf life and applicable labelling requirements.',
    },
    storageInstructions: {
      highlight: 'Store in a cool, dry place away from direct sunlight',
      text: 'Refrigerate after opening and use a clean, dry spoon when serving.',
    },
    ingredients:
      'Garlic, Edible Vegetable Oil (Gingelly Oil), Red Chilli, Salt, Garlic, Ginger, Mustard Seeds, Fenugreek Seeds, Curry Leaves, Spices & Condiments.',
    nutritionalInfo: {
      heading: 'Approximate values per 100 g:',
      values:
        'Energy: 298 kcal, Protein: 1.2g – 2.5g, Carbohydrate: 4 g, Total Fat: 24 g, Saturated Fat: 6 g, Trans Fat: 0 g, Sodium: 1,200 mg.',
    },
    rating: {
      score: '4.1',
      count: 2400,
      reviewsText: '(2400) Reviews',
    },
    cardPrice: 249,
    defaultSize: '350g',
    sizes: {
      '350g': {
        size: '350g',
        displayChip: '350 g',
        price: 249,
        cardPrice: 249,
        jarImage: 'assets/images/products/pickle-garlic-front-png-350g.png',
        gallery: buildGalleryForType('Garlic', '350g'),
      },
      '200g': {
        size: '200g',
        displayChip: '200 g',
        price: 169,
        cardPrice: 169,
        jarImage: 'assets/images/products/pickle-garlic-front-png-200g.png',
        gallery: buildGalleryForType('Garlic', '200g'),
      },
    },
    images: {
      card: 'assets/images/products/product-garlic-350g.png',
      heroScene: 'assets/images/products/pickle-garlic-front-with-bg-350g.png',
    },
    relatedSlugs: ['fish-pickle', 'squid-pickle', 'mutton-pickle', 'mango-pickle'],
  },
];

/**
 * Helper to look up a product by its URL slug.
 * @param {string} slug
 * @returns {object | null}
 */
function getProductBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return PRODUCTS_DATA.find((item) => item.slug === normalized) || null;
}

/**
 * Helper to resolve the current product slug from the URL query string (?product= or ?slug=)
 * or URL hash (#chicken-pickle).
 * @returns {string}
 */
function resolveProductSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('product') || params.get('slug');
  if (querySlug) return querySlug.trim().toLowerCase();

  const hashSlug = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hashSlug) return hashSlug;

  return 'chicken-pickle';
}

if (typeof window !== 'undefined') {
  window.PRODUCTS_DATA = PRODUCTS_DATA;
  window.getProductBySlug = getProductBySlug;
  window.resolveProductSlugFromUrl = resolveProductSlugFromUrl;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRODUCTS_DATA, getProductBySlug, resolveProductSlugFromUrl };
}
