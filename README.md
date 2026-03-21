# 🍝 Bella Cucina | Modern Restaurant Platform

A sleek, premium web platform crafted for a modern Italian restaurant. This project goes beyond a standard static site by including a fully functional, serverless **Admin Dashboard** allowing the restaurant owner to manage the live website completely offline through robust `localStorage` state management.

## ✨ Key Features

- **Premium UI/UX Design**: Stunning, responsive frontend with smooth scrolling, glassmorphism elements, and high-fidelity image galleries.
- **Serverless Admin Dashboard**: A secure, hidden control panel (`/admin.html`) that simulates database operations using browser Local Storage.
- **Dynamic Menu Editor**: Add, delete, and categorize menu items (Starters, Pasta, Pizza, Mains) from the dashboard, which instantly updates the live public menu.
- **Smart Announcement System**: Schedule floating "toast" announcements with exact Day/Hour/Minute expirations, auto-repeat logic, and live countdown trackers via the dashboard.
- **Resilient Reservations**: A booking form that integrates with Formspree for email delivery while simultaneously caching local copies in the Admin Dashboard to prevent data loss.

## 🚀 Getting Started

Since this project uses vanilla web technologies and local storage for its "database," there is no complex backend to configure!

1. Clone the repository: `git clone https://github.com/zannyphantom-13/Restaurant-website.git`
2. Open `index.html` in your browser to view the live site.
3. Open `admin.html` and log in with the mock credentials (`admin123`) to access the dashboard.
4. Try adding a new menu item or setting an active announcement, then refresh `index.html` to see your changes instantly applied!

## 🛠️ Built With

- **HTML5 & Vanilla CSS3**: Utilizing modern CSS Grid, Flexbox, and native transitions for a zero-dependency, lightning-fast UI.
- **Vanilla JavaScript (ES6)**: Handling all dynamic DOM manipulation, session caching, and offline state management without heavy frameworks.
