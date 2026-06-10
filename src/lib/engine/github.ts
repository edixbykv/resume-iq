import { asScore } from "../utils";

export interface GithubReport {
  username: string;
  found: boolean;
  githubScore: number;
  credibilityScore: number;
  publicRepos: number;
  followers: number;
  totalStars: number;
  topLanguages: Array<{ language: string; count: number }>;
  hasDocumentation: number; // % of top repos with a description
  signals: string[];
  recommendations: string[];
}

function parseUsername(input: string): string {
  const m = input.match(/github\.com\/([a-z0-9_-]+)/i);
  return (m ? m[1] : input).replace(/[^a-z0-9_-]/gi, "");
}

/**
 * GitHub Analyzer. Pulls real public data from the GitHub REST API and scores
 * repository quality, activity, tech diversity, documentation and credibility.
 */
export async function analyzeGithub(input: string): Promise<GithubReport> {
  const username = parseUsername(input);
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const empty: GithubReport = {
    username,
    found: false,
    githubScore: 0,
    credibilityScore: 0,
    publicRepos: 0,
    followers: 0,
    totalStars: 0,
    topLanguages: [],
    hasDocumentation: 0,
    signals: [],
    recommendations: ["Provide a valid public GitHub profile URL or username."],
  };

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) return empty;
    const user = await userRes.json();

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers },
    );
    const repos: Array<{
      stargazers_count: number;
      language: string | null;
      description: string | null;
      fork: boolean;
      updated_at: string;
    }> = reposRes.ok ? await reposRes.json() : [];

    const ownRepos = repos.filter((r) => !r.fork);
    const totalStars = ownRepos.reduce((a, r) => a + (r.stargazers_count || 0), 0);

    const langCounts = new Map<string, number>();
    for (const r of ownRepos) if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
    const topLanguages = [...langCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([language, count]) => ({ language, count }));

    const documented = ownRepos.filter((r) => r.description && r.description.length > 10).length;
    const hasDocumentation = ownRepos.length ? asScore((documented / ownRepos.length) * 100) : 0;

    // Recency: repos updated in the last 12 months.
    const yearAgo = Date.now() - 365 * 24 * 3600 * 1000;
    const recent = ownRepos.filter((r) => new Date(r.updated_at).getTime() > yearAgo).length;

    const githubScore = asScore(
      Math.min(ownRepos.length, 15) / 15 * 25 +
        Math.min(totalStars, 50) / 50 * 25 +
        Math.min(topLanguages.length, 5) / 5 * 20 +
        hasDocumentation * 0.15 +
        Math.min(recent, 10) / 10 * 15,
    );

    const credibilityScore = asScore(
      githubScore * 0.6 +
        Math.min(user.followers ?? 0, 100) / 100 * 25 +
        (totalStars > 10 ? 15 : totalStars),
    );

    const signals: string[] = [];
    if (ownRepos.length >= 8) signals.push(`${ownRepos.length} public repositories`);
    if (totalStars > 0) signals.push(`${totalStars} total stars earned`);
    if (topLanguages.length >= 3) signals.push(`Diverse stack: ${topLanguages.map((l) => l.language).slice(0, 4).join(", ")}`);
    if (recent >= 3) signals.push(`${recent} repos active in the last year`);

    const recommendations: string[] = [];
    if (hasDocumentation < 60) recommendations.push("Add clear READMEs/descriptions to your repositories.");
    if (totalStars < 5) recommendations.push("Build 1-2 portfolio-grade projects worth starring.");
    if (recent < 3) recommendations.push("Commit consistently — recent activity signals momentum.");
    if (topLanguages.length < 3) recommendations.push("Show range across more languages/frameworks.");

    return {
      username,
      found: true,
      githubScore,
      credibilityScore,
      publicRepos: ownRepos.length,
      followers: user.followers ?? 0,
      totalStars,
      topLanguages,
      hasDocumentation,
      signals,
      recommendations,
    };
  } catch {
    return empty;
  }
}
