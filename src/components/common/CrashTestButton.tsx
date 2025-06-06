import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import crashlytics, {crash} from '@react-native-firebase/crashlytics';

const CrashTestButton: React.FC = () => {
  const handleCrash = () => {
    Alert.alert('Test Crash', 'This will force the app to crash. Continue?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Crash App',
        style: 'destructive',
        onPress: () => {
          // This will crash the app and be reported to Crashlytics
          crash(crashlytics());
          // Alternatively, you can use:
          // throw new Error('Test crash for Crashlytics');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.crashButton} onPress={handleCrash}>
        <Text style={styles.buttonText}>Test Crash</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  crashButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  immediateCrashButton: {
    backgroundColor: '#8B0000',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CrashTestButton;
