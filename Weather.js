// ============================================================
// Atmosphere Weather App — Main Application Logic
// API: wttr.in (free, no API key, CORS-friendly)
// ============================================================

'use strict';

// ── Configuration ─────────────────────────────────────────
const CONFIG = {
  API_BASE: 'https://wttr.in',
  MAX_RECENT: 6,
  STORAGE_RECENT: 'atm_recent_cities',
  STORAGE_UNIT: 'atm_temp_unit',
};

// ── App State ─────────────────────────────────────────────
const state = {
  unit: localStorage.getItem(CONFIG.STORAGE_UNIT) || 'C',
  rawData: null,
  lastCity: '',
};

// ── DOM References ────────────────────────────────────────
const els = {
  body:          document.body,
  searchForm:    document.getElementById('search-form'),
  cityInput:     document.getElementById('city-input'),
  clearSearchBtn:document.getElementById('clear-search-btn'),
  searchSubmit:  document.getElementById('search-submit-btn'),
  geoBtn:        document.getElementById('geo-location-btn'),
  unitC:         document.getElementById('unit-c-btn'),
  unitF:         document.getElementById('unit-f-btn'),
  loadingState:  document.getElementById('loading-state'),
  errorState:    document.getElementById('error-state'),
  errorTitle:    document.getElementById('error-title'),
  errorMsg:      document.getElementById('error-message'),
  errorRetry:    document.getElementById('error-retry-btn'),
  dashboard:     document.getElementById('weather-dashboard'),
  cityName:      document.getElementById('city-name'),
  currentDate:   document.getElementById('current-date'),
  condBadge:     document.getElementById('condition-badge'),
  heroIcon:      document.getElementById('hero-weather-icon'),
  currentTemp:   document.getElementById('current-temp'),
  tempUnit:      document.getElementById('temp-unit-display'),
  condText:      document.getElementById('condition-text'),
  feelsLike:     document.getElementById('feels-like'),
  tempMax:       document.getElementById('temp-max'),
  tempMin:       document.getElementById('temp-min'),
  humidity:      document.getElementById('metric-humidity'),
  dewpoint:      document.getElementById('metric-dewpoint'),
  wind:          document.getElementById('metric-wind'),
  windDir:       document.getElementById('metric-wind-dir'),
  uv:            document.getElementById('metric-uv'),
  uvLevel:       document.getElementById('metric-uv-level'),
  pressure:      document.getElementById('metric-pressure'),
  visibility:    document.getElementById('metric-visibility'),
  visibilityText:document.getElementById('metric-visibility-text'),
  cloudCover:    document.getElementById('metric-cloudcover'),
  cloudText:     document.getElementById('metric-cloud-text'),
  hourlyContainer:document.getElementById('hourly-forecast-container'),
  dailyList:     document.getElementById('daily-forecast-list'),
  lastUpdated:   document.getElementById('last-updated-time'),
  recentContainer:document.getElementById('recent-searches-container'),
  recentChips:   document.getElementById('recent-chips'),
  clearHistoryBtn:document.getElementById('clear-history-btn'),
};

// ── Weather Code → Emoji & Theme ──────────────────────────
function weatherInfo(code) {
  const sunny  = { emoji: '☀️',  theme: 'sunny'   };
  const cloudy = { emoji: '⛅',  theme: 'cloudy'  };
  const overcast={ emoji: '☁️', theme: 'cloudy'  };
  const rain   = { emoji: '🌧️',  theme: 'rainy'   };
  const drizzle= { emoji: '🌦️',  theme: 'rainy'   };
  const snow   = { emoji: '❄️',  theme: 'snowy'   };
  const storm  = { emoji: '⛈️',  theme: 'stormy'  };
  const fog    = { emoji: '🌫️',  theme: 'cloudy'  };
  const map = {
    113: sunny, 116: cloudy, 119: overcast, 122: overcast,
    143: fog,   176: drizzle,179: snow,     182: rain,
    185: snow,  200: storm,  227: snow,     230: snow,
    248: fog,   260: fog,    263: drizzle,  266: drizzle,
    281: rain,  284: rain,   293: rain,     296: rain,
    299: rain,  302: rain,   305: rain,     308: rain,
    311: rain,  314: rain,   317: snow,     320: snow,
    323: snow,  326: snow,   329: snow,     332: snow,
    335: snow,  338: snow,   350: rain,     353: drizzle,
    356: rain,  359: rain,   362: snow,     365: snow,
    368: snow,  371: snow,   374: rain,     377: rain,
    386: storm, 389: storm,  392: storm,    395: storm,
  };
  return map[code] || { emoji: '🌡️', theme: 'default' };
}

