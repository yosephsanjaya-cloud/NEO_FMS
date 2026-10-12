const fs = require('fs');
let code = fs.readFileSync('src/pages/profile/CustomerProfilePage.tsx', 'utf8');

const regex = /const renderStatusBadge = \(status: CustomerStatusType\) => \{[\s\S]*?case 'Under Review':[\s\S]*?return \([\s\S]*?\);[\s\S]*?default:[\s\S]*?return \([\s\S]*?\);\s*\}\s*\};/;
const newBadge = `const renderStatusBadge = (status: CustomerStatusType) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        );
      case 'Dormant':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Dormant
          </span>
        );
      case 'Suspend / Blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Suspend / Blocked
          </span>
        );
      default:
        return null;
    }
  };`;

code = code.replace(regex, newBadge);

fs.writeFileSync('src/pages/profile/CustomerProfilePage.tsx', code);
