import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ThemeContext} from '../../context/ThemeContext';
import {useCartStore, CartItem} from '../../store/cartStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CartItemComponent from '../../components/cart/CartItemComponent';

const CartScreen = () => {
  const navigation = useNavigation();
  const {colors, isDarkMode, typography, getFontStyle} =
    useContext(ThemeContext);
  const {items, totalItems, totalPrice, clearCart} = useCartStore();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ],
    );
  };

  const handleCheckout = () => {
    Alert.alert(
      'Checkout',
      `Proceed to checkout with ${totalItems} items for $${totalPrice.toFixed(
        2,
      )}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Proceed',
          onPress: () => {
            // TODO: Implement checkout logic
            Alert.alert('Success', 'Checkout functionality coming soon!');
          },
        },
      ],
    );
  };

  const renderCartItem = ({item, index}: {item: CartItem; index: number}) => (
    <CartItemComponent
      item={item}
      index={index}
      onPress={() => {
        // Navigate to product details
        navigation.navigate('ProductDetails', item.product);
      }}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cart-outline" size={80} color={colors.border} />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Add some products to get started</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('ProductsTab')}>
        <Icon name="shopping" size={20} color="#FFFFFF" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (items.length === 0) return null;

    return (
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({totalItems} items)
            </Text>
            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValueFree}>Free</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}>
            <Icon name="delete-outline" size={20} color={colors.error} />
            <Text style={styles.clearButtonText}>Clear Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}>
            <Icon name="credit-card" size={20} color="#FFFFFF" />
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
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
      ...typography.heading2,
      color: colors.text,
    },
    headerButton: {
      padding: 8,
    },
    list: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyTitle: {
      ...getFontStyle('bold', 24),
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    emptySubtitle: {
      ...getFontStyle('regular', 16),
      color: isDarkMode ? '#AAAAAA' : '#666666',
      textAlign: 'center',
      marginBottom: 30,
    },
    shopButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    shopButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
    },
    footer: {
      backgroundColor: isDarkMode ? colors.card : '#F8F9FA',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 16,
    },
    summaryContainer: {
      marginBottom: 16,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryLabel: {
      ...getFontStyle('regular', 16),
      color: colors.text,
    },
    summaryValue: {
      ...getFontStyle('semiBold', 16),
      color: colors.text,
    },
    summaryValueFree: {
      ...getFontStyle('semiBold', 16),
      color: colors.primary,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
      marginTop: 8,
    },
    totalLabel: {
      ...getFontStyle('bold', 18),
      color: colors.text,
    },
    totalValue: {
      ...getFontStyle('bold', 18),
      color: colors.primary,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    clearButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: colors.error + '15',
      borderRadius: 8,
    },
    clearButtonText: {
      ...getFontStyle('semiBold', 16),
      color: colors.error,
      marginLeft: 8,
    },
    checkoutButton: {
      flex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    checkoutButtonText: {
      ...getFontStyle('semiBold', 16),
      color: '#FFFFFF',
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClearCart}>
            <Icon name="delete-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        style={styles.list}
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyCart}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
