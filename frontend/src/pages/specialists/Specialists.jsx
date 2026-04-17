// src/pages/Specialists.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserMd, FaStar, FaRegEnvelope, FaCheckCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../../lib/config/api';

const PALETTE = ['indigo', 'emerald', 'rose', 'amber', 'teal'];
const COLOR_VARIANTS = {
  indigo: {
    icon: 'bg-indigo-50 text-indigo-700',
    activeBorder: 'border-indigo-400',
    activeBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    button: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    passiveButton: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-700',
    activeBorder: 'border-emerald-400',
    activeBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    button: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    passiveButton: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-700',
    activeBorder: 'border-rose-400',
    activeBadge: 'bg-rose-100 text-rose-800 border-rose-200',
    button: 'bg-rose-700 hover:bg-rose-800 text-white',
    passiveButton: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700',
    activeBorder: 'border-amber-400',
    activeBadge: 'bg-amber-100 text-amber-900 border-amber-200',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    passiveButton: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  teal: {
    icon: 'bg-teal-50 text-teal-700',
    activeBorder: 'border-teal-400',
    activeBadge: 'bg-teal-100 text-teal-800 border-teal-200',
    button: 'bg-teal-700 hover:bg-teal-800 text-white',
    passiveButton: 'bg-teal-50 text-teal-800 border-teal-200',
  },
};

export default function Specialists() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userEmail = localStorage.getItem('userEmail');
  const [specialists, setSpecialists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Перевіряємо, чи вже є обраний лікар
  const currentPsyId = Number(localStorage.getItem('assignedPsyId') || 0);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/psychologists`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.data)) {
          const normalized = data.data.map((specialist, index) => ({
            ...specialist,
            role: specialist.role || 'Психолог',
            exp: specialist.exp || 'Досвід вказано у профілі',
            specialty: specialist.specialty || specialist.phone || 'Профіль уточнюється',
            color: PALETTE[index % PALETTE.length],
          }));
          setSpecialists(normalized);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAssign = async (specialist) => {
    if (!isAuthenticated) {
      alert("Будь ласка, увійдіть або зареєструйтесь, щоб обрати фахівця.");
      navigate('/auth');
      return;
    }
    if (userRole === 'psychologist') {
      alert("Ви авторизовані як фахівець. Ця функція для клієнтів.");
      return;
    }
    if (!userEmail) {
      alert('Не знайдено email користувача. Увійдіть повторно.');
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/assign-psychologist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_email: userEmail,
          psychologist_id: specialist.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.detail || 'Не вдалося закріпити фахівця');
      }

      localStorage.setItem('assignedPsyId', String(specialist.id));
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Помилка призначення фахівця');
    }
  };

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-28 pb-16">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 font-bold mb-8 transition-colors">
        <FaArrowLeft /> Повернутися
      </button>

      <div className="glass-surface rounded-[2.4rem] p-7 md:p-10 mb-10 border border-slate-200 soft-shadow">
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-teal-700 mb-2">Спеціалісти</p>
        <h1 className="text-4xl md:text-5xl brand-display font-bold text-slate-900 mb-4">Оберіть фахівця для ведення вашого кейсу</h1>
        <p className="text-lg text-slate-600 font-medium max-w-3xl">Кожен спеціаліст працює у звʼязці з AI-модулем і отримує структуровані результати тестів у безпечному кабінеті.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin mx-auto"></div></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialists.map(s => {
          const isAssigned = currentPsyId === s.id;
          const variant = COLOR_VARIANTS[s.color] || COLOR_VARIANTS.teal;
          
          return (
            <div key={s.id} className={`bg-white rounded-[2rem] p-7 border-2 transition-all group ${isAssigned ? `${variant.activeBorder} shadow-xl` : 'border-slate-200 hover:border-teal-300 hover:-translate-y-1 soft-shadow'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-20 h-20 ${variant.icon} rounded-[1.6rem] flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform`}>
                  <FaUserMd />
                </div>
                {isAssigned && (
                  <span className={`${variant.activeBadge} px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border`}>
                    <FaCheckCircle /> Ваш фахівець
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-1">{s.name}</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{s.role}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <FaStar className="text-amber-400" />
                  <span className="text-slate-600 font-medium">Досвід: <b className="text-slate-900">{s.exp}</b></span>
                </div>
                <div className="flex items-center gap-3">
                  <FaRegEnvelope className="text-teal-700" />
                  <span className="text-slate-600 font-medium text-sm">{s.specialty}</span>
                </div>
              </div>

              {isAssigned ? (
                <button onClick={() => navigate('/dashboard')} className={`w-full ${variant.passiveButton} border py-4 rounded-2xl font-black transition-all shadow-sm`}>
                  Перейти в кабінет
                </button>
              ) : (
                <button onClick={() => handleAssign(s)} className={`w-full ${variant.button} py-4 rounded-2xl font-black transition-all shadow-md`}>
                  Обрати фахівця
                </button>
              )}
            </div>
          )
        })}
      </div>
      )}
    </div>
  );
}