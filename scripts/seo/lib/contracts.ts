import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { parse as parseHtml } from 'node-html-parser';
import { XMLParser } from 'fast-xml-parser';

export const PolicySchema = z.object({
  $schema: z.string().optional(),
  version: z.literal(1),
  singleTenant: z.literal(true),
  rendering: z.literal('static'),
  newsArticle: z.object({
    requiredFields: z.array(z.string()).refine(
      (fields) =>
        ['headline', 'datePublished', 'dateModified', 'author', 'publisher', 'image'].every((f) =>
          fields.includes(f)
        ),
      { message: 'Missing required NewsArticle fields in policy' }
    ),
    authorTypes: z.array(z.string()).min(1),
    publisherTypes: z.array(z.string()).min(1)
  }),
  newsSitemap: z.object({
    maxAgeHours: z.literal(48),
    publicationNameRequired: z.literal(true),
    publicationLanguageRequired: z.literal(true)
  }),
  canonical: z.object({
    mustBeAbsolute: z.literal(true),
    mustBeUnique: z.literal(true)
  }),
  metadata: z.object({
    metaDescriptionRequired: z.literal(true),
    openGraphRequired: z.literal(true),
    twitterCardRequired: z.literal(true)
  }),
  images: z.object({
    dimensionsRequired: z.literal(true),
    altRequiredForInformative: z.literal(true),
    preferredFormats: z.array(z.string()).min(1)
  }),
  headings: z.object({
    singleH1: z.literal(true),
    semanticHierarchy: z.literal(true)
  }),
  internalLinking: z.object({
    supportedEntityRelations: z.array(z.string()).min(1),
    breadcrumbs: z.array(z.string()).min(1)
  }),
  performance: z.object({
    htmlFirst: z.literal(true),
    noUnnecessaryHydration: z.literal(true)
  }),
  aiSearch: z.object({
    distinguishSearchFromTrainingCrawlers: z.literal(true),
    trainingCrawlersOutOfScope: z.literal(true),
    disallowEquatingGptBotWithSearch: z.literal(true)
  })
});

export type Policy = z.infer<typeof PolicySchema>;

export const AuthorSchema = z.object({
  '@type': z.literal('Person'),
  name: z.string().min(1),
  url: z.string().min(1).optional()
});

export const PublisherSchema = z.object({
  '@type': z.literal('Organization'),
  name: z.string().min(1),
  logo: z.union([z.string().min(1), z.object({ '@type': z.literal('ImageObject'), url: z.string().min(1) })]).optional()
});

export const NewsArticleSchema = z.object({
  '@context': z.union([z.literal('https://schema.org'), z.literal('http://schema.org')]),
  '@type': z.literal('NewsArticle'),
  headline: z.string().min(1, 'headline is required and cannot be empty'),
  datePublished: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'datePublished must be a valid ISO date string'
  }),
  dateModified: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'dateModified must be a valid ISO date string'
  }),
  author: z.union([AuthorSchema, z.array(AuthorSchema).min(1)]),
  publisher: PublisherSchema,
  image: z.union([
    z.string().min(1),
    z.array(z.string().min(1)).min(1),
    z.object({
      '@type': z.literal('ImageObject'),
      url: z.string().min(1)
    })
  ])
});

