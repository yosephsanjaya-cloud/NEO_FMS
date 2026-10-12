import { AmlCifHistoryGroup, AmlChildRuleHistoryItem, InvestigationHistoryItem, FraudCase } from '../types/fms';
import { formatTaxonomyLabel } from './taxonomyHelper';

/**
 * Builds AmlCifHistoryGroup from a single approved AML CIF entity and its child cases.
 * Generates a unique incident ID per approval cycle so multiple historical records for the same CIF can exist.
 */
export function buildAmlCifHistoryGroup(
  cif: string,
  cases: FraudCase[],
  resolvedPayload: {
    batchId?: string;
    reviewerResult?: string;
    finalResult?: string;
    closingAction?: string;
    typeOfAml?: string;
    reviewerComment?: string;
    reviewer?: string;
    approverComment?: string;
    approvedBy?: string;
    closedAt?: string;
  }
): AmlCifHistoryGroup {
  const first = (cases[0] || {}) as Partial<FraudCase>;
  const timestamp = resolvedPayload.closedAt || new Date().toISOString().replace('T', ' ').substring(0, 19);
  const timeSuffix = timestamp.replace(/[^0-9]/g, '');
  const uniqueId = `aml-cif-hist-${cif}-${timeSuffix}-${Math.random().toString(36).substring(2, 6)}`;
  const batchId = resolvedPayload.batchId || (first as any).batchId || `BATCH-20260825-${cif.replace(/[^0-9]/g, '') || '001'}`;
  const investigationId = first.caseId ? `INV-${first.caseId}` : `INV-AML-${cif}-${timeSuffix.slice(-6)}`;

  const childRules: AmlChildRuleHistoryItem[] = cases.map((cs, idx) => {
    let caseSpecificPayload: any = null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem(`fms_followup_payload_${cs.caseId}`) || sessionStorage.getItem(`fms_followup_payload_${cs.id}`);
        if (raw) caseSpecificPayload = JSON.parse(raw);
      }
    } catch {}

    const reviewerResult = caseSpecificPayload?.reviewerResult || cs.reviewerResult || resolvedPayload.reviewerResult || 'AM-RR-001 - Mencurigakan';
    const finalResult = caseSpecificPayload?.finalResult || cs.finalResult || resolvedPayload.finalResult || 'AM-FR-001 - Mencurigakan / AML Confirmed';
    const closingAction = caseSpecificPayload?.closingAction || cs.closingAction || resolvedPayload.closingAction || 'AM-CA-001 - Laporkan STR';
    const typeOfAml = caseSpecificPayload?.typeOfAml || caseSpecificPayload?.typeOfFraud || cs.typeOfFraud || resolvedPayload.typeOfAml || 'AM-TOF-001 - Structuring (Smurfing)';
    const reviewerComment = caseSpecificPayload?.reviewerComment || cs.reviewerComment || cs.resolutionNotes || resolvedPayload.reviewerComment || 'Penanganan alert selesai sesuai prosedur SOP AML.';
    const approverComment = resolvedPayload.approverComment || 'Disetujui oleh AML Checker L2.';
    const approvedBy = resolvedPayload.approvedBy || 'analystl2';

    return {
      id: cs.id || `child-${cs.caseId || idx}-${timeSuffix}`,
      caseId: cs.caseId || `AML-CASE-${idx + 1}`,
      ruleCode: cs.ruleBasicCode || `R-AML-00${idx + 1}`,
      ruleName: cs.ruleName || `AML Rule ${cs.ruleBasicCode || idx + 1}`,
      ruleTemplateCode: cs.ruleTemplateCode,
      severity: (cs.caseUrgency === 'High' ? 'HIGH' : cs.caseUrgency === 'Med' ? 'MEDIUM' : 'LOW'),
      riskScore: cs.finalRiskScore || 80,
      urgency: cs.caseUrgency || 'High',
      amount: cs.transaction?.amount || 50000000,
      identifiedOn: cs.identifiedOn || timestamp,
      channel: cs.transaction?.channel || 'Mobile Banking',
      sourceAccount: cs.transaction?.sourceAccount || cs.accountNumber,
      destinationAccount: cs.transaction?.destinationAccount,
      destinationBank: cs.transaction?.destinationBank,
      reviewerResult,
      finalResult,
      closingAction,
      typeOfAml,
      reviewerComment,
      approverComment,
      approvedBy,
      approvedAt: timestamp,
      l1Maker: resolvedPayload.reviewer || 'analystl1',
      l2Checker: approvedBy,
      status: 'Closed',
      transactionEvidenceList: cs.transactionEvidenceList,
      transaction: cs.transaction
    };
  });

  const maxScore = Math.max(...cases.map(c => c.finalRiskScore || 0), 80);
  const customerName = first.customerName || 'Nasabah Bank Sampoerna';
  const customerType = (customerName.includes('PT') || customerName.includes('CV')) ? 'Corporate' : 'Individual';

  return {
    id: uniqueId,
    batchId,
    investigationId,
    cif,
    customerName,
    customerType,
    accountNumber: first.accountNumber || first.transaction?.sourceAccount || '99018274619',
    deviceId: first.deviceId || 'DEV-SAMPOERNA-01',
    phoneNumber: first.phoneNumber || '081298765432',
    totalRulesResolved: cases.length,
    highestRiskScore: maxScore,
    investigationStatus: 'Closed',
    completionDate: timestamp,
    completionDateOnly: timestamp.substring(0, 10),
    overallClosingStatus: 'CLOSED - CONFIRMED AML',
    overallClosingAction: resolvedPayload.closingAction || 'AM-CA-001 - Laporkan STR',
    overallFinalResult: resolvedPayload.finalResult || 'AM-FR-001 - Mencurigakan / AML Confirmed',
    overallReviewerResult: resolvedPayload.reviewerResult || 'AM-RR-001 - Mencurigakan',
    overallTypeOfAml: resolvedPayload.typeOfAml || 'AM-TOF-001 - Structuring (Smurfing)',
    l1Maker: {
      name: resolvedPayload.reviewer || 'analystl1',
      unit: 'AML Compliance & Investigation Unit',
      notes: resolvedPayload.reviewerComment || 'Hasil penanganan dan investigasi AML L1 disetujui.',
      actionTime: timestamp
    },
    l2Checker: {
      name: resolvedPayload.approvedBy || 'analystl2',
      unit: 'AML Compliance & Regulatory Reporting',
      notes: resolvedPayload.approverComment || 'Disetujui oleh AML Checker (L2). Kasus resmi ditutup.',
      actionTime: timestamp
    },
    childRules,
    cases
  };
}

