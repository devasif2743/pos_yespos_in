import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWeb } from './authApi';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize default users
  // const defaultUsers = [
  //   {
  //     id: '1',
  //     username: 'admin',
  //     password: 'admin123',
  //     role: 'admin',
  //     name: 'System Administrator',
  //     email: 'admin@pos.com'
  //   },
  //   {
  //     id: '2',
  //     username: 'manager1',
  //     password: 'manager123',
  //     role: 'manager',
  //     name: 'Branch Manager',
  //     email: 'manager@pos.com',
  //     branchId: '1'
  //   },
  //   {
  //     id: '3',
  //     username: 'pos1',
  //     password: 'pos123',
  //     role: 'pos',
  //     name: 'POS User',
  //     email: 'pos@pos.com',
  //     branchId: '1'
  //   }
  // ];

 useEffect(() => {
    const storedUser = localStorage.getItem('user_details');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);



 const login = async (credentials) => {
    try {
      const response = await loginWeb(credentials);

    console.log("ddd",response.data);
      if (response.data.status) {
        const { user,access_token } = response.data;

        // save in localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_details', JSON.stringify(user));

        setUser(user);

        return { success: true, user };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_details');
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};