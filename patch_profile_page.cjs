const fs = require('fs');
let code = fs.readFileSync('src/pages/profile/CustomerProfilePage.tsx', 'utf8');

// Update renderStatusBadge
const badgeRegex = /const renderStatusBadge = \(status: CustomerStatusType\) => \{[\s\S]*?case 'Under Review':[\s\S]*?return \([\s\S]*?\);[\s\S]*?default:[\s\S]*?return null;\s*\}\s*\};/;
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
code = code.replace(badgeRegex, newBadge);

// Update status filter placeholder
code = code.replace(/<option value="Under Review">Under Review<\/option>/, '<option value="Dormant">Dormant</option>\n              <option value="Suspend / Blocked">Suspend / Blocked</option>');

// Update state declaration and handleSelectCustomer
code = code.replace(/const \[selectedCustomer, setSelectedCustomer\] = useState<CustomerProfileRecord \| null>\(null\);/, 
`const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileRecord | null>(null);
  const [searchedAccount, setSearchedAccount] = useState<string | null>(null);

  const handleSelectCustomer = (cust: CustomerProfileRecord) => {
    setSelectedCustomer(cust);
    const query = searchQuery.trim();
    if (query && cust.associatedAccounts?.some(a => a.accountNumber.includes(query))) {
      setSearchedAccount(query);
    } else {
      setSearchedAccount(null);
    }
  };`);

// Replace setSelectedCustomer(cust) with handleSelectCustomer(cust)
code = code.replace(/onClick=\{\(\) => setSelectedCustomer\(cust\)\}/g, 'onClick={() => handleSelectCustomer(cust)}');
code = code.replace(/onBackToList=\{\(\) => setSelectedCustomer\(null\)\}/, 'onBackToList={() => setSelectedCustomer(null)}\n        searchedAccount={searchedAccount}');

// Update Search Filter logic
const filterRegex = /const matchRm = c\.crManager\.toLowerCase\(\)\.includes\(query\);\s*if \(!matchCif && !matchName && !matchId && !matchRm\) return false;/;
const newFilter = `const matchRm = c.crManager.toLowerCase().includes(query);
        const matchAccount = c.associatedAccounts?.some(acc => acc.accountNumber.includes(query));
        if (!matchCif && !matchName && !matchId && !matchRm && !matchAccount) return false;`;
code = code.replace(filterRegex, newFilter);

// Update table headers
const theadRegex = /<th className="py-3\.5 px-4 text-center">Risk<\/th>/;
const newThead = `<th className="py-3.5 px-4">Account Summary</th>\n                <th className="py-3.5 px-4 text-center">Risk</th>`;
code = code.replace(theadRegex, newThead);

// Update table body
const tbodyRegex = /\{\/\* 6\. Customer Relationship Manager \*\/\}(.|\n)*?<td className="py-3\.5 px-4 text-center whitespace-nowrap">/;
const newTbody = `{/* 6. Customer Relationship Manager */}
                    <td className="py-3.5 px-4 text-slate-800">
                      <div className="font-medium text-slate-900">{cust.crManager}</div>
                      <div className="text-[10px] text-slate-400">Due Diligence: {cust.dateOfLastDueDiligence}</div>
                    </td>

                    {/* 6.5 Account Summary */}
                    <td className="py-3.5 px-4">
                      {cust.associatedAccounts && cust.associatedAccounts.length > 0 ? (
                        <div className="text-xs">
                          <span className="font-bold text-slate-800">{cust.associatedAccounts.length} Rekening</span>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 max-w-[140px] truncate">
                            ({cust.associatedAccounts.map(a => a.accountNumber).join(', ')})
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No accounts</span>
                      )}
                    </td>

                    {/* 7. Risk Rating */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">`;
code = code.replace(tbodyRegex, newTbody);

fs.writeFileSync('src/pages/profile/CustomerProfilePage.tsx', code);
