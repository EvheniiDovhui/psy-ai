// src/pages/PrimaryInterview.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheckCircle, FaUserMd, FaLock, FaBrain, FaHeartbeat, FaRegCommentDots
} from 'react-icons/fa';

export default function PrimaryInterview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Дані користувача з локального сховища
  const userName = localStorage.getItem('userName') || 'Анонім';
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    mood: '', 
    complaint: '',
  });

  // Перевірка авторизації
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
    }
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Кнопка для швидкого тестування (як у Сакса-Леві)
  const handleAutoFill = () => {
    setFormData({
      mood: 'Пригнічений',
      complaint: 'Останніми тижнями відчуваю постійну втому і відсутність мотивації. Важко прокидатися зранку, нічого не радує. Почалися проблеми зі сном і постійна тривога за майбутнє. Здається, що я ні з чим не справляюсь на роботі.'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Додаємо ім'я автоматично, вік ШІ може спробувати зрозуміти з контексту або проігнорувати
    const combinedText = `Клієнт: ${userName}. Настрій: ${formData.mood}. Запит: ${formData.complaint}`;

    try {
      const response = await fetch('http://localhost:8000/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      const data = await response.json();
      
      // Відображаємо результати для клієнта
      setAnalysisResults(data.data);

      // ==============================================================
      // ЗБЕРІГАЄМО ПОВНИЙ JSON ДЛЯ ПСИХОЛОГА
      // ==============================================================
      if (userId && data.status === 'success') {
        
        // Перетворюємо дані Інтерв'ю у формат, який зрозуміє наш універсальний парсер у PatientProfile.jsx
        // Створюємо штучний об'єкт, щоб він був схожий на результати тестів
        const formattedDataForPsy = {
            metrics: null,
            profile: {
                "Головний запит": data.data.core_request,
                "Клінічне резюме": data.data.clinical_summary,
                "Клінічні маркери": data.data.markers,
                "Емоційний стан": data.data.scores?.emotional_stability,
                "Соціальна адаптація": data.data.scores?.social_adaptation,
                "Рівень ресурсів": data.data.scores?.resource_level,
                "Рефлексія": data.data.scores?.self_reflection
            },
            // НОВЕ: додаємо оригінальні відповіді
            raw_answers: [
              { question: "Настрій за останні 7 днів", answer: formData.mood },
              { question: "Що вас турбує?", answer: formData.complaint }
            ]
        };

        await fetch('http://localhost:8000/api/save-test-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId),
            test_type: 'Первинне інтерв\'ю',
            // Зберігаємо як JSON рядок
            ai_response: JSON.stringify(formattedDataForPsy) 
          })
        });
      }
      // ==============================================================

      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    } catch (error) {
      console.error(error);
      alert('Не вдалося отримати аналіз AI. Перевірте підключення.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in mb-20">
      
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-4 transition-colors">
        <FaArrowLeft /> Повернутися в кабінет
      </button>

      {!analysisResults ? (
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaRegCommentDots className="text-4xl text-indigo-400" />
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">Привіт, {userName}!</h1>
              </div>
              <p className="text-slate-500 font-medium text-lg ml-12">Розкажіть про свій стан, а штучний інтелект структурує запит для вашого фахівця.</p>
            </div>
            <button 
              type="button" 
              onClick={handleAutoFill}
              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap"
            >
              Автозаповнення
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                <label className="flex items-center gap-2 text-sm font-black uppercase text-slate-600 mb-4 tracking-widest">
                    <FaHeartbeat className="text-rose-400 text-xl" /> Настрій за останні 7 днів
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Стабільний, хороший', 'Мінливий', 'Пригнічений'].map((moodOption) => (
                        <label 
                            key={moodOption} 
                            className={`flex items-center justify-center p-4 rounded-2xl cursor-pointer border-2 font-bold transition-all text-center ${
                                formData.mood === moodOption 
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                                : 'bg-white border-transparent text-slate-500 hover:border-slate-200 shadow-sm'
                            }`}
                        >
                            <input 
                                type="radio" 
                                name="mood" 
                                value={moodOption} 
                                onChange={handleChange} 
                                className="hidden" 
                                required
                            />
                            {moodOption}
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
              <label className="flex items-center gap-2 text-sm font-black uppercase text-slate-600 mb-4 tracking-widest">
                <FaBrain className="text-indigo-400 text-xl" /> Що вас турбує?
              </label>
              <textarea 
                name="complaint" 
                rows="6" 
                required 
                value={formData.complaint} 
                onChange={handleChange} 
                className="w-full px-6 py-5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none resize-none transition-all text-lg text-slate-700 shadow-inner" 
                placeholder="Опишіть свій стан, думки, відчуття в тілі..." 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.mood} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl text-xl transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-3 mt-4"
            >
              {loading ? (
                <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> Аналізуємо...</>
              ) : (
                <><FaCheckCircle className="text-2xl" /> Надіслати запит фахівцю</>
              )}
            </button>
          </form>
        </div>
      ) : (
        
        /* ВИГЛЯД РЕЗУЛЬТАТІВ ДЛЯ КЛІЄНТА (Безпечний) */
        <div className="bg-emerald-50 text-emerald-800 p-8 md:p-12 rounded-[3rem] shadow-sm animate-fade-in border border-emerald-100 mt-10">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl shadow-md mb-6 animate-bounce">
                    <FaCheckCircle />
                </div>
                <h2 className="text-3xl font-black mb-4">Інтерв'ю успішно збережено!</h2>
                <p className="text-lg font-medium text-emerald-700">Ваш запит структуровано та надіслано до безпечного кабінету вашого фахівця.</p>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl text-left shadow-sm border border-emerald-100 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Визначений вектор роботи</span>
                </div>
                <p className="text-slate-700 text-lg leading-relaxed font-medium italic">
                    "{analysisResults.core_request || 'Обговорення поточного емоційного стану'}"
                </p>
                
                <div className="mt-8 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                    <FaLock className="text-indigo-400 text-2xl shrink-0 mt-1" />
                    <p className="text-indigo-700 text-sm font-medium leading-relaxed">
                        Детальні клінічні маркери, оцінка емоційної стабільності, соціальної адаптації та розгорнуте психологічне резюме збережені виключно для вашого фахівця.
                    </p>
                </div>
            </div>
            
            <div className="text-center">
                <button onClick={() => navigate('/dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-md">
                    Повернутися в кабінет
                </button>
            </div>
        </div>
      )}
    </div>
  );
}