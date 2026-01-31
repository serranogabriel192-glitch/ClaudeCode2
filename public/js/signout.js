var alertEl = document.getElementById("alert");
var listEl = document.getElementById("visitorList");
var searchInput = document.getElementById("searchInput");
var foundVisitor = null;
var scanStream = null;
var scanInterval = null;

// Load current visitors on page load
loadVisitors();

// Search on Enter key
searchInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") loadVisitors();
});

// Badge input on Enter key
document.getElementById("badgeInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") lookupBadge();
});

// --- Tab switching ---
function switchTab(tab) {
  document.getElementById("tabScan").classList.toggle("active", tab === "scan");
  document.getElementById("tabManual").classList.toggle("active", tab === "manual");
  document.getElementById("scanPanel").style.display = tab === "scan" ? "block" : "none";
  document.getElementById("manualPanel").style.display = tab === "manual" ? "block" : "none";
  if (tab === "scan") {
    startScanner();
  } else {
    stopScanner();
    document.getElementById("badgeInput").focus();
  }
}

// --- Barcode Scanner ---
function startScanner() {
  var video = document.getElementById("scanVideo");
  var hint = document.getElementById("scanHint");

  // Check for BarcodeDetector support
  if (!("BarcodeDetector" in window)) {
    hint.textContent = "Barcode scanning not supported in this browser. Use manual entry.";
    switchTab("manual");
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 640, height: 480 } })
    .then(function(stream) {
      scanStream = stream;
      video.srcObject = stream;
      hint.textContent = "Point camera at the badge barcode";

      var detector = new BarcodeDetector({ formats: ["code_128", "code_39", "ean_13", "qr_code"] });

      scanInterval = setInterval(function() {
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

        detector.detect(video).then(function(barcodes) {
          if (barcodes.length > 0) {
            var value = barcodes[0].rawValue;
            if (value) {
              hint.textContent = "Barcode detected: " + value;
              stopScanner();
              lookupBadgeNumber(value);
            }
          }
        }).catch(function() {});
      }, 300);
    })
    .catch(function() {
      hint.textContent = "Camera not available. Use manual badge entry.";
      switchTab("manual");
    });
}

function stopScanner() {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  if (scanStream) {
    scanStream.getTracks().forEach(function(t) { t.stop(); });
    scanStream = null;
  }
}

// Start scanner on page load
startScanner();

// --- Badge lookup ---
function lookupBadge() {
  var badge = document.getElementById("badgeInput").value.trim();
  if (!badge) return;
  lookupBadgeNumber(badge);
}

function lookupBadgeNumber(badge) {
  fetch("/api/visitors/badge/" + encodeURIComponent(badge))
    .then(function(res) {
      if (!res.ok) throw new Error("not found");
      return res.json();
    })
    .then(function(visitor) {
      foundVisitor = visitor;
      showBadgeResult(visitor);
    })
    .catch(function() {
      alertEl.innerHTML = '<div class="alert alert-error">No signed-in visitor found with badge <strong>' + esc(badge) + '</strong>.</div>';
      setTimeout(function() { alertEl.innerHTML = ""; }, 3000);
      // Restart scanner after failed scan
      if (document.getElementById("tabScan").classList.contains("active")) {
        startScanner();
      }
    });
}

function showBadgeResult(visitor) {
  var resultEl = document.getElementById("badgeResult");
  document.getElementById("resultName").textContent = visitor.visitor_name;

  var details = "";
  if (visitor.company) details += visitor.company + " — ";
  details += "Visiting " + visitor.host_name;
  details += " · Badge " + (visitor.badge_number || "—");
  details += " · In since " + formatTime(visitor.sign_in_time);
  if (visitor.escort_required) details += " · ESCORT REQUIRED";
  document.getElementById("resultDetails").textContent = details;

  // Show photo if available
  var photoBox = document.getElementById("resultPhoto");
  if (visitor.photo) {
    document.getElementById("resultPhotoImg").src = visitor.photo;
    photoBox.style.display = "block";
  } else {
    photoBox.style.display = "none";
  }

  resultEl.style.display = "block";
}

function clearResult() {
  foundVisitor = null;
  document.getElementById("badgeResult").style.display = "none";
  document.getElementById("badgeInput").value = "";
  // Restart scanner
  if (document.getElementById("tabScan").classList.contains("active")) {
    startScanner();
  }
}

function signOutFound() {
  if (!foundVisitor) return;
  signOut(foundVisitor.id);
  clearResult();
}

// --- Visitor list ---
async function loadVisitors() {
  var q = searchInput.value.trim();
  var url = q ? "/api/visitors/search?q=" + encodeURIComponent(q) : "/api/visitors/current";

  try {
    var res = await fetch(url);
    var visitors = await res.json();

    var signedIn = visitors.filter(function(v) { return v.status === "signed_in"; });

    if (signedIn.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:var(--gray-3);padding:2rem;">No signed-in visitors found.</p>';
      return;
    }

    listEl.innerHTML = signedIn
      .map(function(v) {
        var escortTag = v.escort_required ? ' <span style="color:#c62828;font-weight:600;font-size:.75rem;">ESCORT REQ.</span>' : "";
        return '<div class="visitor-card">' +
          '<div class="info">' +
            '<h3>' + esc(v.visitor_name) + escortTag + '</h3>' +
            '<p>' + esc(v.company || "") + (v.company && v.host_name ? " — " : "") +
            'Visiting ' + esc(v.host_name) + ' &middot; ' + esc(v.purpose) +
            ' &middot; Badge ' + esc(v.badge_number || "—") +
            ' &middot; In since ' + formatTime(v.sign_in_time) + '</p>' +
          '</div>' +
          '<button class="btn btn-danger btn-sm" onclick="signOut(' + v.id + ')">Sign Out</button>' +
        '</div>';
      })
      .join("");
  } catch (err) {
    listEl.innerHTML = '<p style="color:var(--red);">Failed to load visitors.</p>';
  }
}

async function signOut(id) {
  if (!confirm("Sign out this visitor?")) return;
  alertEl.innerHTML = "";

  try {
    var res = await fetch("/api/visitors/signout/" + id, { method: "POST" });
    if (!res.ok) {
      var err = await res.json();
      throw new Error(err.error);
    }
    var visitor = await res.json();
    alertEl.innerHTML = '<div class="alert alert-success"><strong>' + esc(visitor.visitor_name) + '</strong> has been signed out.</div>';
    loadVisitors();
    setTimeout(function() { alertEl.innerHTML = ""; }, 3000);
  } catch (err) {
    alertEl.innerHTML = '<div class="alert alert-error">' + esc(err.message) + '</div>';
  }
}

function esc(str) {
  var el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}

function formatTime(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
