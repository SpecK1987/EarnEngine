// ===============================
// CONFIG
// ===============================
const API_BASE = "https://earnengine.onrender.com"; // <-- change this

// ===============================
// AUTH HELPERS
// ===============================
function saveToken(token) {
  localStorage.setItem("ee_token", token);
}

function getToken() {
  return localStorage.getItem("ee_token");
}

function clearToken() {
  localStorage.removeItem("ee_token");
}

function isLoggedIn() {
  return !!getToken();
}

// ===============================
// API HELPERS
// ===============================
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken() || ""}`
    }
  });
  return res.json();
}

async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken() || ""}`
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

// ===============================
// AUTH FLOWS (LOGIN / REGISTER / LOGOUT)
// ===============================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.querySelector("#login-email").value.trim();
  const password = document.querySelector("#login-password").value.trim();

  const data = await apiPost("/api/auth/login", { email, password });

  if (data.token) {
    saveToken(data.token);
    window.location.href = "portal.html";
  } else {
    alert(data.message || "Login failed");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.querySelector("#register-email").value.trim();
  const password = document.querySelector("#register-password").value.trim();

  const data = await apiPost("/api/auth/register", { email, password });

  if (data.success) {
    alert("Account created. You can log in now.");
    window.location.href = "index.html";
  } else {
    alert(data.message || "Registration failed");
  }
}

function handleLogout() {
  clearToken();
  window.location.href = "index.html";
}

// ===============================
// USER / MEMBERSHIP CHECKS
// ===============================
async function fetchCurrentUser() {
  try {
    const user = await apiGet("/api/users/me");
    return user;
  } catch (err) {
    return null;
  }
}

async function requireLogin(redirectTo = "index.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return null;
  }
  const user = await fetchCurrentUser();
  if (!user || user.error) {
    clearToken();
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

async function requirePaidMembership() {
  const user = await requireLogin("index.html");
  if (!user) return;

  if (!user.plan || user.plan !== "paid") {
    window.location.href = "portal.html";
  }
}

// ===============================
// PORTAL PAGE (SHOW STATUS, ETC.)
// ===============================
async function initPortalPage() {
  const user = await requireLogin("index.html");
  if (!user) return;

  const statusEl = document.querySelector("#membership-status");
  if (statusEl) {
    statusEl.textContent = user.plan === "paid" ? "Paid Member" : "Free Member";
  }
}

// ===============================
// MEMBERS PAGE (PROTECTED CONTENT)
// ===============================
async function initMembersPage() {
  await requirePaidMembership();
  // At this point user is paid and logged in
  // You can load protected content here if needed
}

// ===============================
// DOWNLOADS
// ===============================
async function handleDownload(fileId) {
  const user = await requirePaidMembership();
  if (!user) return;

  const data = await apiGet(`/api/downloads/${fileId}`);
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.message || "Unable to get download link");
  }
}

// ===============================
// PAYPAL INTEGRATION (PORTAL / UPGRADE PAGE)
// ===============================
// Call this on portal page where PayPal button should render
function initPayPalButton() {
  if (typeof paypal === "undefined") return;

  paypal.Buttons({
    createOrder: function () {
      return apiPost("/api/payments/create-order").then((data) => data.id);
    },
    onApprove: function (data) {
      return apiPost("/api/payments/capture-order", {
        orderID: data.orderID
      }).then((res) => {
        if (res.success) {
          alert("Payment successful! You are now a paid member.");
          window.location.reload();
        } else {
          alert(res.message || "Payment capture failed");
        }
      });
    },
    onError: function (err) {
      console.error(err);
      alert("Payment error. Please try again.");
    }
  }).render("#paypal-button-container");
}

// ===============================
// ADMIN PAGE (BASIC EXAMPLE)
// ===============================
async function initAdminPage() {
  const user = await requireLogin("index.html");
  if (!user) return;

  if (!user.is_admin) {
    window.location.href = "portal.html";
    return;
  }

  // Example: load users
  const users = await apiGet("/api/admin/users");
  const listEl = document.querySelector("#user-list");
  if (listEl && Array.isArray(users)) {
    listEl.innerHTML = "";
    users.forEach((u) => {
      const li = document.createElement("li");
      li.textContent = `${u.email} — ${u.plan}`;
      listEl.appendChild(li);
    });
  }
}

// ===============================
// PAGE INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // Attach auth handlers if elements exist
  const loginForm = document.querySelector("#login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const registerForm = document.querySelector("#register-form");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  const logoutBtn = document.querySelector("#logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Page-specific init
  if (path.endsWith("portal.html")) {
    initPortalPage();
    initPayPalButton();
  }

  if (path.endsWith("members.html")) {
    initMembersPage();
  }

  if (path.endsWith("admin.html")) {
    initAdminPage();
  }
});

// ===============================
// GLOBAL ACCESS FOR BUTTONS
// ===============================
window.eeDownload = handleDownload;
window.eeLogout = handleLogout;
