/**
 * HH Holdings Energy Infrastructure Intelligence - EAGLE
 * Web Application JavaScript
 *
 * Author: Bevans Real Estate / HH Holdings
 * Location: Bosque County, Texas
 */

// Global state
let currentGPSData = null;
let currentSolarAnalysis = null;
let currentDataCenterAnalysis = null;
let map = null;
let mapMarkers = [];
let siteMarkersLayer = null;
let drawnItems = null;
let drawControl = null;
let currentDrawnParcel = null;
let parcelLayer = null;

// Constants (matching Python CLI version)
const SOLAR_CONSTANTS = {
    MW_PER_ACRE: 0.5,
    CAPACITY_FACTOR: 0.20,
    HOURS_PER_YEAR: 8760,
    MWH_PER_HOME_YEAR: 11,
    SYSTEM_LOSSES: 0.14,
    CAPEX_PER_MW: 1000000,
    O_M_PER_MW_YEAR: 20000,
    PPA_RATE: 0.03  // $0.03/kWh
};

const DATACENTER_CONSTANTS = {
    WATTS_PER_SERVER: 500,
    PUE_DEFAULT: 1.5,
    COOLING_LOAD_MULTIPLIER: 0.4,
    HOURS_PER_YEAR: 8760,
    ELECTRICITY_RATE_KWH: 0.08,
    CAPEX_PER_KW: 10000,
    SQFT_PER_KW: 250,
    SERVERS_PER_RACK: 42
};

const BOSQUE_COUNTY = {
    center: { lat: 31.8749, lon: -97.6428 },
    bounds: { minLat: 31.65, maxLat: 32.10, minLon: -98.00, maxLon: -97.40 },
    brazosRiver: { lat: 31.8500, lon: -97.6000 }
};

// Clerk Records Scraping Configuration (Client-Side)
const CLERK_CONFIG = {
    corsProxies: [
        'https://api.allorigins.win/raw?url=',  // AllOrigins - reliable
        'https://corsproxy.io/?',               // CORSProxy.io
        'https://api.codetabs.com/v1/proxy?quest='  // CodeTabs
    ],
    sources: {
        texasfile: 'https://www.texasfile.com/search',
        bosquecad: 'https://esearch.bosquecad.com/',
        kofile: 'https://kofilequicklinks.com/Bosque/'
    },
    enabled: true,  // Client-side scraping enabled by default
    timeout: 15000,
    currentProxyIndex: 0
};

// ============================================================================
// TAB NAVIGATION
// ============================================================================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');

    // Activate button
    event.target.classList.add('active');

    // Load sites if database tab
    if (tabName === 'database') {
        loadSites();
    }

    // Initialize map if map tab
    if (tabName === 'map') {
        initializeMap();
    }
}

// ============================================================================
// GPS FUNCTIONS
// ============================================================================

function captureGPS() {
    const statusDiv = document.getElementById('gps-status');
    const resultsDiv = document.getElementById('gps-results');

    if (!navigator.geolocation) {
        showGPSStatus('error', '❌ GPS not supported by your browser');
        return;
    }

    showGPSStatus('acquiring', '🛰️ Acquiring GPS signal...');
    resultsDiv.classList.add('hidden');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const gpsData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };

            currentGPSData = gpsData;

            // Check if in Bosque County
            const inBosque = isInBosqueCounty(gpsData.latitude, gpsData.longitude);
            const territory = inBosque ? 'Bosque County (Oncor Territory)' : 'Outside Bosque County';

            // Update display
            document.getElementById('gps-lat').textContent = gpsData.latitude.toFixed(6) + '°N';
            document.getElementById('gps-lon').textContent = Math.abs(gpsData.longitude).toFixed(6) + '°W';
            document.getElementById('gps-accuracy').textContent = '±' + gpsData.accuracy.toFixed(1) + 'm';
            document.getElementById('gps-territory').textContent = territory;

            showGPSStatus('success', '✅ GPS location captured successfully');
            resultsDiv.classList.remove('hidden');
        },
        (error) => {
            let message = '❌ GPS error: ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Permission denied. Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location unavailable. Try going outside.';
                    break;
                case error.TIMEOUT:
                    message += 'Request timed out. Please try again.';
                    break;
                default:
                    message += 'Unknown error occurred.';
            }
            showGPSStatus('error', message);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
}

function showGPSStatus(type, message) {
    const statusDiv = document.getElementById('gps-status');
    statusDiv.className = `gps-status ${type}`;
    document.getElementById('gps-message').textContent = message;
    statusDiv.classList.remove('hidden');
}

function captureGPSForAnalysis(analysisType) {
    if (!navigator.geolocation) {
        alert('GPS not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentGPSData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            alert(`✅ GPS captured: ${currentGPSData.latitude.toFixed(6)}°N, ${Math.abs(currentGPSData.longitude).toFixed(6)}°W`);
        },
        (error) => {
            alert('❌ GPS error: ' + error.message);
        },
        { enableHighAccuracy: true, timeout: 30000 }
    );
}

