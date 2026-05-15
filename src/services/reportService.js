import { BASE_URL, getAuthHeader } from './api';

export const reportService = {
  getHabitAbsences: async () => {
    const response = await fetch(`${BASE_URL}/Reports/habit-absences`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  getHabitStatistics: async () => {
    const response = await fetch(`${BASE_URL}/Reports/habit-statistics`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  getGoalStatistics: async () => {
    const response = await fetch(`${BASE_URL}/Reports/goal-statistics`, {
      method: 'GET',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};
