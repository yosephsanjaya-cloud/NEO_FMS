import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Plus, 
  Trash2, 
  Code, 
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { RuleTemplate, VariablePlaceholder, RuleDomain, AiCopilotMetadata } from '../../types/fms';
import { AiRuleCopilotPanel } from './AiRuleCopilotPanel';

export const RuleTemplateModal: React.FC<{
  template?: RuleTemplate | null;
  initialDomain?: RuleDomain;
  onClose: () => void;
}> = ({ template, initialDomain = 'Fraud', onClose }) => {
  const { createRuleTemplate, updateRuleTemplate, createRuleTicket } = useFMS();
  const { user } = useAuth();
  const isEdit = !!template;

  const [code, setCode] = useState(template?.code || `TPL-CUSTOM-${Math.floor(Math.random() * 900 + 100)}`);
  const [name, setName] = useState(template?.name || '');
  const [domain, setDomain] = useState<RuleDomain>(template?.domain || initialDomain);
  const [description, setDescription] = useState(template?.description || '');
  const [author, setAuthor] = useState(template?.author || (user?.fullName ? `${user.fullName} (${user.role || 'Maker'})` : 'Yoseph Sanjaya (FMS Admin)'));
  const [queryLogic, setQueryLogic] = useState(
    template?.queryLogic || 
    `SELECT cif, device_id, COUNT(trx_id) as txn_cnt\nFROM transactions\nWHERE timestamp >= NOW() - INTERVAL '{{TIME_WINDOW}} minute'\nGROUP BY cif, device_id\nHAVING COUNT(trx_id) >= {{TXN_LIMIT}}`
  );

  // Dynamic Parameter Placeholders list
  const [parameters, setParameters] = useState<VariablePlaceholder[]>(
    template?.parameters || [
      {
        id: `p-${Date.now()}-1`,
        key: '{{AMOUNT_LIMIT}}',
        label: 'Batas Nominal Transaksi',
        dataType: 'Number',
        defaultValue: 50000000,
        unit: 'IDR',
        description: 'Batas nominal transfer pemicu alert'
      }
    ]
  );

  // AI Rule Copilot States
  const [showCopilot, setShowCopilot] = useState(false);
  const [aiMetadata, setAiMetadata] = useState<AiCopilotMetadata | undefined>(template?.aiCopilot);
  const [copilotFeedback, setCopilotFeedback] = useState<string | null>(null);

  // Temporary single placeholder being added
  const [newKey, setNewKey] = useState('{{TIME_WINDOW}}');
  const [newLabel, setNewLabel] = useState('Rentang Waktu (Menit)');
  const [newType, setNewType] = useState<'Number' | 'String' | 'Boolean' | 'Enum'>('Number');
  const [newDefaultVal, setNewDefaultVal] = useState<any>('30');
  const [newUnit, setNewUnit] = useState('menit');
  const [showAddParamForm, setShowAddParamForm] = useState(false);

  const handleAddPlaceholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim()) return;

    const formattedKey = newKey.startsWith('{{') && newKey.endsWith('}}')
      ? newKey
      : `{{${newKey.replace(/[{}]/g, '').toUpperCase()}}}`;

    const newPlaceholder: VariablePlaceholder = {
      id: `p-${Date.now()}`,
      key: formattedKey,
      label: newLabel,
      dataType: newType,
      defaultValue: newType === 'Number' ? Number(newDefaultVal) : newDefaultVal,
      unit: newUnit
    };

    setParameters(prev => [...prev, newPlaceholder]);
    setNewKey('{{NEW_VAR}}');
    setNewLabel('');
    setNewDefaultVal('10');
    setNewUnit('');
    setShowAddParamForm(false);
  };

  const handleRemovePlaceholder = (id: string) => {
    setParameters(prev => prev.filter(p => p.id !== id));
  };

  const handleApplyFromCopilot = (generated: {
    name: string;
    domain: RuleDomain;
    description: string;
    queryLogic: string;
    parameters: VariablePlaceholder[];
    aiMetadata: AiCopilotMetadata;
  }) => {
    if (!name.trim()) setName(generated.name);
    setDomain(generated.domain);
    if (!description.trim() || description.startsWith('Cetak')) {
      setDescription(generated.description);
    }
    setQueryLogic(generated.queryLogic);
    setParameters(generated.parameters);
    setAiMetadata(generated.aiMetadata);
    setCopilotFeedback('Sintaks kueri, parameter placeholder, dan deskripsi AI berhasil diinjeksikan!');
    setTimeout(() => setCopilotFeedback(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || parameters.length === 0) return;

    const templatePayload = {
      code,
      name,
      domain,
      description,
      queryLogic,
      parameters,
      author,
      aiCopilot: aiMetadata
    };

    if (isEdit && template) {
      // Check if parameter structure changed (count or keys changed)
      const oldKeys = template.parameters.map(p => p.key).sort().join(',');
      const currentKeys = parameters.map(p => p.key).sort().join(',');
      const isStructureChanged = oldKeys !== currentKeys;

      updateRuleTemplate(template.id, templatePayload, isStructureChanged);

      // Create Maker-Checker Ticket for L2 Approval
      createRuleTicket({
        targetType: 'Template',
        targetCode: code,
        targetName: name,
        domain: domain,
        actionType: 'UPDATE',
        makerName: user?.fullName || author,
        makerRole: user?.role || 'Fraud Investigator L1 (Maker)',
        changeSummary: `Revisi Rule Template [${code}] - ${name}${aiMetadata?.isAiGenerated ? ' (Disusun dengan bantuan AI Copilot)' : ''}`,
        proposedData: {
          ...template,
          ...templatePayload
        },
        previousData: template,
        versionFrom: template.version,
        versionTo: isStructureChanged ? 'Major (v2.0)' : 'Minor'
      });
    } else {
      createRuleTemplate(templatePayload);

      // Create Maker-Checker Ticket for L2 Approval
      createRuleTicket({
        targetType: 'Template',
        targetCode: code,
        targetName: name,
        domain: domain,
        actionType: 'CREATE',
        makerName: user?.fullName || author,
        makerRole: user?.role || 'Fraud Investigator L1 (Maker)',
        changeSummary: `Pembuatan Rule Template baru [${code}] - ${name}${aiMetadata?.isAiGenerated ? ' (Disusun dengan bantuan AI Copilot)' : ''}`,
        proposedData: {
          id: `tpl-${Date.now()}`,
          version: '1.0',
          status: 'Inactive',
          testingStatus: 'Need Testing',
          createdOn: new Date().toISOString().replace('T', ' ').slice(0, 19),
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          ...templatePayload
        },
        versionFrom: '-',
        versionTo: '1.0'
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {isEdit ? `Edit Rule Template: ${template.code}` : 'Buat Rule Template Baru (Flow A)'}
                </h3>
                {aiMetadata?.isAiGenerated && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>AI Draft • Unverified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isEdit 
                  ? 'Perubahan parameter variabel akan memicu Major Update (v2.0) & menandai Rule Basic menjadi Out of Sync.'
                  : 'Status bawaan: Inactive & Need Testing (v1.0) • Memerlukan persetujuan L2 Checker via Approval Queue.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto text-xs flex-1">
          
          {/* Feedback banner */}
          {copilotFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{copilotFeedback}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Template Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isEdit}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-60"
              />
            </div>

            {/* Domain Selection: Fraud vs AML */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Domain Aturan (Rule Domain) *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDomain('Fraud')}
                  className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    domain === 'Fraud'
                      ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
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
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AML Engine</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nama Template *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Cetak Biru Transaksi Nominal Di Luar Profil Normal"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Deskripsi Blueprint</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan logika deteksi dan skenario penggunaan template ini..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Dynamic Parameter Placeholders (Variables) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Parameter Placeholders (Threshold Injection)</h4>
                <p className="text-[11px] text-slate-500">
                  Variabel ini akan menjadi input form konfigurasi saat analis membuat Rule Basic.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddParamForm(!showAddParamForm)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold flex items-center gap-1 border border-blue-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Variabel</span>
              </button>
            </div>

            {/* List of current parameters */}
            <div className="space-y-2">
              {parameters.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {p.key}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">{p.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Type: {p.dataType} • Default: {String(p.defaultValue)} {p.unit || ''}
                      </div>
                    </div>
                  </div>
                  {parameters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlaceholder(p.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Parameter Form */}
            {showAddParamForm && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="font-bold text-slate-800 text-[11px]">Form Tambah Variabel Placeholder</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Key Variabel</label>
                    <input
                      type="text"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="{{VARIABLE_NAME}}"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Label Input</label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="Contoh: Ambang Batas Frekuensi"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Tipe Data</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    >
                      <option value="Number">Number</option>
                      <option value="String">String</option>
                      <option value="Boolean">Boolean</option>
                      <option value="Enum">Enum</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Default Value</label>
                    <input
                      type="text"
                      value={newDefaultVal}
                      onChange={(e) => setNewDefaultVal(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Satuan (Unit)</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="e.g. IDR, kali, menit"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddParamForm(false)}
                    className="px-3 py-1 rounded bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPlaceholder}
                    className="px-3 py-1 rounded bg-blue-600 text-white font-semibold cursor-pointer"
                  >
                    Tambahkan ke Template
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Blueprint Query Logic Section with AI COPILOT TRIGGER */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Query Blueprint Logic (SQL / CQL) *</span>
              </label>

              {/* AI COPILOT ASSISTANT TRIGGER BUTTON */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-ai-copilot-trigger"
                  onClick={() => setShowCopilot(!showCopilot)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                    showCopilot
                      ? 'bg-indigo-700 text-white ring-2 ring-indigo-400/40'
                      : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/20 active:scale-95'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{showCopilot ? 'Tutup AI Copilot' : '✨ AI Copilot Assistant'}</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">Tag {'{{VARIABLE}}'}</span>
              </div>
            </div>

            {/* EXPANDABLE AI RULE COPILOT PANEL */}
            {showCopilot && (
              <div className="my-2">
                <AiRuleCopilotPanel
                  currentDomain={domain}
                  currentCode={code}
                  onApplyToTemplate={handleApplyFromCopilot}
                  onClose={() => setShowCopilot(false)}
                />
              </div>
            )}

            <textarea
              rows={5}
              required
              value={queryLogic}
              onChange={(e) => setQueryLogic(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 border border-slate-300 rounded-lg p-3 font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Author (Maker): <strong className="text-slate-800">{author}</strong>
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
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{isEdit ? 'Simpan Template (Version Bump)' : 'Ajukan Template (Maker L1)'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