function isInBosqueCounty(lat, lon) {
    return lat >= BOSQUE_COUNTY.bounds.minLat &&
           lat <= BOSQUE_COUNTY.bounds.maxLat &&
           lon >= BOSQUE_COUNTY.bounds.minLon &&
           lon <= BOSQUE_COUNTY.bounds.maxLon;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula
    const R = 3958.8; // Earth radius in miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// ============================================================================
// SOLAR FARM CALCULATIONS
// ============================================================================

function analyzeSolar() {
    const name = document.getElementById('solar-name').value;
    const acres = parseFloat(document.getElementById('solar-acres').value);
    const notes = document.getElementById('solar-notes').value;

    if (!name || !acres || acres <= 0) {
        alert('Please enter site name and valid acreage');
        return;
    }

    // Calculate capacity
    const mwCapacity = acres * SOLAR_CONSTANTS.MW_PER_ACRE;

    // Annual generation (MW × 8760 hours × CF × (1 - losses))
    const annualMWh = mwCapacity * SOLAR_CONSTANTS.HOURS_PER_YEAR *
                      SOLAR_CONSTANTS.CAPACITY_FACTOR *
                      (1 - SOLAR_CONSTANTS.SYSTEM_LOSSES);

    // Homes powered
    const homesPowered = Math.floor(annualMWh / SOLAR_CONSTANTS.MWH_PER_HOME_YEAR);

    // Economic estimates
    const capex = mwCapacity * SOLAR_CONSTANTS.CAPEX_PER_MW;
    const annualOM = mwCapacity * SOLAR_CONSTANTS.O_M_PER_MW_YEAR;

    // Revenue (at $0.03/kWh)
    const annualRevenue = annualMWh * 1000 * SOLAR_CONSTANTS.PPA_RATE;
    const revenuePerAcre = annualRevenue / acres;

    // Store analysis
    currentSolarAnalysis = {
        name,
        acres,
        mwCapacity,
        annualMWh,
        homesPowered,
        capex,
        annualOM,
        annualRevenue,
        revenuePerAcre,
        notes,
        calculatedAt: new Date().toISOString()
    };

    // Add GPS if available
    if (currentGPSData) {
        currentSolarAnalysis.gps = currentGPSData;
        currentSolarAnalysis.inBosqueCounty = isInBosqueCounty(currentGPSData.latitude, currentGPSData.longitude);
    }

    // Display results
    document.getElementById('solar-capacity').textContent = mwCapacity.toFixed(2) + ' MW';
    document.getElementById('solar-generation').textContent = annualMWh.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' MWh';
    document.getElementById('solar-homes').textContent = homesPowered.toLocaleString();
    document.getElementById('solar-capex').textContent = '$' + capex.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('solar-revenue').textContent = '$' + annualRevenue.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('solar-revenue-acre').textContent = '$' + revenuePerAcre.toLocaleString(undefined, {maximumFractionDigits: 0});

    document.getElementById('solar-results').classList.remove('hidden');
    document.getElementById('solar-results').scrollIntoView({ behavior: 'smooth' });
}

function clearSolarForm() {
    document.getElementById('solar-name').value = '';
    document.getElementById('solar-acres').value = '';
    document.getElementById('solar-notes').value = '';
    document.getElementById('solar-results').classList.add('hidden');
    currentSolarAnalysis = null;
}

// ============================================================================
// DATA CENTER CALCULATIONS
// ============================================================================

function analyzeDataCenter() {
    const name = document.getElementById('dc-name').value;
    const servers = parseInt(document.getElementById('dc-servers').value);
    const watts = parseInt(document.getElementById('dc-watts').value);
    const pue = parseFloat(document.getElementById('dc-pue').value);
    const notes = document.getElementById('dc-notes').value;

    if (!name || !servers || servers <= 0) {
        alert('Please enter site name and valid server count');
        return;
    }

    // IT load calculation
    const itLoadKW = (servers * watts) / 1000;

    // Total facility load with PUE
    const totalFacilityKW = itLoadKW * pue;
    const totalFacilityMW = totalFacilityKW / 1000;

    // Cooling and overhead
    const coolingKW = itLoadKW * DATACENTER_CONSTANTS.COOLING_LOAD_MULTIPLIER;
    const overheadKW = totalFacilityKW - itLoadKW - coolingKW;

    // Annual consumption
    const annualMWh = (totalFacilityKW * DATACENTER_CONSTANTS.HOURS_PER_YEAR) / 1000;
    const annualCost = annualMWh * 1000 * DATACENTER_CONSTANTS.ELECTRICITY_RATE_KWH;

    // Capital estimate
    const estimatedCapex = itLoadKW * DATACENTER_CONSTANTS.CAPEX_PER_KW;

    // Facility footprint
    const buildingSqFt = totalFacilityKW * DATACENTER_CONSTANTS.SQFT_PER_KW;
    const totalSiteAcres = (buildingSqFt * 3) / 43560; // 3x building for total site

    // Racks needed
    const racksNeeded = Math.ceil(servers / DATACENTER_CONSTANTS.SERVERS_PER_RACK);

    // Store analysis
    currentDataCenterAnalysis = {
        name,
        servers,
        watts,
        pue,
        itLoadKW,
        coolingKW,
        overheadKW,
        totalFacilityKW,
        totalFacilityMW,
        annualMWh,
        annualCost,
        estimatedCapex,
        buildingSqFt,
        totalSiteAcres,
        racksNeeded,
        notes,
        calculatedAt: new Date().toISOString()
    };

    // Add GPS if available
    if (currentGPSData) {
        currentDataCenterAnalysis.gps = currentGPSData;
        currentDataCenterAnalysis.inBosqueCounty = isInBosqueCounty(currentGPSData.latitude, currentGPSData.longitude);
    }

    // Display results
    document.getElementById('dc-it-load').textContent = itLoadKW.toFixed(1) + ' kW';
    document.getElementById('dc-total').textContent = totalFacilityMW.toFixed(3) + ' MW';
    document.getElementById('dc-annual').textContent = annualMWh.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' MWh';
    document.getElementById('dc-cost').textContent = '$' + annualCost.toLocaleString(undefined, {maximumFractionDigits: 0});
    document.getElementById('dc-building').textContent = buildingSqFt.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' sq ft';
    document.getElementById('dc-land').textContent = totalSiteAcres.toFixed(1) + ' acres';

    document.getElementById('dc-results').classList.remove('hidden');
    document.getElementById('dc-results').scrollIntoView({ behavior: 'smooth' });
}

function clearDataCenterForm() {
    document.getElementById('dc-name').value = '';
    document.getElementById('dc-servers').value = '';
    document.getElementById('dc-watts').value = '500';
    document.getElementById('dc-pue').value = '1.5';
    document.getElementById('dc-notes').value = '';
    document.getElementById('dc-results').classList.add('hidden');
    currentDataCenterAnalysis = null;
}

// ============================================================================
// SITE DATABASE (localStorage)
// ============================================================================

function saveSite(type) {
    let siteData;

    if (type === 'solar') {
        if (!currentSolarAnalysis) {
            alert('Please calculate solar analysis first');
            return;
        }
        siteData = {
            type: 'solar',
            ...currentSolarAnalysis,
            id: generateSiteId(),
            savedAt: new Date().toISOString()
        };
    } else if (type === 'datacenter') {
        if (!currentDataCenterAnalysis) {
            alert('Please calculate data center analysis first');
            return;
        }
        siteData = {
            type: 'datacenter',
            ...currentDataCenterAnalysis,
            id: generateSiteId(),
            savedAt: new Date().toISOString()
        };
    }

    // Get existing sites
    const sites = getSites();
    sites.push(siteData);
    localStorage.setItem('eagle-sites', JSON.stringify(sites));

    alert(`✅ Site "${siteData.name}" saved to database!`);
}

function getSites() {
    const sitesJSON = localStorage.getItem('eagle-sites');
    return sitesJSON ? JSON.parse(sitesJSON) : [];
}

function generateSiteId() {
    return 'HH-' + Date.now();
}

function loadSites() {
    const sites = getSites();
    const siteList = document.getElementById('site-list');

    // Update statistics
    const totalSites = sites.length;
    const solarSites = sites.filter(s => s.type === 'solar').length;
    const dcSites = sites.filter(s => s.type === 'datacenter').length;

    let totalMW = 0;
    sites.forEach(site => {
        if (site.type === 'solar' && site.mwCapacity) {
            totalMW += site.mwCapacity;
        } else if (site.type === 'datacenter' && site.totalFacilityMW) {
            totalMW += site.totalFacilityMW;
        }
    });

    document.getElementById('stats-total').textContent = totalSites;
    document.getElementById('stats-solar').textContent = solarSites;
    document.getElementById('stats-dc').textContent = dcSites;
    document.getElementById('stats-mw').textContent = totalMW.toFixed(2) + ' MW';

    // Display sites
    if (sites.length === 0) {
        siteList.innerHTML = '<p class="text-center" style="color: #666;">No sites saved yet. Analyze and save sites to see them here.</p>';
        return;
    }

    siteList.innerHTML = '';
    sites.reverse().forEach((site, index) => {
        const siteDiv = document.createElement('div');
        siteDiv.className = 'site-item';
        siteDiv.onclick = () => viewSite(site);

        let details = '';
        if (site.type === 'solar') {
            details = `${site.acres} acres | ${site.mwCapacity.toFixed(2)} MW | ${site.homesPowered.toLocaleString()} homes`;
        } else {
            details = `${site.servers} servers | ${site.totalFacilityMW.toFixed(2)} MW | ${site.buildingSqFt.toLocaleString()} sq ft`;
        }

        siteDiv.innerHTML = `
            <div class="site-item-header">
                <span class="site-item-name">${site.name}</span>
                <span class="site-item-type">${site.type.toUpperCase()}</span>
            </div>
            <div class="site-item-details">
                ${details}<br>
                ${site.gps ? `📍 ${site.gps.latitude.toFixed(4)}°N, ${Math.abs(site.gps.longitude).toFixed(4)}°W` : '📍 No GPS data'}<br>
                Saved: ${new Date(site.savedAt).toLocaleDateString()}
            </div>
        `;

        siteList.appendChild(siteDiv);
    });
}

function viewSite(site) {
    const details = JSON.stringify(site, null, 2);
    alert('Site Details:\n\n' + details);
}

function clearDatabase() {
    if (confirm('⚠️ Are you sure you want to delete ALL saved sites? This cannot be undone.')) {
        localStorage.removeItem('eagle-sites');
        loadSites();
        alert('✅ Database cleared');
    }
}

function exportSiteJSON(type) {
    let data;
    if (type === 'solar') {
        data = currentSolarAnalysis;
    } else {
        data = currentDataCenterAnalysis;
    }

    if (!data) {
        alert('No analysis to export');
        return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function exportAllSitesCSV() {
    const sites = getSites();

    if (sites.length === 0) {
        alert('No sites to export');
        return;
    }

    // CSV headers
    let csv = 'ID,Type,Name,Saved Date,';

    // Add type-specific headers
    const hasSolar = sites.some(s => s.type === 'solar');
    const hasDC = sites.some(s => s.type === 'datacenter');

    if (hasSolar) {
        csv += 'Acres,MW Capacity,Annual MWh,Homes Powered,CAPEX,Annual Revenue,';
    }
    if (hasDC) {
        csv += 'Servers,IT Load kW,Total MW,Annual MWh,Annual Cost,Building Sq Ft,';
    }

    csv += 'Latitude,Longitude,GPS Accuracy,Notes\n';

    // Add data rows
    sites.forEach(site => {
        const row = [];
        row.push(site.id);
        row.push(site.type);
        row.push(`"${site.name}"`);
        row.push(new Date(site.savedAt).toISOString().split('T')[0]);

        if (site.type === 'solar') {
            row.push(site.acres || '');
            row.push(site.mwCapacity || '');
            row.push(site.annualMWh || '');
            row.push(site.homesPowered || '');
            row.push(site.capex || '');
            row.push(site.annualRevenue || '');
        } else {
            if (hasSolar) row.push('', '', '', '', '', '');
        }

        if (site.type === 'datacenter') {
            row.push(site.servers || '');
            row.push(site.itLoadKW || '');
            row.push(site.totalFacilityMW || '');
            row.push(site.annualMWh || '');
            row.push(site.annualCost || '');
            row.push(site.buildingSqFt || '');
        } else {
            if (hasDC) row.push('', '', '', '', '', '');
        }

        row.push(site.gps ? site.gps.latitude : '');
        row.push(site.gps ? site.gps.longitude : '');
        row.push(site.gps ? site.gps.accuracy : '');
        row.push(site.notes ? `"${site.notes.replace(/"/g, '""')}"` : '');

        csv += row.join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eagle_sites_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// ============================================================================
// MAP & PROPERTY SEARCH FUNCTIONS
// ============================================================================

function initializeMap() {
    // Only initialize once
    if (map) {
        map.invalidateSize(); // Refresh map size
        return;
    }

    // Create map centered on Bosque County
    map = L.map('map').setView([BOSQUE_COUNTY.center.lat, BOSQUE_COUNTY.center.lon], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add Bosque County boundary rectangle
    const bounds = [
        [BOSQUE_COUNTY.bounds.minLat, BOSQUE_COUNTY.bounds.minLon],
        [BOSQUE_COUNTY.bounds.maxLat, BOSQUE_COUNTY.bounds.maxLon]
    ];
    L.rectangle(bounds, {
        color: '#667eea',
        weight: 3,
        fillOpacity: 0.1
    }).addTo(map).bindPopup('<strong>Bosque County</strong><br>Oncor Territory');

    // Add Brazos River marker
    L.marker([BOSQUE_COUNTY.brazosRiver.lat, BOSQUE_COUNTY.brazosRiver.lon], {
        icon: L.divIcon({
            className: 'custom-icon',
            html: '🌊',
            iconSize: [30, 30]
        })
    }).addTo(map).bindPopup('<strong>Brazos River</strong><br>Water source for cooling');

    // Create layer for site markers
    siteMarkersLayer = L.layerGroup().addTo(map);

    // Create layer for parcels
    parcelLayer = L.layerGroup().addTo(map);

    // Initialize drawing tools
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                metric: false, // Use acres
                shapeOptions: {
                    color: '#f59e0b',
                    fillOpacity: 0.3
                }
            },
            polyline: {
                shapeOptions: {
                    color: '#667eea',
                    weight: 3
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#10b981',
                    fillOpacity: 0.2
                }
            },
            circle: false,
            circlemarker: false,
            marker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });

    // Handle drawing events
    map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        const type = event.layerType;

        drawnItems.addLayer(layer);

        if (type === 'polygon' || type === 'rectangle') {
            currentDrawnParcel = layer;
            const acres = calculatePolygonAcres(layer);
            const sqft = acres * 43560;

            document.getElementById('drawing-info').style.display = 'block';
            document.getElementById('drawn-acres').textContent = acres.toFixed(2);
            document.getElementById('drawn-sqft').textContent = sqft.toLocaleString(undefined, {maximumFractionDigits: 0});

            // Add popup to polygon
            layer.bindPopup(`
                <div class="parcel-info-popup">
                    <h4>📏 Drawn Parcel</h4>
                    <div class="info-row">
                        <div class="info-label">Area</div>
                        <div class="info-value">${acres.toFixed(2)} acres (${sqft.toLocaleString()} sq ft)</div>
                    </div>
                    <button onclick="analyzeDrawnParcel()" style="margin-top: 10px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                        ⚡ Analyze for Solar/DC
                    </button>
                </div>
            `);
        } else if (type === 'polyline') {
            const distance = calculatePolylineDistance(layer);
            layer.bindPopup(`
                <strong>Distance:</strong> ${distance.toFixed(2)} miles (${(distance * 5280).toFixed(0)} ft)
            `).openPopup();
        }
    });

    // Load saved sites on map
    showAllSites();

    // Load saved parcels
    loadParcels();

    // Add click handler for map
    map.on('click', onMapClick);
}

function onMapClick(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lon = e.latlng.lng.toFixed(6);
    const inBosque = isInBosqueCounty(parseFloat(lat), parseFloat(lon));

    const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(`
            <div class="popup-content">
                <div class="popup-title">📍 Location</div>
                <div class="popup-details">
                    <strong>Coordinates:</strong><br>
                    ${lat}°N, ${Math.abs(lon)}°W<br><br>
                    <strong>Territory:</strong><br>
                    ${inBosque ? '✅ Bosque County (Oncor)' : '❌ Outside Bosque County'}<br><br>
                    <button onclick="captureThisLocation(${lat}, ${lon})" style="padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        📡 Use This Location
                    </button>
                </div>
            </div>
        `)
        .openOn(map);
}

function captureThisLocation(lat, lon) {
    currentGPSData = {
        latitude: lat,
        longitude: lon,
        accuracy: 10, // Approximate from map click
        timestamp: new Date().toISOString()
    };
    alert(`✅ GPS set to: ${lat}°N, ${Math.abs(lon)}°W\nYou can now use this location for solar or datacenter analysis.`);
    map.closePopup();
}

function showAllSites() {
    if (!map) return;

    // Clear existing markers
    siteMarkersLayer.clearLayers();

    const sites = getSites();

    sites.forEach(site => {
        if (!site.gps) return;

        const lat = site.gps.latitude;
        const lon = site.gps.longitude;

        // Determine icon and color
        let icon, color;
        if (site.type === 'solar') {
            icon = '☀️';
            color = '#f59e0b';
        } else {
            icon = '🖥️';
            color = '#3b82f6';
        }

        // Create custom marker
        const marker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'custom-icon',
                html: `<div style="font-size: 24px;">${icon}</div>`,
                iconSize: [30, 30]
            })
        });

        // Create popup content
        let popupContent = `
            <div class="popup-content">
                <div class="popup-title">${site.name}</div>
                <span class="popup-type ${site.type}">${site.type.toUpperCase()}</span>
                <div class="popup-details">
        `;

        if (site.type === 'solar') {
            popupContent += `
                <strong>Solar Farm</strong><br>
                📏 ${site.acres} acres<br>
                ⚡ ${site.mwCapacity.toFixed(2)} MW capacity<br>
                🏠 Powers ${site.homesPowered.toLocaleString()} homes<br>
                💰 $${site.annualRevenue.toLocaleString()} annual revenue
            `;
        } else {
            popupContent += `
                <strong>Data Center</strong><br>
                🖥️ ${site.servers} servers<br>
                ⚡ ${site.totalFacilityMW.toFixed(2)} MW total load<br>
                🏢 ${site.buildingSqFt.toLocaleString()} sq ft<br>
                📊 PUE: ${site.pue}
            `;
        }

        popupContent += `
                <br><br>
                📍 ${lat.toFixed(4)}°N, ${Math.abs(lon).toFixed(4)}°W<br>
                📅 Saved: ${new Date(site.savedAt).toLocaleDateString()}
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        siteMarkersLayer.addLayer(marker);
    });

    // Fit map to show all markers if any exist
    if (sites.filter(s => s.gps).length > 0) {
        const bounds = [];
        sites.forEach(site => {
            if (site.gps) {
                bounds.push([site.gps.latitude, site.gps.longitude]);
            }
        });
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

function centerOnBosque() {
    if (!map) return;
    map.setView([BOSQUE_COUNTY.center.lat, BOSQUE_COUNTY.center.lon], 11);
}

function addCurrentLocation() {
    if (!navigator.geolocation) {
        alert('GPS not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            if (!map) {
                initializeMap();
            }

            // Add marker for current location
            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    className: 'custom-icon',
                    html: '<div style="font-size: 24px;">📍</div>',
                    iconSize: [30, 30]
                })
            }).addTo(map);

            const inBosque = isInBosqueCounty(lat, lon);

            marker.bindPopup(`
                <div class="popup-content">
                    <div class="popup-title">Your Current Location</div>
                    <div class="popup-details">
                        <strong>Coordinates:</strong><br>
                        ${lat.toFixed(6)}°N, ${Math.abs(lon).toFixed(6)}°W<br><br>
                        <strong>Accuracy:</strong> ±${position.coords.accuracy.toFixed(1)}m<br><br>
                        <strong>Territory:</strong><br>
                        ${inBosque ? '✅ Bosque County (Oncor)' : '❌ Outside Bosque County'}
                    </div>
                </div>
            `).openPopup();

            map.setView([lat, lon], 15);

            // Store GPS data
            currentGPSData = {
                latitude: lat,
                longitude: lon,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };
        },
        (error) => {
            alert('GPS error: ' + error.message);
        },
        { enableHighAccuracy: true, timeout: 30000 }
    );
}

function updateSearchPlaceholder() {
    const searchType = document.getElementById('search-type').value;
    const searchInput = document.getElementById('search-input');

    const placeholders = {
        owner: 'Enter owner name (e.g., Smith)',
        address: 'Enter street name or address',
        parcel: 'Enter parcel ID',
        acreage: 'Enter minimum acreage (e.g., 100)'
    };

    searchInput.placeholder = placeholders[searchType] || 'Enter search value';
}

async function searchProperty() {
    const searchType = document.getElementById('search-type').value;
    const searchValue = document.getElementById('search-input').value.trim();

    if (!searchValue) {
        alert('Please enter a search value');
        return;
    }

    // Try clerk records API first
    if (CLERK_API.enabled) {
        let apiSearchType = 'name';
        let additionalParams = {};

        if (searchType === 'owner') {
            apiSearchType = 'name';
        } else if (searchType === 'address' || searchType === 'parcel') {
            apiSearchType = 'property';
            if (searchType === 'parcel') {
                additionalParams.property_id = searchValue;
            } else {
                additionalParams.address = searchValue;
            }
        }

        const results = await searchClerkRecords(apiSearchType, searchValue, additionalParams);

        if (results && results.success) {
            displayClerkRecords(results.results, searchValue);
            return;
        }
    }

    // Fallback to manual search instructions
    const propertyInfo = document.getElementById('property-info');
    const propertyDetails = document.getElementById('property-details');

    let searchUrl = 'https://esearch.bosquecad.com/';
    let searchInstructions = '';

    switch (searchType) {
        case 'owner':
            searchInstructions = `Search for properties owned by: <strong>${searchValue}</strong>`;
            break;
        case 'address':
            searchInstructions = `Search for property at: <strong>${searchValue}</strong>`;
            break;
        case 'parcel':
            searchInstructions = `Search for parcel ID: <strong>${searchValue}</strong>`;
            break;
        case 'acreage':
            searchInstructions = `Filter for properties with minimum <strong>${searchValue} acres</strong>`;
            break;
    }

    propertyDetails.innerHTML = `
        <div style="padding: 20px; background: #f7fafc; border-radius: 8px; margin-top: 15px;">
            <h4 style="color: var(--primary); margin-bottom: 15px;">🔍 Property Search</h4>
            <p style="margin-bottom: 15px;">${searchInstructions}</p>

            <p style="margin-bottom: 15px; color: #666;">
                To access official Bosque County property records:
            </p>

            <ol style="margin-left: 20px; margin-bottom: 20px; line-height: 1.8;">
                <li>Visit the <a href="${searchUrl}" target="_blank" style="color: var(--primary); font-weight: 600;">Bosque County CAD site</a></li>
                <li>Select the "${searchType}" search tab</li>
                <li>Enter: "${searchValue}"</li>
                <li>View property details including:
                    <ul style="margin-left: 20px; margin-top: 5px;">
                        <li>Property value & assessed value</li>
                        <li>Legal description & acreage</li>
                        <li>Owner information</li>
                        <li>Improvement details</li>
                        <li>Tax information</li>
                    </ul>
                </li>
            </ol>

            <div style="background: #fff3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Note:</strong> All property information should be verified with the Bosque County Appraisal District for legal purposes.
            </div>

            <div style="margin-top: 20px; text-align: center;">
                <a href="${searchUrl}" target="_blank"
                   style="display: inline-block; padding: 12px 24px; background: var(--primary); color: white;
                          text-decoration: none; border-radius: 6px; font-weight: 600;">
                    🔗 Open Bosque County CAD
                </a>
            </div>
        </div>
    `;

    propertyInfo.classList.remove('hidden');
    propertyInfo.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// PARCEL DRAWING & MEASUREMENT FUNCTIONS
// ============================================================================

function startDrawingParcel() {
    if (!map) {
        alert('Please open the Map tab first');
        return;
    }

    // Activate polygon drawing
    const polygonDrawer = new L.Draw.Polygon(map, drawControl.options.draw.polygon);
    polygonDrawer.enable();

    alert('📏 Click on the map to draw parcel boundaries. Double-click to finish.');
}

function measureDistance() {
    if (!map) {
        alert('Please open the Map tab first');
        return;
    }

    // Activate polyline drawing for distance measurement
    const lineDrawer = new L.Draw.Polyline(map, drawControl.options.draw.polyline);
    lineDrawer.enable();

    alert('📍 Click on the map to measure distance. Double-click to finish.');
}

function clearDrawings() {
    if (!map || !drawnItems) return;

    drawnItems.clearLayers();
    currentDrawnParcel = null;
    document.getElementById('drawing-info').style.display = 'none';

    alert('✅ All drawings cleared');
}

function saveParcel() {
    if (!currentDrawnParcel) {
        alert('Please draw a parcel boundary first');
        return;
    }

    const acres = calculatePolygonAcres(currentDrawnParcel);
    const coordinates = currentDrawnParcel.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
    const center = currentDrawnParcel.getBounds().getCenter();

    const parcelName = prompt('Enter a name for this parcel:', 'Parcel ' + (getParcels().length + 1));
    if (!parcelName) return;

    const parcelData = {
        id: generateParcelId(),
        name: parcelName,
        acres: acres,
        sqft: acres * 43560,
        coordinates: coordinates,
        center: { lat: center.lat, lon: center.lng },
        inBosqueCounty: isInBosqueCounty(center.lat, center.lng),
        savedAt: new Date().toISOString(),
        notes: ''
    };

    // Get existing parcels
    const parcels = getParcels();
    parcels.push(parcelData);
    localStorage.setItem('eagle-parcels', JSON.stringify(parcels));

    // Add to parcel layer
    const polygon = L.polygon(coordinates, {
        color: '#f59e0b',
        fillOpacity: 0.3
    }).addTo(parcelLayer);

    polygon.bindPopup(createParcelPopup(parcelData));

    alert(`✅ Parcel "${parcelName}" saved! (${acres.toFixed(2)} acres)`);
}

function analyzeDrawnParcel() {
    if (!currentDrawnParcel) {
        alert('No parcel drawn');
        return;
    }

    const acres = calculatePolygonAcres(currentDrawnParcel);
    const center = currentDrawnParcel.getBounds().getCenter();

    // Set GPS to parcel center
    currentGPSData = {
        latitude: center.lat,
        longitude: center.lng,
        accuracy: 10,
        timestamp: new Date().toISOString()
    };

    const choice = confirm(`Analyze this ${acres.toFixed(2)}-acre parcel?\n\nClick OK for Solar Farm, Cancel for Data Center`);

    // Switch to appropriate tab with pre-filled data
    if (choice) {
        // Solar farm analysis
        document.getElementById('solar-acres').value = acres.toFixed(2);
        showTab('solar');
    } else {
        // Data center analysis
        showTab('datacenter');
    }

    map.closePopup();
}

function calculatePolygonAcres(layer) {
    const latlngs = layer.getLatLngs()[0];
    let area = 0;

    // Use spherical excess formula for better accuracy
    const R = 20902231; // Earth radius in feet

    for (let i = 0; i < latlngs.length; i++) {
        const j = (i + 1) % latlngs.length;
        const lat1 = latlngs[i].lat * Math.PI / 180;
        const lat2 = latlngs[j].lat * Math.PI / 180;
        const lon1 = latlngs[i].lng * Math.PI / 180;
        const lon2 = latlngs[j].lng * Math.PI / 180;

        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area * R * R / 2.0);
    return area / 43560; // Convert square feet to acres
}

function calculatePolylineDistance(layer) {
    const latlngs = layer.getLatLngs();
    let totalDistance = 0;

    for (let i = 0; i < latlngs.length - 1; i++) {
        totalDistance += calculateDistance(
            latlngs[i].lat,
            latlngs[i].lng,
            latlngs[i + 1].lat,
            latlngs[i + 1].lng
        );
    }

    return totalDistance;
}

// ============================================================================
// PROPERTY/PARCEL DATA MANAGEMENT
// ============================================================================

function getParcels() {
    const parcelsJSON = localStorage.getItem('eagle-parcels');
    return parcelsJSON ? JSON.parse(parcelsJSON) : [];
}

function generateParcelId() {
    return 'PARCEL-' + Date.now();
}

function loadParcels() {
    if (!map || !parcelLayer) return;

    parcelLayer.clearLayers();
    const parcels = getParcels();

    parcels.forEach(parcel => {
        if (!parcel.coordinates) return;

        const polygon = L.polygon(parcel.coordinates, {
            color: '#f59e0b',
            fillOpacity: 0.3,
            weight: 2
        }).addTo(parcelLayer);

        polygon.bindPopup(createParcelPopup(parcel));
    });
}

function createParcelPopup(parcel) {
    return `
        <div class="parcel-info-popup">
            <h4>📐 ${parcel.name}</h4>
            <div class="info-row">
                <div class="info-label">Area</div>
                <div class="info-value">${parcel.acres.toFixed(2)} acres</div>
            </div>
            <div class="info-row">
                <div class="info-label">Square Feet</div>
                <div class="info-value">${parcel.sqft.toLocaleString()} sq ft</div>
            </div>
            <div class="info-row">
                <div class="info-label">Location</div>
                <div class="info-value">${parcel.center.lat.toFixed(4)}°N, ${Math.abs(parcel.center.lon).toFixed(4)}°W</div>
            </div>
            <div class="info-row">
                <div class="info-label">Territory</div>
                <div class="info-value">${parcel.inBosqueCounty ? 'Bosque County' : 'Outside County'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Saved</div>
                <div class="info-value">${new Date(parcel.savedAt).toLocaleDateString()}</div>
            </div>
            ${parcel.owner ? `
            <div class="info-row">
                <div class="info-label">Owner</div>
                <div class="info-value">${parcel.owner}</div>
            </div>` : ''}
            ${parcel.parcelId ? `
            <div class="info-row">
                <div class="info-label">Parcel ID</div>
                <div class="info-value">${parcel.parcelId}</div>
            </div>` : ''}
        </div>
    `;
}

// ============================================================================
// CAD DATA SCRAPER & INTEGRATION
// ============================================================================

async function scrapeCADProperty(searchType, searchValue) {
    // Attempt to scrape property data from Bosque CAD
    // Note: This will likely fail due to CORS restrictions
    // In production, this would need a server-side proxy

    const cadUrl = 'https://esearch.bosquecad.com/';

    try {
        // Try direct fetch (will likely fail due to CORS)
        const response = await fetch(cadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                searchType: searchType,
                searchValue: searchValue
            })
        });

        if (!response.ok) {
            throw new Error('CAD site returned error');
        }

        const html = await response.text();
        return parseCADResponse(html);

    } catch (error) {
        console.log('CAD scraping failed (expected due to CORS):', error);

        // Fallback: Show manual input form
        showManualPropertyInput(searchType, searchValue);
        return null;
    }
}

function parseCADResponse(html) {
    // Parse HTML response from CAD site to extract property data
    // This would need to be customized based on the actual CAD site structure

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract property data (customize selectors based on actual site)
    const propertyData = {
        owner: doc.querySelector('.owner')?.textContent || '',
        parcelId: doc.querySelector('.parcel-id')?.textContent || '',
        address: doc.querySelector('.address')?.textContent || '',
        acres: parseFloat(doc.querySelector('.acreage')?.textContent) || 0,
        value: doc.querySelector('.assessed-value')?.textContent || '',
        legalDescription: doc.querySelector('.legal-desc')?.textContent || ''
    };

    return propertyData;
}

function showManualPropertyInput(searchType, searchValue) {
    const propertyDetails = document.getElementById('property-details');

    propertyDetails.innerHTML = `
        <div style="padding: 20px; background: #f7fafc; border-radius: 8px;">
            <h4 style="color: var(--primary); margin-bottom: 15px;">📝 Manual Property Data Entry</h4>
            <p style="margin-bottom: 15px; color: #666;">
                Direct CAD scraping is restricted. Please manually enter property data from
                <a href="https://esearch.bosquecad.com/" target="_blank" style="color: var(--primary); font-weight: 600;">Bosque County CAD</a>.
            </p>

            <div class="form-grid">
                <div class="form-group">
                    <label>Owner Name</label>
                    <input type="text" id="manual-owner" placeholder="Property owner">
                </div>
                <div class="form-group">
                    <label>Parcel ID</label>
                    <input type="text" id="manual-parcel-id" placeholder="CAD parcel ID">
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="manual-address" placeholder="Property address">
                </div>
                <div class="form-group">
                    <label>Acreage</label>
                    <input type="number" id="manual-acres" placeholder="0.00" step="0.01">
                </div>
                <div class="form-group">
                    <label>Assessed Value</label>
                    <input type="text" id="manual-value" placeholder="$0">
                </div>
                <div class="form-group">
                    <label>Legal Description</label>
                    <textarea id="manual-legal" placeholder="Legal description" rows="3"></textarea>
                </div>
            </div>

            <div style="margin-top: 20px;">
                <button onclick="saveManualPropertyData()"
                        style="padding: 12px 24px; background: var(--primary); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    💾 Save Property Data & Draw on Map
                </button>
            </div>
        </div>
    `;

    document.getElementById('property-info').classList.remove('hidden');
}

function saveManualPropertyData() {
    const propertyData = {
        id: 'PROP-' + Date.now(),
        owner: document.getElementById('manual-owner').value,
        parcelId: document.getElementById('manual-parcel-id').value,
        address: document.getElementById('manual-address').value,
        acres: parseFloat(document.getElementById('manual-acres').value) || 0,
        value: document.getElementById('manual-value').value,
        legalDescription: document.getElementById('manual-legal').value,
        savedAt: new Date().toISOString()
    };

    if (!propertyData.owner && !propertyData.parcelId) {
        alert('Please enter at least Owner Name or Parcel ID');
        return;
    }

    // Save to localStorage
    const properties = getProperties();
    properties.push(propertyData);
    localStorage.setItem('eagle-properties', JSON.stringify(properties));

    alert(`✅ Property data saved!\n\nNow use the "📏 Draw Parcel Boundary" tool to outline this property on the map.`);

    // Enable drawing mode
    setTimeout(() => {
        startDrawingParcel();
    }, 500);
}

function getProperties() {
    const propsJSON = localStorage.getItem('eagle-properties');
    return propsJSON ? JSON.parse(propsJSON) : [];
}

// ============================================================================
// CLERK RECORDS CLIENT-SIDE SCRAPING
// ============================================================================

async function searchClerkRecords(searchType, searchValue, additionalParams = {}) {
    /**
     * Search Bosque County clerk records via client-side scraping
     *
     * @param searchType - 'name', 'property', or 'date'
     * @param searchValue - Search value (name, property_id, or date range)
     * @param additionalParams - Additional parameters (type, address, etc.)
     */

    if (!CLERK_CONFIG.enabled) {
        console.log('Clerk scraping is disabled');
        showClerkFallbackMessage();
        return null;
    }

    // Show loading indicator
    showSearchingMessage(searchValue);

    try {
        // Try direct scraping first (will likely fail due to CORS)
        let results = await scrapeDirectly(searchType, searchValue, additionalParams);

        if (!results || results.length === 0) {
            // Try with CORS proxy
            results = await scrapeWithProxy(searchType, searchValue, additionalParams);
        }

        return {
            success: true,
            count: results ? results.length : 0,
            results: results || [],
            query: { searchType, searchValue, ...additionalParams }
        };

    } catch (error) {
        console.error('Clerk records search error:', error);

        // Fall back to manual instructions
        return {
            success: false,
            error: error.message,
            results: []
        };
    }
}

async function scrapeDirectly(searchType, searchValue, additionalParams) {
    /**
     * Attempt direct scraping without proxy (will likely fail due to CORS)
     */
    try {
        const url = buildSearchURL(searchType, searchValue, additionalParams);

        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            signal: AbortSignal.timeout(CLERK_CONFIG.timeout)
        });

        if (response.ok) {
            const html = await response.text();
            return parseClerkHTML(html, searchType);
        }
    } catch (error) {
        console.log('Direct scraping failed (expected):', error.message);
    }

    return null;
}

async function scrapeWithProxy(searchType, searchValue, additionalParams) {
    /**
     * Scrape using CORS proxy services
     */
    const url = buildSearchURL(searchType, searchValue, additionalParams);

    // Try each proxy in sequence
    for (let i = 0; i < CLERK_CONFIG.corsProxies.length; i++) {
        const proxyIndex = (CLERK_CONFIG.currentProxyIndex + i) % CLERK_CONFIG.corsProxies.length;
        const proxy = CLERK_CONFIG.corsProxies[proxyIndex];

        try {
            console.log(`Trying proxy ${proxyIndex + 1}:`, proxy);

            const proxyUrl = proxy + encodeURIComponent(url);

            const response = await fetch(proxyUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(CLERK_CONFIG.timeout)
            });

            if (response.ok) {
                const html = await response.text();
                const results = parseClerkHTML(html, searchType);

                if (results && results.length > 0) {
                    // Update current proxy index for next search
                    CLERK_CONFIG.currentProxyIndex = proxyIndex;
                    console.log(`✅ Successfully scraped via proxy ${proxyIndex + 1}`);
                    return results;
                }
            }
        } catch (error) {
            console.log(`Proxy ${proxyIndex + 1} failed:`, error.message);
            continue;
        }
    }

    console.log('All proxies failed, returning empty results');
    return [];
}

function buildSearchURL(searchType, searchValue, additionalParams) {
    /**
     * Build search URL for clerk records site
     */

    // For now, using Bosque CAD as primary source
    const baseUrl = CLERK_CONFIG.sources.bosquecad;

    // Build query parameters
    const params = new URLSearchParams();

    if (searchType === 'name') {
        params.append('search', searchValue);
        params.append('searchType', 'owner');
    } else if (searchType === 'property') {
        if (additionalParams.property_id) {
            params.append('search', additionalParams.property_id);
            params.append('searchType', 'parcel');
        } else if (additionalParams.address) {
            params.append('search', additionalParams.address);
            params.append('searchType', 'address');
        }
    }

    return baseUrl + (params.toString() ? '?' + params.toString() : '');
}

function parseClerkHTML(html, searchType) {
    /**
     * Parse HTML from clerk records site
     */
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const results = [];

        // Try multiple selectors for different site structures
        const recordSelectors = [
            '.property-record',
            '.search-result',
            'tr.data-row',
            '.record-item',
            'table tbody tr'
        ];

        for (const selector of recordSelectors) {
            const records = doc.querySelectorAll(selector);

            if (records.length > 0) {
                records.forEach((record, index) => {
                    if (index >= 50) return; // Limit to 50 results

                    const parsed = parseRecordElement(record);
                    if (parsed && parsed.id) {
                        results.push(parsed);
                    }
                });

                if (results.length > 0) {
                    break;
                }
            }
        }

        // If no structured results, try to extract any property/parcel info
        if (results.length === 0) {
            const textResults = extractFromText(doc);
            results.push(...textResults);
        }

        return results;
    } catch (error) {
        console.error('HTML parsing error:', error);
        return [];
    }
}

function parseRecordElement(element) {
    /**
     * Parse a single record element
     */
    try {
        // Try to extract common fields
        const record = {
            id: extractText(element, ['data-id', 'id']) || 'REC-' + Date.now(),
            source: 'Bosque County',
            document_type: extractText(element, ['.doc-type', '.type', 'td:nth-child(1)']),
            instrument_number: extractText(element, ['.instrument', '.doc-number', 'td:nth-child(2)']),
            filed_date: extractText(element, ['.filed-date', '.date', 'td:nth-child(3)']),
            grantor: extractText(element, ['.grantor', '.from', 'td:nth-child(4)']),
            grantee: extractText(element, ['.grantee', '.to', 'td:nth-child(5)']),
            legal_description: extractText(element, ['.legal-desc', '.description', 'td:nth-child(6)']),
            volume: extractText(element, ['.volume', 'td:nth-child(7)']),
            page: extractText(element, ['.page', 'td:nth-child(8)'])
        };

        // Only return if we have at least some data
        if (record.document_type || record.grantor || record.grantee) {
            return record;
        }
    } catch (error) {
        console.error('Record parsing error:', error);
    }

    return null;
}

function extractText(element, selectors) {
    /**
     * Extract text from element using multiple selector attempts
     */
    if (!element) return '';

    // If selectors is an attribute name
    if (typeof selectors === 'string' && selectors.startsWith('data-')) {
        return element.getAttribute(selectors) || '';
    }

    // Try each selector
    for (const selector of selectors) {
        try {
            if (selector.startsWith('.') || selector.startsWith('[') || selector.includes(':')) {
                const found = element.querySelector(selector);
                if (found && found.textContent) {
                    return found.textContent.trim();
                }
            } else if (selector === 'id') {
                return element.id || '';
            }
        } catch (e) {
            continue;
        }
    }

    return '';
}

function extractFromText(doc) {
    /**
     * Extract property information from page text when no structured data
     */
    const results = [];
    const bodyText = doc.body ? doc.body.textContent : '';

    // Look for patterns in text
    const parcelPattern = /Parcel[:\s]+([A-Z0-9-]+)/gi;
    const ownerPattern = /Owner[:\s]+([A-Za-z\s,]+)/gi;
    const acreagePattern = /(\d+\.?\d*)\s*acres?/gi;

    let match;
    const foundParcels = new Set();

    while ((match = parcelPattern.exec(bodyText)) !== null) {
        const parcelId = match[1].trim();
        if (!foundParcels.has(parcelId)) {
            foundParcels.add(parcelId);

            results.push({
                id: 'PARCEL-' + parcelId,
                source: 'Bosque County CAD',
                document_type: 'Property Record',
                instrument_number: parcelId,
                filed_date: '',
                grantor: '',
                grantee: '',
                legal_description: `Parcel ID: ${parcelId}`,
                volume: '',
                page: ''
            });
        }
    }

    return results;
}

function showSearchingMessage(searchValue) {
    /**
     * Show loading message while searching
     */
    const propertyInfo = document.getElementById('property-info');
    const propertyDetails = document.getElementById('property-details');

    if (propertyDetails) {
        propertyDetails.innerHTML = `
            <div style="padding: 30px; background: #f7fafc; border-radius: 8px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                <h4 style="color: var(--primary); margin-bottom: 10px;">Searching Clerk Records...</h4>
                <p style="color: #666;">Searching for: <strong>${searchValue}</strong></p>
                <p style="color: #999; font-size: 14px; margin-top: 10px;">
                    Using CORS proxies to access Bosque County records
                </p>
            </div>
        `;
        propertyInfo.classList.remove('hidden');
        propertyInfo.scrollIntoView({ behavior: 'smooth' });
    }
}

function showClerkFallbackMessage() {
    /**
     * Show message when scraping is disabled
     */
    const message = `
        <div style="padding: 20px; background: #e6f2ff; border-radius: 8px; border-left: 4px solid var(--primary);">
            <h4 style="color: var(--primary); margin-bottom: 10px;">📋 Clerk Records Search</h4>
            <p style="color: #666; margin-bottom: 15px;">
                Client-side scraping is currently disabled. Visit the official sites below to search manually:
            </p>
            <ul style="margin-left: 20px; color: #666; line-height: 1.8;">
                <li><a href="https://esearch.bosquecad.com/" target="_blank" style="color: var(--primary); font-weight: 600;">Bosque County CAD</a> - Property search</li>
                <li><a href="https://www.texasfile.com/" target="_blank" style="color: var(--primary); font-weight: 600;">TexasFile</a> - Official deed records</li>
                <li><a href="https://kofilequicklinks.com/Bosque/" target="_blank" style="color: var(--primary); font-weight: 600;">KoFile</a> - Historical records</li>
            </ul>
        </div>
    `;

    const propertyInfo = document.getElementById('property-info');
    const propertyDetails = document.getElementById('property-details');

    if (propertyDetails) {
        propertyDetails.innerHTML = message;
        propertyInfo.classList.remove('hidden');
    }
}

async function getClerkDocument(documentId, source) {
    /**
     * View document on official site (opens in new tab)
     */
    let url = '';

    if (source === 'TexasFile' || source === 'texasfile') {
        url = `https://www.texasfile.com/document/${documentId}`;
    } else if (source === 'KoFile' || source === 'kofile') {
        url = `https://kofilequicklinks.com/Bosque/document/${documentId}`;
    } else {
        url = `https://esearch.bosquecad.com/property/${documentId}`;
    }

    window.open(url, '_blank');
    return { viewed: true, url };
}

