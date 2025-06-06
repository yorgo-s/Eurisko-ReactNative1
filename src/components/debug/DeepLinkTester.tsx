// import React, {useState, useContext} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import {ThemeContext} from '../../context/ThemeContext';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import DeepLinkManager from '../../utils/deepLinkUtils';
// import {Linking} from 'react-native';

// // Only show this component in development
// const DeepLinkTester: React.FC = () => {
//   const {colors, isDarkMode, getFontStyle} = useContext(ThemeContext);
//   const [customUrl, setCustomUrl] = useState('');

//   // Predefined test URLs
//   const testUrls = [
//     {
//       name: 'Product Details (Custom)',
//       url: 'awesomeshop://product/0001',
//       description: 'Test custom scheme product link',
//     },
//     {
//       name: 'Product Details (HTTPS)',
//       url: 'https://awesomeshop.app/product/0002',
//       description: 'Test HTTPS product link',
//     },
//     {
//       name: 'Cart (Custom)',
//       url: 'awesomeshop://cart',
//       description: 'Test cart navigation',
//     },
//     {
//       name: 'Profile (Custom)',
//       url: 'awesomeshop://profile',
//       description: 'Test profile navigation',
//     },
//     {
//       name: 'Products List',
//       url: 'awesomeshop://products',
//       description: 'Test products list navigation',
//     },
//   ];

//   const handleTestUrl = async (url: string) => {
//     try {
//       console.log('🧪 Testing deep link:', url);

//       // First try using the deep link manager
//       const deepLinkManager = DeepLinkManager.getInstance();
//       deepLinkManager.testDeepLink(url);

//       Alert.alert(
//         'Deep Link Test',
//         `Testing URL: ${url}\n\nCheck the navigation to see if it worked correctly.`,
//         [
//           {text: 'OK'},
//           {
//             text: 'Test with System',
//             onPress: () => testWithSystemLinking(url),
//           },
//         ],
//       );
//     } catch (error) {
//       console.error('❌ Deep link test error:', error);
//       Alert.alert('Test Failed', `Error testing deep link: ${error}`);
//     }
//   };

//   const testWithSystemLinking = async (url: string) => {
//     try {
//       const canOpen = await Linking.canOpenURL(url);
//       if (canOpen) {
//         await Linking.openURL(url);
//       } else {
//         Alert.alert('Cannot Open', 'This URL scheme is not supported');
//       }
//     } catch (error) {
//       console.error('❌ System linking error:', error);
//       Alert.alert('System Test Failed', `Error: ${error}`);
//     }
//   };

//   const handleCustomUrlTest = () => {
//     if (!customUrl.trim()) {
//       Alert.alert('Error', 'Please enter a URL to test');
//       return;
//     }
//     handleTestUrl(customUrl.trim());
//   };

//   const generateTestLinks = () => {
//     const links = [
//       DeepLinkManager.generateProductLink('0001'),
//       DeepLinkManager.generateHTTPSProductLink('0002'),
//       DeepLinkManager.generateCartLink(),
//       DeepLinkManager.generateProfileLink(),
//     ];

//     Alert.alert('Generated Links', links.join('\n\n'), [{text: 'OK'}]);
//   };

