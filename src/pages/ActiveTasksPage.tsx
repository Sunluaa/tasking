import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { TaskStatus } from '../types';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/modals/TaskModal';

const ActiveTasksPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { getTasksByStatus } = useTask();
  const navigate = useNavigate();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(undefined);
  
  // Перенаправление на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Получение активных задач
  const activeTasks = getTasksByStatus(TaskStatus.Active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Активные задачи
        </h1>
      </div>
      
      {activeTasks.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">У вас нет активных задач</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Активируйте задачу из списка запланированных, чтобы начать над ней работу
          </p>
        </div>
      ) : (
        <TaskList 
          tasks={activeTasks}
          title="Активные задачи"
          emptyMessage="Нет активных задач"
          collapsible={false}
        />
      )}
      
      {/* Модальное окно для редактирования задачи */}
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={taskToEdit}
      />
    </div>
  );
};

export default ActiveTasksPage;