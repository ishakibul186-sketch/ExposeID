import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Dynamic SEO for Public Profiles
  app.get("/:username", async (req, res, next) => {
    const { username } = req.params;
    const reservedRoutes = ["dashboard", "analytics", "login", "searchresult", "api", "assets", "src", "node_modules", "@vite", "@id", "favicon.ico"];
    
    if (reservedRoutes.includes(username.toLowerCase()) || username.includes(".")) {
      return next();
    }

    try {
      // Fetch user data from Firebase REST API
      const dbUrl = "https://shakibul-islam-ltd-server-default-rtdb.firebaseio.com";
      const usernameRes = await fetch(`${dbUrl}/usernames/${username.toLowerCase()}.json`);
      const mapping = await usernameRes.json();

      if (!mapping) {
        return next();
      }

      let uid, cardId;
      if (typeof mapping === 'string') {
        uid = mapping;
        // For legacy, we might need to find the first card or use a default
        const userRes = await fetch(`${dbUrl}/users/${uid}.json`);
        const userData = await userRes.json();
        if (!userData) return next();
        renderProfile(userData, res, req);
        return;
      } else {
        uid = mapping.uid;
        cardId = mapping.cardId;
      }

      const cardRes = await fetch(`${dbUrl}/accounts/${uid}/cards/${cardId}.json`);
      const cardData = await cardRes.json();

      if (!cardData) {
        return next();
      }

      renderProfile(cardData, res, req);
    } catch (error) {
      console.error("SEO Rendering Error:", error);
      next();
    }
  });

  function renderProfile(profile: any, res: any, req: any) {
    const templatePath = path.resolve(__dirname, "Showprofile.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    const seoTitle = `${profile.displayName} (@${profile.username}) - ExposeID`;
    const seoDescription = profile.bio || `Connect with ${profile.displayName} on ExposeID.`;
    const seoKeywords = `${profile.displayName}, ${profile.username}, ${profile.title || ""}, digital business card, ExposeID`.replace(/,\s*,/g, ",");
    const profileUrl = `https://exposeid.vercel.app/${profile.username}`;
    const profileImage = profile.photoURL || 'https://exposeid.vercel.app/og-image.png';

    const schema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.displayName,
      "description": profile.bio,
      "image": profile.photoURL,
      "url": profileUrl,
      "jobTitle": profile.title,
      "sameAs": profile.socialLinks ? Object.values(profile.socialLinks).filter(Boolean) : []
    };

    const linksHtml = (profile.links || [])
      .map((l: any) => `<a href="${l.url}">${l.title}</a>`)
      .join(" ");

    html = html
      .replace(/{{TITLE}}/g, seoTitle)
      .replace(/{{DESCRIPTION}}/g, seoDescription)
      .replace(/{{KEYWORDS}}/g, seoKeywords)
      .replace(/{{URL}}/g, profileUrl)
      .replace(/{{IMAGE}}/g, profileImage)
      .replace(/{{USERNAME}}/g, profile.username)
      .replace(/{{NAME}}/g, profile.displayName)
      .replace(/{{BIO}}/g, profile.bio || "")
      .replace(/{{LINKS}}/g, linksHtml)
      .replace(/{{SCHEMA}}/g, JSON.stringify(schema));

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