function displayClerkRecords(results, searchQuery) {
    /**
     * Display clerk records search results on the page
     */

    const propertyInfo = document.getElementById('property-info');
    const propertyDetails = document.getElementById('property-details');

    if (!results || results.length === 0) {
        propertyDetails.innerHTML = `
            <div style="padding: 20px; background: #f7fafc; border-radius: 8px;">
                <h4 style="color: var(--primary); margin-bottom: 15px;">📋 No Records Found</h4>
                <p style="color: #666;">
                    No clerk records were found for: <strong>${searchQuery}</strong>
                </p>
                <p style="color: #666; margin-top: 10px;">
                    Try searching with different terms or visit the
                    <a href="https://www.texasfile.com/" target="_blank" style="color: var(--primary); font-weight: 600;">
                        official clerk records portal
                    </a>.
                </p>
            </div>
        `;
        propertyInfo.classList.remove('hidden');
        return;
    }

    let html = `
        <div style="padding: 20px; background: #f7fafc; border-radius: 8px;">
            <h4 style="color: var(--primary); margin-bottom: 15px;">
                📋 Clerk Records Found: ${results.length} ${results.length === 1 ? 'Record' : 'Records'}
            </h4>
            <p style="color: #666; margin-bottom: 20px;">
                Search: <strong>${searchQuery}</strong>
            </p>
    `;

    results.forEach((record, index) => {
        html += `
            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <strong style="color: var(--primary); font-size: 16px;">
                        ${record.document_type || 'Document'} #${record.instrument_number || record.id}
                    </strong>
                    <span style="background: #e6f2ff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                        ${record.source || 'Bosque County'}
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px;">
                    ${record.filed_date ? `
                    <div>
                        <div style="font-size: 12px; color: #666; font-weight: 600;">Filed Date</div>
                        <div style="color: #2d3748;">${record.filed_date}</div>
                    </div>` : ''}

                    ${record.grantor ? `
                    <div>
                        <div style="font-size: 12px; color: #666; font-weight: 600;">Grantor</div>
                        <div style="color: #2d3748;">${record.grantor}</div>
                    </div>` : ''}

                    ${record.grantee ? `
                    <div>
                        <div style="font-size: 12px; color: #666; font-weight: 600;">Grantee</div>
                        <div style="color: #2d3748;">${record.grantee}</div>
                    </div>` : ''}

                    ${record.volume && record.page ? `
                    <div>
                        <div style="font-size: 12px; color: #666; font-weight: 600;">Volume/Page</div>
                        <div style="color: #2d3748;">Vol ${record.volume}, Pg ${record.page}</div>
                    </div>` : ''}
                </div>

                ${record.legal_description ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 12px; color: #666; font-weight: 600; margin-bottom: 5px;">Legal Description</div>
                    <div style="color: #2d3748; font-size: 14px;">${record.legal_description}</div>
                </div>` : ''}

                <button onclick="viewClerkDocument('${record.id || record.instrument_number}', '${record.source || 'texasfile'}')"
                        style="margin-top: 10px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                    📄 View Full Document
                </button>
            </div>
        `;
    });

    html += '</div>';

    propertyDetails.innerHTML = html;
    propertyInfo.classList.remove('hidden');
    propertyInfo.scrollIntoView({ behavior: 'smooth' });
}

async function viewClerkDocument(documentId, source) {
    /**
     * View full clerk document details
     */

    const document = await getClerkDocument(documentId, source);

    if (!document) {
        return;
    }

    // Display document details in a modal or expanded view
    alert(`Document ${documentId} retrieved. Full document viewer would display here.`);
}

// ============================================================================
// CYRUSONE INTELLIGENCE SYSTEM
// ============================================================================

// CyrusOne Authentication
const CYRUSONE_PASSWORD = 'cia';
const CYRUSONE_AUTH_KEY = 'cyrusone_authenticated';
let cyrusOneMap = null;
let cyrusOneFacilities = [];

// Handle CyrusOne login
function handleCyrusOneLogin(event) {
    event.preventDefault();

    const password = document.getElementById('cyrusonePasswordInput').value;
    const errorDiv = document.getElementById('cyrusoneLoginError');

    if (password === CYRUSONE_PASSWORD) {
        // Correct password
        sessionStorage.setItem(CYRUSONE_AUTH_KEY, 'true');
        document.getElementById('cyrusone-login-overlay').style.display = 'none';
        document.getElementById('cyrusone-content').classList.remove('hidden');
        errorDiv.classList.remove('show');

        // Initialize CyrusOne system
        initializeCyrusOneSystem();
    } else {
        // Incorrect password
        errorDiv.classList.add('show');
        document.getElementById('cyrusonePasswordInput').value = '';
        document.getElementById('cyrusonePasswordInput').focus();

        // Remove error after animation
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 3000);
    }
}

// Logout from CyrusOne
function logoutCyrusOne() {
    sessionStorage.removeItem(CYRUSONE_AUTH_KEY);
    document.getElementById('cyrusone-login-overlay').style.display = 'flex';
    document.getElementById('cyrusone-content').classList.add('hidden');
    document.getElementById('cyrusonePasswordInput').value = '';
}

// Check CyrusOne authentication when tab is shown
function checkCyrusOneAuth() {
    const isAuthenticated = sessionStorage.getItem(CYRUSONE_AUTH_KEY) === 'true';

    if (isAuthenticated) {
        document.getElementById('cyrusone-login-overlay').style.display = 'none';
        document.getElementById('cyrusone-content').classList.remove('hidden');
        initializeCyrusOneSystem();
    } else {
        document.getElementById('cyrusone-login-overlay').style.display = 'flex';
        document.getElementById('cyrusone-content').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('cyrusonePasswordInput')?.focus();
        }, 100);
    }
}

// Initialize CyrusOne system
function initializeCyrusOneSystem() {
    loadCyrusOneFacilities();
    updateCyrusOneStats();
}

// Show CyrusOne section
function showCyrusSection(section) {
    // Hide all sections
    document.querySelectorAll('.cyrus-section').forEach(sec => {
        sec.classList.add('hidden');
    });

    // Remove active from all buttons
    document.querySelectorAll('[id^="cyrus-btn-"]').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });

    // Show selected section
    document.getElementById(`cyrus-section-${section}`).classList.remove('hidden');

    // Activate button
    document.getElementById(`cyrus-btn-${section}`).classList.remove('btn-secondary');
    document.getElementById(`cyrus-btn-${section}`).classList.add('btn-primary');

    // Initialize map if map section
    if (section === 'map') {
        setTimeout(() => initializeCyrusOneMap(), 100);
    }
}

// Data Storage Functions
function getCyrusOneFacilities() {
    const facilitiesJSON = localStorage.getItem('cyrusone-facilities');
    return facilitiesJSON ? JSON.parse(facilitiesJSON) : [];
}

function saveCyrusOneFacility(facility) {
    const facilities = getCyrusOneFacilities();
    facility.id = facility.id || 'CYRUS-' + Date.now();
    facility.addedAt = facility.addedAt || new Date().toISOString();
    facilities.push(facility);
    localStorage.setItem('cyrusone-facilities', JSON.stringify(facilities));
    loadCyrusOneFacilities();
    updateCyrusOneStats();
    return facility;
}

function loadCyrusOneFacilities() {
    cyrusOneFacilities = getCyrusOneFacilities();
    displayCyrusOneFacilities();
}

function displayCyrusOneFacilities() {
    const listDiv = document.getElementById('cyrus-facility-list');

    if (cyrusOneFacilities.length === 0) {
        listDiv.innerHTML = `
            <p style="text-align: center; color: #666; padding: 40px;">
                No facilities tracked yet. Use the search tools above to discover CyrusOne facilities across Texas.
            </p>
        `;
        return;
    }

    let html = '';
    cyrusOneFacilities.forEach(facility => {
        const statusColors = {
            'filing': '#3b82f6',
            'construction': '#f59e0b',
            'operational': '#10b981'
        };
        const statusColor = statusColors[facility.status] || '#6b7280';

        html += `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid ${statusColor};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <strong style="color: var(--primary); font-size: 16px;">${facility.name}</strong>
                        <div style="font-size: 13px; color: #666; margin-top: 4px;">
                            ${facility.county} County, Texas
                        </div>
                    </div>
                    <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                        ${(facility.status || 'unknown').toUpperCase()}
                    </span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
                    ${facility.acres ? `
                    <div>
                        <div style="font-size: 11px; color: #666;">Acreage</div>
                        <div style="font-weight: 600;">${facility.acres} acres</div>
                    </div>` : ''}
                    ${facility.powerMW ? `
                    <div>
                        <div style="font-size: 11px; color: #666;">Power</div>
                        <div style="font-weight: 600;">${facility.powerMW} MW</div>
                    </div>` : ''}
                    ${facility.taxAbatement ? `
                    <div>
                        <div style="font-size: 11px; color: #666;">Tax Abatement</div>
                        <div style="font-weight: 600; color: #ef4444;">$${facility.taxAbatement.toLocaleString()}</div>
                    </div>` : ''}
                </div>

                <button onclick="viewFacilityDetails('${facility.id}')" style="margin-top: 10px; padding: 6px 12px; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                    View Details
                </button>
            </div>
        `;
    });

    listDiv.innerHTML = html;
}

function updateCyrusOneStats() {
    const facilities = getCyrusOneFacilities();

    const totalFacilities = facilities.length;
    const totalMW = facilities.reduce((sum, f) => sum + (f.powerMW || 0), 0);
    const totalAbatements = facilities.reduce((sum, f) => sum + (f.taxAbatement || 0), 0);
    const uniqueCounties = new Set(facilities.map(f => f.county)).size;

    document.getElementById('cyrus-total-facilities').textContent = totalFacilities;
    document.getElementById('cyrus-total-mw').textContent = totalMW.toFixed(1) + ' MW';
    document.getElementById('cyrus-total-abatements').textContent = '$' + totalAbatements.toLocaleString();
    document.getElementById('cyrus-total-counties').textContent = uniqueCounties;

    // Update financials section
    const totalValue = facilities.reduce((sum, f) => sum + (f.appraisedValue || 0), 0);
    const taxableValue = facilities.reduce((sum, f) => sum + (f.taxableValue || 0), 0);
    const annualSavings = facilities.reduce((sum, f) => sum + (f.taxAbatement || 0), 0);

    document.getElementById('fin-total-value').textContent = '$' + totalValue.toLocaleString();
    document.getElementById('fin-taxable-value').textContent = '$' + taxableValue.toLocaleString();
    document.getElementById('fin-annual-savings').textContent = '$' + annualSavings.toLocaleString();
    document.getElementById('fin-10year-savings').textContent = '$' + (annualSavings * 10).toLocaleString();
}

function viewFacilityDetails(facilityId) {
    const facility = cyrusOneFacilities.find(f => f.id === facilityId);
    if (!facility) return;

    const details = `
FACILITY DETAILS

Name: ${facility.name}
County: ${facility.county} County, Texas
Status: ${(facility.status || 'Unknown').toUpperCase()}

Property Information:
- Acreage: ${facility.acres || 'Unknown'} acres
- Power Capacity: ${facility.powerMW || 'Unknown'} MW
- Construction Start: ${facility.constructionStart || 'Unknown'}
- Construction End: ${facility.constructionEnd || 'Unknown'}

Financial Data:
- Appraised Value: $${(facility.appraisedValue || 0).toLocaleString()}
- Taxable Value: $${(facility.taxableValue || 0).toLocaleString()}
- Tax Abatement: $${(facility.taxAbatement || 0).toLocaleString()}/year
- Abatement %: ${facility.abatementPercent || 0}%

${facility.notes ? 'Notes:\n' + facility.notes : ''}

Added: ${new Date(facility.addedAt).toLocaleDateString()}
    `;

    alert(details);
}

// Quick Action Functions
function startTCEQScraper() {
    showCyrusSection('tceq');
}

function startCADSearch() {
    showCyrusSection('cad');
}

function addNewFacility() {
    const name = prompt('Enter facility name:', 'CyrusOne [County] Data Center');
    if (!name) return;

    const county = prompt('Enter county:', 'Bosque');
    if (!county) return;

    const acres = parseFloat(prompt('Enter acreage:', '74'));
    const powerMW = parseFloat(prompt('Enter power capacity (MW):', '100'));

    const facility = {
        name: name,
        county: county,
        acres: acres || 0,
        powerMW: powerMW || 0,
        status: 'filing',
        constructionStart: '',
        constructionEnd: '',
        appraisedValue: 0,
        taxableValue: 0,
        taxAbatement: 0,
        abatementPercent: 0,
        notes: ''
    };

    saveCyrusOneFacility(facility);
    alert(`✅ Facility "${name}" added to tracking system!`);
}

function generateReport() {
    const facilities = getCyrusOneFacilities();

    if (facilities.length === 0) {
        alert('No facilities to export. Add facilities first.');
        return;
    }

    // Generate CSV report
    let csv = 'Facility Name,County,Status,Acres,Power (MW),Appraised Value,Taxable Value,Tax Abatement,Abatement %,Construction Start,Construction End,Notes\n';

    facilities.forEach(f => {
        csv += `"${f.name}","${f.county}","${f.status}",${f.acres || 0},${f.powerMW || 0},${f.appraisedValue || 0},${f.taxableValue || 0},${f.taxAbatement || 0},${f.abatementPercent || 0},"${f.constructionStart || ''}","${f.constructionEnd || '"}","${f.notes || ''}"\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyrusone_intelligence_report_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    alert('✅ Report exported successfully!');
}

