import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearAuthData = useCallback(() => {
    setUser(null);
    setSession(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
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
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
      toast.success('Kayıt başarılı! Lütfen e-postanızı kontrol edin.');
      return data;
    } catch (error) {
      toast.error(error.message || 'Kayıt olurken bir hata oluştu');
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Şifre sıfırlama e-postası gönderildi.');
    } catch (error) {
      toast.error('Şifre sıfırlama işlemi başarısız oldu');
      throw error;
    }
  };

  // Oturum kontrolü
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (event === 'SIGNED_OUT') {
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