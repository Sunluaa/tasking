import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  isWithinInterval
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { TaskStatus } from '../types';

const CalendarPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { tasks } = useTask();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Получение дней для отображения в месячном календаре
  const getDaysToDisplay = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ru });
    const endDate = endOfWeek(monthEnd, { locale: ru });
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const days = getDaysToDisplay();

  // Переход к предыдущему месяцу
  const goToPrevious = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  // Переход к следующему месяцу
  const goToNext = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  // Переход к текущей дате
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Подсчет задач для определенного дня
  const getTaskCountForDay = (day: Date, status: TaskStatus): number => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day) && task.status === status;
    }).length;
  };

  // Получение общего количества задач для дня
  const getTotalTaskCountForDay = (day: Date): number => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    }).length;
  };

  // Проверка, является ли день текущим месяцем
  const isCurrentMonth = (day: Date) => {
    return isWithinInterval(day, { 
      start: startOfMonth(currentDate), 
      end: endOfMonth(currentDate) 
    });
  };

  // Получение названия месяца
  const monthName = format(currentDate, 'LLLL yyyy', { locale: ru });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Календарь
      </h1>
      
      <div className="card overflow-hidden animate-fade-in">
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold capitalize">
              {monthName}
            </h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={goToToday}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Сегодня"
              >
                <CalendarIcon size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={goToPrevious}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Предыдущий месяц"
              >
                <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={goToNext}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Следующий месяц"
              >
                <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
              <div 
                key={day} 
                className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 grid-rows-6">
            {days.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isDayToday = isToday(day);
              const isOtherMonth = !isCurrentMonth(day);
              
              // Получение количества задач для дня
              const plannedCount = getTaskCountForDay(day, TaskStatus.Planned);
              const activeCount = getTaskCountForDay(day, TaskStatus.Active);
              const completedCount = getTaskCountForDay(day, TaskStatus.Completed);
              const overdueCount = getTaskCountForDay(day, TaskStatus.Overdue);
              
              // Если есть какие-либо задачи на этот день
              const hasAnyTasks = getTotalTaskCountForDay(day) > 0;
              
              return (
                <div 
                  key={index}
                  className={`
                    p-2 h-20 md:h-24 rounded-lg border transition-all cursor-pointer
                    ${isSelected ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/30' : 'border-transparent'}
                    ${isDayToday ? 'bg-gray-100 dark:bg-gray-800' : ''}
                    ${isOtherMonth ? 'opacity-50' : ''}
                    hover:border-primary-400 dark:hover:border-primary-500
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex flex-col h-full">
                    <div className={`
                      text-sm font-medium mb-1 text-center
                      ${isSelected ? 'text-primary-700 dark:text-primary-300' : ''}
                      ${isDayToday ? 'text-primary-600 dark:text-primary-400 font-bold' : ''}
                      ${isOtherMonth ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}
                    `}>
                      {format(day, 'd', { locale: ru })}
                    </div>
                    
                    {hasAnyTasks && (
                      <div className="flex flex-wrap justify-center gap-1 mt-auto">
                        {plannedCount > 0 && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                            {plannedCount}
                          </div>
                        )}
                        {activeCount > 0 && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-xs font-medium">
                            {activeCount}
                          </div>
                        )}
                        {completedCount > 0 && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 text-xs font-medium">
                            {completedCount}
                          </div>
                        )}
                        {overdueCount > 0 && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300 text-xs font-medium">
                            {overdueCount}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;