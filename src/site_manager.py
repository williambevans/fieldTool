#!/usr/bin/env python3
"""
HH Holdings Energy Intel - Site Data Manager
Manage JSON database of analyzed sites

Author: Bevans Real Estate / HH Holdings
Location: Bosque County, Texas
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path


class SiteManager:
    """Manage site database and JSON storage"""

    def __init__(self, data_dir: str = None):
        """
        Initialize site manager

        Args:
            data_dir: Directory for data storage (default: ~/storage/shared/EnergyIntel/)
        """
        if data_dir:
            self.data_dir = Path(data_dir)
        else:
            # Default Termux shared storage location
            home = Path.home()
            self.data_dir = home / 'storage' / 'shared' / 'EnergyIntel'

        # Ensure directory exists
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Main database file
        self.db_file = self.data_dir / 'hh_holdings_sites.json'

        # Initialize database if it doesn't exist
        if not self.db_file.exists():
            self._initialize_database()

    def _initialize_database(self):
        """Create initial database structure"""
        initial_data = {
            'metadata': {
                'created': datetime.now().isoformat(),
                'version': '1.0',
                'owner': 'HH Holdings / Bevans Real Estate',
                'location': 'Bosque County, Texas'
            },
            'sites': []
        }
        self._save_database(initial_data)

    def _load_database(self) -> Dict:
        """Load database from JSON file"""
        try:
            with open(self.db_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"⚠️  Database error: {e}")
            self._initialize_database()
            return self._load_database()

    def _save_database(self, data: Dict):
        """Save database to JSON file"""
        try:
            with open(self.db_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"❌ Error saving database: {e}")
            raise

    def add_site(self, site_data: Dict) -> str:
        """
        Add new site to database

        Args:
            site_data: Site information dictionary

        Returns:
            Site ID
        """
        db = self._load_database()

        # Generate unique site ID
        site_id = f"HH-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

        # Add metadata
        site_data['site_id'] = site_id
        site_data['created'] = datetime.now().isoformat()
        site_data['modified'] = datetime.now().isoformat()

        # Add to database
        db['sites'].append(site_data)

        # Save
        self._save_database(db)

        return site_id

    def get_site(self, site_id: str) -> Optional[Dict]:
        """Get site by ID"""
        db = self._load_database()

        for site in db['sites']:
            if site.get('site_id') == site_id:
                return site

        return None

    def update_site(self, site_id: str, updates: Dict) -> bool:
        """
        Update existing site

        Args:
            site_id: Site ID to update
            updates: Dictionary of fields to update

        Returns:
            True if updated, False if not found
        """
        db = self._load_database()

        for site in db['sites']:
            if site.get('site_id') == site_id:
                # Update fields
                site.update(updates)
                site['modified'] = datetime.now().isoformat()

                # Save
                self._save_database(db)
                return True

        return False

    def delete_site(self, site_id: str) -> bool:
        """Delete site by ID"""
        db = self._load_database()
        initial_count = len(db['sites'])

        db['sites'] = [s for s in db['sites'] if s.get('site_id') != site_id]

        if len(db['sites']) < initial_count:
            self._save_database(db)
            return True

        return False

    def list_sites(self, filter_type: str = None) -> List[Dict]:
        """
        List all sites, optionally filtered by type

        Args:
            filter_type: Filter by site_type ('solar', 'datacenter', etc.)

        Returns:
            List of site dictionaries
        """
        db = self._load_database()
        sites = db['sites']

        if filter_type:
            sites = [s for s in sites if s.get('site_type') == filter_type]

        # Sort by creation date (newest first)
        sites.sort(key=lambda x: x.get('created', ''), reverse=True)

        return sites

    def search_sites(self, query: str) -> List[Dict]:
        """
        Search sites by name, notes, or location

        Args:
            query: Search string

        Returns:
            List of matching sites
        """
        db = self._load_database()
        query_lower = query.lower()

        results = []
        for site in db['sites']:
            # Search in multiple fields
            searchable = f"{site.get('name', '')} {site.get('notes', '')} {site.get('location_context', {}).get('territory', '')}".lower()

            if query_lower in searchable:
                results.append(site)

        return results

    def export_to_csv(self, output_file: str = None) -> str:
        """
        Export sites to CSV format

        Args:
            output_file: Output file path (optional)

        Returns:
            CSV file path
        """
        import csv

        if not output_file:
            output_file = self.data_dir / f"sites_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        db = self._load_database()
        sites = db['sites']

        if not sites:
            print("⚠️  No sites to export")
            return None

        # Get all unique keys from all sites
        fieldnames = set()
        for site in sites:
            fieldnames.update(site.keys())

        fieldnames = sorted(list(fieldnames))

        # Write CSV
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sites)

        return str(output_file)

    def get_statistics(self) -> Dict:
        """Get database statistics"""
        db = self._load_database()
        sites = db['sites']

        # Count by type
        type_counts = {}
        total_acres = 0
        total_solar_mw = 0

        for site in sites:
            site_type = site.get('site_type', 'unknown')
            type_counts[site_type] = type_counts.get(site_type, 0) + 1

            # Sum acres
            if 'acres' in site:
                total_acres += site['acres']

            # Sum solar capacity
            if site_type == 'solar' and 'solar_analysis' in site:
                total_solar_mw += site['solar_analysis'].get('mw_capacity', 0)

        return {
            'total_sites': len(sites),
            'by_type': type_counts,
            'total_acres_analyzed': round(total_acres, 2),
            'total_solar_capacity_mw': round(total_solar_mw, 2),
            'database_file': str(self.db_file),
            'last_modified': db['metadata'].get('created')
        }

    def format_site_summary(self, site: Dict) -> str:
        """Format a site as a readable summary"""
        summary = f"""
