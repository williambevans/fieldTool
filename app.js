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
// INITIALIZATION
// ============================================================================

// Load sites on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🦅 EAGLE - Energy Infrastructure Intelligence loaded');
    console.log('HH Holdings / Bevans Real Estate | Bosque County, Texas');
});
