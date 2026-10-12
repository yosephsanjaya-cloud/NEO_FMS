import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Database, 
  Braces, 
  Paperclip, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  Code, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Zap, 
  Tag, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  EmailTemplate, 
  EmailTableReference, 
  EmailReplacerMapping, 
  EmailActionExecuted, 
  EmailAttachment 
} from '../../types/systemParameter';
import { cn } from '../../lib/utils';

interface EmailTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: Omit<EmailTemplate, 'id' | 'createdDate' | 'updatedDate'>) => void;
  initialData?: EmailTemplate | null;
  mode: 'add' | 'edit';
}

export const EmailTemplateFormModal: React.FC<EmailTemplateFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'tables' | 'replacers' | 'actions'>('basic');
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Tab 1 Form State
  const [templateName, setTemplateName] = useState('');
  const [monitoringDuration, setMonitoringDuration] = useState('5 Minutes');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('08:00:00');
  const [excludeHoliday, setExcludeHoliday] = useState(true);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [emailTo, setEmailTo] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailBcc, setEmailBcc] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Tab 2: Table References
  const [tableReferences, setTableReferences] = useState<EmailTableReference[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [newTableType, setNewTableType] = useState('Base Alert Table');
  const [newPrimaryKey, setNewPrimaryKey] = useState('ALERT_ID');
  const [newQueryData, setNewQueryData] = useState('');
  const [showAddTableForm, setShowAddTableForm] = useState(false);

  // Tab 3: Replacer Mappings
  const [replacerMappings, setReplacerMappings] = useState<EmailReplacerMapping[]>([]);
  const [newReplacerTag, setNewReplacerTag] = useState('');
  const [newFieldReplacer, setNewFieldReplacer] = useState('');
  const [newReplacerDesc, setNewReplacerDesc] = useState('');
  const [showAddReplacerForm, setShowAddReplacerForm] = useState(false);

  // Tab 4: Actions & Attachments
  const [actionsExecuted, setActionsExecuted] = useState<EmailActionExecuted[]>([]);
  const [newActionType, setNewActionType] = useState('Update Alert Flag');
  const [newStatementExecuted, setNewStatementExecuted] = useState('');
  const [showAddActionForm, setShowAddActionForm] = useState(false);

  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [newReportName, setNewReportName] = useState('');
  const [newParameter, setNewParameter] = useState('');
  const [newRenderAs, setNewRenderAs] = useState<'PDF' | 'Excel' | 'CSV' | 'HTML'>('PDF');
  const [showAddAttachmentForm, setShowAddAttachmentForm] = useState(false);

  // Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset or populate on open
  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        setTemplateName(initialData.templateName || '');
        setMonitoringDuration(initialData.monitoringDuration || '5 Minutes');
        setStartDate(initialData.startDate || new Date().toISOString().slice(0, 10));
        setStartTime(initialData.startTime || '08:00:00');
        setExcludeHoliday(initialData.excludeHoliday ?? true);
        setStatus(initialData.status || 'Active');
        setEmailTo(initialData.emailTo || '');
        setEmailCc(initialData.emailCc || '');
        setEmailBcc(initialData.emailBcc || '');
        setEmailSubject(initialData.emailSubject || '');
        setEmailBody(initialData.emailBody || '');
        setTableReferences(initialData.tableReferences ? [...initialData.tableReferences] : []);
        setReplacerMappings(initialData.replacerMappings ? [...initialData.replacerMappings] : []);
        setActionsExecuted(initialData.actionsExecuted ? [...initialData.actionsExecuted] : []);
        setAttachments(initialData.attachments ? [...initialData.attachments] : []);
      } else {
        // Default new record
        setTemplateName('');
        setMonitoringDuration('5 Minutes');
        setStartDate(new Date().toISOString().slice(0, 10));
        setStartTime('08:00:00');
        setExcludeHoliday(true);
        setStatus('Active');
        setEmailTo('');
        setEmailCc('');
        setEmailBcc('');
        setEmailSubject('');
        setEmailBody(`<h3>Pemberitahuan Peringatan FMS Engine</h3>
<p>Yth. Tim Investigasi & Kepatuhan,</p>
<p>Sistem mendeteksi aktivitas mencurigakan dengan rincian:</p>
<ul>
  <li><strong>Case ID:</strong> $Case_ID$</li>
  <li><strong>Nama Nasabah:</strong> $Customer_Name$ ($CIF$)</li>
  <li><strong>Rule Triggered:</strong> $Rule_Name$</li>
  <li><strong>Risk Score:</strong> $Risk_Score$</li>
  <li><strong>Nominal Transaksi:</strong> $Transaction_Amount$</li>
  <li><strong>Waktu Deteksi:</strong> $Timestamp$</li>
</ul>
<p>Harap tindak lanjuti kasus ini sesuai SOP penanganan fraud perbankan.</p>`);
        setTableReferences([
          {
            id: 'TR-NEW-01',
            tableName: 'TableEmailA1',
            tableType: 'Base Alert Table',
            queryData: 'SELECT ALERT_ID AS Case_ID, CIF, CUSTOMER_NAME, RULE_NAME, FINAL_RISK_SCORE AS Risk_Score, TRANSACTION_AMOUNT, CREATED_DATE AS Timestamp FROM FMS_FRAUD_ALERTS WHERE ALERT_STATUS = "Open"',
            primaryKey: 'Case_ID'
          }
        ]);
        setReplacerMappings([
          { id: 'RM-NEW-01', replacerTag: '$Case_ID$', fieldReplacer: '[TableEmailA1].[Case_ID]', description: 'Nomor Case ID' },
          { id: 'RM-NEW-02', replacerTag: '$Customer_Name$', fieldReplacer: '[TableEmailA1].[CUSTOMER_NAME]', description: 'Nama Lengkap Nasabah' },
          { id: 'RM-NEW-03', replacerTag: '$CIF$', fieldReplacer: '[TableEmailA1].[CIF]', description: 'Nomor CIF Bank' },
          { id: 'RM-NEW-04', replacerTag: '$Rule_Name$', fieldReplacer: '[TableEmailA1].[RULE_NAME]', description: 'Nama Rule' },
          { id: 'RM-NEW-05', replacerTag: '$Risk_Score$', fieldReplacer: '[TableEmailA1].[Risk_Score]', description: 'Skor Risiko' },
          { id: 'RM-NEW-06', replacerTag: '$Transaction_Amount$', fieldReplacer: '[TableEmailA1].[TRANSACTION_AMOUNT]', description: 'Nominal Transaksi' },
          { id: 'RM-NEW-07', replacerTag: '$Timestamp$', fieldReplacer: '[TableEmailA1].[Timestamp]', description: 'Waktu Trigger' }
        ]);
        setActionsExecuted([
          {
            id: 'ACT-NEW-01',
            actionType: 'Update Alert Flag',
            statementExecuted: 'UPDATE FMS_FRAUD_ALERTS SET EMAIL_NOTIFICATION_SENT = 1, NOTIFIED_AT = NOW() WHERE ALERT_ID = $Case_ID$'
          }
        ]);
        setAttachments([
          {
            id: 'ATT-NEW-01',
            reportName: 'Alert_Investigation_Summary',
            parameter: 'Case_ID=$Case_ID$;Format=PDF',
            renderAs: 'PDF'
          }
        ]);
      }
      setActiveTab('basic');
      setPreviewMode(false);
      setErrors({});
      setShowAddTableForm(false);
      setShowAddReplacerForm(false);
      setShowAddActionForm(false);
      setShowAddAttachmentForm(false);
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  // Insert tag into email body
  const handleInsertTag = (tag: string) => {
    setEmailBody(prev => `${prev} ${tag} `);
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  // Add Table Reference
  const handleAddTableReference = () => {
    if (!newTableName.trim()) {
      alert('Nama Table wajib diisi');
      return;
    }
    const newRef: EmailTableReference = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      tableName: newTableName.trim(),
      tableType: newTableType,
      primaryKey: newPrimaryKey.trim() || 'ID',
      queryData: newQueryData.trim() || `SELECT * FROM ${newTableName.trim()}`
    };
    setTableReferences(prev => [...prev, newRef]);
    setNewTableName('');
    setNewQueryData('');
    setShowAddTableForm(false);
  };

  const handleDeleteTableReference = (id: string) => {
    setTableReferences(prev => prev.filter(t => t.id !== id));
  };

  // Add Replacer Mapping
  const handleAddReplacer = () => {
    if (!newReplacerTag.trim() || !newFieldReplacer.trim()) {
      alert('Replacer Tag dan Field Replacer wajib diisi');
      return;
    }
    let formattedTag = newReplacerTag.trim();
    if (!formattedTag.startsWith('$')) formattedTag = '$' + formattedTag;
    if (!formattedTag.endsWith('$')) formattedTag = formattedTag + '$';

    const newMap: EmailReplacerMapping = {
      id: `RM-${Date.now().toString().slice(-4)}`,
      replacerTag: formattedTag,
      fieldReplacer: newFieldReplacer.trim(),
      description: newReplacerDesc.trim() || 'Custom Mapping'
    };
    setReplacerMappings(prev => [...prev, newMap]);
    setNewReplacerTag('');
    setNewFieldReplacer('');
    setNewReplacerDesc('');
    setShowAddReplacerForm(false);
  };

  const handleDeleteReplacer = (id: string) => {
    setReplacerMappings(prev => prev.filter(r => r.id !== id));
  };

  // Add Action Executed
  const handleAddAction = () => {
    if (!newStatementExecuted.trim()) {
      alert('Statement Executed wajib diisi');
      return;
    }
    const newAct: EmailActionExecuted = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      actionType: newActionType,
      statementExecuted: newStatementExecuted.trim()
    };
    setActionsExecuted(prev => [...prev, newAct]);
    setNewStatementExecuted('');
    setShowAddActionForm(false);
  };

  const handleDeleteAction = (id: string) => {
    setActionsExecuted(prev => prev.filter(a => a.id !== id));
  };

  // Add Attachment
  const handleAddAttachment = () => {
    if (!newReportName.trim()) {
      alert('Report Name wajib diisi');
      return;
    }
    const newAtt: EmailAttachment = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      reportName: newReportName.trim(),
      parameter: newParameter.trim() || 'Case_ID=$Case_ID$',
      renderAs: newRenderAs
    };
    setAttachments(prev => [...prev, newAtt]);
    setNewReportName('');
    setNewParameter('');
    setShowAddAttachmentForm(false);
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Validation & Save
  const handleSave = () => {
    const errs: { [key: string]: string } = {};

    if (!templateName.trim()) {
      errs.templateName = 'Email Template Name wajib diisi';
    }
    if (!emailTo.trim()) {
      errs.emailTo = 'Email To penerima wajib diisi';
    }
    if (!emailSubject.trim()) {
      errs.emailSubject = 'Email Subject wajib diisi';
    }
    if (!emailBody.trim()) {
      errs.emailBody = 'Email Body konten wajib diisi';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setActiveTab('basic');
      return;
    }

    onSave({
      templateName: templateName.trim(),
      monitoringDuration,
      startDate,
      startTime,
      excludeHoliday,
      status,
      emailTo: emailTo.trim(),
      emailCc: emailCc.trim(),
      emailBcc: emailBcc.trim(),
      emailSubject: emailSubject.trim(),
      emailBody: emailBody.trim(),
      tableReferences,
      replacerMappings,
      actionsExecuted,
      attachments
    });

    onClose();
  };

  // Live preview variable substitution
  const renderPreviewBody = () => {
    let previewHtml = emailBody;
    const sampleValues: { [key: string]: string } = {
      '$Case_ID$': 'CAS-20260903-09412',
      '$Customer_Name$': 'Yoseph Sanjaya Gunawan',
      '$CIF$': 'CIF-0098231',
      '$Rule_Name$': 'Impossible Travel Detection (Jakarta - Surabaya)',
      '$Rule_Code$': 'RB-VEL-01',
      '$Risk_Score$': '92.5',
      '$Risk_Level$': 'HIGH',
      '$Transaction_Amount$': 'Rp 45.000.000',
      '$Tx_Location_1$': 'ATM Thamrin Jakarta',
      '$Tx_Location_2$': 'POS Tunjungan Surabaya',
      '$Time_Diff$': '18 Menit',
      '$Timestamp$': new Date().toLocaleString('id-ID'),
      '$Card_Number$': '4218-76**-****-9821',
      '$Merchant_1$': 'ATM Center GI Jakarta',
      '$Merchant_2$': 'Electronic City Surabaya',
      '$City_1$': 'Jakarta Pusat',
      '$City_2$': 'Surabaya',
      '$Aggregate_Amount$': 'Rp 780.000.000',
      '$Tx_Count$': '14',
      '$Identity_Number$': '3171028391020002'
    };

    Object.keys(sampleValues).forEach(tag => {
      const regex = new RegExp(tag.replace(/\$/g, '\\$'), 'g');
      previewHtml = previewHtml.replace(regex, `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 4px; border-radius: 4px; font-weight: bold;">${sampleValues[tag]}</span>`);
    });

    return previewHtml;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-800">
                  {mode === 'add' ? 'Add New Email Template Record' : `Edit Email Template: ${templateName || initialData?.templateName}`}
                </h3>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-semibold font-mono",
                  mode === 'add' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                )}>
                  {mode === 'add' ? 'NEW RECORD' : (initialData?.id || 'EDIT')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Konfigurasi parameter scheduler, konten template, database reference, replacer mapping, dan post-action.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-2 border-b border-slate-200 bg-white flex space-x-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('basic')}
            className={cn(
              "flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap",
              activeTab === 'basic' 
                ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg" 
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Tab 1: Basic &amp; Content Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={cn(
              "flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap",
              activeTab === 'tables' 
                ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg" 
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Database className="w-4 h-4" />
            <span>Tab 2: Table References</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {tableReferences.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('replacers')}
            className={cn(
              "flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap",
              activeTab === 'replacers' 
                ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg" 
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Braces className="w-4 h-4" />
            <span>Tab 3: Variable Replacer Mapping</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {replacerMappings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={cn(
              "flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap",
              activeTab === 'actions' 
                ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg" 
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <Zap className="w-4 h-4" />
            <span>Tab 4: Action &amp; Attachments</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
              {actionsExecuted.length + attachments.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: BASIC & CONTENT EDITOR */}
          {/* ========================================================= */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Row 1: Identification & Scheduler Settings */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Parameter Identitas &amp; Scheduler Pengiriman
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-normal">Status Aktif:</span>
                    <button
                      type="button"
                      onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1",
                        status === 'Active' ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-200 text-slate-700"
                      )}
                    >
                      {status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {status}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Template Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Contoh: A-02-g-DEV atau Alert Distance Warning"
                      className={cn(
                        "w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition",
                        errors.templateName ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-100 focus:border-blue-500"
                      )}
                    />
                    {errors.templateName && (
                      <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.templateName}
                      </p>
                    )}
                  </div>

                  {/* Monitoring Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Monitoring Duration
                    </label>
                    <select
                      value={monitoringDuration}
                      onChange={(e) => setMonitoringDuration(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
                    >
                      <option value="Realtime">Realtime (Immediate Trigger)</option>
                      <option value="5 Minutes">5 Minutes (Aggregated Spike)</option>
                      <option value="15 Minutes">15 Minutes (Standard Interval)</option>
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="1 Hour">1 Hour (Hourly Digest)</option>
                      <option value="Daily 08:00">Daily 08:00 (Morning Shift Digest)</option>
                      <option value="Daily 17:00">Daily 17:00 (Closing Shift Summary)</option>
                      <option value="Weekly Monday">Weekly Monday</option>
                    </select>
                  </div>

                  {/* Exclude Holiday */}
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={excludeHoliday}
                        onChange={(e) => setExcludeHoliday(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="select-none">Exclude Holiday (Libur Nasional)</span>
                    </label>
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Start Time (WIB)
                    </label>
                    <input
                      type="time"
                      step="1"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email Recipients & Subject */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Alamat Penerima &amp; Subjek Email
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="investigator@banksampoerna.com"
                      className={cn(
                        "w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition",
                        errors.emailTo ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-100 focus:border-blue-500"
                      )}
                    />
                    {errors.emailTo && (
                      <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.emailTo}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email CC
                    </label>
                    <input
                      type="text"
                      value={emailCc}
                      onChange={(e) => setEmailCc(e.target.value)}
                      placeholder="supervisor@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email BCC
                    </label>
                    <input
                      type="text"
                      value={emailBcc}
                      onChange={(e) => setEmailBcc(e.target.value)}
                      placeholder="audit@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="[FMS ALERT] High Risk Notification - Case $Case_ID$ ($Customer_Name$)"
                    className={cn(
                      "w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 transition font-medium",
                      errors.emailSubject ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-100 focus:border-blue-500"
                    )}
                  />
                  {errors.emailSubject && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.emailSubject}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Rich Text Body Editor & Live Preview */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Email Body Content (HTML / Rich Text) <span className="text-red-500">*</span>
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border",
                        previewMode 
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      )}
                    >
                      {previewMode ? <Code className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{previewMode ? 'Back to Code Editor' : 'Live Sample Preview'}</span>
                    </button>
                  </div>
                </div>

                {/* Variable Tags Quick Insert Bar */}
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-blue-900">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Klik tag di bawah untuk menyisipkan variabel ke dalam Email Body:
                    </span>
                    {copiedTag && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Disalin &amp; Disisipkan: {copiedTag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {replacerMappings.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleInsertTag(r.replacerTag)}
                        title={`Field: ${r.fieldReplacer} (${r.description || ''})`}
                        className="px-2 py-0.5 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 font-mono text-[11px] font-semibold flex items-center gap-1 transition shadow-2xs"
                      >
                        <Tag className="w-2.5 h-2.5 text-blue-500" />
                        <span>{r.replacerTag}</span>
                      </button>
                    ))}
                    {replacerMappings.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Belum ada tag yang didefinisikan di Tab 3.</span>
                    )}
                  </div>
                </div>

                {/* Editor vs Preview Display */}
                {previewMode ? (
                  <div className="p-4 rounded-xl border border-blue-200 bg-white min-h-[220px] shadow-inner space-y-3">
                    <div className="pb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Simulasi tampilan email yang diterima oleh investigator (variabel terisi otomatis):</span>
                      <span className="font-mono text-[11px] text-blue-600 font-semibold">Render Mode: HTML Rich Text</span>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none text-slate-800 font-sans"
                      dangerouslySetInnerHTML={{ __html: renderPreviewBody() }}
                    />
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={9}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Masukkan format email HTML atau teks dengan tag variabel..."
                      className={cn(
                        "w-full p-3 font-mono text-xs rounded-xl border bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 leading-relaxed transition",
                        errors.emailBody ? "border-red-400 focus:ring-red-200" : "border-slate-700 focus:ring-blue-500"
                      )}
                    />
                    {errors.emailBody && (
                      <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.emailBody}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TABLE REFERENCES */}
          {/* ========================================================= */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Tabel Sumber Data &amp; SQL Query</h4>
                  <p className="text-xs text-slate-500">
                    Daftar tabel database referensi dan SQL statement ekstraksi data untuk mengisi tag replacer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTableForm(!showAddTableForm)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddTableForm ? 'Batal Tambah' : '+ Add Table Reference'}</span>
                </button>
              </div>

              {/* Add Table Form Card */}
              {showAddTableForm && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" /> Form Tambah Table Reference Baru
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Table <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTableName}
                        onChange={(e) => setNewTableName(e.target.value)}
                        placeholder="Contoh: TableEmailA1 atau CustomerInfo"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Table Type
                      </label>
                      <select
                        value={newTableType}
                        onChange={(e) => setNewTableType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                      >
                        <option value="Base Alert Table">Base Alert Table</option>
                        <option value="Customer Info">Customer Info</option>
                        <option value="Transaction Log">Transaction Log</option>
                        <option value="Card Detail">Card Detail</option>
                        <option value="Blacklist Match">Blacklist Match</option>
                        <option value="Audit Trail">Audit Trail</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Field Unik Primary (Primary Key)
                      </label>
                      <input
                        type="text"
                        value={newPrimaryKey}
                        onChange={(e) => setNewPrimaryKey(e.target.value)}
                        placeholder="ALERT_ID / CIF / TX_ID"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Query Data (SQL Statement Ekstraksi)
                    </label>
                    <textarea
                      rows={3}
                      value={newQueryData}
                      onChange={(e) => setNewQueryData(e.target.value)}
                      placeholder="SELECT ALERT_ID, CIF, CUSTOMER_NAME FROM FMS_FRAUD_ALERTS WHERE ALERT_STATUS = 'Open'"
                      className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-700 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTableForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTableReference}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      Simpan Table Reference
                    </button>
                  </div>
                </div>
              )}

              {/* Table List */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Nama Table</th>
                        <th className="py-2.5 px-3">Table Type</th>
                        <th className="py-2.5 px-3">Field Unik Primary</th>
                        <th className="py-2.5 px-3 min-w-[320px]">Query Data (SQL)</th>
                        <th className="py-2.5 px-3 text-center w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tableReferences.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {t.tableName}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-100">
                              {t.tableType}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {t.primaryKey}
                          </td>
                          <td className="py-3 px-3">
                            <code className="text-[11px] font-mono bg-slate-100 text-slate-800 p-1.5 rounded block border border-slate-200 max-h-24 overflow-y-auto whitespace-pre-wrap">
                              {t.queryData}
                            </code>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTableReference(t.id)}
                              title="Hapus Table Reference"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {tableReferences.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                            Belum ada Table Reference. Klik tombol "+ Add Table Reference" untuk menambahkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: VARIABLE REPLACER MAPPING */}
          {/* ========================================================= */}
          {activeTab === 'replacers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Variable Replacer Tag Mapping</h4>
                  <p className="text-xs text-slate-500">
                    Pemetaan token variabel (misal: <code className="font-mono text-blue-600">$Case_ID$</code>) ke field database (misal: <code className="font-mono text-blue-600">[TableEmailA1].[Case_ID]</code>).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddReplacerForm(!showAddReplacerForm)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddReplacerForm ? 'Batal Tambah' : '+ Add Replacer Tag'}</span>
                </button>
              </div>

              {/* Add Replacer Form Card */}
              {showAddReplacerForm && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Braces className="w-3.5 h-3.5 text-blue-600" /> Tambah Pemetaan Variabel Replacer
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Replacer Tag <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newReplacerTag}
                        onChange={(e) => setNewReplacerTag(e.target.value)}
                        placeholder="$Case_ID$ atau $Customer_Name$"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Field Replacer (Database Target) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newFieldReplacer}
                        onChange={(e) => setNewFieldReplacer(e.target.value)}
                        placeholder="[TableEmailA1].[Case_ID]"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Deskripsi / Label Keterangan
                      </label>
                      <input
                        type="text"
                        value={newReplacerDesc}
                        onChange={(e) => setNewReplacerDesc(e.target.value)}
                        placeholder="Nomor referensi kasus fraud"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddReplacerForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddReplacer}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                    >
                      Simpan Tag Mapping
                    </button>
                  </div>
                </div>
              )}

              {/* Replacers Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Replacer Tag</th>
                        <th className="py-2.5 px-3">Field Replacer (Data Source)</th>
                        <th className="py-2.5 px-3">Deskripsi</th>
                        <th className="py-2.5 px-3 text-center w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {replacerMappings.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {r.replacerTag}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {r.fieldReplacer}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {r.description || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(r.replacerTag);
                                  setCopiedTag(r.replacerTag);
                                  setTimeout(() => setCopiedTag(null), 1500);
                                }}
                                title="Salin Tag"
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReplacer(r.id)}
                                title="Hapus Tag"
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {replacerMappings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                            Belum ada variable replacer mapping. Klik "+ Add Replacer Tag" untuk menambahkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ACTION & ATTACHMENTS */}
          {/* ========================================================= */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              
              {/* Section 4.1: Email Action Executed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Email Action Type &amp; Statement Executed
                    </h4>
                    <p className="text-xs text-slate-500">
                      Query SQL / Webhook yang dieksekusi secara otomatis oleh FMS Engine sesaat setelah email berhasil terkirim.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddActionForm(!showAddActionForm)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddActionForm ? 'Batal Tambah' : '+ Add Action'}</span>
                  </button>
                </div>

                {showAddActionForm && (
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" /> Tambah Eksekusi Aksi Otomatis
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Action Type
                        </label>
                        <select
                          value={newActionType}
                          onChange={(e) => setNewActionType(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 font-medium"
                        >
                          <option value="Update Alert Flag">Update Alert Flag</option>
                          <option value="Insert Audit Log">Insert Audit Log</option>
                          <option value="Call Webhook API">Call Webhook API</option>
                          <option value="Freeze Account Hold">Freeze Account Hold</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Statement Executed (SQL / Command) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newStatementExecuted}
                          onChange={(e) => setNewStatementExecuted(e.target.value)}
                          placeholder="UPDATE FMS_FRAUD_ALERTS SET EMAIL_SENT = 1 WHERE ALERT_ID = $Case_ID$"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-200"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddActionForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAction}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                      >
                        Simpan Action
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3 w-44">Email Action Type</th>
                        <th className="py-2.5 px-3">Statement Executed</th>
                        <th className="py-2.5 px-3 text-center w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {actionsExecuted.map((a, idx) => (
                        <tr key={a.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-amber-800">
                            <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                              {a.actionType}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <code className="text-[11px] font-mono bg-slate-100 text-slate-800 px-2 py-1 rounded block border border-slate-200">
                              {a.statementExecuted}
                            </code>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteAction(a.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {actionsExecuted.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                            Belum ada action yang diatur.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4.2: Email Attachments */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-purple-600" />
                      Email Attachment Reports
                    </h4>
                    <p className="text-xs text-slate-500">
                      Daftar berkas laporan audit/dossier yang dirender otomatis dan dilampirkan ke dalam pesan email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddAttachmentForm(!showAddAttachmentForm)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddAttachmentForm ? 'Batal Tambah' : '+ Add Attachment'}</span>
                  </button>
                </div>

                {showAddAttachmentForm && (
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
                    <h5 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-purple-600" /> Tambah Lampiran Laporan
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Report Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newReportName}
                          onChange={(e) => setNewReportName(e.target.value)}
                          placeholder="Alert_Investigation_Summary"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Parameter String
                        </label>
                        <input
                          type="text"
                          value={newParameter}
                          onChange={(e) => setNewParameter(e.target.value)}
                          placeholder="Case_ID=$Case_ID$;IncludeDevice=1"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Render As (Format)
                        </label>
                        <select
                          value={newRenderAs}
                          onChange={(e) => setNewRenderAs(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 font-medium"
                        >
                          <option value="PDF">PDF (Portable Document Format)</option>
                          <option value="Excel">Excel (.xlsx)</option>
                          <option value="CSV">CSV (.csv)</option>
                          <option value="HTML">HTML (.html)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddAttachmentForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAttachment}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
                      >
                        Simpan Attachment
                      </button>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center">No</th>
                        <th className="py-2.5 px-3">Report Name</th>
                        <th className="py-2.5 px-3">Parameter</th>
                        <th className="py-2.5 px-3 w-28 text-center">Render As</th>
                        <th className="py-2.5 px-3 text-center w-20">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {attachments.map((att, idx) => (
                        <tr key={att.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {att.reportName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {att.parameter}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase border",
                              att.renderAs === 'PDF' ? "bg-red-50 text-red-700 border-red-200" :
                              att.renderAs === 'Excel' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              "bg-blue-50 text-blue-700 border-blue-200"
                            )}>
                              {att.renderAs}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {attachments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                            Belum ada lampiran laporan yang diatur.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Tab: <strong className="text-slate-700 capitalize">{activeTab}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{mode === 'add' ? 'Save Record' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
