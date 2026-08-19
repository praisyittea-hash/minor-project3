# Weather App + Movie Search App (Minor Project 03)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![REST API](https://img.shields.io/badge/REST_APIs-Open--Meteo_%7C_OMDb-4F46E5?style=for-the-badge)](https://open-meteo.com)

---

## 📌 Project Overview

**PulseHub** is a dual-application web suite engineered for **Minor Project 03**. The application integrates two complete, interactive web solutions:
1. **Weather Tracker App** – Real-time global meteorological forecasts, 24-hour hourly trend slider, 7-day extended forecasts, and comprehensive atmospheric metrics (humidity, wind speed, pressure, precipitation chance, sunrise & sunset).
2. **Movie & Series Explorer App** – Multi-source movie database search, type & release year filters, interactive movie cards, full plot/cast modal, multi-critic ratings breakdown (IMDb, Rotten Tomatoes, Metacritic), and a persistent Watchlist / Favorites system.

Both applications are accessible through a unified glassmorphic portal (`index.html`) as well as dedicated standalone pages (`weather.html` and `movies.html`).

---

## 🎯 Learning Objectives & Implementation Mapping

| Objective | Requirement | Project Implementation |
| :--- | :--- | :--- |
| **JavaScript ES6+** | Arrow functions, Template literals, Destructuring, Modules, Spread/Rest syntax | Implemented modular architecture in `js/` directory using ES6 `import`/`export`, object destructuring, default parameters, and template literals for dynamic HTML rendering. |
| **DOM Manipulation** | Dynamic content updates, Event handling, Form processing, UI state rendering | Dynamic element rendering, real-time input debounce, interactive modal dialogs, offcanvas drawer, skeleton shimmer loaders, and active tab switching. |
| **Asynchronous Programming** | Promises, `async`/`await`, Fetch API, Error Handling | Clean `async`/`await` request chains, non-blocking parallel data fetching, centralized `try...catch` blocks, and toast notification alerts. |
| **API Integration** | REST APIs, JSON parsing, Response handling, Error fallbacks | Integrated **Open-Meteo Geocoding & Forecast APIs** (no-key, high-precision) and **OMDb API** + **TVMaze API** fallback for resilient movie discovery. |
| **Responsive Web Design** | Mobile-first layout, CSS Grid & Flexbox, Glassmorphism, Dark UI | Fully responsive design system in `css/` tokens with custom animations, custom scrollbars, and fluid clamp typography. |

---

## ✨ Features Breakdown

### 🌤️ Weather App
- **City Search & Autocomplete**: Real-time geocoding queries with dropdown suggestions as you type.
- **Geolocation Integration**: 1-click **"Use My Current Location"** button with automatic reverse geocoding.
- **Current Weather Hero**: Big temperature display, high/low ranges, feels-like indicator, synchronized local time, and dynamic SVG condition illustrations.
- **Weather Metrics Grid**:
  - 💧 **Humidity (%)**
  - 💨 **Wind Speed & Direction (km/h or mph)**
  - ⏲️ **Atmospheric Pressure (hPa)**
  - 🌧️ **Precipitation Probability (%)**
  - 🌅 **Sunrise & Sunset Times**
- **24-Hour Hourly Forecast Slider**: Horizontal interactive slider illustrating hourly weather progression and temperatures.
- **7-Day Extended Forecast**: Daily forecast list with high/low visual temperature distribution bars.
- **Unit Switcher**: Real-time Celsius (°C) ⇄ Fahrenheit (°F) conversion.
- **Recent Search History**: Persistent history chips in `localStorage` for quick 1-click weather reloads.
- **Graceful Error Handling**: Error states for invalid city queries, network dropouts, and location permission denial.

---

### 🎬 Movie Search App
- **Real-Time Search & Debounce**: Live searching on typing (350ms debounce) or instant submit.
- **Multi-Filter Toolbar**: Filter by Type (All, Movies, TV Series, Episodes) and Release Year.
- **Quick Genre Chips**: 1-click search tags for Batman, Avengers, Sci-Fi, Animation, Horror, and Cyberpunk.
- **Interactive Movie Cards**: Responsive poster grids with fallback SVG placeholders for missing posters, type pills, release year badges, and rating indicators.
- **Detailed Movie Modal**:
  - Full plot summary & genre tags
  - Director, Writers, and Full Cast list
  - Box Office gross & Award achievements
  - Multi-critic ratings comparison (IMDb, Rotten Tomatoes, Metacritic)
