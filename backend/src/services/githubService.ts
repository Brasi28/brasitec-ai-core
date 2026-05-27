type GitHubRepo = {
  full_name: string;
  stargazers_count: number;
  description: string | null;
  html_url: string;
};

type GitHubCodeResult = {
  name: string;
  path: string;
  html_url: string;
  repository: GitHubRepo;
};

type SearchResponse<T> = {
  items: T[];
};

export type PublicRepoSummary = {
  fullName: string;
  stars: number;
  description: string | null;
  url: string;
};

export type CodeExample = {
  repository: {
    fullName: string;
    url: string;
  };
  path: string;
  snippet: string;
};

const githubApiBase = "https://api.github.com";

function headers(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function searchPublicRepos(input: {
  topic: string;
  language?: string;
  limit?: number;
}): Promise<PublicRepoSummary[]> {
  const limit = Math.max(1, Math.min(input.limit ?? 10, 50));
  const query = [`topic:${input.topic}`, input.language ? `language:${input.language}` : ""]
    .filter(Boolean)
    .join(" ");

  const url = `${githubApiBase}/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit}&sort=stars&order=desc`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    throw new Error(`GitHub search error: ${response.status}`);
  }

  const data = (await response.json()) as SearchResponse<GitHubRepo>;
  return data.items.map((repo) => ({
    fullName: repo.full_name,
    stars: repo.stargazers_count,
    description: repo.description,
    url: repo.html_url
  }));
}

async function fetchRawSnippet(repoFullName: string, path: string): Promise<string> {
  const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/HEAD/${path}`;
  const response = await fetch(rawUrl, { headers: headers() });
  if (!response.ok) {
    return "Snippet no disponible (archivo binario o no accesible).";
  }
  const text = await response.text();
  return text.slice(0, 1200);
}

export async function getCodeExamples(input: {
  query: string;
  language?: string;
  maxExamples?: number;
}): Promise<CodeExample[]> {
  const maxExamples = Math.max(1, Math.min(input.maxExamples ?? 3, 10));
  const q = [input.query, input.language ? `language:${input.language}` : ""].filter(Boolean).join(" ");

  const url = `${githubApiBase}/search/code?q=${encodeURIComponent(q)}&per_page=${maxExamples}`;
  const response = await fetch(url, { headers: headers() });
  if (!response.ok) {
    throw new Error(`GitHub code search error: ${response.status}`);
  }

  const data = (await response.json()) as SearchResponse<GitHubCodeResult>;
  const examples = await Promise.all(
    data.items.map(async (item) => ({
      repository: {
        fullName: item.repository.full_name,
        url: item.repository.html_url
      },
      path: item.path,
      snippet: await fetchRawSnippet(item.repository.full_name, item.path)
    }))
  );

  return examples;
}

export function summarizeExamples(examples: CodeExample[]): string {
  if (!examples.length) {
    return "No se encontraron ejemplos.";
  }

  const byRepo: Record<string, number> = {};
  for (const example of examples) {
    byRepo[example.repository.fullName] = (byRepo[example.repository.fullName] || 0) + 1;
  }

  return Object.entries(byRepo)
    .map(([repo, count]) => `${repo}: ${count} ejemplo(s)`)
    .join(" | ");
}
