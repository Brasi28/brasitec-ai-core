export type RepoSearchResult = {
  fullName: string;
  stars: number;
  description: string | null;
  url: string;
};

export type DownloadedFile = {
  repository: string;
  path: string;
  snippet: string;
};

export type PatternAnalysis = {
  pattern: string;
  matches: number;
};

export type ScannerSummary = {
  repositories: number;
  filesAnalyzed: number;
  topPatterns: PatternAnalysis[];
};

type GitHubRepo = {
  full_name: string;
  stargazers_count: number;
  description: string | null;
  html_url: string;
};

type GitHubCodeItem = {
  path: string;
  repository: {
    full_name: string;
  };
};

type SearchResponse<T> = {
  items: T[];
};

const githubApi = "https://api.github.com";

function tokenHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function searchPublicReposByTopic(topic: string, language?: string, limit = 10): Promise<RepoSearchResult[]> {
  const cappedLimit = Math.max(1, Math.min(limit, 50));
  const query = [`topic:${topic}`, language ? `language:${language}` : ""].filter(Boolean).join(" ");
  const url = `${githubApi}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${cappedLimit}`;

  const response = await fetch(url, { headers: tokenHeaders() });
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}) buscando repositorios`);
  }

  const payload = (await response.json()) as SearchResponse<GitHubRepo>;
  return payload.items.map((item) => ({
    fullName: item.full_name,
    stars: item.stargazers_count,
    description: item.description,
    url: item.html_url
  }));
}

export async function downloadRelevantFiles(query: string, language?: string, limit = 5): Promise<DownloadedFile[]> {
  const cappedLimit = Math.max(1, Math.min(limit, 10));
  const searchQuery = [query, language ? `language:${language}` : ""].filter(Boolean).join(" ");
  const url = `${githubApi}/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${cappedLimit}`;

  const response = await fetch(url, { headers: tokenHeaders() });
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}) buscando codigo`);
  }

  const payload = (await response.json()) as SearchResponse<GitHubCodeItem>;
  const files = await Promise.all(
    payload.items.map(async (item) => {
      const rawUrl = `https://raw.githubusercontent.com/${item.repository.full_name}/HEAD/${item.path}`;
      const rawResponse = await fetch(rawUrl, { headers: tokenHeaders() });
      const text = rawResponse.ok ? await rawResponse.text() : "Snippet no disponible.";
      return {
        repository: item.repository.full_name,
        path: item.path,
        snippet: text.slice(0, 1600)
      };
    })
  );

  return files;
}

export function analyzeCodePatterns(files: DownloadedFile[], patterns: string[]): PatternAnalysis[] {
  return patterns.map((pattern) => {
    const matcher = new RegExp(pattern, "gi");
    const matches = files.reduce((acc, file) => acc + (file.snippet.match(matcher)?.length || 0), 0);
    return { pattern, matches };
  });
}

export function generateSummary(files: DownloadedFile[], topPatterns: PatternAnalysis[]): ScannerSummary {
  const repoSet = new Set(files.map((file) => file.repository));
  return {
    repositories: repoSet.size,
    filesAnalyzed: files.length,
    topPatterns
  };
}

export function buildExamplesForAgent(files: DownloadedFile[]): string[] {
  return files.map((file) => `${file.repository}::${file.path}\n${file.snippet}`);
}
