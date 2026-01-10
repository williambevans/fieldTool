#!/usr/bin/env python3
"""
HH Holdings Energy Intel - GPS Utilities
GPS location capture and site coordinate management for Termux

Author: Bevans Real Estate / HH Holdings
Location: Bosque County, Texas
"""

import json
import subprocess
from datetime import datetime
from typing import Dict, Optional, Tuple


class GPSManager:
    """Manages GPS location capture using termux-location API"""

    def __init__(self):
        self.last_location = None
        self.bosque_county_center = (31.8749, -97.6428)  # Meridian, TX
        self.brazos_river_coords = (31.8500, -97.6000)  # Approximate Brazos location

    def get_current_location(self, provider: str = "gps") -> Optional[Dict]:
        """
        Capture current GPS location using termux-location

        Args:
            provider: GPS provider ('gps', 'network', or 'passive')

        Returns:
            Dictionary with location data or None if failed
        """
        try:
            # Call termux-location with specified provider
            result = subprocess.run(
                ['termux-location', '-p', provider],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0 and result.stdout:
                location_data = json.loads(result.stdout)

                # Add timestamp
                location_data['timestamp'] = datetime.now().isoformat()
                location_data['provider_used'] = provider

                self.last_location = location_data
                return location_data
            else:
                print(f"⚠️  GPS error: {result.stderr}")
                return None

        except subprocess.TimeoutExpired:
            print("⚠️  GPS timeout - trying network provider...")
            if provider != "network":
                return self.get_current_location(provider="network")
            return None

        except FileNotFoundError:
            print("❌ termux-location not found. Install termux-api package.")
            return None

        except json.JSONDecodeError:
            print("❌ Invalid GPS data received")
            return None
        except Exception as e:
            print(f"❌ GPS error: {e}")
            return None

    def format_coordinates(self, location: Dict) -> str:
        """Format coordinates for display"""
        lat = location.get('latitude', 0)
        lon = location.get('longitude', 0)
        accuracy = location.get('accuracy', 0)

        return f"{lat:.6f}°N, {lon:.6f}°W (±{accuracy:.1f}m)"

    def calculate_distance(self, lat1: float, lon1: float,
                          lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula

        Returns:
            Distance in miles
        """
        from math import radians, sin, cos, sqrt, atan2

        # Earth radius in miles
        R = 3958.8

        # Convert to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))

        return R * c

    def distance_to_brazos(self, location: Dict) -> float:
        """Calculate distance from current location to Brazos River"""
        lat = location.get('latitude', 0)
        lon = location.get('longitude', 0)

        return self.calculate_distance(
            lat, lon,
            self.brazos_river_coords[0], self.brazos_river_coords[1]
        )

    def is_in_bosque_county(self, location: Dict) -> bool:
        """
        Check if location is approximately in Bosque County
        Simple boundary check (31.65-32.10 N, 97.40-98.00 W)
        """
        lat = location.get('latitude', 0)
        lon = location.get('longitude', 0)

        return (31.65 <= lat <= 32.10 and -98.00 <= lon <= -97.40)

    def get_location_context(self, location: Dict) -> Dict:
        """Get contextual information about a location"""
        context = {
            'in_bosque_county': self.is_in_bosque_county(location),
            'distance_to_brazos_miles': round(self.distance_to_brazos(location), 2),
            'coordinates': self.format_coordinates(location),
            'latitude': location.get('latitude', 0),
            'longitude': location.get('longitude', 0),
            'altitude_meters': location.get('altitude', 0),
            'accuracy_meters': location.get('accuracy', 0),
            'timestamp': location.get('timestamp', datetime.now().isoformat())
        }

        # Determine territory
        if context['in_bosque_county']:
            context['territory'] = 'Bosque County (Oncor Territory)'
        else:
            context['territory'] = 'Outside Bosque County'

        # Water proximity assessment
        if context['distance_to_brazos_miles'] < 5:
            context['water_access'] = 'Excellent - Brazos River proximity'
        elif context['distance_to_brazos_miles'] < 15:
            context['water_access'] = 'Good - Reasonable Brazos River access'
        else:
            context['water_access'] = 'Limited - Distant from Brazos River'

        return context


def test_gps():
    """Test GPS functionality"""
    print("🦅 EAGLE GPS Test - HH Holdings Energy Intel")
    print("=" * 50)

    gps = GPSManager()

    print("\n📍 Capturing GPS location...")
    location = gps.get_current_location()

    if location:
        print("✅ GPS acquired!")
        context = gps.get_location_context(location)

        print(f"\n📍 Location: {context['coordinates']}")
        print(f"🗺️  Territory: {context['territory']}")
        print(f"🌊 Brazos River: {context['distance_to_brazos_miles']} miles")
        print(f"💧 Water Access: {context['water_access']}")
        print(f"📏 Altitude: {context['altitude_meters']:.1f}m")
    else:
        print("❌ GPS capture failed")
        print("\n🔧 Fallback: Using Bosque County center coordinates")
        print(f"📍 {gps.bosque_county_center[0]:.6f}°N, {gps.bosque_county_center[1]:.6f}°W")


if __name__ == "__main__":
    test_gps()
