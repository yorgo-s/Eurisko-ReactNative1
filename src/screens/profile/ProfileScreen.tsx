// src/screens/profile/ProfileScreen.tsx
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthContext} from '../../context/AuthContext';
import {ThemeContext} from '../../context/ThemeContext';
import {userService} from '../../services/api';
import * as ImagePicker from 'react-native-image-picker'; // You'll need to install this package

const ProfileScreen = () => {
  const {user, logout} = useContext(AuthContext);
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success && response.data?.user) {
          const userData = response.data.user;
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          if (userData.profileImage?.url) {
            setProfileImage({uri: userData.profileImage.url});
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Select profile image from gallery
  const selectImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    try {
      const response = await ImagePicker.launchImageLibrary(options);

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        throw new Error(response.errorMessage);
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setProfileImage({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName,
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const updateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Invalid Input', 'First name and last name are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.updateProfile(
        firstName,
        lastName,
        profileImage,
      );

      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      } else {
        Alert.alert(
          'Update Failed',
          response.error?.message || 'Failed to update profile.',
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: colors.text}]}>My Profile</Text>
        </View>

        <View style={styles.profileImageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={isEditing ? selectImage : undefined}
            disabled={!isEditing || loading}>
            {profileImage ? (
              <Image source={profileImage} style={styles.profileImage} />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  {backgroundColor: colors.border},
                ]}>
                <Text
                  style={[
                    styles.profileImagePlaceholderText,
                    {color: colors.text},
                  ]}>
                  {`${firstName.charAt(0)}${lastName.charAt(0)}`}
                </Text>
              </View>
            )}
            {isEditing && (
              <View
                style={[
                  styles.editIconOverlay,
                  {
                    backgroundColor: isDarkMode
                      ? colors.card
                      : 'rgba(255, 255, 255, 0.8)',
                  },
                ]}>
                <Text>📷</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: colors.text}]}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: colors.text}]}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: colors.text}]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                  opacity: 0.7,
                },
              ]}
              value={user?.email || ''}
              editable={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.button, {backgroundColor: colors.error}]}
                  onPress={() => setIsEditing(false)}
                  disabled={loading}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, {backgroundColor: colors.primary}]}
                  onPress={updateProfile}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, {backgroundColor: colors.primary}]}
                  onPress={() => setIsEditing(true)}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, {backgroundColor: colors.error}]}
                  onPress={logout}>
                  <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: 8,
    borderRadius: 15,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
