import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Code, 
  Sliders, 
  ShieldAlert,
  ShieldCheck,
  Filter,
  Eye
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { RuleTemplate, RuleDomain } from '../../types/fms';
import { VersionBadge, TestingStatusBadge, DomainBadge } from '../common/Badge';
import { RuleTemplateModal } from './RuleTemplateModal';
import { RuleTemplateViewModal } from './RuleTemplateViewModal';

interface RuleTemplateListProps {
  domain?: RuleDomain;
}

export const RuleTemplateList: React.FC<RuleTemplateListProps> = ({ domain: initialDomain }) => {
  const { 
    ruleTemplates, 
    deleteRuleTemplate,
    ruleTemplateDomain,
    setRuleTemplateDomain
  } = useFMS();
  const { user } = useAuth();

  const isSysAdmin = !user || user.username === 'sysadmin' || user.riskDomain === 'FULL ACCESS' || user.group === 'IT DCA Maker Checker';
  const isL2User = !isSysAdmin && (
    user?.username === 'afcl2' || 
    user?.username === 'analystl2' || 
    user?.group === 'AFC L2' || 
    user?.group === 'Analyst L2' || 
    user?.role?.includes('Checker') || 
    user?.role?.includes('Approver')
  );

  React.useEffect(() => {
    if (initialDomain && ruleTemplateDomain !== initialDomain) {
      setRuleTemplateDomain(initialDomain);
    }
  }, [initialDomain]);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RuleTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<RuleTemplate | null>(null);

  const filteredTemplates = ruleTemplates.filter(t => {
    if (ruleTemplateDomain !== 'ALL' && (t.domain || 'Fraud') !== ruleTemplateDomain) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.author && t.author.toLowerCase().includes(q))
    );
  });

  const handleEdit = (tpl: RuleTemplate) => {
    setEditingTemplate(tpl);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const fraudCount = ruleTemplates.filter(t => (t.domain || 'Fraud') === 'Fraud').length;
  const amlCount = ruleTemplates.filter(t => t.domain === 'AML').length;

  return (
    <div className="space-y-5 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Rule Engine - Rule Templates {ruleTemplateDomain !== 'ALL' && `(${ruleTemplateDomain})`}
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {filteredTemplates.length} of {ruleTemplates.length} Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master cetak biru (blueprint) aturan {ruleTemplateDomain === 'AML' ? 'Anti-Money Laundering (AML)' : ruleTemplateDomain === 'Fraud' ? 'Fraud Detection' : 'Fraud & AML'} dengan variable placeholders yang dapat diinjeksikan threshold pada Rule Basic.
          </p>
        </div>

        {!isL2User && (
          <button
            id="btn-create-rule-template"
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Rule Template Baru ({ruleTemplateDomain === 'ALL' ? 'Fraud' : ruleTemplateDomain})</span>
          </button>
        )}
      </div>

      {/* Domain Separation Filter Tabs & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Domain Locked Badge */}
        <div className="flex items-center gap-2">
          {ruleTemplateDomain === 'Fraud' ? (
            <div className="px-3 py-1.5 rounded-lg font-bold text-red-700 bg-red-50 border border-red-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Fraud Engine Archive ({fraudCount})</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-red-100 text-[9px] font-mono border border-red-300">LOCKED</span>
            </div>
          ) : ruleTemplateDomain === 'AML' ? (
            <div className="px-3 py-1.5 rounded-lg font-bold text-amber-900 bg-amber-50 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
              <span>AML Engine Archive ({amlCount})</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-[9px] font-mono border border-amber-300">LOCKED</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg font-bold text-slate-700 bg-slate-100 border border-slate-200 shadow-2xs">
              Semua Domain ({ruleTemplates.length})
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Template Code, Nama..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
          />
        </div>
      </div>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(tpl => (
          <div 
            key={tpl.id}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition space-y-4 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Card Top: Code, Domain & Version */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {tpl.code}
                  </span>
                  <DomainBadge domain={tpl.domain || 'Fraud'} />
                  <VersionBadge version={tpl.version} />
                  <TestingStatusBadge status={tpl.testingStatus} />
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewingTemplate(tpl)}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                    title="View Template & History Changes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!isL2User && (
                    <>
                      <button
                        onClick={() => handleEdit(tpl)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        title="Edit Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRuleTemplate(tpl.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 transition cursor-pointer"
                        title="Hapus Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-sm text-slate-900">{tpl.name}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              {/* Parameter Placeholders Pills */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500">Parameter Placeholders ({tpl.parameters.length}):</div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.parameters.map(p => (
                    <span 
                      key={p.id}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-blue-700 border border-slate-200"
                      title={`${p.label}: default ${p.defaultValue} ${p.unit || ''}`}
                    >
                      {p.key} ({p.defaultValue} {p.unit || ''})
                    </span>
                  ))}
                </div>
              </div>

              {/* SQL Logic Preview */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Code className="w-3 h-3 text-slate-500" />
                    <span>Query Blueprint Logic</span>
                  </span>
                  <span>SQL / CQL</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap line-clamp-2">
                  {tpl.queryLogic}
                </pre>
              </div>

            </div>

            {/* Footer Card */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span>Author: <strong className="text-slate-700">{tpl.author}</strong></span>
              <span className="font-mono">Created: {tpl.createdOn.split(' ')[0]}</span>
            </div>

          </div>
        ))}
      </div>

      {/* Template Create / Edit Modal */}
      {modalOpen && (
        <RuleTemplateModal
          template={editingTemplate}
          initialDomain={ruleTemplateDomain === 'ALL' ? 'Fraud' : ruleTemplateDomain}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Template View Modal */}
      {viewingTemplate && (
        <RuleTemplateViewModal
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
        />
      )}

    </div>
  );
};
