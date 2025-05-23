// src/utils/mapsConfig.ts
import {Platform} from 'react-native';

// Replace with your actual Google Maps API Key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCJ-N7-0fl-3ykTZf6TDN94sciPHPM5MEQ';

// Lebanon default coordinates
export const DEFAULT_LOCATION = {
  latitude: 33.8547,
  longitude: 35.8623,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Common Lebanese cities
export const LEBANESE_CITIES = [
  {name: 'Beirut', latitude: 33.8938, longitude: 35.5018},
  {name: 'Tripoli', latitude: 34.4332, longitude: 35.8498},
  {name: 'Sidon', latitude: 33.5581, longitude: 35.3714},
  {name: 'Tyre', latitude: 33.2704, longitude: 35.2038},
  {name: 'Baalbek', latitude: 34.0059, longitude: 36.2086},
  {name: 'Jounieh', latitude: 33.9806, longitude: 35.6178},
  {name: 'Zahle', latitude: 33.8469, longitude: 35.9019},
  {name: 'Byblos', latitude: 34.1208, longitude: 35.6481},
  {name: 'Douma', latitude: 34.0997, longitude: 35.8339},
  {name: 'Batroun', latitude: 34.2553, longitude: 35.6581},
];

// Dark mode map style
export const DARK_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{color: '#242f3e'}],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{color: '#242f3e'}],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{color: '#746855'}],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}],
  },
];

// Map configuration
export const MAP_CONFIG = {
  provider: 'google' as const,
  showsUserLocation: true,
  showsMyLocationButton: false,
  showsCompass: true,
  showsPointsOfInterest: true,
  showsBuildings: true,
  showsTraffic: false,
  showsIndoors: true,
  rotateEnabled: false,
  pitchEnabled: false,
  scrollEnabled: true,
  zoomEnabled: true,
  loadingEnabled: true,
};

// Utility functions
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const getDistanceBetweenPoints = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const openInExternalMaps = (
  latitude: number,
  longitude: number,
  label?: string,
) => {
  const encodedLabel = label ? encodeURIComponent(label) : '';

  if (Platform.OS === 'ios') {
    return `maps:0,0?q=${latitude},${longitude}${
      label ? `(${encodedLabel})` : ''
    }`;
  } else {
    return `geo:${latitude},${longitude}?q=${latitude},${longitude}${
      label ? `(${encodedLabel})` : ''
    }`;
  }
};

export const openInGoogleMapsWeb = (
  latitude: number,
  longitude: number,
  label?: string,
) => {
  const params = new URLSearchParams({
    api: '1',
    query: `${latitude},${longitude}`,
  });

  if (label) {
    params.set('query', `${latitude},${longitude}(${label})`);
  }

  return `https://www.google.com/maps/search/?${params.toString()}`;
};

// Geocoding utilities (if you want to add reverse geocoding)
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

export const geocode = async (
  address: string,
): Promise<{latitude: number; longitude: number} | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
