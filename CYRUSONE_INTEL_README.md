# CyrusOne Texas Data Center Intelligence & Mapping System

## 🎯 Overview

The CyrusOne Intelligence System is a comprehensive data intelligence platform built to map, track, and analyze all CyrusOne data center facilities across Texas. This system supports investigation into tax abatement compliance, transparency, and economic impact analysis.

**Location**: Tab 4 in the HH Holdings Energy Infrastructure Intelligence (EAGLE) web application

**Access**: Password-protected (Password: `cia`)

---

## 🔐 Security

### Password Protection
- **Password**: `cia`
- **Authentication**: Session-based (sessionStorage)
- **Session Persistence**: Stays logged in during browser session
- **Logout**: Manual logout button in top-right corner

### Access Flow
1. Click "🏢 CyrusOne Intel" tab
2. Enter password: `cia`
3. Click "🔓 Access Intelligence System"
4. Session persists until logout or browser close

---

## 📋 Core Features

### 1. Dashboard 📊
**Location**: Default landing page after login

**Features**:
- **System Overview Stats**:
  - Total facilities tracked
  - Total power capacity (MW)
  - Total tax abatements ($)
  - Counties covered

- **Quick Actions**:
  - 🔍 Search TCEQ Permits
  - 🏛️ Search County Records
  - ➕ Add Facility
  - 📄 Generate Report

- **Facility List**:
  - All tracked facilities with status indicators
  - Color-coded by phase (filing/construction/operational)
  - Quick view details button

### 2. TCEQ Permit Discovery 🏗️
**Purpose**: Search Texas Commission on Environmental Quality construction permits

**Features**:
- Entity name search (CyrusOne, Cyrus One, Bosque Parcel, Calpine Real Estate)
- Permit type filtering:
  - All Permits
  - TXR150000 (Stormwater Construction)
  - Air Quality
  - Water Discharge
- Direct link to TCEQ Public Records Portal
- Search instructions and guidance

**Target Data**:
- Facility location (lat/long)
- Acreage disturbed
- Construction timeline
- Property descriptions
- Contractor information

### 3. County Appraisal District (CAD) Search 🏛️
**Purpose**: Search property records across Texas counties

**Supported Counties**:
- Bosque County
- Hill County
- McLennan County (Waco)
- Hays County (Kyle/San Marcos)
- Williamson County (Round Rock)
- Collin County
- Denton County
- Tarrant County

**Features**:
- Owner name search
- Direct links to county CAD websites
- Search instructions for:
  - Account numbers
  - Legal descriptions
  - Appraised values
  - Taxable values
  - Tax abatements
  - Historical data (5+ years)
  - School district boundaries

### 4. Financial Analytics & Tax Abatements 💰
**Purpose**: Analyze property values, tax abatements, and economic impact

**Aggregate Financial Data**:
- Total property value (all facilities)
- Total taxable value (with abatements)
- Annual tax savings
- 10-year projected savings

**Calculations**:
- Tax abatement formula: `(Appraised Value - Taxable Value) × Tax Rate`
- Annual savings per facility
- Cumulative impact across all facilities
- School district impact (M&O vs I&S)

### 5. Interactive Map View 🗺️
**Purpose**: Visualize all CyrusOne facilities across Texas

**Map Features**:
- Leaflet.js-powered interactive map
- Centered on Texas (statewide view)
- Facility markers with popups

**Status Indicators**:
- 🔵 **Blue**: Filing/Planning Stage
- 🟡 **Yellow**: Under Construction
- 🟢 **Green**: Operational
- 🔴 **Red Border**: Has Tax Abatement

**Marker Data**:
- Facility name
- County location
- Status
- Acreage
- Power capacity (MW)
- Tax abatement amount (if applicable)

### 6. Bosque County Investigation 📍
**Purpose**: Detailed investigation for January 12, 2026 Commissioners Court presentation

**Target Facility**:
- **Name**: CyrusOne Bosque County Data Center
- **Location**: NEC of FM 56 and CR 3610A, Whitney, TX
- **Size**: 74 acres
- **Construction**: October 2024 - October 2027
- **Entities**: Bosque Parcel 2 LLC, CyrusOne Inc., Calpine Real Estate

**Search Tools**:
- Property Records (Bosque CAD)
- Commissioners Court Minutes
- Clifton ISD Board Minutes
- Tax Abatement Agreements

**Key Investigation Questions**:
1. What is the facility's current appraised value?
2. What tax abatement percentage was granted?
3. What is the annual tax savings to CyrusOne?
4. What is the annual tax revenue loss to county/school?
5. What is the 10-year projected impact?
6. Are all required documents publicly posted?

---

## 💾 Data Management

### Facility Data Model
Each facility tracks:

