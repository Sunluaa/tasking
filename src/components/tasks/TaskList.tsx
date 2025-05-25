import React, { useState } from 'react';
import { Task, SortType } from '../../types';
import TaskCard from './TaskCard';
import { ChevronDown, ChevronUp, SortAsc, SortDesc } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';

interface TaskListProps {
  tasks: Task[];
  title: string;
  emptyMessage: string;
  collapsible?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  title, 
  emptyMessage, 
  collapsible = true
}) => {
  const { sortTasks } = useTask();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sortType, setSortType] = useState<SortType>(SortType.DateAsc);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Обработчик изменения типа сортировки
  const handleSortChange = (newSortType: SortType) => {
    setSortType(newSortType);
  };

  // Сортировка задач
  const sortedTasks = sortTasks(tasks, sortType);

  // Выбор задачи для редактирования
  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  return (
    <div className="mb-6 card">
      <div 
        className={`p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <h2 className="text-xl font-semibold flex items-center">
          {title}
          {tasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({tasks.length})
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleSortChange(SortType.DateAsc)}
              className={`p-1 ${sortType === SortType.DateAsc ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title="Сортировать по дате (по возрастанию)"
            >
              <SortAsc size={16} />
            </button>
            <button
              onClick={() => handleSortChange(SortType.DateDesc)}
              className={`p-1 ${sortType === SortType.DateDesc ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title="Сортировать по дате (по убыванию)"
            >
              <SortDesc size={16} />
            </button>
            <button
              onClick={() => handleSortChange(SortType.DifficultyAsc)}
              className={`p-1 ${sortType === SortType.DifficultyAsc ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title="Сортировать по сложности (от легких к сложным)"
            >
              ↑🔴
            </button>
            <button
              onClick={() => handleSortChange(SortType.DifficultyDesc)}
              className={`p-1 ${sortType === SortType.DifficultyDesc ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              title="Сортировать по сложности (от сложных к легким)"
            >
              ↓🟢
            </button>
          </div>
          
          {collapsible && (
            <button className="text-gray-500 dark:text-gray-400">
              {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {sortedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => handleEditTask(task.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;