const fs = require('fs');
let code = fs.readFileSync('src/data/mockCustomerProfiles.ts', 'utf8');

let count = 0;
code = code.replace(/totalActiveAlertsCount/g, (match) => {
  count++;
  if (count === 1) return match; // Already added for first one manually
  return `associatedAccounts: [
      { accountNumber: '102938500' + ${count}, accountType: 'TABUNGAN', status: 'Active', balance: 50000000 },
      { accountNumber: '102938500' + (${count} + 10), accountType: 'GIRO', status: 'Inactive', balance: 10000000 }
    ],
    totalActiveAlertsCount`;
});

fs.writeFileSync('src/data/mockCustomerProfiles.ts', code);
