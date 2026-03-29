// src/pages/BeckTest.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaListUl, FaUserMd } from 'react-icons/fa';

// Скорочений список для прикладу (в реальності додай усі 21 питання)
const BECK_QUESTIONS = [
  { id: 1, title: 'Смуток', options: [
    { score: 0, text: 'Я не почуваюся засмученим.' },
    { score: 1, text: 'Я часто засмучений.' },
    { score: 2, text: 'Я весь час засмучений.' },
    { score: 3, text: 'Я настільки засмучений і нещасний, що не можу цього витримати.' }
  ]},
  { id: 2, title: 'Песимізм', options: [
    { score: 0, text: 'Я не дивлюся в майбутнє з безнадією.' },
    { score: 1, text: 'Я відчуваю розчарування щодо майбутнього.' },
    { score: 2, text: 'Я відчуваю, що мені нічого чекати.' },
    { score: 3, text: 'Моє майбутнє безнадійне, і ніщо не зміниться на краще.' }
  ]},
  { id: 3, title: 'Відчуття неуспіху', options: [
    { score: 0, text: 'Я не відчуваю себе невдахою.' },
    { score: 1, text: 'Я зазнавав невдач частіше, ніж інші люди.' },
    { score: 2, text: 'Озираючись на своє життя, я бачу лише низку невдач.' },
    { score: 3, text: 'Я відчуваю себе повним невдахою як людина.' }
  ]},
  { id: 4, title: 'Втрата задоволення', options: [
    { score: 0, text: 'Я отримую стільки ж задоволення від речей, як і раніше.' },
    { score: 1, text: 'Я не отримую стільки задоволення від речей, як раніше.' },
    { score: 2, text: 'Я майже не отримую задоволення від того, що раніше подобалося.' },
    { score: 3, text: 'Я не можу отримати жодного задоволення від будь-чого.' }
  ]},
  { id: 5, title: 'Почуття провини', options: [
    { score: 0, text: 'Я не відчуваю особливої провини.' },
    { score: 1, text: 'Я часто відчуваю провину за багато речей.' },
    { score: 2, text: 'Я відчуваю провину більшість часу.' },
    { score: 3, text: 'Я відчуваю провину постійно.' }
  ]},
  { id: 6, title: 'Відчуття покарання', options: [
    { score: 0, text: 'Я не відчуваю, що мене карають.' },
    { score: 1, text: 'Я відчуваю, що мене можуть покарати.' },
    { score: 2, text: 'Я очікую, що мене покарають.' },
    { score: 3, text: 'Я відчуваю, що мене вже карають.' }
  ]},
  { id: 7, title: 'Незадоволеність собою', options: [
    { score: 0, text: 'Моє ставлення до себе не змінилося.' },
    { score: 1, text: 'Я втратив впевненість у собі.' },
    { score: 2, text: 'Я розчарований у собі.' },
    { score: 3, text: 'Я ненавиджу себе.' }
  ]},
  { id: 8, title: 'Самозвинувачення', options: [
    { score: 0, text: 'Я не критикую і не звинувачую себе більше, ніж зазвичай.' },
    { score: 1, text: 'Я більш критичний до себе, ніж раніше.' },
    { score: 2, text: 'Я критикую себе за всі свої помилки.' },
    { score: 3, text: 'Я звинувачую себе за все погане, що відбувається.' }
  ]},
  { id: 9, title: 'Суїцидальні думки', options: [
    { score: 0, text: 'У мене немає жодних думок про самогубство.' },
    { score: 1, text: 'У мене є думки про самогубство, але я не здійсню їх.' },
    { score: 2, text: 'Я б хотів покінчити з собою.' },
    { score: 3, text: 'Я б убив себе, якби була нагода.' }
  ]},
  { id: 10, title: 'Плаксивість', options: [
    { score: 0, text: 'Я плачу не частіше, ніж раніше.' },
    { score: 1, text: 'Зараз я плачу частіше, ніж раніше.' },
    { score: 2, text: 'Я плачу через кожну дрібницю.' },
    { score: 3, text: 'Я відчуваю бажання плакати, але не можу.' }
  ]},
  { id: 11, title: 'Неспокій (агітація)', options: [
    { score: 0, text: 'Я не більш неспокійний і не напружений, ніж зазвичай.' },
    { score: 1, text: 'Я відчуваю себе більш неспокійним і напруженим.' },
    { score: 2, text: 'Я настільки неспокійний, що мені важко всидіти на місці.' },
    { score: 3, text: 'Я настільки неспокійний, що постійно рухаюся або щось роблю.' }
  ]},
  { id: 12, title: 'Втрата інтересу', options: [
    { score: 0, text: 'Я не втратив інтересу до інших людей чи занять.' },
    { score: 1, text: 'Я менш зацікавлений у людях чи речах, ніж раніше.' },
    { score: 2, text: 'Я втратив більшість своїх інтересів.' },
    { score: 3, text: 'Мені взагалі нічого не цікаво.' }
  ]},
  { id: 13, title: 'Нешучість', options: [
    { score: 0, text: 'Я приймаю рішення так само добре, як і завжди.' },
    { score: 1, text: 'Мені важче приймати рішення, ніж зазвичай.' },
    { score: 2, text: 'Мені набагато важче приймати рішення, ніж раніше.' },
    { score: 3, text: 'Я взагалі не можу приймати жодних рішень.' }
  ]},
  { id: 14, title: 'Відчуття власної нікчемності', options: [
    { score: 0, text: 'Я не відчуваю себе нікчемним.' },
    { score: 1, text: 'Я не вважаю себе таким же корисним, як раніше.' },
    { score: 2, text: 'Я відчуваю себе менш цінним у порівнянні з іншими.' },
    { score: 3, text: 'Я відчуваю себе абсолютно нікчемним.' }
  ]},
  { id: 15, title: 'Втрата енергії', options: [
    { score: 0, text: 'У мене стільки ж енергії, як і завжди.' },
    { score: 1, text: 'У мене менше енергії, ніж раніше.' },
    { score: 2, text: 'У мене не вистачає енергії робити багато речей.' },
    { score: 3, text: 'У мене немає енергії робити будь-що.' }
  ]},
  { id: 16, title: 'Зміни сну', options: [
    { score: 0, text: 'Мій сон не змінився.' },
    { score: 1, text: 'Я сплю трохи більше/менше, ніж зазвичай.' },
    { score: 2, text: 'Я сплю набагато більше/менше, ніж зазвичай.' },
    { score: 3, text: 'Я сплю більшість дня / прокидаюся рано і не можу заснути.' }
  ]},
  { id: 17, title: 'Дратівливість', options: [
    { score: 0, text: 'Я не більш дратівливий, ніж зазвичай.' },
    { score: 1, text: 'Я більш дратівливий, ніж зазвичай.' },
    { score: 2, text: 'Я набагато більш дратівливий, ніж зазвичай.' },
    { score: 3, text: 'Я постійно відчуваю дратівливість.' }
  ]},
  { id: 18, title: 'Зміни апетиту', options: [
    { score: 0, text: 'Мій апетит не змінився.' },
    { score: 1, text: 'Мій апетит трохи гірший/кращий, ніж зазвичай.' },
    { score: 2, text: 'Мій апетит набагато гірший/кращий, ніж раніше.' },
    { score: 3, text: 'У мене взагалі немає апетиту / Я постійно хочу їсти.' }
  ]},
  { id: 19, title: 'Труднощі з концентрацією', options: [
    { score: 0, text: 'Я можу концентруватися так само добре, як завжди.' },
    { score: 1, text: 'Я не можу концентруватися так само добре, як зазвичай.' },
    { score: 2, text: 'Мені важко зосередитися на чомусь довго.' },
    { score: 3, text: 'Я виявив, що взагалі не можу ні на чому зосередитися.' }
  ]},
  { id: 20, title: 'Втома', options: [
    { score: 0, text: 'Я не втомлююся більше, ніж зазвичай.' },
    { score: 1, text: 'Я втомлююся швидше, ніж зазвичай.' },
    { score: 2, text: 'Я занадто втомлений, щоб робити багато речей, які робив раніше.' },
    { score: 3, text: 'Я занадто втомлений, щоб робити більшість справ.' }
  ]},
  { id: 21, title: 'Втрата лібідо', options: [
    { score: 0, text: 'Я не помітив жодних змін у своєму інтересі до сексу.' },
    { score: 1, text: 'Я менш зацікавлений у сексі, ніж раніше.' },
    { score: 2, text: 'Мій інтерес до сексу значно знизився.' },
    { score: 3, text: 'Я повністю втратив інтерес до сексу.' }
  ]}
];

