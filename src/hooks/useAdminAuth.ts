import { useState, useCallback, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'CHESS_LEAGUE_ADMIN_SESSION';
const MASTER_PASSCODE = '1111';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState<string>('دسترسی مدیریت');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Synchronize with sessionStorage
  const login = useCallback((passcode: string): boolean => {
    if (passcode.trim() === MASTER_PASSCODE) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {}
      
      if (pendingCallback) {
        pendingCallback();
        setPendingCallback(null);
      }
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  }, [pendingCallback]);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {}
  }, []);

  // Request admin authorization before executing an action
  const requireAdmin = useCallback((title: string, action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setActionTitle(title);
      setPendingCallback(() => action);
      setIsAuthModalOpen(true);
    }
  }, [isAdmin]);

  const cancelAuth = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  }, []);

  const openLoginModal = useCallback(() => {
    setActionTitle('ورود به پنل مدیریت لیگ');
    setPendingCallback(null);
    setIsAuthModalOpen(true);
  }, []);

  return {
    isAdmin,
    isAuthModalOpen,
    actionTitle,
    login,
    logout,
    requireAdmin,
    cancelAuth,
    openLoginModal
  };
}
