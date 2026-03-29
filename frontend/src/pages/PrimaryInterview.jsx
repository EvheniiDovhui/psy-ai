// src/pages/PrimaryInterview.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaHeartbeat, FaUsers, 
  FaBatteryFull, FaBrain, FaQuoteLeft, FaUserMd, FaExclamationTriangle 
} from 'react-icons/fa';

export default function PrimaryInterview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', age: '', mood: '', complaint: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const combinedText = `Клієнт: ${formData.fullName}, Вік: ${formData.age}. Настрій: ${formData.mood}. Запит: ${formData.complaint}`;

    try {
      const response = await fetch('http://localhost:8000/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error(error);
      alert('Не вдалося отримати аналіз AI. Перевірте підключення.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <button onClick={() => result ? setResult(null) : navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium">
        <FaArrowLeft /> {result ? 'Нове інтерв\'ю' : 'На головну'}
      </button>

      {!result ? (
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Первинне інтерв'ю</h1>
            <p className="text-slate-500 italic">Розкажіть про ваш стан, а AI структурує запит.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-4">ПІБ / Псевдонім</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full mt-2 px-8 py-5 rounded-[1.5rem] bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none" placeholder="Ім'я" />
              </div>
              <div>
                <label className="text-xs font-black uppercase text-slate-400 ml-4">Вік</label>
                <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full mt-2 px-8 py-5 rounded-[1.5rem] bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none" placeholder="Вік" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 ml-4">Що вас турбує?</label>
              <textarea name="complaint" rows="5" required value={formData.complaint} onChange={handleChange} className="w-full mt-2 px-8 py-6 rounded-[2rem] bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none resize-none" placeholder="Опишіть стан..." />
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 ml-4">Настрій за 7 днів</label>
              <select name="mood" required value={formData.mood} onChange={handleChange} className="w-full mt-2 px-8 py-5 rounded-[1.5rem] bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer">
                <option value="" disabled>Оберіть стан...</option>
                <option value="Хороший">Стабільний, хороший</option>
                <option value="Змінний">Мінливий</option>
                <option value="Пригнічений">Пригнічений, тривожний</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2rem] text-xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3">
              {loading ? 'ШІ аналізує...' : <><FaCheckCircle /> Отримати висновок</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-10 animate-slide-up pb-20">
          <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-8 border-indigo-500">
            <FaQuoteLeft className="absolute -top-10 -left-10 text-[14rem] opacity-5 rotate-12" />
            <div className="relative z-10 space-y-4">
              <span className="bg-indigo-500/30 text-indigo-200 px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest">Головний запит</span>
              <p className="text-3xl font-medium leading-tight italic">"{result?.core_request || 'Запит не визначено'}"</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Емоц. стабільність', val: result?.scores?.emotional_stability, icon: <FaHeartbeat/>, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'Соц. адаптація', val: result?.scores?.social_adaptation, icon: <FaUsers/>, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Рівень ресурсів', val: result?.scores?.resource_level, icon: <FaBatteryFull/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Рефлексія', val: result?.scores?.self_reflection, icon: <FaBrain/>, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center space-y-4">
                <div className={`${s.bg} ${s.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl`}>{s.icon}</div>
                <div className="text-4xl font-black text-slate-800">{s.val || 0}/10</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-4">
              <h4 className="px-6 text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500"/> Маркери
              </h4>
              <div className="flex flex-col gap-3">
                {(result?.markers || []).map((m, i) => (
                  <div key={i} className="bg-white px-8 py-5 rounded-3xl border border-slate-100 shadow-sm font-bold text-slate-700 italic">#{m}</div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <FaUserMd className="text-3xl" />
                <h4 className="text-2xl font-black italic">Клінічне резюме AI</h4>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-light">{result?.clinical_summary || 'Дані відсутні'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}