import { BASE_URL, getAuthHeader } from './api';

export const gamificationService = {
  getMyBadges: async () => {
    try {
      const response = await fetch(`${BASE_URL}/Gamification/my-badges`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Rozetler çekilirken hata:", error);
      throw error;
    }
  }
};
