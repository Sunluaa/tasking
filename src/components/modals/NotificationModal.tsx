import React from 'react';
import { Bell, Calendar } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { Task } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';

interface NotificationModalProps {
  type: 'reminder' | 'taskDue';
  task: Task;
  onClose: () => void;
  onAccept?: () => void;
  onPostpone?: (minutes: number) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  type, 
  task, 
  onClose, 
  onAccept, 
  onPostpone 
}) => {
  const { tags } = useTask();
  
  // Получение тегов задачи
  const taskTags = tags.filter(tag => task.tags.includes(tag.id));
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-scale-in border-t-4 border-primary-500">
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4
              ${type === 'reminder' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400'}
            `}>
              {type === 'reminder' ? (
                <Bell size={24} />
              ) : (
                <Calendar size={24} />
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {type === 'reminder' 
                  ? 'Напоминание о задаче' 
                  : 'Время выполнения задачи'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {type === 'reminder' 
                  ? 'Не забудьте про запланированную задачу' 
                  : 'Пора приступить к выполнению задачи'}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-3">
              {taskTags.map(tag => (
                <span 
                  key={tag.id} 
                  className="inline-flex items-center px-2 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: `${tag.color}20`,
                    color: tag.color
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span>{formatDateTime(task.dueDate)}</span>
              </div>
            </div>
          </div>
          
          {type === 'reminder' ? (
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Спасибо за напоминание
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onAccept}
                className="btn btn-primary w-full"
              >
                Принять задачу
              </button>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onPostpone?.(15)}
                  className="btn btn-secondary flex-1 min-w-[80px]"
                >
                  +15 мин
                </button>
                <button
                  onClick={() => onPostpone?.(30)}
                  className="btn btn-secondary flex-1 min-w-[80px]"
                >
                  +30 мин
                </button>
                <button
                  onClick={() => onPostpone?.(60)}
                  className="btn btn-secondary flex-1 min-w-[80px]"
                >
                  +1 час
                </button>
                <button
                  onClick={() => onPostpone?.(1440)}
                  className="btn btn-secondary flex-1 min-w-[80px]"
                >
                  +1 день
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;