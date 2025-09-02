import { useState } from 'react';
import { adminLogin } from '../api/auth.ts';

export default function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const ok = await adminLogin(pwd);
    setBusy(false);
    if (ok) onSuccess();
    else setErr('Incorrect password');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl border border-gray-200"
      >
        {/* header strip in BYU navy */}
        <div className="h-2 rounded-t-2xl bg-[#002E5D]" />
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-[#002E5D]">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the admin password to continue.
          </p>

          <label className="mt-5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="••••••••"
            autoFocus
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#0062B8] focus:border-[#0062B8] transition"
          />

          {err && (
            <div className="mt-3 text-sm text-red-600" role="alert">
              {err}
            </div>
          )}

          <button
            disabled={busy}
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#002E5D] px-4 py-2.5 font-medium text-white hover:bg-[#013A73] disabled:opacity-60 transition"
          >
            {busy ? 'Checking…' : 'Unlock'}
          </button>

          <p className="mt-3 text-xs text-gray-500">
            Access is restricted to department admin.
          </p>
        </div>
      </form>
    </div>
  );
}
