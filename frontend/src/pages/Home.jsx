// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { FaClipboardList, FaPenNib, FaListAlt } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="animate-fade-in px-4 py-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Психологічний портал
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          Оберіть тест для проходження. Ваші відповіді конфіденційні та допоможуть ШІ створити точний клінічний профіль вашого стану.
        </p>
      </div>

      {/* Змінили сітку на 3 колонки (lg:grid-cols-3) і розширили контейнер (max-w-6xl) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Картка 1: Інтерв'ю */}
        <Link 
          to="/interview" 
          className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
            <FaClipboardList className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Первинне інтерв'ю</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Базовий опитувальник для збору інформації про ваш поточний психоемоційний стан, основні скарги та запит.
          </p>
        </Link>

        {/* Картка 2: Незакінчені речення */}
        <Link 
          to="/sentences" 
          className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 hover:border-teal-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
            <FaPenNib className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Незакінчені речення</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Проєктивна методика, яка допоможе виявити приховані переживання, ставлення до себе, родини та оточуючих.
          </p>
        </Link>

        {/* Картка 3: Шкала Бека */}
        <Link 
          to="/beck-test"
          className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 hover:border-rose-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
            <FaListAlt className="text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Шкала Бека</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Стандартизований тест (21 питання) з глибинним AI-аналізом рівня депресії та емоційного стану.
          </p>
        </Link>

      </div>
    </div>
  );
}