// ── Temperature Conversion ────────────────────────────────
function toDisplay(c) {
  if (state.unit === 'F') return Math.round(c * 9 / 5 + 32);
  return Math.round(c);
}

function unitSuffix() {
  return state.unit === 'F' ? '°F' : '°C';
}

// ── UV Level Label ─────────────────────────────────────────
function uvLabel(idx) {
  idx = Number(idx);
  if (idx <= 2)  return 'Low';
  if (idx <= 5)  return 'Moderate';
  if (idx <= 7)  return 'High';
  if (idx <= 10) return 'Very High';
  return 'Extreme';
}

// ── Visibility Label ──────────────────────────────────────
function visLabel(km) {
  km = Number(km);
  if (km >= 10) return 'Clear view';
  if (km >= 5)  return 'Good';
  if (km >= 2)  return 'Moderate';
  return 'Poor';
}

// ── Day Name ──────────────────────────────────────────────
function dayName(dateStr, short=false) {
  const days = short
    ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

// ── Format Time ───────────────────────────────────────────
function formatTime(hmm) {
  // hmm is like "0", "300", "600", "900", "1200"...
  const h = Math.floor(Number(hmm) / 100);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return display + ' ' + suffix;
}

// ── UI State Management ───────────────────────────────────
function showLoading() {
  els.loadingState.style.display = 'flex';
  els.errorState.style.display   = 'none';
  els.dashboard.style.display    = 'none';
}
function showError(title, msg) {
  els.loadingState.style.display = 'none';
  els.errorState.style.display   = 'flex';
  els.dashboard.style.display    = 'none';
  els.errorTitle.textContent = title;
  els.errorMsg.textContent   = msg;
}
function showDashboard() {
  els.loadingState.style.display = 'none';
  els.errorState.style.display   = 'none';
  els.dashboard.style.display    = 'flex';
}
function hideAll() {
  els.loadingState.style.display = 'none';
  els.errorState.style.display   = 'none';
  els.dashboard.style.display    = 'none';
}

// ── Render Weather Data ────────────────────────────────────
function renderWeather(data, cityLabel) {
  state.rawData = data;
  const cur  = data.current_condition[0];
  const todayData = data.weather[0];
  const code = Number(cur.weatherCode);
  const info = weatherInfo(code);
  const desc = cur.weatherDesc[0]?.value || 'Unknown';

  // Apply theme
  els.body.className = 'theme-' + info.theme;
  // Night override (simple)
  const h = new Date().getHours();
  if (h < 6 || h >= 20) els.body.className = 'theme-night';

  // Hero
  els.cityName.textContent = cityLabel;
  els.currentDate.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  els.condBadge.textContent = desc;
  els.heroIcon.textContent = info.emoji;
  els.currentTemp.textContent = toDisplay(Number(cur.temp_C));
  els.tempUnit.textContent = unitSuffix();
  els.condText.textContent = desc;
  els.feelsLike.textContent = 'Feels like: ' + toDisplay(Number(cur.FeelsLikeC)) + unitSuffix();
  els.tempMax.textContent = 'H: ' + toDisplay(Number(todayData.maxtempC)) + unitSuffix();
  els.tempMin.textContent = 'L: ' + toDisplay(Number(todayData.mintempC)) + unitSuffix();

  // Metrics
  const humid = Number(cur.humidity);
  els.humidity.textContent   = humid + '%';
  els.dewpoint.textContent   = 'Dew point ~' + toDisplay(Math.round(Number(cur.temp_C) - ((100 - humid) / 5))) + unitSuffix();
  els.wind.textContent       = cur.windspeedKmph + ' km/h';
  els.windDir.textContent    = 'Direction: ' + cur.winddir16Point;
  els.uv.textContent         = cur.uvIndex;
  els.uvLevel.textContent    = uvLabel(cur.uvIndex);
  els.pressure.textContent   = cur.pressure + ' hPa';
  const vis = Number(cur.visibility);
  els.visibility.textContent = vis + ' km';
  els.visibilityText.textContent = visLabel(vis);
  const cloud = Number(cur.cloudcover);
  els.cloudCover.textContent = cloud + '%';
  els.cloudText.textContent  = cloud < 20 ? 'Clear sky' : cloud < 50 ? 'Partly cloudy' : cloud < 80 ? 'Mostly cloudy' : 'Overcast';

  // Hourly
  renderHourly(todayData.hourly);

  // Daily (3 days)
  renderDaily(data.weather);

  // Last updated
  const now = new Date();
  els.lastUpdated.textContent = 'Updated at ' + now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

  showDashboard();
}

// ── Render Hourly ──────────────────────────────────────────
function renderHourly(hourly) {
  const currentHour = new Date().getHours();
  els.hourlyContainer.innerHTML = '';

  // Merge today and tomorrow hourly for 24+ hrs
  const tomorrow = state.rawData?.weather[1]?.hourly || [];
  const combined = [...hourly, ...tomorrow].slice(0, 24);

  combined.forEach((h, i) => {
    const rawHour = Math.floor(Number(h.time) / 100);
    const isNow = i === 0 && rawHour <= currentHour;
    const info  = weatherInfo(Number(h.weatherCode));
    const div   = document.createElement('div');
    div.className = 'hourly-item' + (isNow ? ' current-hour' : '');
    div.innerHTML = '<span class="hourly-time">' + (isNow ? 'Now' : formatTime(h.time)) + '</span>'
      + '<span class="hourly-icon">' + info.emoji + '</span>'
      + '<span class="hourly-temp">' + toDisplay(Number(h.tempC)) + unitSuffix() + '</span>'
      + '<span class="hourly-rain">💧 ' + h.chanceofrain + '%</span>';
    els.hourlyContainer.appendChild(div);
  });
}

// ── Render Daily ───────────────────────────────────────────
function renderDaily(weather) {
  els.dailyList.innerHTML = '';
  weather.forEach((day, i) => {
    const code  = Number(day.hourly[4]?.weatherCode || day.hourly[0]?.weatherCode);
    const info  = weatherInfo(code);
    const desc  = day.hourly[4]?.weatherDesc[0]?.value || '';
    const label = i === 0 ? 'Today' : dayName(day.date);
    const div   = document.createElement('div');
    div.className = 'daily-row';
    div.innerHTML = '<span class="daily-day">' + label + '</span>'
      + '<span class="daily-icon">' + info.emoji + '</span>'
      + '<span class="daily-desc">' + desc + '</span>'
      + '<span class="daily-temps">'
      + '<span class="daily-high">' + toDisplay(Number(day.maxtempC)) + unitSuffix() + '</span>'
      + '<span class="daily-low">'  + toDisplay(Number(day.mintempC)) + unitSuffix() + '</span>'
      + '</span>';
    els.dailyList.appendChild(div);
  });
}

// ── Re-render with unit change (no re-fetch) ───────────────
function rerenderUnit() {
  if (!state.rawData || !state.lastCity) return;
  renderWeather(state.rawData, state.lastCity);
}

// ── Fetch Weather ─────────────────────────────────────────
async function fetchWeather(city) {
  if (!city.trim()) return;
  showLoading();
  state.lastCity = city.trim();

  try {
    const url = CONFIG.API_BASE + '/' + encodeURIComponent(city.trim()) + '?format=j1';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();

    // wttr.in returns data even for invalid cities but nearest_area will exist
    if (!data.current_condition || !data.weather) {
      throw new Error('No data');
    }

    const areaName = data.nearest_area?.[0]?.areaName?.[0]?.value || city;
    const country  = data.nearest_area?.[0]?.country?.[0]?.value || '';
    const label    = areaName + (country ? ', ' + country : '');

    saveRecent(city.trim());
    renderRecentChips();
    renderWeather(data, label);
  } catch (err) {
    showError('Could Not Load Weather', 'Unable to get weather for "' + city + '". Check the city name or your internet connection.');
  }
}

// ── Geolocation ───────────────────────────────────────────
async function fetchByGeo() {
  if (!navigator.geolocation) {
    showError('Geolocation Unavailable', 'Your browser does not support location access.');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const coord = pos.coords.latitude + ',' + pos.coords.longitude;
      await fetchWeather(coord);
    },
    () => showError('Location Denied', 'Please allow location access or search for a city manually.')
  );
}

