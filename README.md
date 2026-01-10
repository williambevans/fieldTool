# 🦅 HH Holdings Energy Intel Mobile - EAGLE
## Soaring Above the Energy Frontier

Professional mobile field analysis tool for Texas energy infrastructure development. Built by Bevans Real Estate with 14+ years of Texas property research expertise.

**🚀 [Live Demo](https://williambevans.github.io/fieldTool/)** | **Deployed on GitHub Pages**

## ✨ Features

- 📍 **Real-time GPS site capture and analysis** - Accurate location tracking with geolocation API
- ☀️ **Solar farm capacity calculations** - NREL methodology for solar PV systems
- 🏢 **Data center power requirement modeling** - PUE-based power consumption analysis
- 💾 **Site database with JSON/CSV export** - LocalStorage persistence for offline work
- 🗺️ **Bosque County infrastructure context** - Regional data integration
- ⚡ **Oncor territory mapping** - Power transmission corridor analysis
- 🌊 **Brazos River proximity analysis** - Hydrological considerations
- 📱 **Mobile-first responsive design** - Works on Android, iOS, and desktop browsers
- 🔧 **Termux compatible** - Run natively on Android with Termux

## 🎯 Perfect For

- Land brokers and real estate professionals
- Energy developers and consultants
- Solar farm site scouts
- Data center location analysts
- Agricultural land conversion analysis
- Field research teams

## 🛠️ Installation & Setup

### Option 1: Web Browser (Recommended for MVP)
1. Clone the repository:
   ```bash
   git clone https://github.com/williambevans/fieldTool.git
   cd fieldTool
   ```
2. Open `index.html` in your browser (or use a local server):
   ```bash
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

### Option 2: GitHub Pages (Already Deployed)
Visit: https://williambevans.github.io/fieldTool/

### Option 3: Termux on Android
1. Install Termux from F-Droid
2. Clone repo and serve:
   ```bash
   pkg install python3
   git clone https://github.com/williambevans/fieldTool.git
   cd fieldTool
   python3 -m http.server 8000
   ```
3. Access via `http://localhost:8000` in your phone's browser

## 📊 Core Functionality

### GPS Capture
- Real-time geolocation with accuracy radius
- Automatic coordinate population
- GPS status indicator

### Solar Farm Calculator
- Acreage-based capacity estimation
- Panel efficiency adjustments (default 18%)
- System loss factor (default 14%)
- Annual generation MWh projections
- NREL standard: ~1.4 acres per MW

### Data Center Power Modeling
- Building square footage input
- PUE (Power Usage Effectiveness) rating
- CPU density calculations
- Peak load and monthly consumption estimates

### Site Database
- Save/edit/delete site records
- Full localStorage persistence
- Field metadata capture
- JSON export per site
- CSV export for all sites

## 📁 Project Structure

```
fieldTool/
├── index.html          # Main web interface
├── app.js              # Core application logic
├── styles.css          # Styling (embedded in HTML)
├── README.md           # This file
├── .gitignore          # Git ignore rules
└── data/               # Optional data files
    └── sites.json      # Site database backup
```

## 🔧 Technical Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** Browser LocalStorage (no backend required)
- **Geolocation:** HTML5 Geolocation API
- **Export:** JSON, CSV
- **Deployment:** GitHub Pages (static)
- **Mobile:** Responsive design + Android Termux compatibility

## 📈 Calculation Methodologies

### Solar Capacity (NREL)
```
Capacity (MW) = Acreage × 0.71 × Panel Efficiency × (1 - System Losses)
Annual Generation (MWh) = Capacity (MW) × 1.15
```
*1.15 MWh/MW/year is Texas average annual insolation*

### Data Center Power
```
Total Power (kW) = Building Size (sqft) × CPU Density (W/sqft) × PUE / 1000
Monthly Consumption (MWh) = Peak Load (MW) × 730 hours
```

## 💾 Data Persistence

All site data is stored in browser localStorage. Export data as:
- **JSON** - Single site detailed export
- **CSV** - All sites tabular export

## 🚀 Deployment Status

✅ **Live on GitHub Pages**: https://williambevans.github.io/fieldTool/

### Deploy Updates
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Live within 1-2 minutes

## 📝 Usage Example

1. **Open the app** at live link or locally
2. **Allow GPS permission** (popup will ask)
3. **Enter field details**: Name, ID, acreage
4. **Select analysis type**: Solar, Data Center, or Both
5. **Review calculated results** (auto-calculated)
6. **Save to database** (stored locally)
7. **Export data** as JSON or CSV

## 🤝 Contributing

Issues and PRs welcome. This is a rapidly evolving project.

## 📍 Location & Company

- **Built for:** Termux (Android) | Web Browsers
- **Location:** Bosque County, Texas
- **Company:** HH Holdings / Bevans Real Estate
- **Domain:** Texas energy infrastructure analysis