// TCEQ Permit Search
function searchTCEQPermits() {
    const entityName = document.getElementById('tceq-entity-name').value;
    const permitType = document.getElementById('tceq-permit-type').value;

    const resultsDiv = document.getElementById('tceq-results');
    const contentDiv = document.getElementById('tceq-results-content');

    contentDiv.innerHTML = `
        <div style="padding: 20px; background: #f7fafc; border-radius: 8px;">
            <h4 style="color: var(--primary); margin-bottom: 15px;">🔍 TCEQ Permit Search</h4>
            <p style="color: #666; margin-bottom: 15px;">
                Searching for: <strong>${entityName}</strong> | Permit Type: <strong>${permitType}</strong>
            </p>

            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 15px;">
                <strong>⚠️ Manual Search Required</strong><br>
                Due to website restrictions, please search the TCEQ database manually:
            </div>

            <ol style="margin-left: 20px; line-height: 1.8; color: #666;">
                <li>Visit the <a href="https://www15.tceq.texas.gov/crpub/" target="_blank" style="color: var(--primary); font-weight: 600;">TCEQ Public Records Portal</a></li>
                <li>Search by entity name: "${entityName}"</li>
                <li>Filter by permit type${permitType !== 'all' ? `: ${permitType}` : ''}</li>
                <li>Look for construction permits with:
                    <ul style="margin-top: 5px;">
                        <li>Facility location (lat/long)</li>
                        <li>Acreage disturbed</li>
                        <li>Construction timeline</li>
                        <li>Property descriptions</li>
                    </ul>
                </li>
                <li>Return here and use "Add Facility" to manually enter discovered facilities</li>
            </ol>

            <div style="margin-top: 20px; text-align: center;">
                <a href="https://www15.tceq.texas.gov/crpub/" target="_blank" style="display: inline-block; padding: 12px 24px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    🔗 Open TCEQ Database
                </a>
            </div>
        </div>
    `;

    resultsDiv.classList.remove('hidden');
}

