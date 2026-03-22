import { db, ref, get, onValue, set } from './firebase-config.js';

// --- Default Menu Fallback ---
const defaultMenuData = {
  starters: [
    { name: "Bruschetta al Pomodoro", price: "$12", desc: "Toasted artisanal bread, vine-ripened tomatoes, garlic, fresh basil, extra virgin olive oil.", badge: "veg" },
    { name: "Calamari Fritti", price: "$16", desc: "Crispy fried calamari rings served with house-made marinara and lemon aioli.", badge: "" },
    { name: "Burrata & Prosciutto", price: "$19", desc: "Creamy burrata cheese, 24-month aged Prosciutto di Parma, balsamic glaze, crostini.", badge: "chef" },
    { name: "Arancini Siciliani", price: "$14", desc: "Crispy risotto balls stuffed with ragù, peas, and mozzarella. Served with marinara.", badge: "" }
  ],
  pasta: [
    { name: "Tagliatelle al Ragù", price: "$24", desc: "Fresh ribbon pasta in a slow-cooked beef and pork ragù, topped with Parmigiano-Reggiano.", badge: "" },
    { name: "Ravioli di Ricotta", price: "$22", desc: "Hand-made ravioli filled with ricotta and spinach in a brown butter sage sauce.", badge: "veg" },
    { name: "Spaghetti alla Carbonara", price: "$23", desc: "Classic Roman dish with guanciale, egg yolk, Pecorino Romano, and black pepper.", badge: "" },
    { name: "Linguine ai Frutti di Mare", price: "$28", desc: "Linguine tossed with clams, mussels, shrimp, and calamari in a light tomato-white wine broth.", badge: "chef" }
  ],
  pizza: [
    { name: "Margherita Tradizionale", price: "$18", desc: "San Marzano tomato sauce, fresh mozzarella fior di latte, basil, olive oil.", badge: "veg" },
    { name: "Diavola", price: "$21", desc: "Tomato sauce, mozzarella, spicy Calabrian salami, crushed red pepper.", badge: "spicy" },
    { name: "Quattro Formaggi", price: "$22", desc: "White base with mozzarella, gorgonzola, fontina, and parmigiano.", badge: "veg" },
    { name: "Tartufo e Funghi", price: "$24", desc: "Wild mushrooms, truffle cream, mozzarella, fresh thyme, white truffle oil.", badge: "chef" }
  ],
  mains: [
    { name: "Pollo alla Cacciatora", price: "$26", desc: "Braised chicken in a rich tomato, olive, and mushroom sauce. Served with polenta.", badge: "" },
    { name: "Bistecca alla Fiorentina", price: "$48", desc: "16oz dry-aged bone-in ribeye, rosemary roasted potatoes, grilled asparagus.", badge: "chef" },
    { name: "Salmone al Forno", price: "$32", desc: "Wood-fired salmon fillet, lemon-caper butter sauce, seasonal vegetables.", badge: "" },
    { name: "Melanzane alla Parmigiana", price: "$22", desc: "Baked eggplant layered with mozzarella, parmesan, and marinara sauce.", badge: "veg" }
  ],
  desserts: [
    { name: "Classic Tiramisu", price: "$11", desc: "Espresso-soaked ladyfingers mascarpone cream, dusted with dark cocoa powder.", badge: "" },
    { name: "Panna Cotta", price: "$10", desc: "Silky vanilla bean custard topped with mixed berry compote.", badge: "" },
    { name: "Cannoli Siciliani", price: "$9", desc: "Crisp pastry shells filled with sweet ricotta and chocolate chips.", badge: "" },
    { name: "Affogato al Caffè", price: "$8", desc: "Vanilla gelato \"drowned\" in a shot of freshly brewed hot espresso.", badge: "" }
  ],
  drinks: [
    { name: "Aperol Spritz", price: "$14", desc: "Aperol, Prosecco, soda water, fresh orange slice.", badge: "" },
    { name: "Negroni", price: "$15", desc: "Campari, gin, sweet vermouth, orange peel.", badge: "" },
    { name: "House Red / White Wine", price: "$12", desc: "Glass of our carefully selected Italian house wine.", badge: "" },
    { name: "Limoncello", price: "$9", desc: "Traditional sweet lemon liqueur served chilled.", badge: "" }
  ]
};

// --- State ---
let menuData = JSON.parse(JSON.stringify(defaultMenuData));
let announcement = null;

