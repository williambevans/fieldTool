# Agriculture Freedom Zones (AFZ) Database

## Overview

The **Agriculture Freedom Zones (AFZ) Database** is a comprehensive, Python-based system deployed via GitHub Pages that displays lands meeting AFZ eligibility criteria across Texas. The system identifies and catalogs properties that qualify for AFZ designation based on established federal criteria.

## AFZ Framework

Under the AFZ framework, states nominate eligible areas for review by the U.S. Department of Agriculture, Department of the Interior, and Department of Energy, with final designation certified by the U.S. Treasury.

### Qualification Criteria

Designated AFZ zones must meet one or more of the following criteria:

1. **Marginal Land**
   - Poor soil quality, rocky terrain, or steep slopes
   - Limited agricultural productivity
   - Land unsuitable for traditional farming/ranching

2. **Brownfield Sites**
   - Remediated former industrial properties
   - Environmental cleanup completed
   - Ready for redevelopment

3. **Arid Regions**
   - Areas receiving less than 20 inches of rainfall annually
   - Limited water resources
   - Desert or semi-arid climate zones

4. **Grid Access**
   - Sites within 5 miles of electrical substations
   - Proximity to transmission lines
   - Existing energy infrastructure

## System Architecture

### Technology Stack

- **Backend (Data Processing):** Python 3
- **Frontend (Web Display):** HTML5, CSS3, Vanilla JavaScript
- **Mapping:** Leaflet.js with OpenStreetMap
- **Data Format:** JSON and GeoJSON
- **Deployment:** GitHub Pages (static hosting)

### Components

```
fieldTool/
├── src/
│   ├── afz_classifier.py        # Core AFZ classification engine
│   └── generate_afz_data.py     # Database generator script
│
├── data/
│   ├── afz_parcels.json         # Full AFZ database
│   └── afz_parcels.geojson      # Geographic data for mapping
│
├── afz-viewer.html              # Interactive web viewer
├── index.html                   # Main application (with AFZ link)
└── AFZ_README.md               # This documentation
```

## Features

### 1. Interactive Map Viewer
- **Visual Display:** All AFZ-eligible parcels displayed on interactive map
- **Color-Coded Markers:**
  - Green (80-100): Excellent AFZ candidates
  - Orange (50-79): Good AFZ candidates
  - Gray (30-49): Marginal AFZ candidates
- **Click for Details:** Click any parcel marker to view detailed information
- **Pan & Zoom:** Navigate across Texas to explore different regions

### 2. Advanced Filtering
- **By Criteria:** Filter by Marginal Land, Brownfields, Arid Regions, or Grid Access
- **By County:** Select specific counties to focus on
- **By Acreage:** Set minimum acreage thresholds
- **By AFZ Score:** Filter by eligibility score (0-100 scale)

### 3. Comprehensive Statistics
Real-time statistics update based on filters:
- Total parcels matching criteria
- Total acreage available
- Average AFZ eligibility score
- Count by specific criteria
- County-level breakdowns

### 4. Data Export
- **CSV Export:** Export filtered results to spreadsheet format
- **JSON Export:** Export complete database with metadata
- Includes all parcel details and geographic coordinates

### 5. Detailed Parcel Information

Each parcel includes:
- Unique AFZ parcel ID
- Property name and location
- County and state
- GPS coordinates (latitude/longitude)
- Total acreage
- AFZ eligibility score (0-100)
- Qualifying criteria (multiple possible)
- Soil quality assessment
- Brownfield status
- Arid region classification
- Average annual rainfall
- Distance to nearest substation
- Distance to nearest transmission line
- Grid access status
- Current land use
- Elevation
- Water access information
- Additional notes

## Current Database

### Statistics (as generated)

- **Total Parcels:** 29 AFZ-eligible properties
- **Total Acreage:** 61,670 acres
- **Average AFZ Score:** 76.7/100
- **Geographic Coverage:** 24 Texas counties

### Breakdown by Criteria

- **Marginal Land:** 25 parcels
- **Grid Access:** 26 parcels
- **Arid Regions:** 17 parcels
- **Brownfield Sites:** 8 parcels

### Top Counties

1. Pecos County (2 parcels)
2. Harris County (2 parcels)
3. Bosque County (2 parcels)
4. Multiple single-parcel counties across Texas

### Regional Distribution

- **West Texas:** Arid regions, oil & gas brownfields (Pecos, Culberson, Reeves, Ward)
- **Panhandle:** Arid grassland, marginal cropland (Deaf Smith, Hartley, Oldham)
- **Central Texas:** Rocky marginal ranch land (Bosque, Coryell, Lampasas)
- **South Texas:** Arid brushland (Zavala, Dimmit, Jim Hogg)
- **Gulf Coast:** Industrial brownfields (Harris, Jefferson)
- **Far West:** Extreme arid/desert regions (Hudspeth, El Paso, Presidio)

