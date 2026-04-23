// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaBolt, FaBrain, FaChartLine, FaCheckCircle, FaClipboardList, FaListUl, FaLock, FaPenFancy, FaShieldAlt } from 'react-icons/fa';

export default function Home() {
  const navigate = useNavigate();

  const tests = [
    {
      icon: <FaClipboardList size={28} />,
      title: "Первинне інтерв'ю",
      description: "Швидке входження в стан клієнта: запит, симптоми, тригери і ресурсність.",
      tag: "Базовий старт",
      path: '/primary-interview',
    },
    {
      icon: <FaPenFancy size={28} />,
      title: "Незакінчені речення",
      description: "Проективна методика для глибинних патернів, цінностей і прихованого напруження.",
      tag: "Глибинний шар",
      path: '/sentences',
    },
    {
      icon: <FaListUl size={28} />,
      title: "Шкала Бека",
      description: "Стандартизована оцінка депресивної симптоматики для об'єктивного моніторингу.",
      tag: "Клінічна точність",
      path: '/beck',
    },
    {
      icon: <FaShieldAlt size={28} />,
      title: "Копінг-стратегії",
      description: "Діагностика домінуючого стилю подолання стресу: вирішення проблем, підтримка або уникнення.",
      tag: "Стрес-профіль",
      path: '/coping',
    }
  ];

  return (
    <div className="pt-24 pb-10 overflow-hidden">
      <section className="relative max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="absolute inset-0 hero-grid opacity-35 pointer-events-none rounded-[2.8rem]"></div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center glass-surface soft-shadow rounded-[2.8rem] p-6 md:p-10 lg:p-14">
          <div className="space-y-7 appear-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em]">
              <FaBolt /> AI Clinical Compass
            </div>

            <h1 className="brand-display text-4xl md:text-6xl text-slate-900 font-bold leading-[1.02]">
              Нова ера
              <span className="hero-gradient-text"> психологічного </span>
              аналізу в одному просторі
            </h1>

            <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl">
              PSY-AI поєднує клінічні методики, структурований AI-аналіз і робочий кабінет фахівця, щоб допомога ставала швидшою, точнішою і людянішою.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white px-7 py-4 font-extrabold transition-all shadow-lg shadow-teal-900/20"
              >
                Почати зараз <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => document.getElementById('methods')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-7 py-4 font-extrabold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Подивитись методики
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 appear-up delay-2">
            <div className="rounded-3xl bg-slate-900 text-white p-6 min-h-[170px]">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300 font-bold mb-3">Стан AI</div>
              <div className="text-4xl brand-display font-bold mb-2">24/7</div>
              <p className="text-slate-300 text-sm">Аналіз доступний у будь-який момент, без очікування черги.</p>
            </div>

            <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 min-h-[170px]">
              <div className="text-xs uppercase tracking-[0.18em] text-amber-700 font-bold mb-3">Звіт</div>
              <div className="text-4xl brand-display font-bold mb-2 text-amber-900">JSON</div>
              <p className="text-amber-800 text-sm">Структурована відповідь для лікаря, чітка та зручна для інтерпретації.</p>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:col-span-2 min-h-[190px]">
              <div className="flex items-center gap-2 text-teal-700 font-bold uppercase text-xs tracking-[0.18em] mb-4">
                <FaCheckCircle /> Переваги платформи
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <FaBrain className="text-teal-700 mb-2" />
                  <div className="font-bold text-slate-800">Контекстний аналіз</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <FaLock className="text-teal-700 mb-2" />
                  <div className="font-bold text-slate-800">Захист персональних даних</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <FaChartLine className="text-teal-700 mb-2" />
                  <div className="font-bold text-slate-800">Трекінг динаміки стану</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="methods" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-16 pb-14">
        <div className="mb-10 appear-up delay-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-teal-700 mb-2">Модулі</p>
          <h2 className="brand-display text-3xl md:text-5xl font-bold text-slate-900">Методики, які працюють в парі з фахівцем</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tests.map((test, index) => (
            <button
              key={test.title}
              onClick={() => navigate(test.path)}
              className={`appear-up delay-${index + 1} text-left rounded-[2rem] p-6 bg-white border border-slate-200 hover:border-teal-400 hover:-translate-y-1 transition-all soft-shadow group`}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                {test.icon}
              </div>
              <div className="inline-block text-[10px] uppercase tracking-[0.18em] font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mb-4">
                {test.tag}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{test.title}</h3>
              <p className="text-slate-600 leading-relaxed">{test.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 font-bold text-teal-700">Відкрити <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></div>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pb-8">
        <div className="rounded-[2.4rem] bg-slate-900 text-white p-7 md:p-10 flex flex-col lg:flex-row gap-7 lg:items-center lg:justify-between soft-shadow">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-slate-400 font-extrabold mb-2">Ready</p>
            <h3 className="brand-display text-3xl md:text-4xl font-bold">Побудуй свій профіль вже сьогодні</h3>
            <p className="text-slate-300 mt-3 max-w-2xl">Запусти перший тест, отримай структуру стану та передай результат фахівцю в один клік.</p>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-900 font-extrabold px-7 py-4 hover:bg-amber-100 transition-colors"
          >
            Створити профіль <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
}