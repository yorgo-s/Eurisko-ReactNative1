// src/navigation/types.ts
import {Product} from '../api/products';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Verification: {email: string};
};

export type ProductStackParamList = {
  Products: undefined;
  ProductDetails: Product & {title?: string}; // Support both Product object and title param
  AddProduct: undefined;
  EditProduct: Product;
};

export type CartStackParamList = {
  Cart: undefined;
  ProductDetails: Product & {title?: string};
};

export type TabParamList = {
  ProductsTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = AuthStackParamList &
  ProductStackParamList &
  CartStackParamList &
  TabParamList;

// Add deep link specific types
export type DeepLinkScreens =
  | 'ProductDetails'
  | 'Cart'
  | 'Profile'
  | 'Products';

// Navigation props for deep linking
export type DeepLinkNavigationProps = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  reset: (state: any) => void;
};

// Utility type for product navigation
export type ProductNavigationParams =
  | {
      _id: string;
      title?: string;
    }
  | Product;
