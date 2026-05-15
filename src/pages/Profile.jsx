import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { gamificationService } from '../services/gamificationService';
import Toast from '../components/Toast';
import { TrophyOutlined, StarFilled } from '@ant-design/icons';
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

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Düzenleme formu
  const [editMode, setEditMode] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [formData, setFormData] = useState({ name: '', surname: '', bio: '', profilePictureUrl: '' });

  const [toast, setToast] = useState({ message: '', type: 'info' });
  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, badgesRes] = await Promise.all([
          profileService.getProfile(),
          gamificationService.getMyBadges()
        ]);
        const p = profileRes?.data || null;
        setProfile(p);
        setBadges(badgesRes?.data || []);
        if (p) {
          setFormData({
            name: p.name || '',
            surname: p.surname || '',
            bio: p.bio || '',
            profilePictureUrl: p.profilePictureUrl || ''
          });
        }
      } catch {
        showToast("Profil verileri alınamadı", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await profileService.updateProfile(formData);
      if (result?.success) {
        setProfile(prev => ({
          ...prev,
          name: formData.name,
          surname: formData.surname,
          fullName: `${formData.name} ${formData.surname}`.trim(),
          bio: formData.bio,
          profilePictureUrl: formData.profilePictureUrl
        }));
        setEditMode(false);
        setShowAvatarPicker(false);
        showToast("Profil güncellendi! 🌸", "success");
        window.dispatchEvent(new CustomEvent('profile-updated'));
      } else {
        showToast(result?.message || "Güncelleme başarısız", "error");
      }
    } catch {
      showToast("Güncelleme sırasında hata oluştu", "error");
    } finally {
      setSaving(false);
    }
  };

  const currentAvatar = getAvatar(editMode ? formData.profilePictureUrl : profile?.profilePictureUrl);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', background: '#FFFBFF', maxWidth: '860px', margin: '0 auto' }}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Profil kartı */}
      <div style={cardStyle}>
        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ ...avatarCircle, background: currentAvatar.bg }}>
            <span style={{ fontSize: '3.5rem' }}>{currentAvatar.emoji}</span>
          </div>
          {editMode && (
            <button
              onClick={() => setShowAvatarPicker(v => !v)}
              style={changeAvatarBtn}
              title="Avatar değiştir"
            >
              ✏️
            </button>
          )}
        </div>

        {/* Bilgiler */}
        <div style={{ flex: 1 }}>
          {!editMode ? (
            <>
              <h1 style={{ color: '#3b237c', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                {profile?.fullName || 'Kullanıcı'}
              </h1>
              {profile?.bio && (
                <p style={{ color: '#888', fontSize: '0.9rem', margin: '4px 0 8px 0' }}>{profile.bio}</p>
              )}
              <p style={{ color: '#6A1B9A', fontWeight: 600, margin: '4px 0' }}>
                <TrophyOutlined style={{ marginRight: 6 }} />
                Toplam Skor: {profile?.totalScore || 0}
              </p>
              <p style={{ color: '#999', fontSize: '0.8rem', margin: '4px 0' }}>{profile?.email}</p>
              <button onClick={() => setEditMode(true)} style={editBtn}>✏️ Profili Düzenle</button>
            </>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Ad</label>
                  <input
                    style={inputStyle}
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Adınız"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Soyad</label>
                  <input
                    style={inputStyle}
                    value={formData.surname}
                    onChange={e => setFormData(p => ({ ...p, surname: e.target.value }))}
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Biyografi</label>
                <input
                  style={inputStyle}
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Kendinizi kısaca tanıtın..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} disabled={saving} style={saveBtn}>
                  {saving ? '⏳ Kaydediliyor...' : '✅ Kaydet'}
                </button>
                <button onClick={() => { setEditMode(false); setShowAvatarPicker(false); }} style={cancelBtn}>
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar seçici (Netflix tarzı grid) */}
      {showAvatarPicker && (
        <div style={avatarPickerContainer}>
          <h3 style={{ color: '#4A148C', margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>
            Avatar Seç
          </h3>
          <div style={avatarGrid}>
            {AVATARS.map(av => (
              <button
                key={av.id}
                onClick={() => { setFormData(p => ({ ...p, profilePictureUrl: av.id })); setShowAvatarPicker(false); }}
                style={{
                  ...avatarPickerItem,
                  background: av.bg,
                  outline: formData.profilePictureUrl === av.id ? '3px solid #7B1FA2' : '3px solid transparent',
                  transform: formData.profilePictureUrl === av.id ? 'scale(1.12)' : 'scale(1)',
                }}
                title={av.id}
              >
                <span style={{ fontSize: '2rem' }}>{av.emoji}</span>
                {formData.profilePictureUrl === av.id && (
                  <span style={selectedCheck}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rozetler */}
      <div style={{ ...cardStyle, flexDirection: 'column', marginTop: '24px' }}>
        <h2 style={{ color: '#3b237c', fontWeight: 800, fontSize: '1.3rem', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StarFilled style={{ color: '#F59E0B' }} /> Kazanılan Rozetler
        </h2>

        {badges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: '#FAF5FF', borderRadius: '16px', border: '2px dashed #CE93D8' }}>
            <span style={{ fontSize: '3rem', opacity: 0.4 }}>🏆</span>
            <p style={{ color: '#888', marginTop: '12px' }}>Henüz rozet kazanmadın. Hedeflerini tamamladıkça rozetlerin burada görünecek!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {badges.map(badge => (
              <div key={badge.id} style={badgeCard}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{badge.iconData || '🏆'}</div>
                <h4 style={{ color: '#4A148C', fontWeight: 700, fontSize: '0.85rem', margin: '0 0 4px 0', textAlign: 'center' }}>{badge.badgeName}</h4>
                <p style={{ color: '#999', fontSize: '0.72rem', textAlign: 'center', margin: 0 }}>{badge.description}</p>
                <p style={{ color: '#bbb', fontSize: '0.68rem', marginTop: '6px' }}>
                  {new Date(badge.earnedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// stiller
const cardStyle = {
  display: 'flex', alignItems: 'flex-start', gap: '28px',
  background: 'white', borderRadius: '24px',
  border: '1px solid #F3E5F5', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  padding: '28px'
};
const avatarCircle = {
  width: '110px', height: '110px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  flexShrink: 0
};
const changeAvatarBtn = {
  position: 'absolute', bottom: 0, right: 0,
  width: '32px', height: '32px', borderRadius: '50%',
  background: '#7B1FA2', color: 'white', border: 'none',
  cursor: 'pointer', fontSize: '0.85rem', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};
const editBtn = {
  marginTop: '12px', padding: '8px 18px',
  background: 'linear-gradient(135deg, #FFDEE9, #E1BEE7)',
  color: '#4A148C', border: 'none', borderRadius: '12px',
  cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem'
};
const saveBtn = {
  padding: '10px 22px', background: '#4A148C', color: 'white',
  border: 'none', borderRadius: '12px', cursor: 'pointer',
  fontWeight: 700, fontSize: '0.88rem'
};
const cancelBtn = {
  padding: '10px 18px', background: '#F3E5F5', color: '#6A1B9A',
  border: 'none', borderRadius: '12px', cursor: 'pointer',
  fontWeight: 600, fontSize: '0.88rem'
};
const labelStyle = {
  display: 'block', marginBottom: '5px',
  fontSize: '0.78rem', fontWeight: 700, color: '#6A1B9A'
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #E1BEE7', outline: 'none', boxSizing: 'border-box',
  fontSize: '0.9rem'
};
const avatarPickerContainer = {
  background: 'white', borderRadius: '20px',
  border: '1px solid #F3E5F5', boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
  padding: '24px', marginTop: '16px'
};
const avatarGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
  gap: '12px'
};
const avatarPickerItem = {
  width: '70px', height: '70px', borderRadius: '50%',
  border: 'none', cursor: 'pointer', position: 'relative',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'transform 0.15s ease, outline 0.15s ease'
};
const selectedCheck = {
  position: 'absolute', bottom: '2px', right: '2px',
  background: '#7B1FA2', color: 'white', borderRadius: '50%',
  width: '18px', height: '18px', fontSize: '0.65rem',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700
};
const badgeCard = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  background: '#FAF5FF', borderRadius: '16px',
  padding: '18px 12px', border: '1px solid #F3E5F5',
  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  transition: 'transform 0.2s ease'
};

export default Profile;
