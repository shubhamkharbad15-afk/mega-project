import React, { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import { loginUser, registerUser, getCurrentUser } from '../hooks/apis/auth';

export default function AuthDialog({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [persona, setPersona] = useState('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      if (mode === 'register') await registerUser(name.trim(), email.trim(), password, phone.trim());
      await loginUser(email.trim(), password);
      const user = await getCurrentUser();
      const roleAliases = { citizen: ['citizen', 'user', 'public'], municipal: ['municipal', 'government'], field_contractor: ['field_contractor', 'contractor', 'worker'], admin: ['admin', 'developer'] };
      if (!(roleAliases[persona] || []).includes(String(user.role || '').toLowerCase())) {
        throw new Error(`This account is not authorized for the ${persona === 'field_contractor' ? 'Field Contractor' : persona === 'municipal' ? 'Municipal Government' : persona === 'admin' ? 'Developer / System Admin' : 'Citizen'} portal. Sign in with an account assigned to that role.`);
      }
      onAuthenticated(user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Check the API connection and try again.');
    } finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-sky-700">RoadQuality account</p><h2 id="auth-title" className="mt-1 text-xl font-bold">{mode === 'login' ? 'Sign in to continue' : 'Create a citizen account'}</h2><p className="mt-1 text-sm text-slate-500">Real submissions are saved only when the backend confirms success.</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close sign-in dialog"><X size={18}/></button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'login' && <label className="block text-sm font-medium">Choose your portal<select value={persona} onChange={e=>setPersona(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="citizen">Citizen / Road Reporter</option><option value="municipal">Municipal Government Officer</option><option value="field_contractor">Field Contractor</option><option value="admin">Developer / System Administrator</option></select><span className="mt-1 block text-xs text-slate-500">Portal selection never grants permissions; access is determined by the role assigned to your account by the backend.</span></label>}
        {mode === 'register' && <><label className="block text-sm font-medium">Full name<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="name" /></label><label className="block text-sm font-medium">Phone (optional)<input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="tel" /></label></>}
        <label className="block text-sm font-medium">Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete="email" /></label>
        <label className="block text-sm font-medium">Password<input type="password" required minLength={mode === 'register' ? 8 : 1} value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{mode === 'login' ? <LogIn size={17}/> : <UserPlus size={17}/>} {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">{mode === 'login' ? 'New to RoadQuality?' : 'Already registered?'} <button type="button" onClick={()=>{setMode(mode === 'login' ? 'register' : 'login'); setError('');}} className="font-semibold text-sky-700 underline underline-offset-2">{mode === 'login' ? 'Create a citizen account' : 'Sign in'}</button></p>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Public registration creates a citizen account only. Municipal, contractor, and admin access must be assigned by an authorized database administrator.</p>
    </section>
  </div>;
}
