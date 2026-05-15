import { BASE_URL, getAuthHeader } from './api';

export const notificationService = {
  getUnreadNotifications: async () => {
    try {
      const response = await fetch(`${BASE_URL}/Notifications/unread`, {
        method: 'GET',
        headers: getAuthHeader()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Bildirimler çekilirken hata:", error);
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/Notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Bildirim okundu işaretlenirken hata:", error);
      throw error;
    }
  }
};
