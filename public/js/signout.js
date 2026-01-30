const alertEl = document.getElementById("alert");
const listEl = document.getElementById("visitorList");
const searchInput = document.getElementById("searchInput");

// Load current visitors on page load
loadVisitors();

// Also search on Enter key
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadVisitors();
});

async function loadVisitors() {
  const q = searchInput.value.trim();
  const url = q ? `/api/visitors/search?q=${encodeURIComponent(q)}` : "/api/visitors/current";

  try {
    const res = await fetch(url);
    const visitors = await res.json();

    // Only show signed-in visitors
    const signedIn = visitors.filter((v) => v.status === "signed_in");

    if (signedIn.length === 0) {
      listEl.innerHTML = `<p style="text-align:center;color:var(--gray-3);padding:2rem;">No signed-in visitors found.</p>`;
      return;
    }

    listEl.innerHTML = signedIn
      .map(
        (v) => `
      <div class="visitor-card">
        <div class="info">
          <h3>${esc(v.visitor_name)}</h3>
          <p>${esc(v.company || "")}${v.company && v.host_name ? " — " : ""}Visiting ${esc(v.host_name)} &middot; ${esc(v.purpose)} &middot; In since ${formatTime(v.sign_in_time)}</p>
        </div>
        <button class="btn btn-danger btn-sm" onclick="signOut(${v.id})">Sign Out</button>
      </div>`
      )
      .join("");
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--red);">Failed to load visitors.</p>`;
  }
}

async function signOut(id) {
  if (!confirm("Sign out this visitor?")) return;
  alertEl.innerHTML = "";

  try {
    const res = await fetch(`/api/visitors/signout/${id}`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    const visitor = await res.json();
    alertEl.innerHTML = `<div class="alert alert-success"><strong>${visitor.visitor_name}</strong> has been signed out.</div>`;
    loadVisitors();

    setTimeout(() => { alertEl.innerHTML = ""; }, 3000);
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function esc(str) {
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
