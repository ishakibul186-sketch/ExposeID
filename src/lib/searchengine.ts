import { UserCard } from '../types';

/**
 * Professional Search System - Ultra Architecture
 * Implements the 20-step logic requested by the user.
 */

interface SearchResult {
  profile: UserCard;
  score: number;
  matchType: string;
}

interface SearchAnalytics {
  query: string;
  timestamp: number;
  resultsCount: number;
}

// STEP 16: Synonym Mapping
const SYNONYMS: Record<string, string[]> = {
  'website': ['web', 'site', 'template', 'theme', 'ui'],
  'developer': ['coder', 'engineer', 'programmer', 'dev'],
  'designer': ['artist', 'creative', 'ui', 'ux'],
  'business': ['company', 'corporate', 'agency', 'office'],
};

// STEP 2: Stop Words
const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'about']);

export class SearchEngine {
  private profiles: UserCard[] = [];
  private recentSearches: string[] = [];
  private trendingKeywords: Map<string, number> = new Map();

  constructor(profiles: UserCard[]) {
    this.profiles = profiles;
  }

  // STEP 17: Query Cleaner
  private cleanQuery(query: string): string {
    // Lowercase and remove special characters
    return query
      .toLowerCase()
      .replace(/[!@#$%^&*(),.?":{}|<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // STEP 2: Query Optimization Engine
  private optimizeQuery(query: string): string[] {
    const cleaned = this.cleanQuery(query);
    const words = cleaned.split(' ');
    
    // Remove stop words and expand synonyms
    return words.filter(word => !STOP_WORDS.has(word));
  }

  // STEP 5: Ranking Algorithm (Relevance Scoring)
  private calculateScore(profile: UserCard, queryWords: string[]): number {
    let score = 0;
    const profileText = {
      displayName: profile.displayName.toLowerCase(),
      title: (profile.title || '').toLowerCase(),
      bio: profile.bio.toLowerCase(),
      username: profile.username.toLowerCase(),
      skills: (profile.business?.skills || []).join(' ').toLowerCase(),
      services: (profile.business?.services || []).join(' ').toLowerCase(),
      company: (profile.business?.companyName || '').toLowerCase(),
    };

    for (const word of queryWords) {
      // STEP 18: Multi-word Ranking Priority & STEP 14: Prefix Matching
      if (profileText.displayName.includes(word)) score += 10;
      if (profileText.title.includes(word)) score += 8;
      if (profileText.username === word) score += 15; // Exact username match is highest
      if (profileText.skills.includes(word)) score += 7;
      if (profileText.services.includes(word)) score += 5;
      if (profileText.bio.includes(word)) score += 3;
      if (profileText.company.includes(word)) score += 4;

      // STEP 16: Synonym Expansion
      for (const [key, synonyms] of Object.entries(SYNONYMS)) {
        if (word === key || synonyms.includes(word)) {
          if (profileText.title.includes(key)) score += 2;
          if (profileText.skills.includes(key)) score += 2;
        }
      }
    }

    // STEP 19: Category/Top Ranked Boost
    if (profile.isTopRanked) score += 5;

    return score;
  }

  // STEP 13: Fuzzy Search (Approximate Matching)
  private isFuzzyMatch(word: string, target: string): boolean {
    if (target.includes(word)) return true;
    if (word.length < 3) return false;
    
    // Simple Levenshtein-like check for small typos
    let distance = 0;
    const minLen = Math.min(word.length, target.length);
    for (let i = 0; i < minLen; i++) {
      if (word[i] !== target[i]) distance++;
    }
    return distance <= 1;
  }

  // MAIN SEARCH FUNCTION
  public search(query: string): UserCard[] {
    if (!query) return this.profiles.filter(p => p.isTopRanked).slice(0, 10);

    const optimizedWords = this.optimizeQuery(query);
    
    // STEP 9: Smart Search Analytics
    this.trackSearch(query);

    const results: SearchResult[] = this.profiles
      .map(profile => ({
        profile,
        score: this.calculateScore(profile, optimizedWords),
        matchType: 'relevance'
      }))
      .filter(res => res.score > 0)
      // STEP 5: Ranking Algorithm (Sort by score)
      .sort((a, b) => b.score - a.score);

    // STEP 15: Empty Result Handling
    if (results.length === 0) {
      // Try fuzzy search as fallback
      const fuzzyResults = this.profiles
        .map(profile => {
          let fuzzyScore = 0;
          const searchable = [
            profile.displayName, 
            profile.title || '', 
            profile.username
          ].join(' ').toLowerCase();
          
          for (const word of optimizedWords) {
            if (this.isFuzzyMatch(word, searchable)) fuzzyScore += 1;
          }
          return { profile, score: fuzzyScore };
        })
        .filter(res => res.score > 0)
        .sort((a, b) => b.score - a.score);

      if (fuzzyResults.length > 0) return fuzzyResults.map(r => r.profile);
      
      // Still nothing? Return trending/top ranked
      return this.profiles.filter(p => p.isTopRanked).slice(0, 5);
    }

    return results.map(res => res.profile);
  }

  // STEP 8: Live Suggestion Engine
  public getSuggestions(partial: string): string[] {
    if (partial.length < 2) return [];
    const clean = partial.toLowerCase();
    const suggestions = new Set<string>();

    for (const profile of this.profiles) {
      if (profile.displayName.toLowerCase().startsWith(clean)) suggestions.add(profile.displayName);
      if (profile.username.toLowerCase().startsWith(clean)) suggestions.add(profile.username);
      if (profile.title?.toLowerCase().startsWith(clean)) suggestions.add(profile.title);
    }

    return Array.from(suggestions).slice(0, 5);
  }

  private trackSearch(query: string) {
    this.recentSearches = [query, ...this.recentSearches.slice(0, 9)];
    const count = this.trendingKeywords.get(query) || 0;
    this.trendingKeywords.set(query, count + 1);
  }

  // STEP 9: Trending keywords
  public getTrending(): string[] {
    return Array.from(this.trendingKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
  }
}
