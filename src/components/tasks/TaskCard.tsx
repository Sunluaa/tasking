import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, Flag, Edit, Trash2, RotateCcw, PlayCircle } from 'lucide-react';
import { Task, TaskStatus, TaskDifficulty } from '../../types';
import { formatDateTime, getTimeUntil, formatDuration } from '../../utils/dateUtils';
import { useTask } from '../../contexts/TaskContext';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { 
    completeTask, 
    uncompleteTask, 
    deleteTask, 
    activateTask,
    tags 
  } = useTask();
  
  const [timeUntil, setTimeUntil] = useState<string>('');
  
  // Обновление времени до начала задачи
  useEffect(() => {
    const updateTimeUntil = () => {
      setTimeUntil(getTimeUntil(task.dueDate));
    };
    
    updateTimeUntil();
    const intervalId = setInterval(updateTimeUntil, 60000); // Обновление каждую минуту
    
    return () => clearInterval(intervalId);
  }, [task.dueDate]);

  // Получение тегов задачи
  const taskTags = tags.filter(tag => task.tags.includes(tag.id));
  
  // Определение цвета сложности
  const getDifficultyColor = () => {
    switch (task.difficulty) {
      case TaskDifficulty.Easy:
        return 'text-success-600 dark:text-success-400';
      case TaskDifficulty.Medium:
        return 'text-warning-600 dark:text-warning-400';
      case TaskDifficulty.Hard:
        return 'text-danger-600 dark:text-danger-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Получение флага сложности
  const getDifficultyFlag = () => {
    switch (task.difficulty) {
      case TaskDifficulty.Easy:
        return '🟢';
      case TaskDifficulty.Medium:
        return '🟡';
      case TaskDifficulty.Hard:
        return '🔴';
      default:
        return '🏳️';
    }
  };

  // Обработчик удаления задачи
  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      await deleteTask(task.id);
    }
  };

  // Обработчик выполнения задачи
  const handleComplete = async () => {
    await completeTask(task.id);
  };

  // Обработчик отмены выполнения задачи
  const handleUncomplete = async () => {
    await uncompleteTask(task.id);
  };

  // Обработчик активации задачи
  const handleActivate = async () => {
    await activateTask(task.id);
  };

  // Определение классов для карточки в зависимости от статуса
  const getCardClasses = () => {
    let baseClasses = 'card transition-all duration-200 hover:shadow-lg relative overflow-hidden';
    
    switch (task.status) {
      case TaskStatus.Completed:
        return `${baseClasses} border-l-4 border-success-500 opacity-75`;
      case TaskStatus.Active:
        return `${baseClasses} border-l-4 border-primary-500`;
      case TaskStatus.Overdue:
        return `${baseClasses} border-l-4 border-danger-500`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={getCardClasses()}>
      {/* Статус-метка */}
      {task.status === TaskStatus.Overdue && (
        <div className="absolute top-0 right-0 bg-danger-500 text-white text-xs px-2 py-1">
          Просрочено
        </div>
      )}
      {task.status === TaskStatus.Active && (
        <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-2 py-1">
          Активна
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold text-lg ${task.status === TaskStatus.Completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {task.title}
          </h3>
          <div className="flex items-center">
            <span className={`text-lg ${getDifficultyColor()}`} title={`Сложность: ${task.difficulty}`}>
              {getDifficultyFlag()}
            </span>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar size={16} className="mr-2" />
            <span>{formatDateTime(task.dueDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock size={16} className="mr-2" />
            {task.status === TaskStatus.Planned && (
              <span>{timeUntil}</span>
            )}
            {task.status === TaskStatus.Active && (
              <span>
                {task.estimatedTime 
                  ? `Запланировано сделать за ${formatDuration(task.estimatedTime)}`
                  : 'Выполните задачу'}
              </span>
            )}
            {task.status === TaskStatus.Completed && task.completedAt && (
              <span>Выполнено {formatDateTime(task.completedAt)}</span>
            )}
            {task.status === TaskStatus.Overdue && (
              <span className="text-danger-600 dark:text-danger-400">
                {timeUntil}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            {task.status !== TaskStatus.Completed ? (
              <>
                <button 
                  onClick={handleComplete} 
                  className="p-1 rounded-full hover:bg-success-100 dark:hover:bg-success-900/30 text-success-600 dark:text-success-400 transition-colors"
                  title="Отметить как выполненное"
                >
                  <CheckCircle size={20} />
                </button>
                
                {task.status !== TaskStatus.Active && (
                  <button 
                    onClick={handleActivate} 
                    className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors"
                    title="Начать выполнение"
                  >
                    <PlayCircle size={20} />
                  </button>
                )}
              </>
            ) : (
              <button 
                onClick={handleUncomplete} 
                className="p-1 rounded-full hover:bg-warning-100 dark:hover:bg-warning-900/30 text-warning-600 dark:text-warning-400 transition-colors"
                title="Отменить выполнение"
              >
                <RotateCcw size={20} />
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={onEdit} 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Редактировать"
            >
              <Edit size={20} />
            </button>
            <button 
              onClick={handleDelete} 
              className="p-1 rounded-full hover:bg-danger-100 dark:hover:bg-danger-900/30 text-danger-600 dark:text-danger-400 transition-colors"
              title="Удалить"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;