import React, {useContext, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  MapPressEvent,
} from 'react-native-maps';
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
  editable?: boolean;
  onLocationChange?: (location: {latitude: number; longitude: number}) => void;
}

const ProductLocationMap: React.FC<ProductLocationMapProps> = ({
  location,
  height = 200,
  showOpenInMapsButton = true,
  productTitle,
  editable = false,
  onLocationChange,
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Default location (Lebanon/Beirut)
  const defaultLocation = {
    name: 'Lebanon',
    latitude: 33.8547,
    longitude: 35.8623,
  };

  const mapLocation = location || defaultLocation;

  // Map region configuration
  const initialRegion: Region = {
    latitude: mapLocation.latitude,
    longitude: mapLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Dark mode map style
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
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}],
        },
      ]
    : [];

  // Handle opening location in external maps app
  const openInMaps = useCallback(() => {
    const {latitude, longitude} = mapLocation;
    const label = productTitle
      ? `${productTitle} - ${mapLocation.name}`
      : mapLocation.name;

    Alert.alert('Open in Maps', 'Choose your preferred maps application', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: Platform.OS === 'ios' ? 'Apple Maps' : 'Google Maps',
        onPress: () => {
          const url =
            Platform.OS === 'ios'
              ? `maps:0,0?q=${latitude},${longitude}`
              : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(
                  label,
                )})`;

          Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            } else {
              // Fallback to web version
              const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
              Linking.openURL(webUrl);
            }
          });
        },
      },
      {
        text: 'Google Maps (Web)',
        onPress: () => {
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          Linking.openURL(webUrl);
        },
      },
    ]);
  }, [mapLocation, productTitle]);

  // Handle map press for editable maps
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (editable && onLocationChange) {
        const {coordinate} = event.nativeEvent;
        onLocationChange({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        });
      }
    },
    [editable, onLocationChange],
  );

  // Handle map loading
  const handleMapReady = useCallback(() => {
    setIsLoading(false);
    setMapError(false);
  }, []);

  // Handle map errors
  const handleMapError = useCallback((error: any) => {
    console.error('Map error:', error);
    setMapError(true);
    setIsLoading(false);
  }, []);

  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.card,
      position: 'relative',
    },
    mapContainer: {
      height: height,
      position: 'relative',
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
      textAlign: 'center',
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
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
      zIndex: 1,
    },
    errorContainer: {
      height: height,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    errorText: {
      ...getFontStyle('regular', 14),
      color: colors.error,
      marginTop: 8,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginTop: 12,
    },
    retryButtonText: {
      ...getFontStyle('medium', 12),
      color: '#FFFFFF',
    },
    editableHint: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 6,
    },
    editableHintText: {
      ...getFontStyle('regular', 12),
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

  // Show message if no location is available
  if (!location && !editable) {
    return (
      <View style={styles.container}>
        <View style={styles.noLocationContainer}>
          <Icon name="map-marker-off" size={32} color={colors.text} />
          <Text style={styles.noLocationText}>
            Location not available for this product
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (mapError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="map-marker-alert" size={32} color={colors.error} />
          <Text style={styles.errorText}>
            Unable to load map{'\n'}Check your internet connection
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setMapError(false);
              setIsLoading(true);
            }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.noLocationText}>Loading map...</Text>
          </View>
        )}

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          customMapStyle={mapStyle}
          onPress={handleMapPress}
          onMapReady={handleMapReady}
          onError={handleMapError}
          showsUserLocation={editable}
          showsMyLocationButton={editable}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
          loadingEnabled={true}
          loadingIndicatorColor={colors.primary}
          loadingBackgroundColor={colors.background}>
          <Marker
            coordinate={{
              latitude: mapLocation.latitude,
              longitude: mapLocation.longitude,
            }}
            title={productTitle || 'Product Location'}
            description={mapLocation.name}
            draggable={editable}
            onDragEnd={editable ? handleMapPress : undefined}>
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
        {showOpenInMapsButton && !editable && (
          <TouchableOpacity style={styles.overlayButton} onPress={openInMaps}>
            <Icon name="open-in-new" size={14} color="#333333" />
            <Text style={styles.overlayButtonText}>Open</Text>
          </TouchableOpacity>
        )}

        {/* Editable Hint */}
        {editable && (
          <View style={styles.editableHint}>
            <Text style={styles.editableHintText}>
              Tap on the map to change location
            </Text>
          </View>
        )}
      </View>

      {/* Location Information */}
      <View style={styles.locationInfo}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle} numberOfLines={1}>
            📍 {mapLocation.name}
          </Text>
          {showOpenInMapsButton && !editable && (
            <TouchableOpacity style={styles.openButton} onPress={openInMaps}>
              <Icon name="directions" size={16} color="#FFFFFF" />
              <Text style={styles.openButtonText}>Directions</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.coordinatesText}>
          {mapLocation.latitude.toFixed(6)}, {mapLocation.longitude.toFixed(6)}
        </Text>
        {editable && (
          <Text style={[styles.coordinatesText, {marginTop: 8}]}>
            Tap the map or drag the marker to select location
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProductLocationMap;
