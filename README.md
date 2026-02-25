# ExposeID Platform Documentation

This document provides a comprehensive overview of the ExposeID system, its features, and user guides.

---

## 1. System Overview
ExposeID is a modern, web-based platform built with the MERN stack (MongoDB, Express.js, React, Node.js) and Firebase for real-time database and authentication capabilities. The frontend is a Single Page Application (SPA) built with React and Vite, ensuring a fast and responsive user experience. The platform is designed to be highly available, scalable, and secure, serving a global user base.

---

## 2. Core Purpose
The primary purpose of ExposeID is to provide users with a single, elegant, and professional digital identity card. This card consolidates all of a user's important links—social media profiles, portfolios, contact information, and more—into one shareable URL. It serves as a modern replacement for traditional paper business cards.

---

## 3. User Benefits
- **Centralized Identity:** Consolidate all your online presences into a single, easy-to-manage link.
- **Professional Presentation:** Create a beautiful, customizable digital card that reflects your personal or corporate brand.
- **Analytics:** Track how many people view your card and click your links, providing valuable insights into your audience engagement.
- **Discoverability:** Public cards are searchable within the platform, helping you connect with others.
- **Eco-Friendly:** A digital-first approach reduces the need for paper business cards.

---

## 4. Site Quality & Global Recognition
ExposeID is a high-quality, professionally developed platform. It uses modern web technologies to deliver a fast, secure, and reliable service. While it is a growing platform, it is built to global standards and is accessible worldwide. Its reputation is built on user trust, clean design, and effective functionality.

---

## 5. Effectiveness
The platform is highly effective at its core purpose. Users can create and publish a digital card in minutes. The built-in analytics provide clear, actionable data on profile performance. The search functionality allows for effective networking and discovery within the user community.

---

## 6. Site Structure: Pages and URLs
ExposeID consists of 7 main pages/routes:
- **Landing Page:** `/`
- **Login/Registration:** `/login`
- **Dashboard:** `/dashboard`
- **Analytics:** `/analytics`
- **Search Results:** `/searchresult`
- **Public Profile:** `/:username` (e.g., /john.doe)
- **Not Found:** `/404` or any other undefined route.

---

## 7. Page Details and Features

### Landing Page (/)
- **Purpose:** To introduce the platform to new users and provide a search bar to find existing user cards.
- **Features:** Hero section with a clear call-to-action, feature overview, and a global search bar.
- **Options:** Users can navigate to the login page or search for public profiles.

### Login/Registration (/login)
- **Purpose:** To allow users to sign in to their existing account or create a new one.
- **Features:** Secure email/password authentication and Google Sign-In.
- **Options:** Toggle between Login and Sign Up forms.

### Dashboard (/dashboard)
- **Purpose:** The central hub for users to create, edit, and manage their digital cards.
- **Features:** A live preview of the card, forms to edit user information (name, title, bio), contact details, social links, business information, and custom links.
- **Options:** Save changes, upload a profile photo, manage multiple cards, set an active card, and copy the public URL.

### Analytics (/analytics)
- **Purpose:** To provide users with performance data for their digital card.
- **Features:** Displays total views, total clicks, and click-through rate (CTR). Includes charts for historical data and a breakdown of clicks per link.
- **Options:** Users can refresh data and filter by different cards if they have more than one.

### Search Results (/searchresult)
- **Purpose:** To display the results of a user search.
- **Features:** Shows a list of user cards that match the search query.
- **Options:** Users can click on any card to view the full public profile.

### Public Profile (/:username)
- **Purpose:** The public-facing digital card that users share.
- **Features:** Displays the user's photo, name, title, bio, and all their configured links in a clean, mobile-first interface.
- **Options:** Visitors can click the links or save the user's contact information.

---

## 8. New Card Creation Process
1.  **Sign Up:** A new user first creates an account on the `/login` page.
2.  **Go to Dashboard:** After logging in, the user is directed to the `/dashboard`.
3.  **Enter Information:** The user fills out the forms in the 'Edit' tab, starting with Basic Information (Name, Username, Title, Bio) and uploading a photo.
4.  **Add Links:** The user adds their contact details, social media profiles, and any other custom links.
5.  **Customize Theme:** The user can select colors and styles to personalize their card.
6.  **Save Changes:** The user clicks the 'Save Changes' button. The card is now live and accessible at `https://exposeid.vercel.app/[username]`.
7.  **Share:** The user can copy their unique URL from the dashboard and share it with anyone.
