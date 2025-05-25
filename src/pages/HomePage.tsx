import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Task, TaskStatus, SortType } from '../types';
import WeekCalendar from '../components/calendar/WeekCalendar';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/modals/TaskModal';
import NotificationModal from '../components/modals/NotificationModal';
import { parseISO, isAfter, subMinutes, isBefore } from 'date-fns';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { tasks, getTasksByDate, activateTask, postponeTask } = useTask();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [reminderTask, setReminderTask] = useState<Task | null>(null);
  const [dueTask, setDueTask] = useState<Task | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const openCreateTaskModal = () => {
    setTaskToEdit(undefined);
    setIsTaskModalOpen(true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkRemindersAndDueDates = () => {
      const now = new Date();
      
      const taskWithReminder = tasks.find(task => {
        if (task.status === TaskStatus.Completed) return false;
        
        return task.reminders && Array.isArray(task.reminders) && task.reminders.some(reminder => {
          const reminderTime = parseISO(reminder.time);
          return isBefore(reminderTime, now) && 
                 isAfter(reminderTime, subMinutes(now, 1)) && 
                 !reminder.notified;
        });
      });
      
      if (taskWithReminder) {
        setReminderTask(taskWithReminder);
      }
      
      const taskDue = tasks.find(task => {
        if (task.status !== TaskStatus.Planned) return false;
        
        const dueTime = parseISO(task.dueDate);
        return isBefore(dueTime, now) && 
               isAfter(dueTime, subMinutes(now, 1));
      });
      
      if (taskDue) {
        setDueTask(taskDue);
      }
    };
    
    checkRemindersAndDueDates();
    const intervalId = setInterval(checkRemindersAndDueDates, 60000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, tasks]);

  const handleCloseReminderModal = () => {
    if (reminderTask) {
      const updatedReminders = reminderTask.reminders.map(reminder => ({
        ...reminder,
        notified: true
      }));
      
      setReminderTask(null);
    }
  };

  const handleAcceptTask = async () => {
    if (dueTask) {
      await activateTask(dueTask.id);
      setDueTask(null);
    }
  };

  const handlePostponeTask = async (minutes: number) => {
    if (dueTask) {
      await postponeTask(dueTask.id, minutes);
      setDueTask(null);
    }
  };

  const tasksForSelectedDate = getTasksByDate(selectedDate);
  
  const plannedTasks = tasksForSelectedDate.filter(task => task.status === TaskStatus.Planned);
  const activeTasks = tasksForSelectedDate.filter(task => task.status === TaskStatus.Active);
  const completedTasks = tasksForSelectedDate.filter(task => task.status === TaskStatus.Completed);
  const overdueTasks = tasksForSelectedDate.filter(task => task.status === TaskStatus.Overdue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          Управление задачами
        </h1>
        
        <button 
          onClick={openCreateTaskModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={20} className="mr-1" />
          Создать задачу
        </button>
      </div>
      
      <WeekCalendar 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
      
      {tasksForSelectedDate.length === 0 ? (
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Нет задач на выбранную дату</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Создайте новую задачу, чтобы начать планирование
          </p>
          <button 
            onClick={openCreateTaskModal}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Создать задачу
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {overdueTasks.length > 0 && (
            <TaskList 
              tasks={overdueTasks}
              title="Просроченные задачи"
              emptyMessage="Нет просроченных задач"
            />
          )}
          
          {plannedTasks.length > 0 && (
            <TaskList 
              tasks={plannedTasks}
              title="Запланированные задачи"
              emptyMessage="Нет запланированных задач"
            />
          )}
          
          {activeTasks.length > 0 && (
            <TaskList 
              tasks={activeTasks}
              title="Активные задачи"
              emptyMessage="Нет активных задач"
            />
          )}
          
          {completedTasks.length > 0 && (
            <TaskList 
              tasks={completedTasks}
              title="Выполненные задачи"
              emptyMessage="Нет выполненных задач"
            />
          )}
        </div>
      )}
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={taskToEdit}
        selectedDate={selectedDate}
      />
      
      {reminderTask && (
        <NotificationModal
          type="reminder"
          task={reminderTask}
          onClose={handleCloseReminderModal}
        />
      )}
      
      {dueTask && (
        <NotificationModal
          type="taskDue"
          task={dueTask}
          onClose={() => setDueTask(null)}
          onAccept={handleAcceptTask}
          onPostpone={handlePostponeTask}
        />
      )}
    </div>
  );
};

export default HomePage;