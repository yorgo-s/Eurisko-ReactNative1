import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {ThemeContext} from '../../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ProductLocationMapProps {
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  height?: number;
  showOpenInMapsButton?: boolean;
  productTitle?: string;
}

const ProductLocationMap: React.FC<ProductLocationMapProps> = ({
  location,
  height = 200,
  showOpenInMapsButton = true,
  productTitle,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  // Default location (Lebanon) if no location provided
  const defaultLocation = {
    name: 'Lebanon',
    latitude: 33.8547,
    longitude: 35.8623,
  };

  const mapLocation = location || defaultLocation;

  // Map style for dark mode
  const mapStyle = isDarkMode
    ? [
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
      ]
    : [];

  // Handle opening location in external maps app
  const openInMaps = () => {
    const {latitude, longitude} = mapLocation;
    const label = productTitle
      ? `${productTitle} - ${mapLocation.name}`
      : mapLocation.name;

    // Create URLs for different map apps
    const appleUrl = `maps:0,0?q=${latitude},${longitude}`;
    const googleUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(
      label,
    )})`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Alert.alert('Open in Maps', 'Choose your preferred maps application', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
        onPress: () => {
          const url = Platform.OS === 'ios' ? appleUrl : googleUrl;
          Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            } else {
              Linking.openURL(webUrl);
            }
          });
        },
      },
      {
        text: 'Web Browser',
        onPress: () => Linking.openURL(webUrl),
      },
    ]);
  };

  // Handle map press to open external maps
  const handleMapPress = () => {
    if (showOpenInMapsButton) {
      openInMaps();
    }
  };

  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    mapContainer: {
      height: height,
    },
    map: {
      flex: 1,
    },
    locationInfo: {
      padding: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    locationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    locationTitle: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
      flex: 1,
    },
    openButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    openButtonText: {
      ...getFontStyle('medium', 14),
      color: '#FFFFFF',
      marginLeft: 4,
    },
    locationName: {
      ...getFontStyle('regular', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
    },
    coordinatesText: {
      ...getFontStyle('regular', 12),
      color: isDarkMode ? '#888888' : '#999999',
      marginTop: 4,
    },
    noLocationContainer: {
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    noLocationText: {
      ...getFontStyle('regular', 16),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginTop: 8,
    },
    overlayButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    overlayButtonText: {
      ...getFontStyle('medium', 12),
      color: '#333333',
      marginLeft: 4,
    },
  });

  // Show message if no location is available
  if (!location) {
    return (
      <View style={styles.container}>
        <View style={styles.noLocationContainer}>
          <Icon name="map-marker-off" size={32} color={colors.text} />
          <Text style={styles.noLocationText}>Location not available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: mapLocation.latitude,
            longitude: mapLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          customMapStyle={mapStyle}
          onPress={handleMapPress}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}>
          <Marker
            coordinate={{
              latitude: mapLocation.latitude,
              longitude: mapLocation.longitude,
            }}
            title={productTitle || 'Product Location'}
            description={mapLocation.name}>
            <View
              style={{
                backgroundColor: colors.primary,
                padding: 8,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}>
              <Icon name="shopping" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        </MapView>

        {/* Overlay Open Button */}
        {showOpenInMapsButton && (
          <TouchableOpacity style={styles.overlayButton} onPress={openInMaps}>
            <Icon name="open-in-new" size={14} color="#333333" />
            <Text style={styles.overlayButtonText}>Open</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location Information */}
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle} numberOfLines={1}>
            📍 {mapLocation.name}
          </Text>
          {showOpenInMapsButton && (
            <TouchableOpacity style={styles.openButton} onPress={openInMaps}>
              <Icon name="directions" size={16} color="#FFFFFF" />
              <Text style={styles.openButtonText}>Directions</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.coordinatesText}>
          {mapLocation.latitude.toFixed(6)}, {mapLocation.longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );
};

export default ProductLocationMap;
