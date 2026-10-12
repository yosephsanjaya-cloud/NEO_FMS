export type AmlEntityType = 'Individu' | 'Non-Individu';
export type AmlBlacklistStatus = 'Active' | 'Inactive';

export interface AmlMasterBlacklistEntry {
  id: string; // e.g. AML-BL-001
  type: AmlEntityType; // 'Individu' | 'Non-Individu'
  referensi: string; // Sumber referensi data blacklist (e.g. Kominfo Blokir, Bareskrim, OJK, PPATK)
  nama: string; // Nama Entitas, Situs Judi Online, atau Nama Lengkap Perorangan
  gelar?: string; // Gelar akademik atau gelar kehormatan, e.g. S.E., S.Kom., Dr.
  pekerjaan?: string; // (Individu) e.g. IT Developer Judol, Finansial Runner, Perekrut Rekening
  tanggalLahir?: string; // (Individu) YYYY-MM-DD
  tempatLahir?: string; // (Individu) Kota lahir
  kewarganegaraan?: string; // (Individu) e.g. Indonesia, Malaysia, China, Kamboja
  nomorPassport?: string; // (Individu) Nomor paspor jika ada
  npwp?: string; // Nomor Pokok Wajib Pajak (Common/Corporate)
  nik?: string; // (Individu) 16 digit Nomor Induk Kependudukan
  alamat?: string; // Alamat operasional atau domisili
  informasiLain?: string; // Rich notes: Indikasi kejahatan, rekening penampung, URL mirror, catatan auditor
  status: AmlBlacklistStatus; // 'Active' | 'Inactive'
  categoryTag?: 'Judi Online' | 'Terrorism / DTTOT' | 'Fraud Syndicate' | 'Money Laundering' | 'Illegal Investment' | 'Sanctions';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
}