// ── Recent Searches ───────────────────────────────────────
function getRecent() {
  try { return JSON.parse(localStorage.getItem(CONFIG.STORAGE_RECENT)) || []; }
  catch { return []; }
}
function saveRecent(city) {
  const list = getRecent().filter(c => c.toLowerCase() !== city.toLowerCase());
  list.unshift(city);
  localStorage.setItem(CONFIG.STORAGE_RECENT, JSON.stringify(list.slice(0, CONFIG.MAX_RECENT)));
}
function renderRecentChips() {
  const list = getRecent();
  if (!list.length) { els.recentContainer.style.display = 'none'; return; }
  els.recentContainer.style.display = 'flex';
  els.recentChips.innerHTML = '';
  list.forEach(city => {
    const btn = document.createElement('button');
    btn.className = 'chip recent-chip';
    btn.textContent = city;
    btn.addEventListener('click', () => {
      els.cityInput.value = city;
      fetchWeather(city);
    });
    els.recentChips.appendChild(btn);
  });
}

// ── Event Listeners ───────────────────────────────────────
els.searchForm.addEventListener('submit', () => {
  const city = els.cityInput.value.trim();
  if (city) fetchWeather(city);
});

els.cityInput.addEventListener('input', () => {
  els.clearSearchBtn.classList.toggle('visible', els.cityInput.value.length > 0);
});

