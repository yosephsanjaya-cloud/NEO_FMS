import { CifHistoricalTransaction, FraudCase } from '../types/fms';

export function getCifTransactionHistory(fraudCase: FraudCase): CifHistoricalTransaction[] {
  const currentTrx = fraudCase.transaction;
  const cif = fraudCase.cif;
  const sourceAcc = currentTrx?.sourceAccount || fraudCase.accountNumber || '10892019283';
  const currentTimestamp = currentTrx?.timestamp || fraudCase.identifiedOn;

  // Primary record is the trigger transaction
  const triggerRecord: CifHistoricalTransaction = {
    id: `ht-trigger-${fraudCase.caseId}`,
    trxId: currentTrx?.trxId || `TRX-ALERT-${cif}`,
    timestamp: currentTimestamp,
    channel: currentTrx?.channel || 'Mobile Banking',
    trxType: currentTrx?.trxType || 'BI-FAST Outward Transfer',
    amount: currentTrx?.amount || 145000000,
    currency: 'IDR',
    sourceAccount: sourceAcc,
    destinationAccount: currentTrx?.destinationAccount || '88201938472',
    destinationBank: currentTrx?.destinationBank || 'Bank Central Asia (BCA)',
    status: 'GAGAL',
    riskScore: fraudCase.finalRiskScore,
    isCurrentAlertTrigger: true,
    anomalyTag: `Trigger Alert: ${fraudCase.ruleBasicCode}`,
    location: currentTrx?.location || 'Jakarta Barat, ID',
    deviceModel: currentTrx?.deviceModel || fraudCase.deviceId
  };

  // Helper date subtraction for realistic chronological timeline
  const baseDate = new Date(currentTimestamp.replace(' ', 'T'));
  const isValidDate = !isNaN(baseDate.getTime());
  const now = isValidDate ? baseDate.getTime() : Date.now();

  const formatDate = (msOffset: number): string => {
    const d = new Date(now - msOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
  };

  // Specific bespoke history for known mock cases, or dynamic realistic generator for others
  if (cif === 'CIF8829103') {
    return [
      triggerRecord,
      {
        id: 'ht-cif1-1',
        trxId: 'TRX-BIF-20260825-99410',
        timestamp: formatDate(12 * 60 * 1000), // 12 mins ago
        channel: 'Mobile Banking',
        trxType: 'BI-FAST Outward Transfer',
        amount: 50000000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '88201938472',
        destinationBank: 'Bank Central Asia (BCA)',
        status: 'GAGAL',
        riskScore: 78,
        anomalyTag: 'Repeated Destination to Blacklist Acc',
        location: 'Jakarta Barat, ID',
        deviceModel: 'Samsung Galaxy S22'
      },
      {
        id: 'ht-cif1-2',
        trxId: 'TRX-MB-20260825-98120',
        timestamp: formatDate(45 * 60 * 1000), // 45 mins ago
        channel: 'Mobile Banking',
        trxType: 'Device Credential Password Reset',
        amount: 0,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '-',
        destinationBank: 'Bank Sampoerna Internal',
        status: 'BERHASIL',
        riskScore: 60,
        anomalyTag: 'First Time Device Onboarding',
        location: 'Jakarta Barat, ID',
        deviceModel: 'Samsung Galaxy S22'
      },
      {
        id: 'ht-cif1-3',
        trxId: 'TRX-QRIS-20260824-44120',
        timestamp: formatDate(26 * 3600 * 1000), // 1 day ago
        channel: 'QRIS',
        trxType: 'QRIS Merchant Payment',
        amount: 85000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: 'NMID-992018293',
        destinationBank: 'Kopi Kenangan Senopati',
        status: 'BERHASIL',
        riskScore: 12,
        anomalyTag: 'Normal Customer Baseline',
        location: 'Jakarta Selatan, ID',
        deviceModel: 'iPhone 14 Pro (Known Device)'
      },
      {
        id: 'ht-cif1-4',
        trxId: 'TRX-EWL-20260824-22109',
        timestamp: formatDate(30 * 3600 * 1000),
        channel: 'Mobile Banking',
        trxType: 'Top Up E-Wallet GoPay',
        amount: 500000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '081299482019',
        destinationBank: 'GoPay / PT Dompet Anak Bangsa',
        status: 'BERHASIL',
        riskScore: 15,
        anomalyTag: 'Routine Spending',
        location: 'Jakarta Selatan, ID',
        deviceModel: 'iPhone 14 Pro (Known Device)'
      },
      {
        id: 'ht-cif1-5',
        trxId: 'TRX-PAY-20260822-10829',
        timestamp: formatDate(3 * 24 * 3600 * 1000),
        channel: 'Internet Banking',
        trxType: 'Incoming Payroll Credit',
        amount: 42500000,
        currency: 'IDR',
        sourceAccount: '00918293019',
        destinationAccount: sourceAcc,
        destinationBank: 'Bank Sampoerna (Corporate Inflow)',
        status: 'BERHASIL',
        riskScore: 5,
        anomalyTag: 'Verified Payroll Inflow',
        location: 'Jakarta Pusat, ID',
        deviceModel: 'Corporate Portal Web'
      }
    ];
  }

  if (cif === 'CIF9182301') {
    return [
      triggerRecord,
      {
        id: 'ht-cif2-1',
        trxId: 'TRX-EWL-20260825-88219',
        timestamp: formatDate(1 * 60 * 1000),
        channel: 'Mobile Banking',
        trxType: 'Top Up DANA Balance',
        amount: 2000000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '085719384729',
        destinationBank: 'PT Espay Debit Indonesia (DANA)',
        status: 'GAGAL',
        riskScore: 82,
        anomalyTag: 'Burst Velocity #5',
        location: 'Surabaya, ID',
        deviceModel: 'Infinix Note 30 Pro'
      },
      {
        id: 'ht-cif2-2',
        trxId: 'TRX-EWL-20260825-88218',
        timestamp: formatDate(2 * 60 * 1000),
        channel: 'Mobile Banking',
        trxType: 'Top Up OVO Balance',
        amount: 2000000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '085719384729',
        destinationBank: 'OVO / PT Visionet',
        status: 'GAGAL',
        riskScore: 80,
        anomalyTag: 'Burst Velocity #4',
        location: 'Surabaya, ID',
        deviceModel: 'Infinix Note 30 Pro'
      },
      {
        id: 'ht-cif2-3',
        trxId: 'TRX-EWL-20260825-88217',
        timestamp: formatDate(3 * 60 * 1000),
        channel: 'Mobile Banking',
        trxType: 'Top Up ShopeePay Balance',
        amount: 2000000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '085719384729',
        destinationBank: 'ShopeePay',
        status: 'GAGAL',
        riskScore: 80,
        anomalyTag: 'Burst Velocity #3',
        location: 'Surabaya, ID',
        deviceModel: 'Infinix Note 30 Pro'
      },
      {
        id: 'ht-cif2-4',
        trxId: 'TRX-ATM-20260823-11029',
        timestamp: formatDate(2 * 24 * 3600 * 1000),
        channel: 'ATM Bersama',
        trxType: 'Cash Withdrawal ATM',
        amount: 1500000,
        currency: 'IDR',
        sourceAccount: sourceAcc,
        destinationAccount: '-',
        destinationBank: 'ATM Bersama Galaxy Mall Surabaya',
        status: 'BERHASIL',
        riskScore: 10,
        anomalyTag: 'Normal ATM Usage',
        location: 'Surabaya, ID',
        deviceModel: 'ATM Card'
      }
    ];
  }

  // Dynamic Generator for any other CIF
  return [
    triggerRecord,
    {
      id: `ht-${cif}-1`,
      trxId: `TRX-BIF-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formatDate(35 * 60 * 1000),
      channel: currentTrx?.channel || 'Mobile Banking',
      trxType: 'BI-FAST Transfer',
      amount: Math.round((currentTrx?.amount || 25000000) * 0.35),
      currency: 'IDR',
      sourceAccount: sourceAcc,
      destinationAccount: '99018294721',
      destinationBank: 'Bank Mandiri',
      status: 'BERHASIL',
      riskScore: 45,
      anomalyTag: 'Prior High Outflow',
      location: currentTrx?.location || 'Indonesia',
      deviceModel: fraudCase.deviceId
    },
    {
      id: `ht-${cif}-2`,
      trxId: `TRX-QRIS-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formatDate(18 * 3600 * 1000),
      channel: 'QRIS',
      trxType: 'QRIS Merchant Payment',
      amount: 120000,
      currency: 'IDR',
      sourceAccount: sourceAcc,
      destinationAccount: 'NMID-881920391',
      destinationBank: 'Supermarket Merchant QRIS',
      status: 'BERHASIL',
      riskScore: 8,
      anomalyTag: 'Normal Baseline Spending',
      location: 'Indonesia',
      deviceModel: 'Registered Mobile Device'
    },
    {
      id: `ht-${cif}-3`,
      trxId: `TRX-BILL-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formatDate(42 * 3600 * 1000),
      channel: 'Mobile Banking',
      trxType: 'Bill Payment PLN Postpaid',
      amount: 850000,
      currency: 'IDR',
      sourceAccount: sourceAcc,
      destinationAccount: '54201938472',
      destinationBank: 'PLN Persero',
      status: 'BERHASIL',
      riskScore: 5,
      anomalyTag: 'Utility Bill Routine',
      location: 'Indonesia',
      deviceModel: 'Registered Mobile Device'
    },
    {
      id: `ht-${cif}-4`,
      trxId: `TRX-EWL-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formatDate(3 * 24 * 3600 * 1000),
      channel: 'Mobile Banking',
      trxType: 'Top Up E-Wallet ShopeePay',
      amount: 300000,
      currency: 'IDR',
      sourceAccount: sourceAcc,
      destinationAccount: fraudCase.phoneNumber || '08123456789',
      destinationBank: 'ShopeePay Indonesia',
      status: 'BERHASIL',
      riskScore: 10,
      anomalyTag: 'Normal Top Up',
      location: 'Indonesia',
      deviceModel: 'Registered Mobile Device'
    },
    {
      id: `ht-${cif}-5`,
      trxId: `TRX-SAL-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: formatDate(7 * 24 * 3600 * 1000),
      channel: 'Corporate Banking',
      trxType: 'Payroll Salary Inflow',
      amount: 35000000,
      currency: 'IDR',
      sourceAccount: '00192837482',
      destinationAccount: sourceAcc,
      destinationBank: 'Bank Sampoerna Internal',
      status: 'BERHASIL',
      riskScore: 2,
      anomalyTag: 'Monthly Salary Credit',
      location: 'Jakarta, ID',
      deviceModel: 'Core Banking Batch'
    }
  ];
}
