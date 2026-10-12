const fs = require('fs');
let code = fs.readFileSync('src/data/mockCustomerProfiles.ts', 'utf8');

let txCount = 0;

code = code.replace(/associatedAccounts: \[\s*\{ accountNumber: '(\d+)',/g, (match, accNum) => {
  txCount++;
  return `deviceId: 'DEV-' + Math.random().toString(36).substring(7).toUpperCase(),
    deviceModel: ${txCount % 2 === 0 ? "'Samsung Galaxy S24'" : "'iPhone 15 Pro'"},
    transactionHistory: [
      {
        id: 'TXN-' + Math.random().toString(36).substring(7).toUpperCase(),
        transactionDate: '2026-09-15 14:30:21',
        accountNumber: '${accNum}',
        channel: 'MB',
        direction: 'DB',
        transactionCategory: 'Outgoing Transfer',
        amount: 2500000,
        availableBalance: 47500000,
        status: 'BERHASIL'
      },
      {
        id: 'TXN-' + Math.random().toString(36).substring(7).toUpperCase(),
        transactionDate: '2026-09-14 09:15:00',
        accountNumber: '${accNum}',
        channel: 'BI-FAST',
        direction: 'CR',
        transactionCategory: 'Incoming Transfer',
        amount: 10000000,
        availableBalance: 50000000,
        status: 'BERHASIL'
      },
      {
        id: 'TXN-' + Math.random().toString(36).substring(7).toUpperCase(),
        transactionDate: '2026-09-13 18:45:10',
        accountNumber: '${accNum}',
        channel: 'ATM',
        direction: 'DB',
        transactionCategory: 'ONUS',
        amount: 500000,
        availableBalance: 40000000,
        status: 'GAGAL'
      }
    ],
    ${match}`;
});

fs.writeFileSync('src/data/mockCustomerProfiles.ts', code);
