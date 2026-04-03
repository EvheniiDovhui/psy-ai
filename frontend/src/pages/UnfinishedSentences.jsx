// src/pages/UnfinishedSentences.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaMagic, FaLock } from 'react-icons/fa';
import { SACHS_PROMPTS, SACHS_KEYS } from '../data/sachsLevy';
import { MOCK_ANSWERS } from '../data/mockData';

export default function UnfinishedSentences() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(SACHS_PROMPTS.length).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleInputChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleAutoFill = () => setAnswers([...MOCK_ANSWERS]);

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
      const response = await fetch('http://localhost:8000/api/analyze-sachs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Помилка сервера');

      const data = await response.json();
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

        await fetch('http://localhost:8000/api/save-test-result', {
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
      alert("Не вдалося з'єднатися з сервером.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 mb-20">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 animate-fade-in">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-6 font-medium">
          <FaArrowLeft /> Повернутися
        </button>

        <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Незакінчені речення</h1>
            <p className="text-slate-600">Швидко допишіть продовження до {SACHS_PROMPTS.length} речень.</p>
          </div>
          
          {!analysisResults && (
            <button type="button" onClick={handleAutoFill} className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors">
              <FaMagic /> Автозаповнення
            </button>
          )}
        </div>

        {!analysisResults && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {SACHS_PROMPTS.map((prompt, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-teal-400 focus-within:bg-teal-50/30 transition-all">
                  <label className="font-medium text-slate-700 md:w-1/2 shrink-0">{index + 1}. {prompt}</label>
                  <input type="text" required value={answers[index]} onChange={(e) => handleInputChange(index, e.target.value)}
                    className="flex-grow px-4 py-2 border-b-2 border-slate-200 focus:border-teal-500 bg-transparent outline-none transition-colors" placeholder="..."
                  />
                </div>
              ))}

              <div className="pt-8 sticky bottom-4">
                <button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex justify-center items-center gap-3 shadow-lg shadow-teal-200 text-lg">
                  {isLoading ? <><FaSpinner className="animate-spin" /> Аналізуємо...</> : <><FaPaperPlane /> Завершити тест та отримати результати</>}
                </button>
              </div>
            </form>
        )}
      </div>

      {/* НОВИЙ ВИГЛЯД РЕЗУЛЬТАТІВ ДЛЯ КЛІЄНТА */}
      {analysisResults && (
        <div className="bg-emerald-50 text-emerald-800 p-8 md:p-12 rounded-[3rem] shadow-sm animate-fade-in text-center border border-emerald-100">
            <h2 className="text-3xl font-black mb-4">Тестування успішно завершено! 🎉</h2>
            <p className="text-lg mb-8 font-medium">Ваші відповіді проаналізовані штучним інтелектом та надіслані до кабінету вашого фахівця.</p>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl text-left shadow-sm border border-emerald-100 mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Короткий висновок:</h3>
                <p className="text-slate-600 leading-relaxed">
                    {analysisResults.profile?.summary?.substring(0, 250)}...
                </p>
                
                <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                    <FaLock className="text-indigo-400 text-2xl shrink-0 mt-1" />
                    <p className="text-indigo-700 text-sm font-medium">
                        Детальні графіки, метрики (Tononi Complexity, Free Energy) та повний психологічний профіль приховані для вашого спокою. Вони доступні лише вашому фахівцю для професійної інтерпретації.
                    </p>
                </div>
            </div>
            
            <button onClick={() => navigate('/dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-md">
                Повернутися в кабінет
            </button>
        </div>
      )}
    </div>
  );
}