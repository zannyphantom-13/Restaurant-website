import { db, ref, set, get, onValue } from './firebase-config.js';

// Default Initial Menu Data (Backup)
const defaultMenuData = {
  starters: [
    { id: "s1", name: "Bruschetta al Pomodoro", price: "$12", desc: "Toasted artisanal bread, vine-ripened tomatoes, garlic, fresh basil, extra virgin olive oil.", badge: "veg" },
    { id: "s2", name: "Calamari Fritti", price: "$16", desc: "Crispy fried calamari rings served with house-made marinara and lemon aioli.", badge: "" },
    { id: "s3", name: "Burrata & Prosciutto", price: "$19", desc: "Creamy burrata cheese, 24-month aged Prosciutto di Parma, balsamic glaze, crostini.", badge: "chef" },
    { id: "s4", name: "Arancini Siciliani", price: "$14", desc: "Crispy risotto balls stuffed with ragù, peas, and mozzarella. Served with marinara.", badge: "" }
  ],
  pasta: [
    { id: "p1", name: "Tagliatelle al Ragù", price: "$24", desc: "Fresh ribbon pasta in a slow-cooked beef and pork ragù, topped with Parmigiano-Reggiano.", badge: "" },
    { id: "p2", name: "Ravioli di Ricotta", price: "$22", desc: "Hand-made ravioli filled with ricotta and spinach in a brown butter sage sauce.", badge: "veg" },
    { id: "p3", name: "Spaghetti alla Carbonara", price: "$23", desc: "Classic Roman dish with guanciale, egg yolk, Pecorino Romano, and black pepper.", badge: "" },
    { id: "p4", name: "Linguine ai Frutti di Mare", price: "$28", desc: "Linguine tossed with clams, mussels, shrimp, and calamari in a light tomato-white wine broth.", badge: "chef" }
  ],
  pizza: [
    { id: "pz1", name: "Margherita Tradizionale", price: "$18", desc: "San Marzano tomato sauce, fresh mozzarella fior di latte, basil, olive oil.", badge: "veg" },
    { id: "pz2", name: "Diavola", price: "$21", desc: "Tomato sauce, mozzarella, spicy Calabrian salami, crushed red pepper.", badge: "spicy" },
    { id: "pz3", name: "Quattro Formaggi", price: "$22", desc: "White base with mozzarella, gorgonzola, fontina, and parmigiano.", badge: "veg" },
    { id: "pz4", name: "Tartufo e Funghi", price: "$24", desc: "Wild mushrooms, truffle cream, mozzarella, fresh thyme, white truffle oil.", badge: "chef" }
  ],
  mains: [
    { id: "m1", name: "Pollo alla Cacciatora", price: "$26", desc: "Braised chicken in a rich tomato, olive, and mushroom sauce. Served with polenta.", badge: "" },
    { id: "m2", name: "Bistecca alla Fiorentina", price: "$48", desc: "16oz dry-aged bone-in ribeye, rosemary roasted potatoes, grilled asparagus.", badge: "chef" },
    { id: "m3", name: "Salmone al Forno", price: "$32", desc: "Wood-fired salmon fillet, lemon-caper butter sauce, seasonal vegetables.", badge: "" },
    { id: "m4", name: "Melanzane alla Parmigiana", price: "$22", desc: "Baked eggplant layered with mozzarella, parmesan, and marinara sauce.", badge: "veg" }
  ],
  desserts: [
    { id: "d1", name: "Classic Tiramisu", price: "$11", desc: "Espresso-soaked ladyfingers mascarpone cream, dusted with dark cocoa powder.", badge: "" },
    { id: "d2", name: "Panna Cotta", price: "$10", desc: "Silky vanilla bean custard topped with mixed berry compote.", badge: "" },
    { id: "d3", name: "Cannoli Siciliani", price: "$9", desc: "Crisp pastry shells filled with sweet ricotta and chocolate chips.", badge: "" },
    { id: "d4", name: "Affogato al Caffè", price: "$8", desc: "Vanilla gelato \"drowned\" in a shot of freshly brewed hot espresso.", badge: "" }
  ],
  drinks: [
    { id: "dr1", name: "Aperol Spritz", price: "$14", desc: "Aperol, Prosecco, soda water, fresh orange slice.", badge: "" },
    { id: "dr2", name: "Negroni", price: "$15", desc: "Campari, gin, sweet vermouth, orange peel.", badge: "" },
    { id: "dr3", name: "House Red / White Wine", price: "$12", desc: "Glass of our carefully selected Italian house wine.", badge: "" },
    { id: "dr4", name: "Limoncello", price: "$9", desc: "Traditional sweet lemon liqueur served chilled.", badge: "" }
  ]
};

