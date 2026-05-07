import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ModalContext = createContext(null);

const DEFAULT_MODAL = {
  isOpen: false,
  tone: 'info',
  title: '',
  message: '',
  confirmText: 'Зрозуміло',
  cancelText: '',
  onConfirm: null,
  onCancel: null,
};

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(DEFAULT_MODAL);

  const closeModal = useCallback(() => {
    setModal(DEFAULT_MODAL);
  }, []);

  const openModal = useCallback((config) => {
    setModal({
      ...DEFAULT_MODAL,
      ...config,
      isOpen: true,
    });
  }, []);

  const value = useMemo(() => ({ modal, openModal, closeModal }), [modal, openModal, closeModal]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}
