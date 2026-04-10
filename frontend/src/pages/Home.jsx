// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaPenFancy, FaListUl, FaBrain, FaArrowRight, FaLock, FaBolt, FaChartLine } from 'react-icons/fa';
import TestCard from '../components/TestCard';

export default function Home() {
  const navigate = useNavigate();

  const tests = [
    {
      icon: <FaClipboardList size={28} />,
      title: "Первинне інтерв'ю",
      description: "Базовий опитувальник для збору інформації про ваш поточний психоемоційний стан, основні скарги та запит.",
      color: "indigo"
    },
    {
      icon: <FaPenFancy size={28} />,
      title: "Незакінчені речення",
      description: "Проективна методика, яка допоможе виявити приховані переживання, ставлення до себе, родини та оточуючих.",
      color: "emerald"
    },
    {
      icon: <FaListUl size={28} />,
      title: "Шкала Бека",
      description: "Стандартизований тест з глибинним AI-аналізом рівня депресії та вашого загального емоційного стану.",
      color: "rose"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-inter pt-20"> {/* pt-20 компенсує fixed header */}
      
      {/* HERO БЛОК */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Фоновий паттерн */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4F46E5 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10">
          <div className="inline-block bg-white text-indigo-600 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-slate-200 shadow-sm">
            PSY-AI Платформа
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
            Ваш інтелектуальний <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">психологічний портал</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Оберіть методику для проходження. Нейромережі проаналізують ваші відповіді та створять точний клінічний профіль для вашого терапевта.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/auth')}
              className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20"
            >
              Створити акаунт <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('tests-section').scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center justify-center gap-3 bg-white text-slate-700 px-10 py-5 rounded-2xl text-lg font-bold transition-all border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            >
              Переглянути тести
            </button>
          </div>
        </div>
      </section>

      {/* БЛОК ПЕРЕВАГ */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0"><FaBolt /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Миттєвий аналіз</h3>
              <p className="text-slate-500 font-medium leading-relaxed">ШІ обробляє результати за секунди, виявляючи приховані патерни.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0"><FaLock /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Конфіденційність</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Дані зашифровані та доступні виключно вам і вашому терапевту.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl shrink-0"><FaChartLine /></div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Клінічна точність</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Розрахунок метрик складності та підготовка професійного резюме.</p>
            </div>
          </div>
        </div>
      </section>

      {/* БЛОК ТЕСТІВ */}
      <section id="tests-section" className="py-24 max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Доступні методики</h2>
          <p className="text-slate-500 font-medium text-lg">Оберіть тест, призначений вашим фахівцем</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tests.map((test, index) => (
            <div key={index} onClick={() => {
              if (index === 0) navigate('/primary-interview');
              if (index === 1) navigate('/sentences');
              if (index === 2) navigate('/beck');
            }} className="cursor-pointer">
              <TestCard {...test} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}