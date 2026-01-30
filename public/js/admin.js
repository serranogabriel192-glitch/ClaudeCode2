let currentOffset = 0;
const PAGE_SIZE = 50;

loadStats();
loadCurrent();
loadHistory();

// Auto-refresh every 30 seconds
setInterval(() => {
  loadStats();
  loadCurrent();
}, 30000);

async function loadStats() {
  try {
    const res = await fetch("/api/admin/stats");
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
          <td>${formatDT(v.sign_in_time)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="adminSignOut(${v.id})">Sign Out</button></td>
        </tr>`
      )
      .join("");
  } catch (_) {}
}

async function loadHistory() {
  try {
    const res = await fetch(`/api/admin/history?limit=${PAGE_SIZE}&offset=${currentOffset}`);
    const data = await res.json();

    document.getElementById("historyBody").innerHTML = data.rows
      .map(
        (v) => `<tr>
          <td>${esc(v.visitor_name)}</td>
          <td>${esc(v.company || "—")}</td>
          <td>${esc(v.host_name)}</td>
          <td>${esc(v.purpose)}</td>
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
