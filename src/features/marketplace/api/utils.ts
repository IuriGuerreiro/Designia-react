import type { PaginatedResponse, Product, ProductImage, ProductListItem } from '../../../types/marketplace';

export type WithProductMedia = {
  primary_image?: ProductImage | null;
  images?: ProductImage[] | null;
};

const PLACEHOLDER_IMAGE = '/placeholder-product.png';

const selectImageUrl = (image?: ProductImage | null) => {
  if (!image) {
    return { url: PLACEHOLDER_IMAGE, source: 'placeholder' as const };
  }

  const candidates: Array<'presigned_url' | 'image_url' | 'image'> = ['presigned_url', 'image_url', 'image'];
  for (const candidate of candidates) {
    const value = image[candidate];
    if (value && value !== 'null') {
      return { url: value, source: candidate };
    }
  }

  return { url: PLACEHOLDER_IMAGE, source: 'placeholder' as const };
};

const enhanceImage = (image?: ProductImage | null): ProductImage | undefined => {
  if (!image) {
    return undefined;
  }

  const { url, source } = selectImageUrl(image);
  return {
    ...image,
    display_url: url,
    url_source: source as ProductImage['url_source'],
  };
};

export const normalizeProductMedia = <T extends WithProductMedia>(entity: T): T => {
  if (!entity) {
    return entity;
  }

  const next: T & WithProductMedia = { ...entity };

  if (entity.primary_image) {
    next.primary_image = enhanceImage(entity.primary_image) ?? entity.primary_image;
  }

  if (entity.images) {
    next.images = entity.images
      ?.filter((image): image is ProductImage => Boolean(image))
      .map((image) => enhanceImage(image) ?? image) ?? null;
  }

  return next;
};

export const normalizeProductCollection = <T extends WithProductMedia>(
  data: PaginatedResponse<T> | T[] | null | undefined,
): typeof data => {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeProductMedia<T>);
  }

  if ('results' in data && Array.isArray(data.results)) {
    return {
      ...data,
      results: data.results.map(normalizeProductMedia<T>),
    };
  }

  return data;
};

export const normalizeProduct = <T extends Product | ProductListItem>(product: T): T =>
  normalizeProductMedia(product);

export const buildQueryString = (filters?: unknown): string => {
  if (!filters || typeof filters !== 'object') {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(filters as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.append(key, value.map(String).join(','));
      }
      return;
    }

    params.append(key, String(value));
  });

  return params.toString();
};
