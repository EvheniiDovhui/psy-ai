// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PsychologistDashboard from './PsychologistDashboard';
import PatientDashboard from './PatientDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(() => localStorage.getItem('userRole'));

  useEffect(() => {
    if (!role) {
      navigate('/auth');
    }
  }, [navigate, role]);

  if (!role) return null;

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {role === 'psychologist' ? (
          <PsychologistDashboard />
        ) : (
          <PatientDashboard />
        )}
      </div>
    </div>
  );
}