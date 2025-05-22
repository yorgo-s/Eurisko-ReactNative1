import {Product} from '../api/products';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Verification: {email: string};
};

export type ProductStackParamList = {
  Products: undefined;
  ProductDetails: Product;
  AddProduct: undefined;
  EditProduct: Product;
};

export type RootStackParamList = AuthStackParamList & ProductStackParamList;
