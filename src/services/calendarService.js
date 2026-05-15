import { BASE_URL, getAuthHeader } from './api';

export const calendarService = {
  getMonthSummary: async (year, month) => {
    try {
      const response = await fetch(`${BASE_URL}/Calendar/month-summary?year=${year}&month=${month}`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Takvim aylık özet çekilirken hata:", error);
      throw error;
    }
  },

  getDayDetails: async (dateString) => {
    try {
      const response = await fetch(`${BASE_URL}/Calendar/day-details?date=${dateString}`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Günlük detay çekilirken hata:", error);
      throw error;
    }
  }
};
