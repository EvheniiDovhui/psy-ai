// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/home/Home';
import Auth from './pages/auth/Auth';
import Dashboard from './pages/dashboard/Dashboard';
import PatientProfile from './pages/profile/PatientProfile';
import PatientChat from './pages/chat/PatientChat';
import LiveSessionAssistant from './pages/sessions/LiveSessionAssistant';
import PrimaryInterview from './pages/tests/PrimaryInterview';
import UnfinishedSentences from './pages/tests/UnfinishedSentences';
import BeckTest from './pages/tests/BeckTest';
import CopingStrategiesTest from './pages/tests/CopingStrategiesTest';
import Specialists from './pages/specialists/Specialists';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        
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
            <Route path="/live-session" element={<LiveSessionAssistant />} />
            <Route path="/specialists" element={<Specialists />} />
            
            {/* Тести */}
            <Route path="/primary-interview" element={<PrimaryInterview />} />
            <Route path="/sentences" element={<UnfinishedSentences />} />
            <Route path="/beck" element={<BeckTest />} />
            <Route path="/coping" element={<CopingStrategiesTest />} />
          </Routes>
        </main>

        {/* Глобальний футер */}
        <Footer />
        
      </div>
    </Router>
  );
}

export default App;