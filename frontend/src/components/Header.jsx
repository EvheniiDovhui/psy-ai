// src/components/Header.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBolt, FaBell, FaUserCircle, FaChevronDown, FaSignOutAlt, 
  FaTasks, FaSignInAlt, FaUserMd, FaEnvelopeOpen 
} from 'react-icons/fa';

export default function Header() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || "Користувач";

  const [isMethodsOpen, setIsMethodsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Стейт для вікна сповіщень
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    // Тестові дані (потім замінимо на реальні з API)
    { id: 1, sender: "Наталія Довгуй", text: "Чекаю на результати тесту Бека", time: "5 хв тому" },
    { id: 2, sender: "Система", text: "Ваш ШІ-профіль оновлено", time: "1 год тому" }
  ]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm font-inter">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* Логотип */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-all">
            <div className="relative w-7 h-7">
              <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full"></div>
              <div className="absolute bottom-1 right-2 w-2.5 h-2.5 bg-white rounded-full opacity-60"></div>
              <div className="absolute top-2 left-0 w-4 h-4 bg-white rounded-full opacity-40"></div>
              <div className="absolute top-1 right-1 w-6 h-[1.5px] bg-white rotate-[-30deg]"></div>
              <div className="absolute bottom-2 right-3 w-5 h-[1px] bg-white rotate-[40deg]"></div>
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">PSY<span className="text-indigo-600">-AI</span></span>
        </div>

        {/* Навігація */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Головна</Link>
          
          {/* Меню Методик */}
          <div className="relative" onMouseEnter={() => setIsMethodsOpen(true)} onMouseLeave={() => setIsMethodsOpen(false)}>
            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
              Методики <FaChevronDown className="text-xs mt-0.5" />
            </button>
            <AnimatePresence>
              {isMethodsOpen && (
                <motion.div initial="hidden" animate="visible" exit="hidden" variants={menuVariants} className="absolute top-full -left-2 pt-3 w-64 z-50">
                  <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100/50">
                    <Link to="/primary-interview" className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-sm transition-colors">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center"><FaTasks size={14} /></div>
                      Первинне інтерв'ю
                    </Link>
                    <Link to="/sentences" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-sm transition-colors">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center"><FaTasks size={14} /></div>
                      Незакінчені речення
                    </Link>
                    <Link to="/beck" className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-semibold text-sm transition-colors">
                      <div className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center"><FaTasks size={14} /></div>
                      Шкала Бека
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/specialists" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
            <FaUserMd className="text-indigo-400" /> Фахівці
          </Link>
        </nav>

        {/* Дії */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
             <FaBolt className="text-emerald-500 text-sm animate-pulse" /> AI Active
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2 relative">
              
              {/* КНОПКА ДЗВІНОЧКА */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative ${
                    isNotifOpen ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100'
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
                    <motion.div 
                      initial="hidden" animate="visible" exit="hidden" variants={menuVariants}
                      className="absolute top-full right-0 mt-3 w-80 z-50 overflow-hidden"
                    >
                      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                          <span className="font-black text-slate-800 text-sm uppercase tracking-widest">Сповіщення</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{notifications.length} нових</span>
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto">
                          {notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => { navigate(userRole === 'psychologist' ? '/dashboard' : '/chat'); setIsNotifOpen(false); }}
                              className="px-6 py-4 hover:bg-indigo-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{n.sender}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                {n.text}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        <button 
                          onClick={() => { navigate(userRole === 'psychologist' ? '/dashboard' : '/chat'); setIsNotifOpen(false); }}
                          className="w-full py-4 text-center text-xs font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest bg-slate-50"
                        >
                          Переглянути все
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Меню профілю */}
              <div className="relative" onMouseEnter={() => setIsProfileOpen(true)} onMouseLeave={() => setIsProfileOpen(false)}>
                <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                   <div className="w-10 h-10 bg-gradient-to-tr from-indigo-100 to-white text-indigo-600 rounded-xl flex items-center justify-center text-xl font-black shadow-sm border border-indigo-50">
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
                    <motion.div initial="hidden" animate="visible" exit="hidden" variants={menuVariants} className="absolute top-full right-0 pt-3 w-56 z-50">
                      <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
                        <button onClick={() => { navigate('/dashboard'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors text-slate-700 hover:text-indigo-700 font-bold text-sm">
                          <FaUserCircle className="text-indigo-400" /> Мій кабінет
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-colors text-rose-600 font-bold text-sm">
                          <FaSignOutAlt className="text-rose-400" /> Вийти
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {!isAuthenticated && (
            <button onClick={() => navigate('/auth')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
              <FaSignInAlt /> Увійти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}