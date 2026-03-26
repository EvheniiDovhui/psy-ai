// src/pages/UnfinishedSentences.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaMagic } from 'react-icons/fa'; // Об'єднав іконки тут
import { SACHS_PROMPTS, SACHS_KEYS } from '../data/sachsLevy';
import ResultsDisplay from '../components/ResultsDisplay';
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

  // Функція для автозаповнення
  const handleAutoFill = () => {
    setAnswers([...MOCK_ANSWERS]);
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

    const payload = {
      testName: "Sachs-Levy",
      timestamp: new Date().toISOString(),
      results: groupedResults
    };

    try {
      const response = await fetch('http://localhost:8000/api/analyze-sachs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Помилка сервера');

      const data = await response.json();
      console.log('Відповідь бекенду:', data);
      
      setAnalysisResults(data);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);

    } catch (error) {
      console.error('Помилка аналізу:', error);
      alert('Не вдалося з\'єднатися з Python-бекендом. Переконайтеся, що uvicorn запущено на порту 8000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors mb-6 font-medium">
          <FaArrowLeft /> Повернутися
        </button>

        {/* ОСЬ ТУТ ЗМІНИ: Додано flex-контейнер і саму кнопку Автозаповнення */}
        <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Незакінчені речення</h1>
            <p className="text-slate-600">Швидко допишіть продовження до 60 речень.</p>
          </div>
          
          {!analysisResults && (
            <button 
              type="button" 
              onClick={handleAutoFill}
              className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors"
              title="Заповнити форму тестовими даними"
            >
              <FaMagic /> Автозаповнення
            </button>
          )}
        </div>

        {!analysisResults && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {SACHS_PROMPTS.map((prompt, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal-200 focus-within:border-teal-400 focus-within:bg-teal-50/30 transition-all">
                  <label className="font-medium text-slate-700 md:w-1/2 shrink-0">{prompt}</label>
                  <input type="text" required value={answers[index]} onChange={(e) => handleInputChange(index, e.target.value)}
                    className="flex-grow px-4 py-2 border-b-2 border-slate-200 focus:border-teal-500 bg-transparent outline-none transition-colors" placeholder="..."
                  />
                </div>
              ))}

              <div className="pt-8 sticky bottom-4">
                <button type="submit" disabled={isLoading} className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex justify-center items-center gap-3 shadow-lg shadow-teal-200 text-lg">
                  {isLoading ? (
                    <><FaSpinner className="animate-spin" /> Аналізуємо ваш профіль (це може зайняти час)...</>
                  ) : (
                    <><FaPaperPlane /> Завершити тест та отримати графік</>
                  )}
                </button>
              </div>
            </form>
        )}
        
        {analysisResults && (
             <div className="text-center py-4">
                <p className="text-slate-600 mb-4">Тест завершено. Результати аналізу AI наведені нижче.</p>
                <button onClick={() => setAnalysisResults(null)} className="text-teal-600 font-medium hover:underline">
                    Пройти тест ще раз
                </button>
             </div>
        )}
      </div>

      {analysisResults && (
        <ResultsDisplay metrics={analysisResults.metrics} profile={analysisResults.profile} />
      )}
    </div>
  );
}