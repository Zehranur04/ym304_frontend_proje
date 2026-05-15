import { BASE_URL, getAuthHeader } from './api';

export const goalService = {
    // yeni hedef oluştur (backend: POST api/Goals)
    createGoal: (data) =>
        fetch(`${BASE_URL}/Goals`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        }).then(res => res.json()),

    // tamamlanan hedefleri getir (backend: GET api/Goals/completed)
    getCompletedGoals: () =>
        fetch(`${BASE_URL}/Goals/completed`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // aktif hedefleri getir (backend: GET api/Goals/active)
    getActiveGoals: () =>
        fetch(`${BASE_URL}/Goals/active`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // tek hedef detayı (backend: GET api/Goals/{id})
    getGoalById: (id) =>
        fetch(`${BASE_URL}/Goals/${id}`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // hedef güncelle (backend: PUT api/Goals - body'de id var)
    updateGoal: (data) =>
        fetch(`${BASE_URL}/Goals`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data)
        }).then(res => res.json()),

    // hedef sil (backend: DELETE api/Goals/{id})
    deleteGoal: (id) =>
        fetch(`${BASE_URL}/Goals/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // hedefi tamamlandı olarak işaretle (backend: PUT api/Goals/{id}/complete)
    completeGoal: (id) =>
        fetch(`${BASE_URL}/Goals/${id}/complete`, {
            method: 'PUT',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // süresi geçen hedefleri kontrol et (backend: POST api/Goals/check-expired)
    checkExpiredGoals: () =>
        fetch(`${BASE_URL}/Goals/check-expired`, {
            method: 'POST',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // hedef ilerleme ekle (backend: POST api/GoalTrackings)
    addProgress: (data) =>
        fetch(`${BASE_URL}/GoalTrackings`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(data)  // { goalId, value } bekler
        }).then(res => res.json()),

    // hedef ilerleme geri al (backend: DELETE api/GoalTrackings/undo/{goalId})
    removeProgress: (goalId) =>
        fetch(`${BASE_URL}/GoalTrackings/undo/${goalId}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        }).then(res => res.json()),

    // tracking geçmişi (backend: GET api/GoalTrackings/history?goalId=&startDate=&endDate=)
    getTrackingHistory: (goalId, startDate, endDate) => {
        let url = `${BASE_URL}/GoalTrackings/history?goalId=${goalId}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        return fetch(url, { headers: getAuthHeader() }).then(res => res.json());
    },

    getArchivedGoals: () =>
        fetch(`${BASE_URL}/Goals/archived`, { headers: getAuthHeader() })
            .then(res => res.json()),

    archiveGoal: (id) =>
        fetch(`${BASE_URL}/Goals/${id}/archive`, {
            method: 'PUT',
            headers: getAuthHeader()
        }).then(res => res.json()),

    unarchiveGoal: (id) =>
        fetch(`${BASE_URL}/Goals/${id}/unarchive`, {
            method: 'PUT',
            headers: getAuthHeader()
        }).then(res => res.json())
};
