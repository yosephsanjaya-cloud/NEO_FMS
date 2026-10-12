import React, { useState } from 'react';
import { useFMS } from '../../context/FMSContext';
import {
  Server,
  Mail,
  ShieldCheck,
  MessageSquareWarning,
  Building2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Send,
  Sliders,
  Globe,
  Database,
  Radio,
  Clock,
  Key,
  ShieldAlert,
  FileCode2,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  EmailParameterConfig, 
  LoginParameterConfig, 
  MessageParameterConfig, 
  BankingIntegrationConfig 
} from '../../types/systemParameter';
import { SlaParameterSettings } from '../../components/system-parameter/SlaParameterSettings';

type ParameterTab = 'email' | 'login' | 'message' | 'integration' | 'sla';

export const ApplicationParameterPage: React.FC = () => {
  const { 
    applicationParameters, 
    updateApplicationParameters, 
    resetApplicationParameters,
    emailTemplates 
  } = useFMS();

  const [activeTab, setActiveTab] = useState<ParameterTab>('email');

  // Form States cloned from Context
  const [emailForm, setEmailForm] = useState<EmailParameterConfig>(applicationParameters.email);
  const [loginForm, setLoginForm] = useState<LoginParameterConfig>(applicationParameters.login);
  const [messageForm, setMessageForm] = useState<MessageParameterConfig>(applicationParameters.message);
  const [integrationForm, setIntegrationForm] = useState<BankingIntegrationConfig>(applicationParameters.integration);

  // Password Visibility toggles
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showPop3Password, setShowPop3Password] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Connection Testing Modals / Status
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestingBiApi, setIsTestingBiApi] = useState(false);
  const [testResultModal, setTestResultModal] = useState<{
    title: string;
    status: 'success' | 'failed';
    details: string[];
  } | null>(null);

  // Previewing selected message in Tab 3
  const [selectedPreviewMessage, setSelectedPreviewMessage] = useState<keyof MessageParameterConfig>('concurrentLoginAlert');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Save Handlers
  const handleSaveEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateApplicationParameters('email', emailForm, 'Pembaruan konfigurasi SMTP/POP3 Email Parameter v1.14');
    showToast('Parameter Email updated successfully! Konfigurasi SMTP & POP3 tersimpan.');
  };

  const handleSaveLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateApplicationParameters('login', loginForm, 'Pembaruan kebijakan Security & Login Parameter v1.14');
    showToast('Parameter Security & Login updated successfully! Kebijakan sesi dan IP aktif.');
  };

  const handleSaveMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateApplicationParameters('message', messageForm, 'Pembaruan teks pesan kesalahan & respon sistem v1.14');
    showToast('Parameter Message updated successfully! Seluruh respon sistem telah diperbarui.');
  };

  const handleSaveIntegration = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateApplicationParameters('integration', integrationForm, 'Pembaruan konfigurasi Bank Sampoerna & BI Antasena v1.14');
    showToast('Parameter Banking & Integration updated successfully! Parameter BI Antasena tersimpan.');
  };

  const handleSaveAll = () => {
    updateApplicationParameters('all', {
      email: emailForm,
      login: loginForm,
      message: messageForm,
      integration: integrationForm
    }, 'Pembaruan menyeluruh seluruh bundle Application Parameter FMS v1.14');
    showToast('Seluruh Application Parameter updated successfully! Audit trail perbankan tercatat.');
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh parameter ke konfigurasi awal default sistem?')) {
      resetApplicationParameters();
      setEmailForm(applicationParameters.email);
      setLoginForm(applicationParameters.login);
      setMessageForm(applicationParameters.message);
      setIntegrationForm(applicationParameters.integration);
      showToast('Parameter dikembalikan ke konfigurasi default sistem.', 'info');
    }
  };

  // Realistic Diagnostic Test Handlers
  const runSmtpDiagnostic = () => {
    setIsTestingSmtp(true);
    setTimeout(() => {
      setIsTestingSmtp(false);
      setTestResultModal({
        title: 'SMTP Mail Server Diagnostic Check',
        status: emailForm.isActive ? 'success' : 'failed',
        details: emailForm.isActive ? [
          `Target Host: ${emailForm.smtpServer}:${emailForm.smtpPort}`,
          `Handshake TLS/SSL: ${emailForm.smtpSsl ? 'ESTABLISHED (TLS 1.3 Strict Mode)' : 'PLAIN TEXT (Insecure)'}`,
          `Authentication User: ${emailForm.smtpUserId} (Authenticated OK)`,
          `Sender Address Verified: ${emailForm.smtpFrom}`,
          `Roundtrip Latency: 42 ms`,
          `Status: Ready to dispatch fraud alert notifications`
        ] : [
          `Target Host: ${emailForm.smtpServer}:${emailForm.smtpPort}`,
          `Error: Modul Email Parameter sedang dalam status 'Inactive'.`,
          `Silakan aktifkan toggle switch status modul terlebih dahulu.`
        ]
      });
    }, 900);
  };

  const runBiApiDiagnostic = () => {
    setIsTestingBiApi(true);
    setTimeout(() => {
      setIsTestingBiApi(false);
      setTestResultModal({
        title: 'BI Antasena & OneReporting Gateway Handshake',
        status: integrationForm.isActive ? 'success' : 'failed',
        details: integrationForm.isActive ? [
          `Sandi Bank Pelapor: ${integrationForm.sandiBankPelapor} (Bank Sahabat Sampoerna)`,
          `ID Organisasi Terdaftar: ${integrationForm.idOrganisasi}`,
          `Kode Kantor Pusat Konvensional: ${integrationForm.kodeKantorPusatKonvensional}`,
          `Kode Kantor Pusat Syariah: ${integrationForm.kodeKantorPusatSyariah}`,
          `Gateway Latency (BI Antasena Core): 58 ms`,
          `Validation Bypass Status: Antasena=${integrationForm.bypassBiAntasenaValidation ? 'BYPASS ACTIVE' : 'ENFORCED'}, OneReporting=${integrationForm.bypassOneReportingValidation ? 'BYPASS ACTIVE' : 'ENFORCED'}`,
          `Status: Endpoint Gateway Online & Siap Digunakan`
        ] : [
          `Error: Modul Banking & Integration Parameter sedang Nonaktif.`,
          `Silakan aktifkan status parameter sebelum melakukan pengujian konektivitas.`
        ]
      });
    }, 900);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="parameter-toast-notification"
          className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toastType === 'success' 
              ? 'bg-emerald-900 text-emerald-50 border-emerald-700' 
              : toastType === 'info'
                ? 'bg-blue-900 text-blue-50 border-blue-700'
                : 'bg-rose-900 text-rose-50 border-rose-700'
          }`}
        >
          {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastType === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          {toastType === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-white ml-2 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-violet-100 text-violet-800 border border-violet-200">
              v1.14 • Enterprise Engine Config
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Terakhir diubah: <strong className="text-slate-700">{applicationParameters.lastUpdated}</strong> oleh <strong className="text-slate-700">{applicationParameters.updatedBy}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-blue-600" />
            Application Parameter Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Konfigurasi terpusat parameter Email SMTP/POP3, Security Login, Pesan Respon Sistem, dan Integrasi Perbankan (BI Antasena &amp; OneReporting).
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="btn-reset-parameters"
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Reset Defaults
          </button>
          <button
            id="btn-save-all-parameters"
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Simpan Seluruh Perubahan
          </button>
        </div>
      </div>

      {/* Main Tabbed Card Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tab Navigation Header */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2">
          {/* Tab 1 */}
          <button
            id="tab-btn-email"
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Mail className={`w-4 h-4 ${activeTab === 'email' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tab 1: Email Configuration</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              emailForm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {emailForm.isActive ? 'Active' : 'Off'}
            </span>
          </button>

          {/* Tab 2 */}
          <button
            id="tab-btn-login"
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'login' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tab 2: Security &amp; Login</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              loginForm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {loginForm.isActive ? 'Active' : 'Off'}
            </span>
          </button>

          {/* Tab 3 */}
          <button
            id="tab-btn-message"
            type="button"
            onClick={() => setActiveTab('message')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'message'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <MessageSquareWarning className={`w-4 h-4 ${activeTab === 'message' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tab 3: System Error Messages</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              messageForm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {messageForm.isActive ? 'Active' : 'Off'}
            </span>
          </button>

          {/* Tab 4 */}
          <button
            id="tab-btn-integration"
            type="button"
            onClick={() => setActiveTab('integration')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'integration'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'integration' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Tab 4: Banking &amp; Integration</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              integrationForm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {integrationForm.isActive ? 'Active' : 'Off'}
            </span>
          </button>

          {/* Tab 5: SLA Threshold Parameter */}
          <button
            id="tab-btn-sla"
            type="button"
            onClick={() => setActiveTab('sla')}
            className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'sla'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'sla' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Tab 5: SLA Threshold Settings</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-indigo-100 text-indigo-800 font-bold">
              Dynamic
            </span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6">
          {/* ========================================================================= */}
          {/* TAB 1: EMAIL CONFIGURATION (EMAIL PARAMETER) */}
          {/* ========================================================================= */}
          {activeTab === 'email' && (
            <form onSubmit={handleSaveEmail} className="space-y-6">
              {/* Section Header & Active Status Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Email Parameter Configuration (SMTP &amp; POP3)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi server pengiriman email notifikasi fraud alert otomatis dan pemantauan inbox respon nasabah.
                  </p>
                </div>

                {/* Module Active Status Switch */}
                <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Status Parameter:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="toggle-email-active"
                      type="checkbox"
                      checked={emailForm.isActive}
                      onChange={(e) => setEmailForm({ ...emailForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${emailForm.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {emailForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Grid: SMTP Configuration */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">SMTP Server Settings (Outgoing Alerts)</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Protocol: RFC 5321 (ESMTP)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {/* SMTP Server */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Server <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-smtp-server"
                      type="text"
                      value={emailForm.smtpServer}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpServer: e.target.value })}
                      placeholder="e.g. smtp.banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                      required
                    />
                  </div>

                  {/* SMTP Port */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Port <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-smtp-port"
                      type="number"
                      value={emailForm.smtpPort}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpPort: parseInt(e.target.value) || 0 })}
                      placeholder="587 / 465 / 25"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                      required
                    />
                  </div>

                  {/* SMTP From */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP From Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-smtp-from"
                      type="email"
                      value={emailForm.smtpFrom}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpFrom: e.target.value })}
                      placeholder="e.g. fms.alert@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* SMTP User ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP User ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-smtp-userid"
                      type="text"
                      value={emailForm.smtpUserId}
                      onChange={(e) => setEmailForm({ ...emailForm, smtpUserId: e.target.value })}
                      placeholder="e.g. fms-mailer@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* SMTP Password with Eye toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      SMTP Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="input-smtp-password"
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={emailForm.smtpPassword}
                        onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 pr-10 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                        required
                      />
                      <button
                        id="btn-toggle-show-smtp-pass"
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showSmtpPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* SMTP SSL Toggle Switch */}
                  <div className="flex flex-col justify-center">
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                      SMTP SSL / TLS Encryption
                    </span>
                    <label className="inline-flex items-center cursor-pointer mt-1">
                      <input
                        id="toggle-smtp-ssl"
                        type="checkbox"
                        checked={emailForm.smtpSsl}
                        onChange={(e) => setEmailForm({ ...emailForm, smtpSsl: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2.5 text-xs font-medium text-slate-700">
                        {emailForm.smtpSsl ? 'SSL / TLS Enforced (Secure)' : 'Unencrypted Plain Port'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Grid: POP3 Configuration */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">POP3 Server Settings (Incoming Inbox)</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Protocol: RFC 1939 (POP3S)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {/* POP3 Server */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      POP3 Server
                    </label>
                    <input
                      id="input-pop3-server"
                      type="text"
                      value={emailForm.pop3Server}
                      onChange={(e) => setEmailForm({ ...emailForm, pop3Server: e.target.value })}
                      placeholder="e.g. pop3.banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                    />
                  </div>

                  {/* POP3 Port */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      POP3 Port
                    </label>
                    <input
                      id="input-pop3-port"
                      type="number"
                      value={emailForm.pop3Port}
                      onChange={(e) => setEmailForm({ ...emailForm, pop3Port: parseInt(e.target.value) || 0 })}
                      placeholder="995 / 110"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                    />
                  </div>

                  {/* POP3 User ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      POP3 User ID
                    </label>
                    <input
                      id="input-pop3-userid"
                      type="text"
                      value={emailForm.pop3UserId}
                      onChange={(e) => setEmailForm({ ...emailForm, pop3UserId: e.target.value })}
                      placeholder="e.g. fms-inbox@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  {/* POP3 Password with Eye toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      POP3 Password
                    </label>
                    <div className="relative">
                      <input
                        id="input-pop3-password"
                        type={showPop3Password ? 'text' : 'password'}
                        value={emailForm.pop3Password}
                        onChange={(e) => setEmailForm({ ...emailForm, pop3Password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 pr-10 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-mono"
                      />
                      <button
                        id="btn-toggle-show-pop3-pass"
                        type="button"
                        onClick={() => setShowPop3Password(!showPop3Password)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPop3Password ? 'Hide password' : 'Show password'}
                      >
                        {showPop3Password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* POP3 SSL Toggle */}
                  <div className="flex flex-col justify-center">
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                      POP3 SSL / TLS
                    </span>
                    <label className="inline-flex items-center cursor-pointer mt-1">
                      <input
                        id="toggle-pop3-ssl"
                        type="checkbox"
                        checked={emailForm.pop3Ssl}
                        onChange={(e) => setEmailForm({ ...emailForm, pop3Ssl: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2.5 text-xs font-medium text-slate-700">
                        {emailForm.pop3Ssl ? 'POP3S Secure (Port 995)' : 'Plain POP3 (Port 110)'}
                      </span>
                    </label>
                  </div>

                  {/* Is Body HTML Toggle */}
                  <div className="flex flex-col justify-center">
                    <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Body Format: Is Body HTML?
                    </span>
                    <label className="inline-flex items-center cursor-pointer mt-1">
                      <input
                        id="toggle-is-body-html"
                        type="checkbox"
                        checked={emailForm.isBodyHtml}
                        onChange={(e) => setEmailForm({ ...emailForm, isBodyHtml: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2.5 text-xs font-medium text-slate-700">
                        {emailForm.isBodyHtml ? 'HTML / Rich Text Formatting' : 'Plain Text Only'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-3">
                <button
                  id="btn-test-smtp-connection"
                  type="button"
                  onClick={runSmtpDiagnostic}
                  disabled={isTestingSmtp}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isTestingSmtp ? (
                    <RefreshCw className="w-4 h-4 mr-2 text-blue-600 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2 text-blue-600" />
                  )}
                  {isTestingSmtp ? 'Menguji Koneksi...' : 'Test SMTP Connection'}
                </button>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    id="btn-save-email-parameters"
                    type="submit"
                    className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Email Parameter
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SECURITY & LOGIN PARAMETER (LOGIN PARAMETER) */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleSaveLogin} className="space-y-6">
              {/* Section Header & Active Status Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Security &amp; Login Parameter Configuration
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kebijakan otentikasi login, pembatasan subnet IP, session timeout, dan integrasi modul approval alert.
                  </p>
                </div>

                {/* Module Active Status Switch */}
                <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Status Parameter:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="toggle-login-active"
                      type="checkbox"
                      checked={loginForm.isActive}
                      onChange={(e) => setLoginForm({ ...loginForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${loginForm.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {loginForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Core Login Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200">
                {/* 1. Check IP Address Toggle */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-blue-600" />
                        Check IP Address (Subnet Filtering)
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        loginForm.checkIpAddress ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {loginForm.checkIpAddress ? 'Enforced' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Wajibkan validasi subnet IP Address pengguna saat proses login. Mengabaikan IP asing di luar jaringan Bank Sampoerna (10.10.x.x / VPN Corp).
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Aktifkan Pemeriksaan IP:</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="toggle-check-ip"
                        type="checkbox"
                        checked={loginForm.checkIpAddress}
                        onChange={(e) => setLoginForm({ ...loginForm, checkIpAddress: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* 2. Session Timeout */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Session Timeout (Idle Duration)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                        {loginForm.sessionTimeout} Menit
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Durasi waktu ketidakaktifan (idle) sebelum sesi web diputuskan secara otomatis untuk mencegah akses tanpa pengawasan.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Durasi Timeout (Menit) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        id="input-session-timeout"
                        type="number"
                        min="5"
                        max="240"
                        value={loginForm.sessionTimeout}
                        onChange={(e) => setLoginForm({ ...loginForm, sessionTimeout: parseInt(e.target.value) || 30 })}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                        required
                      />
                      <span className="text-xs text-slate-500 shrink-0 font-medium">Menit</span>
                    </div>
                  </div>
                </div>

                {/* 3. Email Template Module Approval */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-purple-600" />
                      Email Template Module Approval
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-bold">
                      {loginForm.emailTemplateModuleApproval}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    Pilih template email standar yang otomatis dikirimkan ke supervisor/L2 saat permohonan approval alert atau eskalasi investigasi diajukan.
                  </p>

                  <select
                    id="select-approval-email-template"
                    value={loginForm.emailTemplateModuleApproval}
                    onChange={(e) => setLoginForm({ ...loginForm, emailTemplateModuleApproval: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  >
                    {emailTemplates.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>
                        [{tpl.id}] {tpl.templateName} — Subject: {tpl.emailSubject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra Enterprise Security Policies */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Enterprise Credential &amp; Lockout Policies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Failed Attempts
                    </label>
                    <input
                      id="input-max-failed-attempts"
                      type="number"
                      min="1"
                      max="10"
                      value={loginForm.maxLoginAttempts}
                      onChange={(e) => setLoginForm({ ...loginForm, maxLoginAttempts: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Akun terkunci jika gagal {loginForm.maxLoginAttempts}x berturut-turut</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lockout Duration (Mins)
                    </label>
                    <input
                      id="input-lockout-duration"
                      type="number"
                      min="5"
                      max="1440"
                      value={loginForm.lockoutDurationMinutes}
                      onChange={(e) => setLoginForm({ ...loginForm, lockoutDurationMinutes: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Durasi pemblokiran sementara</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password Expiry (Days)
                    </label>
                    <input
                      id="input-password-expiry-days"
                      type="number"
                      min="15"
                      max="365"
                      value={loginForm.passwordExpiryDays}
                      onChange={(e) => setLoginForm({ ...loginForm, passwordExpiryDays: parseInt(e.target.value) || 90 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Masa rotasi wajib kata sandi</span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">
                      First Login Reset
                    </span>
                    <label className="inline-flex items-center cursor-pointer mt-1">
                      <input
                        id="toggle-force-pass-change"
                        type="checkbox"
                        checked={loginForm.forcePasswordChangeFirstLogin}
                        onChange={(e) => setLoginForm({ ...loginForm, forcePasswordChangeFirstLogin: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-xs font-medium text-slate-700">Wajib ubah sandi</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  id="btn-save-login-parameters"
                  type="submit"
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Login Parameter
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SYSTEM ERROR MESSAGES (MESSAGE PARAMETER) */}
          {/* ========================================================================= */}
          {activeTab === 'message' && (
            <form onSubmit={handleSaveMessage} className="space-y-6">
              {/* Section Header & Active Status Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquareWarning className="w-5 h-5 text-blue-600" />
                    System Error Messages (Message Parameter)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola teks notifikasi respon sistem &amp; kegagalan login secara langsung dari UI tanpa perlu redeploy kode aplikasi.
                  </p>
                </div>

                {/* Module Active Status Switch */}
                <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Status Parameter:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="toggle-message-active"
                      type="checkbox"
                      checked={messageForm.isActive}
                      onChange={(e) => setMessageForm({ ...messageForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${messageForm.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {messageForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Message Fields List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-4">
                  {/* Field 1: User Login Fail Because Disabled */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        User Login Fail Because Disabled
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewMessage('userLoginFailBecauseDisabled')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Lihat Preview &rarr;
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Pesan yang muncul ketika kredensial valid namun status akun user di database ditandai sebagai "Disabled" / "Inactive".
                    </p>
                    <textarea
                      id="input-msg-user-disabled"
                      rows={2}
                      value={messageForm.userLoginFailBecauseDisabled}
                      onChange={(e) => setMessageForm({ ...messageForm, userLoginFailBecauseDisabled: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Field 2: User Inactive Response Text */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        User Inactive Response Text
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewMessage('userInactiveResponseText')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Lihat Preview &rarr;
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Respon dialog yang dikembalikan saat otorisasi token sesi mendeteksi perubahan status pengguna menjadi nonaktif.
                    </p>
                    <textarea
                      id="input-msg-user-inactive"
                      rows={2}
                      value={messageForm.userInactiveResponseText}
                      onChange={(e) => setMessageForm({ ...messageForm, userInactiveResponseText: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Field 3: Concurrent Login Alert */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-purple-600" />
                        Concurrent Login Alert
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewMessage('concurrentLoginAlert')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Lihat Preview &rarr;
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Peringatan konflik saat terdeteksi sesi login aktif bersamaan pada mesin komputer / browser lain.
                    </p>
                    <input
                      id="input-msg-concurrent-login"
                      type="text"
                      value={messageForm.concurrentLoginAlert}
                      onChange={(e) => setMessageForm({ ...messageForm, concurrentLoginAlert: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-800"
                      required
                    />
                  </div>

                  {/* Field 4: Password Retry Exceeded Response */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        Password Retry Exceeded Response
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewMessage('passwordRetryExceededResponse')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Lihat Preview &rarr;
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Pesan kegagalan saat pengguna salah memasukkan kata sandi melebihi ambang batas percobaan (Max Failed Attempts).
                    </p>
                    <textarea
                      id="input-msg-retry-exceeded"
                      rows={2}
                      value={messageForm.passwordRetryExceededResponse}
                      onChange={(e) => setMessageForm({ ...messageForm, passwordRetryExceededResponse: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Field 5: Invalid Credential Response */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-slate-700" />
                        Invalid Credential Response
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedPreviewMessage('invalidCredentialResponse')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        Lihat Preview &rarr;
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Pesan standar respon kegagalan username atau password tidak cocok (mencegah user enumeration).
                    </p>
                    <input
                      id="input-msg-invalid-credential"
                      type="text"
                      value={messageForm.invalidCredentialResponse}
                      onChange={(e) => setMessageForm({ ...messageForm, invalidCredentialResponse: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-slate-800"
                      required
                    />
                  </div>
                </div>

                {/* Right Column: Live Message Render Simulator */}
                <div className="lg:col-span-4">
                  <div className="sticky top-6 bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        Live UI Simulator
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Bank Sampoerna FMS
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-xs text-slate-400">
                        Simulasi rendering dialog modal / alert banner pada halaman login pengguna:
                      </p>

                      {/* Mock UI Alert Box */}
                      <div className="bg-rose-950/70 border border-rose-800 text-rose-200 rounded-lg p-3.5 shadow-xs">
                        <div className="flex items-start space-x-2.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold text-rose-300">
                              Otentikasi Gagal
                            </span>
                            <span className="block text-xs text-rose-100 mt-1 leading-relaxed">
                              {messageForm[selectedPreviewMessage] || 'Pesan belum diisi'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block mb-1">
                          Variabel yang Sedang Ditinjau:
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-400 block bg-slate-800/60 px-2 py-1 rounded">
                          {selectedPreviewMessage}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  id="btn-save-message-parameters"
                  type="submit"
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Message Parameter
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BANKING & INTEGRATION PARAMETER (APPLICATION PARAMETER) */}
          {/* ========================================================================= */}
          {activeTab === 'integration' && (
            <form onSubmit={handleSaveIntegration} className="space-y-6">
              {/* Section Header & Active Status Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Banking &amp; Integration Parameter (Bank Sampoerna &amp; BI Antasena)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Konfigurasi sandi bank pelapor, identitas kantor pusat (Konvensional &amp; Syariah), bypass validasi BI Antasena / OneReporting, dan batas XML.
                  </p>
                </div>

                {/* Module Active Status Switch */}
                <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">Status Parameter:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="toggle-integration-active"
                      type="checkbox"
                      checked={integrationForm.isActive}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className={`text-xs font-bold ${integrationForm.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {integrationForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Group 1: Bank Identifiers */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Bank Identifiers &amp; Gateway Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {/* Kode Kantor Pusat Konvensional */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kode Kantor Pusat Konvensional <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kode-kp-konven"
                      type="text"
                      value={integrationForm.kodeKantorPusatKonvensional}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, kodeKantorPusatKonvensional: e.target.value })}
                      placeholder="e.g. 023001"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Sandi KC Pusat Konven</span>
                  </div>

                  {/* Kode Kantor Pusat Syariah */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kode Kantor Pusat Syariah <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-kode-kp-syariah"
                      type="text"
                      value={integrationForm.kodeKantorPusatSyariah}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, kodeKantorPusatSyariah: e.target.value })}
                      placeholder="e.g. 023002"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Sandi Unit Usaha Syariah</span>
                  </div>

                  {/* Sandi Bank Pelapor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sandi Bank Pelapor <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-sandi-bank-pelapor"
                      type="text"
                      value={integrationForm.sandiBankPelapor}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, sandiBankPelapor: e.target.value })}
                      placeholder="023"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">023 (Bank Sahabat Sampoerna)</span>
                  </div>

                  {/* ID Organisasi */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ID Organisasi Gateway <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-id-organisasi"
                      type="text"
                      value={integrationForm.idOrganisasi}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, idOrganisasi: e.target.value })}
                      placeholder="e.g. BKS-FMS-PROD-01"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Identitas instansi pada API BI</span>
                  </div>

                  {/* Core Banking Primary IP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Core Banking Primary IP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-core-banking-primary-ip"
                      type="text"
                      value={integrationForm.coreBankingPrimaryIp}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, coreBankingPrimaryIp: e.target.value })}
                      placeholder="10.196.242.20"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Primary switch node (10.196.242.20)</span>
                  </div>

                  {/* Core Banking Secondary IP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Core Banking Secondary IP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-core-banking-secondary-ip"
                      type="text"
                      value={integrationForm.coreBankingSecondaryIp}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, coreBankingSecondaryIp: e.target.value })}
                      placeholder="10.196.242.21"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Backup switch node (10.196.242.21)</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Regulatory Validation Bypasses */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Regulatory Validation Bypasses (Emergency &amp; Maintenance)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {/* Bypass BI Antasena Validation */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          Bypass BI Antasena Validation
                        </span>
                        {integrationForm.bypassBiAntasenaValidation && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold font-mono">
                            BYPASS ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Lewati skema validasi xsd/json antasena secara lokal sebelum diserahkan ke pipeline Bank Indonesia.
                      </p>
                    </div>

                    <label className="inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input
                        id="toggle-bypass-antasena"
                        type="checkbox"
                        checked={integrationForm.bypassBiAntasenaValidation}
                        onChange={(e) => setIntegrationForm({ ...integrationForm, bypassBiAntasenaValidation: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {/* Bypass OneReporting Validation */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">
                          Bypass OneReporting Validation
                        </span>
                        {integrationForm.bypassOneReportingValidation && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold font-mono">
                            BYPASS ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Abaikan error pra-validasi format file OneReporting OJK saat proses konsolidasi batch fraud report.
                      </p>
                    </div>

                    <label className="inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input
                        id="toggle-bypass-onereporting"
                        type="checkbox"
                        checked={integrationForm.bypassOneReportingValidation}
                        onChange={(e) => setIntegrationForm({ ...integrationForm, bypassOneReportingValidation: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Group 3: Data Limits & Timeouts */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  Payload Limits &amp; Communication Timeouts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  {/* Maximum Row to Export Error Validation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Row to Export Error
                    </label>
                    <input
                      id="input-max-export-row"
                      type="number"
                      min="1000"
                      max="1000000"
                      step="1000"
                      value={integrationForm.maxRowToExportErrorValidation}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, maxRowToExportErrorValidation: parseInt(e.target.value) || 100000 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Batas baris excel error (default: 100000)</span>
                  </div>

                  {/* Max Size XML */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Size XML (MB)
                    </label>
                    <input
                      id="input-max-size-xml"
                      type="number"
                      min="1"
                      max="500"
                      value={integrationForm.maxSizeXml}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, maxSizeXml: parseInt(e.target.value) || 50 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Maksimal ukuran file XML payload</span>
                  </div>

                  {/* TimeOut API BI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      TimeOut API BI (Detik)
                    </label>
                    <input
                      id="input-timeout-api-bi"
                      type="number"
                      min="5"
                      max="600"
                      value={integrationForm.timeoutApiBi}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, timeoutApiBi: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Batas tunggu respon gateway BI</span>
                  </div>

                  {/* XMLRPC Request Timeout */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      XMLRPC Request Timeout (Detik)
                    </label>
                    <input
                      id="input-xmlrpc-timeout"
                      type="number"
                      min="5"
                      max="300"
                      value={integrationForm.xmlrpcRequestTimeout}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, xmlrpcRequestTimeout: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Batas socket XML-RPC connection</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-3">
                <button
                  id="btn-test-bi-gateway"
                  type="button"
                  onClick={runBiApiDiagnostic}
                  disabled={isTestingBiApi}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isTestingBiApi ? (
                    <RefreshCw className="w-4 h-4 mr-2 text-blue-600 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4 mr-2 text-emerald-600" />
                  )}
                  {isTestingBiApi ? 'Menghubungi Endpoint...' : 'Test BI Gateway Handshake'}
                </button>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    id="btn-save-integration-parameters"
                    type="submit"
                    className="inline-flex items-center px-5 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Integration Parameter
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: DYNAMIC SLA THRESHOLD SETTINGS */}
          {/* ========================================================================= */}
          {activeTab === 'sla' && (
            <SlaParameterSettings showToast={showToast} />
          )}
        </div>
      </div>

      {/* Connection Diagnostic Result Modal */}
      {testResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className={`p-4 border-b flex items-center justify-between ${
              testResultModal.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center space-x-2.5">
                {testResultModal.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className={`text-sm font-bold ${
                  testResultModal.status === 'success' ? 'text-emerald-900' : 'text-rose-900'
                }`}>
                  {testResultModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTestResultModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                testResultModal.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {testResultModal.status === 'success' ? 'DIAGNOSTIC PASSED' : 'DIAGNOSTIC FAILED'}
              </span>

              <div className="bg-slate-900 text-slate-200 font-mono text-xs rounded-lg p-3 space-y-1.5 overflow-x-auto">
                {testResultModal.details.map((line, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="text-slate-500 select-none">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setTestResultModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Tutup Hasil Diagnostik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
