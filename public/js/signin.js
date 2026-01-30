const form = document.getElementById("signinForm");
const alertEl = document.getElementById("alert");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertEl.innerHTML = "";

  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch("/api/visitors/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Sign-in failed.");
    }

    const visitor = await res.json();
    form.reset();

    // Redirect to badge print page
    const bp = new URLSearchParams({
      id: visitor.id,
      name: visitor.visitor_name || "",
      company: visitor.company || "",
      host: visitor.host_name || "",
      purpose: visitor.purpose || "",
      badge: visitor.badge_number || visitor.id,
      time: visitor.sign_in_time || "",
    });
    window.location.href = `/badge.html?${bp.toString()}`;
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
});