┌─────────────────────────────────────────────────┐
│ 🦅 {site.get('name', 'Unnamed Site')[:40]}
├─────────────────────────────────────────────────┤
│ ID:        {site.get('site_id', 'N/A')}
│ Type:      {site.get('site_type', 'N/A').upper()}
│ Acres:     {site.get('acres', 'N/A')}
│ Location:  {site.get('location_context', {}).get('coordinates', 'N/A')}
│ Created:   {site.get('created', 'N/A')[:10]}
"""

        if site.get('site_type') == 'solar' and 'solar_analysis' in site:
            solar = site['solar_analysis']
            summary += f"""│
│ ☀️  SOLAR ANALYSIS:
│    Capacity:    {solar.get('mw_capacity', 0)} MW
│    Generation:  {solar.get('annual_generation_mwh', 0):,.0f} MWh/year
│    Homes:       {solar.get('homes_powered', 0):,}
"""

        if site.get('site_type') == 'datacenter' and 'datacenter_analysis' in site:
            dc = site['datacenter_analysis']
            summary += f"""│
│ 🖥️  DATA CENTER ANALYSIS:
│    Servers:     {dc.get('input_servers', 0):,}
│    Power:       {dc.get('total_facility_mw', 0):.2f} MW
│    Annual Cost: ${dc.get('annual_electricity_cost_usd', 0):,}
"""

        if 'notes' in site and site['notes']:
            summary += f"""│
│ 📝 Notes: {site['notes'][:40]}
"""

        summary += "└─────────────────────────────────────────────────┘"
        return summary


def test_site_manager():
    """Test site manager functionality"""
    print("🦅 EAGLE Site Manager Test")
    print("=" * 60)

    # Create manager with test directory
    test_dir = Path.home() / 'EnergyIntel_Test'
    manager = SiteManager(str(test_dir))

    print(f"\n💾 Database location: {manager.db_file}")

    # Add test site
    test_site = {
        'name': 'Bosque County Solar Site #1',
        'site_type': 'solar',
        'acres': 150,
        'location_context': {
            'coordinates': '31.8749°N, -97.6428°W',
            'territory': 'Bosque County (Oncor Territory)'
        },
        'solar_analysis': {
            'mw_capacity': 75,
            'annual_generation_mwh': 131400,
            'homes_powered': 11945
        },
        'notes': 'Excellent site near Meridian, TX'
    }

    print("\n➕ Adding test site...")
    site_id = manager.add_site(test_site)
    print(f"✅ Added site: {site_id}")

    # List sites
    print("\n📋 Listing all sites:")
    sites = manager.list_sites()
    for site in sites:
        print(manager.format_site_summary(site))

    # Statistics
    print("\n📊 Database Statistics:")
    stats = manager.get_statistics()
    print(f"   Total Sites:      {stats['total_sites']}")
    print(f"   Total Acres:      {stats['total_acres_analyzed']}")
    print(f"   Solar Capacity:   {stats['total_solar_capacity_mw']} MW")

    print(f"\n✅ Test complete. Database at: {manager.db_file}")


if __name__ == "__main__":
    test_site_manager()