// State
let menuData = JSON.parse(JSON.stringify(defaultMenuData));
let reservations = [];
let announcement = { text: '', active: false };

// UI Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardWrapper = document.getElementById('dashboardWrapper');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// 1. Auth Check
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  showDashboard();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pwd = document.getElementById('adminPassword').value;
  if (pwd === 'admin123') {
    sessionStorage.setItem('adminLoggedIn', 'true');
    showDashboard();
  } else {
    loginError.textContent = "Incorrect password.";
    loginError.style.display = 'block';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminLoggedIn');
  dashboardWrapper.style.display = 'none';
  loginScreen.style.display = 'flex';
  document.getElementById('adminPassword').value = '';
});

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardWrapper.style.display = 'flex';
  initDashboard();
}

// 2. Tab Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// 3. Live Preview
function updateAnnouncementPreview() {
  const previewStatus = document.getElementById('announcePreviewStatus');
  const previewText = document.getElementById('announcePreviewText');
  if (!announcement || !announcement.active || !announcement.text || announcement.text.trim() === '') {
    previewStatus.innerHTML = '<strong style="color:#ef4444;">Inactive</strong> <span style="color:var(--text-light);">- No announcement is currently displayed.</span>';
    previewText.style.display = 'none';
    return;
  }
  const now = Date.now();
  let timeRemaining = announcement.expiresAt ? announcement.expiresAt - now : 0;
  if (timeRemaining <= 0) {
    if (announcement.repeat) {
      previewStatus.innerHTML = '<strong style="color:#3b82f6;">Cycling (Auto-Repeat)</strong> <span style="color:var(--text-light);">- Timer is rolling over.</span>';
      previewText.textContent = announcement.text;
      previewText.style.display = 'block';
    } else {
      previewStatus.innerHTML = '<strong style="color:#ef4444;">Expired</strong> <span style="color:var(--text-light);">- Duration ended. Visitors no longer see this.</span>';
      previewText.style.display = 'none';
    }
    return;
  }
  const d = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const h = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  const m = Math.floor((timeRemaining / 1000 / 60) % 60);
  const s = Math.floor((timeRemaining / 1000) % 60);
  let timeStr = '';
  if (d > 0) timeStr += `${d}d `;
  if (h > 0 || d > 0) timeStr += `${h}h `;
  if (m > 0 || h > 0 || d > 0) timeStr += `${m}m `;
  timeStr += `${s}s`;
  const repeatBadge = announcement.repeat
    ? '<span style="font-size:11px;background:#dbeafe;color:#1e40af;padding:3px 8px;border-radius:12px;margin-left:8px;font-weight:600;">Auto-Repeats</span>'
    : '';
  previewStatus.innerHTML = `<strong style="color:#10b981;">Active</strong> <span style="color:var(--text-main);">- Time remaining: <code>${timeStr}</code></span> ${repeatBadge}`;
  previewText.textContent = announcement.text;
  previewText.style.display = 'block';
}

// 4. Init Dashboard — load everything from Firebase
async function initDashboard() {
  // Listen for real-time announcement changes
  onValue(ref(db, 'announcement'), (snapshot) => {
    announcement = snapshot.val() || { text: '', active: false };
    document.getElementById('announceText').value = announcement.text || '';
    document.getElementById('announceActive').checked = announcement.active || false;
    document.getElementById('announceRepeat').checked = announcement.repeat || false;
    document.getElementById('announceDays').value = announcement.durationDays || 0;
    document.getElementById('announceHours').value = announcement.durationHours !== undefined ? announcement.durationHours : 24;
    document.getElementById('announceMinutes').value = announcement.durationMinutes || 0;
    updateAnnouncementPreview();
  });

  // Listen for real-time menu changes
  onValue(ref(db, 'menu'), (snapshot) => {
    const data = snapshot.val();
    menuData = data || JSON.parse(JSON.stringify(defaultMenuData));
    renderAdminMenu();
  });

  // Listen for real-time reservation changes
  onValue(ref(db, 'reservations'), (snapshot) => {
    const data = snapshot.val();
    reservations = data ? Object.values(data) : [];
    renderReservations();
  });

  setInterval(updateAnnouncementPreview, 1000);
}

