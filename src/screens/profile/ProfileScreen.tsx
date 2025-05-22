// src/screens/profile/ProfileScreen.tsx

import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {ThemeContext} from '../../context/ThemeContext';
import {useAuthStore} from '../../store/authStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EditProfileModal from '../../components/profile/EditProfileModal';

const ProfileScreen = () => {
  const {colors, isDarkMode, typography, getFontStyle, toggleTheme} =
    useContext(ThemeContext);
  const {user, logout, fetchUserProfile, isLoading} = useAuthStore();

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    if (!user) {
      fetchUserProfile();
    }
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  };

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
    setShowEditModal(true);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Function to get the user's initials for fallback avatar
  const getInitials = () => {
    if (!user) return '?';

    const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0) : '';

    return (firstInitial + lastInitial).toUpperCase();
  };

  // Function to get profile image URL
  const getProfileImageUrl = () => {
    if (!user?.profileImage?.url) return null;

    // Handle relative URLs from API
    return user.profileImage.url.startsWith('http')
      ? user.profileImage.url
      : `https://backend-practice.eurisko.me${user.profileImage.url}`;
  };

  // Create styles with dynamic colors from the theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      padding: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
    },
    headerTitle: {
      ...typography.heading2,
      color: colors.text,
    },
    themeButton: {
      padding: 8,
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
      borderWidth: 3,
      borderColor: colors.primary,
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
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    email: {
      ...typography.body,
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginBottom: 8,
      textAlign: 'center',
    },
    verificationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 16,
    },
    verificationText: {
      ...getFontStyle('medium', 12),
      color: colors.primary,
      marginLeft: 4,
    },
    editButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    editButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
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
      color: colors.text,
      marginBottom: 16,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      marginBottom: 8,
    },
    optionIcon: {
      marginRight: 12,
      width: 24,
      alignItems: 'center',
    },
    optionContent: {
      flex: 1,
    },
    optionText: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    optionSubtext: {
      ...getFontStyle('regular', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      marginTop: 2,
    },
    optionValue: {
      color: colors.primary,
      ...getFontStyle('medium', 16),
    },
    logoutButton: {
      backgroundColor: colors.error + '15',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    logoutText: {
      ...getFontStyle('semiBold', 16),
      color: colors.error,
      marginLeft: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      ...getFontStyle('bold', 20),
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      ...getFontStyle('regular', 14),
      color: isDarkMode ? '#AAAAAA' : '#666666',
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
  });

  // Show loading spinner while fetching user data
  if (isLoading && !user) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loadingContainer]}
        edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{...typography.body, marginTop: 16, color: colors.text}}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{width: 40}} />
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={handleThemeToggle}
              testID="theme-toggle-button">
              <Icon
                name={
                  isDarkMode ? 'white-balance-sunny' : 'moon-waning-crescent'
                }
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.profileImageContainer}>
            {getProfileImageUrl() ? (
              <Image
                source={{uri: getProfileImageUrl()!}}
                style={styles.profileImage}
                testID="profile-image"
              />
            ) : (
              <Text style={styles.profileInitial}>{getInitials()}</Text>
            )}
          </View>

          <Text style={styles.name} testID="user-name">
            {user ? `${user.firstName} ${user.lastName}` : 'User Name'}
          </Text>

          <Text style={styles.email} testID="user-email">
            {user?.email || 'user@example.com'}
          </Text>

          {user?.isEmailVerified && (
            <View style={styles.verificationBadge}>
              <Icon name="check-decagram" size={16} color={colors.primary} />
              <Text style={styles.verificationText}>Verified Account</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            testID="edit-profile-button">
            <Icon name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.createdAt
                  ? new Date(user.createdAt).getFullYear()
                  : '2024'}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <TouchableOpacity style={styles.option} onPress={handleThemeToggle}>
              <View style={styles.optionIcon}>
                <Icon name="theme-light-dark" size={24} color={colors.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Appearance</Text>
                <Text style={styles.optionSubtext}>
                  Switch between light and dark mode
                </Text>
              </View>
              <Text style={styles.optionValue}>
                {isDarkMode ? 'Dark' : 'Light'}
              </Text>
            </TouchableOpacity>

            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Icon name="bell" size={24} color={colors.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Notifications</Text>
                <Text style={styles.optionSubtext}>
                  Manage your notification preferences
                </Text>
              </View>
              <Text style={styles.optionValue}>On</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Icon name="shield-account" size={24} color={colors.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Privacy & Security</Text>
                <Text style={styles.optionSubtext}>
                  Manage your privacy settings
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={isDarkMode ? '#AAAAAA' : '#666666'}
              />
            </View>

            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <Icon name="help-circle" size={24} color={colors.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Help & Support</Text>
                <Text style={styles.optionSubtext}>
                  Get help and contact support
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={isDarkMode ? '#AAAAAA' : '#666666'}
              />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            testID="logout-button">
            <Icon name="logout" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
