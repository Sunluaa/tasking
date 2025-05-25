import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Загрузка данных пользователя при инициализации
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Регистрация нового пользователя
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Проверка на существующий email
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.some((user: User) => user.email === email)) {
        throw new Error('Пользователь с таким email уже существует');
      }

      const newUser: User = {
        id: uuidv4(),
        username,
        email,
        password,
        avatarUrl: undefined,
      };

      // Сохранение нового пользователя
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Установка текущего пользователя
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return false;
    }
  };

  // Вход пользователя
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Неверный email или пароль');
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return true;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return false;
    }
  };

  // Выход пользователя
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // Обновление профиля пользователя
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);

      if (userIndex === -1) {
        throw new Error('Пользователь не найден');
      }

      // Обновление данных пользователя
      const updatedUser = { ...users[userIndex], ...data };
      users[userIndex] = updatedUser;

      // Сохранение обновленных данных
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};