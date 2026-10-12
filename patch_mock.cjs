const fs = require('fs');
let code = fs.readFileSync('src/data/mockCustomerProfiles.ts', 'utf8');

// I'll just regex replace each block to add associatedAccounts 
// For 'CIF1089201' (Budi Rahardjo)
code = code.replace(/totalAccountsCount: 3,/, `totalAccountsCount: 3,
    associatedAccounts: [
      { accountNumber: '014882001928', accountType: 'GIRO UTAMA (IDR)', status: 'Active', balance: 450250000 },
      { accountNumber: '014992018821', accountType: 'TABUNGAN BISNIS (IDR)', status: 'Active', balance: 128500000 },
      { accountNumber: '014112349000', accountType: 'DEPOSITO (IDR)', status: 'Active', balance: 1000000000 }
    ],`);

// Replace remaining 'Under Review' status to 'Suspend / Blocked'
code = code.replace(/'Under Review'/g, "'Suspend / Blocked'");

fs.writeFileSync('src/data/mockCustomerProfiles.ts', code);
