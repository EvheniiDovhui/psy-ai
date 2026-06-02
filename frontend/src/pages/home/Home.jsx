// src/pages/Home.jsx
import GuestHome from './GuestHome';
import PatientHome from './PatientHome';
import PsychologistHome from './PsychologistHome';

export default function Home() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <GuestHome />;
  if (role === 'psychologist') return <PsychologistHome />;
  return <PatientHome />;
}