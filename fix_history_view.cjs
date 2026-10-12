const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryView.tsx', 'utf8');

// Replace Ticket Title in export headers
code = code.replace(/'Ticket Title',/, "'Deskripsi & Indikasi Kasus',");

// Replace Ticket Title in export rows
code = code.replace(/`"\$\{item\.ticketTitle\.replace\(\/"\/g, '""'\)\}"`,/, '`"${(item.incidentDescription || item.ticketTitle).replace(/"/g, \'""\')}"`,');

// Replace table header if it says Ticket Title (it says "Fraud Case ID / Ticket")
code = code.replace(/Fraud Case ID \/ Ticket/, 'Fraud Case ID');

// Replace ticketTitle in the table row
code = code.replace(/\{item\.ticketTitle\}/g, '{item.incidentDescription || item.ticketTitle}');

fs.writeFileSync('src/components/investigation/InvestigationHistoryView.tsx', code);
console.log("View updated");
