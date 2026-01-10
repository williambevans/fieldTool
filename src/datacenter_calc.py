#!/usr/bin/env python3
"""
HH Holdings Energy Intel - Data Center Power Calculator
Power requirement calculations for data center facilities

Author: Bevans Real Estate / HH Holdings
Location: Bosque County, Texas
"""

from typing import Dict
from datetime import datetime


class DataCenterCalculator:
    """Calculate data center power requirements and costs"""

    # Power consumption constants (Watts)
    WATTS_PER_SERVER_TYPICAL = 500  # Average 1U-2U server
    WATTS_PER_SERVER_HIGH = 1000    # High-performance server
    WATTS_PER_RACK = 7000           # Average rack power (typical)
    SERVERS_PER_RACK = 42           # Standard 42U rack

    # PUE (Power Usage Effectiveness)
    PUE_EXCELLENT = 1.2   # Hyperscale, cutting-edge
    PUE_GOOD = 1.5        # Modern, well-designed
    PUE_AVERAGE = 1.8     # Typical existing facility
    PUE_POOR = 2.0        # Older facility

    # Economic factors
    ELECTRICITY_RATE_KWH = 0.08  # Texas average industrial rate
    HOURS_PER_YEAR = 8760
    CAPEX_PER_KW = 10000  # $10k per kW of IT load (rough estimate)

    # Cooling requirements (varies by climate)
    COOLING_LOAD_MULTIPLIER = 0.4  # 40% of IT load for Texas climate

    def __init__(self, pue: float = PUE_GOOD):
        """
        Initialize calculator with specified PUE

        Args:
            pue: Power Usage Effectiveness (default 1.5 for modern facility)
        """
        self.pue = pue
        self.last_calculation = None

    def calculate_from_servers(self, num_servers: int,
                               watts_per_server: int = WATTS_PER_SERVER_TYPICAL) -> Dict:
        """
        Calculate power requirements from server count

        Args:
            num_servers: Number of servers
            watts_per_server: Power consumption per server in Watts

        Returns:
            Dictionary with power calculations
        """
        if num_servers <= 0:
            raise ValueError("Number of servers must be positive")

        # IT load calculation
        it_load_watts = num_servers * watts_per_server
        it_load_kw = it_load_watts / 1000

        # Total facility load (IT load × PUE)
        total_load_kw = it_load_kw * self.pue
        total_load_mw = total_load_kw / 1000

        # Infrastructure breakdown
        cooling_kw = it_load_kw * self.COOLING_LOAD_MULTIPLIER
        overhead_kw = total_load_kw - it_load_kw - cooling_kw

        # Annual consumption
        annual_kwh = total_load_kw * self.HOURS_PER_YEAR
        annual_mwh = annual_kwh / 1000

        # Cost estimates
        annual_electricity_cost = annual_kwh * self.ELECTRICITY_RATE_KWH
        estimated_capex = it_load_kw * self.CAPEX_PER_KW

        # Rack requirements
        racks_needed = (num_servers // self.SERVERS_PER_RACK) + \
                       (1 if num_servers % self.SERVERS_PER_RACK else 0)

        result = {
            'input_servers': num_servers,
            'watts_per_server': watts_per_server,
            'it_load_kw': round(it_load_kw, 2),
            'cooling_load_kw': round(cooling_kw, 2),
            'overhead_kw': round(overhead_kw, 2),
            'total_facility_kw': round(total_load_kw, 2),
            'total_facility_mw': round(total_load_mw, 3),
            'pue': self.pue,
            'racks_required': racks_needed,
            'annual_consumption_mwh': round(annual_mwh, 2),
            'annual_electricity_cost_usd': int(annual_electricity_cost),
            'estimated_capex_usd': int(estimated_capex),
            'electricity_rate_kwh': self.ELECTRICITY_RATE_KWH,
            'calculation_date': datetime.now().isoformat()
        }

        self.last_calculation = result
        return result

    def calculate_from_capacity(self, target_mw: float) -> Dict:
        """
        Calculate data center specs from target MW capacity

        Args:
            target_mw: Target facility capacity in MW

        Returns:
            Dictionary with facility specifications
        """
        if target_mw <= 0:
            raise ValueError("Capacity must be positive")

        # Work backwards from total capacity
        total_kw = target_mw * 1000
        it_load_kw = total_kw / self.pue

        # Server count (using typical server)
        estimated_servers = int(it_load_kw * 1000 / self.WATTS_PER_SERVER_TYPICAL)

        # Use the server calculation
        return self.calculate_from_servers(estimated_servers, self.WATTS_PER_SERVER_TYPICAL)

    def calculate_land_requirements(self, total_kw: float) -> Dict:
        """
        Estimate land and building requirements

        Args:
            total_kw: Total facility load in kW

        Returns:
            Space requirements
        """
        # Rule of thumb: 200-300 sq ft per kW for modern facility
        sqft_per_kw = 250
        building_sqft = total_kw * sqft_per_kw

        # Land area (building + parking + utilities + buffer)
        land_multiplier = 3  # 3x building footprint for total site
        total_site_sqft = building_sqft * land_multiplier
        total_site_acres = total_site_sqft / 43560

        return {
            'building_sqft': int(building_sqft),
            'total_site_sqft': int(total_site_sqft),
            'total_site_acres': round(total_site_acres, 2),
            'parking_spaces_estimated': int(total_kw / 100),  # 1 space per 100kW
        }

    def water_cooling_requirements(self, it_load_kw: float) -> Dict:
        """
        Estimate water requirements for cooling (if using water cooling)

        Args:
            it_load_kw: IT load in kW

        Returns:
            Water usage estimates
        """
        # Water-cooled systems: ~0.5 gallons per minute per 100kW
        # This varies greatly by design
        gpm_per_100kw = 0.5
        gpm_required = (it_load_kw / 100) * gpm_per_100kw

        # Annual water usage
        gallons_per_year = gpm_required * 60 * 24 * 365

        return {
            'cooling_water_gpm': round(gpm_required, 2),
            'annual_gallons': int(gallons_per_year),
            'annual_acre_feet': round(gallons_per_year / 325851, 2),  # Convert to acre-feet
            'note': 'Water-cooled system estimate. Air-cooled uses minimal water.'
        }

    def get_texas_datacenter_context(self) -> Dict:
        """Provide Texas data center market context"""
        return {
            'region': 'Central Texas / ERCOT',
            'power_reliability': 'ERCOT grid - consider backup generation',
            'climate_zone': 'Hot-humid (ASHRAE 2A)',
            'cooling_challenges': 'High summer temperatures, humidity',
            'fiber_connectivity': 'Verify provider availability',
            'key_factors': [
                'Power capacity and reliability (critical)',
                'Network fiber access',
                'Water availability (for cooling)',
                'Proximity to transmission lines',
                'Tax incentives (varies by county)',
                'Skilled workforce availability'
            ],
            'bosque_county_notes': [
                'Rural location - verify fiber availability',
                'Oncor power territory',
                'Brazos River water access potential',
                'Lower land costs vs. metro areas',
                'Consider generator fuel logistics'
            ],
            'power_considerations': {
                'ercot_stability': 'Recent grid challenges - backup critical',
                'renewable_integration': 'Abundant solar potential nearby',
                'transmission': 'Verify substation capacity and proximity'
            }
        }

    def format_report(self, calculation: Dict) -> str:
        """Format calculation results as readable report"""
        land = self.calculate_land_requirements(calculation['total_facility_kw'])

        report = f"""
╔══════════════════════════════════════════════════════════╗
║   🦅 EAGLE DATA CENTER ANALYSIS - HH HOLDINGS           ║
╚══════════════════════════════════════════════════════════╝

🖥️  FACILITY SPECIFICATIONS
   Server Count:         {calculation['input_servers']:,} servers
   Server Power:         {calculation['watts_per_server']}W each
   Racks Required:       {calculation['racks_required']} racks (42U)

⚡ POWER REQUIREMENTS
   IT Load:              {calculation['it_load_kw']:,.1f} kW
   Cooling Load:         {calculation['cooling_load_kw']:,.1f} kW
   Infrastructure:       {calculation['overhead_kw']:,.1f} kW
   ─────────────────────────────────────────────
   TOTAL FACILITY:       {calculation['total_facility_kw']:,.1f} kW ({calculation['total_facility_mw']:.2f} MW)
   PUE:                  {calculation['pue']:.2f}

📊 ANNUAL CONSUMPTION
   Total Usage:          {calculation['annual_consumption_mwh']:,.0f} MWh/year
   Electricity Cost:     ${calculation['annual_electricity_cost_usd']:,}/year
   Rate:                 ${calculation['electricity_rate_kwh']:.3f}/kWh

🏗️  FACILITY FOOTPRINT
   Building Size:        {land['building_sqft']:,} sq ft
   Total Site:           {land['total_site_acres']:.1f} acres
   Parking:              ~{land['parking_spaces_estimated']} spaces

💰 CAPITAL ESTIMATE
   Est. CAPEX:          ${calculation['estimated_capex_usd']:,}
   (Infrastructure only, excludes land/building)

📍 GENERATED
   Date:                {calculation['calculation_date'][:10]}

═══════════════════════════════════════════════════════════
   HH Holdings / Bevans Real Estate - Bosque County, Texas
═══════════════════════════════════════════════════════════
"""
        return report


def test_datacenter_calc():
    """Test data center calculator functionality"""
    print("🦅 EAGLE Data Center Calculator Test")
    print("=" * 60)

    # Create calculator with good PUE
    calc = DataCenterCalculator(pue=1.5)

    # Test calculation
    test_servers = 1000
    print(f"\n🖥️  Analyzing {test_servers:,}-server data center...")

    result = calc.calculate_from_servers(test_servers)
    print(calc.format_report(result))

    # Water requirements
    water = calc.water_cooling_requirements(result['it_load_kw'])
    print(f"💧 WATER COOLING REQUIREMENTS")
    print(f"   Flow Rate:           {water['cooling_water_gpm']:.1f} GPM")
    print(f"   Annual Usage:        {water['annual_gallons']:,} gallons")
    print(f"   Annual Usage:        {water['annual_acre_feet']:.1f} acre-feet")
    print(f"   Note:                {water['note']}")

    # Texas context
    print(f"\n🗺️  TEXAS DATA CENTER CONTEXT")
    context = calc.get_texas_datacenter_context()
    print(f"   Region:              {context['region']}")
    print(f"   Climate Zone:        {context['climate_zone']}")
    print(f"\n   Bosque County Notes:")
    for note in context['bosque_county_notes']:
        print(f"   • {note}")


if __name__ == "__main__":
    test_datacenter_calc()
