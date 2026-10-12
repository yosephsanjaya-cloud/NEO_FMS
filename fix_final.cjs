const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', 'utf8');

const regex = /\{\/\* Deskripsi \& Indikasi Kasus \*\/\}(.|\n)*?<\/div>/;

const replacement = `{/* Deskripsi & Indikasi Kasus */}
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[11px] mb-1.5 font-bold uppercase tracking-wider">Deskripsi &amp; Indikasi Kasus</span>
                    <p className="text-slate-700 leading-relaxed text-xs">
                      {item.ruleBasicCode && item.ruleBasicCode !== 'MANUAL' && item.ruleBasicCode !== 'System'
                        ? \`Rule Terpicu: \${item.ruleBasicName || item.ruleBasicCode} - \${item.incidentDescription || item.ticketTitle || 'Tidak ada deskripsi'}\`
                        : (item.ticketTitle && item.incidentDescription ? \`\${item.ticketTitle} - \${item.incidentDescription}\` : (item.ticketTitle || item.incidentDescription || 'Tidak ada deskripsi'))}
                    </p>
                  </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/investigation/InvestigationHistoryDetailModal.tsx', code);
