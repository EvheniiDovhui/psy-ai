// src/pages/BeckTest.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaLock, FaSpinner, FaMagic, FaListOl } from 'react-icons/fa';

const BECK_QUESTIONS = [
  { id: 1, options: ["Я не відчуваю смутку.", "Я засмучений.", "Я весь час засмучений і не можу від цього звільнитися.", "Я настільки засмучений і нещасливий, що не можу це витримати."] },
  { id: 2, options: ["Я не відчуваю особливого песимізму щодо майбутнього.", "Я відчуваю песимізм щодо майбутнього.", "Я відчуваю, що мені нічого чекати.", "Я відчуваю, що майбутнє безнадійне і нічого не зміниться на краще."] },
  { id: 3, options: ["Я не відчуваю себе невдахою.", "Я відчуваю, що зазнав більше невдач, ніж інші.", "Озираючись на своє життя, я бачу багато невдач.", "Я відчуваю себе повним невдахою як людина."] },
  { id: 4, options: ["Я отримую стільки ж задоволення від життя, як і раніше.", "Я не отримую стільки ж задоволення, як раніше.", "Я більше не отримую справжнього задоволення ні від чого.", "Мене нічого не радує і все набридло."] },
  { id: 5, options: ["Я не відчуваю провини.", "Я часто відчуваю себе винним.", "Я майже завжди відчуваю себе винним.", "Я постійно відчуваю себе винним."] },
  { id: 6, options: ["Я не відчуваю, що мене карають.", "Я відчуваю, що мене можуть покарати.", "Я очікую покарання.", "Я відчуваю, що мене вже карають."] },
  { id: 7, options: ["Я не розчарований у собі.", "Я розчарований у собі.", "Я відчуваю відразу до себе.", "Я ненавиджу себе."] },
  { id: 8, options: ["Я не гірший за інших.", "Я критикую себе за свої слабкості і помилки.", "Я звинувачую себе за всі свої вчинки.", "Я звинувачую себе у всьому поганому, що відбувається."] },
  { id: 9, options: ["У мене немає думок про самогубство.", "У мене бувають думки про самогубство, але я їх не реалізую.", "Я б хотів покінчити з собою.", "Я б убив себе, якби була така можливість."] },
  { id: 10, options: ["Я плачу не більше, ніж зазвичай.", "Зараз я плачу більше, ніж раніше.", "Зараз я весь час плачу.", "Раніше я міг плакати, а зараз не можу, навіть якщо хочу."] },
  { id: 11, options: ["Я не більш дратівливий, ніж зазвичай.", "Я більш дратівливий, ніж раніше.", "Я весь час роздратований.", "Мене більше не дратує те, що дратувало раніше."] },
  { id: 12, options: ["Я не втратив інтересу до інших людей.", "Я менше цікавлюся людьми, ніж раніше.", "Я майже втратив інтерес до інших людей.", "Я повністю втратив інтерес до інших людей."] },
  { id: 13, options: ["Я приймаю рішення так само добре, як і раніше.", "Я відкладаю прийняття рішень частіше, ніж раніше.", "Мені набагато важче приймати рішення.", "Я взагалі не можу приймати рішення."] },
  { id: 14, options: ["Я не виглядаю гірше, ніж зазвичай.", "Мене турбує те, що я виглядаю старим і непривабливим.", "Я відчуваю, що в моїй зовнішності відбулися постійні зміни, які роблять мене непривабливим.", "Я впевнений, що виглядаю потворно."] },
  { id: 15, options: ["Я можу працювати так само добре, як і раніше.", "Мені потрібно докладати додаткових зусиль, щоб почати щось робити.", "Мені дуже важко змусити себе щось робити.", "Я взагалі не можу працювати."] },
  { id: 16, options: ["Я сплю так само добре, як і раніше.", "Я не сплю так само добре, як раніше.", "Я прокидаюся на 1-2 години раніше звичайного і мені важко заснути знову.", "Я прокидаюся на кілька годин раніше звичайного і не можу заснути."] },
  { id: 17, options: ["Я не втомлююся більше, ніж зазвичай.", "Я втомлююся швидше, ніж раніше.", "Я втомлююся майже від усього, що роблю.", "Я занадто втомлений, щоб щось робити."] },
  { id: 18, options: ["Мій апетит не гірший, ніж зазвичай.", "Мій апетит не такий хороший, як раніше.", "Зараз у мене набагато гірший апетит.", "У мене взагалі немає апетиту."] },
  { id: 19, options: ["Я не втратив у вазі останнім часом.", "Я втратив більше 2 кг.", "Я втратив більше 5 кг.", "Я втратив більше 7 кг."] },
  { id: 20, options: ["Я не турбуюсь про своє здоров'я більше, ніж зазвичай.", "Мене турбують фізичні проблеми, такі як біль, розлад шлунку.", "Я дуже стурбований своїми фізичними проблемами, важко думати про щось інше.", "Я настільки стурбований своїм фізичним станом, що взагалі не можу думати про інше."] },
  { id: 21, options: ["Мій інтерес до сексу не змінився.", "Я менше цікавлюся сексом, ніж раніше.", "Зараз я набагато менше цікавлюся сексом.", "Я повністю втратив інтерес до сексу."] }
];

