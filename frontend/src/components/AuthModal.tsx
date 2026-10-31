import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { mernApi } from '../services/api';
import { X, Lock, User, Mail, Phone, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, showToast } = useShop();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleClientConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        // FR1: visitor registration
        const user = await mernApi.register(name, email, phone, password);
        setCurrentUser(user);
        showToast(`Registration successful! Welcome to DIGITAL STORE, ${user.name}.`);
        setIsAuthModalOpen(false);
      } else {
        // FR2: secure user login
        const user = await mernApi.login(email, password);
        setCurrentUser(user);
        showToast(`Welcome back, ${user.name} (${user.role.toUpperCase()})`);
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setErrorMessage('Google did not return an ID token. Please try again.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const user = await mernApi.googleLogin(response.credential);
      setCurrentUser(user);
      showToast(`Welcome, ${user.name}! Signed in with Google.`);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (targetEmail: string, targetPass = 'Shop@1234') => {
    setEmail(targetEmail);
    setPassword(targetPass);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#111215] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              {mode === 'login' ? 'User Login (FR2)' : 'Create Customer Account (FR1)'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-neutral-400 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-neutral-400 mb-1">Email Address (UT-06) *</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-neutral-400 mb-1">Phone Number (India) *</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-neutral-400 mb-1">Password (Min 6 chars, e.g. Shop@1234) *</label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Quick Credential Presets */}
          <div className="pt-1 text-[11px] text-neutral-400 font-mono">
            <span>Demo Quick Fill: </span>
            <button
              type="button"
              onClick={() => handleQuickLogin('alex@atelier.in')}
              className="text-amber-400 hover:underline mr-2 cursor-pointer"
            >
              Alex (Customer)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@atelier.in')}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Sarah (Admin)
            </button>
          </div>

          {googleClientConfigured && (
            <div className="pt-2 flex flex-col items-center gap-2">
              <div className="w-full flex items-center gap-3 text-neutral-500 text-[10px] uppercase tracking-widest">
                <span className="h-px flex-1 bg-neutral-800" />
                <span>or continue with</span>
                <span className="h-px flex-1 bg-neutral-800" />
              </div>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMessage('Google sign-in was unsuccessful. Please try again.')}
                theme="filled_black"
                shape="rectangular"
                width="320"
                text={mode === 'login' ? 'signin_with' : 'signup_with'}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{mode === 'login' ? 'Sign In Securely' : 'Complete Registration'}</span>
          </button>

          <div className="pt-2 text-center text-neutral-400 text-xs">
            {mode === 'login' ? (
              <span>
                New customer?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Create an Account (FR1)
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Sign In Here (FR2)
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