// 5. Announcements Form
const announceForm = document.getElementById('announcementForm');
if (announceForm) {
  announceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const days = parseInt(document.getElementById('announceDays').value) || 0;
      const hrs  = parseInt(document.getElementById('announceHours').value) || 0;
      const mins = parseInt(document.getElementById('announceMinutes').value) || 0;
      const durationMs = (days * 86400 + hrs * 3600 + mins * 60) * 1000;

      announcement = {
        id: 'ann_' + Date.now(),
        text: document.getElementById('announceText').value,
        active: document.getElementById('announceActive').checked,
        repeat: document.getElementById('announceRepeat').checked,
        durationDays: days,
        durationHours: hrs,
        durationMinutes: mins,
        durationMs,
        expiresAt: Date.now() + durationMs
      };

      await set(ref(db, 'announcement'), announcement);
      updateAnnouncementPreview();

      const success = document.getElementById('announceSuccess');
      if (success) {
        success.style.display = 'block';
        setTimeout(() => success.style.display = 'none', 3000);
      }
    } catch (err) {
      console.error("Failed to save announcement:", err);
      alert("Error saving announcement. Check Firebase console.");
    }
  });
}

// 6. Menu Editor
const catSelect = document.getElementById('menuCategorySelect');
const addMenuForm = document.getElementById('addMenuForm');
const adminMenuList = document.getElementById('adminMenuList');
const currentCatLabel = document.getElementById('currentCategoryLabel');

catSelect.addEventListener('change', (e) => {
  currentCatLabel.textContent = e.target.options[e.target.selectedIndex].text;
  renderAdminMenu();
});

function renderAdminMenu() {
  const cat = catSelect.value;
  adminMenuList.innerHTML = '';
  const items = (menuData && menuData[cat]) ? menuData[cat] : [];
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="menu-item-info">
        <strong>${item.name} <span style="font-weight:normal;color:#c9972b;">${item.price}</span></strong>
        <span>${item.desc.substring(0, 50)}...</span>
      </div>
      <button class="del-btn" data-cat="${cat}" data-index="${index}">Delete</button>
    `;
    adminMenuList.appendChild(li);
  });

  adminMenuList.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteMenuItem(btn.dataset.cat, parseInt(btn.dataset.index)));
  });
}

async function deleteMenuItem(cat, index) {
  if (confirm('Are you sure you want to delete this item?')) {
    menuData[cat].splice(index, 1);
    await set(ref(db, 'menu'), menuData);
  }
}

addMenuForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cat = catSelect.value;
  const newItem = {
    id: "item_" + Date.now(),
    name: document.getElementById('itemName').value,
    price: document.getElementById('itemPrice').value,
    desc: document.getElementById('itemDesc').value,
    badge: document.getElementById('itemBadge').value
  };
  menuData[cat].push(newItem);
  await set(ref(db, 'menu'), menuData);
  addMenuForm.reset();
});

document.getElementById('resetMenuBtn').addEventListener('click', async () => {
  if (confirm('This will wipe all menu edits and restore the default menu. Continue?')) {
    menuData = JSON.parse(JSON.stringify(defaultMenuData));
    await set(ref(db, 'menu'), menuData);
  }
});

// 7. Reservations
const resTableBody = document.getElementById('resTableBody');
const noResMsg = document.getElementById('noResMsg');
const resTable = document.querySelector('.res-table');

function renderReservations() {
  resTableBody.innerHTML = '';
  if (!reservations || reservations.length === 0) {
    noResMsg.style.display = 'block';
    resTable.style.display = 'none';
  } else {
    noResMsg.style.display = 'none';
    resTable.style.display = 'table';
    const reversed = [...reservations].reverse();
    reversed.forEach((res, i) => {
      const originalIndex = reservations.length - 1 - i;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${res.date}</strong><br/>${res.time}</td>
        <td>${res.fname} ${res.lname}</td>
        <td>${res.email}<br/>${res.phone}</td>
        <td>${res.guests}</td>
        <td><small>${res.notes || 'None'}</small></td>
        <td><button class="del-btn" data-index="${originalIndex}">Remove</button></td>
      `;
      resTableBody.appendChild(tr);
    });

    resTableBody.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteRes(parseInt(btn.dataset.index)));
    });
  }
}

async function deleteRes(index) {
  if (confirm('Remove this reservation?')) {
    reservations.splice(index, 1);
    // Re-index reservations as a flat object for Firebase
    const resObj = {};
    reservations.forEach((r, i) => { resObj[i] = r; });
    await set(ref(db, 'reservations'), reservations.length ? resObj : null);
  }
}

document.getElementById('clearResBtn').addEventListener('click', async () => {
  if (confirm('Delete ALL reservations?')) {
    reservations = [];
    await set(ref(db, 'reservations'), null);
  }
});
