import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Scale, 
  UserCheck, 
  CreditCard, 
  Smartphone, 
  Phone, 
  Calendar, 
  User, 
  Building, 
  Tag, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Layers
} from 'lucide-react';
import { ListEntry } from '../../types/fms';

interface BlacklistDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ListEntry | null;
  onEdit?: (entry: ListEntry) => void;
}

export const BlacklistDetailModal: React.FC<BlacklistDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
  onEdit
}) => {
  if (!isOpen || !entry) return null;

  const isFraud = (entry.domain || entry.listCategory || 'FRAUD') === 'FRAUD';

  const getEntityIcon = () => {
    const cat = entry.entityType || entry.category;
    switch (cat) {
      case 'CIF':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'Source Account Number':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'Device ID':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'Phone Number':
        return <Phone className="w-4 h-4 text-amber-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isFraud ? 'bg-rose-50/80 border-rose-200' : 'bg-indigo-50/80 border-indigo-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              isFraud ? 'bg-rose-600 text-white border-rose-700' : 'bg-indigo-600 text-white border-indigo-700'
            }`}>
              {isFraud ? <ShieldAlert className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                  isFraud ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                }`}>
                  {isFraud ? '🛡️ FRAUD BLACKLIST' : '⚖️ AML BLACKLIST'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">ID: {entry.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{entry.holderName}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Entity Key Value Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                {getEntityIcon()} {entry.entityType || entry.category}
              </span>
              <button 
                onClick={() => copyToClipboard(entry.value)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer text-[10px] font-semibold"
              >
                <Copy className="w-3 h-3" /> Salin Nilai
              </button>
            </div>
            <div className="text-base font-mono font-bold text-slate-900 select-all tracking-wide">
              {entry.value}
            </div>
          </div>

          {/* Reason & Background */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Alasan Registrasi &amp; Temuan Investigasi
            </label>
            <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed">
              {entry.reason}
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Sumber Informasi</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{entry.source}</span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Bobot Risiko (Points)</span>
              <div className="font-mono font-bold text-rose-600 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-500" />
                <span>{entry.riskWeight} Pts / Block</span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Didata Oleh</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{entry.addedBy || 'FMS Officer'}</span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Trigger Terdeteksi</span>
              <div className="font-mono font-bold text-purple-700 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                <span>{entry.matchCount || 0} Kali Terblokir</span>
              </div>
            </div>
          </div>

          {/* Rule Applicability */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Cakupan Penerapan Rule (Rule Scope)
            </label>
            <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
              {entry.applyToAllRules !== false ? (
                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>🌐 GLOBAL (Berlaku untuk SEMUA Rule Basic)</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-blue-700 font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>🎯 SPECIFIC RULES ({entry.appliedRuleCodes?.length || 0} Rule)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(entry.appliedRuleCodes || []).map(code => (
                      <span key={code} className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Label &amp; Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-slate-400" /> #{tag}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 font-mono">
            Created: {entry.createdAt || 'N/A'}
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(entry);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                Edit Entitas
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
