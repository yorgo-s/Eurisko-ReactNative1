import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in when the app starts
    const checkLoginStatus = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('@auth_status');
        if (loginStatus === 'true') {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error reading login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // Check if the credentials match what we expect
    if (username === 'eurisko' && password === 'academy2025') {
      try {
        await AsyncStorage.setItem('@auth_status', 'true');
        setIsLoggedIn(true);
        return true;
      } catch (error) {
        console.error('Error saving login status:', error);
        return false;
      }
    }
    return false;
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_status');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error removing login status:', error);
    }
  };

  return (
    <AuthContext.Provider value={{isLoggedIn, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};
