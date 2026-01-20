/* EarnEngine Frontend Logic */

const API_BASE = "https://YOUR_BACKEND_URL.onrender.com"; // replace after deployment

// Save token
function saveToken(token) {
  localStorage.setItem("ee_token", token);
}

// Get token
function getToken() {
  return localStorage.getItem("ee_token");
}

// Login
async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  if (data.token) {
    saveToken(data.token);
    alert("Logged in successfully");
    window.location.href = "members.html";
  } else {
    alert(data.message || "Login failed");
  }
}

// Register
async function register(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  
  const data = await res.json();
  if (data.token) {
    saveToken(data.token);
    alert("Account created");
    window.location.href = "members.html";
  } else {
    alert(data.message || "Registration failed");
  }
}

// PayPal order creation placeholder
async function createPayPalOrder() {
  const token = getToken();
  if (!token) return alert("Please log in first");
  
  const res = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  
  const data = await res.json();
  console.log("PayPal order:", data);
  alert("PayPal order created (placeholder). Redirect will be added later.");
}