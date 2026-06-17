import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from 'react';
import { useLogin, useRegister, useGetOtp, useVerifyOtp, setAuthToken, type User } from '../../shared/api';
import { useAuth } from '../../shared/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = 'login' | 'register' | 'otp';
type OTPStep = 1 | 2; // step 1 = enter mobile, step 2 = enter code

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  maxLength,
  required = false,
  rightLabel,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
  rightLabel?: React.ReactNode;
}) {
  const iconMap: Record<string, string> = {
    username: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    password: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    name: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16',
  };
  const iconPath = iconMap[id] || iconMap['username'];

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>
        </span>
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="
            w-full pl-10 pr-4 py-3
            bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
            rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600
            focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60
            transition-all duration-200
          "
        />
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 animate-fade-in">
      <svg className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-sm text-red-700 dark:text-red-300 leading-snug">{message}</p>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="
        w-full mt-2 py-3.5 px-4
        bg-brand-600 hover:bg-brand-500
        text-white font-semibold text-sm tracking-wide rounded-xl
        flex items-center justify-center gap-2
        transition-all duration-200
        shadow-lg shadow-brand-900/40
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
      "
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {label}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </>
      )}
    </button>
  );
}

// ─── OTP Input Grid ───────────────────────────────────────────────────────────

function OTPGrid({ onComplete }: { onComplete: (otp: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(6).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < 5) inputs.current[idx + 1]?.focus();
    if (next.every(Boolean)) onComplete(next.join(''));
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const next = [...values];
      next[idx - 1] = '';
      setValues(next);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('');
    paste.split('').forEach((ch, i) => (next[i] = ch));
    setValues(next);
    const focus = Math.min(paste.length, 5);
    inputs.current[focus]?.focus();
    if (paste.length === 6) onComplete(paste);
  };

  return (
    <div className="grid grid-cols-6 gap-2 mt-2">
      {values.map((v, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          placeholder="·"
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="
            text-center py-3 text-xl font-bold
            bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10
            rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-700
            focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60
            transition-all duration-200
            caret-brand-500
          "
        />
      ))}
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────

function SuccessState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="font-semibold text-gray-900 dark:text-white text-lg">{message}</p>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{sub}</p>
    </div>
  );
}

// ─── Main AuthPage ─────────────────────────────────────────────────────────────

