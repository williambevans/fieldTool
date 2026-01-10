#!/usr/bin/env python3
"""
HH Holdings Energy Intel - Solar Farm Calculator
Solar capacity and generation calculations based on NREL methodology

Author: Bevans Real Estate / HH Holdings
Location: Bosque County, Texas
"""

from typing import Dict
from datetime import datetime


class SolarCalculator:
    """Calculate solar farm capacity and generation potential"""

    # NREL-based constants for Texas
    MW_PER_ACRE = 0.5  # Conservative estimate for ground-mount solar
    CAPACITY_FACTOR = 0.20  # 20% capacity factor for Central Texas
    HOURS_PER_YEAR = 8760
    MWH_PER_HOME_YEAR = 11  # Average Texas home consumption
    PANEL_EFFICIENCY = 0.18  # 18% typical for modern panels
    SYSTEM_LOSSES = 0.14  # 14% system losses (inverter, wiring, etc.)

    # Economic factors
    CAPEX_PER_MW = 1_000_000  # $1M per MW installed capacity (rough estimate)
    O_M_PER_MW_YEAR = 20_000  # Annual O&M costs per MW

    def __init__(self):
        self.last_calculation = None

    def calculate_capacity(self, acres: float) -> Dict:
        """
        Calculate solar farm capacity for given acreage

        Args:
            acres: Land area in acres

        Returns:
            Dictionary with capacity calculations
        """
        if acres <= 0:
            raise ValueError("Acreage must be positive")

        # Base capacity calculation
        mw_capacity = acres * self.MW_PER_ACRE

        # Annual generation
        annual_mwh = (mw_capacity * self.HOURS_PER_YEAR *
                      self.CAPACITY_FACTOR * (1 - self.SYSTEM_LOSSES))

        # Homes powered
        homes_powered = int(annual_mwh / self.MWH_PER_HOME_YEAR)

        # Economic estimates
        estimated_capex = mw_capacity * self.CAPEX_PER_MW
        annual_om = mw_capacity * self.O_M_PER_MW_YEAR

        result = {
            'input_acres': acres,
            'mw_capacity': round(mw_capacity, 2),
            'annual_generation_mwh': round(annual_mwh, 2),
            'homes_powered': homes_powered,
            'capacity_factor': self.CAPACITY_FACTOR,
            'estimated_capex_usd': int(estimated_capex),
            'annual_om_usd': int(annual_om),
            'calculation_date': datetime.now().isoformat(),
            'methodology': 'NREL-based, Texas Central region'
        }

        self.last_calculation = result
        return result

    def calculate_revenue_potential(self, annual_mwh: float,
                                    ppa_rate: float = 0.03) -> Dict:
        """
        Calculate potential revenue from solar generation

        Args:
            annual_mwh: Annual MWh generation
            ppa_rate: Power Purchase Agreement rate ($/kWh), default $0.03

        Returns:
            Revenue estimates
        """
        annual_revenue = annual_mwh * 1000 * ppa_rate  # Convert MWh to kWh
        revenue_per_acre = annual_revenue / self.last_calculation['input_acres'] if self.last_calculation else 0

        return {
            'ppa_rate_per_kwh': ppa_rate,
            'annual_revenue_usd': int(annual_revenue),
            'revenue_per_acre_usd': int(revenue_per_acre),
            'revenue_per_mw_usd': int(annual_revenue / self.last_calculation['mw_capacity']) if self.last_calculation else 0
        }

    def calculate_minimum_viable_size(self, min_mw: float = 5.0) -> float:
        """
        Calculate minimum acreage for viable solar farm

        Args:
            min_mw: Minimum MW capacity for project viability

        Returns:
            Minimum acres needed
        """
        return min_mw / self.MW_PER_ACRE

    def compare_site_sizes(self, acres_list: list) -> list:
        """
        Compare multiple site sizes

        Args:
            acres_list: List of acreage values to compare

        Returns:
            List of calculation results
        """
        results = []
        for acres in acres_list:
            if acres > 0:
                calc = self.calculate_capacity(acres)
                results.append(calc)
        return results

    def get_texas_solar_context(self) -> Dict:
        """Provide Texas solar market context"""
        return {
            'region': 'ERCOT Central',
            'utility_territory': 'Oncor (Bosque County)',
            'avg_capacity_factor': '18-22%',
            'peak_sun_hours': '4.5-5.5 hours/day',
            'land_requirement': f'{1/self.MW_PER_ACRE} acres per MW',
            'typical_project_size': '5-50 MW for community scale',
            'interconnection': 'Oncor transmission network',
            'incentives': [
                'Federal ITC (Investment Tax Credit)',
                'Accelerated depreciation (MACRS)',
                'Property tax abatements (varies by county)'
            ],
            'considerations': [
                'Transmission line proximity critical',
                'Oncor interconnection queue timing',
                'Water for panel cleaning (minimal)',
                'Land lease vs. purchase economics'
            ]
        }

    def format_report(self, calculation: Dict) -> str:
        """Format calculation results as readable report"""
        report = f"""
╔══════════════════════════════════════════════════════════╗
║     🦅 EAGLE SOLAR FARM ANALYSIS - HH HOLDINGS          ║
╚══════════════════════════════════════════════════════════╝

📊 SITE SPECIFICATIONS
   Land Area:            {calculation['input_acres']:.1f} acres

⚡ CAPACITY & GENERATION
   Installed Capacity:   {calculation['mw_capacity']:.2f} MW
   Annual Generation:    {calculation['annual_generation_mwh']:,.0f} MWh/year
   Capacity Factor:      {calculation['capacity_factor']*100:.0f}%

🏠 IMPACT
   Homes Powered:        {calculation['homes_powered']:,} Texas homes/year

💰 ECONOMIC ESTIMATES
   Est. CAPEX:          ${calculation['estimated_capex_usd']:,}
   Annual O&M:          ${calculation['annual_om_usd']:,}

📍 METHODOLOGY
   Standard:            {calculation['methodology']}
   Generated:           {calculation['calculation_date'][:10]}

═══════════════════════════════════════════════════════════
   HH Holdings / Bevans Real Estate - Bosque County, Texas
═══════════════════════════════════════════════════════════
"""
        return report


def test_solar_calc():
    """Test solar calculator functionality"""
    print("🦅 EAGLE Solar Calculator Test")
    print("=" * 60)

    calc = SolarCalculator()

    # Test calculation
    test_acres = 100
    print(f"\n☀️  Analyzing {test_acres}-acre solar farm site...")

    result = calc.calculate_capacity(test_acres)
    print(calc.format_report(result))

    # Revenue potential
    revenue = calc.calculate_revenue_potential(result['annual_generation_mwh'])
    print(f"💵 REVENUE POTENTIAL (at $0.03/kWh)")
    print(f"   Annual Revenue:      ${revenue['annual_revenue_usd']:,}")
    print(f"   Per Acre:            ${revenue['revenue_per_acre_usd']:,}/acre/year")

    # Minimum viable size
    min_acres = calc.calculate_minimum_viable_size(5.0)
    print(f"\n📏 MINIMUM VIABLE PROJECT")
    print(f"   For 5 MW minimum:    {min_acres:.1f} acres needed")

    # Texas context
    print(f"\n🗺️  TEXAS SOLAR CONTEXT")
    context = calc.get_texas_solar_context()
    print(f"   Territory:           {context['utility_territory']}")
    print(f"   Peak Sun Hours:      {context['peak_sun_hours']}")


if __name__ == "__main__":
    test_solar_calc()
