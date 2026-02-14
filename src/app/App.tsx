import { useState, useEffect } from 'react';
import { Home, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Holdings } from './components/Holdings';
import { Analysis } from './components/Analysis';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { supabase } from '/utils/supabase/client';

type TabType = 'holdings' | 'analysis' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('holdings');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  u useEffect(() => {
    // Check for active Supabase session
    const checkSession = async () => {
      try {
        // Add a timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('Session check error:', error);
        }
        
        if (session?.user) {
          // Valid session exists
          setUserId(session.user.id);
          localStorage.setItem('userId', session.user.id);
          localStorage.setItem('userEmail', session.user.email || '');
        } else {
          // No valid session - clear localStorage
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        // On timeout or error, assume no session
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        localStorage.setItem('userId', session.user.id);
        localStorage.setItem('userEmail', session.user.email || '');
      } else {
        setUserId(null);
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        localStorage.setItem('userId', session.user.id);
        localStorage.setItem('userEmail', session.user.email || '');
      } else {
        setUserId(null);
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (id: string) => {
    setUserId(id);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      setUserId(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if error
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      setUserId(null);
    }
  };

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1A3A5F] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Home size={32} className="text-white" />
          </div>
          <p className="text-[#1A3A5F] font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!userId) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC] p-4">
      {/* iOS Device Frame */}
      <div 
        className="relative bg-white rounded-xl shadow-xl overflow-hidden"
        style={{
          width: '375px',
          height: '812px',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Main Content Area */}
        <div className="h-full flex flex-col">
          {/* Top Content (Header + Content) - 732px (812 - 80) */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'holdings' && <Holdings />}
            {activeTab === 'analysis' && <Analysis />}
            {activeTab === 'settings' && <Settings onLogout={handleLogout} />}
          </div>

          {/* Bottom Navigation - 80px */}
          <div className="h-20 bg-white border-t border-[#E2E8F0] flex items-center justify-around px-2">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'holdings' 
                  ? 'text-[#1A3A5F]' 
                  : 'text-[#A0AEC0]'
              }`}
            >
              <Home size={24} strokeWidth={activeTab === 'holdings' ? 2.5 : 2} />
              <span className="text-xs font-medium">持仓</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'analysis' 
                  ? 'text-[#1A3A5F]' 
                  : 'text-[#A0AEC0]'
              }`}
            >
              <BarChart3 size={24} strokeWidth={activeTab === 'analysis' ? 2.5 : 2} />
              <span className="text-xs font-medium">分析</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' 
                  ? 'text-[#1A3A5F]' 
                  : 'text-[#A0AEC0]'
              }`}
            >
              <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
              <span className="text-xs font-medium">设置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
