const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

const target = "`\\${item.ticketTitle ? item.ticketTitle + ' - ' : ''}\\${item.incidentDescription}`";
const replace = "item.ticketTitle && item.incidentDescription ? `\\${item.ticketTitle} - \\${item.incidentDescription}` : (item.ticketTitle || item.incidentDescription || 'Tidak ada deskripsi')";

code = code.split(target).join(replace);

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