## Usage Instructions

### Accessing the AFZ Database

#### Option 1: Direct Access
Navigate to: `https://williambevans.github.io/fieldTool/afz-viewer.html`

#### Option 2: Via Main Application
1. Go to the main Field Tool: `https://williambevans.github.io/fieldTool/`
2. Click the green "🌾 Agriculture Freedom Zones Database →" button in the header

### Using the Viewer

1. **Browse the Map**
   - Parcels automatically load on the interactive map
   - Pan/zoom to explore different regions
   - Click markers for detailed popup information

2. **Apply Filters**
   - Select criteria from dropdowns (AFZ Criteria, County)
   - Set minimum values for Acres and AFZ Score
   - Map and table update automatically

3. **View Details**
   - Click any table row to zoom to that parcel on the map
   - Marker popup displays comprehensive parcel information

4. **Export Data**
   - Click "📥 Export to CSV" for spreadsheet-compatible format
   - Click "📥 Export to JSON" for complete database with metadata

## AFZ Scoring System

Each parcel receives an AFZ eligibility score (0-100) based on:

| Criteria | Weight |
|----------|--------|
| Marginal Land | 30 points |
| Brownfield Site | 35 points |
| Arid Region | 25 points |
| Grid Access | 30 points |
| Proximity Bonus | +10 points |

**Proximity Bonus:** Awarded if parcel is within 1 mile of substation or transmission line.

**Minimum Eligibility:** Parcels with scores ≥30 are included in the database.

## Data Generation & Expansion

### Adding New Parcels

To add more AFZ-eligible parcels to the database:

1. **Edit the Generator Script**
   ```bash
   nano src/generate_afz_data.py
   ```

2. **Add New Parcel Classifications**
   ```python
   classifier.classify_parcel(
       parcel_id='AFZ-TX-XXXXX-001',
       name='Property Name',
       county='County Name',
       state='TX',
       lat=31.0000,
       lon=-100.0000,
       acres=1000,
       soil_quality='marginal',  # or 'moderate', 'prime'
       is_brownfield=False,
       avg_rainfall=15.0,
       nearest_substation=3.5,
       nearest_transmission=2.0,
       current_use='vacant',
       elevation=2000,
       water_access='none',
       notes='Description of the property'
   )
   ```

3. **Regenerate the Database**
   ```bash
   cd /path/to/fieldTool
   python3 src/generate_afz_data.py
   ```

4. **Deploy Updated Data**
   - Commit the new `data/afz_parcels.json` and `data/afz_parcels.geojson`
   - Push to GitHub
   - GitHub Pages will automatically update

### Data Sources for Expansion

To expand the database with real-world data, consider:

1. **USDA NRCS Data**
   - Soil quality assessments
   - Land capability classifications
   - National Resources Inventory

2. **EPA Brownfields Database**
   - Remediated industrial sites
   - Environmental cleanup records
   - Ready-for-reuse properties

3. **NOAA Climate Data**
   - Annual rainfall data
   - Drought classifications
   - Arid region identification

4. **Utility Company Data**
   - Substation locations
   - Transmission line routes
   - Grid capacity information

5. **State/County GIS Data**
   - Parcel boundaries
   - Land use classifications
   - Property ownership records

## API Reference

### AFZClassifier Class

```python
from src.afz_classifier import AFZClassifier

# Initialize
classifier = AFZClassifier()

# Classify a parcel
parcel = classifier.classify_parcel(
    parcel_id='AFZ-TX-XXXX-001',
    name='Example Parcel',
    # ... additional parameters
)

# Get eligible parcels
eligible = classifier.get_eligible_parcels(min_score=30)

# Filter by criteria
marginal_lands = classifier.filter_by_criteria('Marginal Land')
county_parcels = classifier.filter_by_county('Bosque')

# Get statistics
stats = classifier.get_statistics()

# Export data
classifier.export_to_json('output.json')
classifier.export_to_geojson('output.geojson')
```

### Key Methods

- `classify_parcel()`: Evaluate a land parcel for AFZ eligibility
- `get_eligible_parcels(min_score)`: Retrieve parcels meeting minimum score
- `filter_by_criteria(criteria)`: Filter by specific AFZ criteria
- `filter_by_county(county)`: Filter by county
- `get_statistics()`: Generate comprehensive statistics
- `export_to_json(filepath)`: Export database to JSON
- `export_to_geojson(filepath)`: Export to GeoJSON for mapping

