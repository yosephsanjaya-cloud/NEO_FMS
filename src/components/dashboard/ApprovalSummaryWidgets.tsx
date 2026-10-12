import React from 'react';
import { 
  Cpu, 
  Database, 
  Landmark, 
  Sliders, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ShieldAlert,
  Settings,
  Users,
  FileCode,
  ListFilter
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveNavTab } from '../../types/fms';

export const ApprovalSummaryWidgets: React.FC = () => {
  const { ruleApprovalTickets, setActiveTab, userRole, setUserRole } = useFMS();
  const { user } = useAuth();
  const isSysAdmin = user?.riskDomain === 'FULL ACCESS' || user?.username === 'sysadmin';
  const showFraud = isSysAdmin || user?.riskDomain === 'FRAUD ONLY' || user?.username?.includes('afc');
  const showAml = isSysAdmin || user?.riskDomain === 'AML ONLY' || user?.username?.includes('analyst');

  // Role check condition: check if userRole is Checker / Approver
  const isChecker = userRole.toLowerCase().includes('checker') || 
                    userRole.toLowerCase().includes('approver') || 
                    userRole.toLowerCase().includes('supervisor') ||
                    userRole.toLowerCase().includes('lead');

  // If active user is not Checker, do not render or show a role switcher trigger
  if (!isChecker) {
    return null;
  }

  // Filter pending tickets
  const pendingTickets = ruleApprovalTickets.filter(t => t.status === 'PENDING');

  // ==========================================
  // SECTION 1: SYSTEM PARAMETER (GENERAL) COUNTS
  // ==========================================
  const sysUserCount = pendingTickets.filter(t => t.targetType === 'User Management').length;

  const sysGroupRoleAccessCount = pendingTickets.filter(t => 
    t.targetType === 'Group Management' || 
    t.targetType === 'Role Management' || 
    t.targetType === 'Access Menu Management'
  ).length;

  const sysParamUdpTemplateSessionCount = pendingTickets.filter(t => 
    t.targetType === 'Application Parameter' || 
    t.targetType === 'User Defined Parameter' || 
    t.targetType === 'Email Template' || 
    t.targetType === 'User Session & Lockout' || 
    t.targetType === 'User Session'
  ).length;

  const sysParamTotal = sysUserCount + sysGroupRoleAccessCount + sysParamUdpTemplateSessionCount;

  // ==========================================
  // SECTION 2: FRAUD DOMAIN COUNTS
  // ==========================================
  // 2A. Fraud Rules & Risk Engine
  const fraudRuleBasicCount = pendingTickets.filter(t => 
    (t.domain === 'Fraud' || !t.domain || t.domain === 'FRAUD') && 
    (t.targetType === 'Basic' || t.targetType === 'Rule Basic')
  ).length;

  const fraudRuleTemplateCount = pendingTickets.filter(t => 
    (t.domain === 'Fraud' || !t.domain || t.domain === 'FRAUD') && 
    (t.targetType === 'Template' || t.targetType === 'Rule Template')
  ).length;

  const fraudFormulaCount = pendingTickets.filter(t => 
    t.targetType === 'Formula' || t.targetType === 'Formula Risk'
  ).length;

  const fraudRulesTotal = fraudRuleBasicCount + fraudRuleTemplateCount + fraudFormulaCount;

  // 2B. Fraud List Registry
  const fraudCifCount = pendingTickets.filter(t => t.targetType === 'CIF').length;
  const fraudAccountCount = pendingTickets.filter(t => 
    t.targetType === 'Source Account Number' || t.targetType === 'Source Account' || t.targetType === 'Account'
  ).length;
  const fraudDeviceCount = pendingTickets.filter(t => 
    t.targetType === 'Device ID' || t.targetType === 'Device'
  ).length;
  const fraudPhoneCount = pendingTickets.filter(t => 
    t.targetType === 'Phone Number' || t.targetType === 'Phone'
  ).length;

  const fraudListTotal = fraudCifCount + fraudAccountCount + fraudDeviceCount + fraudPhoneCount;
  const fraudDomainTotal = fraudRulesTotal + fraudListTotal;

  // ==========================================
  // SECTION 3: AML DOMAIN COUNTS
  // ==========================================
  const amlRuleBasicCount = pendingTickets.filter(t => 
    (t.domain === 'AML' || t.domain === 'Aml') && 
    (t.targetType === 'Basic' || t.targetType === 'Rule Basic')
  ).length;

  const amlRuleTemplateCount = pendingTickets.filter(t => 
    (t.domain === 'AML' || t.domain === 'Aml') && 
    (t.targetType === 'Template' || t.targetType === 'Rule Template')
  ).length;

  const amlMasterCount = pendingTickets.filter(t => t.targetType === 'AML Master Blacklist').length;
  const amlExternalCount = pendingTickets.filter(t => t.targetType === 'External Blacklist').length;

  const amlDomainTotal = amlRuleBasicCount + amlRuleTemplateCount + amlMasterCount + amlExternalCount;

  // Overall Grand Total
  let grandTotalPending = 0;
  if (isSysAdmin) grandTotalPending += sysParamTotal;
  if (showFraud) grandTotalPending += fraudDomainTotal;
  if (showAml) grandTotalPending += amlDomainTotal;

  const handleNavigate = (tab: ActiveNavTab, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTab(tab);
  };

  return (
    <div className="space-y-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
      
      {/* Workspace Main Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Checker Approval Workspace</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Role: {userRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Antrean persetujuan perubahan parameter, aturan & daftar entitas berdasarkan segregasi domain.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium shadow-2xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-slate-600">Total Antrean Pending:</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {grandTotalPending} Tiket
            </span>
          </div>

          {/* Role Switcher for Tester Demonstration */}
          <select 
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer shadow-2xs"
            title="Ganti Role untuk Demo Switch"
          >
            <option value="Checker / Approver">Role: Checker / Approver</option>
            <option value="Maker / Analyst">Role: Maker / Analyst</option>
          </select>
        </div>
      </div>

      {/* 2X2 GRID MATRIX LAYOUT FOR APPROVAL CARDS */}
      <div className={`grid grid-cols-1 gap-6 ${(!isSysAdmin && showAml && !showFraud) ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>

        {/* ========================================== */}
        {isSysAdmin && (
          <>
        {/* ROW 1 - COL 1: SYSTEM PARAMETER CONFIG     */}
        {/* ========================================== */}
        <div
          id="stat-card-system-parameter"
          onClick={() => handleNavigate('system-parameter-user-approval')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden h-full"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                      Section 1
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">System Parameter Configuration</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">User, Group, Role, Access Menu, App Param, UDP & Email Template</p>
                </div>
              </div>

              {sysParamTotal > 0 ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-600 text-white shadow-2xs">
                  {sysParamTotal} Tiket
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>All Clear</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
              <div 
                onClick={(e) => handleNavigate('system-parameter-user-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">User Management</span>
                <span className={`font-mono text-xs font-bold ${sysUserCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {sysUserCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('system-parameter-group-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Group, Role & Access Menu</span>
                <span className={`font-mono text-xs font-bold ${sysGroupRoleAccessCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {sysGroupRoleAccessCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('system-parameter-application-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">App Param, UDP, Email & Session</span>
                <span className={`font-mono text-xs font-bold ${sysParamUdpTemplateSessionCount > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {sysParamUdpTemplateSessionCount} Tiket
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:text-blue-700">
            <span>Buka Antrean Approval System Parameter</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
          </>
        )}

        {showFraud && (
          <>
        {/* ========================================== */}
        {/* ROW 1 - COL 2: FRAUD RULES & RISK ENGINE   */}
        {/* ========================================== */}
        <div
          id="stat-card-fraud-rules-risk"
          onClick={() => handleNavigate('rule-basic-fraud-approval')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden h-full"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200">
                      Section 2A
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition">Fraud Rules & Risk Engine</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Fraud Rule Basic, Fraud Rule Template & Formula Risk Engine</p>
                </div>
              </div>

              {fraudRulesTotal > 0 ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-600 text-white shadow-2xs">
                  {fraudRulesTotal} Tiket
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>All Clear</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
              <div 
                onClick={(e) => handleNavigate('rule-basic-fraud-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Fraud Rule Basic</span>
                <span className={`font-mono text-xs font-bold ${fraudRuleBasicCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {fraudRuleBasicCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('rule-template-fraud-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Fraud Rule Template</span>
                <span className={`font-mono text-xs font-bold ${fraudRuleTemplateCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {fraudRuleTemplateCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('risk-engine-formula-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Formula Risk Engine</span>
                <span className={`font-mono text-xs font-bold ${fraudFormulaCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {fraudFormulaCount} Tiket
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-semibold group-hover:text-rose-700">
            <span>Buka Antrean Approval Fraud Engine</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
          </>
        )}
        
        {showFraud && (
          <>
        {/* ========================================== */}
        {/* ROW 2 - COL 1: FRAUD LIST REGISTRY       */}
        {/* ========================================== */}
        <div
          id="stat-card-fraud-list-registry"
          onClick={() => handleNavigate('list-management-cif-approval')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden h-full"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      Section 2B
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">Fraud List Registry</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">CIF Registry, Account Number, Device ID & Phone Number</p>
                </div>
              </div>

              {fraudListTotal > 0 ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-white shadow-2xs">
                  {fraudListTotal} Tiket
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>All Clear</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
              <div 
                onClick={(e) => handleNavigate('list-management-cif-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">CIF Registry</span>
                <span className={`font-mono text-xs font-bold ${fraudCifCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {fraudCifCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('list-management-account-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Account Number</span>
                <span className={`font-mono text-xs font-bold ${fraudAccountCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {fraudAccountCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('list-management-device-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Device ID</span>
                <span className={`font-mono text-xs font-bold ${fraudDeviceCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {fraudDeviceCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('list-management-phone-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">Phone Number</span>
                <span className={`font-mono text-xs font-bold ${fraudPhoneCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {fraudPhoneCount} Tiket
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold group-hover:text-amber-700">
            <span>Buka Antrean Approval List Registry</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
          </>
        )}

        {showAml && (
    <>
        {/* ========================================== */}
        {/* ROW 2 - COL 2: AML DOMAIN APPROVAL         */}
        {/* ========================================== */}
        <div
          id="stat-card-aml-rules-blacklist"
          onClick={() => handleNavigate('aml-master-blacklist-approval')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden h-full"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                      Section 3
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition">AML Domain Approval</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">AML Rules, AML Master Blacklist & External Blacklist (DTTOT)</p>
                </div>
              </div>

              {amlDomainTotal > 0 ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-600 text-white shadow-2xs">
                  {amlDomainTotal} Tiket
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>All Clear</span>
                </span>
              )}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
              <div 
                onClick={(e) => handleNavigate('rule-basic-aml-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">AML Rule Basic</span>
                <span className={`font-mono text-xs font-bold ${amlRuleBasicCount > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                  {amlRuleBasicCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('rule-template-aml-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">AML Rule Template</span>
                <span className={`font-mono text-xs font-bold ${amlRuleTemplateCount > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                  {amlRuleTemplateCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('aml-master-blacklist-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">AML Master Blacklist</span>
                <span className={`font-mono text-xs font-bold ${amlMasterCount > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                  {amlMasterCount} Tiket
                </span>
              </div>

              <div 
                onClick={(e) => handleNavigate('aml-external-blacklist-approval', e)}
                className="flex items-center justify-between text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 px-2.5 py-1.5 rounded transition"
              >
                <span className="text-xs font-medium">External Blacklist (DTTOT)</span>
                <span className={`font-mono text-xs font-bold ${amlExternalCount > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                  {amlExternalCount} Tiket
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold group-hover:text-purple-700">
            <span>Buka Antrean Approval AML Management</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
