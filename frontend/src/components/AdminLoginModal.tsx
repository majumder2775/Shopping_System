import React, { useState } from 'react';
import { AlertCircle, KeyRound, LockKeyhole, Mail, ShieldCheck, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { mernApi } from '../services/api';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginOpen,
    setIsAdminLoginOpen,
    setCurrentUser,
    setCurrentView,
    showToast,
  } = useShop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isAdminLoginOpen) return null;

  const close = () => {
    setIsAdminLoginOpen(false);
    setError(null);
    setPassword('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await mernApi.login(email.trim(), password);
      if (user.role !== 'admin') {
        mernApi.logout();
        setCurrentUser(null);
        setError('This account does not have administrator access. Use a registered admin account.');
        return;
      }
      setCurrentUser(user);
      setCurrentView('inventory');
      showToast(`Administrator signed in. Welcome, ${user.name}.`);
      close();
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neutral-950/85 backdrop-blur-sm p-4">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/30 bg-[#111215] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
        <header className="flex items-center justify-between border-b border-neutral-800 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-2 text-amber-300"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <h2 id="admin-login-title" className="text-sm font-semibold uppercase tracking-wider text-white">Administrator Login</h2>
              <p className="mt-1 text-[11px] text-neutral-400">Restricted access · verified by server</p>
            </div>
          </div>
          <button onClick={close} aria-label="Close admin login" className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"><X className="h-5 w-5" /></button>
        </header>
        {error && <div className="mx-6 mt-5 flex gap-2 rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-xs text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <form onSubmit={submit} className="space-y-4 p-6">
          <label className="block text-xs text-neutral-300">Administrator email
            <span className="relative mt-1 block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" /><input autoFocus type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-400" /></span>
          </label>
          <label className="block text-xs text-neutral-300">Password
            <span className="relative mt-1 block"><KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" /><input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-400" /></span>
          </label>
          <p className="flex gap-2 text-[11px] leading-relaxed text-neutral-500"><LockKeyhole className="h-4 w-4 shrink-0" />Only accounts whose database role is <code className="text-amber-300">admin</code> can enter the Inventory Hub.</p>
          <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"><ShieldCheck className="h-4 w-4" />{busy ? 'Verifying…' : 'Sign in as administrator'}</button>
        </form>
      </section>
    </div>
  );
};