```javascript
{
  id: "CYRUS-1234567890",           // Unique identifier
  name: "CyrusOne Bosque DC",       // Facility name
  county: "Bosque",                  // County name
  status: "construction",            // filing | construction | operational

  // Property Data
  acres: 74,                         // Total acreage
  powerMW: 100,                      // Power capacity in megawatts
  latitude: 31.8749,                 // GPS latitude
  longitude: -97.6428,               // GPS longitude

  // Timeline
  constructionStart: "2024-10",      // Construction start date
  constructionEnd: "2027-10",        // Construction end date

  // Financial Data
  appraisedValue: 150000000,         // Full appraised value
  taxableValue: 15000000,            // Taxable value (with abatement)
  taxAbatement: 2500000,             // Annual tax savings
  abatementPercent: 90,              // Abatement percentage

  // Metadata
  notes: "Additional information",
  addedAt: "2026-01-13T19:24:00Z"   // Timestamp added to system
}
```

### Storage
- **Type**: Browser localStorage
- **Key**: `cyrusone-facilities`
- **Format**: JSON array
- **Persistence**: Permanent (until cleared)

### Functions
- `getCyrusOneFacilities()` - Retrieve all facilities
- `saveCyrusOneFacility(facility)` - Add new facility
- `loadCyrusOneFacilities()` - Load and display facilities
- `displayCyrusOneFacilities()` - Render facility list
- `updateCyrusOneStats()` - Update dashboard statistics

---

## 📤 Export & Reporting

### CSV Export
**Function**: `generateReport()`

**Output Format**:
```csv
Facility Name,County,Status,Acres,Power (MW),Appraised Value,Taxable Value,Tax Abatement,Abatement %,Construction Start,Construction End,Notes
```

**Features**:
- Exports all tracked facilities
- Includes all financial data
- Timestamped filename
- Compatible with Excel, Google Sheets

**Usage**:
1. Click "Generate Report" button
2. CSV file downloads automatically
3. Filename: `cyrusone_intelligence_report_[timestamp].csv`

---

## 🛠️ Technical Implementation

### Files Modified
- `index.html` - Added CyrusOne tab UI and password protection modal
- `app.js` - Added all CyrusOne JavaScript functions

### Dependencies
- **Leaflet.js**: Interactive mapping (already included in EAGLE)
- **localStorage**: Client-side data persistence
- **sessionStorage**: Authentication state management

### CSS Classes
- `.login-overlay` - Password protection modal
- `.login-box` - Login form container
- `.login-error` - Error message styling
- `.cyrus-section` - Section containers with fade-in animation

### Key Functions
```javascript
// Authentication
handleCyrusOneLogin(event)      // Process login form
checkCyrusOneAuth()             // Verify authentication status
logoutCyrusOne()                // Clear session and logout

// Data Management
getCyrusOneFacilities()         // Retrieve facilities from storage
saveCyrusOneFacility(facility)  // Save new facility
loadCyrusOneFacilities()        // Load facilities into memory
displayCyrusOneFacilities()     // Render facility list
updateCyrusOneStats()           // Update dashboard statistics

// UI Navigation
showCyrusSection(section)       // Switch between sections
initializeCyrusOneSystem()      // Initialize on login

// Search & Discovery
searchTCEQPermits()             // TCEQ permit search
searchCAD()                     // County CAD search
searchBosqueRecords()           // Bosque-specific search

// Mapping
initializeCyrusOneMap()         // Initialize Leaflet map

// Facility Management
addNewFacility()                // Manual facility entry
viewFacilityDetails(id)         // View facility details
generateReport()                // Export CSV report
```

---

## 🚀 Usage Guide

### Adding a New Facility

**Method 1: Manual Entry**
1. Click "➕ Add Facility" button
2. Enter facility details:
   - Facility name
   - County
   - Acreage
   - Power capacity (MW)
3. Facility added with "filing" status
4. Edit details later as more data is discovered

**Method 2: After Search**
1. Search TCEQ or CAD records
2. Find facility information
3. Use "Add Facility" to enter discovered data
4. Include all available financial and property data

### Tracking Construction Progress
1. View facility from Dashboard
2. Update status as construction progresses:
   - `filing` → `construction` → `operational`
3. Add construction timeline dates
4. Track permit approvals and milestones

### Analyzing Tax Abatements
1. Navigate to "💰 Financials" section
2. View aggregate financial data
3. Review individual facility abatements
4. Calculate annual and 10-year impacts
5. Export financial report for presentations

### Preparing for Commissioners Court
1. Navigate to "📍 Bosque Investigation" section
2. Review key investigation questions
3. Search property records
4. Search Commissioners Court minutes
5. Search school board minutes
6. Gather all tax abatement agreements
7. Compile findings for presentation

---

## 📊 Use Cases

### 1. Real Estate Due Diligence
- Track property values across multiple counties
- Identify patterns in tax abatement agreements
- Analyze construction timelines and costs
- Map competitive facility locations

### 2. Government Accountability Research
- Verify public disclosure of tax agreements
- Calculate total economic impact
- Compare abatement generosity across districts
- Track compliance with agreement terms

### 3. Investigative Journalism
- Discover undisclosed facilities
- Analyze corporate structure (LLCs, subsidiaries)
- Track entity relationships
- Identify contractor patterns

