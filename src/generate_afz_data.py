#!/usr/bin/env python3
"""
AFZ Data Generator
Generates comprehensive database of AFZ-eligible lands across Texas
Includes marginal lands, brownfields, arid regions, and grid-accessible sites
"""

import sys
import os
from afz_classifier import AFZClassifier


def generate_texas_afz_data():
    """Generate comprehensive AFZ database for Texas"""

    classifier = AFZClassifier()

    print("Generating Agriculture Freedom Zone (AFZ) Database for Texas...")
    print("=" * 70)

    # ========================================================================
    # WEST TEXAS - ARID REGIONS & MARGINAL LAND
    # ========================================================================
    print("\n[1/6] West Texas Arid Regions...")

    # Pecos County - Desert/Arid Land
    classifier.classify_parcel(
        parcel_id='AFZ-TX-PECOS-001',
        name='West Pecos Desert Ranch',
        county='Pecos',
        state='TX',
        lat=31.0156,
        lon=-103.4918,
        acres=2400,
        soil_quality='marginal',
        avg_rainfall=11.5,
        nearest_substation=6.2,
        nearest_transmission=2.8,
        current_use='grazing',
        elevation=2750,
        notes='High solar potential, minimal agricultural value, near transmission lines'
    )

    classifier.classify_parcel(
        parcel_id='AFZ-TX-PECOS-002',
        name='Pecos Scrubland Tract',
        county='Pecos',
        state='TX',
        lat=30.8923,
        lon=-103.3421,
        acres=1800,
        soil_quality='marginal',
        avg_rainfall=12.0,
        nearest_substation=4.5,
        nearest_transmission=1.9,
        current_use='vacant',
        elevation=2820,
        notes='Desert scrubland, excellent grid access, solar farm potential'
    )

    # Culberson County - Far West Texas Arid
    classifier.classify_parcel(
        parcel_id='AFZ-TX-CULB-001',
        name='Guadalupe Mountains Foothill',
        county='Culberson',
        state='TX',
        lat=31.8934,
        lon=-104.8271,
        acres=3200,
        soil_quality='marginal',
        avg_rainfall=9.8,
        nearest_substation=8.5,
        nearest_transmission=4.2,
        current_use='vacant',
        elevation=3850,
        notes='Very arid, rocky terrain, high elevation solar potential'
    )

    # Hudspeth County - Extreme West Texas
    classifier.classify_parcel(
        parcel_id='AFZ-TX-HUDS-001',
        name='Salt Flat Basin Land',
        county='Hudspeth',
        state='TX',
        lat=31.6745,
        lon=-105.1234,
        acres=5600,
        soil_quality='marginal',
        avg_rainfall=8.5,
        nearest_substation=12.0,
        nearest_transmission=3.5,
        current_use='vacant',
        elevation=3600,
        notes='Salt flat basin, one of driest areas in Texas, near transmission'
    )

    # ========================================================================
    # BROWNFIELD SITES - INDUSTRIAL & MINING
    # ========================================================================
    print("[2/6] Brownfield Sites...")

    # Harris County - Houston Industrial Brownfields
    classifier.classify_parcel(
        parcel_id='AFZ-TX-HARR-BF-001',
        name='East Houston Industrial Complex',
        county='Harris',
        state='TX',
        lat=29.7234,
        lon=-95.2145,
        acres=85,
        soil_quality='moderate',
        is_brownfield=True,
        avg_rainfall=53.0,
        nearest_substation=0.4,
        nearest_transmission=1.2,
        current_use='vacant',
        elevation=45,
        notes='Former petrochemical facility, remediated, excellent grid access'
    )

    classifier.classify_parcel(
        parcel_id='AFZ-TX-HARR-BF-002',
        name='Ship Channel Industrial Site',
        county='Harris',
        state='TX',
        lat=29.7512,
        lon=-95.2567,
        acres=120,
        soil_quality='moderate',
        is_brownfield=True,
        avg_rainfall=53.0,
        nearest_substation=0.6,
        nearest_transmission=0.8,
        current_use='vacant',
        elevation=35,
        notes='Former refinery site, Phase II remediation complete, substation adjacent'
    )

    # Jefferson County - Beaumont Industrial
    classifier.classify_parcel(
        parcel_id='AFZ-TX-JEFF-BF-001',
        name='Beaumont Refinery Brownfield',
        county='Jefferson',
        state='TX',
        lat=30.0803,
        lon=-94.1065,
        acres=95,
        soil_quality='moderate',
        is_brownfield=True,
        avg_rainfall=61.0,
        nearest_substation=0.3,
        nearest_transmission=1.5,
        current_use='industrial',
        elevation=20,
        notes='Decommissioned refinery, cleanup certified, data center potential'
    )

    # Webb County - Laredo Industrial
    classifier.classify_parcel(
        parcel_id='AFZ-TX-WEBB-BF-001',
        name='Laredo Rail Yard Brownfield',
        county='Webb',
        state='TX',
        lat=27.5064,
        lon=-99.5073,
        acres=65,
        soil_quality='moderate',
        is_brownfield=True,
        avg_rainfall=19.5,
        nearest_substation=0.9,
        nearest_transmission=2.1,
        current_use='vacant',
        elevation=430,
        notes='Former rail maintenance facility, environmental clearance obtained'
    )

    # ========================================================================
    # CENTRAL TEXAS - MARGINAL LAND WITH GRID ACCESS
    # ========================================================================
    print("[3/6] Central Texas Marginal Land...")

    # Bosque County - Rocky Marginal Ranch
    classifier.classify_parcel(
        parcel_id='AFZ-TX-BOSQ-001',
        name='Meridian Rocky Ranch',
        county='Bosque',
        state='TX',
        lat=31.9234,
        lon=-97.6123,
        acres=580,
        soil_quality='marginal',
        avg_rainfall=33.5,
        nearest_substation=2.8,
        nearest_transmission=1.4,
        current_use='grazing',
        elevation=780,
        notes='Rocky limestone terrain, limited crop potential, excellent solar access'
    )

    classifier.classify_parcel(
        parcel_id='AFZ-TX-BOSQ-002',
        name='Clifton Hillside Tract',
        county='Bosque',
        state='TX',
        lat=31.7845,
        lon=-97.5734,
        acres=420,
        soil_quality='marginal',
        avg_rainfall=32.8,
        nearest_substation=3.5,
        nearest_transmission=0.9,
        current_use='vacant',
        elevation=820,
        notes='Steep slopes, shallow soil, transmission line crosses property'
    )

    # Coryell County - Fort Hood Adjacent
    classifier.classify_parcel(
        parcel_id='AFZ-TX-CORY-001',
        name='Fort Cavazos Perimeter Land',
        county='Coryell',
        state='TX',
        lat=31.1345,
        lon=-97.7823,
        acres=750,
        soil_quality='marginal',
        avg_rainfall=32.0,
        nearest_substation=1.2,
        nearest_transmission=0.5,
        current_use='military buffer',
        elevation=1020,
        notes='Rocky marginal land, adjacent to military base, excellent grid'
    )

    # Lampasas County - Hill Country Marginal
    classifier.classify_parcel(
        parcel_id='AFZ-TX-LAMP-001',
        name='Lampasas Caliche Hills',
        county='Lampasas',
        state='TX',
        lat=31.0634,
        lon=-98.1823,
        acres=640,
        soil_quality='marginal',
        avg_rainfall=30.5,
        nearest_substation=4.2,
        nearest_transmission=2.3,
        current_use='grazing',
        elevation=1150,
        notes='Heavy caliche deposits, poor soil quality, moderate grid access'
    )

    # ========================================================================
    # PANHANDLE - ARID GRASSLAND & MARGINAL CROPLAND
    # ========================================================================
    print("[4/6] Texas Panhandle Arid Regions...")

    # Deaf Smith County - High Plains
    classifier.classify_parcel(
        parcel_id='AFZ-TX-DEAF-001',
        name='Hereford Dry Cropland',
        county='Deaf Smith',
        state='TX',
        lat=34.8123,
        lon=-102.3987,
        acres=1920,
        soil_quality='marginal',
        avg_rainfall=18.5,
        nearest_substation=7.8,
        nearest_transmission=3.2,
        current_use='dryland farming',
        elevation=3800,
        notes='Marginal dryland farming, aquifer depletion, solar conversion candidate'
    )

    # Hartley County - Northwest Panhandle
    classifier.classify_parcel(
        parcel_id='AFZ-TX-HART-001',
        name='Dalhart Arid Ranch',
        county='Hartley',
        state='TX',
        lat=36.0234,
        lon=-102.5123,
        acres=2800,
        soil_quality='marginal',
        avg_rainfall=17.2,
        nearest_substation=9.5,
        nearest_transmission=4.8,
        current_use='grazing',
        elevation=3950,
        notes='Arid shortgrass prairie, wind and solar potential, moderate grid distance'
    )

    # Oldham County - Panhandle Arid
    classifier.classify_parcel(
        parcel_id='AFZ-TX-OLD-001',
        name='Vega Grassland Tract',
        county='Oldham',
        state='TX',
        lat=35.2434,
        lon=-102.4278,
        acres=3400,
        soil_quality='marginal',
        avg_rainfall=19.0,
        nearest_substation=6.2,
        nearest_transmission=2.5,
        current_use='grazing',
        elevation=3750,
        notes='Marginal grazing land, low rainfall, renewable energy potential'
    )

    # ========================================================================
    # SOUTH TEXAS - ARID BRUSHLAND
    # ========================================================================
    print("[5/6] South Texas Arid Brushland...")

    # Zavala County - Winter Garden Region
    classifier.classify_parcel(
        parcel_id='AFZ-TX-ZAVA-001',
        name='Crystal City Brushland',
        county='Zavala',
        state='TX',
        lat=28.6767,
        lon=-99.8234,
        acres=1600,
        soil_quality='marginal',
        avg_rainfall=21.5,
        nearest_substation=5.5,
        nearest_transmission=3.1,
        current_use='brush',
        elevation=580,
        notes='Dense brush, marginal agricultural value, solar farm potential'
    )

    # Dimmit County - Brush Country
    classifier.classify_parcel(
        parcel_id='AFZ-TX-DIMM-001',
        name='Carrizo Springs Arid Land',
        county='Dimmit',
        state='TX',
        lat=28.5234,
        lon=-99.8567,
        acres=2200,
        soil_quality='marginal',
        avg_rainfall=20.8,
        nearest_substation=8.2,
        nearest_transmission=4.5,
        current_use='brush',
        elevation=620,
        notes='Mesquite brushland, arid conditions, marginal for agriculture'
    )

    # Jim Hogg County - Far South Texas
    classifier.classify_parcel(
        parcel_id='AFZ-TX-HOGG-001',
        name='Hebbronville Ranch',
        county='Jim Hogg',
        state='TX',
        lat=27.3123,
        lon=-98.6934,
        acres=4800,
        soil_quality='marginal',
        avg_rainfall=23.5,
        nearest_substation=11.0,
        nearest_transmission=6.8,
        current_use='ranch',
        elevation=450,
        notes='Large ranch, marginal grazing, far from grid infrastructure'
    )

    # ========================================================================
    # MIXED CRITERIA - MULTIPLE AFZ QUALIFICATIONS
    # ========================================================================
    print("[6/6] Multi-Criteria AFZ Sites...")

    # Reeves County - Arid Brownfield
    classifier.classify_parcel(
        parcel_id='AFZ-TX-REEV-001',
        name='Pecos Industrial Brownfield',
        county='Reeves',
        state='TX',
        lat=31.4234,
        lon=-103.4923,
        acres=180,
        soil_quality='marginal',
        is_brownfield=True,
        avg_rainfall=11.2,
        nearest_substation=1.8,
        nearest_transmission=0.6,
        current_use='industrial',
        elevation=2580,
        notes='Former oil field facility, remediated brownfield in arid region, excellent grid'
    )

    # El Paso County - Urban Brownfield in Arid Region
    classifier.classify_parcel(
        parcel_id='AFZ-TX-ELPA-001',
        name='El Paso East Industrial Park',
        county='El Paso',
        state='TX',
        lat=31.7619,
        lon=-106.2886,
        acres=95,
        soil_quality='marginal',
        is_brownfield=True,
        avg_rainfall=9.4,
        nearest_substation=0.5,
        nearest_transmission=1.1,
        current_use='vacant',
        elevation=3740,
        notes='Remediated industrial site, extremely arid, substation adjacent'
    )

    # Ward County - Oil Field Brownfield
    classifier.classify_parcel(
        parcel_id='AFZ-TX-WARD-001',
        name='Monahans Oilfield Reclamation',
        county='Ward',
        state='TX',
        lat=31.5934,
        lon=-102.8923,
        acres=240,
        soil_quality='marginal',
        is_brownfield=True,
        avg_rainfall=13.5,
        nearest_substation=2.3,
        nearest_transmission=1.7,
        current_use='reclamation',
        elevation=2650,
        notes='Former drilling site, soil remediation complete, arid environment'
    )

    # Winkler County - Permian Basin Brownfield
    classifier.classify_parcel(
        parcel_id='AFZ-TX-WINK-001',
        name='Kermit Industrial Brownfield',
        county='Winkler',
        state='TX',
        lat=31.8567,
        lon=-103.0923,
        acres=160,
        soil_quality='marginal',
        is_brownfield=True,
        avg_rainfall=14.0,
        nearest_substation=1.5,
        nearest_transmission=2.0,
        current_use='vacant',
        elevation=2710,
        notes='Remediated oil & gas facility, arid climate, good grid access'
    )

    # Andrews County - Marginal Arid with Grid
    classifier.classify_parcel(
        parcel_id='AFZ-TX-ANDR-001',
        name='Andrews Energy Corridor',
        county='Andrews',
        state='TX',
        lat=32.3234,
        lon=-102.5487,
        acres=3200,
        soil_quality='marginal',
        avg_rainfall=15.5,
        nearest_substation=3.8,
        nearest_transmission=0.8,
        current_use='energy',
        elevation=3140,
        notes='Marginal land along transmission corridor, arid conditions, energy infrastructure'
    )

    # Ector County - Permian Basin Arid Marginal
    classifier.classify_parcel(
        parcel_id='AFZ-TX-ECTO-001',
        name='Odessa West Tract',
        county='Ector',
        state='TX',
        lat=31.8457,
        lon=-102.5123,
        acres=1400,
        soil_quality='marginal',
        avg_rainfall=14.8,
        nearest_substation=4.5,
        nearest_transmission=2.2,
        current_use='vacant',
        elevation=2890,
        notes='Arid marginal land, oil & gas region infrastructure, solar potential'
    )

    # ========================================================================
    # ADDITIONAL STRATEGIC SITES
    # ========================================================================

    # Taylor County - Abilene Area
    classifier.classify_parcel(
        parcel_id='AFZ-TX-TAYL-001',
        name='Abilene South Marginal Ranch',
        county='Taylor',
        state='TX',
        lat=32.3489,
        lon=-99.7331,
        acres=920,
        soil_quality='marginal',
        avg_rainfall=24.5,
        nearest_substation=5.2,
        nearest_transmission=3.1,
        current_use='grazing',
        elevation=1710,
        notes='Rocky marginal grazing land, moderate grid access'
    )

    # Nolan County - West Central Texas
    classifier.classify_parcel(
        parcel_id='AFZ-TX-NOLA-001',
        name='Sweetwater Wind Corridor',
        county='Nolan',
        state='TX',
        lat=32.4712,
        lon=-100.4067,
        acres=2600,
        soil_quality='marginal',
        avg_rainfall=22.0,
        nearest_substation=2.8,
        nearest_transmission=1.2,
        current_use='wind energy',
        elevation=2160,
        notes='Marginal land with existing wind farms, good grid infrastructure'
    )

    # Upton County - Permian Basin
    classifier.classify_parcel(
        parcel_id='AFZ-TX-UPTO-001',
        name='Rankin Arid Rangeland',
        county='Upton',
        state='TX',
        lat=31.2234,
        lon=-101.9423,
        acres=5200,
        soil_quality='marginal',
        avg_rainfall=16.5,
        nearest_substation=7.5,
        nearest_transmission=4.2,
        current_use='grazing',
        elevation=2520,
        notes='Large arid ranch, marginal grazing, energy development potential'
    )

    # Terrell County - Remote West Texas
    classifier.classify_parcel(
        parcel_id='AFZ-TX-TERR-001',
        name='Sanderson Desert Ranch',
        county='Terrell',
        state='TX',
        lat=30.1423,
        lon=-102.3945,
        acres=8400,
        soil_quality='marginal',
        avg_rainfall=13.2,
        nearest_substation=18.5,
        nearest_transmission=12.3,
        current_use='ranch',
        elevation=2250,
        notes='Very large remote ranch, extremely arid, distant from grid'
    )

    # Presidio County - Big Bend Region
    classifier.classify_parcel(
        parcel_id='AFZ-TX-PRES-001',
        name='Marfa Plateau Arid Land',
        county='Presidio',
        state='TX',
        lat=30.3089,
        lon=-104.0178,
        acres=6800,
        soil_quality='marginal',
        avg_rainfall=15.7,
        nearest_substation=14.2,
        nearest_transmission=8.5,
        current_use='vacant',
        elevation=4685,
        notes='High desert plateau, scenic area, limited infrastructure'
    )

    print("\n" + "=" * 70)
    print("AFZ DATA GENERATION COMPLETE")
    print("=" * 70)

    # Display statistics
    stats = classifier.get_statistics()
    print(f"\nTotal Parcels Generated: {stats['total_parcels']}")
    print(f"AFZ Eligible Parcels: {stats['eligible_parcels']}")
    print(f"Total Eligible Acres: {stats['total_acres']:,.0f}")
    print(f"Average AFZ Score: {stats['avg_score']:.1f}/100")

    print(f"\nBy AFZ Criteria:")
    for criteria, count in stats['by_criteria'].items():
        print(f"  • {criteria}: {count} parcels")

    print(f"\nBrownfield Sites: {stats['brownfield_count']}")
    print(f"Arid Regions: {stats['arid_region_count']}")
    print(f"Grid Access: {stats['grid_access_count']}")

    print(f"\nTop Counties by Parcel Count:")
    county_counts = sorted(stats['by_county'].items(), key=lambda x: x[1], reverse=True)
    for county, count in county_counts[:10]:
        print(f"  • {county}: {count} parcels")

    # Create output directory if it doesn't exist
    os.makedirs('data', exist_ok=True)

    # Export to JSON and GeoJSON
    print("\n" + "=" * 70)
    print("EXPORTING DATA FILES")
    print("=" * 70)

    json_file = classifier.export_to_json('data/afz_parcels.json', min_score=30)
    print(f"✓ JSON Database: {json_file}")

    geojson_file = classifier.export_to_geojson('data/afz_parcels.geojson', min_score=30)
    print(f"✓ GeoJSON Map Data: {geojson_file}")

    print("\n✓ AFZ Database Generation Complete!")
    print(f"✓ {stats['eligible_parcels']} parcels ready for deployment")

    return classifier


if __name__ == '__main__':
    generate_texas_afz_data()