export function loadAndValidatePolicy(customPath?: string): Policy {
  const targetPath = customPath ?? path.resolve(process.cwd(), 'seo', 'policy.json');
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Policy file not found at ${targetPath}`);
  }
  const raw = fs.readFileSync(targetPath, 'utf-8');
  const parsed = JSON.parse(raw);
  return PolicySchema.parse(parsed);
}

export function validateNewsArticleJsonLd(data: unknown) {
  return NewsArticleSchema.safeParse(data);
}

export interface NewsSitemapEntry {
  loc: string;
  publicationName: string;
  publicationLanguage: string;
  publicationDate: string;
  title: string;
}

export function validateNewsSitemapEntry(
  entry: NewsSitemapEntry,
  referenceTime = new Date(),
  maxAgeHours = 48
): { valid: boolean; error?: string } {
  if (!entry.publicationName || entry.publicationName.trim() === '') {
    return { valid: false, error: 'Missing or empty publication name' };
  }
  if (!entry.publicationLanguage || entry.publicationLanguage.trim() === '') {
    return { valid: false, error: 'Missing or empty publication language' };
  }
  if (!entry.title || entry.title.trim() === '') {
    return { valid: false, error: 'Missing or empty news title' };
  }
  const pubDate = new Date(entry.publicationDate);
  if (isNaN(pubDate.getTime())) {
    return { valid: false, error: `Invalid publication date: ${entry.publicationDate}` };
  }
  const ageMs = referenceTime.getTime() - pubDate.getTime();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  if (ageMs > maxAgeMs) {
    const ageHours = (ageMs / (1000 * 60 * 60)).toFixed(1);
    return {
      valid: false,
      error: `News item published ${ageHours}h ago exceeds maximum age of ${maxAgeHours}h`
    };
  }
  return { valid: true };
}

export function validateNewsSitemapXml(
  xmlContent: string,
  referenceTime = new Date(),
  maxAgeHours = 48
): { valid: boolean; errors: string[]; entryCount: number } {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  let parsedXml: Record<string, unknown>;
  try {
    parsedXml = parser.parse(xmlContent);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { valid: false, errors: [`XML parsing error: ${msg}`], entryCount: 0 };
  }

  const urlset = parsedXml.urlset as Record<string, unknown> | undefined;
  if (!urlset) {
    return { valid: false, errors: ['Missing <urlset> root tag'], entryCount: 0 };
  }

  const rawUrls = (Array.isArray(urlset.url) ? urlset.url : urlset.url ? [urlset.url] : []) as Record<string, unknown>[];
  const errors: string[] = [];
  let count = 0;

  for (const urlItem of rawUrls) {
    const news = (urlItem['news:news'] || urlItem.news) as Record<string, unknown> | undefined;
    if (!news) continue;
    count++;
    const publication = (news['news:publication'] || news.publication || {}) as Record<string, unknown>;
    const entry: NewsSitemapEntry = {
      loc: String(urlItem.loc || ''),
      publicationName: String(publication['news:name'] || publication.name || ''),
      publicationLanguage: String(publication['news:language'] || publication.language || ''),
      publicationDate: String(news['news:publication_date'] || news.publication_date || ''),
      title: String(news['news:title'] || news.title || '')
    };
    const check = validateNewsSitemapEntry(entry, referenceTime, maxAgeHours);
    if (!check.valid && check.error) {
      errors.push(`URL ${entry.loc || 'unknown'}: ${check.error}`);
    }
  }

  return { valid: errors.length === 0, errors, entryCount: count };
}

export interface LinkValidationResult {
  file: string;
  href: string;
  resolvedPath: string;
  exists: boolean;
}

export function validateInternalLinksInDirectory(distDir: string): LinkValidationResult[] {
  if (!fs.existsSync(distDir)) {
    throw new Error(`Directory ${distDir} does not exist`);
  }

  function getHtmlFiles(dir: string): string[] {
    let files: string[] = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(getHtmlFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const htmlFiles = getHtmlFiles(distDir);
  const results: LinkValidationResult[] = [];

  for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const root = parseHtml(content);
    const anchors = root.querySelectorAll('a[href]');

    for (const a of anchors) {
      const href = a.getAttribute('href')?.trim();
      if (!href) continue;

      // Ignore external protocols and non-page schemes
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#')
      ) {
        continue;
      }

      // Strip query parameters and anchors
      const cleanHref = href.split('?')[0].split('#')[0];
      if (!cleanHref && href.startsWith('#')) continue;

      // Resolve relative or root-relative path
      let candidatePath: string;
      if (cleanHref.startsWith('/')) {
        candidatePath = path.join(distDir, cleanHref);
      } else {
        candidatePath = path.join(path.dirname(filePath), cleanHref);
      }

      let exists = false;
      if (fs.existsSync(candidatePath)) {
        const stat = fs.statSync(candidatePath);
        if (stat.isDirectory()) {
          exists = fs.existsSync(path.join(candidatePath, 'index.html'));
        } else {
          exists = true;
        }
      } else {
        // Try appending .html or /index.html
        if (fs.existsSync(`${candidatePath}.html`)) {
          exists = true;
        } else if (fs.existsSync(path.join(candidatePath, 'index.html'))) {
          exists = true;
        }
      }

      results.push({
        file: filePath,
        href,
        resolvedPath: candidatePath,
        exists
      });
    }
  }

  return results;
}
