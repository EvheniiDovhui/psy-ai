import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaLock,
  FaSpinner,
  FaShieldAlt,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../lib/config/api';

const OPTIONS = [
  { label: 'а) повністю згоден', value: 2 },
  { label: 'b) згоден', value: 1 },
  { label: 'c) не згоден', value: 0 },
];

const COPING_QUESTIONS = [
  'Дозволяю собі поділитися почуттям з другом',
  'Намагаюся все зробити так, щоб мати можливість якнайкраще вирішити проблему',
  'Здійснюю пошук усіх можливих рішень, перш ніж щось зробити',
  'Намагаюся відволіктися від проблеми',
  'Приймаю співчуття та розуміння від інших',
  'Роблю все можливе, щоб не дати оточуючим побачити, що мої справи погані',
  'Обговорюю ситуацію з людьми, тому що обговорення допомагає мені почуватися краще',
  'Ставлю для себе низку цілей, що дозволяють поступово справлятися із ситуацією',
  'Дуже ретельно зважую можливості вибору',
  'Мрію, фантазую про найкращі часи',
  'Намагаюся різними способами вирішувати проблему, доки не знайду підходящий',
  'Довіряю свої страхи родичам чи друзям',
  'Більше часу, ніж зазвичай, проводжу один',
  'Розповідаю іншим людям про складну ситуацію, бо тільки її обговорення допомагає мені прийти до її вирішення',
  'Думаю про те, що потрібно зробити, щоб виправити становище',
  'Зосереджуюсь повністю на вирішенні проблеми',
  'Роздумую про себе план дій',
  'Дивлюся телевізор довше, ніж зазвичай',
  'Іду до когось (друга чи фахівця), щоб він допоміг мені почуватися краще',
  'Стою твердо на своєму і борюся за те, що мені потрібне в будь-якій ситуації',
  'Уникаю спілкування з людьми',
  'Перемикаюся на хобі або займаюся спортом, щоб уникнути проблем',
  'Йду до друга за порадою - як виправити ситуацію',
  'Йду до друга, щоб він допоміг мені краще зрозуміти проблему',
  'Приймаю співчуття, порозуміння від друзів',
  'Сплю більше, ніж зазвичай',
  'Фантазую про те, що все могло б бути інакше',
  'Уявляю себе героєм книги чи кіно',
  'Намагаюся вирішити проблему',
  'Хочу, щоб люди залишили мене одного',
  'Приймаю допомогу від друзів чи родичів',
  'Шукаю заспокоєння у тих, хто знає мене краще',
  'Намагаюся ретельно планувати свої дії, а не діяти імпульсивно під впливом зовнішнього спонукання',
];

export default function CopingStrategiesTest() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/auth');
  }, [navigate]);

  const handleSelect = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length !== COPING_QUESTIONS.length) {
      alert('Будь ласка, дайте відповідь на всі твердження.');
      return;
    }

    setLoading(true);

    const orderedAnswers = COPING_QUESTIONS.map((_, idx) => Number(answers[idx]));

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-coping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: orderedAnswers }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.detail || 'Помилка аналізу копінг-стратегій');
      }

      setAnalysisResults(data.data);

      if (userId) {
        const formattedDataForPsy = {
          metrics: null,
          profile: {
            'Домінуюча стратегія': data.data.dominant_strategy,
            'Інтерпретація': data.data.interpretation,
            'Рівень: Вирішення проблем': data.data.levels?.problem_solving,
            'Рівень: Соціальна підтримка': data.data.levels?.social_support,
            'Рівень: Уникнення': data.data.levels?.avoidance,
            'Бали: Вирішення проблем': data.data.scores?.problem_solving,
            'Бали: Соціальна підтримка': data.data.scores?.social_support,
            'Бали: Уникнення': data.data.scores?.avoidance,
            'Рекомендації': data.data.recommendations || [],
            analysis_source: data.data.analysis_source,
          },
          raw_answers: COPING_QUESTIONS.map((question, idx) => ({
            question: `${idx + 1}. ${question}`,
            answer: OPTIONS.find((option) => option.value === orderedAnswers[idx])?.label || 'Немає відповіді',
          })),
        };

        await fetch(`${API_BASE_URL}/api/save-test-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId, 10),
            test_type: 'Індикатор копінг-стратегій',
            ai_response: JSON.stringify(formattedDataForPsy),
          }),
        });
      }

      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Не вдалося виконати аналіз тесту.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 mb-20 pt-28">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-teal-700 font-bold mb-4 transition-colors"
      >
        <FaArrowLeft /> Повернутися в кабінет
      </button>

      {!analysisResults ? (
        <div className="glass-surface p-8 md:p-12 rounded-[2.5rem] soft-shadow border border-slate-200">
          <div className="mb-10 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-100 text-cyan-700 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                <FaShieldAlt />
              </div>
              <h1 className="text-3xl brand-display font-bold text-slate-900">Індикатор копінг-стратегій</h1>
            </div>
            <p className="text-slate-500 font-medium text-lg ml-14">
              Методика оцінює три стратегії: вирішення проблем, пошук соціальної підтримки та уникнення.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {COPING_QUESTIONS.map((question, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {index + 1}. {question}
                </h3>

                <div className="flex flex-col gap-3">
                  {OPTIONS.map((option) => (
                    <label
                      key={option.label}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        answers[index] === option.value
                          ? 'border-cyan-600 bg-cyan-50'
                          : 'border-transparent bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`coping-${index}`}
                        value={option.value}
                        checked={answers[index] === option.value}
                        onChange={() => handleSelect(index, option.value)}
                        className="w-5 h-5 text-cyan-700 focus:ring-cyan-600"
                      />
                      <span className="font-medium text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 sticky bottom-6 z-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 text-white font-black py-5 rounded-2xl text-xl transition-all shadow-xl"
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-3">
                    <FaSpinner className="animate-spin" /> Аналізуємо...
                  </span>
                ) : (
                  <span className="flex justify-center items-center gap-3">
                    <FaCheckCircle /> Завершити тест
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-cyan-50 text-cyan-900 p-8 md:p-12 rounded-[2.6rem] shadow-sm border border-cyan-200 mt-10 text-center">
          <div className="w-20 h-20 bg-cyan-700 text-white rounded-full flex items-center justify-center text-4xl shadow-md mb-6 mx-auto">
            <FaCheckCircle />
          </div>
          <h2 className="text-3xl font-black mb-4">Тестування завершено</h2>
          <p className="text-lg font-medium text-cyan-800 mb-8">Ваш профіль копінг-стратегій збережено для фахівця.</p>

          <div className="bg-white p-6 md:p-8 rounded-3xl text-left shadow-sm border border-cyan-100 mb-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Домінуюча стратегія:</h3>
            <p className="text-slate-700 text-lg leading-relaxed font-bold mb-4">
              {analysisResults.dominant_strategy}
            </p>
            <p className="text-slate-600 leading-relaxed">{analysisResults.interpretation}</p>

            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4">
              <FaLock className="text-amber-700 text-2xl shrink-0 mt-1" />
              <p className="text-amber-900 text-sm font-medium leading-relaxed">
                Детальні бали за кожною шкалою та розширені рекомендації доступні вашому фахівцю.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-cyan-700 hover:bg-cyan-800 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-md"
          >
            Повернутися в кабінет
          </button>
        </div>
      )}
    </div>
  );
}
