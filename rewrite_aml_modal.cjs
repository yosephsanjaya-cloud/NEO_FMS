const fs = require('fs');
let code = fs.readFileSync('src/components/investigation/AmlCifHistoryDetailModal.tsx', 'utf8');

let replaceStr = `Keputusan & Tindak Lanjut Penanganan Kasus AML`;
code = code.replace(replaceStr, 'Hasil Tindak Lanjut &amp; Catatan Persetujuan Audit');

let section3Idx = code.indexOf('{/* Section 3: Daftar Case / Rule AML yang Dilanggar CIF Ini (Read-Only) */}');
if (section3Idx !== -1) {
    // Find the end of Section 2.
    // It's `          </div>\n\n          {/* Section 3:`
    let endOfSection2 = code.lastIndexOf('</div>', section3Idx);
    
    let attachmentZone = `
            {/* Post-Closure Analysis Attachment Zone */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">Dokumen &amp; Laporan Hasil Analisis Akhir (Post-Closure Evidence)</h4>
                </div>
                <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                  <span>+ Upload Laporan Analisis</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-600">Nama Berkas</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Ukuran File</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Diupload Oleh</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Waktu Upload</th>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!group.postClosureAttachments || group.postClosureAttachments.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                          Belum ada dokumen lampiran post-closure.
                        </td>
                      </tr>
                    ) : (
                      group.postClosureAttachments.map(file => (
                        <tr key={file.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-2.5 font-medium text-slate-800 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            {file.fileName}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{(file.fileSize / 1024).toFixed(1)} KB</td>
                          <td className="px-4 py-2.5">
                            <div className="font-semibold text-slate-800">{file.uploadedBy}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{file.uploadedRole}</div>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{file.timestamp}</td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" className="text-blue-600 hover:text-blue-800 text-[10px] font-bold px-2 py-1 bg-blue-50 rounded border border-blue-100 transition">Preview</button>
                              <button type="button" className="text-slate-600 hover:text-slate-800 text-[10px] font-bold px-2 py-1 bg-slate-50 rounded border border-slate-200 transition">Download</button>
                              <button type="button" onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-800 text-[10px] font-bold px-2 py-1 bg-red-50 rounded border border-red-100 transition">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
    `;
    code = code.substring(0, endOfSection2) + attachmentZone + code.substring(endOfSection2);
}

if (!code.includes('useFMS')) {
  code = code.replace("import { AmlCifHistoryGroup, AmlChildRuleHistoryItem } from '../../types/fms';", "import { AmlCifHistoryGroup, AmlChildRuleHistoryItem } from '../../types/fms';\nimport { useFMS } from '../../context/FMSContext';\nimport { useAuth } from '../../context/AuthContext';");
  
  let componentStart = code.indexOf('const [copiedCif, setCopiedCif] = useState(false);');
  code = code.substring(0, componentStart) + `const { updateInvestigationHistoryItem } = useFMS();\n  const { user } = useAuth();\n  ` + code.substring(componentStart);
}

let funcs = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !group) return;
    const file = e.target.files[0];
    const newFile = {
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: user?.name || 'CurrentUser',
      uploadedRole: user?.role || 'user',
      timestamp: new Date().toLocaleString('id-ID')
    };
    const updatedGroup = {
      ...group,
      postClosureAttachments: [...(group.postClosureAttachments || []), newFile]
    };
    updateInvestigationHistoryItem(updatedGroup);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!group) return;
    const updatedGroup = {
      ...group,
      postClosureAttachments: (group.postClosureAttachments || []).filter(f => f.id !== fileId)
    };
    updateInvestigationHistoryItem(updatedGroup);
  };
`;
let componentStart2 = code.indexOf('const handleCopy = ');
code = code.substring(0, componentStart2) + funcs + code.substring(componentStart2);

fs.writeFileSync('src/components/investigation/AmlCifHistoryDetailModal.tsx', code);
