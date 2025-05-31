import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies GET requests to the GitHub API with optional in-memory caching.
 *
 * Accepts a required `endpoint` query parameter specifying the GitHub API path to fetch, and an optional `cache` parameter to enable caching for up to 14 days. Handles GitHub API errors and network issues, returning appropriate HTTP status codes and error messages.
 *
 * @returns A {@link NextResponse} containing the proxied GitHub API response data or an error message.
 *
 * @remark
 * - Returns 400 if the `endpoint` parameter is missing.
 * - Returns 429 if the GitHub API rate limit is exceeded.
 * - Returns 404 if the requested repository is not found.
 * - Returns 503 for network connectivity issues.
 * - Returns 500 for other errors.
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
