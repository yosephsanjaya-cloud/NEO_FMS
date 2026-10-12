import React from 'react';
import { 
  X, 
  FileCheck, 
  History, 
  Sliders, 
  Ban, 
  UserCheck, 
  CreditCard, 
  Smartphone, 
  Phone,
  RefreshCw
} from 'lucide-react';
import { RuleBasic } from '../../types/fms';
import { VersionBadge, SyncStatusBadge, TestingStatusBadge, UrgencyBadge, DomainBadge } from '../common/Badge';

interface Props {
  ruleBasic: RuleBasic;
  onClose: () => void;
}

export const RuleBasicViewModal: React.FC<Props> = ({ ruleBasic, onClose }) => {
  const autoBlock = ruleBasic.autoBlock || { cif: false, sourceAccountNumber: false, deviceId: false, phoneNumber: false };

  // Generate real or simulated history changes for Rule Basic
  const getBasicHistoryEntries = (rb: RuleBasic) => {
    // If real history exists, map it to the expected format
    if (rb.history && rb.history.length > 0) {
      const mappedHistory = rb.history.map(h => ({
        version: `v${h.version}`,
        timestamp: h.updatedAt,
        author: h.updatedBy,
        action: 'Rule Basic Updated',
        note: `Perubahan: ${h.changes}`
      }));
      
      // Always append the initial creation at the end (since history is prepended)
      mappedHistory.push({
        version: 'v1.0.0', // Standardized initial version
        timestamp: rb.createdOn || '2026-08-01 10:30:00',
        author: rb.author || 'Yoseph Sanjaya (FMS Admin)',
        action: 'Initial Rule Basic Deployment',
        note: `Membuat instance rule basic dari template ${rb.templateCode} dengan threshold dasar dan base score ${rb.baseScore} Pts.`
      });
      return mappedHistory;
    }

    const entries = [
      {
        version: `v${rb.version}`, // might be a legacy format like v1.0
        timestamp: rb.createdOn || '2026-08-01 10:30:00',
        author: rb.author || 'Yoseph Sanjaya (FMS Admin)',
        action: 'Initial Rule Basic Deployment',
        note: `Membuat instance rule basic dari template ${rb.templateCode} dengan threshold dasar dan base score ${rb.baseScore} Pts.`
      }
    ];

    if (rb.version === '2.0' || rb.version.startsWith('2.') || rb.syncStatus === 'In Sync') {
      entries.unshift({
        version: `v${rb.version}`,
        timestamp: rb.updatedAt || '2026-08-25 12:00:00',
        author: 'Hendra Gunawan (FMS Senior Risk)',
        action: 'Template Sync & Threshold Upgrade',
        note: `Berhasil disinkronkan dengan pembaruan template induk (${rb.templateCode}). Parameter threshold diperbarui dan status berubah menjadi In Sync.`
      });
    }

    return entries;
  };

  const historyEntries = getBasicHistoryEntries(ruleBasic);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Detail Rule Basic: {ruleBasic.code}</h3>
                <VersionBadge version={ruleBasic.version} />
                <SyncStatusBadge status={ruleBasic.syncStatus} />
                <TestingStatusBadge status={ruleBasic.testingStatus} />
              </div>
              <p className="text-xs text-slate-500">
                {ruleBasic.name} • Template Ref: <strong className="font-mono text-blue-700">{ruleBasic.templateCode}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Status Publikasi</span>
              <span className={`font-bold text-xs mt-0.5 inline-block ${ruleBasic.status === 'Active' ? 'text-emerald-700' : 'text-slate-600'}`}>
                {ruleBasic.status}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Base Risk Score</span>
              <span className="font-mono font-bold text-xs text-blue-700 mt-0.5 inline-block">
                {ruleBasic.baseScore} Pts
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Urgensi Kasus</span>
              <div className="mt-0.5"><UrgencyBadge urgency={ruleBasic.caseUrgency} /></div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Channel / Transaksi</span>
              <span className="font-semibold text-slate-700 mt-0.5 block truncate">
                {ruleBasic.channel} • {ruleBasic.txnType}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs">Deskripsi Rule Basic:</h4>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {ruleBasic.description}
            </p>
          </div>

          {/* Concrete Parameter Values */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Nilai Threshold / Parameter Terpasang:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(ruleBasic.parameterValues).map(([k, v]) => (
                <div key={k} className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 block">{k}</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {typeof v === 'number' && v >= 1000 ? v.toLocaleString('id-ID') : String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Block Configurations */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-red-600" />
              <span>Aksi Blokir Otomatis (Auto-Block Action):</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {autoBlock.cif && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <UserCheck className="w-3.5 h-3.5" /> Blokir CIF Nasabah
                </span>
              )}
              {autoBlock.sourceAccountNumber && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <CreditCard className="w-3.5 h-3.5" /> Blokir No. Rekening Sumber
                </span>
              )}
              {autoBlock.deviceId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <Smartphone className="w-3.5 h-3.5" /> Blokir Device ID Perangkat
                </span>
              )}
              {autoBlock.phoneNumber && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  <Phone className="w-3.5 h-3.5" /> Blokir No. Telepon
                </span>
              )}
              {!autoBlock.cif && !autoBlock.sourceAccountNumber && !autoBlock.deviceId && !autoBlock.phoneNumber && (
                <span className="text-xs text-slate-400 font-mono italic">
                  Tidak ada aksi blokir otomatis (Hanya pencatatan alert investigasi FMS).
                </span>
              )}
            </div>
          </div>

          {/* History Changes / Audit Trail */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-600" />
              <span>History Changes &amp; Version Audit Trail:</span>
            </h4>

            <div className="space-y-2">
              {historyEntries.map((h, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-500 font-sans">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {h.version}
                      </span>
                      <span className="font-bold text-slate-900">{h.action}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{h.timestamp}</span>
                  </div>
                  <div className="text-slate-700 font-sans text-xs mt-1">
                    {h.note}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    Author: <span className="text-slate-700 font-semibold">{h.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