// --- Navbar Scroll ---
const navbar = document.getElementById('navbar');
function updateNavbarPosition() {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}
window.addEventListener('scroll', updateNavbarPosition);
window.addEventListener('resize', updateNavbarPosition);
updateNavbarPosition();

// --- Mobile Menu ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

// --- Menu Tabs ---
const tabBtns = document.querySelectorAll('.tab-btn');
const menuContainer = document.getElementById('menu-items');

function renderMenu(category) {
  menuContainer.innerHTML = '';
  const items = (menuData && menuData[category]) ? menuData[category] : [];
  items.forEach(item => {
    let badgeHtml = '';
    if (item.badge === 'veg')   badgeHtml = `<span class="badge veg">Vegetarian</span>`;
    if (item.badge === 'spicy') badgeHtml = `<span class="badge spicy">Spicy</span>`;
    if (item.badge === 'chef')  badgeHtml = `<span class="badge chef">Chef's Special</span>`;
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-card-top">
        <h3>${item.name}</h3>
        <span class="price">${item.price}</span>
      </div>
      <p>${item.desc}</p>
      ${badgeHtml}
    `;
    menuContainer.appendChild(card);
  });
}

// Initial render from default, then override from Firebase
renderMenu('starters');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(btn.dataset.tab);
  });
});

// --- Firebase: Live Menu Sync ---
onValue(ref(db, 'menu'), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    menuData = data;
    // Re-render the currently active tab
    const activeTab = document.querySelector('.tab-btn.active');
    renderMenu(activeTab ? activeTab.dataset.tab : 'starters');
  }
});

// --- Firebase: Live Announcement Sync ---
function evaluateAnnouncement(ann) {
  if (!ann || !ann.active || !ann.text || ann.text.trim() === '') return false;
  if (ann.expiresAt && Date.now() > ann.expiresAt) {
    if (ann.repeat && ann.durationMs > 0) {
      // Roll timer forward (write back to Firebase)
      while (Date.now() > ann.expiresAt) ann.expiresAt += ann.durationMs;
      ann.id = 'ann_' + Date.now();
      set(ref(db, 'announcement'), ann);
    } else {
      return false;
    }
  }
  const dismissedId = sessionStorage.getItem('bannerDismissedId');
  if (ann.id && dismissedId === ann.id) return false;
  return true;
}

onValue(ref(db, 'announcement'), (snapshot) => {
  announcement = snapshot.val();
  const overlay = document.getElementById('announcementOverlay');
  const textEl = document.getElementById('announcementText');
  if (!overlay || !textEl) return;

  if (evaluateAnnouncement(announcement)) {
    textEl.textContent = announcement.text;
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
});

// --- Announcement Close ---
const closeBannerBtn = document.getElementById('closeAnnouncement');
if (closeBannerBtn) {
  closeBannerBtn.addEventListener('click', () => {
    document.getElementById('announcementOverlay').style.display = 'none';
    if (announcement && announcement.id) {
      sessionStorage.setItem('bannerDismissedId', announcement.id);
    } else {
      sessionStorage.setItem('bannerDismissedId', 'true');
    }
  });
}

// --- Reservation Form ---
const form = document.getElementById('reserveForm');
const successMsg = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Processing...";
  submitBtn.disabled = true;

  const resData = {
    fname: document.getElementById('fname').value,
    lname: document.getElementById('lname').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    guests: document.getElementById('guests').value,
    notes: document.getElementById('notes').value,
    submittedAt: Date.now()
  };

  try {
    // Save to Firebase Realtime Database
    const currentSnap = await get(ref(db, 'reservations'));
    const current = currentSnap.val() || {};
    const newIndex = Object.keys(current).length;
    await set(ref(db, `reservations/${newIndex}`), resData);
  } catch (err) {
    console.warn("Firebase save failed, reservations not stored:", err);
  }

  // Also attempt Formspree
  const formData = new FormData(form);
  fetch(form.action, {
    method: form.method,
    body: formData,
    headers: { 'Accept': 'application/json' }
  }).catch(() => {});

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
  form.reset();
  successMsg.textContent = "✅ Reservation submitted! We'll email you a confirmation shortly.";
  successMsg.style.color = "#2e7d32";
  successMsg.style.display = 'block';
  setTimeout(() => successMsg.style.display = 'none', 5000);
});
