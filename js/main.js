
const apiKey = '58cdf0b3a93c10cad377e41e839be689';

const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const weatherDisplay = document.getElementById('weatherDisplay');
const cityNameEl = document.getElementById('cityName');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const weatherIcon = document.getElementById('weatherIcon');
const forecastContainer = document.getElementById('forecastContainer');
const forecastCards = document.getElementById('forecastCards');
const recentCitiesContainer = document.getElementById('recentCitiesContainer');
const recentCitiesDropdown = document.getElementById('recentCities');

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city !== '') {
    fetchWeatherByCity(city);
    updateRecentCities(city);
  }
});

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    });
  }
});

function fetchWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => displayCurrentWeather(data))
    .catch(() => alert("Invalid city or error fetching data."));
}

function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => displayCurrentWeather(data))
    .catch(() => alert("Error fetching location data."));
}

function displayCurrentWeather(data) {
  weatherDisplay.classList.remove('hidden');
  cityNameEl.textContent = data.name;
  temperatureEl.textContent = `Temp: ${data.main.temp} °C`;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  fetchExtendedForecast(data.coord.lat, data.coord.lon);
}

function fetchExtendedForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      forecastCards.innerHTML = '';
      const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00"));
      filtered.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = "bg-gradient-to-br from-gray-700 to-gray-900 text-white bg-opacity-60 p-4 rounded-xl shadow-md border border-white/20 backdrop-blur-md text-center transform transition duration-500 ease-in-out hover:scale-105 opacity-0 animate-fade-in";
        card.style.animationDelay = `${index * 100}ms`;
        card.innerHTML = `
          <p class="font-semibold">${new Date(day.dt_txt).toLocaleDateString()}</p>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="" class="mx-auto w-14 h-14" />
          <p class="text-lg font-medium">${day.main.temp} °C</p>
          <p>Humidity: ${day.main.humidity}%</p>
          <p>Wind: ${day.wind.speed} m/s</p>
        `;
        forecastCards.appendChild(card);
      });
      forecastContainer.classList.remove('hidden');
    });
}

function updateRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    cities = cities.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
  }
  renderCityDropdown(cities);
}

function renderCityDropdown(cities) {
  recentCitiesDropdown.innerHTML = '';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });

  if (cities.length > 0) {
    recentCitiesContainer.classList.remove('hidden');
  }

  recentCitiesDropdown.onchange = () => {
    fetchWeatherByCity(recentCitiesDropdown.value);
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (saved.length) {
    renderCityDropdown(saved);
  }
});
