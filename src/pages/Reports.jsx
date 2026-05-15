import { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { Progress, Spin } from 'antd';
import Toast from '../components/Toast';

const Reports = () => {
  const [habitStats, setHabitStats] = useState(null);
  const [goalStats, setGoalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => setToast({ message, type });

  // UC-15: Sayfa açıldığında istatistikleri çek
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [habitRes, goalRes] = await Promise.all([
          reportService.getHabitStatistics(),
          reportService.getGoalStatistics()
        ]);

        if (habitRes?.success) {
          setHabitStats(habitRes.data);
        } else {
          showToast(habitRes?.message || "Alışkanlık istatistikleri alınamadı.", "warning");
        }

        if (goalRes?.success) {
          setGoalStats(goalRes.data);
        } else {
          showToast(goalRes?.message || "Hedef istatistikleri alınamadı.", "warning");
        }
      } catch {
        showToast("Analiz verileri yüklenirken bir hata oluştu.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#E6E6FA] p-8 flex flex-col items-center">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <div className="w-full max-w-4xl">
        <div className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white/50 shadow-xl mb-8">
          <h1 className="text-4xl font-extrabold text-[#3b237c] mb-2">📊 Performans Analizi</h1>
          <p className="text-[#555577] text-lg">Alışkanlık ve hedef istatistiklerini buradan takip edebilirsin.</p>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20"><Spin size="large" /></div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Alışkanlık İstatistikleri */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[30px] border border-white/50 shadow-xl">
              <h2 className="text-2xl font-extrabold text-[#3b237c] mb-6 flex items-center gap-2">
                <span>🎯</span> Alışkanlık İstatistikleri
              </h2>

              {habitStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    emoji="✅"
                    label="Tamamlanan"
                    value={habitStats.completedHabitsCount ?? 0}
                    bg="#C8E6C9"
                    color="#2E7D32"
                  />
                  <StatCard
                    emoji="🏃"
                    label="Aktif"
                    value={habitStats.activeHabitsCount ?? 0}
                    bg="#E1BEE7"
                    color="#6A1B9A"
                  />
                  <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-md border border-white">
                    <span className="text-3xl mb-2">📈</span>
                    <p className="text-sm text-[#555577] font-semibold mb-3">Başarı Oranı</p>
                    <Progress
                      type="circle"
                      percent={Math.round(habitStats.successRate ?? 0)}
                      strokeColor="#9C27B0"
                      size={90}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Alışkanlık istatistiği bulunamadı.</p>
              )}
            </div>

            {/* Hedef İstatistikleri */}
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[30px] border border-white/50 shadow-xl">
              <h2 className="text-2xl font-extrabold text-[#3b237c] mb-6 flex items-center gap-2">
                <span>🚀</span> Hedef İstatistikleri
              </h2>

              {goalStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    emoji="✅"
                    label="Tamamlanan"
                    value={goalStats.completedGoalsCount ?? 0}
                    bg="#C8E6C9"
                    color="#2E7D32"
                  />
                  <StatCard
                    emoji="⏳"
                    label="Aktif"
                    value={goalStats.activeGoalsCount ?? 0}
                    bg="#FFF9C4"
                    color="#F57F17"
                  />
                  <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-md border border-white">
                    <span className="text-3xl mb-2">📈</span>
                    <p className="text-sm text-[#555577] font-semibold mb-3">Başarı Oranı</p>
                    <Progress
                      type="circle"
                      percent={Math.round(goalStats.successRate ?? 0)}
                      strokeColor="#4CAF50"
                      size={90}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Hedef istatistiği bulunamadı.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ emoji, label, value, bg, color }) => (
  <div className="flex flex-col items-center justify-center bg-white p-6 rounded-3xl shadow-md border border-white hover:-translate-y-1 transition-transform duration-300"
    style={{ background: `linear-gradient(135deg, ${bg} 0%, #fff 100%)` }}>
    <span className="text-4xl mb-2">{emoji}</span>
    <span className="text-4xl font-extrabold mb-1" style={{ color }}>{value}</span>
    <p className="text-sm text-[#555577] font-semibold">{label}</p>
  </div>
);

export default Reports;
