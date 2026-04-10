// src/pages/PatientProfile.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaFileMedicalAlt, FaComments, FaPaperPlane, 
  FaCheck, FaSmile, FaPaperclip, FaMicrophone, FaEllipsisV, FaChevronRight, FaUserEdit
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react'; 
import ResultsDisplay from '../components/ResultsDisplay';

export default function PatientProfile() {
  const { id: patientId } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('clinical'); 
  const [patient, setPatient] = useState({ name: 'Завантаження...', email: '', age: '' });
  
  const [testResults, setTestResults] = useState([]); 
  const [selectedTest, setSelectedTest] = useState(null); 

  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]); 
  const [showEmoji, setShowEmoji] = useState(false); 
  const messagesEndRef = useRef(null);
  
  const myId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    fetch(`http://localhost:8000/api/user/${patientId}`)
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setPatient(data.data); });

    fetch(`http://localhost:8000/api/test-results/${patientId}`)
      .then(res => res.json())
      .then(data => { if (data.status === 'success') setTestResults(data.data); });
  }, [patientId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!myId || !patientId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/messages/${myId}/${patientId}`);
        const data = await res.json();
        if (data.status === 'success') setMessages(data.data);
      } catch (error) { console.error(error); }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [myId, patientId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;
    const textToSend = chatMessage;
    setChatMessage(''); setShowEmoji(false);
    try {
      await fetch('http://localhost:8000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: myId, receiver_id: parseInt(patientId), text: textToSend }),
      });
    } catch (error) { console.error(error); }
  };

  const onEmojiClick = (emojiObject) => setChatMessage(prev => prev + emojiObject.emoji);

  const renderRawAnswers = (rawAnswers) => {
    if (!rawAnswers || rawAnswers.length === 0) return null;
    return (
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 mt-8 shadow-sm">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <FaUserEdit className="text-indigo-400 text-lg" /> Оригінальні відповіді клієнта
        </h4>
        <div className="space-y-4">
          {rawAnswers.map((qa, i) => (
            <div key={i} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
              <div className="text-slate-500 text-sm font-bold mb-1">{qa.question}</div>
              <div className="text-indigo-900 font-medium italic text-lg">"{qa.answer}"</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // РОЗУМНА ФУНКЦІЯ ВІДМАЛЬОВКИ ДЕТАЛЕЙ ТЕСТУ
  const renderDetailedTest = (test) => {
    try {
      const parsed = JSON.parse(test.ai_response);
      const rawAnswersBlock = renderRawAnswers(parsed.raw_answers);

      // ==========================================================
      // СПЕЦІАЛЬНИЙ ДИЗАЙН: ШКАЛА БЕКА (З ГРАФІКОМ)
      // ==========================================================
      if (test.test_type === 'Шкала депресії Бека' && parsed.profile) {
        const score = parsed.profile["Загальний бал"] || 0;
        const level = parsed.profile["Клінічний рівень"] || "Невідомо";
        const summary = parsed.profile["Аналітичне резюме AI"] || "";
        const recs = parsed.profile["Рекомендації для терапії"] || [];

        // Вираховуємо відсоток для графіку (макс бал 63)
        const percentage = Math.min((score / 63) * 100, 100);
        
        // Визначаємо колірну гаму залежно від тяжкості
        let colorClass = "bg-emerald-500"; let bgColorClass = "bg-emerald-50"; let textColorClass = "text-emerald-700"; let borderColorClass = "border-emerald-200";
        if (score >= 10 && score <= 15) { colorClass = "bg-amber-500"; bgColorClass = "bg-amber-50"; textColorClass = "text-amber-700"; borderColorClass = "border-amber-200"; }
        else if (score >= 16 && score <= 19) { colorClass = "bg-orange-500"; bgColorClass = "bg-orange-50"; textColorClass = "text-orange-700"; borderColorClass = "border-orange-200"; }
        else if (score >= 20 && score <= 29) { colorClass = "bg-rose-500"; bgColorClass = "bg-rose-50"; textColorClass = "text-rose-700"; borderColorClass = "border-rose-200"; }
        else if (score >= 30) { colorClass = "bg-purple-600"; bgColorClass = "bg-purple-50"; textColorClass = "text-purple-700"; borderColorClass = "border-purple-200"; }

        return (
          <div className="animate-fade-in pb-10 space-y-6 mt-6">
            
            {/* Блок з графіком */}
            <div className={`${bgColorClass} p-8 rounded-[2.5rem] border ${borderColorClass} shadow-sm relative overflow-hidden`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <p className={`text-sm font-black uppercase tracking-widest opacity-70 mb-2 ${textColorClass}`}>Загальний бал</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-7xl font-black ${textColorClass} leading-none`}>{score}</span>
                    <span className={`text-2xl font-bold opacity-50 ${textColorClass}`}>/ 63</span>
                  </div>
                </div>
                <div className={`text-xl font-black ${textColorClass} bg-white/60 px-6 py-3 rounded-2xl backdrop-blur-sm border ${borderColorClass} shadow-sm`}>
                  {level}
                </div>
              </div>

              {/* Індикатор тяжкості (Progress Bar) */}
              <div className="h-5 w-full bg-white/60 rounded-full overflow-hidden mt-6 shadow-inner relative">
                <div className={`absolute top-0 left-0 h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
              </div>
              
              {/* Підписи до графіку */}
              <div className={`flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60 mt-3 px-1 ${textColorClass}`}>
                <span>0</span>
                <span className="hidden sm:inline">10 (Легка)</span>
                <span className="hidden sm:inline">16 (Помірна)</span>
                <span className="hidden sm:inline">20 (Виражена)</span>
                <span>30+ (Тяжка)</span>
                <span>63</span>
              </div>
            </div>

            {/* AI Аналітика */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div> Аналітичне резюме AI
                </h4>
                <p className="text-slate-700 text-lg leading-relaxed font-medium">{summary}</p>
              </div>

              <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100/50 shadow-sm">
                <h4 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Рекомендації для терапії
                </h4>
                <div className="flex flex-col gap-3">
                  {Array.isArray(recs) ? recs.map((rec, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-indigo-400 font-bold mt-1">•</span>
                      <span className="text-indigo-900 font-medium leading-relaxed">{rec}</span>
                    </div>
                  )) : <p className="text-indigo-900 font-medium">{recs}</p>}
                </div>
              </div>
            </div>

            {/* Оригінальні відповіді (Слово в слово) */}
            {rawAnswersBlock}
          </div>
        );
      }
      // ==========================================================

      // Варіант: Якщо є графіки (Сакс-Леві)
      if (parsed.metrics && parsed.profile) {
        return (
          <div className="animate-fade-in pb-10">
            <div className="-mx-4 md:-mx-8 mt-6">
              <ResultsDisplay metrics={parsed.metrics} profile={parsed.profile} />
            </div>
            {rawAnswersBlock}
          </div>
        );
      }

      // Варіант: Дефолтний дизайн для Інтерв'ю та інших тестів
      if (parsed.profile) {
        return (
          <div className="animate-fade-in pb-10">
            <div className="space-y-6 mt-8">
              {Object.entries(parsed.profile).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div> {key}
                  </h4>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-3">
                      {value.map((item, i) => <span key={i} className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold shadow-sm">{item}</span>)}
                    </div>
                  ) : value !== null && typeof value === 'object' ? (
                    <pre className="text-sm bg-white p-4 rounded-xl border border-slate-200">{JSON.stringify(value, null, 2)}</pre>
                  ) : (
                    <p className="text-slate-700 text-lg leading-relaxed font-medium">
                      {value} {typeof value === 'number' && <span className="text-slate-400 font-bold ml-1">/ 10</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {rawAnswersBlock} 
          </div>
        );
      }

      return <pre className="bg-slate-50 p-6 rounded-2xl overflow-auto">{JSON.stringify(parsed, null, 2)}</pre>;

    } catch (e) {
      return <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 whitespace-pre-wrap text-slate-700 text-lg leading-relaxed mt-6">{test.ai_response}</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in mb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
          <FaArrowLeft /> Назад до списку
        </button>
        <div className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-slate-200 flex items-center gap-2">
          <FaCheck className="text-emerald-500" /> Профіль активний
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[75vh]">
        <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col z-10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-white text-indigo-600 rounded-full flex items-center justify-center text-4xl font-black shadow-sm mb-4 border border-slate-100">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-slate-800">{patient.name}</h2>
            <p className="text-slate-500 font-medium mb-2">{patient.email}</p>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-slate-400 border border-slate-100">Вік: {patient.age}</span>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setActiveTab('clinical'); setSelectedTest(null); }} className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'clinical' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'}`}>
              <FaFileMedicalAlt className="text-xl" /> Клінічна картина
            </button>
            <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-100'}`}>
              <FaComments className="text-xl" /> Нотатки / Чат
            </button>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col bg-white">
          {activeTab === 'clinical' && (
            <div className="p-8 animate-fade-in space-y-6 h-full overflow-y-auto max-h-[75vh]">
              {!selectedTest ? (
                <>
                  <h3 className="text-2xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-6">Історія тестувань</h3>
                  {testResults.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center"><p className="text-slate-500 font-medium">Клієнт ще не проходив тестування.</p></div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {testResults.map((test) => (
                        <div key={test.id} onClick={() => setSelectedTest(test)} className="cursor-pointer bg-white border border-slate-200 p-5 rounded-3xl flex justify-between items-center shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><FaFileMedicalAlt /></div>
                            <div>
                              <div className="font-black text-slate-800 text-lg md:text-xl">{test.test_type}</div>
                              <div className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Пройдено: {test.date}</div>
                            </div>
                          </div>
                          <button className="hidden md:flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-5 py-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">Відкрити <FaChevronRight className="text-sm" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-fade-in pb-10">
                   <button onClick={() => setSelectedTest(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100 hover:border-indigo-100"><FaArrowLeft /> До списку тестів</button>
                   <div className="border-b border-slate-100 pb-6 mb-6">
                      <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 inline-block mb-3">AI ЗВІТ</div>
                      <h2 className="text-3xl font-black text-slate-800">{selectedTest.test_type}</h2>
                      <p className="text-slate-500 mt-2 font-medium">Результати від {selectedTest.date}</p>
                   </div>
                   {renderDetailedTest(selectedTest)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full animate-fade-in bg-[#e5ddd5] relative">
              <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between z-20"><h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><FaComments className="text-indigo-500" /> Захищений чат</h3></div>
              <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-3 relative z-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", backgroundBlendMode: 'overlay', backgroundColor: '#e5ddd5' }}>
                <div className="text-center my-2"><span className="bg-slate-400/20 text-slate-600 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Сьогодні</span></div>
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 font-medium text-center bg-white/50 rounded-3xl p-6 mx-auto mt-10 backdrop-blur-sm">Історія порожня.<br/>Напишіть клієнту перше повідомлення.</div>
                ) : (
                  messages.map((msg) => {
                    const isMyMsg = msg.sender_id === myId;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}>
                        <div className={`relative max-w-[85%] md:max-w-[70%] px-4 py-2 text-[15px] shadow-sm flex flex-col ${isMyMsg ? 'bg-indigo-100 text-slate-800 rounded-2xl rounded-tr-sm' : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                          <span className="pr-10 pb-1">{msg.text}</span>
                          <span className={`text-[10px] absolute bottom-1 right-2 ${isMyMsg ? 'text-indigo-400' : 'text-slate-400'}`}>{msg.time}</span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              {showEmoji && <div className="absolute bottom-[80px] left-4 z-30 shadow-2xl animate-fade-in"><EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} /></div>}
              <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2 z-20">
                <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="text-slate-500 hover:text-indigo-600 text-2xl p-2"><FaSmile /></button>
                <form onSubmit={handleSendMessage} className="flex-grow flex items-center">
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Напишіть повідомлення..." className="w-full bg-white border-none rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm" />
                </form>
                <button onClick={handleSendMessage} disabled={!chatMessage.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg ml-2"><FaPaperPlane className="ml-[-2px]" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}