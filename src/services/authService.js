import { BASE_URL } from './api';

export const authService = {
    // giriş yap (backend: POST api/Auth/login)
    login: (email, password) =>
        fetch(`${BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(res => res.json().then(data => ({ ok: res.ok, data }))),

    // kayıt ol (backend: POST api/Auth/register)
    register: (userData) =>
        fetch(`${BASE_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(res => res.json().then(data => ({ ok: res.ok, data })))
};
