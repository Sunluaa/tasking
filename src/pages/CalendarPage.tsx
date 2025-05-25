import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WeekCalendar from '../components/calendar/WeekCalendar';

const CalendarPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Календарь
      </h1>
      
      <WeekCalendar 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default CalendarPage;