// src/components/Footer.jsx
import { FaBrain, FaGithub, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-14 px-4 md:px-8 pb-7">
      <div className="max-w-[1320px] mx-auto rounded-[2.2rem] bg-slate-900 text-slate-300 pt-12 px-6 md:px-10 border border-slate-800 soft-shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Бренд */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <FaBrain className="text-white text-sm" />
            </div>
            <span className="text-xl brand-display font-bold text-white tracking-tight">PSY-AI</span>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Платформа для психологічного аналізу нового покоління на базі штучного інтелекту. Зроблено з турботою про ментальне здоров'я.
          </p>
          <div className="flex gap-4">
            <button className="text-slate-400 hover:text-teal-300 transition-colors"><FaGithub className="text-xl" /></button>
            <button className="text-slate-400 hover:text-teal-300 transition-colors"><FaEnvelope className="text-xl" /></button>
          </div>
        </div>

        {/* Лінки */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Методики</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="/primary-interview" className="hover:text-teal-300 transition-colors">Первинне інтерв'ю</a></li>
            <li><a href="/sentences" className="hover:text-teal-300 transition-colors">Незакінчені речення</a></li>
            <li><a href="/beck" className="hover:text-teal-300 transition-colors">Шкала Бека</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Платформа</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="/auth" className="hover:text-teal-300 transition-colors">Створити акаунт</a></li>
            <li><a href="/auth" className="hover:text-teal-300 transition-colors">Вхід для фахівців</a></li>
            <li><a href="#" className="hover:text-teal-300 transition-colors">Як це працює</a></li>
          </ul>
        </div>

        {/* Безпека */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Безпека даних</h4>
          <div className="flex items-start gap-3 bg-slate-800/70 p-4 rounded-2xl border border-slate-700">
            <FaShieldAlt className="text-teal-400 text-2xl shrink-0" />
            <p className="text-xs leading-relaxed">
              Усі медичні та персональні дані надійно зашифровані. Ми не передаємо вашу інформацію третім особам.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-12 pt-7 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium pb-7">
        <p>© {new Date().getFullYear()} PSY-AI Brain Core. Усі права захищені.</p>
        <div className="flex gap-6 text-slate-400">
          <a href="#" className="hover:text-teal-300 transition-colors">Політика конфіденційності</a>
          <a href="#" className="hover:text-teal-300 transition-colors">Умови використання</a>
        </div>
      </div>
      </div>
    </footer>
  );
}