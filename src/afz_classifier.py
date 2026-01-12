#!/usr/bin/env python3
"""
Agriculture Freedom Zone (AFZ) Land Classifier
Identifies and classifies land parcels eligible for AFZ designation based on:
- Marginal land characteristics
- Brownfield sites
- Arid regions
- Existing grid access proximity
"""

import json
import math
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict


@dataclass
class AFZParcel:
    """Represents a land parcel eligible for AFZ designation"""
    id: str
    name: str
    county: str
    state: str
    latitude: float
    longitude: float
    acres: float
    afz_criteria: List[str]  # List of qualifying criteria
    score: int  # AFZ eligibility score (0-100)

    # Land characteristics
    soil_quality: str  # 'marginal', 'moderate', 'prime'
    is_brownfield: bool
    is_arid: bool
    avg_rainfall_inches: float

    # Infrastructure
    nearest_substation_miles: float
    nearest_transmission_miles: float
    has_grid_access: bool

    # Additional data
    current_use: str
    elevation_ft: int
    water_access: str
    notes: str


class AFZClassifier:
    """Classifies land parcels for AFZ eligibility"""

    # AFZ Criteria Thresholds
    MARGINAL_SOIL_TYPES = [
        'rocky', 'shallow', 'steep', 'sandy', 'clay_heavy',
        'poor_drainage', 'low_fertility', 'erosion_prone'
    ]

    ARID_RAINFALL_THRESHOLD = 20.0  # inches per year
    GRID_ACCESS_DISTANCE_MILES = 5.0  # Max distance to substation/transmission

    # Scoring weights
    WEIGHTS = {
        'marginal_land': 30,
        'brownfield': 35,
        'arid_region': 25,
        'grid_access': 30,
        'proximity_bonus': 10
    }

    def __init__(self):
        """Initialize the AFZ classifier"""
        self.parcels: List[AFZParcel] = []

    def classify_parcel(
        self,
        parcel_id: str,
        name: str,
        county: str,
        state: str,
        lat: float,
        lon: float,
        acres: float,
        soil_quality: str = 'moderate',
        is_brownfield: bool = False,
        avg_rainfall: float = 30.0,
        nearest_substation: float = 10.0,
        nearest_transmission: float = 10.0,
        current_use: str = 'vacant',
        elevation: int = 500,
        water_access: str = 'none',
        notes: str = ''
    ) -> AFZParcel:
        """
        Classify a land parcel for AFZ eligibility

        Returns:
            AFZParcel object with eligibility assessment
        """
        criteria = []
        score = 0

        # Check marginal land
        is_marginal = soil_quality == 'marginal'
        if is_marginal:
            criteria.append('Marginal Land')
            score += self.WEIGHTS['marginal_land']

        # Check brownfield status
        if is_brownfield:
            criteria.append('Brownfield Site')
            score += self.WEIGHTS['brownfield']

        # Check arid region
        is_arid = avg_rainfall < self.ARID_RAINFALL_THRESHOLD
        if is_arid:
            criteria.append('Arid Region')
            score += self.WEIGHTS['arid_region']

        # Check grid access
        has_grid = (
            nearest_substation <= self.GRID_ACCESS_DISTANCE_MILES or
            nearest_transmission <= self.GRID_ACCESS_DISTANCE_MILES
        )
        if has_grid:
            criteria.append('Grid Access')
            score += self.WEIGHTS['grid_access']

        # Proximity bonus (very close to grid)
        if nearest_substation <= 1.0 or nearest_transmission <= 1.0:
            score += self.WEIGHTS['proximity_bonus']

        # Cap score at 100
        score = min(score, 100)

        parcel = AFZParcel(
            id=parcel_id,
            name=name,
            county=county,
            state=state,
            latitude=lat,
            longitude=lon,
            acres=acres,
            afz_criteria=criteria,
            score=score,
            soil_quality=soil_quality,
            is_brownfield=is_brownfield,
            is_arid=is_arid,
            avg_rainfall_inches=avg_rainfall,
            nearest_substation_miles=nearest_substation,
            nearest_transmission_miles=nearest_transmission,
            has_grid_access=has_grid,
            current_use=current_use,
            elevation_ft=elevation,
            water_access=water_access,
            notes=notes
        )

        self.parcels.append(parcel)
        return parcel

    def get_eligible_parcels(self, min_score: int = 30) -> List[AFZParcel]:
        """Get all parcels meeting minimum AFZ eligibility score"""
        return [p for p in self.parcels if p.score >= min_score]

    def filter_by_criteria(self, criteria: str) -> List[AFZParcel]:
        """Filter parcels by specific AFZ criteria"""
        return [p for p in self.parcels if criteria in p.afz_criteria]

    def filter_by_county(self, county: str) -> List[AFZParcel]:
        """Filter parcels by county"""
        return [p for p in self.parcels if p.county.lower() == county.lower()]

    def get_statistics(self) -> Dict:
        """Get statistics about AFZ-eligible parcels"""
        if not self.parcels:
            return {
                'total_parcels': 0,
                'eligible_parcels': 0,
                'total_acres': 0,
                'by_criteria': {}
            }

        eligible = self.get_eligible_parcels()

        criteria_counts = {}
        for parcel in eligible:
            for criterion in parcel.afz_criteria:
                criteria_counts[criterion] = criteria_counts.get(criterion, 0) + 1

        return {
            'total_parcels': len(self.parcels),
            'eligible_parcels': len(eligible),
            'total_acres': sum(p.acres for p in eligible),
            'avg_score': sum(p.score for p in eligible) / len(eligible) if eligible else 0,
            'by_criteria': criteria_counts,
            'by_county': self._count_by_field(eligible, 'county'),
            'by_soil_quality': self._count_by_field(eligible, 'soil_quality'),
            'brownfield_count': sum(1 for p in eligible if p.is_brownfield),
            'arid_region_count': sum(1 for p in eligible if p.is_arid),
            'grid_access_count': sum(1 for p in eligible if p.has_grid_access)
        }

    def _count_by_field(self, parcels: List[AFZParcel], field: str) -> Dict[str, int]:
        """Count parcels by a specific field"""
        counts = {}
        for parcel in parcels:
            value = getattr(parcel, field)
            counts[value] = counts.get(value, 0) + 1
        return counts

    def export_to_json(self, filepath: str, min_score: int = 30):
        """Export eligible parcels to JSON file"""
        eligible = self.get_eligible_parcels(min_score)
        data = {
            'metadata': {
                'total_parcels': len(eligible),
                'total_acres': sum(p.acres for p in eligible),
                'min_score': min_score,
                'generated_by': 'AFZ Classifier v1.0'
            },
            'statistics': self.get_statistics(),
            'parcels': [asdict(p) for p in eligible]
        }

        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)

        return filepath

    def export_to_geojson(self, filepath: str, min_score: int = 30):
        """Export eligible parcels to GeoJSON format for mapping"""
        eligible = self.get_eligible_parcels(min_score)

        features = []
        for parcel in eligible:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [parcel.longitude, parcel.latitude]
                },
                'properties': {
                    'id': parcel.id,
                    'name': parcel.name,
                    'county': parcel.county,
                    'state': parcel.state,
                    'acres': parcel.acres,
                    'score': parcel.score,
                    'criteria': ', '.join(parcel.afz_criteria),
                    'soil_quality': parcel.soil_quality,
                    'is_brownfield': parcel.is_brownfield,
                    'is_arid': parcel.is_arid,
                    'avg_rainfall': parcel.avg_rainfall_inches,
                    'nearest_substation': parcel.nearest_substation_miles,
                    'has_grid_access': parcel.has_grid_access,
                    'current_use': parcel.current_use,
                    'elevation': parcel.elevation_ft,
                    'notes': parcel.notes
                }
            }
            features.append(feature)

        geojson = {
            'type': 'FeatureCollection',
            'metadata': {
                'total_parcels': len(eligible),
                'total_acres': sum(p.acres for p in eligible)
            },
            'features': features
        }

        with open(filepath, 'w') as f:
            json.dump(geojson, f, indent=2)

        return filepath


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates in miles using Haversine formula
    """
    R = 3959  # Earth's radius in miles

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.asin(math.sqrt(a))

    return R * c


def main():
    """Example usage of AFZ Classifier"""
    classifier = AFZClassifier()

    # Example: Classify some sample parcels
    print("AFZ Land Classifier - Example Usage\n")

    # Sample parcel 1: Marginal land with grid access
    p1 = classifier.classify_parcel(
        parcel_id='AFZ-TX-001',
        name='West Texas Marginal Ranch',
        county='Bosque',
        state='TX',
        lat=31.9,
        lon=-97.6,
        acres=500,
        soil_quality='marginal',
        avg_rainfall=28.0,
        nearest_substation=2.5,
        nearest_transmission=1.2,
        current_use='grazing',
        elevation=800,
        notes='Rocky terrain, limited agricultural value'
    )

    print(f"Parcel: {p1.name}")
    print(f"Score: {p1.score}/100")
    print(f"Criteria: {', '.join(p1.afz_criteria)}\n")

    # Sample parcel 2: Brownfield with grid access
    p2 = classifier.classify_parcel(
        parcel_id='AFZ-TX-002',
        name='Former Industrial Site',
        county='Bosque',
        state='TX',
        lat=31.85,
        lon=-97.55,
        acres=150,
        soil_quality='moderate',
        is_brownfield=True,
        avg_rainfall=30.0,
        nearest_substation=0.8,
        nearest_transmission=3.5,
        current_use='vacant',
        elevation=750,
        notes='Remediated industrial brownfield, ready for redevelopment'
    )

    print(f"Parcel: {p2.name}")
    print(f"Score: {p2.score}/100")
    print(f"Criteria: {', '.join(p2.afz_criteria)}\n")

    # Sample parcel 3: Arid region
    p3 = classifier.classify_parcel(
        parcel_id='AFZ-TX-003',
        name='West Texas Arid Land',
        county='Pecos',
        state='TX',
        lat=31.0,
        lon=-103.5,
        acres=1200,
        soil_quality='marginal',
        avg_rainfall=12.0,
        nearest_substation=4.5,
        nearest_transmission=2.0,
        current_use='vacant',
        elevation=2800,
        notes='Desert scrubland, high solar potential'
    )

    print(f"Parcel: {p3.name}")
    print(f"Score: {p3.score}/100")
    print(f"Criteria: {', '.join(p3.afz_criteria)}\n")

    # Print statistics
    print("=" * 60)
    print("AFZ DATABASE STATISTICS")
    print("=" * 60)
    stats = classifier.get_statistics()
    print(f"Total Parcels: {stats['total_parcels']}")
    print(f"Eligible Parcels: {stats['eligible_parcels']}")
    print(f"Total Acres: {stats['total_acres']:,.0f}")
    print(f"Average Score: {stats['avg_score']:.1f}/100")
    print(f"\nBy Criteria:")
    for criteria, count in stats['by_criteria'].items():
        print(f"  {criteria}: {count}")

    # Export to files
    print("\nExporting data...")
    classifier.export_to_json('data/afz_parcels.json')
    classifier.export_to_geojson('data/afz_parcels.geojson')
    print("✓ Exported to data/afz_parcels.json")
    print("✓ Exported to data/afz_parcels.geojson")


if __name__ == '__main__':
    main()