// County CAD Search
function searchCAD() {
    const county = document.getElementById('cad-county').value;
    const owner = document.getElementById('cad-owner').value;

    const resultsDiv = document.getElementById('cad-results');
    const contentDiv = document.getElementById('cad-results-content');

    const cadUrls = {
        'Bosque': 'https://esearch.bosquecad.com/',
        'Hill': 'https://propaccess.hillcad.org/',
        'McLennan': 'https://esearch.mcad.org/',
        'Hays': 'https://esearch.hayscad.com/',
        'Williamson': 'https://propaccess.wilcad.org/',
        'Collin': 'https://www.collincad.org/',
        'Denton': 'https://esearch.dentoncad.com/',
        'Tarrant': 'https://www.tad.org/'
    };

    const cadUrl = cadUrls[county] || 'https://esearch.bosquecad.com/';

    contentDiv.innerHTML = `
        <div style="padding: 20px; background: #f7fafc; border-radius: 8px;">
            <h4 style="color: var(--primary); margin-bottom: 15px;">🏛️ ${county} County CAD Search</h4>
            <p style="color: #666; margin-bottom: 15px;">
                Searching for: <strong>${owner}</strong> in <strong>${county} County</strong>
            </p>

            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-bottom: 15px;">
                <strong>⚠️ Manual Search Required</strong><br>
                Property records require direct access to the county appraisal district website.
            </div>

            <ol style="margin-left: 20px; line-height: 1.8; color: #666;">
                <li>Visit the <a href="${cadUrl}" target="_blank" style="color: var(--primary); font-weight: 600;">${county} County CAD website</a></li>
                <li>Search by owner name: "${owner}"</li>
                <li>Look for properties with:
                    <ul style="margin-top: 5px;">
                        <li>Account numbers</li>
                        <li>Legal descriptions</li>
                        <li>Appraised values</li>
                        <li>Taxable values (check for abatements)</li>
                        <li>Historical value data (5+ years)</li>
                        <li>School district boundaries</li>
                    </ul>
                </li>
                <li>Record any tax abatements (zero or reduced taxable value)</li>
                <li>Use "Add Facility" to manually enter property data</li>
            </ol>

            <div style="margin-top: 20px; text-align: center;">
                <a href="${cadUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                    🔗 Open ${county} County CAD
                </a>
            </div>
        </div>
    `;

    resultsDiv.classList.remove('hidden');
}

