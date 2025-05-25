import React from 'react';
import { Bell, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationType } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';

const NotificationsList: React.FC = () => {
  const { notifications, markAsRead, deleteNotification } = useNotification();

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">
          У вас нет уведомлений
        </h3>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Здесь будут отображаться уведомления о ваших задачах
        </p>
      </div>
    );
  }

  // Сортировка уведомлений по времени (сначала новые)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedNotifications.map(notification => {
        const isReminder = notification.type === NotificationType.Reminder;
        
        return (
          <div 
            key={notification.id} 
            className={`
              card p-4 transition-all hover:shadow-md animate-fade-in
              ${notification.read ? 'opacity-70' : 'border-l-4 border-primary-500'}
            `}
          >
            <div className="flex items-start">
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4
                ${isReminder 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400'}
              `}>
                {isReminder ? (
                  <Bell size={20} />
                ) : (
                  <Calendar size={20} />
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {notification.message}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDateTime(notification.time)}
                </p>
                
                {!notification.read && (
                  <div className="flex mt-3 space-x-2">
                    <button 
                      onClick={() => markAsRead(notification.id)} 
                      className="btn btn-secondary text-sm py-1 px-3"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Отметить как прочитанное
                    </button>
                    
                    {notification.actions?.map(action => (
                      <button 
                        key={action.id}
                        className={`
                          btn text-sm py-1 px-3
                          ${action.action === 'accept' ? 'btn-primary' : 'btn-warning'}
                        `}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => deleteNotification(notification.id)}
                className="text-gray-400 hover:text-danger-500 dark:text-gray-500 dark:hover:text-danger-400 transition-colors"
                title="Удалить уведомление"
              >
                &times;
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationsList;