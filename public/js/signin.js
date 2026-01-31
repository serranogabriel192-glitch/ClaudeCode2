const form = document.getElementById("signinForm");
const alertEl = document.getElementById("alert");

// --- Camera ---
var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var snapshot = document.getElementById("snapshot");
var captureBtn = document.getElementById("captureBtn");
var retakeBtn = document.getElementById("retakeBtn");
var photoData = null;

// Start camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 360 } })
  .then(function(stream) {
    video.srcObject = stream;
  })
  .catch(function() {
    document.getElementById("cameraBox").innerHTML = '<p style="color:#888;padding:2rem;font-size:.85rem;">Camera not available</p>';
  });

function capturePhoto() {
  canvas.width = 480;
  canvas.height = 360;
  canvas.getContext("2d").drawImage(video, 0, 0, 480, 360);
  photoData = canvas.toDataURL("image/jpeg", 0.7);
  snapshot.src = photoData;
  snapshot.style.display = "block";
  video.style.display = "none";
  captureBtn.style.display = "none";
  retakeBtn.style.display = "inline-block";
}

function retakePhoto() {
  photoData = null;
  snapshot.style.display = "none";
  video.style.display = "block";
  captureBtn.style.display = "inline-block";
  retakeBtn.style.display = "none";
}

// --- Access type auto-sets escort ---
function updateEscort() {
  var access = document.getElementById("access_type").value;
  var escortCb = document.getElementById("escort_required");
  if (access === "Escorted" || access === "Restricted") {
    escortCb.checked = true;
  } else {
    escortCb.checked = false;
  }
}

// --- Form submit ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertEl.innerHTML = "";

  const data = Object.fromEntries(new FormData(form));
  data.escort_required = document.getElementById("escort_required").checked ? 1 : 0;
  if (photoData) {
    data.photo = photoData;
  }

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
    photoData = null;

    // Stop camera
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(function(t) { t.stop(); });
    }

    // Redirect to badge print page
    const bp = new URLSearchParams({
      id: visitor.id,
      name: visitor.visitor_name || "",
      company: visitor.company || "",
      host: visitor.host_name || "",
      purpose: visitor.purpose || "",
      badge: visitor.badge_number || visitor.id,
      time: visitor.sign_in_time || "",
      access: visitor.access_type || "",
      escort: visitor.escort_required ? "1" : "0",
      nationality: visitor.nationality || "",
    });
    if (visitor.photo) {
      bp.set("photo", "1");
      bp.set("pid", visitor.id);
    }
    window.location.href = `/badge.html?${bp.toString()}`;
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
});
