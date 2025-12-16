let lat1, lon1;
let targetAzimuth = 0;
let heading = 0;

/* =========================
   GPS - Posição Local
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
    err => {
      alert("Erro ao obter GPS");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
}

/* =========================
   Distância (Haversine)
========================= */
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* =========================
   Azimute
========================= */
function azimuth(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;

  const y =
    Math.sin(toRad(lon2 - lon1)) *
    Math.cos(toRad(lat2));

  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.cos(toRad(lon2 - lon1));

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/* =========================
   Calcular Direção
========================= */
function calculate() {
  const lat2 = parseFloat(document.getElementById("lat2").value);
  const lon2 = parseFloat(document.getElementById("lon2").value);

  if (!lat1 || isNaN(lat2) || isNaN(lon2)) {
    alert("Obtenha o GPS e preencha a outra ponta");
    return;
  }

  targetAzimuth = azimuth(lat1, lon1, lat2, lon2);
  const d = distance(lat1, lon1, lat2, lon2);

  document.getElementById("status").innerText =
    `Azimute alvo: ${targetAzimuth.toFixed(1)}° | Distância: ${(d / 1000).toFixed(2)} km`;

  document.getElementById("target").style.transform =
    `rotate(${targetAzimuth}deg)`;
}

/* =========================
   Bússola (Sensor)
========================= */
function initCompass() {
  if (typeof DeviceOrientationEvent === "undefined") {
    alert("Sensor de orientação não disponível");
    return;
  }

  if (DeviceOrientationEvent.requestPermission) {
    // iOS
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          window.addEventListener("deviceorientationabsolute", handleOrientation, true);
        } else {
          alert("Permissão de bússola negada");
        }
      })
      .catch(console.error);
  } else {
    // Android
    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  }
}

function handleOrientation(event) {
  if (event.alpha === null) return;

  heading = event.alpha;
  updateCompass();
}

/* =========================
   Atualizar Bússola
========================= */
function updateCompass() {
  const needle = document.getElementById("needle");

  needle.style.transform = `rotate(${heading}deg)`;

  let diff = targetAzimuth - heading;

  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  let color = "red";
  if (Math.abs(diff) < 2) color = "lime";
  else if (Math.abs(diff) < 5) color = "yellow";

  needle.style.background = color;
}

/* =========================
   Inicialização
========================= */
window.onload = () => {
  initCompass();
};
