import fs from 'fs';
import path from 'path';

const DB_URL = "https://shakibul-islam-ltd-server-default-rtdb.firebaseio.com";
const BASE_URL = "https://exposeid.vercel.app";

async function generateUserProfileSitemap() {
  try {
    console.log('Fetching user accounts...');
    const response = await fetch(`${DB_URL}/accounts.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`);
    }
    const accounts = await response.json();

    // --- DEBUGGING: Log the fetched data structure ---
    console.log('--- Fetched Accounts Data ---');
    console.log(JSON.stringify(accounts, null, 2));
    console.log('-----------------------------');

    if (!accounts) {
      console.log('No accounts found.');
      return;
    }

    const urls = Object.values(accounts).flatMap((account: any) => {
      if (!account.cards) return [];
      return Object.values(account.cards).map((card: any) => {
        if (card.username) {
          return `  <url>
    <loc>${BASE_URL}/${card.username}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>0.80</priority>
  </url>`;
        }
        return null;
      });
    }).filter(Boolean);

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    // Correctly resolve the path to the public directory
    const rootDir = process.cwd();
    const sitemapPath = path.join(rootDir, 'public', 'sitemap-userprofile.xml');
    
    fs.writeFileSync(sitemapPath, sitemapContent);

    console.log(`✅ Successfully generated sitemap with ${urls.length} user profiles.`);
    console.log(`Sitemap written to: ${sitemapPath}`);

  } catch (error) {
    console.error('Error generating user profile sitemap:', error);
  }
}

generateUserProfileSitemap();
