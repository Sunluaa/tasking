import React from 'react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        Вход в систему
      </h1>
      <LoginForm />
    </div>
  );
};

export default LoginPage;