## Tax Benefits (AFZ Framework)

Designated AFZ zones offer:

1. **Capital Gains Tax Deferral**
   - Defer taxes on capital gains when invested in AFZ projects
   - Encourages capital deployment to eligible areas

2. **Reduced Gains for Long-Term Investment**
   - Lower tax rates for investments held beyond minimum periods
   - Incentivizes sustained development

3. **Tax-Free Appreciation**
   - Extended holdings may qualify for tax-free appreciation
   - Rewards long-term commitment to AFZ development

4. **No Prime Land Incentives**
   - Framework specifically excludes prime farmland and ranch land
   - Protects agricultural resources while promoting marginal land development

## Use Cases

### 1. Real Estate Development
- Identify AFZ-eligible properties for tax-advantaged development
- Solar farm and renewable energy installations
- Data center site selection
- Industrial facility planning

### 2. Investment Analysis
- Evaluate AFZ tax benefits for investment portfolios
- Compare multiple sites across criteria
- Assess risk/return profiles with tax advantages

### 3. State Nomination Process
- States can use database to identify nomination candidates
- Supporting documentation for federal review
- Geographic distribution analysis

### 4. Energy Infrastructure Planning
- Combine AFZ eligibility with grid access
- Brownfield-to-solar conversion opportunities
- Data center power requirements matching

## Deployment & Maintenance

### Current Deployment

- **Live URL:** https://williambevans.github.io/fieldTool/afz-viewer.html
- **Hosting:** GitHub Pages (free, static hosting)
- **Repository:** https://github.com/williambevans/fieldTool
- **Branch:** `claude/afz-database-display-nsA0L`

### Updating the Database

```bash
# 1. Make changes to src/generate_afz_data.py
# 2. Regenerate data files
python3 src/generate_afz_data.py

# 3. Commit changes
git add data/afz_parcels.json data/afz_parcels.geojson
git commit -m "Update AFZ database with new parcels"

# 4. Push to GitHub
git push origin claude/afz-database-display-nsA0L

# 5. GitHub Pages automatically rebuilds (1-2 minutes)
```

### Performance Optimization

Current system handles 29 parcels efficiently. For larger databases:

- Consider pagination for 1000+ parcels
- Implement map clustering for dense regions
- Add lazy loading for detailed parcel data
- Use CDN for faster data delivery

## Future Enhancements

### Planned Features

1. **Real-Time Data Integration**
   - USDA API integration for soil data
   - EPA Brownfields database connection
   - NOAA climate data feeds

2. **Advanced Analytics**
   - Solar potential modeling for each parcel
   - Wind resource assessment integration
   - ROI calculators with AFZ tax benefits

3. **User Contributions**
   - Community-submitted parcels
   - Verification workflow
   - Crowdsourced data validation

4. **Mobile Application**
   - Native iOS/Android apps
   - GPS-based field verification
   - Offline database access

5. **Enhanced Mapping**
   - Satellite imagery overlay
   - Parcel boundary visualization
   - 3D terrain rendering

## Technical Support

### Common Issues

**Q: Map not loading?**
A: Ensure JavaScript is enabled and you have internet connectivity (map tiles load from OpenStreetMap).

**Q: Data not displaying?**
A: Check that `data/afz_parcels.json` exists and is accessible. Verify browser console for errors.

**Q: Export not working?**
A: Modern browsers may block downloads; check your browser's download settings and permissions.

### Contact & Contributions

- **Primary Developer:** HH Holdings / Bevans Real Estate
- **Project Repository:** https://github.com/williambevans/fieldTool
- **Issues/Suggestions:** Submit via GitHub Issues

## Legal Disclaimer

This database is provided for informational and planning purposes only. AFZ designation is subject to:

- Official nomination by state authorities
- Federal agency review (USDA, DOI, DOE)
- Treasury Department certification
- Compliance with all applicable laws and regulations

**This database does not constitute:**
- Official AFZ designation
- Legal or tax advice
- Guarantee of AFZ qualification
- Property appraisal or valuation

Always consult with qualified tax professionals, attorneys, and relevant government agencies before making investment decisions based on AFZ eligibility.

## License

This project is part of the EAGLE - Energy Infrastructure Intelligence platform developed by HH Holdings / Bevans Real Estate for Bosque County, Texas operations.

---

**Version:** 1.0
**Last Updated:** January 2026
**Database Generation Date:** See `data/afz_parcels.json` metadata

For the latest version and updates, visit: https://williambevans.github.io/fieldTool/
