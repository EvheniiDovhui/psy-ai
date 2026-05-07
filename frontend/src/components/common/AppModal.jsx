import { AnimatePresence, motion as Motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useModal } from '../../lib/modal/ModalContext';

const TONES = {
  info: {
    icon: <FaInfoCircle />,
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    button: 'bg-blue-700 hover:bg-blue-800',
  },
  success: {
    icon: <FaCheckCircle />,
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    button: 'bg-emerald-700 hover:bg-emerald-800',
  },
  error: {
    icon: <FaExclamationTriangle />,
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    button: 'bg-rose-700 hover:bg-rose-800',
  },
};

export default function AppModal() {
  const { modal, closeModal } = useModal();

  const tone = TONES[modal.tone] || TONES.info;

  const handleConfirm = () => {
    try {
      if (typeof modal.onConfirm === 'function') modal.onConfirm();
    } finally {
      closeModal();
    }
  };

  const handleCancel = () => {
    try {
      if (typeof modal.onCancel === 'function') modal.onCancel();
    } finally {
      closeModal();
    }
  };

  return (
    <AnimatePresence>
      {modal.isOpen && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm"
            onClick={handleCancel}
          />

          <Motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 top-1/2 z-[110] w-[94%] max-w-xl -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 md:p-8 shadow-2xl">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${tone.badge}`}>
                  {tone.icon} Повідомлення
                </div>
                <button
                  onClick={handleCancel}
                  className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center justify-center"
                  aria-label="Закрити"
                >
                  <FaTimes />
                </button>
              </div>

              {modal.title ? <h3 className="text-2xl brand-display font-black text-slate-900 mb-3">{modal.title}</h3> : null}
              {modal.message ? <p className="text-slate-600 text-lg leading-relaxed font-medium">{modal.message}</p> : null}

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                {modal.cancelText ? (
                  <button
                    onClick={handleCancel}
                    className="px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                  >
                    {modal.cancelText}
                  </button>
                ) : null}
                <button
                  onClick={handleConfirm}
                  className={`px-5 py-3 rounded-xl text-white font-black transition-colors ${tone.button}`}
                >
                  {modal.confirmText || 'Зрозуміло'}
                </button>
              </div>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
