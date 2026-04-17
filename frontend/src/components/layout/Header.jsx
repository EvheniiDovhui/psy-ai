// src/components/Header.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  FaBolt, FaBell, FaUserCircle, FaChevronDown, FaSignOutAlt, 
  FaTasks, FaSignInAlt, FaUserMd, FaEnvelopeOpen 
} from 'react-icons/fa';
import { API_BASE_URL } from '../../lib/config/api';

export default function Header() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || "Користувач";

  const [isMethodsOpen, setIsMethodsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  useEffect(() => {
    const myId = Number(localStorage.getItem('userId'));
    const myEmail = localStorage.getItem('userEmail');

    if (!isAuthenticated || !myId || !myEmail) {
      setNotifications([]);
      return;
    }

    const formatRelativeTime = (isoString) => {
      if (!isoString) return 'щойно';
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.max(0, Math.floor((now - date) / 60000));

      if (diffMinutes < 1) return 'щойно';
      if (diffMinutes < 60) return `${diffMinutes} хв тому`;

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} год тому`;

      return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
      });
    };

    const loadNotifications = async () => {
      setIsNotifLoading(true);
      try {
        if (userRole === 'patient') {
          const psyRes = await fetch(`${API_BASE_URL}/api/my-psychologist/${encodeURIComponent(myEmail)}`);
          const psyData = await psyRes.json();
          if (psyData.status !== 'success' || !psyData.psychologist_id) {
            setNotifications([]);
            return;
          }

          const msgRes = await fetch(`${API_BASE_URL}/api/messages/${myId}/${psyData.psychologist_id}`);
          const msgData = await msgRes.json();
          if (msgData.status !== 'success' || !Array.isArray(msgData.data)) {
            setNotifications([]);
            return;
          }

          const recent = msgData.data
            .filter((m) => m.sender_id === psyData.psychologist_id)
            .slice(-6)
            .reverse()
            .map((m) => ({
              id: m.id,
              sender: psyData.psychologist_name || 'Фахівець',
              text: m.text,
              time: formatRelativeTime(m.timestamp),
            }));

          setNotifications(recent);
          return;
        }

        if (userRole === 'psychologist') {
          const patientsRes = await fetch(`${API_BASE_URL}/api/my-patients/${encodeURIComponent(myEmail)}`);
          const patientsData = await patientsRes.json();
          const patients = Array.isArray(patientsData.data) ? patientsData.data : [];

          if (!patients.length) {
            setNotifications([]);
            return;
          }

          const messagesByPatient = await Promise.all(
            patients.map(async (patient) => {
              const res = await fetch(`${API_BASE_URL}/api/messages/${myId}/${patient.id}`);
              const data = await res.json();
              if (data.status !== 'success' || !Array.isArray(data.data)) return [];

              return data.data
                .filter((m) => m.sender_id === patient.id)
                .slice(-2)
                .map((m) => ({
                  id: `${patient.id}-${m.id}`,
                  sender: patient.name,
                  text: m.text,
                  time: formatRelativeTime(m.timestamp),
                  timestamp: m.timestamp,
                }));
            })
          );

          const flattened = messagesByPatient
            .flat()
            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
            .slice(0, 6)
            .map((item) => ({
              id: item.id,
              sender: item.sender,
              text: item.text,
              time: item.time,
            }));

          setNotifications(flattened);
          return;
        }

        setNotifications([]);
      } catch (error) {
        console.error(error);
        setNotifications([]);
      } finally {
        setIsNotifLoading(false);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 pt-3">
      <div className="max-w-[1380px] mx-auto h-20 glass-surface rounded-2xl px-4 md:px-6 flex items-center justify-between soft-shadow">
        
        {/* Логотип */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-11 h-11 bg-gradient-to-br from-teal-700 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/20 group-hover:scale-105 transition-all">
            <div className="relative w-7 h-7">
              <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute bottom-1 right-2 w-2.5 h-2.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-2 left-0 w-4 h-4 bg-white rounded-full opacity-40"></div>
              <div className="absolute top-1 right-1 w-6 h-[1.5px] bg-white rotate-[-30deg]"></div>
              <div className="absolute bottom-2 right-3 w-5 h-[1px] bg-white rotate-[40deg]"></div>
            </div>
          </div>
          <span className="text-2xl brand-display font-bold text-slate-900 tracking-tight">PSY<span className="text-teal-700">-AI</span></span>
        </div>

        {/* Навігація */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">Головна</Link>
          
          {/* Меню Методик */}
          <div className="relative" onMouseEnter={() => setIsMethodsOpen(true)} onMouseLeave={() => setIsMethodsOpen(false)}>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors">
              Методики <FaChevronDown className="text-xs mt-0.5" />
            </button>
            <AnimatePresence>
              {isMethodsOpen && (
                <Motion.div initial="hidden" animate="visible" exit="hidden" variants={menuVariants} className="absolute top-full -left-2 pt-3 w-64 z-50">
                  <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
                    <Link to="/primary-interview" className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-semibold text-sm transition-colors">
                      <div className="w-8 h-8 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center"><FaTasks size={14} /></div>
                      Первинне інтерв'ю
                    </Link>
                    <Link to="/sentences" className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-semibold text-sm transition-colors">
                      <div className="w-8 h-8 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center"><FaTasks size={14} /></div>
                      Незакінчені речення
                    </Link>
                    <Link to="/beck" className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-semibold text-sm transition-colors">
                      <div className="w-8 h-8 bg-teal-50 text-teal-700 rounded-lg flex items-center justify-center"><FaTasks size={14} /></div>
                      Шкала Бека
                    </Link>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/specialists" className="text-sm font-bold text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-2">
            <FaUserMd className="text-teal-600" /> Фахівці
          </Link>
        </nav>

        {/* Дії */}
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 bg-teal-50 text-teal-800 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-200">
             <FaBolt className="text-teal-600 text-sm animate-pulse" /> AI Active
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2 relative">
              
              {/* КНОПКА ДЗВІНОЧКА */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative ${
                    isNotifOpen ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20' : 'bg-white text-slate-400 hover:text-teal-700 hover:bg-teal-50 border border-slate-200'
                  }`}
                >
                  <FaBell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* ВІКНО СПОВІЩЕНЬ */}
                <AnimatePresence>
                  {isNotifOpen && (
                    <Motion.div 
                      initial="hidden" animate="visible" exit="hidden" variants={menuVariants}
                      className="absolute top-full right-0 mt-3 w-80 z-50 overflow-hidden"
                    >
                      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                          <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Сповіщення</span>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{notifications.length} нових</span>
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto">
                          {isNotifLoading ? (
                            <div className="px-6 py-8 text-center text-sm text-slate-500 font-medium">Завантаження сповіщень...</div>
                          ) : notifications.length === 0 ? (
                            <div className="px-6 py-8 text-center text-sm text-slate-500 font-medium">Поки немає нових сповіщень.</div>
                          ) : (
                            notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => { navigate(userRole === 'psychologist' ? '/dashboard' : '/chat'); setIsNotifOpen(false); }}
                                className="px-6 py-4 hover:bg-teal-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">{n.sender}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                  {n.text}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                        
                        <button 
                          onClick={() => { navigate(userRole === 'psychologist' ? '/dashboard' : '/chat'); setIsNotifOpen(false); }}
                          className="w-full py-4 text-center text-xs font-black text-teal-700 hover:bg-teal-700 hover:text-white transition-all uppercase tracking-widest bg-slate-50"
                        >
                          Переглянути все
                        </button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Меню профілю */}
              <div className="relative" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                   <div className="w-10 h-10 bg-gradient-to-tr from-teal-100 to-white text-teal-700 rounded-xl flex items-center justify-center text-xl font-black shadow-sm border border-teal-100">
                     {userName.charAt(0).toUpperCase()}
                   </div>
                   <div className="hidden sm:flex flex-col items-start leading-tight">
                     <span className="text-sm font-black text-slate-800 tracking-tight">{userName}</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userRole === 'psychologist' ? 'Фахівець' : 'Клієнт'}</span>
                   </div>
                   <FaChevronDown className="text-slate-300 ml-1 text-xs" />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <Motion.div initial="hidden" animate="visible" exit="hidden" variants={menuVariants} className="absolute top-full right-0 pt-3 w-56 z-50">
                      <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                        <button onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 transition-colors text-slate-700 hover:text-teal-800 font-bold text-sm">
                          <FaUserCircle className="text-teal-600" /> Мій кабінет
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-colors text-rose-600 font-bold text-sm">
                          <FaSignOutAlt className="text-rose-400" /> Вийти
                        </button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {!isAuthenticated && (
            <button onClick={() => navigate('/auth')} className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-xl font-black transition-all shadow-md shadow-teal-900/20 flex items-center gap-2">
              <FaSignInAlt /> Увійти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}