// Bosque County Investigation
function searchBosqueRecords() {
    const searchType = document.getElementById('bosque-search-type').value;

    const resultsDiv = document.getElementById('bosque-results');

    const urls = {
        'property': 'https://esearch.bosquecad.com/',
        'court': 'https://www.co.bosque.tx.us/page/bosque.Commissioners.Court',
        'school': 'https://www.cliftonisd.net/board',
        'abatement': 'https://www.co.bosque.tx.us/page/bosque.Economic.Development'
    };

    const searchUrl = urls[searchType] || urls['property'];
    const searchTitle = {
        'property': 'Property Records',
        'court': 'Commissioners Court Minutes',
        'school': 'Clifton ISD Board Minutes',
        'abatement': 'Tax Abatement Agreements'
    }[searchType];

    resultsDiv.innerHTML = `
        <div class="results" style="margin-top: 20px;">
            <h4>🔍 ${searchTitle} Search</h4>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-top: 15px;">
                <p style="color: #666; margin-bottom: 15px;">
                    Search ${searchTitle.toLowerCase()} for CyrusOne Bosque County facility information.
                </p>

                <div style="background: #e6f2ff; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <strong>📍 Facility Location:</strong> NEC of FM 56 and CR 3610A, Whitney, TX<br>
                    <strong>📏 Size:</strong> 74 acres<br>
                    <strong>🏗️ Construction:</strong> October 2024 - October 2027<br>
                    <strong>🏢 Entities:</strong> Bosque Parcel 2 LLC, CyrusOne Inc., Calpine Real Estate
                </div>

                <div style="margin-top: 20px; text-align: center;">
                    <a href="${searchUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
                        🔗 Search ${searchTitle}
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Initialize CyrusOne Map
function initializeCyrusOneMap() {
    if (cyrusOneMap) {
        cyrusOneMap.invalidateSize();
        return;
    }

    const mapDiv = document.getElementById('cyrus-map');
    if (!mapDiv) return;

    // Create map centered on Texas
    cyrusOneMap = L.map('cyrus-map').setView([31.5, -99.5], 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(cyrusOneMap);

    // Add facilities to map
    const facilities = getCyrusOneFacilities();

    facilities.forEach(facility => {
        if (!facility.latitude || !facility.longitude) return;

        const statusColors = {
            'filing': '#3b82f6',
            'construction': '#f59e0b',
            'operational': '#10b981'
        };
        const color = statusColors[facility.status] || '#6b7280';

        const marker = L.circleMarker([facility.latitude, facility.longitude], {
            radius: 10,
            fillColor: color,
            color: facility.taxAbatement > 0 ? '#ef4444' : 'white',
            weight: facility.taxAbatement > 0 ? 3 : 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(cyrusOneMap);

        marker.bindPopup(`
            <div style="min-width: 200px;">
                <strong style="color: var(--primary);">${facility.name}</strong><br>
                <strong>County:</strong> ${facility.county}<br>
                <strong>Status:</strong> ${(facility.status || 'Unknown').toUpperCase()}<br>
                <strong>Acres:</strong> ${facility.acres || 'Unknown'}<br>
                <strong>Power:</strong> ${facility.powerMW || 'Unknown'} MW<br>
                ${facility.taxAbatement > 0 ? `<strong style="color: #ef4444;">Tax Abatement:</strong> $${facility.taxAbatement.toLocaleString()}/year<br>` : ''}
            </div>
        `);
    });
}

// Override showTab to check CyrusOne auth
const originalShowTab = showTab;
showTab = function(tabName) {
    originalShowTab(tabName);

    // Check auth when CyrusOne tab is shown
    if (tabName === 'cyrusone') {
        checkCyrusOneAuth();
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Load sites on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🦅 EAGLE - Energy Infrastructure Intelligence loaded');
    console.log('HH Holdings / Bevans Real Estate | Bosque County, Texas');
    console.log('🏢 CyrusOne Intelligence Module loaded');
});
