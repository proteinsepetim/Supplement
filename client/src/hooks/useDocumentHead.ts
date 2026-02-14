/*
 * useDocumentHead - Sayfa bazlı SEO meta tag yönetimi
 * title, description, canonical, og, noindex, schema JSON-LD
 */
import { useEffect } from 'react';

interface HeadOptions {
  title: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
}

const BASE_URL = 'https://proteinmkt-nnma2hgu.manus.space';
const SITE_NAME = 'ProteinMarket';

export function useDocumentHead(options: HeadOptions) {
  useEffect(() => {
    const { title, description, canonical, noindex, ogImage, ogType, schema } = options;

    // Title
    document.title = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    // Meta description
    setMeta('description', description || 'ProteinMarket - Premium sporcu gıdaları ve takviye ürünleri. Orijinal ürün garantisi, hızlı kargo.');

    // Canonical
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}${window.location.pathname}`;
    setLink('canonical', canonicalUrl);

    // Robots
    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow');
    }

    // Open Graph
    setMeta('og:title', title, 'property');
    setMeta('og:description', description || '', 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:type', ogType || 'website', 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    if (ogImage) setMeta('og:image', ogImage, 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description || '');
    if (ogImage) setMeta('twitter:image', ogImage);

    // JSON-LD Schema
    const existingSchemas = document.querySelectorAll('script[data-seo-schema]');
    existingSchemas.forEach(el => el.remove());

    if (schema) {
      const schemas = Array.isArray(schema) ? schema : [schema];
      schemas.forEach(s => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-schema', 'true');
        script.textContent = JSON.stringify(s);
        document.head.appendChild(script);
      });
    }

    return () => {
      const cleanupSchemas = document.querySelectorAll('script[data-seo-schema]');
      cleanupSchemas.forEach(el => el.remove());
    };
  }, [options.title, options.description, options.canonical, options.noindex, options.ogImage, options.ogType]);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

// Schema helpers
export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ProteinMarket',
    url: BASE_URL,
    description: 'Premium sporcu gıdaları ve takviye ürünleri e-ticaret mağazası',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+905001234567',
      contactType: 'customer service',
      availableLanguage: 'Turkish',
    },
  };
}

export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ProteinMarket',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/kategori/protein-tozu?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function createProductSchema(product: {
  name: string;
  description: string;
  image: string;
  slug: string;
  brand: string;
  sku: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${BASE_URL}/urun/${product.slug}`,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'ProteinMarket' },
    },
    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    } : undefined,
  };
}

export function createFAQSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'ProteinMarket',
    url: BASE_URL,
    description: 'Premium sporcu gıdaları ve takviye ürünleri e-ticaret mağazası. Orijinal ürün garantisi, aynı gün kargo.',
    image: `${BASE_URL}/logo.png`,
    telephone: '+905001234567',
    email: 'info@proteinmarket.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'İstanbul',
      addressRegion: 'İstanbul',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0082,
      longitude: 28.9784,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '₺₺',
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Kredi Kartı, Banka Kartı, Havale/EFT',
    areaServed: {
      '@type': 'Country',
      name: 'Türkiye',
    },
    sameAs: [
      'https://www.instagram.com/proteinmarket',
      'https://www.facebook.com/proteinmarket',
      'https://twitter.com/proteinmarket',
    ],
  };
}

export function createItemListSchema(products: {
  name: string;
  slug: string;
  image: string;
  price: number;
}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/urun/${p.slug}`,
      name: p.name,
      image: p.image,
    })),
  };
}

export function createOfferCatalogSchema(categoryName: string, products: {
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `${categoryName} - ProteinMarket`,
    itemListElement: products.map(p => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Product',
        name: p.name,
        url: `${BASE_URL}/urun/${p.slug}`,
      },
      priceCurrency: 'TRY',
      price: p.price,
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    })),
  };
}
