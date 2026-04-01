import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import { 
  FaBrain, FaBolt, FaUserCircle, FaLayerGroup, 
  FaCompass, FaCommentDots, FaUserMd, FaExternalLinkAlt, FaChartLine
} from 'react-icons/fa';

export default function ResultsDisplay({ metrics, profile, vectorData }) {
  const MAX_SCORE = 5;

  // 1. Мапінг даних Big Five
  const b5 = [
    { name: 'Невротизм', val: profile.big_five?.neuroticism || 1 },
    { name: 'Екстраверсія', val: profile.big_five?.extraversion || 1 },
    { name: 'Відкритість', val: profile.big_five?.openness || 1 },
    { name: 'Доброзичл.', val: profile.big_five?.agreeableness || 1 },
    { name: 'Сумлінність', val: profile.big_five?.conscientiousness || 1 },
  ];

  // 2. Мапінг даних Маслоу
  const maslow = [
    { name: 'Фізіол.', val: profile.maslow?.physiological || 1, fill: '#ef4444' },
    { name: 'Безпека', val: profile.maslow?.safety || 1, fill: '#f97316' },
    { name: 'Любов', val: profile.maslow?.love || 1, fill: '#eab308' },
    { name: 'Повага', val: profile.maslow?.esteem || 1, fill: '#22c55e' },
    { name: 'Самоакт.', val: profile.maslow?.self_actualization || 1, fill: '#3b82f6' },
  ];

  // 3. Мапінг даних Шварца
  const schwartz = [
    { name: 'Влада', val: profile.schwartz?.power || 1 },
    { name: 'Досягнення', val: profile.schwartz?.achievement || 1 },
    { name: 'Гедонізм', val: profile.schwartz?.hedonism || 1 },
    { name: 'Безпека', val: profile.schwartz?.security || 1 },
    { name: 'Доброта', val: profile.schwartz?.benevolence || 1 },
    { name: 'Універс.', val: profile.schwartz?.universalism || 1 },
    { name: 'Самост.', val: profile.schwartz?.self_direction || 1 },
    { name: 'Стимул.', val: profile.schwartz?.stimulation || 1 },
    { name: 'Конформ.', val: profile.schwartz?.conformity || 1 },
    { name: 'Традиції', val: profile.schwartz?.tradition || 1 },
  ];

  return (
    <div className="space-y-12 py-10 animate-fade-in border-t border-slate-200">
      <h2 className="text-4xl font-black text-slate-800 text-center tracking-tight">
        Результати комплексного аналізу
      </h2>

      {/* Блок головних метрик */}
      <div className="flex flex-wrap justify-center gap-8">
          <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl w-72 text-center transform hover:scale-105 transition-transform">
             <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBrain className="text-2xl" />
             </div>
             <p className="text-xs uppercase font-black opacity-80 mb-1 tracking-widest">Tononi Complexity</p>
             <p className="text-5xl font-black">{metrics.tononi_complexity?.toFixed(3)}</p>
          </div>
          
          <div className="bg-teal-500 text-white p-8 rounded-[2.5rem] shadow-2xl w-72 text-center transform hover:scale-105 transition-transform">
             <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBolt className="text-2xl" />
             </div>
             <p className="text-xs uppercase font-black opacity-80 mb-1 tracking-widest">Free Energy</p>
             <p className="text-5xl font-black">{metrics.free_energy?.toFixed(3)}</p>
          </div>
      </div>

      {/* Сітка з графіками */}
      <div className="grid lg:grid-cols-2 gap-10 px-4">
        {/* Radar Charts */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-700">
            <FaUserCircle className="text-indigo-500 text-2xl"/> Профіль "Велика П'ятірка"
          </h3>
          <RadarChart width={340} height={300} data={b5}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} />
            <PolarRadiusAxis domain={[0, MAX_SCORE]} tick={false} axisLine={false} />
            <Radar dataKey="val" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-700">
            <FaCompass className="text-teal-500 text-2xl"/> Цінності за Шварцом
          </h3>
          <RadarChart width={340} height={300} data={schwartz} >
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} />
            <PolarRadiusAxis domain={[0, MAX_SCORE]} tick={false} axisLine={false} />
            <Radar dataKey="val" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.4} />
            <Tooltip />
          </RadarChart>
        </div>

        {/* Maslow Bar Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-2 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-slate-700">
            <FaLayerGroup className="text-amber-500 text-2xl"/> Піраміда потреб (Маслоу)
          </h3>
          <BarChart width={window.innerWidth > 768 ? 700 : 340} height={300} data={maslow} margin={{left: -20}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
            <YAxis domain={[0, MAX_SCORE]} axisLine={false} tickLine={false} tick={{fill: '#cbd5e1'}} />
            <Tooltip cursor={{fill: '#f8fafc'}} />
            <Bar dataKey="val" radius={[12, 12, 0, 0]} barSize={60}>
              {maslow.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </div>
      </div>

      {/* Vector Data Analysis - якщо доступно */}
      {vectorData && (
        <div className="grid lg:grid-cols-2 gap-10 px-4 py-8 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl border border-indigo-100">
          {/* Відстань до експертного вектора */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
              <FaChartLine className="text-5xl text-indigo-600 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-700">Дистанція до Експертного Профілю</h3>
              <div className="text-6xl font-black text-indigo-600">{vectorData.distance_to_expert?.toFixed(2)}</div>
              <p className="text-sm text-slate-500 italic max-w-xs">
                Менше — ближче до оптимального психологічного стану за екзпертними нормами
              </p>
            </div>
          </div>

          {/* Vector Components */}
          {vectorData.components && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6 text-slate-700">Розподіл компонентів вектора</h3>
              <div className="space-y-4">
                {Object.entries(vectorData.components).map(([component, values]) => (
                  <div key={component} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600 capitalize">{component}</span>
                      <span className="text-xs text-slate-500">
                        {Array.isArray(values) ? `${values.length} параметрів` : 'N/A'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          component === 'big_five' ? 'bg-indigo-500' : 
                          component === 'maslow' ? 'bg-amber-500' : 
                          'bg-teal-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (Array.isArray(values) ? values.reduce((a, b) => a + b, 0) / values.length : 0) * 20)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Блок ВИСНОВКУ AI */}
      {profile.conclusion && (
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="bg-slate-900 text-slate-100 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <FaCommentDots className="absolute -top-6 -right-6 text-9xl opacity-10 rotate-12" />
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="bg-indigo-500 p-2 rounded-lg">
                <FaBrain className="text-white" />
              </span>
              Психологічне резюме AI
            </h3>
            <p className="text-xl leading-relaxed font-medium text-slate-300 italic">
              "{profile.conclusion}"
            </p>
          </div>

          {/* Направлення до психолога */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-10 rounded-[3rem] shadow-2xl text-white flex flex-col md:flex-row items-center gap-8 border-4 border-white/20">
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md">
              <FaUserMd className="text-6xl text-teal-100" />
            </div>
            <div className="flex-grow text-center md:text-left space-y-2">
              <h4 className="text-2xl font-black">Бажаєте глибшого розбору?</h4>
              <p className="text-teal-50 text-lg opacity-90 max-w-xl">
                Цей аналіз є автоматизованим і базується на алгоритмах. Справжня терапія починається з живого спілкування. Зверніться до фахівця, щоб отримати професійну підтримку.
              </p>
            </div>
            <button 
              onClick={() => window.open('https://t.me/Psy_support_bot', '_blank')}
              className="bg-white text-teal-700 font-black py-5 px-10 rounded-2xl hover:bg-teal-50 transition-all shadow-xl flex items-center gap-3 group"
            >
              Знайти психолога <FaExternalLinkAlt className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
