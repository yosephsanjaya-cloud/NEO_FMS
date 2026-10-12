import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  X,
  Building2,
  Users,
  CheckCircle2,
  Key,
  ShieldAlert,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS, DemoAccountItem } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogleSSO } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Silakan lengkapi username dan kata sandi!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      if (!result.success) {
        setErrorMessage(result.message || 'Username atau kata sandi tidak valid!');
        setIsLoading(false);
      }
      // On success, state updates and App.tsx automatically switches to Dashboard
    }, 400);
  };

  const handleGoogleSSO = () => {
    setErrorMessage(null);
    setIsSsoLoading(true);

    setTimeout(() => {
      loginWithGoogleSSO();
    }, 600);
  };

  const handleQuickFill = (acc: DemoAccountItem) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setSelectedDemoUser(acc.username);
    setErrorMessage(null);
  };

  const getDomainBadge = (domain: string) => {
    switch (domain) {
      case 'FRAUD ONLY':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'AML ONLY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FULL ACCESS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans select-none">
      {/* Background Decorative Soft Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-blue-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f060_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f060_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
      />

      {/* Main Container - Responsive 2-Column on large screens */}
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Top Header / Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              NEO FMS
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
              v1.22 Bento Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Bank Sahabat Sampoerna • Real-Time Fraud Detection &amp; Anti-Money Laundering (AML/CFT) Defense Platform
          </p>
        </div>

        {/* 2-Column Grid Layout: Login Form on Left, Quick Accounts Hint Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Main Login Card (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 text-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">Masuk ke Sistem</h2>
              <p className="text-xs text-slate-500">Gunakan akun perbankan terdaftar Anda untuk otentikasi.</p>
            </div>

            {/* Validation Error Alert */}
            {errorMessage && (
              <div 
                id="login-error-alert" 
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-shake"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Selected Quick Fill Indicator */}
            {selectedDemoUser && (
              <div className="mb-4 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Akun aktif: <strong className="font-mono text-blue-900">{selectedDemoUser}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDemoUser(null);
                    setUsername('');
                    setPassword('');
                  }}
                  className="text-[10px] text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. sysadmin, afcl1, analystl1"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium font-mono"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Sandi / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 transition-colors font-medium cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium font-mono"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isLoading || isSsoLoading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <span>Login System</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">
                  Atau masuk menggunakan
                </span>
              </div>
            </div>

            {/* SSO Google Button */}
            <button
              id="btn-sso-google"
              type="button"
              onClick={handleGoogleSSO}
              disabled={isLoading || isSsoLoading}
              className="w-full py-2 px-4 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSsoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
                  <span>Menghubungkan ke Google Workspace...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Login Enterprise Google SSO</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT: Quick Hint Box / Demo Credentials Card (7 cols on lg) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 text-slate-900">
            
            {/* Header Hint Box */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Informasi Akun Pengujian (Testing Credentials)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih akun simulasi peran di bawah ini untuk Auto-Fill cepat
                  </p>
                </div>
              </div>
              
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold border border-slate-200">
                <Key className="w-3 h-3 text-slate-500" />
                <span>Pass: Sandi!234</span>
              </div>
            </div>

            {/* Universal Password Banner */}
            <div className="mb-4 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Universal Password untuk seluruh akun simulasi:</span>
              </div>
              <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                Sandi!234
              </span>
            </div>

            {/* Demo Accounts List */}
            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = (username === acc.username || selectedDemoUser === acc.username);
                return (
                  <div
                    key={acc.username}
                    onClick={() => handleQuickFill(acc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    {/* Left: Avatar & User details */}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        acc.riskDomain === 'FULL ACCESS'
                          ? 'bg-purple-600 text-white'
                          : acc.riskDomain === 'FRAUD ONLY'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {acc.avatar}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs font-mono">
                            {acc.username}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold font-mono border uppercase tracking-wider ${getDomainBadge(acc.riskDomain)}`}>
                            {acc.riskDomain}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          {acc.fullName} • <span className="text-slate-500">{acc.role}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>Group: <strong className="text-slate-600 font-semibold">{acc.group}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Fill Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickFill(acc);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terpilih</span>
                          </>
                        ) : (
                          <>
                            <span>Quick Fill</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note info */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Klik pada salah satu baris akun untuk langsung mengisi form.</span>
              <span className="font-mono text-[10px]">RBAC Synchronized</span>
            </div>

          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Bank Sahabat Sampoerna Enterprise IT &amp; Security Division • Protected under ISO 27001 &amp; OJK POJK Compliance</span>
        </div>

      </div>

      {/* Lupa Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 text-slate-900 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              Pemulihan Akses &amp; Sandi
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Sesuai dengan standar audit keamanan sistem perbankan Bank Sampoerna, reset kata sandi hanya dapat dilakukan melalui Administrator Sistem IT.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700 mb-5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">IT Helpdesk:</span>
                <span className="font-semibold text-blue-600">Ext. 8820 / 8821</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-blue-600">itsupport@banksampoerna.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Hours:</span>
                <span className="font-semibold text-slate-700">24/7 SOC Ops</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;

