import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  TaskTag, 
  TaskStatus, 
  TaskContextType, 
  SortType
} from '../types';
import { useAuth } from './AuthContext';
import { isSameDay, parseISO, isAfter } from 'date-fns';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: React.ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([]);

  // Загрузка данных при инициализации или смене пользователя
  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setTasks([]);
      setTags([]);
    }
  }, [currentUser]);

  // Периодическая проверка просроченных задач
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        updateTaskStatuses();
      }
    }, 60000); // Проверка каждую минуту

    return () => clearInterval(interval);
  }, [currentUser, tasks]);

  // Загрузка данных пользователя
  const loadData = () => {
    if (!currentUser) return;

    // Загрузка тегов
    try {
      const storedTags = localStorage.getItem(`tags_${currentUser.id}`);
      if (storedTags) {
        const parsedTags = JSON.parse(storedTags);
        setTags(parsedTags);
      } else {
        // Создание предустановленных тегов, если их нет
        const defaultTags: TaskTag[] = [
          { id: uuidv4(), name: 'Работа', color: '#4f46e5' },
          { id: uuidv4(), name: 'Учёба', color: '#0891b2' },
          { id: uuidv4(), name: 'Личное', color: '#7c3aed' },
        ];
        setTags(defaultTags);
        localStorage.setItem(`tags_${currentUser.id}`, JSON.stringify(defaultTags));
      }
    } catch (error) {
      console.error('Ошибка при загрузке тегов:', error);
    }

    // Загрузка задач
    try {
      const storedTasks = localStorage.getItem(`tasks_${currentUser.id}`);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  };

  // Сохранение задач
  const saveTasks = (newTasks: Task[]) => {
    if (!currentUser) return;
    localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  // Сохранение тегов
  const saveTags = (newTags: TaskTag[]) => {
    if (!currentUser) return;
    localStorage.setItem(`tags_${currentUser.id}`, JSON.stringify(newTags));
    setTags(newTags);
  };

  // Обновление статусов задач
  const updateTaskStatuses = () => {
    const now = new Date();
    const updatedTasks = tasks.map(task => {
      // Пропускаем выполненные задачи
      if (task.status === TaskStatus.Completed) {
        return task;
      }

      // Пропускаем активные задачи при проверке на просроченность
      if (task.status === TaskStatus.Active) {
        return task;
      }

      const dueDate = parseISO(task.dueDate);
      
      // Если задача запланирована и срок наступил
      if (task.status === TaskStatus.Planned && isAfter(now, dueDate)) {
        return { ...task, status: TaskStatus.Overdue };
      }

      return task;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      saveTasks(updatedTasks);
    }
  };

  // Добавление новой задачи
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>): Promise<Task> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const newTask: Task = {
      id: uuidv4(),
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      ...taskData
    };

    const newTasks = [...tasks, newTask];
    saveTasks(newTasks);
    return newTask;
  };

  // Обновление задачи
  const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const taskIndex = tasks.findIndex(t => t.id === id && t.userId === currentUser.id);
    if (taskIndex === -1) return null;

    const updatedTask = { ...tasks[taskIndex], ...taskData };
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    
    saveTasks(newTasks);
    return updatedTask;
  };

  // Удаление задачи
  const deleteTask = async (id: string): Promise<boolean> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const newTasks = tasks.filter(t => !(t.id === id && t.userId === currentUser.id));
    
    if (newTasks.length === tasks.length) {
      return false; // Задача не найдена
    }
    
    saveTasks(newTasks);
    return true;
  };

  // Выполнение задачи
  const completeTask = async (id: string): Promise<Task | null> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const taskIndex = tasks.findIndex(t => t.id === id && t.userId === currentUser.id);
    if (taskIndex === -1) return null;

    const updatedTask = { 
      ...tasks[taskIndex], 
      status: TaskStatus.Completed,
      completedAt: new Date().toISOString()
    };
    
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    
    saveTasks(newTasks);
    return updatedTask;
  };

  // Отмена выполнения задачи
  const uncompleteTask = async (id: string): Promise<Task | null> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const taskIndex = tasks.findIndex(t => t.id === id && t.userId === currentUser.id);
    if (taskIndex === -1) return null;

    const task = tasks[taskIndex];
    if (task.status !== TaskStatus.Completed) return task;

    const dueDate = parseISO(task.dueDate);
    const now = new Date();
    
    const updatedTask = { 
      ...task, 
      status: isAfter(now, dueDate) ? TaskStatus.Overdue : TaskStatus.Planned,
      completedAt: undefined
    };
    
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    
    saveTasks(newTasks);
    return updatedTask;
  };

  // Активация задачи
  const activateTask = async (id: string): Promise<Task | null> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const taskIndex = tasks.findIndex(t => t.id === id && t.userId === currentUser.id);
    if (taskIndex === -1) return null;

    const updatedTask = { ...tasks[taskIndex], status: TaskStatus.Active };
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    
    saveTasks(newTasks);
    return updatedTask;
  };

  // Отложить задачу
  const postponeTask = async (id: string, minutes: number): Promise<Task | null> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const taskIndex = tasks.findIndex(t => t.id === id && t.userId === currentUser.id);
    if (taskIndex === -1) return null;

    const task = tasks[taskIndex];
    const dueDate = parseISO(task.dueDate);
    const newDueDate = new Date(dueDate.getTime() + minutes * 60000);

    const updatedTask = { 
      ...task, 
      dueDate: newDueDate.toISOString(),
      status: TaskStatus.Planned
    };
    
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    
    saveTasks(newTasks);
    return updatedTask;
  };

  // Получение задач по дате
  const getTasksByDate = (date: Date): Task[] => {
    if (!currentUser) return [];
    
    return tasks.filter(task => {
      if (task.userId !== currentUser.id) return false;
      
      const taskDate = parseISO(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Получение задач по статусу
  const getTasksByStatus = (status: TaskStatus): Task[] => {
    if (!currentUser) return [];
    
    return tasks.filter(task => 
      task.userId === currentUser.id && task.status === status
    );
  };

  // Получение задачи по ID
  const getTaskById = (id: string): Task | null => {
    if (!currentUser) return null;
    
    return tasks.find(task => 
      task.id === id && task.userId === currentUser.id
    ) || null;
  };

  // Добавление нового тега
  const addTag = async (tagData: Omit<TaskTag, 'id'>): Promise<TaskTag> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const newTag: TaskTag = {
      id: uuidv4(),
      ...tagData
    };

    const newTags = [...tags, newTag];
    saveTags(newTags);
    return newTag;
  };

  // Обновление тега
  const updateTag = async (id: string, tagData: Partial<TaskTag>): Promise<TaskTag | null> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const tagIndex = tags.findIndex(t => t.id === id);
    if (tagIndex === -1) return null;

    const updatedTag = { ...tags[tagIndex], ...tagData };
    const newTags = [...tags];
    newTags[tagIndex] = updatedTag;
    
    saveTags(newTags);
    return updatedTag;
  };

  // Удаление тега
  const deleteTag = async (id: string): Promise<boolean> => {
    if (!currentUser) throw new Error('Пользователь не авторизован');

    const newTags = tags.filter(t => t.id !== id);
    
    if (newTags.length === tags.length) {
      return false; // Тег не найден
    }
    
    saveTags(newTags);
    
    // Удаление тега из задач
    const updatedTasks = tasks.map(task => {
      if (task.tags.includes(id)) {
        return {
          ...task,
          tags: task.tags.filter(tagId => tagId !== id)
        };
      }
      return task;
    });
    
    saveTasks(updatedTasks);
    return true;
  };

  // Сортировка задач
  const sortTasks = (taskList: Task[], sortType: SortType): Task[] => {
    const sortedTasks = [...taskList];
    
    switch (sortType) {
      case SortType.DifficultyAsc:
        return sortedTasks.sort((a, b) => {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        });
        
      case SortType.DifficultyDesc:
        return sortedTasks.sort((a, b) => {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return diffOrder[b.difficulty] - diffOrder[a.difficulty];
        });
        
      case SortType.DateAsc:
        return sortedTasks.sort((a, b) => 
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
      case SortType.DateDesc:
        return sortedTasks.sort((a, b) => 
          new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        );
        
      default:
        return sortedTasks;
    }
  };

  const value: TaskContextType = {
    tasks,
    tags,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    activateTask,
    postponeTask,
    getTasksByDate,
    getTasksByStatus,
    getTaskById,
    addTag,
    updateTag,
    deleteTag,
    sortTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};