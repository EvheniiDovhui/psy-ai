// src/pages/Auth.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, FaLock, FaUser, FaUserMd, FaArrowRight, FaBrain, 
  FaPhone, FaCalendarAlt, FaEye, FaEyeSlash, FaExclamationCircle
} from 'react-icons/fa';
import { API_BASE_URL } from '../../lib/config/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  
  // ОСЬ ВОНА, НАША ЗМІННА ЗАВАНТАЖЕННЯ:
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: 'patient',
    fullName: '',
    age: '',
    email: '',
    confirmEmail: '',
    phone: '',
    confirmPhone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isEmailMatch = formData.email === formData.confirmEmail || formData.confirmEmail === '';
  const isPhoneMatch = formData.phone === formData.confirmPhone || formData.confirmPhone === '';
  const isPassMatch = formData.password === formData.confirmPassword || formData.confirmPassword === '';
  
  const isValidToSubmit = isLogin || (
    formData.email === formData.confirmEmail && 
    formData.phone === formData.confirmPhone && 
    formData.password === formData.confirmPassword && 
    formData.password.length >= 6
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !isValidToSubmit) {
      alert("Будь ласка, перевірте правильність введених даних.");
      return;
    }
    
    setLoading(true); // Тепер React знає, що це!
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password }
      : { 
          full_name: formData.fullName, 
          age: parseInt(formData.age), 
          phone: formData.phone,
          email: formData.email, 
          password: formData.password, 
          role: formData.role 
        };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Помилка авторизації');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', data.id);
      
      if (data.role === 'psychologist') {
        navigate('/dashboard'); 
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false); // І це теж відпрацює ідеально
    }
  };

  return (
    <div className="min-h-[86vh] flex items-center justify-center px-4 py-10">
      <div className={`w-full glass-surface rounded-[2.5rem] soft-shadow border border-slate-200 overflow-hidden flex flex-col lg:flex-row transition-all ${isLogin ? 'max-w-5xl' : 'max-w-6xl'}`}>

        <div className="hidden lg:flex lg:w-5/12 bg-slate-900 p-10 xl:p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-teal-600/30 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/15 p-3 rounded-2xl"><FaBrain className="text-3xl" /></div>
            <span className="text-3xl brand-display font-bold">PSY-AI</span>
          </div>

          <div className="relative z-10 space-y-6 my-10">
            <h2 className="text-4xl brand-display font-bold leading-tight">{isLogin ? 'Повернення до вашого простору.' : 'Новий рівень цифрової психології.'}</h2>
            <p className="text-slate-300 text-lg leading-relaxed">{isLogin ? 'Увійдіть, щоб продовжити роботу зі своїм профілем, тестами та комунікацією з фахівцем.' : 'Створіть обліковий запис і отримайте доступ до сучасних методик діагностики та AI-аналізу.'}</p>
          </div>

          <div className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-teal-200 bg-white/10 rounded-full px-4 py-2 border border-white/10 w-fit">
            <FaLock /> End-to-End Encryption
          </div>
        </div>

        <div className="w-full lg:w-7/12 p-7 md:p-10 xl:p-12 bg-[#f5f8f7] relative">
          <div className="absolute top-6 right-6 flex bg-white border border-slate-200 p-1 rounded-full shadow-sm">
            <button onClick={() => setIsLogin(true)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${isLogin ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Вхід</button>
            <button onClick={() => setIsLogin(false)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!isLogin ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Реєстрація</button>
          </div>

          <div className="mt-12 lg:mt-6 mb-8">
            <h3 className="text-3xl brand-display font-bold text-slate-900 mb-2">{isLogin ? 'Вхід у систему' : 'Створення акаунту'}</h3>
            <p className="text-slate-600 font-medium">{isLogin ? 'Вкажіть ваші дані для доступу до кабінету.' : 'Заповніть поля нижче для реєстрації нового профілю.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-fade-in space-y-5">
                <div className="flex bg-teal-50 p-1.5 rounded-2xl mb-6 border border-teal-100">
                  <button type="button" onClick={() => setFormData({...formData, role: 'patient'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.role === 'patient' ? 'bg-teal-700 text-white shadow-md' : 'text-teal-700 hover:bg-white/70'}`}><FaUser /> Я Клієнт</button>
                  <button type="button" onClick={() => setFormData({...formData, role: 'psychologist'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.role === 'psychologist' ? 'bg-teal-700 text-white shadow-md' : 'text-teal-700 hover:bg-white/70'}`}><FaUserMd /> Я Психолог</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2 relative">
                    <FaUser className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                    <input type="text" name="fullName" placeholder="ПІБ (Повне ім'я)" required value={formData.fullName} onChange={handleChange} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-50 outline-none transition-all text-slate-700" />
                  </div>

                  <div className="relative">
                    <FaEnvelope className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                    <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal-600 outline-none transition-all text-slate-700" />
                  </div>
                  <div className="relative">
                    <input type="email" name="confirmEmail" placeholder="Повторіть Email" required value={formData.confirmEmail} onChange={handleChange} className={`w-full px-6 py-4 rounded-2xl bg-white border outline-none transition-all text-slate-700 ${!isEmailMatch ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-50'}`} />
                    {!isEmailMatch && <FaExclamationCircle className="absolute top-1/2 right-5 transform -translate-y-1/2 text-rose-500" />}
                  </div>

                  <div className="relative">
                    <FaPhone className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                    <input type="tel" name="phone" placeholder="Номер телефону" required value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal-600 outline-none transition-all text-slate-700" />
                  </div>
                  <div className="relative">
                    <input type="tel" name="confirmPhone" placeholder="Повторіть номер" required value={formData.confirmPhone} onChange={handleChange} className={`w-full px-6 py-4 rounded-2xl bg-white border outline-none transition-all text-slate-700 ${!isPhoneMatch ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-50'}`} />
                    {!isPhoneMatch && <FaExclamationCircle className="absolute top-1/2 right-5 transform -translate-y-1/2 text-rose-500" />}
                  </div>

                  <div className="relative">
                    <FaCalendarAlt className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                    <input type="number" name="age" placeholder="Повних років" required min="14" max="100" value={formData.age} onChange={handleChange} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal-600 outline-none transition-all text-slate-700" />
                  </div>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 gap-5 ${!isLogin ? 'md:grid-cols-2 mt-5' : ''}`}>
              {isLogin && (
                <div className="relative">
                  <FaEnvelope className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                  <input type="email" name="email" placeholder="Email адреса" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-50 outline-none transition-all text-slate-700" />
                </div>
              )}

              <div className="relative">
                <FaLock className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                <input type={showPass ? "text" : "password"} name="password" placeholder="Пароль" required minLength="6" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-50 outline-none transition-all text-slate-700" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 right-5 transform -translate-y-1/2 text-slate-400 hover:text-teal-700">{showPass ? <FaEyeSlash /> : <FaEye />}</button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <FaLock className="absolute top-1/2 left-5 transform -translate-y-1/2 text-slate-400" />
                  <input type={showConfPass ? "text" : "password"} name="confirmPassword" placeholder="Повторіть пароль" required value={formData.confirmPassword} onChange={handleChange} className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-white border outline-none transition-all text-slate-700 ${!isPassMatch ? 'border-rose-300 focus:ring-rose-50' : 'border-slate-200 focus:border-teal-600 focus:ring-teal-50'}`} />
                  <button type="button" onClick={() => setShowConfPass(!showConfPass)} className="absolute top-1/2 right-5 transform -translate-y-1/2 text-slate-400 hover:text-teal-700">{showConfPass ? <FaEyeSlash /> : <FaEye />}</button>
                  {!isPassMatch && <FaExclamationCircle className="absolute top-1/2 right-12 transform -translate-y-1/2 text-rose-500" />}
                </div>
              )}
            </div>

            {isLogin && <div className="flex justify-end"><button type="button" className="text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors">Забули пароль?</button></div>}

            <button type="submit" disabled={loading || (!isLogin && !isValidToSubmit)} className="w-full bg-teal-700 hover:bg-teal-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-teal-900/20 mt-4 flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Завантаження...' : (isLogin ? 'Увійти' : 'Створити акаунт')} <FaArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}