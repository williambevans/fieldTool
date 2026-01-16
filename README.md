# fieldTool - HH Holdings Intelligence & Analysis Suite

**Owner:** William H. Bevans Jr. | **Company:** HH Holdings / Bevans Real Estate | **Location:** Bosque County, Texas

A comprehensive suite of intelligence analysis tools for property research, energy infrastructure, and public data transparency.

---

## 🌐 Live Pages

### 🏠 Main Landing Page
**URL:** https://williambevans.github.io/fieldTool/

Vintage typewriter-styled landing page featuring the main entry point to all tools and resources.

---

### 🕵️ C.A.I. Declassified Memo (Interactive)
**URL:** https://williambevans.github.io/fieldTool/cia-memo.html

**Citizens Artificial Intelligence (C.A.I.) - Intelligence Analysis**

Interactive declassified intelligence memo analyzing the CyrusOne Bosque County data center project based on TCEQ permit documents. Features:
- Authentic declassified document styling with redaction bars
- Click-to-reveal IP surveillance tracking
- Visitor metadata capture (IP address, timestamp, user agent, timezone)
- Interactive surveillance alert modal
- C.A.I. (Citizens Artificial Intelligence) branding
- Corporate structure analysis
- Environmental permits & discharge data
- Strategic infrastructure assessment

**Technical Features:**
- Real-time IP detection using multiple API services
- Browser fingerprinting (screen resolution, timezone, user agent)
- Console logging of access attempts
- Responsive design for mobile devices
- "DECLASSIFIED" watermark overlay
- Courier New typewriter font for authenticity

---

### 🌾 Agriculture Freedom Zones (AFZ) Viewer
**URL:** https://williambevans.github.io/fieldTool/afz-viewer.html

Interactive database viewer for Agriculture Freedom Zones parcel analysis. Features:
- Searchable parcel database
- Property classifications and metadata
- Data visualization interface
- Export capabilities

---

### ☀️ Texas Solar Partnership Landing
**URL:** https://williambevans.github.io/fieldTool/texas-solar-landing.html

Bevans Real Estate solar energy partnership landing page. Features:
- Contact form for solar project inquiries
- FormSubmit.co integration (sends to perryhamilton@protonmail.com)
- Partnership information
- Professional landing page design

---

### 🦅 Energy Intel EAGLE Tool
**URL:** https://williambevans.github.io/fieldTool/ (Main app interface)

Professional mobile field analysis tool for Texas energy infrastructure development. Built by Bevans Real Estate with 14+ years of Texas property research expertise.

#### ✨ Core Capabilities
- 📍 **Real-time GPS** - HTML5 Geolocation for precise site capture
- ☀️ **Solar Farm Analysis** - NREL-based capacity and generation calculations
- 🖥️ **Data Center Modeling** - Power requirements, PUE, and facility sizing
- 💾 **Site Database** - localStorage with CSV export
- 🗺️ **Bosque County Context** - Local infrastructure and utility data integration
- ⚡ **Oncor Territory** - Electric utility mapping and interconnection info
- 🌊 **Brazos River Analysis** - Water proximity for cooling requirements
- 📊 **Economic Estimates** - CAPEX, O&M, and revenue projections

#### 🎯 Perfect For
- Land brokers and real estate professionals
- Energy developers and consultants
- Solar farm site scouts
- Data center location analysts
- Agricultural land conversion analysis
- Property research and due diligence

---

## 📁 Project Structure

```
fieldTool/
├── index.html                      # Main landing page (vintage typewriter)
├── cia-memo.html                   # C.A.I. declassified memo (interactive)
├── afz-viewer.html                 # Agriculture Freedom Zones viewer
├── texas-solar-landing.html        # Solar partnership landing page
├── app.js                          # Energy Intel EAGLE application logic
├── setup-eagle.sh                  # Termux installation script
├── .github/
│   └── workflows/
│       └── pages.yml               # GitHub Pages deployment workflow
├── src/
│   ├── energy-intel-eagle.py      # Main Termux CLI application
│   ├── gps_utils.py                # GPS functions (termux-location)
│   ├── solar_calc.py               # Solar farm calculations
│   ├── datacenter_calc.py          # Data center power modeling
│   ├── site_manager.py             # JSON database management
│   └── afz_classifier.py           # AFZ data classification
├── config/
│   └── bosque_county.json          # Local infrastructure data
├── data/
│   ├── afz_parcels.json            # AFZ parcel data
│   └── afz_parcels.geojson         # AFZ geographic data
├── backend/
│   ├── api.py                      # Flask backend services
│   ├── clerk_scraper.py            # Web scraping utilities
│   ├── requirements.txt            # Python dependencies
│   └── Procfile                    # Heroku deployment config
├── docs/
│   ├── USER_GUIDE.md               # Comprehensive user documentation
│   ├── AFZ_README.md               # Agriculture Freedom Zones documentation
│   ├── CLERK_RECORDS_SETUP.md      # Clerk records scraper setup
│   ├── CYRUSONE_INTEL_README.md    # CyrusOne analysis documentation
│   └── DEPLOYMENT_SUMMARY.md       # Deployment instructions
└── tests/
    └── test_calculations.py        # Unit tests for validation
```

---

## 🚀 Quick Start

### Web Browser (Instant Access)

All pages are live and accessible via browser:

1. **Main Landing:** https://williambevans.github.io/fieldTool/
2. **C.A.I. Memo:** https://williambevans.github.io/fieldTool/cia-memo.html
3. **AFZ Viewer:** https://williambevans.github.io/fieldTool/afz-viewer.html
4. **Solar Landing:** https://williambevans.github.io/fieldTool/texas-solar-landing.html

No installation required - works on any device with a modern browser.

### Local Development

