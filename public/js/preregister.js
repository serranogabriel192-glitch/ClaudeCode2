const form = document.getElementById("preregForm");
const alertEl = document.getElementById("alert");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertEl.innerHTML = "";

  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch("/api/visitors/preregister", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Pre-registration failed.");
    }

    const visitor = await res.json();
    alertEl.innerHTML = `<div class="alert alert-success">
      <strong>${visitor.visitor_name}</strong> has been pre-registered to visit <strong>${visitor.host_name}</strong>.
    </div>`;
    form.reset();
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
});
