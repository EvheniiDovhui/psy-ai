// src/pages/PsychologistDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../lib/config/api';
import { 
  FaUserInjured, FaArrowRight, FaUserEdit, FaCamera, 
  FaTimes, FaPlus, FaCheck, FaRegEnvelope, FaBriefcase, FaBrain, FaMicrophone
} from 'react-icons/fa';

export default function PsychologistDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('userEmail'));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Наталія Довгуй',
    role: localStorage.getItem('psyRole') || 'Клінічний психолог, психотерапевт',
    bio: localStorage.getItem('psyBio') || 'Допомагаю клієнтам впоратися з тривожними розладами, панічними атаками та наслідками хронічного стресу. Використовую інтегративний підхід та AI-аналітику.',
    specialties: JSON.parse(localStorage.getItem('psySpecialties')) || ['КПТ', 'Тривожні розлади', 'ПТСР', 'Депресія'],
    avatar: localStorage.getItem('psyAvatar') || null
  });

  const [editForm, setEditForm] = useState({ ...profile });
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    fetch(`${API_BASE_URL}/api/my-patients/${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setPatients(data.data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = () => {
    setProfile(editForm);
    localStorage.setItem('userName', editForm.name);
    localStorage.setItem('psyRole', editForm.role);
    localStorage.setItem('psyBio', editForm.bio);
    localStorage.setItem('psySpecialties', JSON.stringify(editForm.specialties));
    if (editForm.avatar) localStorage.setItem('psyAvatar', editForm.avatar);
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

  const addSpecialty = () => {
    if (newSpecialty.trim() && !editForm.specialties.includes(newSpecialty.trim())) {
      setEditForm({ ...editForm, specialties: [...editForm.specialties, newSpecialty.trim()] });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (spec) => setEditForm({ ...editForm, specialties: editForm.specialties.filter(s => s !== spec) });

  return (
    <>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-teal-700 mb-2">Clinical Workspace</p>
        <h1 className="text-4xl brand-display font-bold text-slate-900 tracking-tight">Робочий простір фахівця</h1>
        <p className="text-slate-600 font-medium mt-2">Керуйте клінічними профілями та відстежуйте динаміку стану.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/3">
          <div className="glass-surface rounded-[2.5rem] soft-shadow border border-slate-200 p-8 sticky top-28 overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-teal-700 to-teal-500 z-0"></div>
            <div className="relative z-10 flex flex-col items-center mt-8">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1.5 shadow-xl rotate-3 transition-transform group-hover:rotate-0 duration-300">
                <div className="w-full h-full bg-teal-50 rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                  {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="text-5xl font-black text-teal-300">{profile.name.charAt(0)}</div>}
                </div>
              </div>
              <div className="text-center mt-6 mb-6">
                <h2 className="text-2xl font-black text-slate-900">{profile.name}</h2>
                <p className="text-teal-700 font-bold text-sm mt-1 flex items-center justify-center gap-2"><FaBriefcase className="opacity-70" /> {profile.role}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-3xl w-full mb-6 relative">
                <FaBrain className="absolute top-4 right-4 text-slate-200 text-3xl" />
                <p className="text-slate-600 text-sm leading-relaxed font-medium relative z-10">"{profile.bio}"</p>
              </div>
              <div className="w-full flex flex-wrap justify-center gap-2 mb-8">
                {profile.specialties.map((spec, i) => <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">{spec}</span>)}
              </div>
              <button onClick={() => setIsEditingProfile(true)} className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-900/20">
                <FaUserEdit /> Налаштувати профіль
              </button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-teal-700 to-teal-500 rounded-[2.5rem] p-8 text-white shadow-lg shadow-teal-900/20 relative overflow-hidden">
              <FaUserInjured className="absolute -bottom-4 -right-4 text-9xl opacity-10" />
              <h3 className="text-teal-100 font-bold uppercase tracking-widest text-xs mb-2">Всього пацієнтів</h3>
              <div className="text-6xl font-black">{patients.length}</div>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">AI Статус</h3>
                <div className="flex items-center gap-3">
                  <span className="relative flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span></span>
                  <span className="text-xl font-black text-slate-800">Система активна</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-4">Аналізатор тестів готовий до роботи.</p>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-[2.5rem] p-8 shadow-sm sm:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-cyan-800 font-black text-xl mb-1">AI-асистент живої сесії</h3>
                <p className="text-cyan-900/80 font-medium text-sm">Транскрипція голосу психолога і клієнта в реальному часі + миттєві інсайти.</p>
              </div>
              <button
                onClick={() => navigate('/live-session')}
                className="bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <FaMicrophone /> Відкрити сесію
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 border-b border-slate-200/60 pb-4"><h2 className="text-2xl brand-display font-bold text-slate-800">Картки клієнтів</h2></div>

          {loading ? (
            <div className="text-center py-20"><div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin mx-auto"></div></div>
          ) : patients.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-200/60 border-dashed">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl"><FaUserInjured /></div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Немає пацієнтів</h3>
              <p className="text-slate-500">Коли клієнти зареєструються, вони з'являться тут.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.map(patient => (
                <div key={patient.id} className="group bg-white rounded-[2.3rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-gradient-to-tr from-teal-100 to-amber-50 text-teal-700 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">{patient.name.charAt(0).toUpperCase()}</div>
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Вік: {patient.age || '—'}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-1">{patient.name}</h3>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-2"><FaRegEnvelope className="opacity-70" /> {patient.email}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">Очікує аналіз</span>
                    <button onClick={() => navigate(`/patient/${patient.id}`)} className="w-12 h-12 bg-slate-50 text-teal-700 hover:bg-teal-700 hover:text-white rounded-2xl flex items-center justify-center transition-colors group-hover:shadow-md"><FaArrowRight /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isEditingProfile && (
          <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" onClick={() => setIsEditingProfile(false)} />
            <Motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[2.6rem] shadow-2xl z-[60] max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="p-8 md:p-10 relative">
                <button onClick={() => setIsEditingProfile(false)} className="absolute top-8 right-8 w-10 h-10 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full flex items-center justify-center transition-colors"><FaTimes /></button>
                <h2 className="text-3xl brand-display font-bold text-slate-900 mb-8">Налаштування профілю</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 bg-teal-50 rounded-3xl overflow-hidden border-2 border-dashed border-teal-200">
                      {editForm.avatar ? <img src={editForm.avatar} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-teal-300 text-3xl font-black">{editForm.name.charAt(0)}</div>}
                    </div>
                    <div>
                      <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <label htmlFor="avatarUpload" className="cursor-pointer inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm"><FaCamera /> Завантажити фото</label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block">ПІБ</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 border border-slate-200 font-medium" /></div>
                    <div><label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block">Посада</label><input type="text" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 border border-slate-200 font-medium" /></div>
                  </div>
                  <div><label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block">Про себе</label><textarea rows="4" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 border border-slate-200 font-medium resize-none" /></div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block">Напрямки роботи (Теги)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {editForm.specialties.map((spec, i) => <div key={i} className="flex items-center gap-2 bg-teal-50 text-teal-800 px-4 py-2 rounded-xl text-sm font-bold">{spec} <button onClick={() => removeSpecialty(spec)} className="text-teal-500 hover:text-rose-500"><FaTimes /></button></div>)}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSpecialty()} placeholder="Наприклад: Гештальт-терапія" className="flex-grow bg-slate-50 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-teal-600 border border-slate-200 font-medium" />
                      <button onClick={addSpecialty} className="bg-slate-900 hover:bg-teal-700 text-white px-6 rounded-2xl transition-colors"><FaPlus /></button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <button onClick={handleSaveProfile} className="w-full py-5 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-teal-900/20"><FaCheck /> Зберегти зміни</button>
                  </div>
                </div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}