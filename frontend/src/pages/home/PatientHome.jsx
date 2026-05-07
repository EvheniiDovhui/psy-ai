import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaClipboardList, FaComments, FaShieldAlt, FaUserMd, FaCheckCircle } from 'react-icons/fa';

export default function PatientHome() {
  const navigate = useNavigate();

  const quickActions = [
    { title: "Первинне інтерв'ю", path: '/primary-interview', icon: <FaClipboardList /> },
    { title: 'Незакінчені речення', path: '/sentences', icon: <FaClipboardList /> },
    { title: 'Шкала Бека', path: '/beck', icon: <FaClipboardList /> },
    { title: 'Копінг-стратегії', path: '/coping', icon: <FaShieldAlt /> },
  ];

  return (
    <div className="pt-24 pb-12">
      <section className="max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="rounded-[2.2rem] border border-white/10 bg-[#0f1219] p-7 md:p-10 edge-frame">
          <p className="mono-ui text-[11px] uppercase tracking-[0.22em] text-white/70 mb-3">Patient Home</p>
          <h1 className="brand-display text-4xl md:text-6xl font-bold text-white leading-[1.02] max-w-4xl">
            Ваш фокус сьогодні:
            <span className="hero-gradient-text"> стабілізація, рефлексія, рух вперед</span>
          </h1>
          <p className="text-slate-300 text-lg mt-5 max-w-3xl">
            Запускайте тести, відстежуйте динаміку і передавайте результати фахівцю без зайвих дій.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <button onClick={() => navigate('/dashboard')} className="rounded-2xl bg-white text-black p-5 text-left border border-white/60 hover:-translate-y-0.5 transition-transform">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-slate-500 mb-2">кабінет</div>
              <div className="text-2xl font-black">Моя панель</div>
              <div className="mt-2 text-slate-600 font-medium">Результати, профіль, історія.</div>
            </button>
            <button onClick={() => navigate('/chat')} className="rounded-2xl bg-[#1a1f2a] text-white p-5 text-left border border-white/15 hover:-translate-y-0.5 transition-transform">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-white/60 mb-2">чат</div>
              <div className="text-2xl font-black flex items-center gap-2"><FaComments /> Зв\'язок</div>
              <div className="mt-2 text-white/70 font-medium">Напрямий канал з вашим фахівцем.</div>
            </button>
            <button onClick={() => navigate('/specialists')} className="rounded-2xl bg-[#ff204e] text-white p-5 text-left border border-white/15 hover:-translate-y-0.5 transition-transform">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-white/70 mb-2">фахівці</div>
              <div className="text-2xl font-black flex items-center gap-2"><FaUserMd /> Мій фахівець</div>
              <div className="mt-2 text-white/90 font-medium">Обрати або змінити ведучого психолога.</div>
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10">
        <h2 className="text-white brand-display text-3xl md:text-4xl font-bold mb-5">Швидкий старт тестування</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="rounded-2xl border border-white/12 bg-[#131722] p-5 text-left hover:bg-[#171c29] transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center mb-4">{item.icon}</div>
              <div className="text-white font-black text-lg">{item.title}</div>
              <div className="mt-3 text-teal-300 font-bold inline-flex items-center gap-2">Відкрити <FaArrowRight /></div>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/50 p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black uppercase mono-ui tracking-[0.2em]">
            <FaCheckCircle /> Підказка
          </div>
          <p className="mt-3 text-slate-300 text-lg leading-relaxed">
            Почніть з <b className="text-white">Первинного інтерв\'ю</b>, а потім додайте <b className="text-white">Копінг-стратегії</b> для більш цілісної картини.
          </p>
        </div>
      </section>
    </div>
  );
}
