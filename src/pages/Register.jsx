import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Name: "",
        Surname: "",
        Email: "",
        Age: "",
        Gender: "",
        Password: "", // İsmi Password olarak güncelledik
        confirmPassword: "",
        agreed: false
    });

    const [status, setStatus] = useState({ message: "", type: "" });
    const [emailError, setEmailError] = useState("");

    const validateEmail = (value) => {
        if (!value) { setEmailError(""); return; }
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        setEmailError(valid ? "" : "Geçerli bir e-posta adresi girin (örnek@mail.com)");
    };

    const handleAgeChange = (e) => {
        const value = e.target.value;
        if (value === "" || parseInt(value) >= 0) {
            setFormData({ ...formData, Age: value });
        }
    };

    const isFormValid = () => {
        const { Name, Surname, Email, Age, Gender, Password, confirmPassword, agreed } = formData;
        return (
            Name.trim() !== "" &&
            Surname.trim() !== "" &&
            Email.trim() !== "" &&
            emailError === "" &&
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(Email) &&
            Age >= 16 &&
            Gender !== "" &&
            Password !== "" &&
            Password === confirmPassword &&
            agreed
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            setStatus({ message: "Lütfen formu eksiksiz doldurun!", type: "error" });
            return;
        }

        setStatus({ message: "Kayıt yapılıyor... ⏳", type: "info" });

        const genderMap = {
            "Female": 1,
            "Male": 2,
            "Other": 3,
            "PreferNotToSay": 4
        };

        try {
            // authService üzerinden register api'sine istek atıyoruz
            const { ok, data } = await authService.register({
                Name: formData.Name,
                Surname: formData.Surname,
                Email: formData.Email,
                Age: parseInt(formData.Age),
                Gender: genderMap[formData.Gender] || 1,
                Password: formData.Password
            });

            if (ok) {
                setStatus({ message: "Kayıt başarıyla tamamlandı! Giriş ekranına gidiyorsunuz... ✨", type: "success" });
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                // Backend'den gelen FluentValidation mesajlarını burada yakalıyoruz
                const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat()[0] : "Kayıt başarısız.");
                setStatus({ message: "Hata: " + errorMsg, type: "error" });
            }
        } catch (error) {
            console.error("Bağlantı Hatası:", error);
            setStatus({ message: "Backend'e bağlanılamadı. 🔌", type: "error" });
        }
    };

    const stars = [
        { t: '15%', l: '12%' }, { t: '25%', l: '85%' },
        { t: '60%', l: '10%' }, { t: '85%', l: '30%' },
        { t: '42%', l: '92%' }, { t: '75%', l: '95%' }
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-8 bg-[#E6E6FA] lg:gap-32 max-md:flex-col py-10 relative overflow-hidden">
            {stars.map((s, i) => (
                <div key={i} className="absolute text-[#5b3db8] opacity-30 text-[24px] select-none pointer-events-none animate-pulse"
                    style={{ top: s.t, left: s.l }}>✦</div>
            ))}

            <div className="flex-1 flex justify-end max-md:justify-center text-left">
                <h1 className="font-extrabold leading-[1.1] text-[#3b237c] select-none italic"
                    style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)", fontFamily: 'system-ui' }}>
                    Başlamanızı<br />sağlayan<br /><span className="text-[#5b3db8]">motivasyondur,</span><br />alışkanlık<br /><span className="pl-10">sizi</span><br />devam<br /><span className="pl-10">ettirir.</span>
                </h1>
            </div>

            <div className="flex-1 flex justify-start max-md:justify-center">
                <div className="w-[480px] h-[860px] relative overflow-hidden"
                    style={{
                        borderRadius: "40px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(210, 210, 245, 0.7) 100%)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        boxShadow: "0 25px 50px -12px rgba(91, 61, 184, 0.2)"
                    }}>

                    <form onSubmit={handleSubmit} className="relative h-full w-full">
                        <div className="absolute w-[85%]" style={{ top: '8%', left: '10%' }}>
                            <h2 className="text-[42px] font-bold text-[#3b237c] leading-tight">Kayıt Ol! 🚀</h2>
                            <p className="text-[#8a8aa3] text-[15px] mt-1 font-medium italic">Yeni bir serüvene başla.</p>
                        </div>

                        <div className="absolute w-[80%]" style={{ top: '20%', left: '10%' }}>
                            {status.message && (
                                <div className={`p-3 rounded-2xl text-[13px] font-bold text-center animate-pulse ${status.type === "success"
                                    ? "bg-[#FFF0F5] text-[#DB7093]"
                                    : "bg-[#FFE4E1] text-[#CD5C5C]"
                                    }`}>
                                    {status.message}
                                </div>
                            )}
                        </div>

                        <div className="absolute w-[80%]" style={{ top: '28%', left: '10%' }}>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">Ad</label>
                                        <input type="text" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                                            className="w-full p-2.5 bg-white/70 rounded-2xl outline-none focus:bg-white border border-white/20" placeholder="Adınız" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">Soyad</label>
                                        <input type="text" value={formData.Surname} onChange={(e) => setFormData({ ...formData, Surname: e.target.value })}
                                            className="w-full p-2.5 bg-white/70 rounded-2xl outline-none focus:bg-white border border-white/20" placeholder="Soyadınız" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">E-posta Adresi</label>
                                    <input
                                        type="text"
                                        value={formData.Email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, Email: e.target.value });
                                            validateEmail(e.target.value);
                                        }}
                                        className="w-full p-2.5 bg-white/70 rounded-2xl outline-none focus:bg-white border"
                                        style={{ borderColor: emailError ? '#e57373' : 'rgba(255,255,255,0.2)' }}
                                        placeholder="örnek@mail.com"
                                    />
                                    {emailError && (
                                        <p className="text-[11px] font-semibold ml-1 mt-0.5" style={{ color: '#c62828' }}>
                                            ⚠️ {emailError}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-[0.4] flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">Yaş (16+)</label>
                                        <input type="number" min="16" value={formData.Age} onChange={handleAgeChange}
                                            className="w-full p-2.5 bg-white/70 rounded-2xl outline-none border border-white/20 focus:bg-white" placeholder="20" />
                                    </div>
                                    <div className="flex-[0.6] flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">Cinsiyet</label>
                                        <select value={formData.Gender} onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                                            className="w-full p-2.5 bg-white/70 rounded-2xl outline-none focus:bg-white border border-white/20 text-[#555577] appearance-none"
                                            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%233b237c\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem center', backgroundSize: '0.9rem' }}>
                                            <option value="">Seçiniz</option>
                                            <option value="Female">Kadın</option>
                                            <option value="Male">Erkek</option>
                                            <option value="Other">Diğer</option>
                                            <option value="PreferNotToSay">Belirtmek İstemiyorum</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">Şifre</label>
                                        <input type="password" value={formData.Password} onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                                            className="w-full p-2.5 bg-white/70 rounded-2xl outline-none focus:bg-white border border-white/20" placeholder="••••" />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-[12px] font-bold text-[#1a1a2e] ml-1">Tekrar</label>
                                        <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full p-2.5 bg-white/70 rounded-2xl outline-none border border-white/20 focus:bg-white" placeholder="••••" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute w-[80%]" style={{ top: '72%', left: '10%' }}>
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" checked={formData.agreed} onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })} className="mt-1 w-4 h-4 accent-[#3b237c]" />
                                <span className="text-[11.5px] text-[#555577] font-medium leading-relaxed">
                                    Gizlilik sözleşmesini ve kullanım koşullarını okudum, <span className="text-[#3b237c] font-bold underline">kabul ediyorum.</span>
                                </span>
                            </label>
                        </div>

                        <div className="absolute w-[80%]" style={{ bottom: '12%', left: '10%' }}>
                            <button type="submit" disabled={!isFormValid()}
                                className={`w-full py-4 bg-[#e8e8f2] text-[#1a1a2e] font-extrabold rounded-2xl transition-all shadow-md active:scale-95 text-[15px]
                                ${isFormValid() ? 'hover:bg-[#3b237c] hover:text-white cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                                Kayıt Ol →
                            </button>
                        </div>

                        <div className="absolute w-[80%] flex justify-center" style={{ bottom: '6%', left: '10%' }}>
                            <p className="text-center text-[13px] text-[#8a8aa3]">
                                Zaten bir hesabın var mı? <Link to="/login" className="font-bold text-[#1a1a2e] hover:text-[#5b3db8] underline underline-offset-4 ml-1">giriş yap.</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;