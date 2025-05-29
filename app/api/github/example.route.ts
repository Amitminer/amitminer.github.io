import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub API proxy endpoint
 * 
 * Usage examples:
 * 1. Fetch user repos:
 *    GET {BackendURL}?endpoint=/users/username/repos
 * 
 * 2. Fetch specific repo:
 *    GET {BackendURL}?endpoint=/repos/username/repo-name
 * 
 * 3. Fetch with caching:
 *    GET {BackendURL}?endpoint=/users/username/repos&cache=true
 * 
 * 4. Fetch skills (with specific cache):
 *    GET {BackendURL}?endpoint=/users/username/repos&cache=skills
 * 
 * Query Parameters:
 * - endpoint: Required. The GitHub API endpoint to proxy (must start with /)
 * - cache: Set to 'true' or 'skills' to enable caching
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const cacheParam = searchParams.get('cache'); // e.g., 'true' or 'skills'

    if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint parameter required' }, { status: 400 });
    }

    const CACHE_DURATION = 1000 * 60 * 60 * 24 * 14; // 14 days
    const now = Date.now();

    // Simple in-memory cache
    const cache: Record<string, { data: any; lastUpdated: number }> = {};

    const shouldUseCache = cacheParam === 'true' || cacheParam === 'skills';

    try {
        if (shouldUseCache) {
            if (cache[endpoint] && now - cache[endpoint].lastUpdated < CACHE_DURATION) {
                return NextResponse.json(cache[endpoint].data);
            }
        }

        const headers: HeadersInit = {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-Website',
        };

        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        const url = `https://api.github.com${endpoint}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === 403) {
                return NextResponse.json(
                    { error: 'GitHub API rate limit exceeded' },
                    { status: 429 }
                );
            }
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Repository not found' },
                    { status: 404 }
                );
            }
            const errorText = await response.text();
            return NextResponse.json(
                { error: `GitHub API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (shouldUseCache) {
            cache[endpoint] = {
                data,
                lastUpdated: now,
            };
        }

        return NextResponse.json(data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes('fetch failed') || (error as any).code === 'ENOTFOUND') {
                return NextResponse.json(
                    { error: 'Network connectivity issue - cannot reach GitHub API' },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: `Failed to fetch from GitHub API: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'An unknown error occurred' },
            { status: 500 }
        );
    }
}
