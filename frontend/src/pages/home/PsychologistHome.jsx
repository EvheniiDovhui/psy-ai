import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaUsers, FaChartLine, FaMicrophone, FaBrain, FaClipboardList } from 'react-icons/fa';

export default function PsychologistHome() {
  const navigate = useNavigate();

  return (
    <div className="pt-24 pb-12">
      <section className="max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="rounded-[2.2rem] border border-white/10 bg-[#0f1118] p-7 md:p-10 edge-frame">
          <p className="mono-ui text-[11px] uppercase tracking-[0.22em] text-white/70 mb-3">Psychologist Home</p>
          <h1 className="brand-display text-4xl md:text-6xl font-bold text-white leading-[1.02] max-w-4xl">
            Робочий центр фахівця:
            <span className="hero-gradient-text"> швидше бачити, точніше вирішувати</span>
          </h1>
          <p className="text-slate-300 text-lg mt-5 max-w-3xl">
            Весь контекст клієнта в одному місці: історія тестів, повний AI-профіль, чат і live-сесія.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <button onClick={() => navigate('/dashboard')} className="rounded-2xl bg-white text-black p-5 text-left border border-white/60 hover:-translate-y-0.5 transition-transform">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-slate-500 mb-2">dashboard</div>
              <div className="text-2xl font-black flex items-center gap-2"><FaUsers /> Пацієнти</div>
              <div className="mt-2 text-slate-600 font-medium">Картки, статуси, призначення.</div>
            </button>

            <button onClick={() => navigate('/live-session')} className="rounded-2xl bg-[#ff204e] text-white p-5 text-left border border-white/15 hover:-translate-y-0.5 transition-transform">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-white/70 mb-2">live</div>
              <div className="text-2xl font-black flex items-center gap-2"><FaMicrophone /> Сесія</div>
              <div className="mt-2 text-white/90 font-medium">Транскрипція і миттєві інсайти.</div>
            </button>

            <div className="rounded-2xl bg-[#171c27] text-white p-5 border border-white/10">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-white/60 mb-2">AI quality</div>
              <div className="text-3xl font-black">High</div>
              <div className="mt-2 text-white/70 font-medium">Кеш + fallback для стабільної роботи.</div>
            </div>

            <div className="rounded-2xl bg-black/40 text-white p-5 border border-white/10">
              <div className="text-xs uppercase mono-ui tracking-[0.2em] text-white/60 mb-2">focus</div>
              <div className="text-3xl font-black">Clinical</div>
              <div className="mt-2 text-white/70 font-medium">Рішення на основі даних, не шуму.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10">
        <div className="grid md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/dashboard')} className="rounded-2xl border border-white/10 bg-[#131722] p-6 text-left hover:bg-[#171c29] transition-colors">
            <FaClipboardList className="text-teal-300 text-2xl mb-4" />
            <div className="text-white text-2xl font-black">Оглянути історію тестів</div>
            <p className="text-slate-300 mt-2">Відкрийте пацієнта і перегляньте повну клінічну картину.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-teal-300 font-bold">Перейти <FaArrowRight /></span>
          </button>

          <button onClick={() => navigate('/dashboard')} className="rounded-2xl border border-white/10 bg-[#131722] p-6 text-left hover:bg-[#171c29] transition-colors">
            <FaBrain className="text-teal-300 text-2xl mb-4" />
            <div className="text-white text-2xl font-black">Повний AI-профіль</div>
            <p className="text-slate-300 mt-2">Зведений профіль по останніх проходженнях методик.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-teal-300 font-bold">Відкрити <FaArrowRight /></span>
          </button>

          <button onClick={() => navigate('/dashboard')} className="rounded-2xl border border-white/10 bg-[#131722] p-6 text-left hover:bg-[#171c29] transition-colors">
            <FaChartLine className="text-teal-300 text-2xl mb-4" />
            <div className="text-white text-2xl font-black">Динаміка стану</div>
            <p className="text-slate-300 mt-2">Контроль прогресу між сесіями та корекція фокусу.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-teal-300 font-bold">Переглянути <FaArrowRight /></span>
          </button>
        </div>
      </section>
    </div>
  );
}
