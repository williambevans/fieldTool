#!/usr/bin/env python3
"""
HH Holdings Energy Intel - Test Suite
Unit tests for calculation modules

Author: Bevans Real Estate / HH Holdings
Location: Bosque County, Texas
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from solar_calc import SolarCalculator
from datacenter_calc import DataCenterCalculator
from gps_utils import GPSManager


def test_solar_calculations():
    """Test solar farm calculations"""
    print("\n" + "=" * 60)
    print("🧪 TESTING SOLAR CALCULATIONS")
    print("=" * 60)

    calc = SolarCalculator()
    tests_passed = 0
    tests_failed = 0

    # Test 1: Basic capacity calculation
    print("\n📋 Test 1: Basic Capacity Calculation (100 acres)")
    result = calc.calculate_capacity(100)

    expected_mw = 100 * 0.5  # 50 MW
    if result['mw_capacity'] == expected_mw:
        print(f"   ✅ PASS: Capacity = {result['mw_capacity']} MW (expected {expected_mw})")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Capacity = {result['mw_capacity']} MW (expected {expected_mw})")
        tests_failed += 1

    # Test 2: Generation calculation
    print("\n📋 Test 2: Annual Generation Calculation")
    # 50 MW × 8760 hours × 0.20 CF × 0.86 (losses) = 75,432 MWh
    expected_mwh = 75432
    actual_mwh = int(result['annual_generation_mwh'])

    if abs(actual_mwh - expected_mwh) < 100:  # Allow small rounding difference
        print(f"   ✅ PASS: Generation = {actual_mwh:,} MWh/year")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Generation = {actual_mwh:,} MWh (expected ~{expected_mwh:,})")
        tests_failed += 1

    # Test 3: Homes powered
    print("\n📋 Test 3: Homes Powered Calculation")
    expected_homes = int(result['annual_generation_mwh'] / 11)  # 11 MWh/home/year

    if result['homes_powered'] == expected_homes:
        print(f"   ✅ PASS: Homes = {result['homes_powered']:,} (expected {expected_homes:,})")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Homes = {result['homes_powered']:,} (expected {expected_homes:,})")
        tests_failed += 1

    # Test 4: Minimum viable size
    print("\n📋 Test 4: Minimum Viable Size")
    min_acres = calc.calculate_minimum_viable_size(5.0)  # 5 MW minimum
    expected_min_acres = 5.0 / 0.5  # 10 acres

    if min_acres == expected_min_acres:
        print(f"   ✅ PASS: Min acres for 5 MW = {min_acres}")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Min acres = {min_acres} (expected {expected_min_acres})")
        tests_failed += 1

    # Test 5: Revenue calculation
    print("\n📋 Test 5: Revenue Potential")
    revenue = calc.calculate_revenue_potential(result['annual_generation_mwh'], 0.03)

    expected_revenue = int(result['annual_generation_mwh'] * 1000 * 0.03)
    actual_revenue = revenue['annual_revenue_usd']

    if actual_revenue == expected_revenue:
        print(f"   ✅ PASS: Revenue = ${actual_revenue:,} at $0.03/kWh")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Revenue = ${actual_revenue:,} (expected ${expected_revenue:,})")
        tests_failed += 1

    # Test 6: Edge case - small site
    print("\n📋 Test 6: Small Site (1 acre)")
    small_result = calc.calculate_capacity(1)

    if small_result['mw_capacity'] == 0.5:
        print(f"   ✅ PASS: 1 acre = {small_result['mw_capacity']} MW")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: 1 acre = {small_result['mw_capacity']} MW (expected 0.5)")
        tests_failed += 1

    # Test 7: Large site
    print("\n📋 Test 7: Large Site (1000 acres)")
    large_result = calc.calculate_capacity(1000)

    if large_result['mw_capacity'] == 500:
        print(f"   ✅ PASS: 1000 acres = {large_result['mw_capacity']} MW")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: 1000 acres = {large_result['mw_capacity']} MW (expected 500)")
        tests_failed += 1

    print("\n" + "-" * 60)
    print(f"☀️  Solar Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_passed, tests_failed


def test_datacenter_calculations():
    """Test data center calculations"""
    print("\n" + "=" * 60)
    print("🧪 TESTING DATA CENTER CALCULATIONS")
    print("=" * 60)

    calc = DataCenterCalculator(pue=1.5)
    tests_passed = 0
    tests_failed = 0

    # Test 1: Server count calculation
    print("\n📋 Test 1: Server Count Calculation (1000 servers)")
    result = calc.calculate_from_servers(1000, 500)  # 1000 servers @ 500W each

    expected_it_kw = (1000 * 500) / 1000  # 500 kW
    if result['it_load_kw'] == expected_it_kw:
        print(f"   ✅ PASS: IT Load = {result['it_load_kw']} kW")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: IT Load = {result['it_load_kw']} kW (expected {expected_it_kw})")
        tests_failed += 1

    # Test 2: PUE calculation
    print("\n📋 Test 2: PUE Application")
    expected_total_kw = expected_it_kw * 1.5  # 750 kW with PUE 1.5

    if result['total_facility_kw'] == expected_total_kw:
        print(f"   ✅ PASS: Total = {result['total_facility_kw']} kW (PUE 1.5)")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Total = {result['total_facility_kw']} kW (expected {expected_total_kw})")
        tests_failed += 1

    # Test 3: Rack calculation
    print("\n📋 Test 3: Rack Requirements")
    expected_racks = (1000 // 42) + (1 if 1000 % 42 else 0)  # 24 racks

    if result['racks_required'] == expected_racks:
        print(f"   ✅ PASS: Racks = {result['racks_required']} (expected {expected_racks})")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Racks = {result['racks_required']} (expected {expected_racks})")
        tests_failed += 1

    # Test 4: Annual consumption
    print("\n📋 Test 4: Annual Consumption")
    expected_annual_mwh = (expected_total_kw * 8760) / 1000  # 6,570 MWh

    if abs(result['annual_consumption_mwh'] - expected_annual_mwh) < 1:
        print(f"   ✅ PASS: Annual = {result['annual_consumption_mwh']:,.0f} MWh")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Annual = {result['annual_consumption_mwh']:,.0f} MWh (expected {expected_annual_mwh:,.0f})")
        tests_failed += 1

    # Test 5: Different PUE values
    print("\n📋 Test 5: Different PUE Values")
    calc_excellent = DataCenterCalculator(pue=1.2)
    calc_poor = DataCenterCalculator(pue=2.0)

    result_excellent = calc_excellent.calculate_from_servers(100)
    result_poor = calc_poor.calculate_from_servers(100)

    # 100 servers × 500W = 50kW IT load
    # Excellent (1.2): 50 × 1.2 = 60 kW total
    # Poor (2.0): 50 × 2.0 = 100 kW total

    if result_excellent['total_facility_kw'] == 60 and result_poor['total_facility_kw'] == 100:
        print(f"   ✅ PASS: PUE 1.2 = 60kW, PUE 2.0 = 100kW")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: PUE calculations incorrect")
        tests_failed += 1

    # Test 6: Capacity-based calculation
    print("\n📋 Test 6: Capacity-Based Calculation (1 MW)")
    result_capacity = calc.calculate_from_capacity(1.0)  # 1 MW facility

    # 1 MW total / 1.5 PUE = 0.667 MW IT load = 667 kW
    expected_it_load = round(1000 / 1.5, 2)

    if abs(result_capacity['it_load_kw'] - expected_it_load) < 1:
        print(f"   ✅ PASS: 1 MW facility = {result_capacity['it_load_kw']:.1f} kW IT load")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: IT load = {result_capacity['it_load_kw']} kW (expected ~{expected_it_load})")
        tests_failed += 1

    # Test 7: Water cooling calculation
    print("\n📋 Test 7: Water Cooling Requirements")
    water = calc.water_cooling_requirements(500)  # 500 kW IT load

    # 500 kW / 100 × 0.5 GPM = 2.5 GPM
    expected_gpm = (500 / 100) * 0.5

    if water['cooling_water_gpm'] == expected_gpm:
        print(f"   ✅ PASS: Water = {water['cooling_water_gpm']} GPM")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Water = {water['cooling_water_gpm']} GPM (expected {expected_gpm})")
        tests_failed += 1

    print("\n" + "-" * 60)
    print(f"🖥️  Data Center Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_passed, tests_failed


def test_gps_calculations():
    """Test GPS utility functions"""
    print("\n" + "=" * 60)
    print("🧪 TESTING GPS CALCULATIONS")
    print("=" * 60)

    gps = GPSManager()
    tests_passed = 0
    tests_failed = 0

    # Test 1: Distance calculation
    print("\n📋 Test 1: Distance Calculation")
    # Test known distance: Meridian, TX to Waco, TX ~ 35 miles
    meridian = (31.8749, -97.6428)
    waco = (31.5493, -97.1467)

    distance = gps.calculate_distance(meridian[0], meridian[1], waco[0], waco[1])

    if 30 < distance < 40:  # Should be ~35 miles
        print(f"   ✅ PASS: Meridian to Waco = {distance:.1f} miles (expected ~35)")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Distance = {distance:.1f} miles (expected ~35)")
        tests_failed += 1

    # Test 2: Bosque County boundary check
    print("\n📋 Test 2: Bosque County Boundary Check")
    test_location_inside = {'latitude': 31.8749, 'longitude': -97.6428}  # Meridian
    test_location_outside = {'latitude': 31.5493, 'longitude': -97.1467}  # Waco

    inside = gps.is_in_bosque_county(test_location_inside)
    outside = gps.is_in_bosque_county(test_location_outside)

    if inside and not outside:
        print(f"   ✅ PASS: Meridian inside, Waco outside")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Boundary check failed")
        tests_failed += 1

    # Test 3: Brazos River distance
    print("\n📋 Test 3: Brazos River Distance")
    meridian_location = {'latitude': 31.8749, 'longitude': -97.6428}
    brazos_dist = gps.distance_to_brazos(meridian_location)

    if 0 < brazos_dist < 10:  # Should be a few miles
        print(f"   ✅ PASS: Brazos distance = {brazos_dist:.1f} miles")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Brazos distance = {brazos_dist:.1f} miles")
        tests_failed += 1

    # Test 4: Location context
    print("\n📋 Test 4: Location Context Generation")
    context = gps.get_location_context(meridian_location)

    required_fields = ['in_bosque_county', 'distance_to_brazos_miles',
                      'coordinates', 'territory', 'water_access']

    if all(field in context for field in required_fields):
        print(f"   ✅ PASS: All context fields present")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Missing context fields")
        tests_failed += 1

    # Test 5: Zero distance (same point)
    print("\n📋 Test 5: Zero Distance Check")
    same_distance = gps.calculate_distance(31.0, -97.0, 31.0, -97.0)

    if same_distance == 0:
        print(f"   ✅ PASS: Same point distance = 0")
        tests_passed += 1
    else:
        print(f"   ❌ FAIL: Same point distance = {same_distance}")
        tests_failed += 1

    print("\n" + "-" * 60)
    print(f"📍 GPS Tests: {tests_passed} passed, {tests_failed} failed")
    return tests_passed, tests_failed


def run_all_tests():
    """Run all test suites"""
    print("\n" + "=" * 60)
    print("🦅 EAGLE TEST SUITE - HH Holdings Energy Intel")
    print("=" * 60)
    print("Testing calculation modules for accuracy and reliability")
    print("=" * 60)

    total_passed = 0
    total_failed = 0

    # Run solar tests
    solar_passed, solar_failed = test_solar_calculations()
    total_passed += solar_passed
    total_failed += solar_failed

    # Run data center tests
    dc_passed, dc_failed = test_datacenter_calculations()
    total_passed += dc_passed
    total_failed += dc_failed

    # Run GPS tests
    gps_passed, gps_failed = test_gps_calculations()
    total_passed += gps_passed
    total_failed += gps_failed

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"   Total Tests:     {total_passed + total_failed}")
    print(f"   ✅ Passed:        {total_passed}")
    print(f"   ❌ Failed:        {total_failed}")

    success_rate = (total_passed / (total_passed + total_failed) * 100) if (total_passed + total_failed) > 0 else 0
    print(f"   Success Rate:    {success_rate:.1f}%")
    print("=" * 60)

    if total_failed == 0:
        print("\n🎉 ALL TESTS PASSED! EAGLE is ready for field deployment.")
        print("🦅 HH Holdings / Bevans Real Estate - Bosque County, Texas")
        return True
    else:
        print(f"\n⚠️  {total_failed} test(s) failed. Please review and fix.")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
