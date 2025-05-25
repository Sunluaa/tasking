import { format, addMinutes, addDays, parseISO, formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

// Московская временная зона
const MOSCOW_TIMEZONE = 'Europe/Moscow';

// Получение текущего времени в Москве
export const getCurrentMoscowTime = (): Date => {
  const now = new Date();
  return utcToZonedTime(now, MOSCOW_TIMEZONE);
};

// Форматирование даты в понятный вид
export const formatDate = (date: Date | string, formatStr: string = 'dd.MM.yyyy'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: ru });
};

// Форматирование времени
export const formatTime = (date: Date | string, formatStr: string = 'HH:mm'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: ru });
};

// Форматирование даты и времени вместе
export const formatDateTime = (date: Date | string, formatStr: string = 'dd.MM.yyyy HH:mm'): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr, { locale: ru });
};

// Конвертация локального времени в московское
export const toMoscowTime = (date: Date): Date => {
  return utcToZonedTime(zonedTimeToUtc(date, Intl.DateTimeFormat().resolvedOptions().timeZone), MOSCOW_TIMEZONE);
};

// Конвертация московского времени в локальное
export const fromMoscowTime = (date: Date): Date => {
  return zonedTimeToUtc(date, MOSCOW_TIMEZONE);
};

// Получение расстояния до даты в текстовом виде
export const getTimeUntil = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  if (parsedDate < now) {
    return 'Просрочено';
  }
  
  return formatDistance(parsedDate, now, { 
    addSuffix: true,
    locale: ru
  });
};

// Получение отформатированного времени для вывода оставшегося времени
export const getFormattedTimeRemaining = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} мин`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ч ${mins > 0 ? `${mins} мин` : ''}`;
  } else {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return `${days} д ${hours > 0 ? `${hours} ч` : ''}`;
  }
};

// Отложить дату на определенное количество минут
export const postponeTime = (date: Date | string, minutes: number): Date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addMinutes(parsedDate, minutes);
};

// Отложить дату на определенное количество дней
export const postponeDays = (date: Date | string, days: number): Date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsedDate, days);
};

// Форматирование длительности (в минутах) в читаемый вид
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '';
  
  if (minutes < 60) {
    return `${minutes} мин`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours} ч`;
    } else {
      return `${hours} ч ${mins} мин`;
    }
  }
};