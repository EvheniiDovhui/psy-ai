// src/components/TestCard.jsx
import React from 'react';

const TestCard = ({ icon: Icon, title, description, color }) => {
  return (
    <div 
      className={`group bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 hover:border-${color}-200 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center`}
    >
      <div className={`p-5 rounded-2xl bg-${color}-50 text-${color}-600 mb-6 group-hover:scale-110 group-hover:bg-${color}-100 transition-transform duration-300`}>
        {Icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-base leading-relaxed">{description}</p>
    </div>
  );
};

export default TestCard;