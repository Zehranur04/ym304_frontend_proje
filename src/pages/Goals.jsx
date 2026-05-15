import React, { useState, useEffect, useCallback, useRef } from 'react';
import { goalService } from '../services/goalService';
import { habitService } from '../services/habitService';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { getStepForUnit } from '../utils/units';

const Goals = () => {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  // Aktif ve tamamlanan hedefler ayrı dizilerde tutulur — anlık geçiş için
  const [activeGoals, setActiveGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivedGoals, setArchivedGoals] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [editId, setEditId] = useState(null);

  // toast bildirimi için state
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // onay modalı için state
  const [confirm, setConfirm] = useState({ message: '', onConfirm: null });

  // Hızlı tıklamada çift istek gönderimini engelleyen guard (goal id → in-flight)
  const progressingRef = useRef(new Set());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    trackingType: 1,
    frequency: 1,
    targetValue: '',
    unit: '',
    targetDate: ''
  });

  // birim seçenekleri (backend UnitType enum)
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

  // hedef listesini yenile (sadece create/update sonrası tam yenileme)
  const refreshGoals = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        goalService.getActiveGoals(),
        goalService.getCompletedGoals()
      ]);
      setActiveGoals(activeRes?.data || activeRes || []);
      setCompletedGoals(completedRes?.data || completedRes || []);
    } catch (err) {
      console.log("liste yenilenirken hata:", err);
    }
  }, []);

  const loadArchivedGoals = useCallback(async () => {
    try {
      const res = await goalService.getArchivedGoals();
      setArchivedGoals(res?.data || res || []);
    } catch (err) {
      console.log("arşiv yüklenemedi");
    }
  }, []);

  const handleArchive = async (id) => {
    try {
      await goalService.archiveGoal(id);
      setActiveGoals(prev => prev.filter(g => g.id !== id));
      setCompletedGoals(prev => prev.filter(g => g.id !== id));
      showToast("Hedef arşivlendi 📦", "info");
    } catch {
      showToast("Arşivleme sırasında hata oluştu", "error");
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await goalService.unarchiveGoal(id);
      setArchivedGoals(prev => prev.filter(g => g.id !== id));
      await refreshGoals();
      showToast("Hedef arşivden çıkarıldı ✅", "success");
    } catch {
      showToast("Arşivden çıkarma sırasında hata oluştu", "error");
    }
  };

  const handleToggleArchive = async () => {
    if (!showArchive) await loadArchivedGoals();
    setShowArchive(prev => !prev);
  };

  // kategori ve hedef listesini yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catResponse, activeRes, completedRes] = await Promise.all([
          habitService.getCategories(),
          goalService.getActiveGoals(),
          goalService.getCompletedGoals()
        ]);
        setCategories(catResponse?.data || catResponse || []);
        setActiveGoals(activeRes?.data || activeRes || []);
        setCompletedGoals(completedRes?.data || completedRes || []);
      } catch (err) {
        console.log("api bağlantı hatası:", err);
      } finally {
        setLoading(false);
      }
      // Süresi geçen hedefleri otomatik işaretle (fire-and-forget)
      goalService.checkExpiredGoals().catch(() => {});
    };
    fetchData();
  }, []);

  // formu sıfırla
  const resetForm = () => {
    setFormData({ title: '', description: '', categoryId: '', trackingType: 1, frequency: 1, targetValue: '', unit: '', targetDate: '' });
    setEditId(null);
    setShowForm(false);
  };

  // düzenleme modunda hedef bilgilerini doldur
  const handleEdit = async (id) => {
    try {
      const response = await goalService.getGoalById(id);
      const data = response?.data || response;
      setFormData({
        title: data.title || '',
        description: data.description || '',
        categoryId: data.categoryId || '',
        trackingType: data.trackingType || 1,
        frequency: data.frequency || 1,
        targetValue: data.targetValue || '',
        unit: data.unit || '',
        targetDate: data.targetDate ? data.targetDate.split('T')[0] : ''
      });
      setEditId(id);
      setShowForm(true);
    } catch (err) {
      showToast("Hedef bilgileri getirilemedi", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // targetDate'i ISO formatına çevir (backend DateTime bekliyor)
      const isoDate = formData.targetDate
        ? new Date(formData.targetDate + 'T23:59:59').toISOString()
        : null;

      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        trackingType: parseInt(formData.trackingType),
        frequency: parseInt(formData.frequency),
        targetValue: formData.targetValue ? parseFloat(formData.targetValue) : null,
        unit: formData.unit ? parseInt(formData.unit) : null,
        targetDate: isoDate
      };

      if (editId) {
        const result = await goalService.updateGoal({ ...payload, id: editId });
        if (result?.success) {
          showToast("Hedef başarıyla güncellendi! 🌸", "success");
        } else {
          showToast(result?.message || "Güncelleme sırasında bir sorun oluştu", "error");
          return;
        }
      } else {
        const result = await goalService.createGoal(payload);
        if (result?.success) {
          showToast("Yeni hedef eklendi! 🚀", "success");
        } else {
          showToast(result?.message || "Ekleme sırasında bir sorun oluştu", "error");
          return;
        }
      }

      // önce formu kapat, sonra listeyi yenile
      resetForm();
      await refreshGoals();
    } catch (err) {
      showToast("İşlem sırasında hata oluştu", "error");
    }
  };

  // + butonu: pop-up YOK. Birime göre sabit step ile direkt API isteği, sadece kart state'ini güncelle.
  const handleAddProgress = async (goal) => {
    if (progressingRef.current.has(goal.id)) return;
    progressingRef.current.add(goal.id);
    try {
      const step = goal.trackingType === 2 ? getStepForUnit(goal.unit) : 1;
      const result = await goalService.addProgress({ goalId: goal.id, value: step });

      if (result && result.success === false) {
        showToast(result.message || "İlerleme eklenemedi", "error");
        return;
      }

      // Backend bu endpoint'te currentAmount/percentage döndürmüyor — lokal hesap
      const newValue = Number(goal.currentValue || 0) + step;
      const target = Number(goal.targetValue || 0);

      // Hedef miktarına ulaşıldıysa otomatik tamamla
      if (target > 0 && newValue >= target) {
        try {
          await goalService.completeGoal(goal.id);
          setActiveGoals(prev => prev.filter(g => g.id !== goal.id));
          setCompletedGoals(prev => [{ ...goal, isCompleted: true, currentValue: newValue }, ...prev]);
          showToast("Hedef doldu! Görev tamamlandı! 🎉", "success");
          window.dispatchEvent(new CustomEvent('profile-updated'));
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch {
          showToast("Otomatik tamamlama sırasında hata oluştu", "error");
        }
      } else {
        setActiveGoals(prev => prev.map(g =>
          g.id === goal.id ? { ...g, currentValue: newValue } : g
        ));
        showToast(`+${step} ${getUnitLabel(goal.unit)} eklendi! 💪`, "success");
      }
    } catch (err) {
      showToast("İlerleme eklenirken hata oluştu", "error");
    } finally {
      progressingRef.current.delete(goal.id);
    }
  };

  // - butonu: lokal state'te step kadar düş
  const handleRemoveProgress = async (goal) => {
    try {
      const result = await goalService.removeProgress(goal.id);
      if (result && result.success === false) {
        showToast(result.message || "Geri alınamadı", "error");
        return;
      }

      const step = goal.trackingType === 2 ? getStepForUnit(goal.unit) : 1;
      const newValue = Math.max(0, Number(goal.currentValue || 0) - step);

      setActiveGoals(prev => prev.map(g =>
        g.id === goal.id ? { ...g, currentValue: newValue } : g
      ));

      showToast("İlerleme geri alındı", "info");
    } catch (err) {
      showToast("Geri alma sırasında hata oluştu", "error");
    }
  };

  // Hedefi tamamla — onay sonrası CompleteGoal endpoint'ine PATCH at,
  // 200 OK ise hedefi activeGoals'tan çıkarıp completedGoals'a anında ekle (refresh yok).
  const handleComplete = (goal) => {
    setConfirm({
      message: "Bu hedefi tamamlandı olarak işaretlemek istiyor musun?",
      onConfirm: async () => {
        setConfirm({ message: '', onConfirm: null });
        try {
          const result = await goalService.completeGoal(goal.id);
          if (result && result.success === false) {
            showToast(result.message || "Tamamlama başarısız", "error");
            return;
          }

          // Anlık geçiş: aktiften çıkar, tamamlanana ekle
          setActiveGoals(prev => prev.filter(g => g.id !== goal.id));
          setCompletedGoals(prev => [{ ...goal, isCompleted: true }, ...prev]);

          showToast("Hedef tamamlandı! Tebrikler! 🎉", "success");
          window.dispatchEvent(new CustomEvent('profile-updated'));
          window.dispatchEvent(new CustomEvent('notifications-updated'));
        } catch (err) {
          showToast("Tamamlama sırasında hata oluştu", "error");
        }
      }
    });
  };

  // hedef sil (modal ile onay) — lokal state'ten direkt çıkar
  const handleDelete = (id) => {
    setConfirm({
      message: "Bu hedefi silmek istediğine emin misin?",
      onConfirm: async () => {
        setConfirm({ message: '', onConfirm: null });
        try {
          const result = await goalService.deleteGoal(id);
          if (result && result.success === false) {
            showToast(result.message || "Silme başarısız", "error");
            return;
          }
          setActiveGoals(prev => prev.filter(g => g.id !== id));
          setCompletedGoals(prev => prev.filter(g => g.id !== id));
          showToast("Hedef silindi", "info");
        } catch (err) {
          showToast("Silme sırasında hata oluştu", "error");
        }
      }
    });
  };

  // birim okunabilir etiket
  const getUnitLabel = (unit) => {
    if (unit == null) return '';
    return unitOptions.find(u => u.value === parseInt(unit))?.label || '';
  };

  // ilerleme yüzdesini hesapla
  const getProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
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

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h2 style={{ color: '#4A148C' }}>🚀 Hedef Yönetimi</h2>
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} style={addButtonStyle}>
          {showForm ? '❌ Vazgeç' : '➕ Yeni Hedef'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <div style={{ display: 'grid', gap: '15px' }}>

            <div>
              <label style={labelStyle}>hedef adı *</label>
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
                <label style={labelStyle}>bitiş tarihi *</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                />
              </div>
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
              </div>
            </div>

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
              {editId ? '🌸 Hedefi Güncelle' : '🚀 Hedefi Kaydet'}
            </button>
          </div>
        </form>
      )}

      {/* Anlık güncellenen sayaç kartları (Aktif / Tamamlanan) */}
      <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
        <div style={statCardStyle('#FFD1DC')}>
          <span style={{ fontSize: '1.8rem' }}>🚀</span>
          <h3 style={{ margin: 0, color: '#4A148C', fontSize: '1.6rem' }}>{activeGoals.length}</h3>
          <p style={{ margin: 0, color: '#555', fontSize: '0.85rem', fontWeight: 600 }}>Aktif Hedef</p>
        </div>
        <div style={statCardStyle('#C8E6C9')}>
          <span style={{ fontSize: '1.8rem' }}>✅</span>
          <h3 style={{ margin: 0, color: '#2E7D32', fontSize: '1.6rem' }}>{completedGoals.length}</h3>
          <p style={{ margin: 0, color: '#555', fontSize: '0.85rem', fontWeight: 600 }}>Tamamlanan Hedef</p>
        </div>
      </div>

      {/* hedef listeleri */}
      <div style={{ marginTop: '25px' }}>
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Yükleniyor...</p>
        ) : (activeGoals.length === 0 && completedGoals.length === 0) ? (
          <div style={emptyCardStyle}>
            <p style={{ color: '#888', fontSize: '1rem' }}>Henüz hedef eklenmemiş. Yukarıdan yeni bir tane ekle! 🎯</p>
          </div>
        ) : (
          <>
            {/* Aktif hedefler */}
            {activeGoals.length > 0 && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#4A148C', marginBottom: '12px' }}>Aktif Hedefler</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {activeGoals.map(goal => {
                    const progress = getProgress(goal.currentValue, goal.targetValue);
                    const step = goal.trackingType === 2 ? getStepForUnit(goal.unit) : 1;
                    const unitLabel = getUnitLabel(goal.unit);
                    return (
                      <div key={goal.id} style={goalCardStyle}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ color: '#4A148C', margin: '0 0 8px 0' }}>{goal.title}</h3>
                          <span style={badgeStyle}>{goal.categoryName}</span>
                          <span style={{
                            ...badgeStyle,
                            marginLeft: '6px',
                            background: goal.frequency === 2 ? '#E8F5E9' : '#E3F2FD',
                            color: goal.frequency === 2 ? '#2E7D32' : '#1565C0'
                          }}>
                            {goal.frequency === 2 ? '📅 Haftalık' : '☀️ Günlük'}
                          </span>
                          {goal.targetValue && (
                            <span style={{ ...badgeStyle, background: '#E8EAF6', color: '#283593', marginLeft: '8px' }}>
                              {goal.currentValue || 0} / {goal.targetValue} {unitLabel}
                            </span>
                          )}
                          {goal.targetValue && (
                            <div style={progressBarContainer}>
                              <div style={{ ...progressBarFill, width: `${progress}%` }}></div>
                              <span style={progressText}>{progress}%</span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {goal.trackingType === 2 && (
                            <>
                              <button
                                onClick={() => handleAddProgress(goal)}
                                style={progressBtnStyle}
                                title={`+${step} ${unitLabel}`}
                              >➕</button>
                              <button onClick={() => handleRemoveProgress(goal)} style={{ ...progressBtnStyle, background: '#FFE0E0' }} title="Geri al">➖</button>
                            </>
                          )}
                          <button onClick={() => handleComplete(goal)} style={{ ...progressBtnStyle, background: '#C8E6C9' }} title="Tamamla">✅ Tamamlandı</button>
                          <button onClick={() => handleEdit(goal.id)} style={{ ...progressBtnStyle, background: '#E3F2FD' }} title="Düzenle">✏️</button>
                          <button onClick={() => handleArchive(goal.id)} style={{ ...progressBtnStyle, background: '#FFF9C4', color: '#F57F17' }} title="Arşivle">📦</button>
                          <button onClick={() => handleDelete(goal.id)} style={{ ...progressBtnStyle, background: '#FFCDD2', color: '#C62828' }} title="Sil">🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tamamlanan hedefler */}
            {completedGoals.length > 0 && (
              <div>
                <h3 style={{ color: '#2E7D32', marginBottom: '12px' }}>Tamamlanan Hedefler</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {completedGoals.map(goal => (
                    <div key={goal.id} style={{ ...goalCardStyle, opacity: 0.85, background: '#F1F8E9' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <h3 style={{ color: '#4A148C', margin: 0 }}>{goal.title}</h3>
                          <span style={completedBadge}>✅ Tamamlandı</span>
                        </div>
                        <span style={badgeStyle}>{goal.categoryName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleArchive(goal.id)} style={{ ...progressBtnStyle, background: '#FFF9C4', color: '#F57F17' }} title="Arşivle">📦</button>
                        <button onClick={() => handleDelete(goal.id)} style={{ ...progressBtnStyle, background: '#FFCDD2', color: '#C62828' }} title="Sil">🗑️</button>
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
              {archivedGoals.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic', fontSize: '0.9rem' }}>Arşivde henüz hedef yok.</p>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {archivedGoals.map(goal => (
                    <div key={goal.id} style={{
                      ...goalCardStyle,
                      opacity: 0.8,
                      background: '#FAFAFA',
                      borderLeft: '4px solid #CE93D8'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#666', margin: '0 0 5px 0', textDecoration: 'line-through' }}>{goal.title}</h3>
                        <span style={badgeStyle}>{goal.categoryName}</span>
                        <span style={{ ...badgeStyle, marginLeft: '8px', background: '#EDE7F6', color: '#7B1FA2' }}>
                          {goal.frequency === 2 ? '📅 Haftalık' : '☀️ Günlük'}
                        </span>
                        <span style={{ ...badgeStyle, marginLeft: '8px', background: '#F5F5F5', color: '#999' }}>
                          📦 Arşivlendi
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleUnarchive(goal.id)}
                          style={{ ...progressBtnStyle, background: '#E8F5E9', color: '#2E7D32' }}
                          title="Arşivden çıkar"
                        >
                          📤 Geri Al
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
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
const goalCardStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'white', borderRadius: '16px', border: '1px solid #F3E5F5', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' };
const badgeStyle = { display: 'inline-block', padding: '4px 12px', background: '#F3E5F5', color: '#6A1B9A', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' };
const completedBadge = { display: 'inline-block', padding: '4px 12px', background: '#C8E6C9', color: '#2E7D32', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' };
const progressBtnStyle = { padding: '8px 12px', background: '#E8F5E9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem' };
const emptyCardStyle = { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', border: '1px dashed #E1BEE7' };
const progressBarContainer = { marginTop: '10px', background: '#F3E5F5', borderRadius: '10px', height: '20px', position: 'relative', overflow: 'hidden' };
const progressBarFill = { height: '100%', background: 'linear-gradient(90deg, #CE93D8, #7B1FA2)', borderRadius: '10px', transition: 'width 0.5s ease' };
const progressText = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: 'bold', color: '#4A148C' };
const statCardStyle = (bg) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '18px', background: `linear-gradient(135deg, ${bg} 0%, #fff 100%)`, borderRadius: '20px', border: `1px solid ${bg}`, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' });

export default Goals;