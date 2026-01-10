# EAGLE User Guide
## HH Holdings Energy Infrastructure Intelligence

**Version:** 1.0
**Platform:** Termux (Android)
**Owner:** Biri Bevan
**Company:** HH Holdings / Bevans Real Estate
**Location:** Bosque County, Texas

---

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Features](#features)
5. [GPS Location Capture](#gps-location-capture)
6. [Solar Farm Analysis](#solar-farm-analysis)
7. [Data Center Analysis](#data-center-analysis)
8. [Site Database Management](#site-database-management)
9. [Data Storage](#data-storage)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Technical Details](#technical-details)

---

## Introduction

EAGLE (Energy Asset Gateway & Location Explorer) is a professional mobile field analysis tool designed for energy infrastructure development in Texas. Built with 14+ years of Texas property research expertise, EAGLE helps you analyze sites for:

- Solar farm development
- Data center facilities
- Energy infrastructure projects

### Key Capabilities

- **Real-time GPS** - Capture precise site coordinates
- **Solar Calculations** - NREL-based capacity and generation estimates
- **Data Center Modeling** - Power requirements and facility sizing
- **Site Database** - JSON storage with export capabilities
- **Bosque County Context** - Local infrastructure data integration

---

## Installation

### Prerequisites

1. **Android Device** with Termux
2. **Termux** app from F-Droid (NOT Google Play)
   - Download: https://f-droid.org/packages/com.termux/
3. **Termux:API** app from F-Droid (for GPS)
   - Download: https://f-droid.org/packages/com.termux.api/

### Installation Steps

1. **Install Termux and Termux:API** from F-Droid

2. **Clone or download** the EAGLE repository:
   ```bash
   cd ~
   git clone https://github.com/bevans-real-estate/energy-intel-mobile.git
   cd energy-intel-mobile
   ```

3. **Run the setup script**:
   ```bash
   bash setup-eagle.sh
   ```

4. **Grant permissions** when prompted:
   - Storage access (required)
   - Location access (required for GPS)

5. **Launch EAGLE**:
   ```bash
   energy-intel
   ```
   Or use the alias:
   ```bash
   eagle
   ```

---

## Getting Started

### First Launch

When you first launch EAGLE, you'll see the main menu:

```
🦅 EAGLE - Energy Asset Gateway & Location Explorer 🦅

HH Holdings Energy Infrastructure Intelligence
Soaring Above the Energy Frontier

🎯 MAIN MENU
──────────────────────────────────────────────────────────────────
  1. 📍 Capture GPS Location
  2. ☀️  Analyze Solar Farm Site
  3. 🖥️  Analyze Data Center Site
  4. 💾 View Saved Sites
  5. 📊 Database Statistics
  6. 🔍 Search Sites
  7. 📤 Export Sites to CSV
  8. ℹ️  About EAGLE
  9. ❌ Exit
```

### Quick Start Workflow

1. **Capture GPS** (Option 1) - Get your current location
2. **Analyze Site** (Option 2 or 3) - Run calculations
3. **Save Site** - When prompted after analysis
4. **View Sites** (Option 4) - Review saved data

---

## Features

### 1. GPS Location Capture

Capture precise GPS coordinates for site documentation.

**How to use:**
1. Select option `1` from main menu
2. Wait 10-30 seconds for GPS fix
3. Review captured data:
   - Latitude/Longitude
   - Altitude
   - Accuracy
   - Bosque County status
   - Brazos River distance

**Best results:**
- Go outside
- Clear view of sky
- Wait for "GPS LOCK ACQUIRED"
- Accuracy under 20 meters is excellent

### 2. Solar Farm Analysis

Calculate solar farm capacity and generation potential.

**Inputs:**
- Site name
- Land area (acres)
- GPS location (optional)

**Outputs:**
- Installed capacity (MW)
- Annual generation (MWh/year)
- Homes powered
- Capital cost estimate
- Annual O&M costs
- Revenue potential

**Methodology:**
- 0.5 MW per acre (ground-mount)
- 20% capacity factor (Central Texas)
- NREL-based calculations
- 11 MWh/home/year consumption

### 3. Data Center Analysis

Model data center power requirements and facility specs.

**Analysis Methods:**
1. **By Server Count** - Specify number of servers
2. **By Target Capacity** - Specify MW capacity

**Inputs:**
- Site name
- Server count OR target MW
- PUE (Power Usage Effectiveness)
  - Excellent: 1.2 (hyperscale)
  - Good: 1.5 (modern, default)
  - Average: 1.8 (typical)
  - Custom: 1.0-3.0

**Outputs:**
- IT load (kW)
- Cooling load (kW)
- Total facility load (MW)
- Annual consumption (MWh)
- Annual electricity cost
- Building size (sq ft)
- Land requirements (acres)
- Water cooling needs

### 4. Site Database

All analyzed sites are stored in a JSON database.

**Location:**
```
~/storage/shared/EnergyIntel/hh_holdings_sites.json
```

**Features:**
- Auto-save analyzed sites
- View all saved sites
- Search by name/notes
- Export to CSV
- Statistics tracking

---

## GPS Location Capture

### Understanding GPS Output

```
✅ GPS LOCK ACQUIRED!
──────────────────────────────────────────────────────────────────
📍 Coordinates:     31.874900°N, -97.642800°W (±12.5m)
📏 Altitude:        245.3 meters
🎯 Accuracy:        ±12.5 meters
🗺️  Territory:       Bosque County (Oncor Territory)
🌊 Brazos River:    4.2 miles
💧 Water Access:    Excellent - Brazos River proximity
```

**Field Definitions:**
- **Coordinates** - Latitude/Longitude with accuracy
- **Altitude** - Height above sea level
- **Accuracy** - GPS precision (lower is better)
- **Territory** - Utility and county identification
- **Brazos River** - Distance to water resource
- **Water Access** - Assessment for cooling needs

### GPS Troubleshooting

**"GPS timeout" error:**
- Go outside
- Wait longer (up to 60 seconds)
- Enable high-accuracy mode on Android
- Check Termux:API app is installed

**Poor accuracy (>50m):**
- Move to open area
- Wait for satellite lock
- Avoid buildings/trees
- Try again in a few minutes

---

## Solar Farm Analysis

### Example Workflow

1. Select option `2` - Analyze Solar Farm Site
2. Enter site name: `Meridian Ranch Solar`
3. Enter acres: `150`
4. Capture GPS: `y`
5. Wait for GPS lock
6. Review analysis report
7. Save to database: `y`
8. Add notes: `Prime site, near transmission`

### Understanding Solar Output

```
☀️  SOLAR FARM ANALYSIS
──────────────────────────────────────────────────────────────────
📊 SITE SPECIFICATIONS
   Land Area:            150.0 acres

⚡ CAPACITY & GENERATION
   Installed Capacity:   75.00 MW
   Annual Generation:    131,400 MWh/year
   Capacity Factor:      20%

🏠 IMPACT
   Homes Powered:        11,945 Texas homes/year

💰 ECONOMIC ESTIMATES
   Est. CAPEX:          $75,000,000
   Annual O&M:          $1,500,000
```

### Revenue Calculation

Based on $0.03/kWh PPA (Power Purchase Agreement):
- Annual Revenue = MWh/year × 1000 × $0.03
- Example: 131,400 MWh × 1000 × $0.03 = $3,942,000/year

### Minimum Viable Size

For a 5 MW minimum viable project:
- Acres needed = 5 MW ÷ 0.5 MW/acre = 10 acres minimum

Most commercial projects: 5-50 MW (10-100 acres)

---

## Data Center Analysis

### Example Workflow (Server Count Method)

1. Select option `3` - Analyze Data Center Site
2. Enter site name: `Bosque Edge Data Center`
3. Choose method: `1` (by server count)
4. Choose PUE: `2` (Good - 1.5, default)
5. Enter servers: `1000`
6. Capture GPS: `y`
7. Review analysis
8. Save site: `y`

### Understanding Data Center Output

```
🖥️  FACILITY SPECIFICATIONS
   Server Count:         1,000 servers
   Server Power:         500W each
   Racks Required:       24 racks (42U)

⚡ POWER REQUIREMENTS
   IT Load:              500.0 kW
   Cooling Load:         200.0 kW
   Infrastructure:       50.0 kW
   ─────────────────────────────────────────────
   TOTAL FACILITY:       750.0 kW (0.75 MW)
   PUE:                  1.50

📊 ANNUAL CONSUMPTION
   Total Usage:          6,570 MWh/year
   Electricity Cost:     $525,600/year
   Rate:                 $0.080/kWh

🏗️  FACILITY FOOTPRINT
   Building Size:        187,500 sq ft
   Total Site:           12.9 acres
   Parking:              ~8 spaces
```

### PUE Selection Guide

**PUE (Power Usage Effectiveness)** = Total Facility Power ÷ IT Power

- **1.2 (Excellent)** - Hyperscale, cutting-edge design
  - Google, Facebook-class efficiency
  - Advanced cooling, optimized airflow

- **1.5 (Good)** - Modern, well-designed facility [DEFAULT]
  - Industry standard for new builds
  - Efficient cooling, hot/cold aisle

- **1.8 (Average)** - Typical existing facility
  - Standard commercial design
  - Room for improvement

- **2.0+ (Poor)** - Older facility
  - Legacy systems
  - Inefficient cooling

### Water Cooling Requirements

For water-cooled systems:
- ~0.5 GPM per 100kW IT load
- Example: 500kW IT = 2.5 GPM = 1.3M gallons/year
- Brazos River access is valuable

**Note:** Air-cooled systems use minimal water but have higher power consumption in Texas heat.

---

## Site Database Management

### Viewing Saved Sites

Select option `4` - View Saved Sites

All sites display in summary format:
```
┌─────────────────────────────────────────────────┐
│ 🦅 Meridian Ranch Solar
├─────────────────────────────────────────────────┤
│ ID:        HH-20260110-143022
│ Type:      SOLAR
│ Acres:     150
│ Location:  31.874900°N, -97.642800°W (±12.5m)
│ Created:   2026-01-10
│
│ ☀️  SOLAR ANALYSIS:
│    Capacity:    75.0 MW
│    Generation:  131,400 MWh/year
│    Homes:       11,945
│
│ 📝 Notes: Prime site near transmission
└─────────────────────────────────────────────────┘
```

### Database Statistics

Select option `5` - Database Statistics

Shows:
- Total sites analyzed
- Total acres analyzed
- Total solar capacity (MW)
- Breakdown by site type
- Database file location

### Searching Sites

Select option `6` - Search Sites

Search across:
- Site names
- Notes
- Location context
- Territory information

### Exporting to CSV

Select option `7` - Export Sites to CSV

Creates CSV file:
```
~/storage/shared/EnergyIntel/sites_export_YYYYMMDD_HHMMSS.csv
```

Open with:
- Excel on desktop
- Google Sheets
- Any spreadsheet software

---

## Data Storage

### Database Location

```
~/storage/shared/EnergyIntel/hh_holdings_sites.json
```

This path is accessible from:
- Termux
- Android file manager
- Desktop (via USB/cloud sync)

### Accessing Files

**From Android:**
1. Open file manager
2. Navigate to: Internal Storage → EnergyIntel
3. Files: `hh_holdings_sites.json`, CSV exports

**From Desktop:**
1. Connect phone via USB
2. Navigate to: Phone → Internal Storage → EnergyIntel
3. Copy files to computer

**Cloud Sync:**
- Use Syncthing, Dropbox, Google Drive, etc.
- Sync ~/storage/shared/EnergyIntel folder
- Automatic backup and desktop access

### Database Format

JSON structure:
```json
{
  "metadata": {
    "created": "2026-01-10T14:30:22",
    "version": "1.0",
    "owner": "HH Holdings / Bevans Real Estate"
  },
  "sites": [
    {
      "site_id": "HH-20260110-143022",
      "name": "Meridian Ranch Solar",
      "site_type": "solar",
      "acres": 150,
      "solar_analysis": {...},
      "location_context": {...}
    }
  ]
}
```

---

## Troubleshooting

### GPS Issues

**Problem:** "termux-location not found"
- **Solution:** Install Termux:API app from F-Droid
- Link: https://f-droid.org/packages/com.termux.api/

**Problem:** GPS timeout
- **Solution:** Go outside, wait longer, enable high-accuracy GPS

**Problem:** Poor accuracy (>50m)
- **Solution:** Move to open area, wait for more satellites

### Installation Issues

**Problem:** "Permission denied" when running setup
- **Solution:** `chmod +x setup-eagle.sh`

**Problem:** "command not found: energy-intel"
- **Solution:** Restart Termux or run: `source ~/.bashrc`

**Problem:** Storage access denied
- **Solution:** Run `termux-setup-storage` and grant permissions

### Application Issues

**Problem:** Python import errors
- **Solution:** Ensure you're in correct directory: `cd ~/energy-intel-mobile/src`

**Problem:** Database save failed
- **Solution:** Check storage permissions, ensure directory exists

---

## Best Practices

### Field Use

1. **GPS Accuracy**
   - Always capture GPS outdoors
   - Wait for accuracy <20m
   - Record multiple readings if critical

2. **Site Documentation**
   - Use descriptive site names
   - Add detailed notes
   - Include reference to landmarks

3. **Data Management**
   - Save sites immediately after analysis
   - Export to CSV regularly
   - Backup JSON database

### Site Analysis

1. **Solar Farms**
   - Verify transmission line proximity
   - Note terrain and slope
   - Document access roads
   - Check for shading (trees, structures)

2. **Data Centers**
   - CRITICAL: Verify fiber availability first
   - Check power capacity at nearest substation
   - Assess water access for cooling
   - Document distance to workforce

3. **Both Types**
   - Record Oncor territory confirmation
   - Note Brazos River distance
   - Document county and parcel info
   - Take photos (reference in notes)

### Data Backup

1. **Regular Exports**
   - Export to CSV weekly
   - Copy JSON database to cloud
   - Keep multiple backups

2. **Cloud Sync Options**
   - Syncthing (recommended)
   - Google Drive
   - Dropbox
   - Any sync service

3. **Version Control**
   - Keep dated backups
   - Note major database changes

---

## Technical Details

### Calculation Methodology

#### Solar Farm

**Capacity:**
- MW = Acres × 0.5 MW/acre

**Annual Generation:**
- MWh/year = MW × 8760 hours × 0.20 capacity factor × 0.86 (system losses)

**Homes Powered:**
- Homes = MWh/year ÷ 11 MWh/home/year

**Sources:**
- NREL Solar Resource Data
- Central Texas capacity factors
- Oncor territory specifications

#### Data Center

**IT Load:**
- kW = (Servers × Watts/server) ÷ 1000

**Total Load:**
- Total kW = IT kW × PUE

**Cooling Load:**
- Cooling kW = IT kW × 0.4 (Texas climate)

**Annual Cost:**
- Cost/year = Total kW × 8760 hours × $0.08/kWh

### System Requirements

**Termux:**
- Android 7.0 or higher
- 100 MB free space
- Internet (for installation)

**Termux:API:**
- Required for GPS
- Separate app from F-Droid

**Python:**
- Version 3.x
- Installed automatically

### File Structure

```
energy-intel-mobile/
├── README.md
├── setup-eagle.sh
├── src/
│   ├── energy-intel-eagle.py    # Main application
│   ├── gps_utils.py              # GPS functions
│   ├── solar_calc.py             # Solar calculations
│   ├── datacenter_calc.py        # Data center calculations
│   └── site_manager.py           # Database management
├── config/
│   └── bosque_county.json        # Local infrastructure data
├── docs/
│   └── USER_GUIDE.md             # This file
└── tests/
    └── test_calculations.py      # Unit tests
```

### Data Directory

```
~/storage/shared/EnergyIntel/
├── hh_holdings_sites.json        # Main database
└── sites_export_*.csv            # CSV exports
```

---

## Support and Contact

**Owner:** Biri Bevan
**Company:** HH Holdings / Bevans Real Estate
**Expertise:** 14+ years Texas property research
**Territory:** Bosque County, Texas (Brazos River Region)

**GitHub:** https://github.com/bevans-real-estate/energy-intel-mobile
**Issues:** Report bugs and request features via GitHub Issues

---

## Version History

**Version 1.0** - January 2026
- Initial release
- GPS location capture
- Solar farm analysis
- Data center analysis
- Site database with JSON storage
- CSV export functionality
- Bosque County infrastructure context

---

## License

MIT License - See repository for full license text

---

**🦅 EAGLE - Soaring Above the Energy Frontier 🦅**

*HH Holdings / Bevans Real Estate - Bosque County, Texas*
