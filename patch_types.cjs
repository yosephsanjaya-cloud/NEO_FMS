const fs = require('fs');
let code = fs.readFileSync('src/types/fms.ts', 'utf8');

// Update CustomerStatusType
code = code.replace(/export type CustomerStatusType = 'Active' \| 'Inactive' \| 'Dormant' \| 'Under Review';/, 
  "export type CustomerStatusType = 'Active' | 'Inactive' | 'Dormant' | 'Suspend / Blocked';");

// Add associatedAccounts to CustomerProfileRecord
code = code.replace(/totalAccountsCount\?: number;/, `totalAccountsCount?: number;\n  associatedAccounts?: Array<{ accountNumber: string; accountType: string; status: string; balance: number }>;`);

fs.writeFileSync('src/types/fms.ts', code);