```bash
git clone https://github.com/williambevans/fieldTool.git
cd fieldTool
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Termux CLI (Advanced)

For field work with high-precision GPS:

```bash
# Install Termux and Termux:API from F-Droid
cd ~
git clone https://github.com/williambevans/fieldTool.git
cd fieldTool
bash setup-eagle.sh
energy-intel
```

---

## 🔧 Technical Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling, responsive design
- **Vanilla JavaScript** - No frameworks, pure JS
- **HTML5 Geolocation API** - GPS positioning
- **LocalStorage API** - Client-side data persistence

### Backend & APIs
- **Python 3** - CLI tools and utilities
- **Flask** - Backend API services
- **FormSubmit.co** - Form submission handling
- **IP Detection APIs:**
  - api.ipify.org
  - api.my-ip.io
  - ipapi.co

### Deployment
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - Automated deployment
- **Heroku** - Backend API hosting (optional)

---

## 📊 C.A.I. Memo Technical Details

The interactive C.A.I. declassified memo includes sophisticated surveillance tracking:

### IP Detection
- Multiple fallback API services for reliability
- Real-time IP address capture
- Geolocation data (when available)

### Visitor Metadata
- **Timestamp:** UTC timestamp of access
- **User Agent:** Browser and OS identification
- **Screen Resolution:** Display dimensions
- **Timezone:** Client timezone detection

### Visual Design
- Authentic CIA/declassified document styling
- Courier New typewriter font
- Black redaction bars (███████)
- "DECLASSIFIED" watermark overlay
- Document control stamps
- Classification markings

### Interactive Features
- Click-anywhere to trigger surveillance alert
- Modal popup with visitor data
- Console logging of access attempts
- ESC key and outside-click to close
- Responsive mobile design

---

## 🛠️ Solar & Data Center Calculations

### Solar Farm Analysis (NREL-based)
- **Capacity:** 0.5 MW per acre (ground-mount)
- **Capacity Factor:** 20% (conservative for Central Texas)
- **System Losses:** 14% (inverter, wiring, soiling)
- **Annual Generation:** Based on Texas insolation data
- **Home Consumption:** 11 MWh/year (Texas average)

### Data Center Modeling
- **Server Power:** 500W typical, 1000W high-performance
- **PUE Options:** 1.2 (excellent) to 2.0+ (legacy)
- **Cooling Load:** 40% of IT load (Texas climate)
- **Land Requirements:** ~250 sq ft per kW
- **Water Cooling:** 0.5 GPM per 100kW IT load

---

## 🌍 Use Cases

### Intelligence Analysis
- Public data transparency initiatives
- Corporate structure investigation
- Environmental permit analysis
- Foreign investment tracking
- Infrastructure development monitoring

### Real Estate Development
- Land broker site analysis
- Solar farm site scouting
- Data center location assessment
- Agricultural land conversion
- Property research and due diligence

### Energy Infrastructure
- Solar capacity calculations
- Data center power requirements
- Water resource assessment
- Grid interconnection analysis
- Economic feasibility studies

---

## 🔮 Future Enhancements

Planned features:
- [ ] NREL Solar API integration (live data)
- [ ] Oncor substation proximity API
- [ ] Texas CAD data integration
- [ ] PDF report generation
- [ ] Satellite imagery overlay
- [ ] Transmission line proximity maps
- [ ] Water rights database integration
- [ ] Multi-site comparison tool
- [ ] Enhanced visitor analytics dashboard
- [ ] Additional IP geolocation features

---

## 📖 Documentation

- **USER_GUIDE.md** - Comprehensive Termux CLI user manual
- **AFZ_README.md** - Agriculture Freedom Zones documentation
- **CYRUSONE_INTEL_README.md** - CyrusOne analysis documentation
- **CLERK_RECORDS_SETUP.md** - Web scraper setup guide
- **DEPLOYMENT_SUMMARY.md** - Deployment instructions

---

## 🚀 Deployment

### Automatic Deployment (GitHub Pages)
1. Push to `main` branch
2. GitHub Actions automatically builds and deploys
3. Live within 1-2 minutes

### Manual Deployment
```bash
# Ensure you're on the correct branch
git checkout main

# Add and commit changes
git add .
git commit -m "Update content"

# Push to GitHub
git push origin main
```

Changes will be live at: https://williambevans.github.io/fieldTool/

---

## 💬 Support

**Owner:** Biri Bevan - 14+ years Texas property research expertise
**Company:** HH Holdings / Bevans Real Estate
**Location:** Bosque County, Texas (Brazos River Region)

**GitHub:** https://github.com/williambevans/fieldTool
**Issues:** Report bugs and request features via GitHub Issues

---

## 🤝 Contributing

Issues and PRs welcome. This is a rapidly evolving project with multiple interactive components.

---

## 📄 License

MIT License - See LICENSE file for details

Copyright (c) 2026 HH Holdings / Bevans Real Estate

---

## 🙏 Acknowledgments

- **NREL** (National Renewable Energy Laboratory) - Solar methodology
- **Termux Project** - Android Linux environment
- **F-Droid** - Open source app distribution
- **Oncor Electric Delivery** - Texas utility infrastructure
- **IP Detection Services** - ipify.org, my-ip.io, ipapi.co
- **Bosque County, Texas** - Local market expertise

---

## 📞 Contact

For inquiries about solar partnerships, property research, or intelligence analysis services:

**Email:** perryhamilton@protonmail.com
**Form:** https://williambevans.github.io/fieldTool/texas-solar-landing.html

---

**🦅 HH Holdings Intelligence & Analysis Suite 🦅**

*Built with Texas property expertise | Designed for transparency | Powered by open source*

**HH Holdings / Bevans Real Estate | Bosque County, Texas**
