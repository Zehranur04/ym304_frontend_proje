// tüm servislerin ortak kullandığı base url ve header ayarları
const BASE_URL = "http://localhost:5294/api";

// token varsa header'a ekle
const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem("token")}`,
    'Content-Type': 'application/json'
});

export { BASE_URL, getAuthHeader };