- **Watchlist / Favorites System**:
  - Add/remove movies with a single heart click
  - Persistent state in browser `localStorage`
  - Slide-out Offcanvas Watchlist Drawer with live item counter badge
  - Clear all and 1-click details view
- **Custom API Key Manager**: Modal dialog allowing evaluation with custom OMDb API keys or instant reset to default key.

---

## 🗂️ Project Directory Structure

```
Minor-project3/
├── index.html                 # Unified Multi-App Portal & Dashboard
├── weather.html               # Dedicated Standalone Weather Application
├── movies.html                # Dedicated Standalone Movie Search Application
├── README.md                  # Detailed Documentation & Guide
├── css/
│   ├── base.css               # Design tokens, reset, typography, utilities & animations
│   ├── navigation.css         # Sticky navbar, app tabs, responsive mobile menu
│   ├── weather.css            # Weather hero card, metrics grid, hourly slider, 7-day forecast
│   └── movies.css             # Movie grid, poster cards, modal dialog, watchlist drawer
└── js/
    ├── main.js                # Global portal router, tab navigation & coordinator
    ├── weatherApp.js          # Weather App DOM controller & state manager
    ├── movieApp.js            # Movie App DOM controller, filter handlers & favorites
    ├── api/
    │   ├── weatherApi.js      # Open-Meteo geocoding & forecast REST API client
    │   └── movieApi.js        # OMDb API client & TVMaze fallback integration
    ├── utils/
    │   ├── helpers.js         # Debounce, date/time formatters, WMO code icon mapper
    │   └── storage.js         # LocalStorage manager (weather history, movie watchlist)
    └── components/
        ├── toast.js           # Animated floating toast notification system
        └── modal.js           # Accessible movie details & API key modal manager
```

---

## 🚀 How to Run the Project Locally

Because this project uses modern standard **ES6 JavaScript Modules** (`import` / `export`), it should be served via a local web server (or standard VS Code Live Server / static host).

### Option 1: Using Node.js / `npx serve` (Quickest)
```bash
# In the project root directory:
npx -y serve .
```
Then open `http://localhost:3000` in your browser.

### Option 2: Using Python Built-in HTTP Server
```bash
# Python 3
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 3: Using VS Code / IDE Extension
- Right-click `index.html` and select **"Open with Live Server"**.

---

## 📡 REST APIs Utilized

1. **Open-Meteo Geocoding API**
   - Endpoint: `https://geocoding-api.open-meteo.com/v1/search`
   - Purpose: Converts user query into exact coordinates, country, and admin region without requiring API keys.
2. **Open-Meteo Forecast API**
   - Endpoint: `https://api.open-meteo.com/v1/forecast`
   - Purpose: Fetches real-time temperature, apparent temperature, humidity, wind velocity, precipitation probability, pressure, sunrise/sunset, 24-hr hourly forecast, and 7-day extended forecasts.
3. **OMDb REST API**
   - Endpoint: `https://www.omdbapi.com/`
   - Purpose: Queries film database, provides high-res posters, IMDb rating, Rotten Tomatoes scores, Metascores, box office, directors, and plot summaries.
4. **TVMaze REST API (Fallback Engine)**
   - Endpoint: `https://api.tvmaze.com/`
   - Purpose: Provides guaranteed fallback data for searches without rate limits.

---

## 📝 Submission Checklist (Minor Project 03)

- [x] Search weather information by city name
- [x] Display current temperature and weather conditions
- [x] Show additional details (humidity, wind speed, pressure, sunrise/sunset)
- [x] Handle weather API errors gracefully
- [x] Responsive Weather UI
- [x] Search movies using public movie database API
- [x] Display movie posters and details
- [x] Show movie ratings and release information
- [x] Handle invalid search queries & empty states
- [x] Responsive Movie UI
- [x] ES6+ features (Arrow functions, Template literals, Destructuring, Modules)
- [x] Dynamic DOM manipulation & event handling
- [x] Asynchronous programming (`async`/`await`, Promises, Fetch API)
- [x] Project documentation & source code structure
- [x] Submission deadline verified (20/06/2026)

---

## 👨‍💻 Author & Submission Note
- **Project Module**: Minor Project 03
- **Submission Type**: GitHub Repository / Google Colab Link
- **Date**: 20/06/2026
