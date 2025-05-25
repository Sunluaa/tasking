import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileForm: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Загрузка данных пользователя при инициализации
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!username.trim()) {
      setError('Имя пользователя не может быть пустым');
      return;
    }
    
    try {
      setLoading(true);
      const success = await updateProfile({ username });
      
      if (success) {
        setSuccess('Имя пользователя успешно обновлено');
      } else {
        setError('Ошибка при обновлении имени пользователя');
      }
    } catch (err) {
      setError((err as Error).message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // В реальном приложении здесь была бы загрузка файла,
    // но для упрощения мы используем только URL
    try {
      setLoading(true);
      const success = await updateProfile({ avatarUrl });
      
      if (success) {
        setSuccess('Аватар успешно обновлен');
      } else {
        setError('Ошибка при обновлении аватара');
      }
    } catch (err) {
      setError((err as Error).message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Новый пароль должен содержать не менее 6 символов');
      return;
    }
    
    if (oldPassword !== currentUser?.password) {
      setError('Неверный текущий пароль');
      return;
    }
    
    try {
      setLoading(true);
      const success = await updateProfile({ password: newPassword });
      
      if (success) {
        setSuccess('Пароль успешно обновлен');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError('Ошибка при обновлении пароля');
      }
    } catch (err) {
      setError((err as Error).message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Пользователь не авторизован</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card p-6 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
        
        {success && (
          <div className="mb-4 bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-400 p-3 rounded-md text-sm">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleUsernameUpdate} className="mb-6">
          <div className="mb-4">
            <label htmlFor="username" className="label">
              Имя пользователя
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Введите новое имя пользователя"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email не может быть изменен
            </p>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Обновление...' : 'Обновить информацию'}
          </button>
        </form>
        
        <form onSubmit={handleAvatarUpdate}>
          <div className="mb-4">
            <label htmlFor="avatarUrl" className="label">
              URL аватара
            </label>
            <input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input"
              placeholder="Введите URL изображения"
            />
          </div>
          
          {avatarUrl && (
            <div className="mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-primary-300 dark:border-primary-700">
                <img 
                  src={avatarUrl} 
                  alt="Предпросмотр аватара" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Ошибка';
                  }}
                />
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Обновление...' : 'Обновить аватар'}
          </button>
        </form>
      </div>
      
      <div className="card p-6 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4">Изменить пароль</h2>
        
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="label">
              Текущий пароль
            </label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input"
              placeholder="Введите текущий пароль"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="label">
              Новый пароль
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              placeholder="Введите новый пароль"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="label">
              Подтверждение нового пароля
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Повторите новый пароль"
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Обновление...' : 'Изменить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;