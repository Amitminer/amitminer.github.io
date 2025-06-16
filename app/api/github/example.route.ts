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

const CACHE_DURATION = 1000 * 60 * 60 * 24 * 14; // 14 days
const MAX_CACHE_SIZE = 100; // Maximum number of cache entries
const MAX_CACHE_ITEM_SIZE = 1024 * 1024; // 1MB per cache item

interface CacheEntry {
    data: any;
    lastUpdated: number;
    size: number;
}

class CacheManager {
    private cache: Map<string, CacheEntry> = new Map();
    private lastCleanup: number = Date.now();
    private readonly cleanupInterval = 1000 * 60 * 60; // 1 hour

    private cleanup() {
        const now = Date.now();
        if (now - this.lastCleanup < this.cleanupInterval) return;

        // Remove expired entries
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.lastUpdated > CACHE_DURATION) {
                this.cache.delete(key);
            }
        }

        // If still over size limit, remove oldest entries
        if (this.cache.size > MAX_CACHE_SIZE) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);
            
            while (this.cache.size > MAX_CACHE_SIZE) {
                const [key] = entries.shift()!;
                this.cache.delete(key);
            }
        }

        this.lastCleanup = now;
    }

    get(key: string): any | null {
        this.cleanup();
        const entry = this.cache.get(key);
        if (!entry) return null;
        
        if (Date.now() - entry.lastUpdated > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    set(key: string, data: any): boolean {
        this.cleanup();
        
        const size = JSON.stringify(data).length;
        if (size > MAX_CACHE_ITEM_SIZE) return false;

        this.cache.set(key, {
            data,
            lastUpdated: Date.now(),
            size
        });

        return true;
    }
}

const cacheManager = new CacheManager();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const cacheParam = searchParams.get('cache');

    if (!endpoint) {
        return NextResponse.json({ error: 'Endpoint parameter required' }, { status: 400 });
    }

    if (!endpoint.startsWith('/')) {
        return NextResponse.json({ error: 'Endpoint must start with /' }, { status: 400 });
    }

    const shouldUseCache = cacheParam === 'true' || cacheParam === 'skills';

    try {
        if (shouldUseCache) {
            const cachedData = cacheManager.get(endpoint);
            if (cachedData) {
                return NextResponse.json(cachedData);
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
            const errorText = await response.text();
            let errorMessage = `GitHub API error: ${response.status}`;
            let statusCode = response.status;

            switch (response.status) {
                case 403:
                    errorMessage = 'GitHub API rate limit exceeded';
                    statusCode = 429;
                    break;
                case 404:
                    errorMessage = 'Resource not found';
                    break;
                case 401:
                    errorMessage = 'Authentication failed';
                    break;
                case 422:
                    errorMessage = 'Validation failed';
                    break;
                case 503:
                    errorMessage = 'GitHub API is temporarily unavailable';
                    break;
                default:
                    if (errorText) {
                        try {
                            const errorJson = JSON.parse(errorText);
                            errorMessage = errorJson.message || errorMessage;
                        } catch {
                            errorMessage += ` - ${errorText}`;
                        }
                    }
            }

            return NextResponse.json({ error: errorMessage }, { status: statusCode });
        }

        const data = await response.json();

        if (shouldUseCache) {
            const cacheSuccess = cacheManager.set(endpoint, data);
            if (!cacheSuccess) {
                console.warn(`Failed to cache data for endpoint: ${endpoint} - Data too large`);
            }
        }

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('GitHub API error:', error);

        if (error instanceof Error) {
            if (error.message.includes('fetch failed') || (error as any).code === 'ENOTFOUND') {
                return NextResponse.json(
                    { error: 'Network connectivity issue - cannot reach GitHub API' },
                    { status: 503 }
                );
            }

            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                return NextResponse.json(
                    { error: 'Failed to connect to GitHub API - please check your internet connection' },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: `Failed to fetch from GitHub API: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred while processing the request' },
            { status: 500 }
        );
    }
}
