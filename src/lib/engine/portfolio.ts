import { asScore } from "../utils";

export interface PortfolioReport {
  url: string;
  reachable: boolean;
  portfolioScore: number;
  metrics: { seo: number; mobile: number; performance: number; accessibility: number; branding: number };
  signals: string[];
  recommendations: string[];
}

/**
 * Portfolio Website Analyzer. Fetches the live page and inspects the real HTML
 * for SEO (title/meta/OG), mobile-friendliness (viewport), accessibility (lang,
 * alt text), a performance proxy (HTML weight, script count) and branding.
 */
export async function analyzePortfolio(rawUrl: string): Promise<PortfolioReport> {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const fail: PortfolioReport = {
    url,
    reachable: false,
    portfolioScore: 0,
    metrics: { seo: 0, mobile: 0, performance: 0, accessibility: 0, branding: 0 },
    signals: [],
    recommendations: ["Could not reach the site. Check the URL is public and live."],
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KVAI-Resume-Bot/1.0)" },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return fail;
    const html = await res.text();
    const lower = html.toLowerCase();
    const bytes = Buffer.byteLength(html);

    const hasTitle = /<title[^>]*>[^<]{3,}<\/title>/i.test(html);
    const hasDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html);
    const hasOg = /<meta[^>]+property=["']og:/i.test(html);
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasLang = /<html[^>]+lang=/i.test(html);
    const imgCount = (lower.match(/<img/g) ?? []).length;
    const altCount = (lower.match(/<img[^>]+alt=/g) ?? []).length;
    const scriptCount = (lower.match(/<script/g) ?? []).length;
    const hasH1 = /<h1[^>]*>/i.test(html);

    const seo = asScore(
      (hasTitle ? 30 : 0) + (hasDescription ? 30 : 0) + (hasOg ? 25 : 0) + (hasH1 ? 15 : 0),
    );
    const mobile = asScore(hasViewport ? 100 : 35);
    const accessibility = asScore(
      (hasLang ? 30 : 0) +
        (imgCount === 0 ? 40 : (altCount / imgCount) * 40) +
        (hasH1 ? 30 : 0),
    );
    // Performance proxy: lighter HTML + fewer blocking scripts scores higher.
    const performance = asScore(
      (bytes < 150_000 ? 55 : bytes < 400_000 ? 40 : 25) +
        (scriptCount < 10 ? 45 : scriptCount < 25 ? 30 : 15),
    );
    const branding = asScore((hasOg ? 40 : 0) + (hasTitle ? 30 : 0) + (hasH1 ? 30 : 0));

    const portfolioScore = asScore(
      seo * 0.28 + mobile * 0.22 + performance * 0.2 + accessibility * 0.2 + branding * 0.1,
    );

    const signals: string[] = [];
    if (hasViewport) signals.push("Mobile viewport configured");
    if (hasTitle && hasDescription) signals.push("SEO title + meta description present");
    if (hasOg) signals.push("Open Graph social tags present");

    const recommendations: string[] = [];
    if (!hasDescription) recommendations.push("Add a meta description (20-160 chars) for better SEO.");
    if (!hasViewport) recommendations.push("Add a responsive viewport meta tag for mobile.");
    if (!hasOg) recommendations.push("Add Open Graph tags so links preview well when shared.");
    if (imgCount > 0 && altCount / imgCount < 0.8) recommendations.push("Add alt text to images for accessibility.");
    if (scriptCount >= 25) recommendations.push("Reduce script count / bundle size to improve load speed.");
    if (!recommendations.length) recommendations.push("Solid fundamentals — consider a Lighthouse audit to fine-tune.");

    return { url, reachable: true, portfolioScore, metrics: { seo, mobile, performance, accessibility, branding }, signals, recommendations };
  } catch {
    return fail;
  }
}