export default function BeckTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  const userId = localStorage.getItem('userId');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/auth');
  }, [navigate]);

  const handleOptionChange = (questionId, score) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleAutoFill = () => {
    const fakeAnswers = {};
    BECK_QUESTIONS.forEach(q => {
      fakeAnswers[q.id] = Math.floor(Math.random() * 2) + 1; 
    });
    setAnswers(fakeAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < BECK_QUESTIONS.length) {
      alert("Будь ласка, дайте відповідь на всі запитання.");
      return;
    }
    
    setLoading(true);
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const answersSummary = BECK_QUESTIONS.map(q => `Питання ${q.id}: бал ${answers[q.id]}`).join('; ');

    try {
      const response = await fetch('http://localhost:8000/api/analyze-beck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_score: totalScore, answers_summary: answersSummary }),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      const data = await response.json();
      
      setAnalysisResults(data.data);

      if (userId && data.status === 'success') {
        
        let severityLevel = "Норма";
        if (totalScore >= 10 && totalScore <= 15) severityLevel = "Легка депресія (субдепресія)";
        if (totalScore >= 16 && totalScore <= 19) severityLevel = "Помірна депресія";
        if (totalScore >= 20 && totalScore <= 29) severityLevel = "Виражена депресія (середньої тяжкості)";
        if (totalScore >= 30) severityLevel = "Тяжка депресія";

        // ==========================================================
        // УЛЬТРА-БРОНЕБІЙНИЙ ПАРСЕР (Розуміє і текст, і JSON)
        // ==========================================================
        let aiSummary = "Аналіз проведено";
        let aiRecs = ["Деталі відсутні"];

        let aiData = data.data;

        // Крок 1: Якщо ШІ повернув текст, але всередині прихований JSON (маркдаун-код)
        if (typeof aiData === 'string') {
          try {
            // Пробуємо очистити від ```json і розпарсити
            const cleanedString = aiData.replace(/```json/g, '').replace(/```/g, '').trim();
            aiData = JSON.parse(cleanedString);
          } catch (e) {
            // Це справжній звичайний текст, залишаємо як є
          }
        }

        // Крок 2: Розбираємо дані
        if (typeof aiData === 'object' && aiData !== null) {
          // Якщо це об'єкт (як на твоєму скріншоті)
          aiSummary = aiData.clinical_summary || aiData.summary || aiData.analysis || "Опис відсутній";
          
          // Шукаємо рекомендації або маркери ризику
          const recs = aiData.recommendations || aiData.action_plan || aiData.risk_markers;
          if (Array.isArray(recs)) {
            aiRecs = recs;
          } else if (typeof recs === 'string') {
            aiRecs = [recs];
          }
        } else if (typeof aiData === 'string') {
          // Якщо це звичайний текст (Fallback)
          const lowerText = aiData.toLowerCase();
          const recIndex = lowerText.indexOf('рекомендації');

          if (recIndex !== -1) {
            aiSummary = aiData.substring(0, recIndex).replace(/\*+/g, '').trim();
            const recText = aiData.substring(recIndex + 'рекомендації'.length).replace(/^[:\s*]+/, '');
            aiRecs = recText.split('\n')
              .map(r => r.replace(/^[-*•\d.]+\s*/, '').trim())
              .filter(r => r.length > 5);
          } else {
            aiSummary = aiData.replace(/\*+/g, '');
            aiRecs = ["Рекомендації інтегровані в загальне резюме."];
          }
        }
        // ==========================================================

        const rawAnswers = BECK_QUESTIONS.map(q => ({
          question: `Питання ${q.id}: ${q.options[0]}`, 
          answer: answers[q.id] !== undefined ? q.options[answers[q.id]] : "Пропущено"
        }));

        const formattedDataForPsy = {
            metrics: null,
            profile: {
                "Загальний бал": totalScore,
                "Клінічний рівень": severityLevel,
                "Аналітичне резюме AI": aiSummary,
                "Рекомендації для терапії": aiRecs
            },
            raw_answers: rawAnswers
        };

        await fetch('http://localhost:8000/api/save-test-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId),
            test_type: 'Шкала депресії Бека',
            ai_response: JSON.stringify(formattedDataForPsy) 
          })
        });
      }

      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    } catch (error) {
      console.error(error);
      alert('Не вдалося отримати аналіз AI.');
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-100 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  <FaListOl />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Шкала депресії Бека</h1>
              </div>
              <p className="text-slate-500 font-medium text-lg ml-14">Уважно прочитайте кожну групу тверджень і оберіть те, яке найкраще описує ваш стан за останній тиждень.</p>
            </div>
            <button 
              type="button" 
              onClick={handleAutoFill}
              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-full font-bold text-sm transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <FaMagic /> Автозаповнення
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {BECK_QUESTIONS.map((q, index) => (
              <div key={q.id} className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 transition-all hover:border-indigo-200">
                <label className="flex items-center gap-2 text-lg font-black text-slate-800 mb-6">
                  <span className="bg-white text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-sm border border-slate-200">{index + 1}</span> 
                  Оберіть твердження:
                </label>
                
                <div className="flex flex-col gap-3 ml-2 md:ml-10">
                  {q.options.map((optionText, scoreIndex) => (
                    <label 
                      key={scoreIndex} 
                      className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                        answers[q.id] === scoreIndex 
                        ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                        : 'bg-white border-transparent text-slate-600 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${q.id}`} 
                        value={scoreIndex} 
                        checked={answers[q.id] === scoreIndex}
                        onChange={() => handleOptionChange(q.id, scoreIndex)} 
                        className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer" 
                      />
                      <span className={`font-medium text-lg ${answers[q.id] === scoreIndex ? 'text-indigo-900 font-bold' : ''}`}>
                        {optionText}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 sticky bottom-6 z-10">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-6 rounded-2xl text-xl transition-all shadow-xl shadow-indigo-200 flex justify-center items-center gap-3"
                >
                  {loading ? (
                    <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> Обробка результатів...</>
                  ) : (
                    <><FaCheckCircle className="text-2xl" /> Завершити тест</>
                  )}
                </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-emerald-50 text-emerald-800 p-8 md:p-12 rounded-[3rem] shadow-sm animate-fade-in border border-emerald-100 mt-10 text-center">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl shadow-md mb-6 mx-auto animate-bounce">
                <FaCheckCircle />
            </div>
            <h2 className="text-3xl font-black mb-4">Тестування завершено!</h2>
            <p className="text-lg font-medium text-emerald-700 mb-8">Ваші результати успішно зашифровані та передані вашому фахівцю.</p>
            
            <div className="bg-white p-6 md:p-8 rounded-3xl text-left shadow-sm border border-emerald-100 mb-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Короткий відгук:</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                    {typeof analysisResults === 'string' 
                        ? (analysisResults.length > 250 ? analysisResults.substring(0, 250).replace(/\*+/g, '') + '...' : analysisResults.replace(/\*+/g, '')) 
                        : 'Дані оброблено. Ваш стан проаналізовано.'}
                </p>
                
                <div className="mt-8 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
                    <FaLock className="text-indigo-400 text-2xl shrink-0 mt-1" />
                    <p className="text-indigo-700 text-sm font-medium leading-relaxed">
                        Щоб уникнути хибної самодіагностики, ваші точні бали та клінічний рівень депресії за Шкалою Бека приховані. Ваш психолог обговорить їх з вами на наступній сесії.
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