//   const styles = StyleSheet.create({
//     container: {
//       backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
//       margin: 16,
//       borderRadius: 12,
//       padding: 16,
//       borderWidth: 2,
//       borderColor: '#FF6B6B',
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginBottom: 16,
//     },
//     title: {
//       ...getFontStyle('bold', 18),
//       color: '#FF6B6B',
//       marginLeft: 8,
//     },
//     subtitle: {
//       ...getFontStyle('regular', 14),
//       color: colors.text,
//       marginBottom: 16,
//       fontStyle: 'italic',
//     },
//     testItem: {
//       backgroundColor: colors.background,
//       padding: 12,
//       borderRadius: 8,
//       marginBottom: 8,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     testItemHeader: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: 4,
//     },
//     testItemName: {
//       ...getFontStyle('semiBold', 16),
//       color: colors.text,
//       flex: 1,
//     },
//     testButton: {
//       backgroundColor: colors.primary,
//       paddingHorizontal: 12,
//       paddingVertical: 6,
//       borderRadius: 6,
//     },
//     testButtonText: {
//       ...getFontStyle('medium', 12),
//       color: '#FFFFFF',
//     },
//     testItemUrl: {
//       ...getFontStyle('regular', 12),
//       color: colors.primary,
//       fontFamily: 'monospace',
//       marginBottom: 4,
//     },
//     testItemDescription: {
//       ...getFontStyle('regular', 12),
//       color: isDarkMode ? '#AAAAAA' : '#666666',
//     },
//     customTestContainer: {
//       marginTop: 16,
//       padding: 12,
//       backgroundColor: colors.background,
//       borderRadius: 8,
//       borderWidth: 1,
//       borderColor: colors.border,
//     },
//     customTestTitle: {
//       ...getFontStyle('semiBold', 16),
//       color: colors.text,
//       marginBottom: 8,
//     },
//     customInput: {
//       backgroundColor: isDarkMode ? colors.card : '#F5F5F7',
//       borderRadius: 6,
//       padding: 10,
//       marginBottom: 8,
//       ...getFontStyle('regular', 14),
//       color: colors.text,
//       fontFamily: 'monospace',
//     },
//     customTestButtons: {
//       flexDirection: 'row',
//       gap: 8,
//     },
//     actionButton: {
//       flex: 1,
//       backgroundColor: colors.primary,
//       padding: 10,
//       borderRadius: 6,
//       alignItems: 'center',
//     },
//     actionButtonSecondary: {
//       backgroundColor: isDarkMode ? '#333333' : '#E9ECEF',
//     },
//     actionButtonText: {
//       ...getFontStyle('semiBold', 14),
//       color: '#FFFFFF',
//     },
//     actionButtonTextSecondary: {
//       color: colors.text,
//     },
//     warning: {
//       backgroundColor: '#FFF3CD',
//       borderColor: '#FFEAA7',
//       borderWidth: 1,
//       borderRadius: 6,
//       padding: 8,
//       marginTop: 16,
//     },
//     warningText: {
//       ...getFontStyle('regular', 12),
//       color: '#856404',
//       textAlign: 'center',
//     },
//   });

//   // Only render in development
//   if (!__DEV__) {
//     return null;
//   }

//   return (
//     <ScrollView>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Icon name="test-tube" size={24} color="#FF6B6B" />
//           <Text style={styles.title}>Deep Link Tester</Text>
//         </View>

//         <Text style={styles.subtitle}>
//           Development tool for testing deep link navigation
//         </Text>

//         {/* Predefined Test URLs */}
//         {testUrls.map((item, index) => (
//           <View key={index} style={styles.testItem}>
//             <View style={styles.testItemHeader}>
//               <Text style={styles.testItemName}>{item.name}</Text>
//               <TouchableOpacity
//                 style={styles.testButton}
//                 onPress={() => handleTestUrl(item.url)}>
//                 <Text style={styles.testButtonText}>Test</Text>
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.testItemUrl}>{item.url}</Text>
//             <Text style={styles.testItemDescription}>{item.description}</Text>
//           </View>
//         ))}

//         {/* Custom URL Tester */}
//         <View style={styles.customTestContainer}>
//           <Text style={styles.customTestTitle}>Custom URL Test</Text>
//           <TextInput
//             style={styles.customInput}
//             placeholder="Enter custom deep link URL..."
//             placeholderTextColor={isDarkMode ? '#888888' : '#888888'}
//             value={customUrl}
//             onChangeText={setCustomUrl}
//             autoCapitalize="none"
//             autoCorrect={false}
//           />
//           <View style={styles.customTestButtons}>
//             <TouchableOpacity
//               style={styles.actionButton}
//               onPress={handleCustomUrlTest}>
//               <Text style={styles.actionButtonText}>Test URL</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.actionButtonSecondary]}
//               onPress={generateTestLinks}>
//               <Text
//                 style={[
//                   styles.actionButtonText,
//                   styles.actionButtonTextSecondary,
//                 ]}>
//                 Generate Links
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.warning}>
//           <Text style={styles.warningText}>
//             ⚠️ This component only appears in development builds
//           </Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default DeepLinkTester;
