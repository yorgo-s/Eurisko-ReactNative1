import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ThemeContext} from '../../context/ThemeContext';
import {useCartStore} from '../../store/cartStore';

interface CartTabIconProps {
  color: string;
  size: number;
}

const CartTabIcon: React.FC<CartTabIconProps> = ({color, size}) => {
  const {colors, getFontStyle} = useContext(ThemeContext);
  const {totalItems} = useCartStore();

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      ...getFontStyle('bold', 12),
      color: '#FFFFFF',
      lineHeight: 12,
    },
  });

  return (
    <View style={styles.container}>
      <Icon name="cart" color={color} size={size} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {totalItems > 99 ? '99+' : totalItems.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CartTabIcon;
