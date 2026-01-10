# 🦅 HH Holdings Energy Intel Mobile - EAGLE
## Soaring Above the Energy Frontier

Professional mobile field analysis tool for Texas energy infrastructure development. Built by Bevans Real Estate with 14+ years of Texas property research expertise.

**Owner:** Biri Bevan | **Company:** HH Holdings / Bevans Real Estate | **Location:** Bosque County, Texas (Brazos River Region)

**🚀 [Live Web App](https://williambevans.github.io/fieldTool/)** | **⭐ [Termux CLI Version](#option-2-termux-cli-on-android-advanced-gps)**

---

## ✨ Features

### Core Capabilities (Both Versions - Production Ready)
- 📍 **Real-time GPS** - HTML5 Geolocation (web) or termux-location (CLI) for precise site capture
- ☀️ **Solar Farm Analysis** - NREL-based capacity and generation calculations
- 🖥️ **Data Center Modeling** - Power requirements, PUE, and facility sizing
- 💾 **Site Database** - localStorage (web) or JSON files (CLI) with CSV export
- 🗺️ **Bosque County Context** - Local infrastructure and utility data integration
- ⚡ **Oncor Territory** - Electric utility mapping and interconnection info
- 🌊 **Brazos River Analysis** - Water proximity for cooling requirements
- 📊 **Economic Estimates** - CAPEX, O&M, and revenue projections

### Two Production-Ready Implementations
1. **Web Version** 🚀 - Works in any browser, mobile-responsive, instant access
2. **Termux CLI** ⭐ - Native Android app with high-precision GPS for field use

## 🎯 Perfect For

- Land brokers and real estate professionals
- Energy developers and consultants
- Solar farm site scouts
- Data center location analysts
- Agricultural land conversion analysis
- Property research and due diligence
- Client presentations and field reports
- Field research teams

---

## 🛠️ Installation & Setup

### Option 1: Web Browser (Instant Access) 🚀 RECOMMENDED

**Production-ready web application - works on any device with a browser**

**Live Demo:**
Visit: **https://williambevans.github.io/fieldTool/**

**Features:**
- ✅ Full solar farm analysis with NREL methodology
- ✅ Complete data center power calculations
- ✅ GPS location capture (HTML5 Geolocation)
- ✅ Site database with localStorage persistence
- ✅ JSON and CSV export
- ✅ Mobile-responsive design
- ✅ Works offline after first load
- ✅ No installation required

**Usage:**
1. Open the link in any browser (Chrome, Safari, Firefox, Edge)
2. Grant location permission when prompted (for GPS features)
3. Start analyzing solar farms and data centers immediately
4. Data persists in browser storage

**Local Development:**
```bash
git clone https://github.com/williambevans/fieldTool.git
cd fieldTool
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Option 2: Termux CLI on Android (Advanced GPS) ⭐

**Native Android command-line tool with high-precision GPS for field work**

**Prerequisites:**
1. **Termux** from F-Droid: https://f-droid.org/packages/com.termux/
2. **Termux:API** from F-Droid: https://f-droid.org/packages/com.termux.api/

**Installation:**
```bash
# Clone repository
cd ~
git clone https://github.com/williambevans/fieldTool.git
cd fieldTool

# Run setup script
bash setup-eagle.sh

# Launch EAGLE CLI
energy-intel
```

Or use the short alias: `eagle`

**Features:**
- ✅ High-precision GPS with termux-location API
- ✅ File-based JSON database (shareable across devices)
- ✅ Command-line interface for terminal users
- ✅ Same calculation methodology as web version

**First Run:**
1. Grant storage and location permissions when prompted
2. Select option 1 to capture GPS location (requires outdoor use)
3. Select option 2 or 3 to analyze a site
4. Save your analysis to the database

---

## 📊 Usage Examples

### Web Version
1. Open the app at https://williambevans.github.io/fieldTool/
2. Allow GPS permission (popup will ask)
3. Enter field details: Name, ID, acreage
4. Select analysis type: Solar, Data Center, or Both
5. Review calculated results (auto-calculated)
6. Save to database (stored in browser localStorage)
7. Export data as JSON or CSV

### Termux CLI - Solar Farm Analysis

```
👉 Enter choice: 2

📝 Site name: Meridian Ranch Solar
📏 Land area (acres): 150
📍 Capture GPS location? (y/n): y

🛰️  Acquiring GPS signal...
✅ GPS LOCK ACQUIRED!
📍 31.874900°N, -97.642800°W (±12.5m)
🌊 Brazos River: 4.2 miles

☀️  SOLAR FARM ANALYSIS
   Installed Capacity:   75.00 MW
   Annual Generation:    131,400 MWh/year
   Homes Powered:        11,945 Texas homes/year
   Est. CAPEX:          $75,000,000

💵 REVENUE POTENTIAL (at $0.03/kWh)
   Annual Revenue:      $3,942,000

💾 Save this site to database? (y/n): y
✅ Site saved! ID: HH-20260110-143022
```

### Termux CLI - Data Center Analysis

```
👉 Enter choice: 3

📝 Site name: Bosque Edge Data Center
🔧 Analysis Method: 1 (by server count)
⚡ PUE: 2 (Good - 1.5)
🖥️  Number of servers: 1000

🖥️  DATA CENTER ANALYSIS
   Total Facility Power:  750.0 kW (0.75 MW)
   Annual Consumption:    6,570 MWh/year
   Electricity Cost:      $525,600/year
   Building Size:         187,500 sq ft
   Total Site:            12.9 acres

💧 Water Cooling: 2.5 GPM / 1.3M gallons/year

💾 Save this site to database? (y/n): y
✅ Site saved!
```

---

## 📁 Project Structure

### Web Version
```
fieldTool/
├── index.html          # Main web interface
├── app.js              # Core application logic
├── styles.css          # Styling (embedded in HTML)
└── data/               # Optional data files
    └── sites.json      # Site database backup
```

### Termux CLI Version
```
fieldTool/
├── setup-eagle.sh                 # Termux installation script
├── src/
│   ├── energy-intel-eagle.py     # Main application
│   ├── gps_utils.py               # GPS functions (termux-location)
│   ├── solar_calc.py              # Solar farm calculations
│   ├── datacenter_calc.py         # Data center power modeling
│   └── site_manager.py            # JSON database management
├── config/
│   └── bosque_county.json         # Local infrastructure data
├── docs/
│   └── USER_GUIDE.md              # Comprehensive user documentation
└── tests/
    └── test_calculations.py       # Unit tests for validation
```

### Data Storage

**Web Version:** Browser localStorage with JSON/CSV export

**Termux CLI:** File-based storage at:
```
~/storage/shared/EnergyIntel/hh_holdings_sites.json
```

Accessible from:
- Termux
- Android file manager
- Desktop (via USB or cloud sync)

---

## 🔧 Technical Details

### Web Version Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** Browser LocalStorage
- **Geolocation:** HTML5 Geolocation API
- **Export:** JSON, CSV
- **Deployment:** GitHub Pages (static)

### Termux CLI Stack
- **Language:** Python 3
- **GPS:** termux-location API (high-precision)
- **Storage:** JSON file system
- **Platform:** Termux on Android 7.0+

### Solar Calculations (Both Versions)

**Termux CLI (NREL-based):**
- **Methodology:** NREL-based for Central Texas
- **Capacity:** 0.5 MW per acre (ground-mount)
- **Capacity Factor:** 20% (conservative for region)
- **System Losses:** 14% (inverter, wiring, soiling)
- **Home Consumption:** 11 MWh/year (Texas average)

**Web Version:**
```
Capacity (MW) = Acreage × 0.71 × Panel Efficiency × (1 - System Losses)
Annual Generation (MWh) = Capacity (MW) × 1.15
```
*1.15 MWh/MW/year is Texas average annual insolation*

### Data Center Calculations

**Termux CLI:**
- **Server Power:** 500W typical, 1000W high-performance
- **PUE Options:** 1.2 (excellent) to 2.0+ (legacy)
- **Cooling Load:** 40% of IT load (Texas climate)
- **Land Requirements:** ~250 sq ft per kW
- **Water Cooling:** 0.5 GPM per 100kW IT load

**Web Version:**
```
Total Power (kW) = Building Size (sqft) × CPU Density (W/sqft) × PUE / 1000
Monthly Consumption (MWh) = Peak Load (MW) × 730 hours
```

### GPS Functionality

**Termux CLI:**
- **Provider:** termux-location API
- **Accuracy:** High-precision mode (outdoor use)
- **Bosque County Bounds:** 31.65-32.10°N, 97.40-98.00°W
- **Distance Calc:** Haversine formula for accuracy
- **Brazos River:** Reference point for water access

**Web Version:**
- **Provider:** HTML5 Geolocation API
- **Accuracy:** Device-dependent
- **Real-time:** Automatic coordinate population

---

## 🧪 Testing

### Termux CLI Test Suite

Run the test suite to validate calculations:

```bash
cd ~/fieldTool/tests
python test_calculations.py
```

Tests include:
- Solar capacity and generation calculations
- Data center power requirements
- GPS distance calculations
- Bosque County boundary checks
- Revenue and economic estimates

---

## 📖 Documentation

- **USER_GUIDE.md** - Comprehensive Termux CLI user manual with examples
- **bosque_county.json** - Local infrastructure reference data
- **Inline comments** - Detailed code documentation
- **Web Interface** - Built-in help and tooltips

---

## 🌍 Use Cases

### Solar Farm Development
1. Scout potential sites in the field
2. Capture GPS coordinates
3. Calculate capacity based on acreage
4. Estimate revenue at various PPA rates
5. Save site data for desktop analysis
6. Export to CSV for client presentations

### Data Center Site Selection
1. Evaluate power requirements
2. Calculate facility size and land needs
3. Assess water availability (Brazos River)
4. Verify Oncor territory and capacity
5. Compare multiple site options
6. Generate economic projections

### Property Research
1. Build database of analyzed properties
2. Track sites across Bosque County
3. Document infrastructure access
4. Calculate development potential
5. Export data for reports
6. Share findings with clients

---

## 🗺️ Bosque County Context

### Utility Territory
- **Provider:** Oncor Electric Delivery
- **Grid:** ERCOT (Texas grid)
- **Transmission:** 69kV, 138kV, 345kV lines available
- **Interconnection:** Contact Oncor for capacity and queue

### Water Resources
- **Brazos River:** Major water resource through county
- **Lake Whitney:** 23,560 acre reservoir
- **Groundwater:** Trinity and Edwards-Trinity aquifers
- **Uses:** Irrigation, cooling, recreation

### Development Factors
- **Land Availability:** Large parcels (40-640 acres typical)
- **Land Use:** Agricultural zoning (verify for commercial)
- **Workforce:** Limited locally, commute from Waco/Fort Worth
- **Incentives:** Property tax abatements, state programs
- **Fiber:** Limited in rural areas - VERIFY for data centers

---

## 🚀 Deployment Status

✅ **Web Version Live**: https://williambevans.github.io/fieldTool/

### Deploy Web Updates
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Live within 1-2 minutes

### Termux CLI Updates
- Pull latest from repository: `git pull`
- Re-run setup if needed: `bash setup-eagle.sh`

---

## 🔮 Future Enhancements

Planned features for future versions:

- [ ] NREL Solar API integration (live data)
- [ ] Oncor substation proximity API
- [ ] Texas CAD data integration
- [ ] PDF report generation
- [ ] Desktop sync application
- [ ] Satellite imagery overlay
- [ ] Transmission line proximity maps
- [ ] Water rights database integration
- [ ] Multi-site comparison tool
- [ ] Wind resource assessment
- [ ] Battery storage calculations
- [ ] Mobile app (native iOS/Android)

---

## 💬 Support

**Owner:** Biri Bevan - 14+ years Texas property research expertise
**Company:** HH Holdings / Bevans Real Estate
**Location:** Bosque County, Texas (Brazos River Region)

**GitHub:** https://github.com/williambevans/fieldTool
**Issues:** Report bugs and request features via GitHub Issues
**Documentation:** See `docs/USER_GUIDE.md` for Termux CLI details

---

## 🤝 Contributing

Issues and PRs welcome. This is a rapidly evolving project with both web and CLI implementations.

---

## 📄 License

MIT License - See LICENSE file for details

Copyright (c) 2026 HH Holdings / Bevans Real Estate

---

## 🙏 Acknowledgments

- **NREL (National Renewable Energy Laboratory)** - Solar methodology
- **Termux Project** - Android Linux environment
- **F-Droid** - Open source app distribution
- **Oncor Electric Delivery** - Texas utility infrastructure
- **Bosque County, Texas** - Local market expertise

---

**🦅 EAGLE - Soaring Above the Energy Frontier 🦅**

*Built with Texas property expertise | Designed for field professionals | Powered by open source*

**HH Holdings / Bevans Real Estate | Bosque County, Texas**
