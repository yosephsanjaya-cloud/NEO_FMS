import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Download, 
  Search, 
  Filter, 
  Send, 
  AlertCircle, 
  Clock, 
  User, 
  Eye, 
  X, 
  Check, 
  ChevronRight, 
  FileText,
  MailCheck,
  AlertTriangle
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { AuditMailLog, MailDeliveryStatus } from '../../types/auditTrail';
import { cn } from '../../lib/utils';

export const AuditTrailMailPage: React.FC = () => {
  const { auditMailLogs } = useFMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ALL');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Modal
  const [selectedMail, setSelectedMail] = useState<AuditMailLog | null>(null);

  // Unique templates
  const uniqueTemplates = useMemo(() => {
    return Array.from(new Set(auditMailLogs.map(m => m.emailTemplateName)));
  }, [auditMailLogs]);

  // Filtered
  const filteredMails = useMemo(() => {
    return auditMailLogs.filter(item => {
      const matchSearch =
        item.emailTemplateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.recipientCc && item.recipientCc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.errorMessage && item.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchTemplate = selectedTemplate === 'ALL' || item.emailTemplateName === selectedTemplate;

      return matchSearch && matchStatus && matchTemplate;
    });
  }, [auditMailLogs, searchTerm, selectedStatus, selectedTemplate]);

  const totalSent = auditMailLogs.filter(m => m.status === 'Sent').length;
  const totalFailed = auditMailLogs.filter(m => m.status === 'Failed').length;
  const totalBounced = auditMailLogs.filter(m => m.status === 'Bounced').length;

  const getStatusBadge = (status: MailDeliveryStatus) => {
    switch (status) {
      case 'Sent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'Bounced':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExport = () => {
    const csvRows = [
      ['Mail ID', 'Timestamp', 'Template Name', 'Recipient (To)', 'Recipient (CC)', 'Subject', 'Status', 'Duration (ms)', 'Error Details'],
      ...filteredMails.map(m => [
        `"${m.id}"`,
        `"${m.timestamp}"`,
        `"${m.emailTemplateName}"`,
        `"${m.recipientTo}"`,
        `"${m.recipientCc || '-'}"`,
        `"${m.subject.replace(/"/g, '""')}"`,
        `"${m.status}"`,
        `"${m.durationMs || 0}"`,
        `"${(m.errorMessage || '-').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Audit_Mail_Dispatch_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Mail className="w-4 h-4" />
            <span>AUDIT TRAIL & NOTIFICATION</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">SMTP DISPATCH LOG</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Audit Trail Mail
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Email Dispatch & Relay
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit riwayat pengiriman notifikasi email alert fraud/AML, status deliverability SMTP relay, kegagalan bouncing, dan rincian penerima.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {exportSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Log Mail Diexport
            </span>
          )}
          <button
            id="btn-export-mail-audit"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Dispatches</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{auditMailLogs.length}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Attempted notifications</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Successfully Sent</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{totalSent}</h3>
            <p className="text-xs text-emerald-500 mt-0.5">250 OK Delivered</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <MailCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Delivery Failed</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">{totalFailed}</h3>
            <p className="text-xs text-rose-500 mt-0.5">SMTP relay error</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bounced / Rejected</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">{totalBounced}</h3>
            <p className="text-xs text-amber-500 mt-0.5">Mailbox full / quota</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-mail-audit"
              type="text"
              placeholder="Search template, recipient, subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              id="select-filter-mail-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status (Sent, Failed, Bounced)</option>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
              <option value="Bounced">Bounced</option>
            </select>
          </div>

          <div>
            <select
              id="select-filter-mail-template"
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Email Templates ({uniqueTemplates.length})</option>
              {uniqueTemplates.map(tpl => (
                <option key={tpl} value={tpl}>{tpl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">
            Email Dispatch Activity ({filteredMails.length} entries)
          </span>
          <span className="text-xs text-slate-500">
            Internal SMTP Relay: 10.10.20.25:587 (TLS v1.3)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Email Template Name</th>
                <th className="py-3 px-4">Recipient (To)</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-3 text-center w-24">Status</th>
                <th className="py-3 px-3 text-center w-20">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada log pengiriman email yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMails.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.timestamp}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{item.emailTemplateName}</span>
                      </div>
                      {item.templateId && (
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: {item.templateId}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {item.recipientTo}
                      {item.recipientCc && (
                        <div className="text-[10px] text-slate-500 truncate" title={`CC: ${item.recipientCc}`}>
                          CC: {item.recipientCc}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-slate-900 truncate" title={item.subject}>
                        {item.subject}
                      </div>
                      {item.errorMessage && (
                        <div className="text-[10px] text-rose-600 font-mono mt-0.5 truncate" title={item.errorMessage}>
                          Error: {item.errorMessage}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={cn("inline-block px-2.5 py-0.5 rounded border text-[11px]", getStatusBadge(item.status))}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        id={`btn-view-mail-${item.id}`}
                        onClick={() => setSelectedMail(item)}
                        className="p-1.5 rounded-md hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition"
                        title="View dispatch details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mail Detail Modal */}
      {selectedMail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Email Dispatch Delivery Record</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Log ID: {selectedMail.id} • {selectedMail.timestamp} WIB</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Template Name</span>
                  <span className="font-bold text-slate-900">{selectedMail.emailTemplateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Delivery Status</span>
                  <span className={cn("inline-block px-2 py-0.5 rounded border text-[11px]", getStatusBadge(selectedMail.status))}>
                    {selectedMail.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Recipient (To)</span>
                  <span className="font-semibold text-slate-800">{selectedMail.recipientTo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Relay Latency</span>
                  <span className="font-semibold text-slate-800">{selectedMail.durationMs || 0} ms</span>
                </div>
                {selectedMail.recipientCc && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Recipient (CC)</span>
                    <span className="font-semibold text-slate-800">{selectedMail.recipientCc}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1 font-semibold uppercase">Email Subject</span>
                <div className="p-3 bg-slate-100 rounded-lg font-medium text-slate-900 text-xs">
                  {selectedMail.subject}
                </div>
              </div>

              {selectedMail.errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-rose-700">
                    <AlertCircle className="w-4 h-4" />
                    SMTP Transport Error Output
                  </div>
                  <p className="font-mono text-[11px]">{selectedMail.errorMessage}</p>
                </div>
              )}

              {selectedMail.bodySnippet && (
                <div>
                  <span className="text-slate-400 block text-[11px] mb-1 font-semibold uppercase">Content Preview Snippet</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] whitespace-pre-wrap">
                    {selectedMail.bodySnippet}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMail(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
