import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, User, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { getUnreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const unreadCount = getUnreadCount();

  const navItems = [
    { title: 'Главная', path: '/', authRequired: true },
    { title: 'Мои задачи', path: '/tasks', authRequired: true },
    { title: 'Активные задачи', path: '/active-tasks', authRequired: true },
    { title: 'Календарь', path: '/calendar', authRequired: true },
    { title: 'Профиль', path: '/profile', authRequired: true },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.authRequired || (item.authRequired && isAuthenticated)
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors hover:text-primary-700 dark:hover:text-primary-300"
            >
              Tasking
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 ml-6">
              {filteredNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    font-medium transition-colors
                    ${location.pathname === item.path 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}
                  `}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            >
              {theme === 'light' ? (
                <Moon size={20} className="text-gray-700 dark:text-gray-200" />
              ) : (
                <Sun size={20} className="text-gray-700 dark:text-gray-200" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/notifications" 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                  aria-label="Уведомления"
                >
                  <Bell size={20} className="text-gray-700 dark:text-gray-200" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/profile" 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Профиль"
                >
                  <User size={20} className="text-gray-700 dark:text-gray-200" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hidden md:block btn btn-secondary"
                >
                  Выйти
                </button>
              </>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link to="/login" className="btn btn-secondary">
                  Вход
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-700 dark:text-gray-200" />
              ) : (
                <Menu size={24} className="text-gray-700 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 py-2 space-y-2 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            {filteredNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  block py-2 px-4 rounded-md transition-colors font-medium
                  ${location.pathname === item.path
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="pt-2 flex flex-col space-y-2">
                <Link 
                  to="/login" 
                  className="btn btn-secondary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Вход
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleLogout}
                className="block w-full mt-2 py-2 px-4 text-left text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Выйти
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;