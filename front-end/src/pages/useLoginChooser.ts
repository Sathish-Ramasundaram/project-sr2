import { useState } from 'react';

export function useLoginChooser() {
  const [isLoginChooserOpen, setIsLoginChooserOpen] = useState(false);

  const openLoginChooser = () => {
    setIsLoginChooserOpen(true);
  };

  const closeLoginChooser = () => {
    setIsLoginChooserOpen(false);
  };

  return {
    isLoginChooserOpen,
    openLoginChooser,
    closeLoginChooser,
  };
}
