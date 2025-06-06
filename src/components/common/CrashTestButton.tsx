import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import crashlytics from '@react-native-firebase/crashlytics';

const CrashTestButton: React.FC = () => {
  const handleCrash = () => {
    Alert.alert('Test Crash', 'This will crash the app. Continue?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Crash App',
        style: 'destructive',
        onPress: () => {
          // This should work now with firebase.json config
          crashlytics().crash();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.crashButton} onPress={handleCrash}>
        <Text style={styles.buttonText}>🔥 Test Crash</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  crashButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrashTestButton;
