import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaHeartbeat, FaUsers, 
  FaBatteryFull, FaBrain, FaQuoteLeft, FaUserMd, FaExclamationTriangle 
} from 'react-icons/fa';
import ResultsDisplay from '../components/ResultsDisplay';

export default function PrimaryInterview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    mood: '',
    complaint: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const combinedText = `
      Клієнт: ${formData.fullName}, Вік: ${formData.age}. 
      Настрій: ${formData.mood}. 
      Запит: ${formData.complaint}
    `;

    try {
      const response = await fetch('http://localhost:8000/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      
      const data = await response.json();
      // Зберігаємо повну відповідь для доступу до vector_data
      setResult({ ...data.data, _fullResponse: data });
    } catch (error) {
      console.error(error);
      alert('Не вдалося отримати аналіз AI. Перевірте бекенд.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <button 
        onClick={() => result ? setResult(null) : navigate('/')} 
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <FaArrowLeft /> {result ? 'Повернутися до форми' : 'На головну'}
      </button>

      {!result ? (
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Первинне інтерв'ю</h1>
            <p className="text-slate-500 text-lg font-light italic">Розкажіть про ваш стан, а AI допоможе структурувати запит.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">ПІБ або Псевдонім</label>
                <input 
                  type="text" name="fullName" required
                  value={formData.fullName} onChange={handleChange}
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 text-lg text-slate-700 outline-none transition-all"
                  placeholder="Ваше ім'я"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">Ваш вік</label>
                <input 
                  type="number" name="age" required
                  value={formData.age} onChange={handleChange}
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 text-lg text-slate-700 outline-none transition-all"
                  placeholder="25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">Що вас турбує сьогодні?</label>
              <textarea 
                name="complaint" rows="5" required
                value={formData.complaint} onChange={handleChange}
                className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 text-lg text-slate-700 outline-none transition-all resize-none"
                placeholder="Опишіть ваш стан..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-4 tracking-widest">Настрій за 7 днів</label>
              <select 
                name="mood" required
                value={formData.mood} onChange={handleChange}
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-none focus:ring-4 focus:ring-indigo-100 text-lg text-slate-700 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Оберіть ваш стан...</option>
                <option value="Хороший, стабільний">Стабільний, переважно хороший</option>
                <option value="Змінний, з перепадами">Мінливий, буває по-різному</option>
                <option value="Пригнічений, тривожний">Пригнічений, апатія</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 px-10 rounded-[2rem] text-xl transition-all shadow-2xl shadow-indigo-200 flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {loading ? 'ШІ аналізує...' : <><FaCheckCircle /> Отримати висновок AI</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-10 animate-slide-up pb-20">
          {/* Картка запиту */}
          <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden border-b-8 border-indigo-500">
            <FaQuoteLeft className="absolute -top-10 -left-10 text-[14rem] opacity-5 rotate-12" />
            <div className="relative z-10 space-y-4">
              <span className="bg-indigo-500/30 text-indigo-200 px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest">Core Request</span>
              <p className="text-4xl font-medium leading-tight italic">"{result.core_request}"</p>
            </div>
          </div>

          {/* Показники */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Емоц. стабільність', val: result.scores.emotional_stability, icon: <FaHeartbeat/>, color: 'text-rose-500', bg: 'bg-rose-50' },
              { label: 'Соц. адаптація', val: result.scores.social_adaptation, icon: <FaUsers/>, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Рівень ресурсів', val: result.scores.resource_level, icon: <FaBatteryFull/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Рефлексія', val: result.scores.self_reflection, icon: <FaBrain/>, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map(s => (
              <div key={s.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center space-y-4">
                <div className={`${s.bg} ${s.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner`}>{s.icon}</div>
                <div className="text-4xl font-black text-slate-800">{s.val}/10</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Висновок */}
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-4">
              <h4 className="px-6 text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">Маркери</h4>
              <div className="flex flex-col gap-3">
                {result.markers.map(m => (
                  <div key={m} className="bg-white px-8 py-5 rounded-3xl border border-slate-100 shadow-sm font-bold text-slate-700 italic">#{m}</div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-4 text-indigo-600">
                <FaUserMd className="text-3xl" />
                <h4 className="text-2xl font-black italic">Аналіз AI</h4>
              </div>
              <p className="text-xl text-slate-600 leading-relaxed font-light">{result.clinical_summary}</p>
            </div>
          </div>

          {/* Графіки з vector_data, якщо доступні */}
          {result._fullResponse?.vector_data && (
            <ResultsDisplay
              profile={result._fullResponse.data}
              metrics={result._fullResponse.metrics || { tononi_complexity: 0, free_energy: 0 }}
              vectorData={result._fullResponse.vector_data}
            />
          )}
        </div>
      )}
    </div>
  );
}
