import React, { useState, useEffect } from 'react';
import { gamificationService } from '../services/gamificationService';

// Sistemdeki tüm rozetlerin tanım listesi
const BADGE_DEFINITIONS = [
  {
    category: 'Alışkanlık Rozetleri',
    emoji: '🎯',
    badges: [
      { name: 'İlk Adım',          icon: '🌱', description: 'İlk alışkanlığını tamamla.',                hint: '1 alışkanlık tamamla' },
      { name: 'Alışkanlık Ustası', icon: '🏅', description: 'Kararlılığın ilham verici!',                hint: '5 alışkanlık tamamla' },
      { name: 'Efsane',            icon: '👑', description: 'Sen artık gerçek bir şampiyon efsanesisin.', hint: '10 alışkanlık tamamla' },
    ],
  },
  {
    category: 'Hedef Rozetleri',
    emoji: '🚀',
    badges: [
      { name: 'Hedef Avcısı',  icon: '🎯', description: 'İlk hedefini tamamladın.',                      hint: '1 hedef tamamla' },
      { name: 'Kararlı',       icon: '💪', description: 'Odaklanma gücün gerçekten etkileyici!',          hint: '5 hedef tamamla' },
      { name: 'Vizyon Sahibi', icon: '🌟', description: 'Hayallerini gerçeğe dönüştürme konusunda usta.', hint: '10 hedef tamamla' },
    ],
  },
  {
    category: 'Seri Rozetleri',
    emoji: '🔥',
    badges: [
      { name: '3 Gün Ateşi',       icon: '🔥', description: '3 gün üst üste görevini tamamladın.',           hint: '3 gün üst üste alışkanlık tamamla' },
      { name: '7 Günlük İstikrar', icon: '⭐', description: 'Tam bir hafta! İradene hayran kaldık.',          hint: '7 gün üst üste alışkanlık tamamla' },
      { name: '30 Günlük Demir',   icon: '🔩', description: '30 gün kesintisiz, artık bir alışkanlık makinesin.', hint: '30 gün üst üste alışkanlık tamamla' },
    ],
  },
];

const Badges = () => {
  const [earnedMap, setEarnedMap] = useState({});   // { badgeName: { earnedAt, ... } }
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    gamificationService.getMyBadges()
      .then(res => {
        const list = res?.data || [];
        const map = {};
        list.forEach(b => { map[b.badgeName] = b; });
        setEarnedMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalDefined = BADGE_DEFINITIONS.reduce((s, g) => s + g.badges.length, 0);
  const totalEarned  = Object.keys(earnedMap).length;

  return (
    <div style={{ padding: '30px', background: '#FFFBFF', maxWidth: '920px', margin: '0 auto' }}>

      {/* Başlık */}
      <div style={headerCard}>
        <div>
          <h2 style={{ color: '#3b237c', fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>🏆 Rozetlerim</h2>
          <p style={{ color: '#888', margin: '6px 0 0', fontSize: '0.9rem' }}>
            Kazandıklarını gör, kilitli olanlara ulaşmak için ne gerektiğini öğren.
          </p>
        </div>
        <div style={progressPill}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4A148C' }}>{totalEarned}</span>
          <span style={{ color: '#888', fontSize: '0.82rem' }}>/ {totalDefined} rozet</span>
          <div style={progressTrack}>
            <div style={{ ...progressFill, width: `${Math.round((totalEarned / totalDefined) * 100)}%` }} />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>Yükleniyor...</p>
      ) : (
        BADGE_DEFINITIONS.map(group => (
          <div key={group.category} style={{ marginTop: '32px' }}>

            {/* Grup başlığı */}
            <h3 style={{ color: '#4A148C', fontWeight: 700, fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{group.emoji}</span> {group.category}
            </h3>

            <div style={grid}>
              {group.badges.map(def => {
                const earned = earnedMap[def.name];
                return (
                  <div key={def.name} style={earned ? unlockedCard : lockedCard}>

                    {/* İkon dairesi */}
                    <div style={{ ...iconCircle, background: earned ? '#F3E5F5' : '#F0F0F0', filter: earned ? 'none' : 'grayscale(1) opacity(0.45)' }}>
                      <span style={{ fontSize: '2.2rem' }}>{def.icon}</span>
                    </div>

                    {/* Rozet adı */}
                    <h4 style={{ margin: '12px 0 4px', color: earned ? '#3b237c' : '#aaa', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
                      {earned ? def.name : <><span style={{ marginRight: 4 }}>🔒</span>{def.name}</>}
                    </h4>

                    {/* Alt bilgi: kazanıldıysa tarih, kazanılmadıysa ipucu */}
                    {earned ? (
                      <>
                        <p style={earnedDesc}>{def.description}</p>
                        <span style={earnedDateBadge}>
                          {new Date(earned.earnedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })} tarihinde kazandın 🎉
                        </span>
                      </>
                    ) : (
                      <p style={hintText}>👉 {def.hint}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// stiller
const headerCard = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
  background: 'white', borderRadius: '20px', padding: '24px 28px',
  border: '1px solid #F3E5F5', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
};
const progressPill = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '120px'
};
const progressTrack = {
  width: '100%', height: '8px', background: '#F3E5F5', borderRadius: '10px', overflow: 'hidden'
};
const progressFill = {
  height: '100%', background: 'linear-gradient(90deg, #CE93D8, #7B1FA2)', borderRadius: '10px', transition: 'width 0.4s ease'
};
const grid = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px'
};
const baseCard = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  borderRadius: '20px', padding: '24px 16px',
  border: '1px solid', transition: 'transform 0.2s ease'
};
const unlockedCard = {
  ...baseCard,
  background: 'white',
  borderColor: '#E1BEE7',
  boxShadow: '0 4px 18px rgba(106,27,154,0.08)',
};
const lockedCard = {
  ...baseCard,
  background: '#FAFAFA',
  borderColor: '#E8E8E8',
  boxShadow: 'none',
};
const iconCircle = {
  width: '72px', height: '72px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '3px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
};
const earnedDesc = {
  color: '#666', fontSize: '0.78rem', textAlign: 'center', margin: '4px 0 10px', lineHeight: 1.4
};
const earnedDateBadge = {
  display: 'inline-block', padding: '5px 12px',
  background: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
  color: '#6A1B9A', borderRadius: '20px',
  fontSize: '0.72rem', fontWeight: 700, textAlign: 'center'
};
const hintText = {
  color: '#bbb', fontSize: '0.78rem', textAlign: 'center', margin: '6px 0 0', lineHeight: 1.4
};

export default Badges;
