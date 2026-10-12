import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Globe, 
  QrCode, 
  CreditCard, 
  Layers,
  ShieldAlert,
  Info,
  Sliders
} from 'lucide-react';
import { 
  SlaConfig, 
  DEFAULT_SLA_CONFIG, 
  getStoredSlaConfig, 
  saveSlaConfigToSession 
} from '../../utils/slaMetrics';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';

interface SlaParameterSettingsProps {
  onSaved?: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SlaParameterSettings: React.FC<SlaParameterSettingsProps> = ({ 
  onSaved,
  showToast 
}) => {
  const { user } = useAuth();
  const { fraudCases, addAuditChangeLog } = useFMS();
  
  const isSysadmin = user?.username === 'sysadmin' || (user?.group || '').toLowerCase().includes('admin') || user?.riskDomain === 'FULL ACCESS';

  const [formConfig, setFormConfig] = useState<SlaConfig>(getStoredSlaConfig());
  const [initialConfig, setInitialConfig] = useState<SlaConfig>(getStoredSlaConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const current = getStoredSlaConfig();
    setFormConfig(current);
    setInitialConfig(current);
  }, []);

  const handleChange = (field: keyof SlaConfig, value: number) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: Math.max(1, value || 1)
    }));
    setSavedSuccess(false);
  };

  const handleResetDefault = () => {
    setFormConfig(DEFAULT_SLA_CONFIG);
    setSavedSuccess(false);
    if (showToast) {
      showToast('Form di-reset ke nilai default (MB/OB/QRIS/CARD: 24h, VA: 7d)', 'info');
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isSysadmin) {
      if (showToast) {
        showToast('Akses ditolak: Hanya Sysadmin yang dapat mengubah SLA Threshold Parameter.', 'error');
      }
      return;
    }

    // Persist to session storage and emit update event
    saveSlaConfigToSession(formConfig);
    setInitialConfig(formConfig);
    setSavedSuccess(true);

    // Add audit log
    if (addAuditChangeLog) {
      addAuditChangeLog({
        moduleTable: 'Application Parameter - SLA Threshold',
        recordId: 'SLA_CONFIG',
        actionType: 'UPDATE',
        userId: user?.id || user?.username || 'SYSADMIN-01',
        userName: user?.fullName || user?.username || 'Sysadmin Yoseph Sanjaya',
        userRole: user?.role || 'Lead Fraud Ops & AML',
        ipAddress: '10.14.88.21',
        reason: 'Pembaruan Dynamic SLA Threshold Parameter oleh Sysadmin',
        changes: [
          { fieldName: 'MB_hours', oldValue: `${initialConfig.MB_hours}h`, newValue: `${formConfig.MB_hours}h` },
          { fieldName: 'OB_hours', oldValue: `${initialConfig.OB_hours}h`, newValue: `${formConfig.OB_hours}h` },
          { fieldName: 'QRIS_hours', oldValue: `${initialConfig.QRIS_hours}h`, newValue: `${formConfig.QRIS_hours}h` },
          { fieldName: 'CARD_hours', oldValue: `${initialConfig.CARD_hours}h`, newValue: `${formConfig.CARD_hours}h` },
          { fieldName: 'VA_days', oldValue: `${initialConfig.VA_days}d`, newValue: `${formConfig.VA_days}d` }
        ]
      });
    }

    if (showToast) {
      showToast('SLA Threshold Parameter berhasil diperbarui! Perhitungan Dashboard telah disinkronkan.', 'success');
    }

    if (onSaved) {
      onSaved();
    }

    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-mono font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>SLA THRESHOLD ENGINE</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">v1.22 Dynamic Config</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Konfigurasi Ambang Batas SLA Transaksi</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Pengaturan batas waktu Service Level Agreement (SLA) per channel transaksi untuk menentukan eskalasi status kasus <strong className="text-amber-400">SLA OVER (Breach)</strong> pada Case Management &amp; Summary Dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={!isSysadmin}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isSysadmin}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Parameter SLA</span>
          </button>
        </div>
      </div>

      {!isSysadmin && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Mode Baca Saja (Read-Only):</strong> Anda login sebagai pengguna non-Sysadmin. Hanya role Sysadmin yang memiliki hak akses untuk mengubah ambang batas SLA parameter sistem.
          </span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Perubahan Tersimpan:</strong> Parameter SLA berhasil diterapkan secara live ke seluruh komponen Dashboard dan Case Management.
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 font-bold">100% Synced</span>
        </div>
      )}

      {/* SLA Configuration Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* 1. Mobile Banking (MB) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Mobile Banking (MB)</h3>
                <span className="text-[10px] font-mono text-slate-400">CHANNEL: MB</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Jam (Hours)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Batas maksimal penanganan kasus transaksi aplikasi Mobile Banking sebelum ditandai Over SLA.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <label htmlFor="input-sla-mb" className="text-xs font-semibold text-slate-700">
              Ambang Batas:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-sla-mb"
                type="number"
                min="1"
                max="720"
                disabled={!isSysadmin}
                value={formConfig.MB_hours}
                onChange={(e) => handleChange('MB_hours', parseInt(e.target.value, 10))}
                className="w-20 px-3 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-sm"
              />
              <span className="text-xs font-bold text-slate-500">Jam</span>
            </div>
          </div>
        </div>

        {/* 2. Online Banking (OB) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Online Banking (OB)</h3>
                <span className="text-[10px] font-mono text-slate-400">CHANNEL: OB / IB</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Jam (Hours)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Batas waktu penanganan kasus transaksi Internet Banking &amp; Corporate Web Portal.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <label htmlFor="input-sla-ob" className="text-xs font-semibold text-slate-700">
              Ambang Batas:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-sla-ob"
                type="number"
                min="1"
                max="720"
                disabled={!isSysadmin}
                value={formConfig.OB_hours}
                onChange={(e) => handleChange('OB_hours', parseInt(e.target.value, 10))}
                className="w-20 px-3 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-sm"
              />
              <span className="text-xs font-bold text-slate-500">Jam</span>
            </div>
          </div>
        </div>

        {/* 3. QRIS */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">QRIS Merchant / CPM</h3>
                <span className="text-[10px] font-mono text-slate-400">CHANNEL: QRIS</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Jam (Hours)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Batas waktu penanganan alert transaksi scan QRIS (Customer / Merchant Presented).
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <label htmlFor="input-sla-qris" className="text-xs font-semibold text-slate-700">
              Ambang Batas:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-sla-qris"
                type="number"
                min="1"
                max="720"
                disabled={!isSysadmin}
                value={formConfig.QRIS_hours}
                onChange={(e) => handleChange('QRIS_hours', parseInt(e.target.value, 10))}
                className="w-20 px-3 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-sm"
              />
              <span className="text-xs font-bold text-slate-500">Jam</span>
            </div>
          </div>
        </div>

        {/* 4. Debit / Credit Card (CARD) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Kartu Debit &amp; Kredit</h3>
                <span className="text-[10px] font-mono text-slate-400">CHANNEL: CARD</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Jam (Hours)
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Batas waktu investigasi transaksi ATM, EDC POS, Kartu Debit, dan Kartu Kredit.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <label htmlFor="input-sla-card" className="text-xs font-semibold text-slate-700">
              Ambang Batas:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-sla-card"
                type="number"
                min="1"
                max="720"
                disabled={!isSysadmin}
                value={formConfig.CARD_hours}
                onChange={(e) => handleChange('CARD_hours', parseInt(e.target.value, 10))}
                className="w-20 px-3 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-sm"
              />
              <span className="text-xs font-bold text-slate-500">Jam</span>
            </div>
          </div>
        </div>

        {/* 5. Virtual Account (VA) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Virtual Account (VA)</h3>
                <span className="text-[10px] font-mono text-slate-400">CHANNEL: VA (Long-term Settlement)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Hari ({formConfig.VA_days * 24} Jam)
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Batas waktu siklus transaksi Virtual Account (VA agregator/merchant) yang memerlukan waktu rekonsiliasi dan verifikasi bertahap lebih lama.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-slate-600">
              <span>Konversi: </span>
              <strong className="font-mono text-indigo-700">{formConfig.VA_days} Hari = {formConfig.VA_days * 24} Jam</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                id="input-sla-va"
                type="number"
                min="1"
                max="90"
                disabled={!isSysadmin}
                value={formConfig.VA_days}
                onChange={(e) => handleChange('VA_days', parseInt(e.target.value, 10))}
                className="w-20 px-3 py-1.5 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-sm"
              />
              <span className="text-xs font-bold text-slate-500">Hari</span>
            </div>
          </div>
        </div>

      </form>

      {/* Informational Parameter Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Aturan Integritas &amp; Persistensi Parameter SLA:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pl-1">
          <li>Nilai parameter secara otomatis tersimpan ke dalam <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">sessionStorage.fms_sla_config</code>.</li>
          <li>Setiap perubahan langsung memicu event reaktif <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">fms_sla_config_updated</code> ke seluruh komponen antrean dan summary cards.</li>
          <li>Jika sistem dibuka pertama kali tanpa konfigurasi tersimpan, nilai default standar perbankan (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">MB: 24h, OB: 24h, QRIS: 24h, CARD: 24h, VA: 7d</code>) akan otomatis digunakan.</li>
        </ul>
      </div>
    </div>
  );
};
