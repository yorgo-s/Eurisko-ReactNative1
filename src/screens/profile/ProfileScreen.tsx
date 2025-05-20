import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useAuthStore} from '../../store/authStore';
import {SafeAreaView} from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const {user, logout} = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => logout(),
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleEditProfile = () => {
    // We'll implement this in Increment 5
    Alert.alert(
      'Coming Soon',
      'Edit profile functionality will be implemented soon!',
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileImageContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      overflow: 'hidden',
    },
    profileImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    profileInitial: {
      ...getFontStyle('bold', 40),
      color: colors.primary,
    },
    name: {
      ...typography.heading2,
      marginBottom: 4,
    },
    email: {
      ...typography.body,
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginBottom: 16,
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    editButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      ...typography.subtitle,
      marginBottom: 16,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionText: {
      ...typography.body,
      flex: 1,
    },
    logoutButton: {
      backgroundColor: isDarkMode ? '#333333' : '#F5F5F7',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    logoutText: {
      ...getFontStyle('semiBold', 16),
      color: '#D32F2F',
    },
  });

  // Function to get the user's initials for fallback avatar
  const getInitials = () => {
    if (!user) return '?';

    const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0) : '';

    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user?.profileImage?.url ? (
              <Image
                source={{uri: user.profileImage.url}}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.profileInitial}>{getInitials()}</Text>
            )}
          </View>

          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : 'User Name'}
          </Text>

          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            testID="edit-profile-button">
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.option}>
              <Text style={styles.optionText}>Theme</Text>
              <Text>{isDarkMode ? 'Dark' : 'Light'}</Text>
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Notifications</Text>
              <Text>On</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.option}>
              <Text style={styles.optionText}>Privacy</Text>
            </View>

            <View style={styles.option}>
              <Text style={styles.optionText}>Security</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            testID="logout-button">
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
