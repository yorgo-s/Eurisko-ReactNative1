import {Product} from '../screens/products/ProductsScreen';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Verification: {email: string};
};

export type ProductStackParamList = {
  Products: undefined;
  ProductDetails: Product;
};

export type RootStackParamList = AuthStackParamList & ProductStackParamList;