export default function AuthPage({ onSuccess }: { onSuccess?: (user: User | null) => void }) {
  const { establishSession } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [otpStep, setOtpStep] = useState<OTPStep>(1);
  const [otpMobile, setOtpMobile] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', username: '', password: '',
  });

  const { mutate: login, isPending: isLoginPending, error: loginError } = useLogin();
  const { mutate: register, isPending: isRegisterPending, error: registerError } = useRegister();
  const { mutate: getOtp, isPending: isGetOtpPending, error: getOtpError } = useGetOtp();
  const { mutate: verifyOtp, isPending: isVerifyOtpPending, error: verifyOtpError } = useVerifyOtp();

  const isPending = isLoginPending || isRegisterPending || isGetOtpPending || isVerifyOtpPending;
  const apiError = (mode === 'login' ? loginError : mode === 'register' ? registerError : mode === 'otp' ? (otpStep === 1 ? getOtpError : verifyOtpError) : null) as any;
  const errorMsg = localError || apiError?.message || '';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setOtpStep(1);
    setSuccessMsg('');
    setLocalError('');
    setOtpMobile('');
    setFormData({ name: '', email: '', mobile: '', username: '', password: '' });
  };

  // ── Submit handlers ─────────────────────────────────────────────────────────

  const finishAuth = async (data?: { token?: string }) => {
    if (data?.token) setAuthToken(data.token);
    const user = await establishSession();
    if (!user) {
      setLocalError('Signed in but session could not be established. Please try again.');
      return;
    }
    setSuccessMsg('Signed in successfully!');
    setTimeout(() => onSuccess?.(user), 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!formData.username || !formData.password) {
      setLocalError('Please enter your username and password.');
      return;
    }
    login({ username: formData.username, password: formData.password }, {
      onSuccess: (data: any) => finishAuth(data),
      onError: (err) => setLocalError(err.message || 'Login failed. Please check your credentials.'),
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    const { name, email, mobile, username, password } = formData;
    if (!name || !email || !mobile || !username || !password) {
      setLocalError('All fields are required.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setLocalError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    register({ name, email, mobile, username, password }, {
      onSuccess: async (data: any) => {
        if (data?.token) {
          await finishAuth(data);
        } else {
          setSuccessMsg('Account created! Please sign in.');
          setTimeout(() => switchMode('login'), 1600);
        }
      },
    });
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!/^\d{10}$/.test(otpMobile)) {
      setLocalError('Enter a valid 10-digit mobile number.');
      return;
    }
    getOtp({ mobile: otpMobile }, {
      onSuccess: () => {
        setOtpStep(2);
        setResendTimer(30);
      }
    });
  };

  const handleVerifyOTP = (otp: string) => {
    setLocalError('');
    if (otp.length < 6) return;
    verifyOtp({ mobile: otpMobile, otp }, {
      onSuccess: (data: any) => finishAuth(data),
    });
  };

  const handleResendOTP = () => {
    setLocalError('');
    getOtp({ mobile: otpMobile }, {
      onSuccess: () => {
        setResendTimer(30);
      }
    });
  };

  // ── Title map ───────────────────────────────────────────────────────────────

  const titles = {
    login: { title: 'Welcome back', sub: 'Sign in to your account to continue shopping' },
    register: { title: 'Create account', sub: 'Join us and start your shopping experience' },
    otp: {
      title: otpStep === 1 ? 'Login with OTP' : 'Enter your code',
      sub: otpStep === 1
        ? 'We\'ll send a secure one-time code to your mobile'
        : `Code sent to ${otpMobile}. Check your messages.`,
    },
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative w-full min-h-[calc(100vh-4rem)]">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-600/30">
            N
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
            Nexus<span className="text-brand-500">Shop</span>
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-xl dark:shadow-2xl animate-fade-in">

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{titles[mode].title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{titles[mode].sub}</p>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/[0.08] rounded-xl p-1 mb-7 gap-1">
            {(['login', 'otp', 'register'] as AuthMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`
                  flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${mode === m
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-white/5'}
                `}
              >
                {m === 'login' ? 'Sign In' : m === 'otp' ? 'OTP' : 'Register'}
              </button>
            ))}
          </div>

          {/* Success state */}
          {successMsg ? (
            <SuccessState message={successMsg} sub="You'll be redirected shortly." />
          ) : (
            <>
              {/* Error */}
              {errorMsg && <ErrorBox message={errorMsg} />}

              {/* ── LOGIN FORM ── */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} noValidate>
                  <InputField
                    label="Username" id="username" placeholder="johndoe123"
                    value={formData.username} onChange={handleChange}
                    autoComplete="username" required
                  />
                  <InputField
                    label="Password" id="password" type="password" placeholder="••••••••"
                    value={formData.password} onChange={handleChange}
                    autoComplete="current-password" required
                    rightLabel={
                      <button type="button" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                        Forgot password?
                      </button>
                    }
                  />
                  <SubmitButton loading={isPending} label="Sign In" />
                  <p className="text-center text-sm text-gray-600 dark:text-gray-500 mt-5">
                    No account?{' '}
                    <button type="button" onClick={() => switchMode('register')} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* ── REGISTER FORM ── */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} noValidate>
                  <InputField
                    label="Full Name" id="name" placeholder="John Doe"
                    value={formData.name} onChange={handleChange}
                    autoComplete="name" required
                  />
                  <InputField
                    label="Email Address" id="email" type="email" placeholder="john@example.com"
                    value={formData.email} onChange={handleChange}
                    autoComplete="email" required
                  />
                  <InputField
                    label="Mobile Number" id="mobile" type="tel" placeholder="10-digit number"
                    value={formData.mobile} onChange={handleChange}
                    maxLength={10} required
                  />
                  <InputField
                    label="Username" id="username" placeholder="johndoe123"
                    value={formData.username} onChange={handleChange}
                    autoComplete="username" required
                  />
                  <InputField
                    label="Password" id="password" type="password" placeholder="Min 6 characters"
                    value={formData.password} onChange={handleChange}
                    autoComplete="new-password" required
                  />
                  <SubmitButton loading={isPending} label="Create Account" />
                  <p className="text-center text-sm text-gray-600 dark:text-gray-500 mt-5">
                    Already have an account?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              {/* ── OTP STEP 1 ── */}
              {mode === 'otp' && otpStep === 1 && (
                <form onSubmit={handleSendOTP} noValidate>
                  <div className="mb-4">
                    <label htmlFor="otp-mobile" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="otp-mobile"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile"
                        value={otpMobile}
                        onChange={e => { setLocalError(''); setOtpMobile(e.target.value.replace(/\D/g, '')); }}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <SubmitButton loading={false} label="Send OTP" />
                  <p className="text-center text-sm text-gray-600 dark:text-gray-500 mt-5">
                    Use password instead?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              {/* ── OTP STEP 2 ── */}
              {mode === 'otp' && otpStep === 2 && (
                <div>
                  {/* Step dots */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 h-px bg-white/10 max-w-[32px]" />
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-[11px] font-bold">2</div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                      6-digit code
                    </label>
                    <OTPGrid onComplete={handleVerifyOTP} />
                    <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-500">
                      Didn't receive it?{' '}
                      {resendTimer > 0 ? (
                        <span className="text-gray-700 dark:text-gray-400">Resend in {resendTimer}s</span>
                      ) : (
                        <button type="button" onClick={handleResendOTP} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-sm text-gray-600 dark:text-gray-500">
                    Wrong number?{' '}
                    <button type="button" onClick={() => setOtpStep(1)} className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors">
                      Go back
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-600 mt-6">
          By continuing, you agree to our{' '}
          <span className="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors">Terms</span>
          {' '}and{' '}
          <span className="text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