/**
 * Converts array of legacy InvestigationHistoryItem or closed cases into AmlCifHistoryGroup[].
 * Guarantees STRICT Group By Batch ID deduplication so 1 Batch ID = Exact 1 Row.
 */
export function aggregateAmlHistoryByCif(
  rawAmlItems: (InvestigationHistoryItem | AmlCifHistoryGroup)[],
  closedCases: FraudCase[] = []
): AmlCifHistoryGroup[] {
  // Step 1: Normalize all raw inputs into preliminary AmlCifHistoryGroup candidates
  const candidateList: AmlCifHistoryGroup[] = [];

  rawAmlItems.forEach(item => {
    if ('childRules' in item && Array.isArray((item as AmlCifHistoryGroup).childRules)) {
      const g = item as AmlCifHistoryGroup;
      const bId = g.batchId || `BATCH-20260825-${g.cif.replace(/[^0-9]/g, '') || '001'}`;
      candidateList.push({
        ...g,
        batchId: bId
      });
    } else if (!('childRules' in item) && (item as any).domain === 'AML') {
      const histItem = item as InvestigationHistoryItem;
      const bId = (histItem as any).batchId || `BATCH-20260825-${histItem.cif.replace(/[^0-9]/g, '') || '001'}`;
      const childRules: AmlChildRuleHistoryItem[] = (histItem.violatedRules && histItem.violatedRules.length > 0)
        ? histItem.violatedRules.map((vr, idx) => ({
            id: `vr-${vr.ruleCaseId || idx}`,
            caseId: vr.ruleCaseId || `${histItem.caseId}-R${idx + 1}`,
            ruleCode: vr.ruleCode,
            ruleName: vr.ruleName,
            severity: vr.severity || 'HIGH',
            riskScore: histItem.riskScoreSnapshot || 85,
            urgency: 'High',
            amount: vr.triggeredAmountIdr || histItem.lossAmountIdr || 150000000,
            identifiedOn: histItem.closedAt,
            channel: 'Corporate Internet Banking',
            reviewerResult: histItem.reviewerResult || 'AM-RR-001 - Mencurigakan',
            finalResult: histItem.finalResult || 'AM-FR-001 - Mencurigakan / AML Confirmed',
            closingAction: histItem.closingAction || 'AM-CA-001 - Laporkan STR',
            typeOfAml: histItem.typeOfAml || histItem.typeOfFraud || 'AM-TOF-001 - Structuring (Smurfing)',
            reviewerComment: histItem.reviewerComment || histItem.l1Maker.notes || 'Hasil pemeriksaan L1 memenuhi kriteria indikasi pencucian uang.',
            approverComment: histItem.approverComment || histItem.l2Checker.notes || 'Disetujui oleh AML Checker L2.',
            approvedBy: histItem.l2Checker.name || 'analystl2',
            approvedAt: histItem.closedAt,
            l1Maker: histItem.l1Maker.name || 'analystl1',
            l2Checker: histItem.l2Checker.name || 'analystl2',
            status: 'Closed'
          }))
        : [
            {
              id: `vr-main-${histItem.caseId}`,
              caseId: histItem.caseId,
              ruleCode: histItem.ruleBasicCode,
              ruleName: histItem.ruleBasicName,
              severity: 'HIGH',
              riskScore: histItem.riskScoreSnapshot || 85,
              urgency: 'High',
              amount: histItem.lossAmountIdr,
              identifiedOn: histItem.closedAt,
              channel: 'Banking System',
              reviewerResult: histItem.reviewerResult || 'AM-RR-001 - Mencurigakan',
              finalResult: histItem.finalResult || 'AM-FR-001 - Mencurigakan / AML Confirmed',
              closingAction: histItem.closingAction || 'AM-CA-001 - Laporkan STR',
              typeOfAml: histItem.typeOfAml || histItem.typeOfFraud || 'AM-TOF-001 - Structuring (Smurfing)',
              reviewerComment: histItem.reviewerComment || histItem.l1Maker.notes || 'Pemeriksaan AML L1 telah diselesaikan.',
              approverComment: histItem.approverComment || histItem.l2Checker.notes || 'Disetujui Checker L2.',
              approvedBy: histItem.l2Checker.name || 'analystl2',
              approvedAt: histItem.closedAt,
              l1Maker: histItem.l1Maker.name || 'analystl1',
              l2Checker: histItem.l2Checker.name || 'analystl2',
              status: 'Closed'
            }
          ];

      candidateList.push({
        id: `aml-batch-${bId}`,
        batchId: bId,
        investigationId: histItem.caseId || bId,
        cif: histItem.cif,
        customerName: histItem.customerName,
        customerType: histItem.customerType || 'Individual',
        accountNumber: histItem.accountNumber,
        deviceId: 'DEV-SAMPOERNA-01',
        phoneNumber: '081298765432',
        totalRulesResolved: childRules.length,
        highestRiskScore: histItem.riskScoreSnapshot || 85,
        investigationStatus: 'Closed',
        completionDate: histItem.closedAt,
        completionDateOnly: histItem.closedDateOnly || histItem.closedAt.substring(0, 10),
        overallClosingStatus: histItem.closingStatus || 'CLOSED - CONFIRMED AML',
        overallClosingAction: histItem.closingAction || 'AM-CA-001 - Laporkan STR',
        overallFinalResult: histItem.finalResult || 'AM-FR-001 - Mencurigakan / AML Confirmed',
        overallReviewerResult: histItem.reviewerResult || 'AM-RR-001 - Mencurigakan',
        overallTypeOfAml: histItem.typeOfAml || histItem.typeOfFraud || 'AM-TOF-001 - Structuring (Smurfing)',
        l1Maker: histItem.l1Maker,
        l2Checker: histItem.l2Checker,
        childRules
      });
    }
  });

  // Step 2: Strict Deduplication & Grouping by Batch ID
  const batchMap = new Map<string, AmlCifHistoryGroup>();

  candidateList.forEach(item => {
    const bId = item.batchId || `BATCH-20260825-${item.cif.replace(/[^0-9]/g, '') || '001'}`;
    const existing = batchMap.get(bId);

    if (!existing) {
      batchMap.set(bId, {
        ...item,
        id: `batch-${bId}`,
        batchId: bId,
        investigationId: bId,
        childRules: [...(item.childRules || [])]
      });
    } else {
      // Merge child rules and deduplicate by rule code & case ID
      const combinedRules = [...(existing.childRules || []), ...(item.childRules || [])];
      const seenRuleKeys = new Set<string>();
      const dedupedRules: AmlChildRuleHistoryItem[] = [];

      combinedRules.forEach(r => {
        const ruleKey = `${r.ruleCode}-${r.caseId || r.id}`;
        if (!seenRuleKeys.has(ruleKey)) {
          seenRuleKeys.add(ruleKey);
          dedupedRules.push(r);
        }
      });

      // Recalculate max risk score
      const maxScore = Math.max(
        ...dedupedRules.map(r => r.riskScore || 0),
        existing.highestRiskScore || 0,
        item.highestRiskScore || 0,
        0
      );

      // Keep latest completion date
      const latestCompletionDate = (item.completionDate && item.completionDate > existing.completionDate) 
        ? item.completionDate 
        : existing.completionDate;

      batchMap.set(bId, {
        ...existing,
        completionDate: latestCompletionDate,
        completionDateOnly: latestCompletionDate.substring(0, 10),
        childRules: dedupedRules,
        totalRulesResolved: dedupedRules.length,
        highestRiskScore: maxScore
      });
    }
  });

  const finalGroupedList = Array.from(batchMap.values());

  // Sort strictly by completionDate descending (newest incident first)
  return finalGroupedList.sort((a, b) => b.completionDate.localeCompare(a.completionDate));
}
