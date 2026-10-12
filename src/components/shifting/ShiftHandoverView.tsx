import React, { useState, useMemo } from 'react';
import { useFMS } from '../../context/FMSContext';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  ShieldAlert, 
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  UserX
} from 'lucide-react';
import { ShiftHandover, FraudCase } from '../../types/fms';

interface ShiftHandoverViewProps {
  onOpenCreateModal: () => void;
}

export const ShiftHandoverView: React.FC<ShiftHandoverViewProps> = ({
  onOpenCreateModal
}) => {
  const { 
    shiftHandovers, 
    acknowledgeShiftHandover, 
    fraudCases, 
    handleOpenDetail 
  } = useFMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Acknowledged'>('All');
  const [selectedHandoverForAck, setSelectedHandoverForAck] = useState<ShiftHandover | null>(null);
  const [ackNotes, setAckNotes] = useState('');
  const [expandedHandoverId, setExpandedHandoverId] = useState<string | null>(null);

  // Filtered handovers
  const filteredHandovers = useMemo(() => {
    return shiftHandovers.filter(h => {
      const matchSearch = h.handoverNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.offloadingUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.receivingUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (h.caseIds && h.caseIds.some(cid => cid.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchStatus = statusFilter === 'All' || h.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [shiftHandovers, searchQuery, statusFilter]);

  // Lookup case details for attached cases
  const caseMap = useMemo(() => {
    const map = new Map<string, FraudCase>();
    fraudCases.forEach(c => {
      map.set(c.caseId, c);
      map.set(c.id, c);
    });
    return map;
  }, [fraudCases]);

  // Handle acknowledge action
  const handleConfirmAcknowledge = () => {
    if (!selectedHandoverForAck) return;
    acknowledgeShiftHandover(selectedHandoverForAck.id, selectedHandoverForAck.receivingUserName || 'Current User');
    setSelectedHandoverForAck(null);
    setAckNotes('');
  };

  const pendingCount = shiftHandovers.filter(h => h.status === 'Pending').length;
  const ackCount = shiftHandovers.filter(h => h.status === 'Acknowledged').length;

  return (
    <div id="shift-handover-section" className="space-y-4">
      
      {/* Header Info & Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Summary pills */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Shift Handover & Case Escalation Log</h3>
            <p className="text-xs text-slate-500">
              Pencatatan resmi berita acara serah terima kasus investigasi antar shift (Maker & Checker).
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari handover / case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="All">Semua Status ({shiftHandovers.length})</option>
            <option value="Pending">Pending Acknowledge ({pendingCount})</option>
            <option value="Acknowledged">Acknowledged ({ackCount})</option>
          </select>

          {/* Create Handover Button */}
          <button
            id="btn-create-shift-handover"
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Handover Baru</span>
          </button>
        </div>

      </div>

      {/* Handover Cards List */}
      <div className="space-y-3">
        {filteredHandovers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
            Tidak ada data handover yang sesuai filter.
          </div>
        ) : (
          filteredHandovers.map((ho) => {
            const isPending = ho.status === 'Pending';
            const isExpanded = expandedHandoverId === ho.id;

            return (
              <div 
                key={ho.id}
                className={`bg-white border rounded-xl shadow-sm transition overflow-hidden ${
                  isPending ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                }`}
              >
                {/* Main Card Header Bar */}
                <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Handover Metadata */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                        {ho.handoverNo}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {ho.timestamp}
                      </span>
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Menunggu Acknowledge
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Acknowledged & Taken Over
                        </span>
                      )}
                    </div>

                    {/* PIC Transition Flow */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      {/* Offloading */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">Dari:</span>
                        <strong className="text-slate-900">{ho.offloadingUserName}</strong>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                          {ho.offloadingRole}
                        </span>
                      </div>

                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />

                      {/* Receiving */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">Kepada:</span>
                        <strong className="text-slate-900">{ho.receivingUserName}</strong>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                          {ho.receivingRole}
                        </span>
                      </div>

                      <span className="text-slate-300">|</span>
                      <span className="text-slate-600 font-medium">{ho.shiftFrom} ➔ {ho.shiftTo}</span>
                    </div>
                  </div>

                  {/* Right: Actions & Badges */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Kasus Terlampir:</span>
                      <div className="font-bold text-sm text-slate-900 font-mono">
                        {ho.caseIds?.length || 0} Kasus
                      </div>
                    </div>

                    {isPending ? (
                      <button
                        id={`btn-ack-ho-${ho.id}`}
                        onClick={() => setSelectedHandoverForAck(ho)}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition flex items-center space-x-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Acknowledge & Takeover</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-right text-slate-500">
                        <span>Diterima oleh: <strong>{ho.acknowledgedBy}</strong></span>
                        <div className="text-[10px] font-mono text-slate-400">{ho.acknowledgedAt}</div>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedHandoverId(isExpanded ? null : ho.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                      title="Lihat Detail Catatan & Kasus"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Details: Notes & Cases */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                    
                    {/* Shift Handover Notes */}
                    <div>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Catatan Serah Terima / Instruksi Khusus:
                      </span>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                        {ho.notes}
                      </div>
                    </div>

                    {/* Attached Cases List */}
                    {ho.caseIds && ho.caseIds.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          Daftar Kasus Eskalasi ({ho.caseIds.length}):
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {ho.caseIds.map(caseId => {
                            const caseData = caseMap.get(caseId);

                            return (
                              <div 
                                key={caseId}
                                className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs hover:border-red-300 transition"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-mono font-bold text-red-700 truncate">{caseId}</span>
                                    {caseData?.caseUrgency && (
                                      <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                                        caseData.caseUrgency === 'High' ? 'bg-red-100 text-red-700' :
                                        caseData.caseUrgency === 'Med' ? 'bg-amber-100 text-amber-800' :
                                        'bg-slate-100 text-slate-700'
                                      }`}>
                                        {caseData.caseUrgency}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {caseData ? `${caseData.customerName} (${caseData.cif})` : 'Pending Case Reference'}
                                  </div>
                                </div>

                                {caseData && (
                                  <button
                                    onClick={() => handleOpenDetail(caseData)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition shrink-0"
                                    title="Buka Kasus"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Acknowledge Confirmation Modal */}
      {selectedHandoverForAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-amber-50/70 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-slate-900">Konfirmasi Acknowledge & Serah Terima</h3>
              </div>
              <button
                onClick={() => setSelectedHandoverForAck(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Handover:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedHandoverForAck.handoverNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIC Penyerah (Shift Lama):</span>
                  <strong className="text-slate-800">{selectedHandoverForAck.offloadingUserName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIC Penerima (Shift Baru):</span>
                  <strong className="text-emerald-700">{selectedHandoverForAck.receivingUserName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah Kasus Eskalasi:</span>
                  <span className="font-mono font-bold text-red-600">{selectedHandoverForAck.caseIds?.length || 0} Kasus</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Catatan Penerimaan / Tanggapan PIC:
                </label>
                <textarea
                  rows={3}
                  value={ackNotes}
                  onChange={(e) => setAckNotes(e.target.value)}
                  placeholder="Contoh: Seluruh kasus telah ditinjau dan diambil alih oleh Shift 2. Pemantauan nasabah VIP akan diteruskan..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Dengan menekan tombol di bawah, Anda mengonfirmasi telah menerima seluruh catatan kronologi dan mengambil tanggung jawab investigasi kasus untuk periode shift ini.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedHandoverForAck(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAcknowledge}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
              >
                Konfirmasi & Ambil Alih Kasus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
