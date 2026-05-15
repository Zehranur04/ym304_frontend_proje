import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import { goalService } from '../services/goalService';
import { profileService } from '../services/profileService';
import { reportService } from '../services/reportService';
import { Progress } from 'antd';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [activeHabits, setActiveHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeHabitsRes, completedHabitsRes, activeGoalsRes, completedGoalsRes, profileRes] = await Promise.all([
          habitService.getActiveHabits(),
          habitService.getCompletedHabits(),
          goalService.getActiveGoals(),
          goalService.getCompletedGoals(),
          profileService.getProfile()
        ]);
        setActiveHabits(activeHabitsRes?.data || activeHabitsRes || []);
        setCompletedHabits(completedHabitsRes?.data || completedHabitsRes || []);
        setActiveGoals(activeGoalsRes?.data || activeGoalsRes || []);
        setCompletedGoals(completedGoalsRes?.data || completedGoalsRes || []);
        setProfile(profileRes?.data || null);
      } catch (err) {
        console.log("dashboard verileri yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const refreshProfile = () => {
      profileService.getProfile()
        .then(res => setProfile(res?.data || null))
        .catch(() => { });
    };
    window.addEventListener('profile-updated', refreshProfile);
    return () => window.removeEventListener('profile-updated', refreshProfile);
  }, []);

  useEffect(() => {
    reportService.getHabitAbsences()
      .then(res => {
        if (res?.success) setAbsences(res.data || []);
        else showToast(res?.message || "Devamsızlık raporu alınamadı.", "warning");
      })
      .catch(() => showToast("Devamsızlık raporu yüklenirken hata oluştu.", "error"));
  }, []);

  const totalGoals = activeGoals.length + completedGoals.length;
  const totalHabits = activeHabits.length + completedHabits.length;
  const goalPct = totalGoals === 0 ? 0 : Math.round((completedGoals.length / totalGoals) * 100);
  const habitPct = totalHabits === 0 ? 0 : Math.round((completedHabits.length / totalHabits) * 100);

  // Hedefler listesi: aktifler üstte, tamamlananlar alta (max 6 göster)
  const allGoals = [...activeGoals, ...completedGoals];

  return (
    <div className="min-h-screen bg-[#E6E6FA] p-8 flex flex-col items-center">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* Karşılama */}
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white/50 shadow-xl mb-8">
        <h1 className="text-[42px] font-bold text-[#3b237c] mb-2">
          Hoş Geldin{profile ? `, ${profile.fullName}` : ''}! 🌟
        </h1>
        <p className="text-[#555577] text-lg italic">Bugünkü alışkanlıklarını ve hedeflerini buradan takip edebilirsin.</p>
        {profile && (
          <div style={{ marginTop: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <span style={statBadge}>🏆 Toplam Skor: {profile.totalScore}</span>
            <span style={statBadge}>📧 {profile.email}</span>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Yükleniyor...</p>
      ) : (
        <>
          {/* Özet kartları — 4'e çıktı */}
          <div className="w-full max-w-4xl grid grid-cols-4 gap-5 mb-8 max-md:grid-cols-2">

            {/* Aktif Alışkanlık */}
            <div style={summaryCardStyle('#FFD1DC', '#FF69B4')}>
              <span style={{ fontSize: '2.2rem' }}>🎯</span>
              <h3 style={summaryNum}>{activeHabits.length}</h3>
              <p style={summaryLabel}>Aktif Alışkanlık</p>
            </div>

            {/* Tamamlanan Alışkanlık */}
            <div style={{ ...summaryCardStyle('#C8E6C9', '#66BB6A'), position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0.85 }}>
                <Progress type="dashboard" percent={habitPct} size={40}
                  strokeColor="#2E7D32"
                  format={p => <span style={{ fontSize: '9px', color: '#2E7D32', fontWeight: 'bold' }}>{p}%</span>}
                />
              </div>
              <span style={{ fontSize: '2.2rem' }}>✅</span>
              <h3 style={summaryNum}>{completedHabits.length}</h3>
              <p style={summaryLabel}>Tamamlanan Alışkanlık</p>
            </div>

            {/* Aktif Hedef */}
            <div style={summaryCardStyle('#E6E6FA', '#9370DB')}>
              <span style={{ fontSize: '2.2rem' }}>🚀</span>
              <h3 style={summaryNum}>{activeGoals.length}</h3>
              <p style={summaryLabel}>Aktif Hedef</p>
            </div>

            {/* Tamamlanan Hedef */}
            <div style={{ ...summaryCardStyle('#FFF9C4', '#F9A825'), position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0.85 }}>
                <Progress type="dashboard" percent={goalPct} size={40}
                  strokeColor="#F57F17"
                  format={p => <span style={{ fontSize: '9px', color: '#F57F17', fontWeight: 'bold' }}>{p}%</span>}
                />
              </div>
              <span style={{ fontSize: '2.2rem' }}>🏆</span>
              <h3 style={summaryNum}>{completedGoals.length}</h3>
              <p style={summaryLabel}>Tamamlanan Hedef</p>
            </div>
          </div>
          <div className="w-full max-w-4xl flex gap-6 max-md:flex-col">
            <div className="flex-1 p-8 rounded-[30px] shadow-lg border border-white/40"
              style={{ background: 'linear-gradient(135deg, #ffffff 0%, #E6E6FA 100%)' }}>
              <h3 className="text-[22px] font-extrabold text-[#3b237c] mb-4">Günlük Alışkanlıklar ✨</h3>

              {activeHabits.length === 0 ? (
                <p className="text-[#555577] font-medium text-sm">Hadi, bugün için bir alışkanlık ekleyerek zinciri kırma!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeHabits.slice(0, 6).map(habit => {
                    const pct = habit.targetValue
                      ? Math.min(100, Math.round(((habit.currentValue || 0) / habit.targetValue) * 100))
                      : null;
                    return (
                      <div key={habit.id} style={listItemStyle}>
                        <span style={{ fontWeight: 600, color: '#3b237c', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {habit.title}
                        </span>
                        {pct !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px', minWidth: '80px' }}>
                            <Progress percent={pct} size="small" showInfo={false} strokeColor="#CE93D8" style={{ marginBottom: 0 }} />
                            <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: 'bold' }}>{pct}%</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#6A1B9A' }}>{habit.categoryName}</span>
                        )}
                      </div>
                    );
                  })}
                  {activeHabits.length > 6 && (
                    <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center' }}>+{activeHabits.length - 6} alışkanlık daha...</p>
                  )}
                </div>
              )}
            </div>

            {/* Hedefler - SAĞ */}
            <div className="flex-1 p-8 rounded-[30px] shadow-lg border border-white/40"
              style={{ background: 'linear-gradient(135deg, #ffffff 0%, #F3E5F5 100%)' }}>
              <h3 className="text-[22px] font-extrabold text-[#3b237c] mb-4">Hedefler 🚀</h3>

              {allGoals.length === 0 ? (
                <p className="text-[#555577] font-medium text-sm">Henüz bir hedef belirlemedin.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allGoals.slice(0, 6).map(goal => {
                    const pct = goal.isCompleted && goal.targetValue
                      ? 100
                      : !goal.isCompleted && goal.targetValue
                        ? Math.min(100, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100))
                        : null;

                    return (
                      <div key={goal.id} style={listItemStyle}>
                        <span style={{
                          fontWeight: 600, color: '#3b237c', flex: 1,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          opacity: goal.isCompleted ? 0.6 : 1
                        }}>
                          {goal.isCompleted ? '✅ ' : ''}{goal.title}
                        </span>

                        {pct !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px', minWidth: '90px' }}>
                            <Progress
                              percent={pct}
                              size="small"
                              showInfo={false}
                              strokeColor={goal.isCompleted ? '#66BB6A' : '#9370DB'}
                              style={{ marginBottom: 0, flex: 1 }}
                            />
                            <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                              {goal.isCompleted ? `${goal.targetValue}/${goal.targetValue}` : `${goal.currentValue || 0}/${goal.targetValue}`}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '10px' }}>
                            {goal.isCompleted ? '✅' : '⏳'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {allGoals.length > 6 && (
                    <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center' }}>+{allGoals.length - 6} hedef daha...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Devamsızlık */}
          <div className="w-full max-w-4xl mt-8 p-8 rounded-[30px] shadow-lg border border-white/40 transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #F3E5F5 100%)' }}>
            <h3 className="text-[22px] font-extrabold text-[#3b237c] mb-6 flex items-center gap-2">
              <span className="text-2xl">📅</span> Devamsızlık Durumu
            </h3>

            {absences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-white/50 rounded-2xl border-2 border-dashed border-[#CE93D8]">
                <span className="text-5xl mb-4">🌟</span>
                <h4 className="text-xl font-bold text-[#6A1B9A] mb-2">Harika gidiyorsun!</h4>
                <p className="text-[#555577] font-medium text-center max-w-md">Şu an için hiç devamsızlığın görünmüyor.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {absences.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 bg-white/70 rounded-2xl border border-[#FFCDD2]">
                    <span className="font-semibold text-[#3b237c]">{item.habitTitle}</span>
                    <span className="text-sm text-red-500 font-medium">
                      {new Date(item.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const summaryCardStyle = (bgColor, accentColor) => ({
  background: `linear-gradient(135deg, ${bgColor} 0%, #ffffff 100%)`,
  padding: '20px 18px',
  borderRadius: '22px',
  textAlign: 'center',
  boxShadow: '0 8px 25px rgba(0,0,0,0.06)',
  border: `1px solid ${bgColor}`,
  position: 'relative'
});

const summaryNum = { color: '#3b237c', margin: '8px 0 4px', fontSize: '1.7rem', fontWeight: '800' };
const summaryLabel = { color: '#555577', fontSize: '0.78rem', fontWeight: '600', margin: 0 };

const listItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.6)',
  borderRadius: '12px',
  fontSize: '0.9rem'
};

const statBadge = {
  display: 'inline-block',
  padding: '6px 14px',
  background: 'rgba(255,255,255,0.5)',
  borderRadius: '20px',
  fontSize: '0.85rem',
  color: '#3b237c',
  fontWeight: '600'
};

export default Dashboard;
