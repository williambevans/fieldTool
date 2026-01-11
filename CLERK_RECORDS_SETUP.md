# Clerk Records Digital Twin Setup Guide

This guide explains how to set up and deploy the Bosque County clerk records digital twin integration for the EAGLE app.

## Overview

The clerk records system consists of two parts:

1. **Python Backend API** (`backend/` directory)
   - Flask REST API
   - Web scraper for Bosque County clerk records
   - Searches TexasFile, KoFile, and other official sources

2. **JavaScript Frontend** (integrated in `app.js`)
   - API client functions
   - Search UI integration
   - Results display

## Backend Setup

### Step 1: Deploy the Python API

The backend must be deployed to a server that can run Python. Choose one of these options:

#### Option A: Heroku (Recommended for beginners)

1. Install Heroku CLI:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. Create Heroku app:
```bash
cd backend
heroku create eagle-clerk-api
```

3. Deploy:
```bash
git init
git add .
git commit -m "Initial clerk API"
heroku git:remote -a eagle-clerk-api
git push heroku main
```

4. Your API URL will be: `https://eagle-clerk-api.herokuapp.com`

#### Option B: Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Deploy:
```bash
cd backend
railway init
railway up
```

3. Get your API URL from Railway dashboard

#### Option C: PythonAnywhere

1. Create account at pythonanywhere.com
2. Upload backend files
3. Configure WSGI to point to `api.py`
4. Your API URL will be: `https://yourusername.pythonanywhere.com`

#### Option D: Replit

1. Import repository to Replit
2. Set working directory to `backend`
3. Click "Run"
4. Your API URL will be: `https://your-repl.repl.co`

### Step 2: Test the API

Once deployed, test it:

```bash
# Health check
curl https://your-api-url.com/api/health

# Search by name
curl "https://your-api-url.com/api/clerk/search/name?name=Smith&type=deed"

# Get statistics
curl https://your-api-url.com/api/clerk/stats
```

## Frontend Integration

### Step 3: Configure the Frontend

1. Open `app.js` in your repository

2. Find the `CLERK_API` configuration (around line 50):

```javascript
const CLERK_API = {
    baseUrl: 'http://localhost:5000/api',  // Change this
    enabled: false,  // Change to true
    timeout: 10000
};
```

3. Update with your API URL and enable it:

```javascript
const CLERK_API = {
    baseUrl: 'https://your-api-url.com/api',  // Your deployed API
    enabled: true,  // Enable the API
    timeout: 10000
};
```

4. Commit and push:

```bash
git add app.js
git commit -m "Enable clerk records API"
git push origin main
```

### Step 4: Use the Clerk Records Search

Once configured, users can:

1. Go to the **Map & CAD** tab
2. Use the property search form
3. Search by:
   - Owner name
   - Property address
   - Parcel ID
   - Minimum acreage

4. Results will display automatically from the clerk records system

## Official Clerk Records Sources

The backend scrapes data from these official Bosque County sources:

- **TexasFile**: https://www.texasfile.com/
  - Free search of official public records
  - Deeds, mortgages, liens from 1984-current

- **KoFile QuickLinks**: https://kofilequicklinks.com/Bosque/
  - Historical data Volume A-50
  - Archived county records

- **iDocMarket**: https://www.idocmarket.com/Sites
  - Land records 1984 to current
  - Document images available

- **Bosque County Official**: https://www.bosquecounty.gov/171/County-Clerk--Recording-lifes-events-sin
  - County clerk information
  - Contact details for in-person searches

## Features

### Search Capabilities

- **By Name**: Search grantor/grantee names
- **By Property**: Search by parcel ID or address
- **By Date**: Search records filed in date range
- **By Type**: Filter by record type (deed, mortgage, lien, etc.)

### Record Types Supported

- Deeds
- Mortgages
- Deeds of Trust
- Releases
- Liens
- Lis Pendens
- Easements
- Right of Way
- Plats
- Marriages
- Divorces
- Probates
- Judgments
- Mechanic's Liens
- Tax Liens
- UCC Financing Statements
- Powers of Attorney
- Military Discharges
- Assumed Names

### Document Details

For each record, the system retrieves:
- Document type
- Instrument number
- Filed date
- Grantor (seller/borrower)
- Grantee (buyer/lender)
- Legal description
- Volume and page numbers
- Full document text (when available)
- Document images (when available)

## Data Flow

```
User searches → Frontend (app.js)
              ↓
              CLERK_API.searchClerkRecords()
              ↓
Backend API (api.py) → ClerkScraper (clerk_scraper.py)
              ↓
              Official county sources
              ↓
              Parse and return JSON
              ↓
Frontend displays results
```

## Legal & Compliance

⚠️ **Important:**

1. **Public Records**: This system accesses public records only
2. **Official Verification**: All data should be verified with the Bosque County Clerk's Office for legal purposes
3. **Rate Limiting**: The scraper implements rate limiting to respect source websites
4. **Terms of Service**: Ensure compliance with terms of service for all data sources
5. **Caching**: Results are cached to minimize load on source systems

**For Legal Purposes Contact:**
- Bosque County Clerk
- 110 South Main, Room 110
- Meridian, TX 76665
- Phone: (254) 435-2201

## Troubleshooting

### API Not Responding

- Check backend deployment status
- Verify API URL is correct in `app.js`
- Check API logs for errors

### CORS Errors

- Ensure GitHub Pages URL is in CORS origins list
- Check browser console for specific error messages
- Verify API is deployed and accessible

### No Results Found

- Source websites may be temporarily unavailable
- Search terms may be too specific
- Try alternative spellings or partial names
- Visit official sources directly as fallback

### Rate Limiting

- Backend implements rate limiting to protect sources
- Wait a few seconds between searches
- Consider caching frequently accessed records

## Offline Fallback

If the API is unavailable, the system automatically falls back to showing manual search instructions with links to:

- TexasFile official site
- KoFile QuickLinks
- Bosque County CAD

Users can still access all records manually through these portals.

## Cost Considerations

### Free Options

- **PythonAnywhere**: Free tier available
- **Replit**: Free tier available
- **Heroku**: Was free, now requires credit card

### Paid Options

- **Railway**: ~$5/month
- **Heroku**: ~$7/month
- **Digital Ocean**: ~$5/month

### Recommended

For HH Holdings production use, we recommend **Railway** or **Heroku** for reliability and ease of deployment.

## Support

For questions or issues with the clerk records integration:

1. Check backend/README.md for detailed API documentation
2. Review API logs for error messages
3. Test endpoints directly with curl
4. Verify source websites are accessible

## Future Enhancements

Potential improvements:

1. **Document OCR**: Extract text from scanned documents
2. **PDF Generation**: Export records as PDFs
3. **Email Alerts**: Notify when new records match criteria
4. **Advanced Filtering**: More sophisticated search operators
5. **Bulk Export**: Download multiple records at once
6. **Property Timeline**: Show chronological history of property
7. **Map Integration**: Display parcels directly on map
8. **Mobile App**: Native iOS/Android apps

---

**Digital Twin by HH Holdings / Bevans Real Estate**
**Bosque County, Texas Energy Intelligence**

**Sources:**
- [TexasFile - Bosque County Clerk Records](https://www.texasfile.com/)
- [KoFile QuickLinks - Historical Records](https://kofilequicklinks.com/Bosque/)
- [Bosque County Official Website](https://www.bosquecounty.gov/)
