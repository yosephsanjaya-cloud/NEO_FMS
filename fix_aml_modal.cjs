const fs = require('fs');
let lines = fs.readFileSync('src/components/investigation/AmlCifHistoryDetailModal.tsx', 'utf8').split('\n');

// 1. Remove the functions from the top (lines 1 to 27)
lines.splice(0, 27);

let code = lines.join('\n');

// 2. Insert them inside the component
let funcs = `
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !group) return;
    const file = e.target.files[0];
    const newFile = {
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: user?.username || 'CurrentUser',
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

let target = '  const handleCopyCif = () => {';
let idx = code.indexOf(target);
if (idx !== -1) {
  code = code.substring(0, idx) + funcs + '\n' + code.substring(idx);
}

fs.writeFileSync('src/components/investigation/AmlCifHistoryDetailModal.tsx', code);
