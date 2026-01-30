let currentOffset = 0;
const PAGE_SIZE = 50;
let adminToken = sessionStorage.getItem("adminToken") || null;

// Check auth on load
checkAuth();

function checkAuth() {
  if (!adminToken) {
    showLogin();
    return;
  }
  // Verify token is still valid
  fetch("/api/admin/stats", {
    headers: { "x-admin-token": adminToken },
  }).then((res) => {
    if (res.ok) {
      showDashboard();
    } else {
      adminToken = null;
      sessionStorage.removeItem("adminToken");
      showLogin();
    }
  });
}

function showLogin() {
  document.getElementById("loginGate").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
}

function showDashboard() {
  document.getElementById("loginGate").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  loadStats();
  loadCurrent();
  loadHistory();
}

async function doLogin() {
  var pw = document.getElementById("adminPw").value;
  var errEl = document.getElementById("loginError");
  errEl.textContent = "";

  try {
    var res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });

    if (!res.ok) {
      errEl.textContent = "Invalid password.";
      return;
    }

    var data = await res.json();
    adminToken = data.token;
    sessionStorage.setItem("adminToken", adminToken);
    showDashboard();
  } catch (_) {
    errEl.textContent = "Login failed. Try again.";
  }
}

function adminFetch(url) {
  return fetch(url, { headers: { "x-admin-token": adminToken } });
}

// Auto-refresh every 30 seconds
setInterval(() => {
  if (!adminToken) return;
  loadStats();
  loadCurrent();
}, 30000);

async function loadStats() {
  try {
    const res = await adminFetch("/api/admin/stats");
    if (!res.ok) return;
    const data = await res.json();
    const t = data.today;
    document.getElementById("stats").innerHTML = `
      <div class="stat-card"><div class="number">${t.currently_in || 0}</div><div class="label">Currently On-Site</div></div>
      <div class="stat-card"><div class="number">${t.total_today || 0}</div><div class="label">Visitors Today</div></div>
      <div class="stat-card"><div class="number">${t.checked_out || 0}</div><div class="label">Checked Out Today</div></div>
      <div class="stat-card"><div class="number">${data.all_time_total || 0}</div><div class="label">All-Time Visitors</div></div>
    `;
  } catch (_) {}
}

async function loadCurrent() {
  try {
    const res = await fetch("/api/visitors/current");
    const visitors = await res.json();
    const body = document.getElementById("currentBody");
    const noMsg = document.getElementById("noCurrent");

    if (visitors.length === 0) {
      body.innerHTML = "";
      noMsg.style.display = "block";
      return;
    }
    noMsg.style.display = "none";
    body.innerHTML = visitors
      .map(
        (v) => `<tr>
          <td>${esc(v.visitor_name)}</td>
          <td>${esc(v.company || "—")}</td>
          <td>${esc(v.host_name)}</td>
          <td>${esc(v.purpose)}</td>
          <td>${esc(v.badge_number || "—")}</td>
          <td>${formatDT(v.sign_in_time)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="adminSignOut(${v.id})">Sign Out</button></td>
        </tr>`
      )
      .join("");
  } catch (_) {}
}

async function loadHistory() {
  try {
    const res = await adminFetch(`/api/admin/history?limit=${PAGE_SIZE}&offset=${currentOffset}`);
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById("historyBody").innerHTML = data.rows
      .map(
        (v) => `<tr>
          <td>${esc(v.visitor_name)}</td>
          <td>${esc(v.company || "—")}</td>
          <td>${esc(v.host_name)}</td>
          <td>${esc(v.purpose)}</td>
          <td>${esc(v.badge_number || "—")}</td>
          <td>${formatDT(v.sign_in_time)}</td>
          <td>${v.sign_out_time ? formatDT(v.sign_out_time) : "—"}</td>
          <td>${v.status === "signed_in"
            ? '<span class="badge badge-in">Signed In</span>'
            : '<span class="badge badge-out">Signed Out</span>'}</td>
        </tr>`
      )
      .join("");

    const page = Math.floor(currentOffset / PAGE_SIZE) + 1;
    const totalPages = Math.ceil(data.total / PAGE_SIZE);
    document.getElementById("pageInfo").textContent = `Page ${page} of ${totalPages || 1}`;
    document.getElementById("prevBtn").disabled = currentOffset === 0;
    document.getElementById("nextBtn").disabled = currentOffset + PAGE_SIZE >= data.total;
  } catch (_) {}
}

async function adminSignOut(id) {
  if (!confirm("Sign out this visitor?")) return;
  await fetch(`/api/visitors/signout/${id}`, { method: "POST" });
  loadStats();
  loadCurrent();
  loadHistory();
}

function prevPage() {
  currentOffset = Math.max(0, currentOffset - PAGE_SIZE);
  loadHistory();
}

function nextPage() {
  currentOffset += PAGE_SIZE;
  loadHistory();
}

function adminLogout() {
  adminToken = null;
  sessionStorage.removeItem("adminToken");
  showLogin();
}

function esc(str) {
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

function formatDT(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
