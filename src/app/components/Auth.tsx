import { useState } from 'react';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface AuthProps {
  onAuthSuccess: (userId: string) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('密码不匹配');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Call server endpoint to create user with auto-confirmed email
        const signupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ email, password }),
          }
        );

        const signupData = await signupResponse.json();

        if (!signupResponse.ok || signupData.error) {
          console.error('Sign up error:', signupData.error);
          setError(`注册失败: ${signupData.error}`);
          return;
        }

        // Now sign in the newly created user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Auto sign-in error after signup:', signInError);
          setError(`注册成功但登录失败，请手动登录`);
          setIsSignUp(false);
          return;
        }

        if (data.user) {
          // Store user info
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', email);
          
          // Show success message
          setSuccessMessage('注册成功！正在登录...');
          
          // Trigger auth callback
          setTimeout(() => {
            onAuthSuccess(data.user.id);
          }, 1000);
        }
      } else {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          setError(`登录失败: ${signInError.message}`);
          return;
        }

        if (data.user) {
          // Store user info
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', email);
          
          // Success - trigger auth callback
          onAuthSuccess(data.user.id);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(`认证失败: ${err.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC] p-4">
      <div 
        className="relative bg-white rounded-xl shadow-xl overflow-hidden"
        style={{
          width: '375px',
          height: '812px',
          border: '1px solid #E2E8F0'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-8">
          {/* Logo/Title */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-[#1A3A5F] rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A3A5F] mb-2">My Stock</h1>
            <p className="text-sm text-[#A0AEC0]">
              {isSignUp ? '创建您的账户' : '登录您的账户'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-[#A0AEC0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-3 py-3 bg-[#EDF2F7] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                密码
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-[#A0AEC0]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少6个字符"
                  className="w-full pl-10 pr-3 py-3 bg-[#EDF2F7] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-[#1A3A5F] mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-[#A0AEC0]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-10 pr-3 py-3 bg-[#EDF2F7] rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#4299E1]"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 flex items-center gap-2">
                <CheckCircle size={16} />
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A3A5F] text-white py-3 rounded-full font-medium hover:bg-[#2d5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setConfirmPassword('');
              }}
              className="text-sm text-[#4299E1] hover:underline"
              disabled={loading}
            >
              {isSignUp ? '已有账户？登录' : '没有账户？注册'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
