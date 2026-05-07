import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaBolt, FaBrain, FaChartLine, FaLock, FaClipboardList, FaPenFancy, FaListUl, FaShieldAlt } from 'react-icons/fa';

export default function GuestHome() {
  const navigate = useNavigate();

  const tests = [
    {
      icon: <FaClipboardList size={28} />,
      title: "Первинне інтерв'ю",
      description: 'Швидке входження в стан клієнта: запит, симптоми, тригери і ресурсність.',
      tag: 'Базовий старт',
      path: '/primary-interview',
    },
    {
      icon: <FaPenFancy size={28} />,
      title: 'Незакінчені речення',
      description: 'Проективна методика для глибинних патернів, цінностей і прихованого напруження.',
      tag: 'Глибинний шар',
      path: '/sentences',
    },
    {
      icon: <FaListUl size={28} />,
      title: 'Шкала Бека',
      description: 'Стандартизована оцінка депресивної симптоматики для об\'єктивного моніторингу.',
      tag: 'Клінічна точність',
      path: '/beck',
    },
    {
      icon: <FaShieldAlt size={28} />,
      title: 'Копінг-стратегії',
      description: 'Діагностика стилю подолання стресу: вирішення проблем, підтримка або уникнення.',
      tag: 'Стрес-профіль',
      path: '/coping',
    },
  ];

  return (
    <div className="pt-24 pb-10 overflow-hidden">
      <section className="relative max-w-[1380px] mx-auto px-4 md:px-8">
        <div className="edge-frame relative rounded-[2.2rem] overflow-hidden border border-white/10 bg-black">
          <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />
          <div className="relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-0">
            <div className="p-7 md:p-12 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 text-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] mono-ui">
                <FaBolt /> clinical intelligence core
              </div>

              <h1 className="brand-display text-5xl md:text-7xl text-white font-bold leading-[0.95] mt-7 max-w-4xl">
                The new way
                <br />
                to connect
                <br />
                people & care
              </h1>

              <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl mt-6">
                PSY-AI перетворює тести, записи та діалоги на читабельну клінічну карту.
                Менше хаосу в даних, більше рішень для фахівця.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-9">
                <button
                  onClick={() => navigate('/auth')}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-7 py-4 font-extrabold transition-all"
                >
                  Start now <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => document.getElementById('methods')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center rounded-xl bg-transparent border border-white/25 px-7 py-4 font-extrabold text-white hover:bg-white/10 transition-colors"
                >
                  View methods
                </button>
              </div>
            </div>

            <div className="p-7 md:p-10 bg-gradient-to-br from-[#11131a] to-[#0d0f14]">
              <div className="space-y-4">
                <div className="rounded-[1.4rem] bg-white text-black p-5 border border-white/60">
                  <p className="text-[10px] uppercase tracking-[0.2em] mono-ui text-slate-500 mb-2">AI Status</p>
                  <p className="text-4xl brand-display font-black">24/7</p>
                  <p className="text-slate-700 mt-2 text-sm">Інтерпретація результатів доступна у реальному часі.</p>
                </div>

                <div className="rounded-[1.4rem] bg-[#ff204e] text-white p-5 border border-white/15">
                  <p className="text-[10px] uppercase tracking-[0.2em] mono-ui text-white/70 mb-2">Data Model</p>
                  <p className="text-4xl brand-display font-black">JSON</p>
                  <p className="text-white/90 mt-2 text-sm">Структурований звіт для психолога без зайвого шуму.</p>
                </div>

                <div className="rounded-[1.4rem] bg-[#171a21] text-white p-5 border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] mono-ui text-slate-400 mb-3">Core values</p>
                  <div className="grid grid-cols-3 gap-3 text-sm font-bold">
                    <div className="bg-black/35 rounded-xl p-3 text-center"><FaBrain className="mx-auto mb-2" /> Insight</div>
                    <div className="bg-black/35 rounded-xl p-3 text-center"><FaLock className="mx-auto mb-2" /> Privacy</div>
                    <div className="bg-black/35 rounded-xl p-3 text-center"><FaChartLine className="mx-auto mb-2" /> Dynamics</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="methods" className="max-w-[1380px] mx-auto px-4 md:px-8 pt-12 pb-12">
        <div className="mb-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/70 mb-2 mono-ui">Methods</p>
          <h2 className="brand-display text-4xl md:text-6xl font-bold text-white">Інструменти для повної картини стану</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tests.map((test, index) => (
            <button
              key={test.title}
              onClick={() => navigate(test.path)}
              className={`appear-up delay-${index + 1} text-left rounded-[1.8rem] p-6 bg-white border border-black/15 hover:-translate-y-1 transition-all shadow-xl group`}
            >
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                {test.icon}
              </div>
              <div className="inline-block text-[10px] uppercase tracking-[0.18em] font-extrabold px-3 py-1 rounded-full bg-[#fff3c4] text-[#6a5300] border border-[#f0dc8a] mb-4 mono-ui">
                {test.tag}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">{test.title}</h3>
              <p className="text-slate-600 leading-relaxed">{test.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 font-bold text-teal-700">Open <FaArrowRight className="group-hover:translate-x-1 transition-transform" /></div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
