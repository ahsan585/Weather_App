# 🌤️ Atmosphere — Real-Time Weather App

A stunning, premium weather forecast web app built with pure **HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no build tools, just open the file and go.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 **City Search** | Search any city, country, or landmark worldwide |
| 📍 **Geolocation** | One-click weather for your current location |
| 🌡️ **Unit Toggle** | Switch between °C and °F instantly |
| ⏱️ **Hourly Forecast** | Scrollable 24-hour timeline |
| 📅 **3-Day Forecast** | Daily high/low with weather icons |
| 📊 **Detailed Metrics** | Humidity, Wind, UV Index, Pressure, Visibility, Cloud Cover |
| ⚡ **Quick City Chips** | One-click popular cities (Karachi, London, Tokyo…) |
| 🕘 **Search History** | Persisted recent searches via localStorage |
| 🎨 **Dynamic Themes** | Background adapts to weather — sunny, rainy, snowy, stormy, night |
| 💎 **Glassmorphism UI** | Frosted-glass cards, ambient glow orbs, smooth animations |
| 📱 **Fully Responsive** | Optimized for mobile, tablet, and desktop |

---

## 🚀 Quick Start

```bash
# Option 1: Open directly
# Simply double-click Weather.html in your file explorer

# Option 2: Using VS Code Live Server
# Right-click Weather.html → Open with Live Server

# Option 3: Using Python simple server
python -m http.server 8080
# Then open http://localhost:8080/Weather.html
```

> **No API key required!** This app uses [wttr.in](https://wttr.in), a free open-source weather service.

---

## 📁 File Structure

```
Weather App/
├── Weather.html    # Main HTML structure & semantic layout
├── Weather.css     # Design system, glassmorphism styles & animations
├── Weather.js      # App logic, API calls, state management
└── README.md       # Project documentation (this file)
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure, accessibility, SEO |
| **CSS3** | Glassmorphism, CSS variables, Grid, Flexbox, animations |
| **Vanilla JavaScript (ES6+)** | Async/await, fetch API, localStorage, DOM manipulation |
| **[wttr.in API](https://wttr.in)** | Free weather data — no API key required |
| **Google Fonts** | Plus Jakarta Sans typography |

---

## 🌐 API Reference

This app uses the **wttr.in** JSON API:

```
GET https://wttr.in/{city}?format=j1
```

**Returns:**
- `current_condition` — Temperature, humidity, wind, UV, pressure, visibility, cloud cover
- `weather` — 3-day daily forecast (high/low temps)
- `weather[].hourly` — Hourly breakdown per day
- `nearest_area` — Resolved city and country name

**Example:**
```
https://wttr.in/Karachi?format=j1
https://wttr.in/24.8607,67.0011?format=j1  (coordinates)
```

---

## 🎨 Design System

### Color Themes (auto-applied based on weather)
| Theme | Condition |
|---|---|
| `theme-sunny` | Clear sky, sunny |
| `theme-cloudy` | Partly cloudy, overcast |
| `theme-rainy` | Rain, drizzle, showers |
| `theme-snowy` | Snow, sleet, blizzard |
| `theme-stormy` | Thunderstorms |
| `theme-night` | Any condition between 8 PM – 6 AM |
| `theme-default` | Fallback / loading state |

### Key CSS Variables
```css
--color-accent    /* Primary highlight color */
--color-accent-2  /* Gradient secondary color */
--color-surface   /* Glassmorphism card background */
--glass-blur      /* Backdrop blur intensity */
--transition      /* Smooth animation timing */
```

---

## 💡 How It Works

1. **Search** → User types a city and submits.
2. **Fetch** → `Weather.js` calls `wttr.in/{city}?format=j1`.
3. **Parse** → Response JSON is parsed; weather code maps to emoji + theme.
4. **Render** → Current conditions, metrics grid, hourly slider, 3-day list are populated.
5. **Theme** → Body class is updated to apply the matching gradient background.
6. **History** → City is saved to `localStorage` for future quick access.

---

## 🔧 Customization

### Add more popular city chips
In `Weather.html`, add a new `<button>` inside `.quick-chips`:
```html
<button class="chip" data-city="Paris">Paris</button>
```

### Change default city on load
In `Weather.js`, find the `init()` function and edit:
```js
fetchWeather('YourDefaultCity');
```

### Change unit default
```js
const state = {
  unit: 'F',   // Change 'C' to 'F' for Fahrenheit default
  ...
};
```

---

## 📸 Screenshots

Open `Weather.html` in any modern browser to see the live app with dynamic themes and real-time data.

---

## 📝 License

Free to use for personal and educational purposes.

---

*Built with ❤️ using pure HTML, CSS, and JavaScript — no frameworks needed.*
