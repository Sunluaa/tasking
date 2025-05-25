import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { TaskTag } from '../../types';

const TagsList: React.FC = () => {
  const { tags, addTag, updateTag, deleteTag } = useTask();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#7c3aed'); // Фиолетовый по умолчанию
  
  // Обработчик добавления нового тега
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    await addTag({
      name: newTagName.trim(),
      color: newTagColor,
    });
    
    setNewTagName('');
    setNewTagColor('#7c3aed');
    setIsAdding(false);
  };
  
  // Обработчик обновления тега
  const handleUpdateTag = async (tagId: string) => {
    if (!newTagName.trim()) return;
    
    await updateTag(tagId, {
      name: newTagName.trim(),
      color: newTagColor,
    });
    
    setNewTagName('');
    setNewTagColor('#7c3aed');
    setEditingTagId(null);
  };
  
  // Обработчик удаления тега
  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тег? Он будет удален из всех задач.')) {
      await deleteTag(tagId);
    }
  };
  
  // Начало редактирования тега
  const startEditingTag = (tag: TaskTag) => {
    setEditingTagId(tag.id);
    setNewTagName(tag.name);
    setNewTagColor(tag.color || '#7c3aed');
  };
  
  // Отмена редактирования/добавления
  const cancelEditing = () => {
    setEditingTagId(null);
    setIsAdding(false);
    setNewTagName('');
    setNewTagColor('#7c3aed');
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Управление тегами</h2>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn btn-primary flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Добавить тег
          </button>
        )}
      </div>
      
      {isAdding && (
        <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-scale-in">
          <h3 className="font-medium mb-3">Новый тег</h3>
          
          <div className="flex flex-col space-y-3">
            <div>
              <label htmlFor="newTagName" className="label">
                Название
              </label>
              <input
                id="newTagName"
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="input"
                placeholder="Введите название тега"
              />
            </div>
            
            <div>
              <label htmlFor="newTagColor" className="label">
                Цвет
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="newTagColor"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-8 w-8 p-0 border-0 rounded-md cursor-pointer"
                />
                <span 
                  className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                  style={{ 
                    backgroundColor: `${newTagColor}20`,
                    color: newTagColor
                  }}
                >
                  {newTagName || 'Предпросмотр тега'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={handleAddTag} 
                className="btn btn-primary flex items-center"
              >
                <Check size={18} className="mr-1" />
                Создать
              </button>
              <button 
                onClick={cancelEditing} 
                className="btn btn-secondary flex items-center"
              >
                <X size={18} className="mr-1" />
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      {tags.length === 0 && !isAdding ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          У вас нет созданных тегов
        </div>
      ) : (
        <ul className="space-y-2">
          {tags.map(tag => (
            <li 
              key={tag.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {editingTagId === tag.id ? (
                <div className="flex-grow space-y-3">
                  <div>
                    <label htmlFor={`editTagName-${tag.id}`} className="label">
                      Название
                    </label>
                    <input
                      id={`editTagName-${tag.id}`}
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="input"
                      placeholder="Введите название тега"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`editTagColor-${tag.id}`} className="label">
                      Цвет
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        id={`editTagColor-${tag.id}`}
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="h-8 w-8 p-0 border-0 rounded-md cursor-pointer"
                      />
                      <span 
                        className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                        style={{ 
                          backgroundColor: `${newTagColor}20`,
                          color: newTagColor
                        }}
                      >
                        {newTagName || 'Предпросмотр тега'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={() => handleUpdateTag(tag.id)} 
                      className="btn btn-primary flex items-center"
                    >
                      <Check size={18} className="mr-1" />
                      Сохранить
                    </button>
                    <button 
                      onClick={cancelEditing} 
                      className="btn btn-secondary flex items-center"
                    >
                      <X size={18} className="mr-1" />
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <span 
                      className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                      style={{ 
                        backgroundColor: `${tag.color}20`,
                        color: tag.color
                      }}
                    >
                      {tag.name}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => startEditingTag(tag)} 
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                      title="Редактировать тег"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTag(tag.id)} 
                      className="p-1 rounded-full hover:bg-danger-100 dark:hover:bg-danger-900/30 text-danger-600 dark:text-danger-400 transition-colors"
                      title="Удалить тег"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagsList;