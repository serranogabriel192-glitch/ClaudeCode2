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
    alertEl.innerHTML = `<div class="alert alert-success">
      Welcome, <strong>${visitor.visitor_name}</strong>! You are signed in.
      ${visitor.host_name ? `Your host <strong>${visitor.host_name}</strong> has been notified.` : ""}
    </div>`;
    form.reset();

    // Auto-redirect to welcome screen after 5 seconds
    setTimeout(() => { window.location.href = "/"; }, 5000);
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
});
