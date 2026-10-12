const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

const badLogic = "`\\${item.ticketTitle ? item.ticketTitle + ' - ' : ''}\\${item.incidentDescription}`";

const goodLogic = "item.ticketTitle && item.incidentDescription ? `${item.ticketTitle} - ${item.incidentDescription}` : item.ticketTitle || item.incidentDescription || 'Tidak ada deskripsi'";

code = code.replace(badLogic, goodLogic);

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
