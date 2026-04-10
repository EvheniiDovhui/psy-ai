// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaUser, FaHistory, FaFolderOpen, FaArrowRight, FaCheckCircle, FaComments } from 'react-icons/fa';
export default function Dashboard() {
  const navigate = useNavigate();
  
  // Базовий стейт користувача
  const [user, setUser] = useState({ name: '', role: '', email: '' });
  
  // Стейт для роботи з психологами (тільки для пацієнтів)
  const [psychologists, setPsychologists] = useState([]);
  const [assignedPsy, setAssignedPsy] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]); // <--- ДОДАЙ ЦЕ

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole') || 'patient';
    
    setUser({ name: localStorage.getItem('userName') || 'Користувач', role, email });

    if (role === 'patient') {
      fetchPsychologists();
      if (email) fetchMyPsychologist(email);
    } else if (role === 'psychologist' && email) {
      // ЯКЩО ПСИХОЛОГ - ВАНТАЖИМО ЙОГО ПАЦІЄНТІВ
      fetchMyPatients(email);
    }
  }, [navigate]);

  const fetchMyPatients = async (psyEmail) => {
    try {
      const res = await fetch(`http://localhost:8000/api/my-patients/${psyEmail}`);
      const data = await res.json();
      if (data.status === 'success') {
        setPatients(data.data);
      }
    } catch (error) {
      console.error("Не вдалося завантажити пацієнтів:", error);
    }
  };
  // ФУНКЦІЯ 1: Перевірка поточного психолога (щоб не зникав після F5)
  const fetchMyPsychologist = async (patientEmail) => {
    try {
      const res = await fetch(`http://localhost:8000/api/my-psychologist/${patientEmail}`);
      const data = await res.json();
      if (data.status === 'success') {
        setAssignedPsy(data.psychologist_name); // Відновлюємо збереженого психолога
      }
    } catch (error) {
      console.error("Не вдалося перевірити прив'язку:", error);
    }
  };

  // ФУНКЦІЯ 2: Завантаження списку всіх доступних психологів
  const fetchPsychologists = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/psychologists');
      const data = await res.json();
      if (data.status === 'success') {
        setPsychologists(data.data);
      }
    } catch (error) {
      console.error("Не вдалося завантажити фахівців:", error);
    }
  };

  // ФУНКЦІЯ 3: Прикріплення пацієнта до обраного фахівця
  const handleAssign = async (psyId, psyName) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/assign-psychologist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patient_email: user.email, 
          psychologist_id: psyId 
        }),
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setAssignedPsy(psyName); // Встановлюємо в UI, щоб одразу показати зелену плашку
      } else {
        alert(data.detail);
      }
    } catch (error) {
      console.error(error);
      alert("Помилка з'єднання з сервером.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      
      {/* --- СПІЛЬНА ШАПКА КАБІНЕТУ --- */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl shadow-inner">
            {user.role === 'psychologist' ? <FaUserMd /> : <FaUser />}
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Вітаємо, {user.name}!</h1>
            <p className="text-slate-500 font-medium">
              {user.role === 'psychologist' 
                ? 'Ваш професійний простір для роботи з пацієнтами.' 
                : 'Ваш особистий простір ментального здоров\'я.'}
            </p>
          </div>
        </div>
        <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold text-sm tracking-widest uppercase shadow-sm">
          Роль: {user.role === 'psychologist' ? 'Фахівець' : 'Клієнт'}
        </div>
      </div>

      {/* --- РОЗДІЛЕННЯ КОНТЕНТУ ЗА РОЛЯМИ --- */}
      {user.role === 'psychologist' ? (
        
        // ================= ВИГЛЯД ДЛЯ ПСИХОЛОГА =================
        <div className="space-y-8">
          <div className="bg-indigo-600 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden flex justify-between items-center">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <FaFolderOpen className="text-4xl text-indigo-200" />
                <h2 className="text-3xl font-black">Мої клієнти</h2>
              </div>
              <p className="text-indigo-100 font-medium">Керуйте картками пацієнтів та переглядайте їхні клінічні показники.</p>
            </div>
            <div className="bg-white/20 px-6 py-4 rounded-3xl backdrop-blur-sm text-center">
              <div className="text-4xl font-black">{patients.length}</div>
              <div className="text-xs uppercase tracking-widest font-bold text-indigo-200 mt-1">Всього</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-100">
                    Вік: {patient.age}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-1">{patient.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{patient.email}</p>
                
                <button 
  onClick={() => navigate(`/patient/${patient.id}`)}
  className="w-full bg-slate-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
>
  Відкрити картку <FaArrowRight className="text-sm" />
</button>
              </div>
            ))}

            {patients.length === 0 && (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center text-slate-500">
                <FaUser className="text-5xl mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Немає пацієнтів</h3>
                <p>Ваш список порожній. Клієнти з'являться тут, коли оберуть вас своїм фахівцем.</p>
              </div>
            )}
          </div>
        </div>

      ) : (
        
        // ================= ВИГЛЯД ДЛЯ КЛІЄНТА =================
        <div className="space-y-8">
          
          {/* Блок тестів */}
          <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-emerald-800 mb-2">Ваша історія тестів</h2>
              <p className="text-emerald-600">Оберіть тест для проходження, щоб ваш фахівець міг проаналізувати стан.</p>
            </div>
            <button onClick={() => navigate('/')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-black transition-all shadow-md shadow-emerald-200 whitespace-nowrap">
              Пройти тест
            </button>
          </div>
          
          {/* Блок вибору фахівця */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-4 border-b pb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl"><FaUserMd /></div>
              <div>
                <h3 className="font-black text-slate-800 text-2xl">Ваш Фахівець</h3>
                <p className="text-slate-500 font-medium">Оберіть психолога, якому ви довіряєте аналіз ваших тестів.</p>
              </div>
            </div>

            {assignedPsy ? (
              /* Якщо фахівець ВЖЕ ОБРАНИЙ */
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                  <FaCheckCircle className="text-emerald-500 text-5xl" />
                  <div>
                    <div className="text-emerald-800 font-bold mb-1 uppercase tracking-widest text-xs">Ваш фахівець</div>
                    <div className="text-emerald-900 font-black text-3xl">{assignedPsy}</div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/chat')}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-md flex items-center justify-center gap-3 text-lg"
                >
                  <FaComments className="text-2xl" /> Відкрити чат
                </button>
              </div>
            ) : (
              /* Якщо фахівця ЩЕ НЕМАЄ (показуємо список) */
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {psychologists.map((psy) => (
                  <div key={psy.id} className="border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all flex flex-col items-center text-center group">
                    <img 
                      src={`https://api.dicebear.com/8.x/notionists/svg?seed=${psy.name}`} 
                      alt="avatar" 
                      className="w-20 h-20 rounded-full bg-slate-50 mb-4 border-4 border-white shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-black text-slate-800 mb-1">{psy.name}</h4>
                    <p className="text-slate-400 text-sm font-medium mb-6 flex-grow">{psy.email}</p>
                    <button 
                      onClick={() => handleAssign(psy.id, psy.name)}
                      disabled={loading}
                      className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {loading ? "З'єднання..." : "Обрати"}
                    </button>
                  </div>
                ))}
                
                {psychologists.length === 0 && (
                  <div className="col-span-full text-center py-10 text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <FaUserMd className="text-4xl mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Наразі немає зареєстрованих психологів у системі.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}