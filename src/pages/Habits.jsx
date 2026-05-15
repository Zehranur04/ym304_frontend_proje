import React, { useState, useEffect, useCallback, useRef } from 'react';
import { habitService } from '../services/habitService';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import CongratsModal from '../components/CongratsModal';
import { getStepForUnit } from '../utils/units';

const Habits = ({ editId: externalEditId, onFinish }) => { // editId dışarıdan gelirse düzenleme moduna geçer
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeHabits, setActiveHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivedHabits, setArchivedHabits] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  // İçeride de düzenleme modunu tetikleyebilmek için (✏️ butonu)
  const [editId, setEditId] = useState(externalEditId || null);

  // toast bildirimi için state
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // onay modalı için state
  const [confirm, setConfirm] = useState({ message: '', onConfirm: null });

  // UC-17: Oyunlaştırma - rozet kazanıldığında gösterilecek modal
  const [congrats, setCongrats] = useState({ visible: false, badgeName: '', badgeDescription: '' });

  // Hızlı tıklamada çift istek gönderimini engelleyen guard (habit id → in-flight)
  const progressingRef = useRef(new Set());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    trackingType: 1,
    frequency: 1,
    targetValue: '',
    unit: ''
  });

  // birim seçenekleri (backend UnitType enum'undan)
  const unitOptions = [
    { value: 1, label: 'Adet' },
    { value: 2, label: 'Sayfa' },
    { value: 3, label: 'Litre' },
    { value: 4, label: 'Mililitre' },
    { value: 5, label: 'Bardak' },
    { value: 6, label: 'Kilometre' },
    { value: 7, label: 'Metre' },
    { value: 8, label: 'Dakika' },
    { value: 9, label: 'Saat' },
    { value: 10, label: 'Kalori' },
    { value: 11, label: 'Adım' },
    { value: 12, label: 'Kilogram' },
    { value: 13, label: 'Gram' },
    { value: 14, label: 'Para' },
    { value: 15, label: 'Bölüm' },
    { value: 16, label: 'Kere' },
    { value: 17, label: 'Gün' }
  ];

  // toast gösterme kısayolu
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // dışarıdan editId prop'u geldiğinde içeride senkronla
  useEffect(() => {
    if (externalEditId) setEditId(externalEditId);
  }, [externalEditId]);

  // editId değiştiğinde formu doldur (GetHabitById bağlantısı)
  useEffect(() => {
    if (editId) {
      habitService.getHabitById(editId).then(response => {
        const data = response.data || response;
        setFormData({
          title: data.title || '',
          description: data.description || '',
          categoryId: data.categoryId || '',
          trackingType: data.trackingType || 1,
          frequency: data.frequency || 1,
          targetValue: data.targetValue || '',
          unit: data.unit || ''
        });
        setShowForm(true);
      }).catch(() => console.log("düzenlenecek veri getirilemedi"));
    }
  }, [editId]);

  // ✏️ butonundan tetiklenen düzenleme
  const handleEdit = (id) => {
    setEditId(id);
  };

  // formu sıfırla (iptal / submit sonrası)
  const resetForm = () => {
    setFormData({ title: '', description: '', categoryId: '', trackingType: 1, frequency: 1, targetValue: '', unit: '' });
    setEditId(null);
    setShowForm(false);
  };

  // alışkanlık listesini yenile (form submit/delete sonrası)
  const refreshHabits = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        habitService.getActiveHabits(),
        habitService.getCompletedHabits()
      ]);
      setActiveHabits(activeRes?.data || activeRes || []);
      setCompletedHabits(completedRes?.data || completedRes || []);
    } catch (err) {
      console.log("liste yenilenirken hata");
    }
  }, []);

  const loadArchivedHabits = useCallback(async () => {
    try {
      const res = await habitService.getArchivedHabits();
      setArchivedHabits(res?.data || res || []);
    } catch (err) {
      console.log("arşiv yüklenemedi");
    }
  }, []);

  const handleArchive = async (id) => {
    try {
      await habitService.archiveHabit(id);
      setActiveHabits(prev => prev.filter(h => h.id !== id));
      setCompletedHabits(prev => prev.filter(h => h.id !== id));
      showToast("Alışkanlık arşivlendi 📦", "info");
    } catch {
      showToast("Arşivleme sırasında hata oluştu", "error");
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await habitService.unarchiveHabit(id);
      setArchivedHabits(prev => prev.filter(h => h.id !== id));
      await refreshHabits();
      showToast("Alışkanlık arşivden çıkarıldı ✅", "success");
    } catch {
      showToast("Arşivden çıkarma sırasında hata oluştu", "error");
    }
  };

  const handleToggleArchive = async () => {
    if (!showArchive) await loadArchivedHabits();
    setShowArchive(prev => !prev);
  };

  // kategorileri ve alışkanlıkları yükle
  useEffect(() => {
    const fetchData = async () => {
      // Süresi dolan haftalık alışkanlıkları önce kapat (fire-and-forget)
      habitService.checkExpiredHabits().catch(() => {});
      try {
        const [catResponse, activeRes, completedRes] = await Promise.all([
          habitService.getCategories(),
          habitService.getActiveHabits(),
          habitService.getCompletedHabits()
        ]);
        setCategories(catResponse?.data || catResponse || []);
        setActiveHabits(activeRes?.data || activeRes || []);
        setCompletedHabits(completedRes?.data || completedRes || []);
      } catch (err) {
        console.log("api bağlantı hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        trackingType: parseInt(formData.trackingType),
        frequency: parseInt(formData.frequency),
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
        unit: formData.unit ? parseInt(formData.unit) : null
      };

      if (editId) {
        // güncelleme: id'yi body'ye ekle
        const result = await habitService.updateHabit({ ...payload, id: editId });
        if (result?.success) {
          showToast("Başarıyla güncellendi! 🌸", "success");
        } else {
          showToast(result?.message || "Güncelleme sırasında bir sorun oluştu", "error");
          return;
        }
      } else {
        const result = await habitService.createHabit(payload);
        if (result?.success) {
          showToast("Yeni alışkanlık eklendi! ✨", "success");
        } else {
          showToast(result?.message || "Ekleme sırasında bir sorun oluştu", "error");
          return;
        }
      }
      resetForm();
      await refreshHabits();
      if (onFinish) onFinish();
    } catch (err) {
      showToast("İşlem sırasında hata oluştu", "error");
    }
  };

  // + butonu: pop-up YOK. Birime göre sabit step ile direkt API'ye istek atılır.
  // Response'tan currentAmount/percentage alınıp sadece o kart state'i güncellenir.
  const handleAddProgress = async (habit) => {
    if (progressingRef.current.has(habit.id)) return;
    progressingRef.current.add(habit.id);
    try {
      // Basit takipte (1) +1, sayısal takipte (2) birime göre step
      const step = habit.trackingType === 2 ? getStepForUnit(habit.unit) : 1;
      const result = await habitService.addProgress({ habitId: habit.id, value: step });

      if (!result?.success) {
        showToast(result?.message || "İlerleme eklenemedi", "error");
        return;
      }

      const newCurrentAmount = Number(result.currentAmount ?? 0);
      const newPercentage = result.percentage ?? 0;
      const target = Number(habit.targetValue || 0);

      // Hedef miktarına ulaşıldıysa tamamla
      if (target > 0 && newCurrentAmount >= target) {
        if (habit.frequency === 2) {
          // Haftalık: hedef doldu → bugünü tamamlandı işaretle, pencere devam eder
          setActiveHabits(prev => prev.map(h =>
            h.id === habit.id
              ? { ...h, currentValue: newCurrentAmount, completedThisPeriod: true }
              : h
          ));
          showToast("Haftalık hedef doldu! Pencere sonunda otomatik kapanacak. 🗓️", "success");
        } else {
          // Günlük: kalıcı tamamlama
          try {
            await habitService.completeHabit(habit.id);
            setActiveHabits(prev => prev.filter(h => h.id !== habit.id));
            setCompletedHabits(prev => [{ ...habit, isCompleted: true, currentValue: newCurrentAmount }, ...prev]);
            showToast("Hedef doldu! Alışkanlık tamamlandı! 🎉", "success");
            window.dispatchEvent(new CustomEvent('profile-updated'));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
          } catch {
            showToast("Otomatik tamamlama sırasında hata oluştu", "error");
          }
        }
      } else {
        setActiveHabits(prev => prev.map(h =>
          h.id === habit.id
            ? { ...h, currentValue: newCurrentAmount, progressPercentage: newPercentage }
            : h
        ));
        showToast(`+${step} ${getUnitLabel(habit.unit)} eklendi! 💪`, "success");
      }

      // UC-17: Backend yeni rozet kazanıldığını söylüyorsa tebrik modalını aç
      if (result.hasNewBadge) {
        setCongrats({
          visible: true,
          badgeName: result.newBadgeName || "Yeni Rozet",
          badgeDescription: result.newBadgeDescription || "Tebrikler, bir rozet kazandın!"
        });
        window.dispatchEvent(new CustomEvent('notifications-updated'));
      }
    } catch (err) {
      showToast("İlerleme eklenirken hata oluştu", "error");
    } finally {
      progressingRef.current.delete(habit.id);
    }
  };

  // - butonu: lokal state'te step kadar geri al (refresh yok)
  const handleRemoveProgress = async (habit) => {
    try {
      const result = await habitService.removeProgress(habit.id);
      if (result && result.success === false) {
        showToast(result.message || "Geri alınamadı", "error");
        return;
      }

      const step = habit.trackingType === 2 ? getStepForUnit(habit.unit) : 1;
      const newValue = Math.max(0, Number(habit.currentValue || 0) - step);
      const target = Number(habit.targetValue || 0);
      const newPct = target > 0 ? Math.min(100, Math.round((newValue / target) * 100)) : 0;

      setActiveHabits(prev => prev.map(h =>
        h.id === habit.id
          ? { ...h, currentValue: newValue, progressPercentage: newPct }
          : h
      ));

      showToast("İlerleme geri alındı", "info");
    } catch (err) {
      showToast("Geri alma sırasında hata oluştu", "error");
    }
  };

  // birim değerinden okunabilir etiket
  const getUnitLabel = (unit) => {
    if (unit == null) return '';
    return unitOptions.find(u => u.value === parseInt(unit))?.label || '';
  };

  // alışkanlığı tamamla
  const handleComplete = (habit) => {
    const isWeekly = habit.frequency === 2;
    const msg = isWeekly
      ? "Bugünü tamamlandı olarak işaretlemek istiyor musun?"
      : "Bu alışkanlığı tamamlandı olarak işaretlemek istiyor musun?";

    setConfirm({
      message: msg,
      onConfirm: async () => {
        setConfirm({ message: '', onConfirm: null });
        try {
          if (isWeekly) {
            // Haftalık: bugünkü ilerlemeyi kaydet (basit tip için +1)
            const result = await habitService.addProgress({ habitId: habit.id, value: 1 });
            if (result && result.success === false) {
              showToast(result.message || "Tamamlama başarısız", "error");
              return;
            }
            setActiveHabits(prev => prev.map(h =>
              h.id === habit.id ? { ...h, completedThisPeriod: true } : h
            ));
            showToast("Bugün işaretlendi! 🗓️", "success");
            if (result?.hasNewBadge) {
              setCongrats({ visible: true, badgeName: result.newBadgeName || "Yeni Rozet", badgeDescription: result.newBadgeDescription || "" });
              window.dispatchEvent(new CustomEvent('notifications-updated'));
            }
          } else {
            // Günlük: kalıcı tamamlama
            const result = await habitService.completeHabit(habit.id);
            if (result && result.success === false) {
              showToast(result.message || "Tamamlama başarısız", "error");
              return;
            }
            setActiveHabits(prev => prev.filter(h => h.id !== habit.id));
            setCompletedHabits(prev => [{ ...habit, isCompleted: true }, ...prev]);
            showToast("Alışkanlık tamamlandı! Tebrikler! 🎉", "success");
            window.dispatchEvent(new CustomEvent('profile-updated'));
            window.dispatchEvent(new CustomEvent('notifications-updated'));
          }
        } catch (err) {
          showToast("Tamamlama sırasında hata oluştu", "error");
        }
      }
    });
  };

  // alışkanlık silme (modal ile onay) — lokal state'ten çıkar
  const handleDelete = (id) => {
    setConfirm({
      message: "Bu alışkanlığı silmek istediğine emin misin?",
      onConfirm: async () => {
        setConfirm({ message: '', onConfirm: null });
        try {
          await habitService.deleteHabit(id);
          showToast("Alışkanlık silindi", "info");
          setActiveHabits(prev => prev.filter(h => h.id !== id));
          setCompletedHabits(prev => prev.filter(h => h.id !== id));
        } catch (err) {
          showToast("Silme sırasında hata oluştu", "error");
        }
      }
    });
  };

  return (
    <div style={{ padding: '30px', background: '#FFFBFF' }}>
      {/* Toast bildirimi */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Onay modalı */}
      <ConfirmModal
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ message: '', onConfirm: null })}
      />

      {/* UC-17: Rozet tebrik modalı */}
      <CongratsModal
        visible={congrats.visible}
        onClose={() => setCongrats({ visible: false, badgeName: '', badgeDescription: '' })}
        title={`${congrats.badgeName} Rozeti Kazandın! 🏆`}
        message={congrats.badgeDescription}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2 style={{ color: '#4A148C' }}>🎯 Alışkanlık Yönetimi</h2>
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} style={addButtonStyle}>
          {showForm ? '❌ Vazgeç' : '➕ Yeni Alışkanlık'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <div style={{ display: 'grid', gap: '15px' }}>

            <div>
              <label style={labelStyle}>alışkanlık adı *</label>
              <input
                style={inputStyle}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>açıklama</label>
              <input
                style={inputStyle}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>kategori *</label>
                <select
                  style={inputStyle}
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">{loading ? "yükleniyor..." : "seçiniz"}</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>takip tipi</label>
                <select
                  style={inputStyle}
                  value={formData.trackingType}
                  onChange={(e) => setFormData({ ...formData, trackingType: parseInt(e.target.value) })}
                >
                  <option value={1}>Basit (Evet/Hayır)</option>
                  <option value={2}>Sayısal</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>sıklık</label>
                <select
                  style={inputStyle}
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: parseInt(e.target.value) })}
                >
                  <option value={1}>Günlük</option>
                  <option value={2}>Haftalık</option>
                </select>
                {formData.frequency === 2 && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#7B1FA2', background: '#F3E5F5', borderRadius: '8px', padding: '6px 10px' }}>
                    📅 Haftalık alışkanlık — haftada 7 kez (her gün) yapılması hedeflenir.
                  </p>
                )}
                {formData.frequency === 1 && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#1565C0', background: '#E3F2FD', borderRadius: '8px', padding: '6px 10px' }}>
                    ☀️ Günlük alışkanlık — her gün takip edilir.
                  </p>
                )}
              </div>
            </div>

            {/* sayısal takipte hedef ve birim alanları */}
            {formData.trackingType === 2 && (
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>hedef miktar</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="miktar"
                    style={inputStyle}
                    value={formData.targetValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, targetValue: val < 0 ? 0 : e.target.value });
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>birim</label>
                  <select
                    style={inputStyle}
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="">seçiniz</option>
                    {unitOptions.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" style={submitButtonStyle}>
              {editId ? '🌸 Alışkanlığı Güncelle' : '✨ Alışkanlığı Kaydet'}
            </button>
          </div>
        </form>
      )}

      {/* Sayaç kartları */}
      <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
        <div style={statCardStyle('#FFD1DC')}>
          <span style={{ fontSize: '1.8rem' }}>🎯</span>
          <h3 style={{ margin: 0, color: '#4A148C', fontSize: '1.6rem' }}>{activeHabits.length}</h3>
          <p style={{ margin: 0, color: '#555', fontSize: '0.85rem', fontWeight: 600 }}>Aktif Alışkanlık</p>
        </div>
        <div style={statCardStyle('#C8E6C9')}>
          <span style={{ fontSize: '1.8rem' }}>✅</span>
          <h3 style={{ margin: 0, color: '#2E7D32', fontSize: '1.6rem' }}>{completedHabits.length}</h3>
          <p style={{ margin: 0, color: '#555', fontSize: '0.85rem', fontWeight: 600 }}>Tamamlanan</p>
        </div>
      </div>

      {/* alışkanlık listeleri */}
      <div style={{ marginTop: '10px' }}>
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Yükleniyor...</p>
        ) : (activeHabits.length === 0 && completedHabits.length === 0) ? (
          <div style={emptyCardStyle}>
            <p style={{ color: '#888', fontSize: '1rem' }}>Henüz alışkanlık eklenmemiş. Yukarıdan yeni bir tane ekle! 🌱</p>
          </div>
        ) : (
          <>
            {/* Günlük alışkanlıklar */}
            {activeHabits.filter(h => h.frequency !== 2).length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.3rem' }}>☀️</span>
                  <h3 style={{ color: '#1565C0', margin: 0 }}>Günlük Alışkanlıklar</h3>
                  <span style={{ fontSize: '0.75rem', background: '#E3F2FD', color: '#1565C0', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                    Her gün
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {activeHabits.filter(h => h.frequency !== 2).map(habit => {
                    const target = Number(habit.targetValue || 0);
                    const current = Number(habit.currentValue || 0);
                    const pct = habit.progressPercentage != null
                      ? habit.progressPercentage
                      : (target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0);
                    const step = habit.trackingType === 2 ? getStepForUnit(habit.unit) : 1;
                    const unitLabel = getUnitLabel(habit.unit);
                    const dailyLocked = !!habit.completedThisPeriod;
                    return (
                      <div key={habit.id} style={{
                        ...habitCardStyle,
                        borderLeft: `4px solid ${dailyLocked ? '#A5D6A7' : '#CE93D8'}`,
                        background: dailyLocked ? '#F1F8E9' : 'white',
                        opacity: dailyLocked ? 0.88 : 1
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: '#4A148C', margin: '0 0 5px 0' }}>{habit.title}</h3>
                          <span style={badgeStyle}>{habit.categoryName}</span>
                          {dailyLocked ? (
                            <span style={{ ...badgeStyle, marginLeft: '8px', background: '#C8E6C9', color: '#2E7D32' }}>
                              ✅ Bugün tamamlandı · Yarın tekrar açılır
                            </span>
                          ) : target > 0 && (
                            <span style={{ ...badgeStyle, background: '#E8EAF6', color: '#283593', marginLeft: '8px' }}>
                              {current} / {target} {unitLabel}
                            </span>
                          )}
                          {!dailyLocked && target > 0 && (
                            <div style={progressBarContainer}>
                              <div style={{ ...progressBarFill, width: `${pct}%` }}></div>
                              <span style={progressText}>{pct}%</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {!dailyLocked && habit.trackingType === 2 && (
                            <>
                              <button onClick={() => handleAddProgress(habit)} style={progressBtnStyle} title={`+${step} ${unitLabel}`}>➕</button>
                              <button onClick={() => handleRemoveProgress(habit)} style={{ ...progressBtnStyle, background: '#FFE0E0' }} title="Geri al">➖</button>
                            </>
                          )}
                          {!dailyLocked && (
                            <button onClick={() => handleComplete(habit)} style={{ ...progressBtnStyle, background: '#C8E6C9' }}>✅ Tamamlandı</button>
                          )}
                          <button onClick={() => handleEdit(habit.id)} style={{ ...progressBtnStyle, background: '#E3F2FD' }}>✏️</button>
                          <button onClick={() => handleArchive(habit.id)} style={{ ...progressBtnStyle, background: '#FFF9C4', color: '#F57F17' }} title="Arşivle">📦</button>
                          <button onClick={() => handleDelete(habit.id)} style={{ ...progressBtnStyle, background: '#FFCDD2', color: '#C62828' }}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Haftalık alışkanlıklar */}
            {activeHabits.filter(h => h.frequency === 2).length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.3rem' }}>📅</span>
                  <h3 style={{ color: '#2E7D32', margin: 0 }}>Haftalık Alışkanlıklar</h3>
                  <span style={{ fontSize: '0.75rem', background: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                    Haftada bir
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {activeHabits.filter(h => h.frequency === 2).map(habit => {
                    const target = Number(habit.targetValue || 0);
                    const current = Number(habit.currentValue || 0);
                    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                    const step = habit.trackingType === 2 ? getStepForUnit(habit.unit) : 1;
                    const unitLabel = getUnitLabel(habit.unit);
                    // daysUntilAvailable = pencerede kalan gün (backend: windowEnd - today)
                    const daysLeft = habit.daysUntilAvailable ?? 0;
                    // Bugün zaten tamamlandıysa (hedef doldu veya basit tipte bugün işaretlendi)
                    const todayDone = !!habit.completedThisPeriod;
                    return (
                      <div key={habit.id} style={{
                        ...habitCardStyle,
                        borderLeft: '4px solid #66BB6A',
                        background: 'white'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: '#4A148C', margin: '0 0 5px 0' }}>{habit.title}</h3>
                          <span style={badgeStyle}>{habit.categoryName}</span>
                          <span style={{ ...badgeStyle, marginLeft: '8px', background: '#E8F5E9', color: '#2E7D32' }}>
                            🗓️ {daysLeft === 0 ? 'Son gün' : `${daysLeft} gün kaldı`}
                          </span>
                          {target > 0 && (
                            <span style={{ ...badgeStyle, background: '#E8EAF6', color: '#283593', marginLeft: '8px' }}>
                              {current} / {target} {unitLabel}
                            </span>
                          )}
                          {todayDone && (
                            <span style={{ ...badgeStyle, marginLeft: '8px', background: '#C8E6C9', color: '#2E7D32' }}>
                              ✅ Bugün işaretlendi
                            </span>
                          )}
                          {target > 0 && (
                            <div style={progressBarContainer}>
                              <div style={{ ...progressBarFill, width: `${pct}%`, background: 'linear-gradient(90deg, #81C784, #2E7D32)' }}></div>
                              <span style={progressText}>{pct}%</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {habit.trackingType === 2 && (
                            <>
                              <button onClick={() => handleAddProgress(habit)} style={progressBtnStyle} title={`+${step} ${unitLabel}`}>➕</button>
                              <button onClick={() => handleRemoveProgress(habit)} style={{ ...progressBtnStyle, background: '#FFE0E0' }} title="Geri al">➖</button>
                            </>
                          )}
                          {!todayDone && (
                            <button onClick={() => handleComplete(habit)} style={{ ...progressBtnStyle, background: '#C8E6C9' }}>✅ Bugünü Tamamla</button>
                          )}
                          <button onClick={() => handleEdit(habit.id)} style={{ ...progressBtnStyle, background: '#E3F2FD' }}>✏️</button>
                          <button onClick={() => handleArchive(habit.id)} style={{ ...progressBtnStyle, background: '#FFF9C4', color: '#F57F17' }} title="Arşivle">📦</button>
                          <button onClick={() => handleDelete(habit.id)} style={{ ...progressBtnStyle, background: '#FFCDD2', color: '#C62828' }}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tamamlanan alışkanlıklar */}
            {completedHabits.length > 0 && (
              <div>
                <h3 style={{ color: '#2E7D32', marginBottom: '12px' }}>Tamamlanan Alışkanlıklar</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {completedHabits.map(habit => (
                    <div key={habit.id} style={{ ...habitCardStyle, opacity: 0.85, background: '#F1F8E9' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ color: '#4A148C', margin: 0 }}>{habit.title}</h3>
                          <span style={completedBadge}>✅ Tamamlandı</span>
                        </div>
                        <span style={{ ...badgeStyle, marginTop: '6px', display: 'inline-block' }}>{habit.categoryName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleArchive(habit.id)} style={{ ...progressBtnStyle, background: '#FFF9C4', color: '#F57F17' }} title="Arşivle">📦</button>
                        <button onClick={() => handleDelete(habit.id)} style={{ ...progressBtnStyle, background: '#FFCDD2', color: '#C62828' }} title="Sil">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Arşiv bölümü */}
        <div style={{ marginTop: '30px', borderTop: '1px dashed #E1BEE7', paddingTop: '20px' }}>
          <button
            onClick={handleToggleArchive}
            style={{
              background: showArchive ? '#EDE7F6' : 'transparent',
              border: '1px dashed #CE93D8',
              color: '#6A1B9A',
              padding: '8px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            📦 {showArchive ? 'Arşivi Gizle' : 'Arşivi Görüntüle'}
          </button>

          {showArchive && (
            <div style={{ marginTop: '16px' }}>
              {archivedHabits.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>Arşivde henüz alışkanlık yok.</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {archivedHabits.map(habit => (
                    <div key={habit.id} style={{
                      ...habitCardStyle,
                      opacity: 0.8,
                      background: '#FAFAFA',
                      borderLeft: '4px solid #CE93D8'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#666', margin: '0 0 5px 0', textDecoration: 'line-through' }}>{habit.title}</h3>
                        <span style={badgeStyle}>{habit.categoryName}</span>
                        <span style={{ ...badgeStyle, marginLeft: '8px', background: '#EDE7F6', color: '#7B1FA2' }}>
                          {habit.frequency === 2 ? '📅 Haftalık' : '☀️ Günlük'}
                        </span>
                        <span style={{ ...badgeStyle, marginLeft: '8px', background: '#F5F5F5', color: '#999' }}>
                          📦 Arşivlendi
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUnarchive(habit.id)}
                          style={{ ...progressBtnStyle, background: '#E8F5E9', color: '#2E7D32' }}
                          title="Arşivden çıkar"
                        >
                          📤 Geri Al
                        </button>
                        <button
                          onClick={() => handleDelete(habit.id)}
                          style={{ ...progressBtnStyle, background: '#FFCDD2', color: '#C62828' }}
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// stiller
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.8rem', fontWeight: 'bold', color: '#6A1B9A' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E1BEE7', outline: 'none', boxSizing: 'border-box' };
const addButtonStyle = { padding: '12px 20px', background: 'linear-gradient(135deg, #FFDEE9 0%, #E1BEE7 100%)', color: '#4A148C', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const formContainerStyle = { background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #F8BBD0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const submitButtonStyle = { padding: '15px', background: '#4A148C', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const habitCardStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'white', borderRadius: '16px', border: '1px solid #F3E5F5', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' };
const badgeStyle = { display: 'inline-block', padding: '4px 12px', background: '#F3E5F5', color: '#6A1B9A', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' };
const progressBtnStyle = { padding: '8px 12px', background: '#E8F5E9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem' };
const emptyCardStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '1px dashed #E1BEE7' };
const progressBarContainer = { marginTop: '10px', background: '#F3E5F5', borderRadius: '10px', height: '20px', position: 'relative', overflow: 'hidden' };
const progressBarFill = { height: '100%', background: 'linear-gradient(90deg, #CE93D8, #7B1FA2)', borderRadius: '10px', transition: 'width 0.5s ease' };
const progressText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: 'bold', color: '#4A148C' };
const completedBadge = { display: 'inline-block', padding: '4px 12px', background: '#C8E6C9', color: '#2E7D32', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' };
const statCardStyle = (bg) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '18px', background: `linear-gradient(135deg, ${bg} 0%, #fff 100%)`, borderRadius: '20px', border: `1px solid ${bg}`, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' });

export default Habits;