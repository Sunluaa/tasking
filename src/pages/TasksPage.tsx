import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Task, TaskStatus, SortType } from '../types';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/modals/TaskModal';

const TasksPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { tasks } = useTask();
  const navigate = useNavigate();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const openCreateTaskModal = () => {
    setTaskToEdit(undefined);
    setIsTaskModalOpen(true);
  };

  const plannedTasks = tasks.filter(task => task.status === TaskStatus.Planned);
  const activeTasks = tasks.filter(task => task.status === TaskStatus.Active);
  const completedTasks = tasks.filter(task => task.status === TaskStatus.Completed);
  const overdueTasks = tasks.filter(task => task.status === TaskStatus.Overdue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          Мои задачи
        </h1>
        
        <button 
          onClick={openCreateTaskModal}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Создать задачу
        </button>
      </div>
      
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
      
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={taskToEdit}
      />
    </div>
  );
};

export default TasksPage;