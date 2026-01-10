#!/usr/bin/env python3
"""
HH Holdings Energy Infrastructure Intelligence - EAGLE
Mobile field analysis tool for Texas energy projects

Author: Bevans Real Estate / HH Holdings
Owner: Biri Bevan
Location: Bosque County, Texas
"""

import sys
import os
from datetime import datetime

# Add src directory to path
sys.path.insert(0, os.path.dirname(__file__))

from gps_utils import GPSManager
from solar_calc import SolarCalculator
from datacenter_calc import DataCenterCalculator
from site_manager import SiteManager


BANNER = """
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🦅  EAGLE - Energy Asset Gateway & Location Explorer  🦅    ║
║                                                                ║
║          HH Holdings Energy Infrastructure Intelligence        ║
║              Soaring Above the Energy Frontier                 ║
║                                                                ║
║   Owner: Biri Bevan - 14+ Years Texas Property Research       ║
║   Company: HH Holdings / Bevans Real Estate                    ║
║   Territory: Bosque County, Texas (Brazos River Region)        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
"""


class EagleApp:
    """Main application controller"""

    def __init__(self):
        self.gps = GPSManager()
        self.solar_calc = SolarCalculator()
        self.datacenter_calc = DataCenterCalculator()
        self.site_manager = SiteManager()
        self.current_location = None

    def show_banner(self):
        """Display application banner"""
        print("\033[1;36m" + BANNER + "\033[0m")
        print(f"📅 {datetime.now().strftime('%A, %B %d, %Y - %I:%M %p')}")
        print("═" * 66)

    def main_menu(self):
        """Display main menu and get user choice"""
        print("\n🎯 MAIN MENU")
        print("─" * 66)
        print("  1. 📍 Capture GPS Location")
        print("  2. ☀️  Analyze Solar Farm Site")
        print("  3. 🖥️  Analyze Data Center Site")
        print("  4. 💾 View Saved Sites")
        print("  5. 📊 Database Statistics")
        print("  6. 🔍 Search Sites")
        print("  7. 📤 Export Sites to CSV")
        print("  8. ℹ️  About EAGLE")
        print("  9. ❌ Exit")
        print("─" * 66)

        choice = input("\n👉 Enter choice (1-9): ").strip()
        return choice

    def capture_gps(self):
        """Capture current GPS location"""
        print("\n" + "═" * 66)
        print("📍 GPS LOCATION CAPTURE")
        print("═" * 66)
        print("\n🛰️  Acquiring GPS signal...")
        print("⏳ This may take 10-30 seconds for accurate fix...")

        location = self.gps.get_current_location()

        if location:
            self.current_location = location
            context = self.gps.get_location_context(location)

            print("\n✅ GPS LOCK ACQUIRED!")
            print("─" * 66)
            print(f"📍 Coordinates:     {context['coordinates']}")
            print(f"📏 Altitude:        {context['altitude_meters']:.1f} meters")
            print(f"🎯 Accuracy:        ±{context['accuracy_meters']:.1f} meters")
            print(f"🗺️  Territory:       {context['territory']}")
            print(f"🌊 Brazos River:    {context['distance_to_brazos_miles']} miles")
            print(f"💧 Water Access:    {context['water_access']}")
            print(f"🕐 Timestamp:       {context['timestamp'][:19]}")
            print("─" * 66)

            return context
        else:
            print("\n❌ GPS capture failed")
            print("💡 Using default Bosque County coordinates for demo")
            return None

    def analyze_solar_site(self):
        """Analyze a solar farm site"""
        print("\n" + "═" * 66)
        print("☀️  SOLAR FARM SITE ANALYSIS")
        print("═" * 66)

        # Get site details
        site_name = input("\n📝 Site name: ").strip() or "Unnamed Solar Site"

        while True:
            try:
                acres = float(input("📏 Land area (acres): ").strip())
                if acres > 0:
                    break
                print("❌ Acres must be positive")
            except ValueError:
                print("❌ Please enter a valid number")

        # GPS location
        use_gps = input("\n📍 Capture GPS location? (y/n): ").strip().lower()
        location_context = None

        if use_gps == 'y':
            location_context = self.capture_gps()

        # Calculate solar potential
        print("\n⚙️  Calculating solar potential...")
        solar_result = self.solar_calc.calculate_capacity(acres)

        # Display report
        print(self.solar_calc.format_report(solar_result))

        # Revenue estimate
        revenue = self.solar_calc.calculate_revenue_potential(
            solar_result['annual_generation_mwh']
        )
        print(f"💵 REVENUE POTENTIAL (at $0.03/kWh PPA)")
        print(f"   Annual Revenue:      ${revenue['annual_revenue_usd']:,}")
        print(f"   Per Acre:            ${revenue['revenue_per_acre_usd']:,}/acre/year")
        print("═" * 66)

        # Save option
        save = input("\n💾 Save this site to database? (y/n): ").strip().lower()

        if save == 'y':
            notes = input("📝 Notes (optional): ").strip()

            site_data = {
                'name': site_name,
                'site_type': 'solar',
                'acres': acres,
                'solar_analysis': solar_result,
                'revenue_estimate': revenue,
                'notes': notes
            }

            if location_context:
                site_data['location_context'] = location_context

            site_id = self.site_manager.add_site(site_data)
            print(f"\n✅ Site saved! ID: {site_id}")

    def analyze_datacenter_site(self):
        """Analyze a data center site"""
        print("\n" + "═" * 66)
        print("🖥️  DATA CENTER SITE ANALYSIS")
        print("═" * 66)

        # Get site details
        site_name = input("\n📝 Site name: ").strip() or "Unnamed Data Center"

        print("\n🔧 Analysis Method:")
        print("  1. By server count")
        print("  2. By target capacity (MW)")
        method = input("Choose method (1-2): ").strip()

        # PUE selection
        print("\n⚡ PUE (Power Usage Effectiveness):")
        print("  1. Excellent (1.2) - Hyperscale")
        print("  2. Good (1.5) - Modern facility [DEFAULT]")
        print("  3. Average (1.8) - Typical")
        print("  4. Custom")
        pue_choice = input("Choose PUE (1-4, press Enter for default): ").strip() or "2"

        pue_map = {"1": 1.2, "2": 1.5, "3": 1.8}
        if pue_choice == "4":
            while True:
                try:
                    pue = float(input("Enter custom PUE (1.0-3.0): "))
                    if 1.0 <= pue <= 3.0:
                        break
                    print("❌ PUE must be between 1.0 and 3.0")
                except ValueError:
                    print("❌ Please enter a valid number")
        else:
            pue = pue_map.get(pue_choice, 1.5)

        calc = DataCenterCalculator(pue=pue)

        # Get specifications
        if method == "1":
            while True:
                try:
                    servers = int(input("\n🖥️  Number of servers: ").strip())
                    if servers > 0:
                        break
                    print("❌ Server count must be positive")
                except ValueError:
                    print("❌ Please enter a valid number")

            result = calc.calculate_from_servers(servers)
        else:
            while True:
                try:
                    target_mw = float(input("\n⚡ Target capacity (MW): ").strip())
                    if target_mw > 0:
                        break
                    print("❌ Capacity must be positive")
                except ValueError:
                    print("❌ Please enter a valid number")

            result = calc.calculate_from_capacity(target_mw)

        # GPS location
        use_gps = input("\n📍 Capture GPS location? (y/n): ").strip().lower()
        location_context = None

        if use_gps == 'y':
            location_context = self.capture_gps()

        # Display report
        print(calc.format_report(result))

        # Water requirements
        water = calc.water_cooling_requirements(result['it_load_kw'])
        print(f"💧 WATER COOLING REQUIREMENTS (if water-cooled)")
        print(f"   Flow Rate:           {water['cooling_water_gpm']:.1f} GPM")
        print(f"   Annual Usage:        {water['annual_acre_feet']:.1f} acre-feet/year")
        print("═" * 66)

        # Save option
        save = input("\n💾 Save this site to database? (y/n): ").strip().lower()

        if save == 'y':
            notes = input("📝 Notes (optional): ").strip()

            # Calculate land requirements for saving
            land = calc.calculate_land_requirements(result['total_facility_kw'])

            site_data = {
                'name': site_name,
                'site_type': 'datacenter',
                'acres': land['total_site_acres'],
                'datacenter_analysis': result,
                'land_requirements': land,
                'water_requirements': water,
                'notes': notes
            }

            if location_context:
                site_data['location_context'] = location_context

            site_id = self.site_manager.add_site(site_data)
            print(f"\n✅ Site saved! ID: {site_id}")

    def view_saved_sites(self):
        """View all saved sites"""
        print("\n" + "═" * 66)
        print("💾 SAVED SITES DATABASE")
        print("═" * 66)

        sites = self.site_manager.list_sites()

        if not sites:
            print("\n📭 No sites saved yet")
            return

        print(f"\n📊 Total Sites: {len(sites)}\n")

        for site in sites:
            print(self.site_manager.format_site_summary(site))
            print()

    def database_statistics(self):
        """Show database statistics"""
        print("\n" + "═" * 66)
        print("📊 DATABASE STATISTICS")
        print("═" * 66)

        stats = self.site_manager.get_statistics()

        print(f"\n📈 OVERVIEW")
        print(f"   Total Sites:         {stats['total_sites']}")
        print(f"   Total Acres:         {stats['total_acres_analyzed']:,.1f} acres")
        print(f"   Solar Capacity:      {stats['total_solar_capacity_mw']:,.1f} MW")

        print(f"\n🗂️  BY TYPE")
        for site_type, count in stats['by_type'].items():
            print(f"   {site_type.capitalize():15} {count}")

        print(f"\n💾 DATABASE")
        print(f"   Location:            {stats['database_file']}")

        print("═" * 66)

    def search_sites(self):
        """Search saved sites"""
        print("\n" + "═" * 66)
        print("🔍 SEARCH SITES")
        print("═" * 66)

        query = input("\n🔎 Enter search term: ").strip()

        if not query:
            print("❌ Search cancelled")
            return

        results = self.site_manager.search_sites(query)

        if not results:
            print(f"\n❌ No sites found matching '{query}'")
            return

        print(f"\n✅ Found {len(results)} site(s):\n")

        for site in results:
            print(self.site_manager.format_site_summary(site))
            print()

    def export_to_csv(self):
        """Export sites to CSV"""
        print("\n" + "═" * 66)
        print("📤 EXPORT SITES TO CSV")
        print("═" * 66)

        csv_file = self.site_manager.export_to_csv()

        if csv_file:
            print(f"\n✅ Sites exported to:")
            print(f"   {csv_file}")
        else:
            print("\n❌ Export failed - no sites to export")

    def show_about(self):
        """Show about information"""
        print("\n" + "═" * 66)
        print("ℹ️  ABOUT EAGLE")
        print("═" * 66)
        print("""
🦅 EAGLE - Energy Asset Gateway & Location Explorer

Professional mobile field analysis tool for Texas energy infrastructure
development. Built by Bevans Real Estate with 14+ years of Texas
property research expertise.

OWNER:      Biri Bevan
COMPANY:    HH Holdings / Bevans Real Estate
LOCATION:   Bosque County, Texas (Brazos River Region)
TERRITORY:  Oncor Electric Delivery

CAPABILITIES:
  • Real-time GPS site capture and geolocation
  • Solar farm capacity calculations (NREL methodology)
  • Data center power requirement modeling
  • Site database with JSON export
  • Bosque County infrastructure context
  • Oncor territory mapping integration
  • Brazos River proximity analysis

TECHNICAL:
  • Platform: Termux (Android)
  • Language: Python 3
  • GPS: termux-location API
  • Storage: JSON database

VERSION: 1.0
LICENSE: MIT

For support: bevans-real-estate/energy-intel-mobile
        """)
        print("═" * 66)

    def run(self):
        """Main application loop"""
        self.show_banner()

        while True:
            try:
                choice = self.main_menu()

                if choice == "1":
                    self.capture_gps()
                elif choice == "2":
                    self.analyze_solar_site()
                elif choice == "3":
                    self.analyze_datacenter_site()
                elif choice == "4":
                    self.view_saved_sites()
                elif choice == "5":
                    self.database_statistics()
                elif choice == "6":
                    self.search_sites()
                elif choice == "7":
                    self.export_to_csv()
                elif choice == "8":
                    self.show_about()
                elif choice == "9":
                    print("\n🦅 Thank you for using EAGLE!")
                    print("HH Holdings / Bevans Real Estate - Bosque County, Texas")
                    print("Soaring Above the Energy Frontier 🦅\n")
                    break
                else:
                    print("\n❌ Invalid choice. Please enter 1-9.")

                input("\n⏎ Press Enter to continue...")

            except KeyboardInterrupt:
                print("\n\n🦅 EAGLE shutting down...")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                input("\n⏎ Press Enter to continue...")


def main():
    """Entry point"""
    app = EagleApp()
    app.run()


if __name__ == "__main__":
    main()
