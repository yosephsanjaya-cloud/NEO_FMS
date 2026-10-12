import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck, 
  Layers, 
  Sliders, 
  ShieldAlert, 
  ShieldCheck,
  Ban,
  UserCheck,
  CreditCard,
  Smartphone,
  Phone
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { RuleBasic, CaseUrgency, RuleDomain, AutoBlockConfig } from '../../types/fms';

export const RuleBasicModal: React.FC<{
  basic?: RuleBasic | null;
  initialDomain?: RuleDomain;
  onClose: () => void;
}> = ({ basic, initialDomain = 'Fraud', onClose }) => {
  const { ruleTemplates, createRuleBasic, updateRuleBasic } = useFMS();
  const isEdit = !!basic;

  const defaultTemplates = ruleTemplates.filter(t => (t.domain || 'Fraud') === (basic?.domain || initialDomain));
  const fallbackTemplate = defaultTemplates[0] || ruleTemplates[0];

  const [code, setCode] = useState(basic?.code || `R-TRX-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [templateCode, setTemplateCode] = useState(basic?.templateCode || fallbackTemplate?.code || 'TPL-VEL-01');
  const [name, setName] = useState(basic?.name || '');
  const [domain, setDomain] = useState<RuleDomain>(basic?.domain || initialDomain);
  const [description, setDescription] = useState(basic?.description || '');
  const [baseScore, setBaseScore] = useState<number>(basic?.baseScore || 65);
  const [caseUrgency, setCaseUrgency] = useState<CaseUrgency>(basic?.caseUrgency || 'High');
  const [txnType, setTxnType] = useState(basic?.txnType || 'BI-FAST Transfer');
  const [channel, setChannel] = useState(basic?.channel || 'Mobile Banking');
  const [author, setAuthor] = useState(basic?.author || 'Yoseph Sanjaya (FMS Admin)');

  // Auto-Block configuration state (CIF, Source Account Number, Device ID, Phone Number)
  const [autoBlock, setAutoBlock] = useState<AutoBlockConfig>(basic?.autoBlock || {
    cif: false,
    sourceAccountNumber: true,
    deviceId: false,
    phoneNumber: false
  });

  // Selected template object
  const selectedTemplate = ruleTemplates.find(t => t.code === templateCode) || ruleTemplates[0];

  // Parameter concrete values mapped from template placeholders
  const [paramValues, setParamValues] = useState<Record<string, any>>(() => {
    if (basic?.parameterValues) return basic.parameterValues;
    const initial: Record<string, any> = {};
    if (selectedTemplate) {
      selectedTemplate.parameters.forEach(p => {
        initial[p.key] = p.defaultValue;
      });
    }
    return initial;
  });

  // When template changes, initialize parameter placeholders and sync domain
  useEffect(() => {
    if (!isEdit && selectedTemplate) {
      if (selectedTemplate.domain) {
        setDomain(selectedTemplate.domain);
      }
      const initial: Record<string, any> = {};
      selectedTemplate.parameters.forEach(p => {
        initial[p.key] = p.defaultValue;
      });
      setParamValues(initial);
    }
  }, [templateCode, isEdit, selectedTemplate]);

  const handleParamChange = (key: string, val: any) => {
    setParamValues(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleToggleAutoBlock = (key: keyof AutoBlockConfig) => {
    setAutoBlock(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEdit && basic) {
      updateRuleBasic(basic.id, {
        code,
        name,
        domain,
        description,
        templateCode,
        templateVersion: selectedTemplate?.version || '1.0',
        baseScore,
        caseUrgency,
        txnType,
        channel,
        parameterValues: paramValues,
        autoBlock,
        author
      });
    } else {
      createRuleBasic({
        code,
        domain,
        templateCode,
        templateVersion: selectedTemplate?.version || '1.0',
        name,
        description,
        baseScore,
        caseUrgency,
        txnType,
        channel,
        parameterValues: paramValues,
        autoBlock,
        author
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? `Edit Rule Basic: ${basic.code}` : 'Penerbitan Rule Basic Baru (Flow B)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update minor version 1.XX. Memerlukan testing ulang.' : 'Status bawaan: Inactive & Need Testing (v1.0)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs flex-1">
          
          {/* Section 1: Template Reference Selection */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>1. Referensi Rule Template (Cetak Biru)</span>
              </span>
              {selectedTemplate && (
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Version Template: v{selectedTemplate.version}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Pilih Rule Template Induk:</label>
              <select
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
                disabled={isEdit}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 disabled:opacity-70 font-medium"
              >
                {ruleTemplates.map(t => (
                  <option key={t.id} value={t.code}>
                    {t.code} - {t.name} (v{t.version}) [{t.domain || 'Fraud'}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Rule Metadata & Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Kode Rule Basic</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>

            {/* Domain: Fraud vs AML */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Domain Rule *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDomain('Fraud')}
                  className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    domain === 'Fraud'
                      ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Fraud Engine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDomain('AML')}
                  className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    domain === 'AML'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AML Engine</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nama Rule Basic *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Transaksi Instan Nominal di Atas 100 Juta dalam 10 Menit"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Deskripsi Rule</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsikan skenario investigasi dan indikator anomali..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Section 3: Concrete Parameter Values Injection */}
          {selectedTemplate && selectedTemplate.parameters.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>2. Konfigurasi Nilai Parameter Threshold</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedTemplate.parameters.map(p => (
                  <div key={p.id} className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block">
                      {p.label} <span className="font-mono text-blue-700 font-normal">({p.key})</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type={p.dataType === 'Number' ? 'number' : 'text'}
                        value={paramValues[p.key] ?? p.defaultValue}
                        onChange={(e) => handleParamChange(p.key, p.dataType === 'Number' ? Number(e.target.value) : e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                      {p.unit && <span className="text-slate-500 font-medium">{p.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Auto-Block Triggers (CIF, Source Account Number, Device ID, Phone Number) */}
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-600" />
                <span>3. Konfigurasi Otomatis Blokir (Auto-Block Triggers)</span>
              </span>
              <span className="text-[10px] text-red-700 font-semibold bg-red-100 px-2 py-0.5 rounded border border-red-200">
                Aksi Eksekusi Otomatis
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Pilih entitas yang akan otomatis diblokir saat transaksi nasabah memicu rule basic ini:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Blokir CIF */}
              <label 
                onClick={() => handleToggleAutoBlock('cif')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                  autoBlock.cif 
                    ? 'bg-red-600 text-white border-red-700 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span className="font-bold text-xs">Blokir CIF</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${autoBlock.cif ? 'bg-red-800 text-red-100' : 'text-slate-400'}`}>
                  {autoBlock.cif ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </label>

              {/* Blokir Source Account Number */}
              <label 
                onClick={() => handleToggleAutoBlock('sourceAccountNumber')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                  autoBlock.sourceAccountNumber 
                    ? 'bg-red-600 text-white border-red-700 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-bold text-xs text-center leading-tight">Blokir Source Account</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${autoBlock.sourceAccountNumber ? 'bg-red-800 text-red-100' : 'text-slate-400'}`}>
                  {autoBlock.sourceAccountNumber ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </label>

              {/* Blokir Device ID */}
              <label 
                onClick={() => handleToggleAutoBlock('deviceId')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                  autoBlock.deviceId 
                    ? 'bg-red-600 text-white border-red-700 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="font-bold text-xs">Blokir Device ID</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${autoBlock.deviceId ? 'bg-red-800 text-red-100' : 'text-slate-400'}`}>
                  {autoBlock.deviceId ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </label>

              {/* Blokir Phone Number */}
              <label 
                onClick={() => handleToggleAutoBlock('phoneNumber')}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition select-none ${
                  autoBlock.phoneNumber 
                    ? 'bg-red-600 text-white border-red-700 shadow-xs' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span className="font-bold text-xs">Blokir Phone No</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${autoBlock.phoneNumber ? 'bg-red-800 text-red-100' : 'text-slate-400'}`}>
                  {autoBlock.phoneNumber ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </label>

            </div>
          </div>

          {/* Section 5: Risk Weighting & Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Base Risk Score (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={baseScore}
                onChange={(e) => setBaseScore(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Case Urgency *</label>
              <select
                value={caseUrgency}
                onChange={(e) => setCaseUrgency(e.target.value as CaseUrgency)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="High">High Urgency</option>
                <option value="Med">Medium Urgency</option>
                <option value="Low">Low Urgency</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Channel Transaksi</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Internet Banking">Internet Banking</option>
                <option value="ATM">ATM</option>
                <option value="Open API">Open API / Direct Debit</option>
              </select>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Author: <strong className="text-slate-800">{author}</strong>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                {isEdit ? 'Simpan Rule Basic' : 'Terbitkan Rule Basic'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