export default function BeckTest() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rawScore, setRawScore] = useState(0);

  const handleSelect = (qId, score, text) => {
    setAnswers({ ...answers, [qId]: { score, text } });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // 1. Рахуємо класичний бал
    const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
    setRawScore(totalScore);

    // 2. Формуємо текст відповідей для AI (особливо важливі питання з балом > 0)
    const answersSummary = Object.entries(answers)
      .filter(([_, data]) => data.score > 0)
      .map(([id, data]) => `Питання ${id}: ${data.text} (Бал: ${data.score})`)
      .join('; ');

    try {
      const response = await fetch('http://localhost:8000/api/analyze-beck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total_score: totalScore, answers_summary: answersSummary }),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error(error);
      alert('Помилка аналізу. Перевірте бекенд.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = Object.keys(answers).length === BECK_QUESTIONS.length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <button onClick={() => result ? setResult(null) : navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 font-medium">
        <FaArrowLeft /> {result ? 'Повернутися до тесту' : 'На головну'}
      </button>

      {!result ? (
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Шкала депресії Бека (BDI)</h1>
          <p className="text-slate-500 mb-10 text-lg">Оберіть одне твердження в кожній групі, яке найкраще описує ваш стан за останній тиждень.</p>

          <div className="space-y-12">
            {BECK_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">{q.id}. {q.title}</h3>
                <div className="flex flex-col gap-3">
                  {q.options.map((opt, i) => (
                    <label key={i} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${answers[q.id]?.score === opt.score ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-300 bg-white'}`}>
                      <input 
                        type="radio" name={`question-${q.id}`} 
                        checked={answers[q.id]?.score === opt.score}
                        onChange={() => handleSelect(q.id, opt.score, opt.text)}
                        className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 font-medium">{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleSubmit} disabled={!isComplete || loading}
            className="w-full mt-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-[2rem] text-xl transition-all shadow-xl disabled:opacity-50 flex justify-center items-center gap-3"
          >
            {loading ? 'AI Аналізує результати...' : 'Отримати клінічний висновок'}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-slide-up pb-20">
          {/* Блок результату */}
          <div className={`p-12 rounded-[3.5rem] shadow-2xl text-white ${rawScore > 19 ? 'bg-rose-600' : rawScore > 13 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-white/20 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest">BDI Score</span>
              <span className="text-7xl font-black">{rawScore}<span className="text-3xl opacity-50">/63</span></span>
            </div>
            <h2 className="text-4xl font-medium leading-tight">"{result?.severity_label}"</h2>
          </div>

          {/* Висновок AI */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><FaUserMd className="text-indigo-600"/> Клінічне резюме AI</h3>
            <p className="text-lg text-slate-600 leading-relaxed">{result?.clinical_summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Маркери */}
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl space-y-6">
              <h4 className="text-lg font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><FaExclamationTriangle className="text-rose-400"/> Маркери ризику</h4>
              <ul className="space-y-4">
                {(result?.risk_markers || []).map((m, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white/10 p-4 rounded-2xl"><span className="text-rose-400 font-bold">•</span> {m}</li>
                ))}
              </ul>
            </div>

            {/* План дій */}
            <div className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 space-y-6">
              <h4 className="text-lg font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2"><FaListUl/> План дій</h4>
              <div className="space-y-4">
                {(result?.action_plan || []).map((step, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl shadow-sm text-slate-700 font-medium flex gap-4 items-center">
                    <div className="bg-indigo-100 text-indigo-600 w-8 h-8 flex items-center justify-center rounded-full font-black flex-shrink-0">{i+1}</div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}