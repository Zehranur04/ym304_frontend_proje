import { BASE_URL, getAuthHeader } from './api';

export const habitService = {
    // kategori listesi (backend: GET api/Categories)
    getCategories: () =>
        fetch(`${BASE_URL}/Categories`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // yeni alışkanlık oluştur (backend: POST api/Habits)
    createHabit: (data) =>
        fetch(`${BASE_URL}/Habits`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        }).then(res => res.json()),

    // tamamlanan alışkanlıkları getir (backend: GET api/Habits/completed)
    getCompletedHabits: () =>
        fetch(`${BASE_URL}/Habits/completed`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // aktif alışkanlıkları getir (backend: GET api/Habits/active)
    getActiveHabits: () =>
        fetch(`${BASE_URL}/Habits/active`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // tek alışkanlık detayını getir (backend: GET api/Habits/{id})
    getHabitById: (id) =>
        fetch(`${BASE_URL}/Habits/${id}`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // alışkanlık güncelle (backend: PUT api/Habits - body'de id var)
    updateHabit: (data) =>
        fetch(`${BASE_URL}/Habits`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        }).then(res => res.json()),

    // alışkanlık sil (backend: DELETE api/Habits/{id})
    deleteHabit: (id) =>
        fetch(`${BASE_URL}/Habits/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // alışkanlığı tamamlandı olarak işaretle (backend: PUT api/Habits/{id}/complete)
    completeHabit: (id) =>
        fetch(`${BASE_URL}/Habits/${id}/complete`, {
            method: 'PUT',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // ilerleme ekle (backend: POST api/HabitTrackings)
    addProgress: (data) =>
        fetch(`${BASE_URL}/HabitTrackings`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)  // { habitId, value } bekler
        }).then(res => res.json()),

    // ilerleme geri al (backend: DELETE api/HabitTrackings/undo/{habitId})
    removeProgress: (habitId) =>
        fetch(`${BASE_URL}/HabitTrackings/undo/${habitId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // tracking geçmişi (backend: GET api/HabitTrackings/history?habitId=&startDate=&endDate=)
    getTrackingHistory: (habitId, startDate, endDate) => {
        let url = `${BASE_URL}/HabitTrackings/history?habitId=${habitId}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        return fetch(url, { headers: getAuthHeader() }).then(res => res.json());
    },

    checkExpiredHabits: () =>
        fetch(`${BASE_URL}/Habits/check-expired`, {
            method: 'POST',
            headers: getAuthHeader()
        }).then(res => res.json()),

    getArchivedHabits: () =>
        fetch(`${BASE_URL}/Habits/archived`, { headers: getAuthHeader() })
            .then(res => res.json()),

    archiveHabit: (id) =>
        fetch(`${BASE_URL}/Habits/${id}/archive`, {
            method: 'PUT',
            headers: getAuthHeader()
        }).then(res => res.json()),

    unarchiveHabit: (id) =>
        fetch(`${BASE_URL}/Habits/${id}/unarchive`, {
            method: 'PUT',
            headers: getAuthHeader()
        }).then(res => res.json())
};