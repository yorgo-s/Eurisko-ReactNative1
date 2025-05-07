import {Platform} from 'react-native';

// Define font families to use across the app
export const fontFamily = {
  // We'll use system fonts for now, but in a real app, you'd import custom fonts
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
};

// For a real app with custom fonts, you would:
// 1. Add the font files to assets/fonts directory
// 2. Link the fonts using react-native-asset or manual linking
// 3. Update this file to reference those custom fonts

// Here's how you would set up custom fonts:
/*
export const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  bold: 'Poppins-Bold',
  light: 'Poppins-Light',
};

// Then in your package.json, add:
"rnpm": {
  "assets": [
    "./src/assets/fonts/"
  ]
}

// And run:
// npx react-native-asset
*/

// Font weight mapping
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};
