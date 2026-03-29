const API_KEY = "ecc92bc7611f46a7ba955009262503";

const loader = document.getElementById("loader");
const errorMsg = document.getElementById("errorMsg");

/* 📍 On Load */
window.onload = () => {
  const savedCity = localStorage.getItem("lastCity");

  if (savedCity) {
    fetchWeather(savedCity);
  } else {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      () => showError("Location access denied")
    );
  }
};

/* 🔍 Search */
function getWeather() {
  const city = document.getElementById("searchInput").value.trim();

  if (!city) {
    showError("Please enter a city");
    return;
  }

  localStorage.setItem("lastCity", city);
  fetchWeather(city);
}

/* 🌐 API Call */
async function fetchWeather(query) {
  try {
    showLoader();

    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=6`
    );

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    updateUI(data);
    updateForecast(data);
    hideError();

  } catch (err) {
    showError(err.message || "Something went wrong");
  } finally {
    hideLoader();
  }
}

/* UI Update */
function updateUI(data) {
  document.getElementById("city").innerText = data.location.name;
  document.getElementById("date").innerText = data.location.localtime;
  document.getElementById("condition").innerText = data.current.condition.text;

  document.getElementById("temp").innerText =
    Math.round(data.current.temp_c) + "°C";

  document.getElementById("feels").innerText =
    Math.round(data.current.feelslike_c) + "°C";

  document.getElementById("humidity").innerText =
    data.current.humidity + "%";

  document.getElementById("wind").innerText =
    data.current.wind_kph + " km/h";

  document.getElementById("uv").innerText =
    data.current.uv;

  toggleRain(data.current.condition.text.toLowerCase());
}

/* Forecast */
function updateForecast(data) {
  const box = document.getElementById("forecast");
  box.innerHTML = "";

  data.forecast.forecastday.forEach(day => {
    const d = new Date(day.date);

    box.innerHTML += `
      <div class="card">
        <p>${d.toLocaleDateString("en-US",{weekday:"short"})}</p>
        <img src="${day.day.condition.icon}" />
        <h3>${Math.round(day.day.avgtemp_c)}°C</h3>
      </div>
    `;
  });
}

/* 🌧 Rain */
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rain = Array.from({ length: 150 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  l: Math.random() * 20,
  s: Math.random() * 6 + 4
}));

function drawRain() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.3)";

  rain.forEach(d => {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x, d.y + d.l);
    ctx.stroke();

    d.y += d.s;
    if (d.y > canvas.height) d.y = 0;
  });

  requestAnimationFrame(drawRain);
}

function toggleRain(condition) {
  if (condition.includes("rain")) {
    canvas.style.display = "block";
    drawRain();
  } else {
    canvas.style.display = "none";
  }
}

/* 🔄 Loader */
function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

/* ❌ Error */
function showError(msg) {
  errorMsg.innerText = msg;
  errorMsg.classList.remove("hidden");

  setTimeout(() => {
    errorMsg.classList.add("hidden");
  }, 3000);
}

function hideError() {
  errorMsg.classList.add("hidden");
}