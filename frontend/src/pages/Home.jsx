// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { FaClipboardList, FaPenNib } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Психологічне тестування
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Оберіть тест для проходження. Ваші відповіді залишаться конфіденційними та допоможуть краще зрозуміти ваш поточний стан.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Картка 1 */}
        <Link 
          to="/interview" 
          className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FaClipboardList className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Первинне інтерв'ю</h2>
          <p className="text-slate-600">
            Базовий опитувальник для збору інформації про ваш поточний психоемоційний стан, основні скарги та запит.
          </p>
        </Link>

        {/* Картка 2 */}
        <Link 
          to="/sentences" 
          className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:teal-300 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FaPenNib className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Незакінчені речення</h2>
          <p className="text-slate-600">
            Проєктивна методика, яка допоможе виявити приховані переживання, ставлення до себе, родини та оточуючих.
          </p>
        </Link>
      </div>
    </div>
  );
}