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
    const storedUsers = localStorage.getItem('user_details');
    if (!storedUsers) {
      localStorage.setItem('pos_users', JSON.stringify(defaultUsers));
    }

    const storedUser = localStorage.getItem('pos_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (credentials) => {
    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const foundUser = users.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('pos_current_user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_current_user');
  };

  const createUser = (userData) => {
    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const newUser = {
      ...userData,
      id: Date.now().toString()
    };
    users.push(newUser);
    localStorage.setItem('pos_users', JSON.stringify(users));
    return newUser;
  };

  const value = {
    user,
    login,
    logout,
    createUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};