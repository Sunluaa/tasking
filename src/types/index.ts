// Типы пользователя
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

// Типы для задач
export enum TaskDifficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum TaskStatus {
  Planned = 'planned',
  Active = 'active',
  Completed = 'completed',
  Overdue = 'overdue',
}

export interface TaskTag {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface TaskReminder {
  id: string;
  time: string; // ISO string
  notified: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  estimatedTime?: number; // minutes
  status: TaskStatus;
  difficulty: TaskDifficulty;
  tags: string[]; // Tag IDs
  reminders: TaskReminder[];
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
}

// Типы для уведомлений
export enum NotificationType {
  Reminder = 'reminder',
  TaskDue = 'taskDue',
}

export interface Notification {
  id: string;
  userId: string;
  taskId: string;
  type: NotificationType;
  message: string;
  time: string; // ISO string
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  data?: any;
}

// Типы для настроек
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark';
  defaultReminderTime: number; // minutes before due date
}

// Типы для сортировки
export enum SortType {
  DifficultyAsc = 'difficultyAsc',
  DifficultyDesc = 'difficultyDesc',
  DateAsc = 'dateAsc',
  DateDesc = 'dateDesc',
}

// Интерфейс для контекста аутентификации
export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

// Интерфейс для контекста задач
export interface TaskContextType {
  tasks: Task[];
  tags: TaskTag[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Promise<Task>;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<Task | null>;
  uncompleteTask: (id: string) => Promise<Task | null>;
  activateTask: (id: string) => Promise<Task | null>;
  postponeTask: (id: string, minutes: number) => Promise<Task | null>;
  getTasksByDate: (date: Date) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTaskById: (id: string) => Task | null;
  addTag: (tag: Omit<TaskTag, 'id'>) => Promise<TaskTag>;
  updateTag: (id: string, tag: Partial<TaskTag>) => Promise<TaskTag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  sortTasks: (tasks: Task[], sortType: SortType) => Task[];
}

// Интерфейс для контекста уведомлений
export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  getUnreadCount: () => number;
}

// Интерфейс для контекста настроек
export interface SettingsContextType {
  settings: UserSettings | null;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
}