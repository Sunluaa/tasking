import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-8">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;