// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header'; // НАШ НОВИЙ ХЕДЕР
import Footer from './components/Footer'; // НАШ НОВИЙ ФУТЕР
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PatientProfile from './pages/PatientProfile';
import PatientChat from './pages/PatientChat';
import PrimaryInterview from './pages/PrimaryInterview';
import UnfinishedSentences from './pages/UnfinishedSentences';
import BeckTest from './pages/BeckTest';
import Specialists from './pages/Specialists'; // Імпортуй

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        
        {/* Глобальний хедер (один на весь сайт) */}
        <Header /> 
        
        {/* Основний контент */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patient/:id" element={<PatientProfile />} />
            <Route path="/chat" element={<PatientChat />} />
            <Route path="/specialists" element={<Specialists />} />
            
            {/* Тести */}
            <Route path="/primary-interview" element={<PrimaryInterview />} />
            <Route path="/sentences" element={<UnfinishedSentences />} />
            <Route path="/beck" element={<BeckTest />} />
          </Routes>
        </main>

        {/* Глобальний футер */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;