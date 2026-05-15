import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Drawer, Spin } from 'antd';
import { calendarService } from '../services/calendarService';
import Toast from '../components/Toast';
import dayjs from 'dayjs';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [monthSummary, setMonthSummary] = useState([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchMonthSummary = async (year, month) => {
    setLoadingMonth(true);
    try {
      const response = await calendarService.getMonthSummary(year, month);
      if (response?.success) {
        setMonthSummary(response.data || []);
      } else if (response && !response.success) {
        showToast(response.message || "Aylık takvim verisi alınamadı.", "warning");
      }
    } catch {
      showToast("Takvim verisi yüklenirken hata oluştu.", "error");
    } finally {
      setLoadingMonth(false);
    }
  };

  // UC-14: Seçilen günün aktivitelerini GetActivitiesByDateQuery ile çek
  const fetchDayDetails = async (date) => {
    setLoadingDay(true);
    setDayDetails(null);
    try {
      const dateString = date.format('YYYY-MM-DD');
      const response = await calendarService.getDayDetails(dateString);
      if (response?.success) {
        setDayDetails(response.data || { activities: [] });
      } else {
        showToast(response?.message || "Günlük aktivite verisi alınamadı.", "warning");
        setDayDetails({ activities: [] });
      }
    } catch {
      showToast("Günlük aktivite verisi yüklenirken hata oluştu.", "error");
      setDayDetails({ activities: [] });
    } finally {
      setLoadingDay(false);
    }
  };

  // Ay değiştiğinde veya sayfa yüklendiğinde özet veriyi çek
  useEffect(() => {
    fetchMonthSummary(currentDate.year(), currentDate.month() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // UC-14: Aylık özet verisine göre aktivitesi olan günlere badge koy
  const dateCellRender = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    const hasActivity = monthSummary.some(m => m.date?.split('T')[0] === dateString);
    return (
      <div className="flex justify-center mt-1">
        {hasActivity && <Badge status="success" />}
      </div>
    );
  };

  const onSelect = (value, info) => {
    if (info.source === 'date') {
      setSelectedDate(value);
      setDrawerVisible(true);
      fetchDayDetails(value);
    }
  };

  const onPanelChange = (value) => {
    setCurrentDate(value);
  };

  const habits = dayDetails?.activities?.filter(a => a.type === 'Habit') || [];
  const goalActivities = dayDetails?.activities?.filter(a => a.type === 'Goal') || [];

  return (
    <div className="min-h-screen bg-[#E6E6FA] p-8 flex flex-col items-center">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />
      <div className="w-full max-w-5xl bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-white/50 shadow-xl">
        <h2 className="text-3xl font-extrabold text-[#3b237c] mb-6 text-center">📅 Alışkanlık Takvimi</h2>
        
        <div className="bg-white p-6 rounded-[25px] shadow-sm">
          <Spin spinning={loadingMonth}>
            <Calendar 
              value={currentDate} 
              onSelect={onSelect} 
              onPanelChange={onPanelChange}
              cellRender={dateCellRender}
            />
          </Spin>
        </div>
      </div>

      {/* Günlük Detay Çekmecesi (Drawer) */}
      <Drawer
        title={<span className="text-[#3b237c] font-bold">{selectedDate?.format('DD MMMM YYYY')} Detayları</span>}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        style={{ background: '#F3E5F5' }}
      >
        {loadingDay ? (
          <div className="flex justify-center mt-10"><Spin size="large" /></div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h4 className="text-lg font-bold text-[#6A1B9A] mb-3 border-b pb-2">✨ Alışkanlıklar</h4>
              {habits.length > 0 ? (
                <ul className="list-disc pl-5">
                  {habits.map((h, i) => (
                    <li key={i} className="text-[#555] mb-1">
                      {h.title} - <span className="font-semibold text-green-600">{h.status || "Yapıldı"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Bu gün için kaydedilmiş alışkanlık yok.</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm">
              <h4 className="text-lg font-bold text-[#3b237c] mb-3 border-b pb-2">🚀 Hedef Aktiviteleri</h4>
              {goalActivities.length > 0 ? (
                <ul className="list-disc pl-5">
                  {goalActivities.map((g, i) => (
                    <li key={i} className="text-[#555] mb-1">
                      {g.title} - <span className="font-semibold text-purple-600">{g.status || "İlerlendi"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Bu gün için kaydedilmiş hedef aktivitesi yok.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CalendarPage;
