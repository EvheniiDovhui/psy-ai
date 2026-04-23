// src/pages/UnfinishedSentences.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaMagic, FaLock } from 'react-icons/fa';
import { SACHS_PROMPTS, SACHS_KEYS } from '../../lib/data/sachsLevy';
import { API_BASE_URL } from '../../lib/config/api';

export default function UnfinishedSentences() {
  const navigate = useNavigate();
  const isDevMode = import.meta.env.DEV;
  const [answers, setAnswers] = useState(Array(SACHS_PROMPTS.length).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleInputChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleAutoFill = () => {
    setAnswers(SACHS_PROMPTS.map((_, index) => `Відповідь ${index + 1}`));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysisResults(null);
    
    const groupedResults = {};
    for (const [category, indices] of Object.entries(SACHS_KEYS)) {
      groupedResults[category] = indices.map(index => ({
        prompt: SACHS_PROMPTS[index],
        answer: answers[index]
      }));
    }

    const payload = { testName: "Sachs-Levy", timestamp: new Date().toISOString(), results: groupedResults };

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-sachs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || `Помилка сервера (${response.status})`);
      setAnalysisResults(data);

      // ==============================================================
      // ЗБЕРІГАЄМО ПОВНИЙ JSON З ГРАФІКАМИ ДЛЯ ПСИХОЛОГА
      // ==============================================================
      const userId = localStorage.getItem('userId');
      if (userId && data.status === 'success') {
        
        // Збираємо 60 оригінальних речень
        const rawAnswers = SACHS_PROMPTS.map((prompt, index) => ({
          question: prompt,
          answer: answers[index] || "---"
        }));

        // Додаємо їх до результатів від ШІ
        const dataToSave = {
           ...data, 
           raw_answers: rawAnswers
        };

        await fetch(`${API_BASE_URL}/api/save-test-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId),
            test_type: 'Незакінчені речення (Сакс-Леві)',
            ai_response: JSON.stringify(dataToSave) 
          })
        });
      }
      // ==============================================================
      
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);

    } catch (error) {
      console.error('Помилка аналізу:', error);
      
      // Розумна перевірка помилок
      if (error.message.includes('503') || error.message.includes('сервера')) {
        alert('Сервери штучного інтелекту зараз перевантажені через високий попит. Будь ласка, зачекайте хвилинку і спробуйте надіслати результати ще раз. Ваші дані збережені на екрані.');
      } else {
        alert('Не вдалося з\'єднатися з сервером. Перевірте підключення до інтернету.');
      }
    } finally {
      setIsLoading(false); // Виправлено з setLoading на setIsLoading!
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-20 pt-28">
      <div className="glass-surface p-8 rounded-[2.5rem] soft-shadow border border-slate-200">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-6 font-bold">
          <FaArrowLeft /> Повернутися
        </button>

        <div className="mb-8 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Незакінчені речення</h1>
            <p className="text-slate-600 font-medium">Швидко допишіть продовження до {SACHS_PROMPTS.length} речень.</p>
          </div>
          
          {!analysisResults && isDevMode && (
            <button type="button" onClick={handleAutoFill} className="flex items-center gap-2 text-sm bg-teal-50 text-teal-700 hover:bg-teal-100 px-5 py-2.5 rounded-full font-bold transition-colors shadow-sm">
              <FaMagic /> Автозаповнення
            </button>
          )}
        </div>

        {!analysisResults && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {SACHS_PROMPTS.map((prompt, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-teal-400 focus-within:bg-teal-50/30 transition-all">
                  <label className="font-bold text-slate-700 md:w-1/2 shrink-0">{prompt}</label>
                  <input type="text" required value={answers[index]} onChange={(e) => handleInputChange(index, e.target.value)}
                    className="flex-grow px-4 py-2 border-b-2 border-slate-200 focus:border-teal-500 bg-transparent outline-none transition-colors font-medium text-slate-800" placeholder="..."
                  />
                </div>
              ))}

              <div className="pt-8 sticky bottom-6 z-10">
                <button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-black py-5 rounded-2xl transition-all flex justify-center items-center gap-3 shadow-xl shadow-teal-200/50 text-lg">
                  {isLoading ? <><FaSpinner className="animate-spin text-2xl" /> Обробка результатів...</> : <><FaPaperPlane className="text-xl" /> Завершити тест та отримати результати</>}
                </button>
              </div>
            </form>
        )}
      </div>

      {/* НОВИЙ ВИГЛЯД РЕЗУЛЬТАТІВ ДЛЯ КЛІЄНТА */}
      {analysisResults && (
        <div className="bg-teal-50 text-teal-900 p-8 md:p-12 rounded-[2.8rem] shadow-sm text-center border border-teal-200">
            <h2 className="text-3xl font-black mb-4">Тестування успішно завершено! 🎉</h2>
          <p className="text-lg mb-8 font-medium text-teal-800">Ваші відповіді проаналізовані штучним інтелектом та надіслані до кабінету вашого фахівця.</p>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl text-left shadow-sm border border-emerald-100 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Короткий висновок:</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {(analysisResults.profile?.summary || analysisResults.profile?.conclusion || 'Аналіз виконано, детальний висновок доступний фахівцю.').substring(0, 250)}...
                </p>
                
            <div className="mt-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4">
              <FaLock className="text-amber-700 text-2xl shrink-0 mt-1" />
              <p className="text-amber-900 text-sm font-bold">
                        Детальні графіки, метрики (Tononi Complexity, Free Energy) та повний психологічний профіль приховані для вашого спокою. Вони доступні лише вашому фахівцю для професійної інтерпретації.
                    </p>
                </div>
            </div>
            
          <button onClick={() => navigate('/dashboard')} className="bg-teal-700 hover:bg-teal-800 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-md">
                Повернутися в кабінет
            </button>
        </div>
      )}
    </div>
  );
}