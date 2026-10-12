const fs = require('fs');
let code = fs.readFileSync('src/types/fms.ts', 'utf8');

code = code.replace(/associatedAccounts\?: Array<\{ accountNumber: string; accountType: string; status: string; balance: number \}>;/, 
`associatedAccounts?: Array<{ accountNumber: string; accountType: string; status: string; balance: number }>;
  deviceId?: string;
  deviceModel?: string;
  transactionHistory?: Array<{
    id: string;
    transactionDate: string;
    accountNumber: string;
    channel: string;
    direction: 'CR' | 'DB';
    transactionCategory: 'Incoming Transfer' | 'Outgoing Transfer' | 'ONUS';
    amount: number;
    availableBalance: number;
    status: 'BERHASIL' | 'GAGAL';
  }>;`);

fs.writeFileSync('src/types/fms.ts', code);
