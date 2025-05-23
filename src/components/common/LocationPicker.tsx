import React, {useContext, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  MapPressEvent,
} from 'react-native-maps';
import {ThemeContext} from '../../context/ThemeContext';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  initialLocation?: Location;
  title?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLocation,
  title = 'Choose Location',
}) => {
  const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);

  // Default to Lebanon/Beirut
  const defaultLocation = {
    name: 'Lebanon',
    latitude: 33.8547,
    longitude: 35.8623,
  };

  const [selectedLocation, setSelectedLocation] = useState<Location>(
    initialLocation || defaultLocation,
  );
  const [locationName, setLocationName] = useState(initialLocation?.name || '');
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: initialLocation?.latitude || defaultLocation.latitude,
    longitude: initialLocation?.longitude || defaultLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      const location = initialLocation || defaultLocation;
      setSelectedLocation(location);
      setLocationName(location.name);
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMapReady(false);
    }
  }, [visible, initialLocation]);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return result === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setIsLoadingLocation(true);

    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          'Location Permission',
          'Location permission is required to use your current location.',
          [{text: 'OK'}],
        );
        setIsLoadingLocation(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          const newLocation = {
            name: locationName || 'Current Location',
            latitude,
            longitude,
          };

          setSelectedLocation(newLocation);
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });

          if (!locationName) {
            setLocationName('Current Location');
          }

          setIsLoadingLocation(false);
        },
        error => {
          console.error('Geolocation error:', error);
          Alert.alert(
            'Location Error',
            'Unable to get your current location. Please try again or select manually.',
            [{text: 'OK'}],
          );
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    } catch (error) {
      console.error('Get current location error:', error);
      setIsLoadingLocation(false);
    }
  }, [locationName]);

  // Handle map press
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      const {coordinate} = event.nativeEvent;
      const newLocation = {
        name: locationName || 'Selected Location',
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };

      setSelectedLocation(newLocation);
      setMapRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: mapRegion.latitudeDelta,
        longitudeDelta: mapRegion.longitudeDelta,
      });
    },
    [locationName, mapRegion],
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    (event: MapPressEvent) => {
      handleMapPress(event);
    },
    [handleMapPress],
  );

  // Handle confirm
  const handleConfirm = useCallback(() => {
    if (!locationName.trim()) {
      Alert.alert(
        'Location Name Required',
        'Please enter a name for this location.',
      );
      return;
    }

    const finalLocation = {
      ...selectedLocation,
      name: locationName.trim(),
    };

    onLocationSelect(finalLocation);
    onClose();
  }, [selectedLocation, locationName, onLocationSelect, onClose]);

  // Predefined locations for Lebanon
  const predefinedLocations = [
    {name: 'Beirut', latitude: 33.8938, longitude: 35.5018},
    {name: 'Tripoli', latitude: 34.4332, longitude: 35.8498},
    {name: 'Sidon', latitude: 33.5581, longitude: 35.3714},
    {name: 'Baalbek', latitude: 34.0059, longitude: 36.2086},
    {name: 'Jounieh', latitude: 33.9806, longitude: 35.6178},
  ];

  const selectPredefinedLocation = useCallback(
    (location: {name: string; latitude: number; longitude: number}) => {
      setSelectedLocation(location);
      setLocationName(location.name);
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    },
    [],
  );

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      ...getFontStyle('bold', 18),
      color: colors.text,
    },
    headerButton: {
      padding: 4,
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
    },
    map: {
      flex: 1,
    },
    controlsContainer: {
      position: 'absolute',
      top: 16,
      left: 16,
      right: 16,
    },
    locationInputContainer: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    locationNameInput: {
      ...getFontStyle('regular', 16),
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 8,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    quickActionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      marginRight: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    quickActionButtonText: {
      ...getFontStyle('medium', 12),
      color: '#FFFFFF',
      marginLeft: 4,
    },
    predefinedLocationsContainer: {
      position: 'absolute',
      bottom: 80,
      left: 16,
      right: 16,
    },
    predefinedLocationsTitle: {
      ...getFontStyle('medium', 14),
      color: colors.text,
      marginBottom: 8,
      backgroundColor: colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    predefinedLocationsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    predefinedLocationButton: {
      backgroundColor: colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    predefinedLocationText: {
      ...getFontStyle('regular', 12),
      color: colors.text,
    },
    bottomContainer: {
      padding: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    coordinatesText: {
      ...getFontStyle('regular', 12),
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
    },
    confirmButton: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    confirmButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingContainer: {
      backgroundColor: colors.background,
      padding: 20,
      borderRadius: 8,
      alignItems: 'center',
    },
    loadingText: {
      ...getFontStyle('regular', 14),
      color: colors.text,
      marginTop: 8,
    },
    mapInstructions: {
      position: 'absolute',
      bottom: 120,
      left: 16,
      right: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 8,
      borderRadius: 6,
    },
    mapInstructionsText: {
      ...getFontStyle('regular', 12),
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            testID="close-location-picker">
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{width: 32}} />
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            //   initialRegion={initialRegion}
            onPress={handleMapPress}>
            {selectedLocation && <Marker coordinate={selectedLocation} />}
                  
          </MapView>

          {/* Controls Overlay */}
          <View style={styles.controlsContainer}>
            {/* Location Name Input */}
            <View style={styles.locationInputContainer}>
              <TextInput
                style={styles.locationNameInput}
                placeholder="Enter location name"
                placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
                value={locationName}
                onChangeText={setLocationName}
                testID="location-name-input"
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={getCurrentLocation}
                disabled={isLoadingLocation}
                testID="current-location-button">
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Icon name="crosshairs-gps" size={16} color="#FFFFFF" />
                )}
                <Text style={styles.quickActionButtonText}>
                  {isLoadingLocation ? 'Loading...' : 'My Location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Predefined Locations */}
          <View style={styles.predefinedLocationsContainer}>
            <Text style={styles.predefinedLocationsTitle}>Quick Select:</Text>
            <View style={styles.predefinedLocationsGrid}>
              {predefinedLocations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.predefinedLocationButton}
                  onPress={() => selectPredefinedLocation(location)}
                  testID={`predefined-location-${location.name}`}>
                  <Text style={styles.predefinedLocationText}>
                    {location.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Map Instructions */}
          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionsText}>
              Tap on the map or drag the marker to select location
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          <Text style={styles.coordinatesText}>
            📍 {selectedLocation.latitude.toFixed(6)},{' '}
            {selectedLocation.longitude.toFixed(6)}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              testID="cancel-location-button">
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              testID="confirm-location-button">
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Overlay */}
        {isLoadingLocation && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default LocationPicker;
