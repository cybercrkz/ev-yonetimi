import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSession, loginUser, logoutUser, saveUser } from '../utils/localStorage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  const TIMEOUT_DURATION = 60000; // 1 dakika (milisaniye cinsinden)

  const clearAuthData = useCallback(() => {
    setUser(null);
    setSession(null);
    logoutUser();
  }, []);

  const signOut = useCallback(async () => {
    try {
      clearAuthData();
      navigate('/login');
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error.message);
      toast.error('Çıkış yapılırken bir hata oluştu');
      clearAuthData();
      navigate('/login');
    }
  }, [navigate, clearAuthData]);

  const signUp = async (email, password) => {
    try {
      const newUser = saveUser(email, password);
      toast.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      return { user: newUser };
    } catch (error) {
      toast.error(error.message || 'Kayıt olurken bir hata oluştu');
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const data = loginUser(email, password);
      setSession(data.session);
      setUser(data.user);
      toast.success('Başarıyla giriş yapıldı');
      return data;
    } catch (error) {
      toast.error(error.message || 'Giriş yapılırken bir hata oluştu');
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      // localStorage tabanlı sistemde şifre sıfırlama desteği yok
      toast.info('Şifre sıfırlama özelliği henüz mevcut değil. Lütfen yeni bir hesap oluşturun.');
    } catch (error) {
      toast.error('Şifre sıfırlama işlemi başarısız oldu');
      throw error;
    }
  };

  // Aktivite izleyici
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    const resetTimer = () => {
      setLastActivity(Date.now());
    };

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  // Otomatik çıkış kontrolü
  useEffect(() => {
    let checkActivityInterval;

    if (user) {
      checkActivityInterval = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity > TIMEOUT_DURATION) {
          toast.info('Uzun süre işlem yapılmadığı için oturumunuz sonlandırıldı.');
          signOut();
        }
      }, 1000);
    }

    return () => {
      if (checkActivityInterval) {
        clearInterval(checkActivityInterval);
      }
    };
  }, [user, lastActivity, signOut]);

  // Oturum kontrolü
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // localStorage'dan mevcut session'ı al
        const currentSession = getSession();

        // Component hala mount edilmiş ise state'i güncelle
        if (mounted && currentSession) {
          setSession(currentSession);
          setUser({ id: currentSession.userId, email: currentSession.email });
        }
      } catch (error) {
        console.error('Auth başlatma hatası:', error.message);
        if (mounted) {
          clearAuthData();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [clearAuthData]);

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 