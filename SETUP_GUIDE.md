# AirFlow - Setup Guide

## ⚠️ IMPORTANT: Get Your API Key

Your app **won't work** until you add a valid OpenWeatherMap API key. Here's how to fix it:

### Step 1: Get Your API Key

1. Go to [OpenWeatherMap API](https://openweathermap.org/api)
2. Click "Sign Up" (it's free!)
3. Create an account and verify your email
4. Go to your API keys section
5. Copy your **API Key**

### Step 2: Add the API Key to Your App

1. Open `script.js` in your text editor
2. Find line 2: `const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';`
3. Replace `'YOUR_OPENWEATHERMAP_API_KEY'` with your actual key

**Example:**
```javascript
// Before:
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

// After:
const API_KEY = 'abc123def456ghi789jkl012mno345pq';
```

### Step 3: Open the App

1. Open `index.html` in your web browser
2. The app should now work!

---

## ✨ Features (Now Working!)

✅ **🔍 Search any city by name** - Type a city and press Enter  
✅ **📍 Use your current location** - Click the location button  
✅ **📊 Real-time weather data** - Temperature, wind, humidity, pressure, UV index, sunrise/sunset  
✅ **💨 Air Quality Index (AQI)** - See pollution levels (PM2.5, PM10, O₃, NO₂)  
✅ **📈 7-day historical trends** - Track temperature, AQI, and humidity changes  
✅ **🎨 Dark/Light mode** - Toggle theme anytime  
✅ **📱 Fully responsive** - Works on desktop, tablet, and mobile  

---

## 🎯 Quick Start

1. **Search a city**: Type "London" and press Enter
2. **Use GPS**: Click the 📍 button to get your location's weather
3. **View history**: Your last 5 searches are saved
4. **Switch units**: Toggle between °C and °F
5. **Dark mode**: Click the ☾ button to toggle theme

---

## 📊 What You'll See

### Main Weather Panel
- Current temperature
- Weather description
- Feels like temperature
- Humidity, pressure, wind speed
- Wind direction with compass bearing
- Visibility and cloud cover
- Dew point temperature
- UV Index

### Air Quality Section
- AQI Score (1-5 scale)
- Color-coded status (Good/Fair/Moderate/Poor/Very Poor)
- Detailed pollutant levels:
  - PM2.5 (fine particulate matter)
  - PM10 (coarse particulate matter)
  - O₃ (ozone)
  - NO₂ (nitrogen dioxide)

### 5-Day Forecast
- Daily weather predictions
- Temperature and conditions

### 7-Day Historical Charts
- Temperature trends
- Air quality trends
- Humidity patterns
- Interactive chart switching

---

## 🌍 Supported Locations

OpenWeatherMap covers **ALL countries worldwide**. You can search any city!

**Examples:**
- London, UK
- Tokyo, Japan
- Sydney, Australia
- New York, USA
- Dubai, UAE
- Mumbai, India
- And every other city on Earth!

---

## 💡 Tips

- **Health-conscious**: Check AQI before outdoor activities
- **Athletes**: Monitor air quality and humidity for training
- **Planners**: Use forecasts to schedule outdoor events
- **Mobile users**: App is fully responsive and works offline after first load

---

## ❓ Troubleshooting

**Problem**: Weather data not showing  
**Solution**: Check that your API key is correct in `script.js`

**Problem**: "City not found" error  
**Solution**: Make sure you're spelling the city name correctly

**Problem**: Charts not displaying  
**Solution**: The app needs at least 1 day of history. Search once, wait 1 day, then the chart will appear

**Problem**: Location button not working  
**Solution**: Browser needs permission to access your location. Allow it when prompted

---

## 📝 Need Help?

1. Check your API key is properly added
2. Verify you have an internet connection
3. Try searching a major city like "London"
4. Check browser console (F12) for error messages

Enjoy your weather monitoring! 🌤️