### 4. Investment Analysis
- Map CyrusOne expansion strategy
- Track construction pipeline
- Analyze power infrastructure needs
- Project future facility locations

### 5. Tax Policy Analysis
- Calculate foregone tax revenue
- Compare school district impacts
- Analyze long-term fiscal sustainability
- Evaluate Chapter 312/313/403 agreements

---

## 🔍 Data Sources

### Public Records
- **TCEQ**: https://www15.tceq.texas.gov/crpub/
- **Texas SOS**: https://mycpa.cpa.state.tx.us/coa/
- **TexasFile**: https://www.texasfile.com/
- **County CADs**: Various (links provided in tool)

### Entity Information
- **Parent Company**: CyrusOne Inc.
- **Subsidiaries**: Bosque Parcel 2 LLC, Calpine Real Estate Data Center Holdings
- **Ownership**: KKR (post-acquisition)
- **Registered Agents**: Corporation Service Company (common)

### Known Facility Patterns
- **Naming**: "[County] Parcel [N]", "CyrusOne [Location]"
- **Contractors**: F.A. Peinado, Clune Construction (repeat contractors)
- **Permit Types**: TXR150000 (stormwater), air quality, water discharge

---

## 🎓 Training Resources

### For New Users
1. Start with "Dashboard" to understand overview
2. Practice "Add Facility" with test data
3. Explore TCEQ search interface
4. Try CAD search in Bosque County
5. View Map to visualize facilities
6. Generate test report to understand export

### For Investigators
1. Begin with "Bosque Investigation" section
2. Review key investigation questions
3. Search each data source systematically
4. Document findings in facility notes
5. Track compliance requirements
6. Prepare financial summary for presentation

### For Analysts
1. Focus on "Financials" section
2. Input complete financial data for each facility
3. Use aggregate calculations
4. Export CSV for Excel analysis
5. Create charts and visualizations
6. Compare across counties and districts

---

## 🔧 Maintenance & Updates

### Adding New Counties
1. Edit `app.js` - `searchCAD()` function
2. Add county name to `cadUrls` object
3. Include county CAD website URL
4. Update dropdown in HTML if desired

### Updating Financial Calculations
1. Edit `app.js` - `updateCyrusOneStats()` function
2. Modify aggregate calculations
3. Update display formatters
4. Test with sample data

### Extending Data Model
1. Update facility object structure
2. Modify save/load functions
3. Update display templates
4. Regenerate export CSV headers

---

## 🐛 Troubleshooting

### Password Not Working
- Verify password is exactly: `cia` (lowercase, no spaces)
- Clear browser cache
- Check browser console for JavaScript errors

### Facilities Not Saving
- Check browser localStorage is enabled
- Verify localStorage has available space
- Check browser console for errors
- Try clearing old data: localStorage.clear()

### Map Not Loading
- Ensure internet connection (Leaflet requires tiles)
- Check browser console for errors
- Verify Leaflet.js is loaded
- Try refreshing the page

### Export Not Downloading
- Check browser pop-up blocker
- Verify browser allows downloads
- Try different browser
- Check browser console for errors

---

## 📝 Development Notes

### Future Enhancements
- [ ] Automated TCEQ scraping (server-side)
- [ ] Real-time CAD data integration
- [ ] Historical value tracking charts
- [ ] Compliance checklist automation
- [ ] Document repository with PDF storage
- [ ] Entity relationship visualization
- [ ] Timeline Gantt chart view
- [ ] Email notifications for new filings
- [ ] Multi-user collaboration features
- [ ] API integration with Texas Comptroller

### Known Limitations
- Manual data entry required (CORS prevents direct scraping)
- No server-side database (localStorage only)
- No automated data updates
- Limited to client-side processing
- No document attachment storage

---

## 📞 Support

For questions or issues with the CyrusOne Intelligence System:

**Developer**: HH Holdings / Bevans Real Estate
**Location**: Bosque County, Texas
**System**: EAGLE - Energy Infrastructure Intelligence
**Version**: 1.0.0
**Release Date**: January 13, 2026

---

## 📄 License & Disclaimer

This system is for authorized research, due diligence, and accountability purposes. All data should be verified with official government sources before use in legal or regulatory proceedings.

**Data Sources**: All searches direct users to official public record portals. No data is scraped or stored from government websites without proper authorization.

**Accuracy**: Property values, tax abatements, and facility details should be independently verified with county appraisal districts, school districts, and commissioners courts.

---

## 🎉 Quick Start Checklist

- [ ] Open website and navigate to "🏢 CyrusOne Intel" tab
- [ ] Enter password: `cia`
- [ ] Add first test facility using "Add Facility" button
- [ ] View facility in Dashboard
- [ ] Try TCEQ search for "CyrusOne"
- [ ] Try CAD search in Bosque County
- [ ] View facilities on Map
- [ ] Explore Bosque Investigation section
- [ ] Generate and download test CSV report
- [ ] Review Financial Analytics

**System is ready for production use!** 🚀
