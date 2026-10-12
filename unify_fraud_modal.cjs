const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

// 1. Remove Judul Tiket Kasus and replace it with Deskripsi & Indikasi Kasus
const judulRegex = /\{\/\* Judul Tiket \*\/\}\s*<div className="sm:col-span-2 bg-slate-50 p-2\.5 rounded-lg border border-slate-100">\s*<span className="text-slate-500 block text-\[11px\]">Judul Tiket Kasus<\/span>\s*<span className="font-bold text-slate-900 text-sm">\{item\.ticketTitle\}<\/span>\s*<\/div>/;

const deskripsiReplacement = `{/* Deskripsi & Indikasi Kasus */}
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px] mb-1.5 font-bold uppercase tracking-wider">Deskripsi &amp; Indikasi Kasus</span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {item.ruleBasicCode && item.ruleBasicCode !== 'MANUAL' && item.ruleBasicCode !== 'System'
                        ? \`Rule Terpicu: \${item.ruleBasicName || item.ruleBasicCode} - \${item.incidentDescription || item.ticketTitle}\`
                        : \`\${item.ticketTitle ? item.ticketTitle + ' - ' : ''}\${item.incidentDescription}\`}
                    </p>
                  </div>`;

code = code.replace(judulRegex, deskripsiReplacement);

// 2. Remove Trigger Fallback block
const triggerRegex = /\{\/\* Fallback single trigger description \*\/\}\s*\{item\.incidentDescription && \(\s*<div className="text-\[11px\] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1\.5">\s*<span className="font-semibold text-slate-800 shrink-0">Trigger:<\/span>\s*<span>\{item\.incidentDescription\}<\/span>\s*<\/div>\s*\)\}/;
code = code.replace(triggerRegex, '');

// 3. Remove the original Deskripsi Kejadian block (and also its surrounding)
const deskripsiKejadianRegex = /\{\/\* Deskripsi Kejadian \*\/\}\s*<div className="sm:col-span-2 bg-slate-50 p-2\.5 rounded-lg border border-slate-100">\s*<span className="text-slate-500 block text-\[11px\] mb-1">Deskripsi Kejadian &amp; Latar Belakang<\/span>\s*<p className="text-slate-700 leading-relaxed text-xs">\s*\{item\.incidentDescription\}\s*<\/p>\s*<\/div>/;
code = code.replace(deskripsiKejadianRegex, '');

// 4. Remove Kantor Cabang
const cabangRegex = /<div className="bg-slate-50 p-2\.5 rounded-lg border border-slate-100">\s*<span className="text-slate-500 block text-\[11px\]">Kantor Cabang<\/span>\s*<span className="font-medium text-slate-800">\{item\.branchOffice\}<\/span>\s*<\/div>/;
code = code.replace(cabangRegex, '');

// Wait, Unit Pelapor was part of a grid, maybe make it col-span-2?
const unitPelaporRegex = /<div className="bg-slate-50 p-2\.5 rounded-lg border border-slate-100">\s*<span className="text-slate-500 block text-\[11px\]">Unit Pelapor<\/span>\s*<span className="font-medium text-slate-800">\{item\.reportingUnit\}<\/span>\s*<\/div>/;
code = code.replace(unitPelaporRegex, '<div className="sm:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">\n                    <span className="text-slate-500 block text-[11px]">Unit Pelapor</span>\n                    <span className="font-medium text-slate-800">{item.reportingUnit}</span>\n                  </div>');

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
console.log("Fraud Modal updated");
