import React, { useState, useEffect } from 'react';
import { useTask } from '../../contexts/TaskContext';
import { Task, TaskDifficulty, TaskStatus, TaskTag } from '../../types';
import { getCurrentMoscowTime, formatDate, formatTime } from '../../utils/dateUtils';
import Select from 'react-select';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => void;
  onCancel: () => void;
  selectedDate?: Date;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel, selectedDate }) => {
  const { tags } = useTask();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(task?.estimatedTime?.toString() || '');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(task?.difficulty || TaskDifficulty.Medium);
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [reminderTime, setReminderTime] = useState('');

  // Настройка формы при инициализации
  useEffect(() => {
    if (task) {
      // Если редактируем задачу, устанавливаем значения из неё
      const taskDate = new Date(task.dueDate);
      setDueDate(formatDate(taskDate, 'yyyy-MM-dd'));
      setDueTime(formatTime(taskDate, 'HH:mm'));
      
      // Если у задачи есть напоминание, устанавливаем его время
      if (task.reminders?.length > 0) {
        const firstReminder = task.reminders[0];
        const reminderDate = new Date(firstReminder.time);
        setReminderTime(formatTime(reminderDate, 'HH:mm'));
      }
    } else {
      // Если создаём новую задачу
      const moscowTime = getCurrentMoscowTime();
      
      // Используем выбранную дату в календаре или текущую дату
      const dateToUse = selectedDate || moscowTime;
      
      setDueDate(formatDate(dateToUse, 'yyyy-MM-dd'));
      setDueTime(formatTime(moscowTime, 'HH:mm'));
      
      // По умолчанию устанавливаем напоминание за 10 минут до срока
      const defaultReminderTime = new Date(moscowTime);
      defaultReminderTime.setMinutes(defaultReminderTime.getMinutes() - 10);
      setReminderTime(formatTime(defaultReminderTime, 'HH:mm'));
    }
  }, [task, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Создаем объект с датой и временем выполнения
    const dueDateObj = new Date(`${dueDate}T${dueTime}`);
    
    // Создаем объект с временем напоминания
    const reminderTimeObj = new Date(`${dueDate}T${reminderTime}`);
    
    // Преобразуем оценочное время в число, если оно указано
    const estimatedTimeValue = estimatedTime ? parseInt(estimatedTime, 10) : undefined;
    
    // Создаем массив напоминаний
    const reminders = reminderTime ? [
      {
        id: task?.reminders?.[0]?.id || Math.random().toString(36).substring(2, 9),
        time: reminderTimeObj.toISOString(),
        notified: false
      }
    ] : [];
    
    onSubmit({
      title,
      description,
      dueDate: dueDateObj.toISOString(),
      estimatedTime: estimatedTimeValue,
      status: task?.status || TaskStatus.Planned,
      difficulty,
      tags: selectedTags,
      reminders,
      completedAt: task?.completedAt
    });
  };

  // Подготовка опций для выбора тегов
  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color
  }));

  // Опции для выбора сложности
  const difficultyOptions = [
    { value: TaskDifficulty.Easy, label: 'Лёгкий', color: '#22c55e' },
    { value: TaskDifficulty.Medium, label: 'Средний', color: '#f59e0b' },
    { value: TaskDifficulty.Hard, label: 'Сложный', color: '#ef4444' }
  ];

  // Кастомный стиль для компонента выбора тегов
  const customSelectStyles = {
    option: (styles: any, { data }: any) => ({
      ...styles,
      backgroundColor: 'white',
      color: 'black',
      ':hover': {
        backgroundColor: '#f3f4f6',
      },
      display: 'flex',
      alignItems: 'center',
    }),
    multiValue: (styles: any, { data }: any) => ({
      ...styles,
      backgroundColor: data.color ? `${data.color}20` : '#e5e7eb',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (styles: any, { data }: any) => ({
      ...styles,
      color: data.color || '#374151',
      fontWeight: 500,
    }),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">
          Название задачи *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder="Введите название задачи"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="label">
          Описание
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[100px]"
          placeholder="Введите описание задачи (необязательно)"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="label">
            Дата *
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="dueTime" className="label">
            Время *
          </label>
          <input
            id="dueTime"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="input"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reminderTime" className="label">
            Время напоминания
          </label>
          <input
            id="reminderTime"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="input"
          />
        </div>
        
        <div>
          <label htmlFor="estimatedTime" className="label">
            Запланировано сделать за (минут)
          </label>
          <input
            id="estimatedTime"
            type="number"
            min="1"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="input"
            placeholder="Например: 30"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="difficulty" className="label">
          Сложность *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {difficultyOptions.map(option => (
            <button
              key={option.value}
              type="button"
              className={`
                py-2 px-4 rounded-md border transition-all
                ${difficulty === option.value 
                  ? `bg-opacity-20 bg-${option.value === TaskDifficulty.Easy ? 'success' : option.value === TaskDifficulty.Medium ? 'warning' : 'danger'}-100 border-${option.value === TaskDifficulty.Easy ? 'success' : option.value === TaskDifficulty.Medium ? 'warning' : 'danger'}-500 dark:bg-${option.value === TaskDifficulty.Easy ? 'success' : option.value === TaskDifficulty.Medium ? 'warning' : 'danger'}-900/30`
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }
              `}
              onClick={() => setDifficulty(option.value)}
              style={{
                backgroundColor: difficulty === option.value ? `${option.color}20` : '',
                borderColor: difficulty === option.value ? option.color : ''
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: option.color }}
                ></span>
                <span className={`
                  font-medium
                  ${difficulty === option.value 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-700 dark:text-gray-300'}
                `}>
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label htmlFor="tags" className="label">
          Теги
        </label>
        <Select
          isMulti
          name="tags"
          options={tagOptions}
          className="react-select-container"
          classNamePrefix="react-select"
          value={tagOptions.filter(option => selectedTags.includes(option.value))}
          onChange={(selected) => {
            const selectedValues = selected ? selected.map(option => option.value) : [];
            setSelectedTags(selectedValues);
          }}
          placeholder="Выберите теги"
          styles={customSelectStyles}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {task ? 'Сохранить изменения' : 'Создать задачу'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;