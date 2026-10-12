const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

// The error said `user?.name` doesn't exist on `AuthUser`. The property is probably `user?.username`.
// Let's replace `user?.name || 'CurrentUser'` with `user?.username || 'CurrentUser'`
// And `l1Maker.role` with `l1Maker.unit` or something, because HistoryOfficerProfile doesn't have `role`.

code = code.replace(/user\?\.name \|\| 'CurrentUser'/g, "user?.username || 'CurrentUser'");
code = code.replace(/item\.l1Maker\.role \|\| 'afcl1'/g, "item.domain === 'Fraud' ? 'afcl1' : 'analystl1'");
code = code.replace(/item\.l2Checker\.role \|\| 'afcl2'/g, "item.domain === 'Fraud' ? 'afcl2' : 'analystl2'");

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
