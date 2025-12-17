/* =========================
   VARIÁVEIS GLOBAIS
========================= */
let lat1, lon1;
let targetAzimuth = null;
let heading = 0;

/* =========================
   GPS - POSIÇÃO LOCAL
========================= */
function getLocation() {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      lat1 = pos.coords.latitude;
      lon1 = pos.coords.longitude;

      document.getElementById("myPos").innerText =
        `Lat: ${lat1.toFixed(6)} | Lon: ${lon1.toFixed(6)}`;
    },
    () => alert("Erro ao obter GPS"),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* =========================
   CÁLCULOS
========================= */
function toRad(x) {
  return x * Math.PI / 180;
}

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function azimuth(lat1, lon1, lat2, lon2) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.cos(toRad(lon2 - lon1));

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/* =========================
   CALCULAR DIREÇÃO
========================= */
function calculate() {
  const lat2 = parseFloat(document.getElementById("lat2").value);
  const lon2 = parseFloat(document.getElementById("lon2").value);

  if (!lat1 || isNaN(lat2) || isNaN(lon2)) {
    alert("Preencha GPS local e coordenadas remotas");
    return;
  }

  targetAzimuth = azimuth(lat1, lon1, lat2, lon2);
  const d = distance(lat1, lon1, lat2, lon2);

  document.getElementById("targetValue").innerText =
    `${targetAzimuth.toFixed(1)}°`;

  document.getElementById("distanceValue").innerText =
    `${(d / 1000).toFixed(2)} km`;

  document.getElementById("target").style.transform =
    `rotate(${targetAzimuth}deg)`;
}

/* =========================
   BÚSSOLA (ANDROID + IOS)
========================= */
function initCompass() {
  if (typeof DeviceOrientationEvent === "undefined") {
    alert("Sensor de orientação não disponível");
    return;
  }

  if (DeviceOrientationEvent.requestPermission) {
    // iOS
    DeviceOrientationEvent.requestPermission()
      .then(res => {
        if (res === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          alert("Permissão de bússola negada");
        }
      })
      .catch(console.error);
  } else {
    // Android
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

function handleOrientation(event) {
  if (typeof event.webkitCompassHeading === "number") {
    heading = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    heading = 360 - event.alpha;
  } else {
    return;
  }

  updateCompass();
}

/* =========================
   ATUALIZAR VISUAL
========================= */
function updateCompass() {
  document.getElementById("needle").style.transform =
    `rotate(${heading}deg)`;

  document.getElementById("currentValue").innerText =
    `${heading.toFixed(1)}°`;

  if (targetAzimuth === null) return;

  let diff = targetAzimuth - heading;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  document.getElementById("errorValue").innerText =
    `${diff.toFixed(1)}°`;

  let color = "#ef4444";
  if (Math.abs(diff) < 2) color = "#22c55e";
  else if (Math.abs(diff) < 5) color = "#eab308";

  document.getElementById("needle").style.background = color;
}

/* =========================
   INIT
========================= */
window.onload = () => {
  initCompass();
};
