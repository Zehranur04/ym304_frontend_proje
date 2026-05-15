import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { Badge, Dropdown } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificationService } from '../services/notificationService';

const AVATARS = [
  { id: 'av_cat',     emoji: '🐱', bg: '#FFD6E0' },
  { id: 'av_dog',     emoji: '🐶', bg: '#FFF0C2' },
  { id: 'av_fox',     emoji: '🦊', bg: '#FFD9C0' },
  { id: 'av_bear',    emoji: '🐻', bg: '#D4C5A9' },
  { id: 'av_panda',   emoji: '🐼', bg: '#E0E0E0' },
  { id: 'av_lion',    emoji: '🦁', bg: '#FFE0A3' },
  { id: 'av_tiger',   emoji: '🐯', bg: '#FFDDB3' },
  { id: 'av_wolf',    emoji: '🐺', bg: '#D6D6F5' },
  { id: 'av_koala',   emoji: '🐨', bg: '#C8E6C9' },
  { id: 'av_rabbit',  emoji: '🐰', bg: '#FCE4EC' },
  { id: 'av_frog',    emoji: '🐸', bg: '#C8F0C8' },
  { id: 'av_owl',     emoji: '🦉', bg: '#EDE0C8' },
  { id: 'av_penguin', emoji: '🐧', bg: '#BBDEFB' },
  { id: 'av_unicorn', emoji: '🦄', bg: '#F8BBD9' },
  { id: 'av_dragon',  emoji: '🐲', bg: '#B2DFDB' },
  { id: 'av_robot',   emoji: '🤖', bg: '#CFD8DC' },
  { id: 'av_alien',   emoji: '👾', bg: '#E1BEE7' },
  { id: 'av_ghost',   emoji: '👻', bg: '#F3E5F5' },
];

const getAvatar = (id) => AVATARS.find(a => a.id === id) || { emoji: '👤', bg: '#E1BEE7' };

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', surname: '', avatarId: '' });
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(() => {
    if (!token) return;
    profileService.getProfile()
      .then(response => {
        if (response?.data) {
          const parts = (response.data.fullName || "").split(" ");
          setUser({
            name: parts[0] || "",
            surname: parts.slice(1).join(" ") || "",
            avatarId: response.data.profilePictureUrl || ""
          });
        }
      })
      .catch(() => setUser({ name: "Kullanıcı", surname: "", avatarId: "" }));
  }, [token]);

  const fetchNotifications = useCallback(() => {
    if (!token) return;
    notificationService.getUnreadNotifications()
      .then(response => {
        if (response?.data) setNotifications(response.data);
      })
      .catch(err => console.log("Bildirimler çekilemedi:", err));
  }, [token]);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, [fetchProfile, fetchNotifications]);

  // Profil ve bildirim event dinleyicileri — sayfa yenilemeden güncelleme
  useEffect(() => {
    window.addEventListener('profile-updated', fetchProfile);
    window.addEventListener('notifications-updated', fetchNotifications);
    return () => {
      window.removeEventListener('profile-updated', fetchProfile);
      window.removeEventListener('notifications-updated', fetchNotifications);
    };
  }, [fetchProfile, fetchNotifications]);

  const handleLogout = () => {
    localStorage.clear(); // Bütün verileri (token dahil) temizle
    navigate('/login');    // Giriş sayfasına fırlat
  };

  const handleNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch(err) {
      console.log("Bildirim okundu işaretlenemedi:", err);
    }
  };

  // Çan kapatıldığında tüm görülen bildirimleri okundu say
  const handleBellOpenChange = (open) => {
    if (!open && notifications.length > 0) {
      const ids = notifications.map(n => n.id);
      ids.forEach(id => notificationService.markAsRead(id).catch(() => {}));
      setNotifications([]);
    }
  };

  // Ant Design Dropdown için menü öğeleri
  const notificationItems = notifications.length > 0 
    ? notifications.map(notif => ({
        key: notif.id,
        label: (
          <div onClick={() => handleNotificationRead(notif.id)} style={{ padding: '8px', width: '280px', whiteSpace: 'normal', cursor: 'pointer' }}>
            <div style={{ fontWeight: 'bold', color: '#6A1B9A', marginBottom: '4px' }}>{notif.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#555577', lineHeight: '1.4' }}>{notif.message}</div>
            <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '6px', textAlign: 'right' }}>
              {new Date(notif.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute:'2-digit' })}
            </div>
          </div>
        )
      }))
    : [{ key: 'empty', label: <div style={{ padding: '15px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Yeni bildirim yok 🎉</div> }];


  return (
    <nav style={{
      background: 'linear-gradient(135deg, #FFDEE9 0%, #E1BEE7 100%)', // İstediğin soft pembe - lila geçişi
      padding: '12px 30px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", // En net okunan, "5" gibi görünmeyen font
      position: 'relative',
      zIndex: 50
    }}>

      {/* Logo Alanı */}
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '40px' }}>
        <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>🌸</span>
        <b style={{ fontSize: '1.2rem', color: '#6A1B9A', letterSpacing: '0.5px' }}>
          Alışkanlık Takibi
        </b>
      </div>

      {/* Menü Linkleri */}
      <div style={{ display: 'flex', gap: '25px' }}>
        {token && (
          <>
            <Link to="/dashboard" className="nav-link">Özetim</Link>
            <Link to="/habits" className="nav-link">Alışkanlıklar</Link>
            <Link to="/goals" className="nav-link">Hedefler</Link>
            <Link to="/calendar" className="nav-link">Takvim</Link>
            <Link to="/reports" className="nav-link">Raporlar</Link>
            <Link to="/badges" className="nav-link">🏆 Rozetler</Link>
          </>
        )}
      </div>

      {/* Profil, Bildirimler ve Çıkış Bölümü */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
        {token ? (
          <>
            {/* Bildirim Çanı (UC-16) */}
            <Dropdown menu={{ items: notificationItems }} trigger={['click']} placement="bottomRight" overlayStyle={{ zIndex: 100 }} onOpenChange={handleBellOpenChange}>
              <Badge count={notifications.length} style={{ backgroundColor: '#ff4d4f' }} offset={[-4, 4]}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #F8BBD0',
                  transition: 'all 0.3s ease'
                }}
                className="hover:bg-white/90 hover:scale-110 hover:shadow-md"
                >
                  <BellOutlined style={{ fontSize: '1.25rem', color: '#4A148C' }} />
                </div>
              </Badge>
            </Dropdown>

            {/* Kullanıcı profil kartı */}
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                padding: '5px 14px 5px 5px',
                borderRadius: '25px',
                color: '#4A148C',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid #F8BBD0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              className="hover:bg-white/90 hover:shadow-md"
              >
                {/* Avatar dairesi */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: getAvatar(user.avatarId).bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                  border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                  {getAvatar(user.avatarId).emoji}
                </div>
                {user.name} {user.surname}
              </div>
            </Link>

            {/* Çıkış Butonu */}
            <button
              onClick={handleLogout}
              style={{
                background: '#FFEBEE',
                color: '#C62828',
                border: '1px solid #FFCDD2',
                padding: '7px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                transition: '0.3s'
              }}
              className="hover:bg-[#FFCDD2]"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: '#6A1B9A', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Giriş Yap
          </Link>
        )}
      </div>

      {/* Ekran Bozulmalarını Engelleyen CSS Kuralları */}
      <style>{`
        .nav-link {
          color: #4A148C; 
          text-decoration: none; 
          font-weight: 600;
          font-size: 0.95rem;
          transition: 0.2s ease;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.4);
          color: #9C27B0;
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;