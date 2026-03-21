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

// Check for Custom Admin Data
const menuData = JSON.parse(localStorage.getItem('restaurantMenu')) || defaultMenuData;

// Handle Announcements
const announcement = JSON.parse(localStorage.getItem('restaurantAnnouncement'));
const dismissedId = sessionStorage.getItem('bannerDismissedId');

// Helper to safely check if banner should be active
function shouldShowBanner() {
  if (!announcement || !announcement.active) return false;
  
  const text = announcement.text || '';
  if (text.trim() === '') return false;
  
  // Evaluate expiration & repeat logic
  if (announcement.expiresAt && Date.now() > announcement.expiresAt) {
    if (announcement.repeat && announcement.durationMs > 0) {
      // It expired, but it repeats. Roll the timer forward.
      while (Date.now() > announcement.expiresAt) {
        announcement.expiresAt += announcement.durationMs;
      }
      // Forcefully generate a new ID so users who dismissed the old cycle see it again
      announcement.id = 'ann_' + Date.now();
      localStorage.setItem('restaurantAnnouncement', JSON.stringify(announcement));
    } else {
      return false; // Expired and no repeat
    }
  }

  // Check manual dismissal by user (after resolving repeat cycle IDs)
  if (announcement.id && dismissedId === announcement.id) return false;
  if (!announcement.id && dismissedId === 'true') return false; // Legacy fallback
  
  return true;
}

if (shouldShowBanner()) {
  document.getElementById('announcementOverlay').style.display = 'flex';
  document.getElementById('announcementText').textContent = announcement.text;
}

// Banner Close Button
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

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');

function updateNavbarPosition() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNavbarPosition);
window.addEventListener('resize', updateNavbarPosition);
// Initial check
updateNavbarPosition();

// Mobile Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Menu Tabs Logic
const tabBtns = document.querySelectorAll('.tab-btn');
const menuContainer = document.getElementById('menu-items');

function renderMenu(category) {
  menuContainer.innerHTML = '';
  const items = menuData[category];
  
  items.forEach(item => {
    let badgeHtml = '';
    if (item.badge === 'veg') badgeHtml = `<span class="badge veg">Vegetarian</span>`;
    if (item.badge === 'spicy') badgeHtml = `<span class="badge spicy">Spicy</span>`;
    if (item.badge === 'chef') badgeHtml = `<span class="badge chef">Chef's Special</span>`;

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

// Initial Render
renderMenu('starters');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all
    tabBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked
    btn.classList.add('active');
    // Render
    renderMenu(btn.dataset.tab);
  });
});

// Reservation Form Submission Simulation
const form = document.getElementById('reserveForm');
const successMsg = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Processing...";
  submitBtn.disabled = true;

  // Save to local storage for Admin Panel BEFORE fetch 
  // so placeholder Formspree URLs don't break the demo functionality.
  const resData = {
    fname: document.getElementById('fname').value,
    lname: document.getElementById('lname').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    guests: document.getElementById('guests').value,
    notes: document.getElementById('notes').value
  };
  const savedRes = JSON.parse(localStorage.getItem('restaurantReservations')) || [];
  savedRes.push(resData);
  localStorage.setItem('restaurantReservations', JSON.stringify(savedRes));

  const formData = new FormData(form);

  fetch(form.action, {
    method: form.method,
    body: formData,
    headers: {
        'Accept': 'application/json'
    }
  }).then(response => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    // We consider it a success for the demo even if the placeholder fetch 404s
    form.reset();
    successMsg.textContent = "✅ Reservation request submitted! We'll send you an email shortly.";
    successMsg.style.color = "#2e7d32";
    successMsg.style.display = 'block';
    
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 5000);
  }).catch(error => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    // Fallback UI success for portfolio purposes 
    form.reset();
    successMsg.textContent = "✅ Reservation request submitted (Offline mode).";
    successMsg.style.color = "#2e7d32";
    successMsg.style.display = 'block';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 5000);
  });
});
