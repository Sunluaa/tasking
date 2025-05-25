import React from 'react';
import Modal from './Modal';
import TaskForm from '../tasks/TaskForm';
import { Task } from '../../types';
import { useTask } from '../../contexts/TaskContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  selectedDate?: Date;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, selectedDate }) => {
  const { addTask, updateTask } = useTask();
  
  // Обработчик отправки формы
  const handleSubmit = async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    try {
      if (task) {
        // Обновление существующей задачи
        await updateTask(task.id, taskData);
      } else {
        // Создание новой задачи
        await addTask(taskData);
      }
      
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении задачи:', error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={task ? 'Редактирование задачи' : 'Создание новой задачи'}
      size="lg"
    >
      <TaskForm 
        task={task}
        onSubmit={handleSubmit}
        onCancel={onClose}
        selectedDate={selectedDate}
      />
    </Modal>
  );
};

export default TaskModal;