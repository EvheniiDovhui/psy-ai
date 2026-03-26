// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { FaBrain } from 'react-icons/fa'; // Беремо іконку мозку

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors">
          <FaBrain className="text-2xl" />
          <span className="text-xl font-bold tracking-tight">PsyTest Portal</span>
        </Link>
        <nav>
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
            Головна
          </Link>
        </nav>
      </div>
    </header>
  );
}