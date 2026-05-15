import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [status, setStatus] = useState({ message: "", type: "" });

    // ASIL İŞİ YAPAN FONKSİYON BURASI
    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus({ message: "Giriş yapılıyor... ⏳", type: "info" });

        try {
            // authService üzerinden login api'sine istek atıyoruz
            const { ok, data } = await authService.login(email, password);

            if (ok) {
                setStatus({ message: "Giriş başarılı! ✨", type: "success" });
                localStorage.setItem("token", data.token); // Anahtarı sakla
                setTimeout(() => navigate("/dashboard"), 1200);
            } else {
                // Backend "Invalid credentials" dediğinde burası çalışır
                setStatus({ message: "E-posta veya şifre hatalı! ❌", type: "error" });
            }
        } catch (error) {
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

            {/* UYARI MESAJI */}
            {status.message && (
                <div className={`absolute top-10 z-50 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white font-bold animate-bounce ${status.type === 'error' ? 'text-red-500' : 'text-[#3b237c]'}`}>
                    {status.message}
                </div>
            )}

            {stars.map((s, i) => (
                <div key={i} className="absolute text-[#5b3db8] opacity-30 text-[24px] select-none pointer-events-none animate-pulse"
                    style={{ top: s.t, left: s.l }}>✦</div>
            ))}

            <div className="flex-1 flex justify-end max-md:justify-center">
                <h1 className="font-extrabold leading-[1.1] text-[#3b237c] select-none italic"
                    style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", fontFamily: 'system-ui' }}>
                    Önce<br />alışkanlıklarını<br />yaparsın,<br />
                    <span className="pl-10">sonra</span><br />
                    alışkanlıkların<br />
                    <span className="pl-10">seni</span><br />
                    <span className="pl-10">yapar.</span>
                </h1>
            </div>

            <div className="flex-1 flex justify-start max-md:justify-center">
                <div className="w-[460px] h-[720px] relative overflow-hidden"
                    style={{
                        borderRadius: "40px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(210, 210, 245, 0.7) 100%)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        boxShadow: "0 25px 50px -12px rgba(91, 61, 184, 0.2)"
                    }}>

                    <div className="relative h-full w-full">
                        <div className="absolute w-[85%]" style={{ top: '15%', left: '10%' }}>
                            <h2 className="text-[50px] font-bold text-[#3b237c] leading-tight whitespace-nowrap">
                                Hoş Geldin! ✨
                            </h2>
                            <p className="text-[#8a8aa3] text-[16px] mt-2 font-medium italic">Hemen yeni alışkanlıklar edin.</p>
                        </div>

                        {/* INPUTLAR */}
                        <div className="absolute w-[75%]" style={{ top: '35%', left: '12.5%' }}>
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-[#1a1a2e] ml-1">E-posta Adresi</label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-4 bg-white/70 rounded-2xl outline-none focus:bg-white border border-white/20"
                                        placeholder="örnek@mail.com" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] font-bold text-[#1a1a2e] ml-1">Şifre</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-4 bg-white/70 rounded-2xl outline-none focus:bg-white border border-white/20"
                                        placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="absolute w-[75%]" style={{ top: '65%', left: '13.5%' }}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-5 h-5 accent-[#3b237c]" />
                                <span className="text-[14px] text-[#555577] font-medium">Beni hatırla</span>
                            </label>
                        </div>

                        {/* BUTONA handleLogin BAĞLANDI */}
                        <div className="absolute w-[75%]" style={{ bottom: '20%', left: '12.5%' }}>
                            <button
                                onClick={handleLogin}
                                className="w-full py-[18px] bg-[#e8e8f2] text-[#1a1a2e] font-extrabold rounded-2xl hover:bg-[#3b237c] hover:text-white transition-all shadow-md active:scale-95 text-[15px]">
                                Giriş Yap →
                            </button>
                        </div>

                        <div className="absolute w-[75%] flex justify-center" style={{ bottom: '10%', left: '12.5%' }}>
                            <p className="text-center text-[13px] text-[#8a8aa3] flex items-center gap-1">
                                Henüz bir hesabın yok mu?
                                <Link to="/register" className="font-bold text-[#1a1a2e] hover:text-[#5b3db8] ml-1 underline underline-offset-4">
                                    hemen başla.
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;