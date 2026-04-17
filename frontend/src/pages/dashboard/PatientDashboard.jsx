// src/pages/PatientDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../lib/config/api';
import { 
  FaUserEdit, FaCamera, FaTimes, FaComments, 
  FaClipboardList, FaPenFancy, FaListOl, FaArrowRight, FaUserMd, FaExclamationCircle
} from 'react-icons/fa';

const PSY_COLOR_VARIANTS = [
  'bg-teal-100 text-teal-800',
  'bg-amber-100 text-amber-900',
  'bg-emerald-100 text-emerald-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [assignedPsy, setAssignedPsy] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    fetch(`${API_BASE_URL}/api/my-psychologist/${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          const psyId = data.psychologist_id;
          setAssignedPsy({
            id: psyId,
            name: data.psychologist_name,
            role: 'Психолог',
            color: ['indigo', 'emerald', 'rose', 'amber', 'teal'][psyId % 5],
          });
          localStorage.setItem('assignedPsyId', String(psyId));
        } else {
          setAssignedPsy(null);
          localStorage.removeItem('assignedPsyId');
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Клієнт',
    email: localStorage.getItem('userEmail') || 'user@example.com',
    age: localStorage.getItem('userAge') || '—',
    avatar: localStorage.getItem('patientAvatar') || null
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const handleSaveProfile = () => {
    setProfile(editForm);
    localStorage.setItem('userName', editForm.name);
    localStorage.setItem('userAge', editForm.age);
    if (editForm.avatar) localStorage.setItem('patientAvatar', editForm.avatar);
    setIsEditingProfile(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditForm({ ...editForm, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-teal-700 mb-2">Patient Workspace</p>
        <h1 className="text-4xl brand-display font-bold text-slate-900 tracking-tight">Особистий кабінет</h1>
        <p className="text-slate-600 font-medium mt-2">Ваш безпечний простір для проходження діагностики та зв'язку з фахівцем.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* ============================== */}
        {/* ЛІВА КОЛОНКА (Профіль Клієнта) */}
        {/* ============================== */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          
          {/* Профіль */}
          <div className="glass-surface rounded-[2.4rem] soft-shadow border border-slate-200 p-8 overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-teal-700 to-teal-500 z-0"></div>
            <div className="relative z-10 flex flex-col items-center mt-8">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1.5 shadow-xl transition-transform group-hover:scale-105 duration-300">
                <div className="w-full h-full bg-teal-50 rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                  {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-5xl font-black text-teal-700">{profile.name.charAt(0)}</div>}
                </div>
              </div>
              <div className="text-center mt-6 mb-6">
                <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{profile.email}</p>
                <span className="inline-block mt-3 bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">Вік: {profile.age} років</span>
              </div>
              <button onClick={() => setIsEditingProfile(true)} className="w-full py-4 bg-white border-2 border-teal-100 hover:border-teal-600 hover:bg-teal-50 text-teal-800 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors">
                <FaUserEdit /> Редагувати профіль
              </button>
            </div>
          </div>

          {/* ВАШ ФАХІВЕЦЬ (НОВИЙ БЛОК) */}
          <div className="bg-white rounded-[2.4rem] p-8 border border-slate-200 soft-shadow relative">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <FaUserMd className="text-teal-700" /> Лікуючий фахівець
            </h3>
            
            {assignedPsy ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner ${PSY_COLOR_VARIANTS[assignedPsy.id % PSY_COLOR_VARIANTS.length]}`}>
                    {assignedPsy.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 leading-tight">{assignedPsy.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{assignedPsy.role}</p>
                  </div>
                </div>
                <button onClick={() => navigate('/chat')} className="w-full mt-2 bg-teal-700 hover:bg-teal-800 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-900/20">
                  <FaComments /> Написати в чат
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-xl mx-auto mb-4">
                  <FaExclamationCircle />
                </div>
                <p className="text-slate-600 font-medium text-sm mb-4">Ви ще не обрали свого психотерапевта.</p>
                <button onClick={() => navigate('/specialists')} className="bg-white border-2 border-teal-200 hover:border-teal-600 text-teal-800 px-6 py-2.5 rounded-xl font-bold transition-all text-sm">
                  Обрати фахівця
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============================== */}
        {/* ПРАВА КОЛОНКА (Діагностика)  */}
        {/* ============================== */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
            <h2 className="text-2xl brand-display font-bold text-slate-800">Доступна діагностика</h2>
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold border border-teal-200">3 тести</span>
          </div>

          {/* ЯКЩО ЛІКАР НЕ ОБРАНИЙ - ПОПЕРЕДЖЕННЯ */}
          {!assignedPsy && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start gap-4">
              <FaExclamationCircle className="text-rose-500 text-2xl shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-900 font-bold mb-1">Увага</h4>
                <p className="text-amber-800 text-sm font-medium">Рекомендуємо спочатку обрати фахівця у розділі "Фахівці", щоб ваші результати одразу надсилалися до його кабінету.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => navigate('/primary-interview')} className="cursor-pointer group bg-white rounded-[2.3rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col items-start">
              <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform"><FaClipboardList /></div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Первинне інтерв'ю</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Базовий збір скарг та визначення вашого запиту для фахівця.</p>
              <span className="text-teal-700 font-bold flex items-center gap-2 mt-auto">Пройти тест <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
            </div>

            <div onClick={() => navigate('/sentences')} className="cursor-pointer group bg-white rounded-[2.3rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col items-start">
              <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform"><FaPenFancy /></div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Незакінчені речення</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Проективна методика Сакса-Леві для виявлення глибинних переживань.</p>
              <span className="text-amber-700 font-bold flex items-center gap-2 mt-auto">Пройти тест <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
            </div>

            <div onClick={() => navigate('/beck')} className="cursor-pointer group bg-white rounded-[2.3rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col items-start md:col-span-2">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform"><FaListOl /></div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Шкала депресії Бека</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Глибока оцінка вашого емоційного стану за стандартизованою методикою (21 питання).</p>
              <span className="text-rose-600 font-bold flex items-center gap-2 mt-auto">Пройти тест <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* Модальне вікно редагування профілю залишається таким самим... */}
      <AnimatePresence>
        {isEditingProfile && (
          <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => setIsEditingProfile(false)} />
            <Motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.6rem] shadow-2xl z-[60] p-8 md:p-10 border border-slate-200">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transition-colors"><FaTimes /></button>
              <h2 className="text-2xl brand-display font-bold text-slate-900 mb-8 text-center">Ваш профіль</h2>
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-24 h-24 bg-teal-50 text-teal-700 rounded-3xl overflow-hidden border-2 border-dashed border-teal-200 flex items-center justify-center text-3xl font-black">
                    {editForm.avatar ? <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" /> : editForm.name.charAt(0)}
                  </div>
                  <input type="file" id="patientAvatarUpload" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <label htmlFor="patientAvatarUpload" className="cursor-pointer text-teal-700 font-bold text-sm hover:underline"><FaCamera className="inline mr-1"/> Змінити фото</label>
                </div>
                <div><label className="text-xs font-black uppercase text-slate-400 ml-2 mb-2 block">Ім'я / Псевдонім</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 border border-slate-200 font-medium" /></div>
                <div><label className="text-xs font-black uppercase text-slate-400 ml-2 mb-2 block">Ваш Вік</label><input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 border border-slate-200 font-medium" /></div>
                <button onClick={handleSaveProfile} className="w-full py-5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-lg mt-4 transition-colors shadow-lg shadow-teal-900/20">Зберегти</button>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}