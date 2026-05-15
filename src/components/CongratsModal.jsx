import React from 'react';
import { Modal } from 'antd';

const CongratsModal = ({ visible, onClose, title, message }) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      bodyStyle={{ padding: 0 }}
      closeIcon={null}
      width={400}
    >
      <div className="flex flex-col items-center bg-gradient-to-b from-[#FFF0F5] to-white rounded-[30px] p-8 text-center relative overflow-hidden">
        {/* Dekoratif Arka Plan Çemberleri */}
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-[#FFDEE9] rounded-full opacity-50"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-[#E1BEE7] rounded-full opacity-50"></div>
        
        {/* Animasyonlu Kupa İkonu (Basit bir bounce animasyonu ile) */}
        <div className="w-24 h-24 mb-4 animate-bounce drop-shadow-xl z-10 text-7xl flex items-center justify-center">
          🏆
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#9C27B0] mb-2 z-10">{title || "Tebrikler!"}</h2>
        <p className="text-[#555] font-medium mb-6 z-10">
          {message || "Harika bir iş çıkardın, aynen böyle devam et!"}
        </p>

        <button 
          onClick={onClose}
          className="z-10 px-8 py-3 bg-gradient-to-r from-[#9C27B0] to-[#E91E63] text-white rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          Teşekkürler! 🎉
        </button>

        {/* Konfeti için CSS animasyon kuralları */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
            50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
          }
          .animate-bounce {
            animation: bounce 2s infinite;
          }
        `}</style>
      </div>
    </Modal>
  );
};

export default CongratsModal;
