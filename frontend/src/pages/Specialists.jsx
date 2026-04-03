// src/pages/Specialists.jsx
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserMd, FaStar, FaRegEnvelope } from 'react-icons/fa';

export default function Specialists() {
  const navigate = useNavigate();
  
  const specialists = [
    { 
        id: 1, 
        name: "Наталія Довгуй", 
        role: "Психолог, клінічний аналітик", 
        exp: "6 років", 
        specialty: "Тривожні розлади, ПТСР",
        color: "indigo"
    },
    { 
        id: 2, 
        name: "Олександр Швець", 
        role: "Когнітивно-поведінковий терапевт", 
        exp: "8 років", 
        specialty: "Депресивні стани, вигорання",
        color: "emerald"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-24 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-12 transition-colors">
        <FaArrowLeft /> Назад
      </button>

      <div className="mb-16">
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Наші <span className="text-indigo-600">фахівці</span></h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl">Кожен спеціаліст використовує AI Brain Core для глибокого аналізу вашого стану.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {specialists.map(s => (
          <div key={s.id} className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group">
            <div className={`w-20 h-20 bg-${s.color}-50 text-${s.color}-600 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
              <FaUserMd />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">{s.name}</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">{s.role}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <FaStar className="text-amber-400" />
                <span className="text-slate-600 font-medium">Досвід: <b className="text-slate-900">{s.exp}</b></span>
              </div>
              <div className="flex items-center gap-3">
                <FaRegEnvelope className="text-indigo-400" />
                <span className="text-slate-600 font-medium text-sm">{s.specialty}</span>
              </div>
            </div>

            <button onClick={() => navigate('/auth')} className={`w-full bg-${s.color}-600 hover:bg-${s.color}-700 text-white py-4 rounded-2xl font-black transition-all shadow-md`}>
              Записатися на прийом
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}