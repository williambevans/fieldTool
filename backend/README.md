# EAGLE Clerk Records API Backend

Python Flask API for Bosque County clerk records scraping and retrieval.

## Overview

This backend service provides REST API endpoints for searching and retrieving Bosque County clerk records from multiple official sources:

- **TexasFile** - Official Texas deed records
- **KoFile QuickLinks** - Historical records (Volume A-50)
- **iDocMarket** - Land records from 1984 to current
- **Bosque County Official** - County clerk website

## Features

- 🔍 Search by name (grantor/grantee)
- 🏠 Search by property ID or address
- 📅 Search by date range
- 📄 Retrieve full document details
- 📊 Get statistics and available record types
- 🌐 CORS enabled for GitHub Pages frontend

## API Endpoints

### Health Check
```
GET /api/health
```

### Search by Name
```
GET /api/clerk/search/name?name=<name>&type=<type>

Parameters:
  - name: Person or entity name (required)
  - type: Record type (optional, default: all)
    Options: deed, mortgage, lien, marriage, etc.
```

### Search by Property
```
GET /api/clerk/search/property?property_id=<id>&address=<address>

Parameters:
  - property_id: Property/parcel ID (optional)
  - address: Property address (optional)
  - At least one parameter required
```

### Search by Date Range
```
GET /api/clerk/search/date?start_date=<date>&end_date=<date>&type=<type>

Parameters:
  - start_date: Start date YYYY-MM-DD (required)
  - end_date: End date YYYY-MM-DD (required)
  - type: Record type (optional)
```

### Get Document Details
```
GET /api/clerk/document/<document_id>?source=<source>

Parameters:
  - document_id: Document ID or instrument number (required)
  - source: Source system (optional, default: texasfile)
    Options: texasfile, kofile, idocmarket
```

### Get Record Types
```
GET /api/clerk/types

Returns list of available record types
```

### Get Statistics
```
GET /api/clerk/stats

Returns statistics about available records
```

## Installation

### Local Development

1. **Install Python 3.9+**

2. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

3. **Run development server:**
```bash
python api.py
```

The API will start on http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
DEBUG=True
FLASK_ENV=development
```

## Deployment Options

### Option 1: Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create eagle-clerk-api
```

3. Deploy:
```bash
git subtree push --prefix backend heroku main
```

4. Set environment variables:
```bash
heroku config:set DEBUG=False
```

### Option 2: Railway

1. Install Railway CLI
2. Initialize:
```bash
railway init
```

3. Deploy:
```bash
railway up
```

### Option 3: PythonAnywhere

1. Upload files to PythonAnywhere
2. Set up virtual environment
3. Configure WSGI file to point to `api.py`

### Option 4: Replit

1. Import repository to Replit
2. Set working directory to `backend`
3. Click "Run"

### Option 5: Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "api:app"]
```

Build and run:
```bash
docker build -t eagle-clerk-api .
docker run -p 5000:5000 eagle-clerk-api
```

## Production Configuration

For production deployment, use Gunicorn:

```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 api:app
```

Create `Procfile` for Heroku/Railway:
```
web: gunicorn --bind 0.0.0.0:$PORT --workers 4 api:app
```

## Frontend Integration

Update `app.js` in the EAGLE frontend with your API URL:

```javascript
const CLERK_API_URL = 'https://your-api-domain.com/api';
```

## Rate Limiting

Consider adding rate limiting for production:

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/clerk/search/name')
@limiter.limit("10 per minute")
def search_by_name():
    # ...
```

## Caching

Add caching to reduce load on source websites:

```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/clerk/search/name')
@cache.cached(timeout=300, query_string=True)
def search_by_name():
    # ...
```

## Legal Compliance

⚠️ **Important Notes:**

1. This scraper accesses public records
2. Respect robots.txt and terms of service
3. Implement rate limiting to avoid overloading source websites
4. Cache results to minimize requests
5. All data should be verified with official county sources
6. For legal purposes, always confirm with Bosque County Clerk's Office

**Contact:**
- Bosque County Clerk
- 110 South Main, Room 110
- Meridian, TX 76665
- Phone: (254) 435-2201

## Testing

Test API endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# Search by name
curl "http://localhost:5000/api/clerk/search/name?name=Smith&type=deed"

# Get statistics
curl http://localhost:5000/api/clerk/stats
```

## Troubleshooting

**CORS errors:**
- Ensure your frontend URL is in the CORS origins list
- Check browser console for specific CORS messages

**Scraping errors:**
- Source websites may change structure
- Update BeautifulSoup selectors in `clerk_scraper.py`
- Check for rate limiting or IP blocking

**Connection timeouts:**
- Increase timeout values in scraper
- Implement retry logic with exponential backoff

## Contributing

This backend is part of the EAGLE (Energy Asset Gateway & Location Explorer) application by HH Holdings / Bevans Real Estate.

## License

Proprietary - HH Holdings / Bevans Real Estate