els.clearSearchBtn.addEventListener('click', () => {
  els.cityInput.value = '';
  els.clearSearchBtn.classList.remove('visible');
  els.cityInput.focus();
  hideAll();
});

els.geoBtn.addEventListener('click', fetchByGeo);

els.unitC.addEventListener('click', () => {
  if (state.unit === 'C') return;
  state.unit = 'C';
  localStorage.setItem(CONFIG.STORAGE_UNIT, 'C');
  els.unitC.classList.add('active');
  els.unitF.classList.remove('active');
  rerenderUnit();
});

els.unitF.addEventListener('click', () => {
  if (state.unit === 'F') return;
  state.unit = 'F';
  localStorage.setItem(CONFIG.STORAGE_UNIT, 'F');
  els.unitF.classList.add('active');
  els.unitC.classList.remove('active');
  rerenderUnit();
});

els.errorRetry.addEventListener('click', () => {
  if (state.lastCity) fetchWeather(state.lastCity);
  else hideAll();
});

els.clearHistoryBtn.addEventListener('click', () => {
  localStorage.removeItem(CONFIG.STORAGE_RECENT);
  renderRecentChips();
});

// Quick city chips
document.querySelectorAll('.chip[data-city]').forEach(btn => {
  btn.addEventListener('click', () => {
    const city = btn.getAttribute('data-city');
    els.cityInput.value = city;
    els.clearSearchBtn.classList.add('visible');
    fetchWeather(city);
  });
});

// ── Init ──────────────────────────────────────────────────
function init() {
  // Restore unit button state
  if (state.unit === 'F') {
    els.unitF.classList.add('active');
    els.unitC.classList.remove('active');
  }
  renderRecentChips();

  // Auto-load last searched city or default
  const recent = getRecent();
  if (recent.length > 0) {
    els.cityInput.value = recent[0];
    els.clearSearchBtn.classList.add('visible');
    fetchWeather(recent[0]);
  } else {
    fetchWeather('Karachi');
  }
}

init();