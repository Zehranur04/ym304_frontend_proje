import { BASE_URL, getAuthHeader } from './api';

export const profileService = {
    // kullanıcı profilini getir (backend: GET api/Profile)
    getProfile: () =>
        fetch(`${BASE_URL}/Profile`, { headers: getAuthHeader() })
            .then(res => res.json()),

    // profili güncelle (backend: PUT api/Profile/update)
    updateProfile: (data) =>
        fetch(`${BASE_URL}/Profile/update`, {
            method: 'PUT',
            headers: getAuthHeader(),
            body: JSON.stringify(data)  // { name, surname, bio, profilePictureUrl } bekler
        }).then(res => res.json())
};
