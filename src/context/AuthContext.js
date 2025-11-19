import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    sessionStorage.clear();
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Önce session'ı kontrol et
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        clearAuthData();
        navigate('/login');
        return;
      }

      // Session varsa çıkış yap
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Çıkış yapılırken hata:', error.message);
        toast.error('Çıkış yapılırken bir hata oluştu');
        return;
      }

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Kayıt başarılı! E-posta adresinizi kontrol edin.');
      return data;
    } catch (error) {
      toast.error('Kayıt olurken bir hata oluştu');
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      toast.success('Başarıyla giriş yapıldı');
      return data;
    } catch (error) {
      toast.error('Giriş yapılırken bir hata oluştu');
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
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
        // Mevcut session'ı al
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        // Component hala mount edilmiş ise state'i güncelle
        if (mounted && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }

        // Auth state değişikliklerini dinle
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              clearAuthData();
              navigate('/login');
            }
          }
        });

        return () => {
          mounted = false;
          subscription?.unsubscribe();
        };
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
  }, [navigate, clearAuthData]);

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