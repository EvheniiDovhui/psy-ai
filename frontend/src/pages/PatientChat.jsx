// src/pages/PatientChat.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaUserMd, FaSmile, FaPaperclip, FaMicrophone, FaEllipsisV } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react'; // Наша нова бібліотека смайлів

export default function PatientChat() {
  const navigate = useNavigate();
  const [assignedPsy, setAssignedPsy] = useState('Завантаження...');
  const [psyId, setPsyId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false); // Стейт для панелі емодзі
  const messagesEndRef = useRef(null);

  const myId = parseInt(localStorage.getItem('userId'));

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/auth'); return; }
    
    const email = localStorage.getItem('userEmail');
    if (email) {
      fetch(`http://localhost:8000/api/my-psychologist/${email}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setAssignedPsy(data.psychologist_name);
            setPsyId(data.psychologist_id);
          }
        })
    }
  }, [navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!myId || !psyId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/messages/${myId}/${psyId}`);
        const data = await res.json();
        if (data.status === 'success') setMessages(data.data);
      } catch (error) { console.error(error); }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [myId, psyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim() || !psyId) return;
    
    const textToSend = chatMessage;
    setChatMessage('');
    setShowEmoji(false); // Ховаємо смайли після відправки
    
    try {
      await fetch('http://localhost:8000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: myId, receiver_id: psyId, text: textToSend }),
      });
    } catch (error) { console.error(error); }
  };

  const onEmojiClick = (emojiObject) => {
    setChatMessage(prev => prev + emojiObject.emoji);
  };

  return (
    <div className="max-w-3xl mx-auto h-[100vh] md:h-[90vh] md:mt-4 flex flex-col bg-[#e5ddd5] md:rounded-[2rem] shadow-2xl overflow-hidden relative border border-slate-200">
      
      {/* Шапка чату (Telegram Style) */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-emerald-600 text-xl p-2 rounded-full hover:bg-slate-100 transition-all">
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl">
              <FaUserMd />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 leading-tight">{assignedPsy}</span>
              <span className="text-emerald-500 text-xs font-medium">в мережі</span>
            </div>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-2"><FaEllipsisV /></button>
      </div>

      {/* Вікно повідомлень (з фоном як у месенджерах) */}
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 relative z-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", backgroundBlendMode: 'overlay', backgroundColor: '#e5ddd5' }}>
        
        <div className="text-center my-2">
          <span className="bg-slate-400/20 text-slate-600 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Сьогодні</span>
        </div>
        
        {messages.map((msg) => {
          const isMyMsg = msg.sender_id === myId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMyMsg ? 'items-end' : 'items-start'}`}>
              <div 
                className={`relative max-w-[85%] md:max-w-[70%] px-4 py-2 text-[15px] shadow-sm flex flex-col ${
                  isMyMsg 
                    ? 'bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-tr-sm' // WhatsApp/Telegram Green для своїх
                    : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm'    // Білий для чужих
                }`}
              >
                <span className="pr-10 pb-1">{msg.text}</span>
                <span className={`text-[10px] absolute bottom-1 right-2 ${isMyMsg ? 'text-emerald-600/70' : 'text-slate-400'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Панель Емодзі (спливає над полем вводу) */}
      {showEmoji && (
        <div className="absolute bottom-[80px] left-2 z-30 shadow-2xl animate-fade-in">
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      )}

      {/* Форма вводу (Telegram Style) */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2 z-20">
        <button 
          type="button" 
          onClick={() => setShowEmoji(!showEmoji)}
          className="text-slate-500 hover:text-emerald-600 text-2xl p-2 transition-colors"
        >
          <FaSmile />
        </button>
        <button type="button" className="text-slate-400 hover:text-slate-600 text-xl p-2 transition-colors">
          <FaPaperclip />
        </button>
        
        <form onSubmit={handleSendMessage} className="flex-grow flex items-center">
          <input 
            type="text" 
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Повідомлення" 
            className="w-full bg-white border-none rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-slate-700 shadow-sm"
          />
        </form>

        {chatMessage.trim() ? (
          <button 
            onClick={handleSendMessage}
            className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-all animate-fade-in"
          >
            <FaPaperPlane className="ml-[-2px]" />
          </button>
        ) : (
          <button className="text-slate-500 hover:text-slate-700 w-10 h-10 flex items-center justify-center text-xl transition-all">
            <FaMicrophone />
          </button>
        )}
      </div>

    </div>
  );
}