import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationsList from '../components/notifications/NotificationsList';

const NotificationsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Перенаправление на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Уведомления
        </h1>
      </div>
      
      <div className="card p-6 animate-fade-in">
        <NotificationsList />
      </div>
    </div>
  );
};

export default NotificationsPage;