import { RuleDomain, VariablePlaceholder, AiCopilotMetadata } from '../types/fms';

export interface AiCopilotResult {
  name: string;
  domain: RuleDomain;
  category: string;
  queryLogic: string;
  parameters: VariablePlaceholder[];
  technicalSummary: string;
  syntaxAudit: {
    status: 'OPTIMAL' | 'WARNING';
    efficiencyScore: number;
    bottleneckRisks: string[];
    optimizationTips: string[];
  };
  guardrailNotice: string;
  prompt: string;
  generatedAt: string;
}

export function synthesizeRule(prompt: string, requestedDomain?: RuleDomain): AiCopilotResult {
  const p = prompt.toLowerCase();

  // 1. Domain Detection
  let domain: RuleDomain = requestedDomain || 'Fraud';
  if (!requestedDomain) {
    if (
      p.includes('aml') || 
      p.includes('smurfing') || 
      p.includes('pencucian uang') || 
      p.includes('structuring') || 
      p.includes('layering') || 
      p.includes('dttot') || 
      p.includes('pep') ||
      p.includes('tppu')
    ) {
      domain = 'AML';
    } else {
      domain = 'Fraud';
    }
  }

  // 2. Amount Extraction
  let thresholdAmount = 50000000;
  const millionMatch = p.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/);
  const billionMatch = p.match(/(\d+(?:[.,]\d+)?)\s*(?:miliar|milyar|m)/);
  const rawNumMatch = p.match(/(?:rp|idr)?\s*(\d{1,3}(?:\.\d{3}){1,3}|\d{7,10})/);

  if (millionMatch) {
    const val = parseFloat(millionMatch[1].replace(',', '.'));
    thresholdAmount = Math.round(val * 1000000);
  } else if (billionMatch) {
    const val = parseFloat(billionMatch[1].replace(',', '.'));
    thresholdAmount = Math.round(val * 1000000000);
  } else if (rawNumMatch) {
    const cleanNum = parseInt(rawNumMatch[1].replace(/\./g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      thresholdAmount = cleanNum;
    }
  }

  // 3. Time Window Extraction (in minutes)
  let timeWindowMinutes = 5;
  const minMatch = p.match(/(\d+)\s*(?:menit|mins|min)/);
  const hourMatch = p.match(/(\d+)\s*(?:jam|hours|hour)/);
  const dayMatch = p.match(/(\d+)\s*(?:hari|days|day)/);

  if (minMatch) {
    timeWindowMinutes = parseInt(minMatch[1], 10);
  } else if (hourMatch) {
    timeWindowMinutes = parseInt(hourMatch[1], 10) * 60;
  } else if (dayMatch) {
    timeWindowMinutes = parseInt(dayMatch[1], 10) * 1440;
  }

  // 4. Frequency Extraction
  let maxFrequency = 3;
  const freqMatch = p.match(/(\d+)\s*(?:kali|x|transaksi)/);
  if (freqMatch) {
    maxFrequency = parseInt(freqMatch[1], 10);
  }

  // 5. Channel Detection
  let detectedChannel = 'MB';
  if (p.includes('online banking') || p.includes('ob') || p.includes('web banking')) {
    detectedChannel = 'OB';
  } else if (p.includes('virtual account') || p.includes('va')) {
    detectedChannel = 'VA';
  } else if (p.includes('qris') || p.includes('qr')) {
    detectedChannel = 'QRIS';
  } else if (p.includes('card') || p.includes('kartu') || p.includes('debit') || p.includes('atm') || p.includes('edc')) {
    detectedChannel = 'CARD';
  } else if (p.includes('mobile') || p.includes('mb') || p.includes('m-banking')) {
    detectedChannel = 'MB';
  }

  // 6. Scenario Detection & Synthesis
  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Scenario A: Smurfing / Structuring (AML)
  if (domain === 'AML' || p.includes('smurfing') || p.includes('structuring') || p.includes('di bawah')) {
    const formattedAmount = new Intl.NumberFormat('id-ID').format(thresholdAmount);
    return {
      name: `Cetak Biru Deteksi Smurfing & Structuring Transaksi Finansial`,
      domain: 'AML',
      category: 'Structuring / Smurfing Pattern',
      queryLogic: `-- Neo FMS Engine v1.22 (Bento Architecture)
-- Deteksi Pola Smurfing: Transaksi kumulatif berulang mendekati batas pelaporan wajib
SELECT 
  cif,
  source_account,
  COUNT(trx_id) AS total_txns,
  SUM(amount) AS cumulative_amount,
  AVG(amount) AS average_amount,
  MIN(timestamp) AS first_txn_time,
  MAX(timestamp) AS last_txn_time
FROM transactions
WHERE timestamp >= NOW() - INTERVAL '{{TIME_WINDOW_MINUTES}} minute'
  AND amount BETWEEN {{MIN_AMOUNT}} AND {{MAX_THRESHOLD_AMOUNT}}
  AND status = 'SUCCESS'
GROUP BY cif, source_account
HAVING COUNT(trx_id) >= {{MIN_TXN_COUNT}}
   AND SUM(amount) >= {{CUMULATIVE_ALERT_THRESHOLD}};`,
      parameters: [
        {
          id: `p-${Date.now()}-1`,
          key: '{{MIN_AMOUNT}}',
          label: 'Batas Bawah Nominal Pemecahan (Split)',
          dataType: 'Number',
          defaultValue: Math.max(10000000, Math.round(thresholdAmount * 0.4)),
          unit: 'IDR',
          description: 'Nominal minimum transaksi per pemecahan dana'
        },
        {
          id: `p-${Date.now()}-2`,
          key: '{{MAX_THRESHOLD_AMOUNT}}',
          label: 'Batas Atas Nominal (Ambang Batas Structuring)',
          dataType: 'Number',
          defaultValue: thresholdAmount,
          unit: 'IDR',
          description: `Batas nominal maksimum (misal sedikit di bawah Rp ${formattedAmount})`
        },
        {
          id: `p-${Date.now()}-3`,
          key: '{{TIME_WINDOW_MINUTES}}',
          label: 'Jendela Waktu Agregasi',
          dataType: 'Number',
          defaultValue: timeWindowMinutes >= 60 ? timeWindowMinutes : 1440,
          unit: 'Menit',
          description: 'Periode akumulasi pemecahan transaksi (default 24 jam / 1440 menit)'
        },
        {
          id: `p-${Date.now()}-4`,
          key: '{{MIN_TXN_COUNT}}',
          label: 'Frekuensi Minimum Transaksi',
          dataType: 'Number',
          defaultValue: maxFrequency,
          unit: 'Kali',
          description: 'Jumlah minimum transaksi yang dicurigai sebagai pemecahan dana'
        },
        {
          id: `p-${Date.now()}-5`,
          key: '{{CUMULATIVE_ALERT_THRESHOLD}}',
          label: 'Total Akumulasi Pemicu Alert',
          dataType: 'Number',
          defaultValue: thresholdAmount * maxFrequency * 0.8,
          unit: 'IDR',
          description: 'Total akumulasi dana yang memicu alert kepatuhan AML'
        }
      ],
      technicalSummary: `Kueri mengagregasi transaksi sukses pada tabel 'transactions' dalam jendela waktu {{TIME_WINDOW_MINUTES}} menit. Mengelompokkan berdasarkan CIF dan nomor rekening asal, mencari pola pemecahan nominal antara {{MIN_AMOUNT}} dan {{MAX_THRESHOLD_AMOUNT}} yang dilakukan berulang kali (>= {{MIN_TXN_COUNT}} kali) dengan total kumulatif mencapai {{CUMULATIVE_ALERT_THRESHOLD}}. Pola ini memenuhi kriteria tipologi pencucian uang 'Structuring/Smurfing' untuk menghindari pelaporan transaksi tunai/keuangan regulator.`,
      syntaxAudit: {
        status: 'OPTIMAL',
        efficiencyScore: 95,
        bottleneckRisks: [
          'Pencarian multi-interval pada tabel transaksi volume besar memerlukan indeks komposit (cif, timestamp, amount) agar kalkulasi HAVING berjalan di memory.',
          'Penyaringan status SUCCESS dapat memanfaatkan partial index (WHERE status = \'SUCCESS\').'
        ],
        optimizationTips: [
          'CREATE INDEX idx_trx_aml_smurf ON transactions (cif, timestamp, amount) WHERE status = \'SUCCESS\';',
          'Pastikan parameter {{TIME_WINDOW_MINUTES}} dibatasi maksimal 30 hari untuk mencegah query full table scan.'
        ]
      },
      guardrailNotice: 'Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.',
      prompt,
      generatedAt: nowStr
    };
  }

  // Scenario B: Virtual Account Mule / Pass-Through Churn
  if (p.includes('mule') || p.includes('pass-through') || p.includes('transit') || p.includes('virtual account') || p.includes('va')) {
    return {
      name: `Cetak Biru Deteksi Rekening Penampung Virtual Account (Mule Pass-Through)`,
      domain: 'Fraud',
      category: 'Mule Account / Rapid Pass-Through',
      queryLogic: `-- Neo FMS Engine v1.22 (Bento Architecture)
-- Deteksi Aliran Dana Masuk VA dan Keluar Cepat (Pass-Through Mule)
WITH va_inflow AS (
  SELECT 
    destination_account AS va_number,
    cif,
    SUM(amount) AS total_inflow,
    COUNT(trx_id) AS in_count,
    MAX(timestamp) AS last_inflow_time
  FROM transactions
  WHERE channel = 'VA'
    AND timestamp >= NOW() - INTERVAL '{{TIME_WINDOW_MINUTES}} minute'
    AND status = 'SUCCESS'
  GROUP BY destination_account, cif
  HAVING SUM(amount) >= {{THRESHOLD_AMOUNT}}
),
va_outflow AS (
  SELECT 
    source_account AS account_num,
    SUM(amount) AS total_outflow,
    COUNT(trx_id) AS out_count,
    MIN(timestamp) AS first_outflow_time
  FROM transactions
  WHERE timestamp >= NOW() - INTERVAL '{{TIME_WINDOW_MINUTES}} minute'
    AND status = 'SUCCESS'
    AND trx_type = 'TRANSFER'
  GROUP BY source_account
)
SELECT 
  v.va_number,
  v.cif,
  v.total_inflow,
  o.total_outflow,
  (o.total_outflow / NULLIF(v.total_inflow, 0)) * 100 AS retention_ratio_pct,
  EXTRACT(EPOCH FROM (o.first_outflow_time - v.last_inflow_time)) / 60 AS delta_latency_minutes
FROM va_inflow v
JOIN va_outflow o ON v.va_number = o.account_num
WHERE (o.total_outflow / NULLIF(v.total_inflow, 0)) >= {{MIN_DRAIN_RATIO_PCT}}
  AND EXTRACT(EPOCH FROM (o.first_outflow_time - v.last_inflow_time)) <= {{MAX_RETENTION_LATENCY_MINUTES}};`,
      parameters: [
        {
          id: `p-${Date.now()}-1`,
          key: '{{THRESHOLD_AMOUNT}}',
          label: 'Batas Minimum Dana Masuk VA',
          dataType: 'Number',
          defaultValue: thresholdAmount,
          unit: 'IDR',
          description: 'Total akumulasi dana masuk via kanal Virtual Account'
        },
        {
          id: `p-${Date.now()}-2`,
          key: '{{TIME_WINDOW_MINUTES}}',
          label: 'Jendela Waktu Transit',
          dataType: 'Number',
          defaultValue: timeWindowMinutes >= 10 ? timeWindowMinutes : 15,
          unit: 'Menit',
          description: 'Rentang waktu pemantauan siklus masuk dan keluar dana'
        },
        {
          id: `p-${Date.now()}-3`,
          key: '{{MIN_DRAIN_RATIO_PCT}}',
          label: 'Rasio Pengurasan Dana (% Outflow vs Inflow)',
          dataType: 'Number',
          defaultValue: 85,
          unit: '%',
          description: 'Persentase dana yang langsung ditransfer keluar setelah diterima'
        },
        {
          id: `p-${Date.now()}-4`,
          key: '{{MAX_RETENTION_LATENCY_MINUTES}}',
          label: 'Maksimum Waktu Endap (Latency)',
          dataType: 'Number',
          defaultValue: 10,
          unit: 'Menit',
          description: 'Batas kecepatan penarikan dana keluar setelah dana masuk'
        }
      ],
      technicalSummary: `Kueri menggunakan Common Table Expressions (CTE) untuk membandingkan arus kas masuk pada Virtual Account ('VA') dengan arus transfer keluar dalam jendela waktu {{TIME_WINDOW_MINUTES}} menit. Memicu alert jika rasio penarikan dana keluar mencapai >= {{MIN_DRAIN_RATIO_PCT}}% dari dana masuk dengan waktu jeda penarikan <= {{MAX_RETENTION_LATENCY_MINUTES}} menit. Karakteristik ini identik dengan akun perantara/mule judi online atau tindak pidana penipuan.`,
      syntaxAudit: {
        status: 'OPTIMAL',
        efficiencyScore: 91,
        bottleneckRisks: [
          'Penggunaan CTE ganda dengan agregasi GROUP BY dapat menyebabkan hash join bertingkat pada volume transaksi masif.',
          'Klausa NULLIF dan EXTRACT EPOCH dieksekusi per baris hasil join.'
        ],
        optimizationTips: [
          'Pastikan indeks pada transactions (destination_account, channel, timestamp) dan (source_account, timestamp) tersedia.',
          'Dalam implementasi engine streaming FMS, logika ini idealnya didukung oleh in-memory windowing state (Redis/Apache Flink).'
        ]
      },
      guardrailNotice: 'Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.',
      prompt,
      generatedAt: nowStr
    };
  }

  // Scenario C: Geo-Anomaly / Impossible Travel / Luar Negeri
  if (p.includes('geo') || p.includes('jarak') || p.includes('lokasi') || p.includes('luar negeri') || p.includes('ip luar')) {
    return {
      name: `Cetak Biru Deteksi Anomali Geografis & Kecepatan Perpindahan Lokasi (Impossible Travel)`,
      domain: 'Fraud',
      category: 'Geo-Anomaly / Impossible Travel',
      queryLogic: `-- Neo FMS Engine v1.22 (Bento Architecture)
-- Deteksi Impossible Travel: Transaksi berturut-turut dari lokasi berjauhan dalam waktu singkat
WITH ranked_txns AS (
  SELECT 
    trx_id,
    cif,
    channel,
    amount,
    ip_address,
    location_lat,
    location_lon,
    timestamp,
    LAG(location_lat) OVER (PARTITION BY cif ORDER BY timestamp) AS prev_lat,
    LAG(location_lon) OVER (PARTITION BY cif ORDER BY timestamp) AS prev_lon,
    LAG(timestamp) OVER (PARTITION BY cif ORDER BY timestamp) AS prev_time,
    LAG(channel) OVER (PARTITION BY cif ORDER BY timestamp) AS prev_channel
  FROM transactions
  WHERE timestamp >= NOW() - INTERVAL '{{TIME_WINDOW_MINUTES}} minute'
    AND status IN ('SUCCESS', 'PENDING')
)
SELECT 
  trx_id,
  cif,
  channel,
  amount,
  ip_address,
  location_lat,
  location_lon,
  timestamp,
  -- Kalkulasi Jarak Haversine (Aproksimasi KM)
  ROUND(
    111.111 * DEGREES(
      ACOS(
        LEAST(1.0, GREATEST(-1.0, 
          COS(RADIANS(location_lat)) * COS(RADIANS(prev_lat)) * 
          COS(RADIANS(location_lon - prev_lon)) + 
          SIN(RADIANS(location_lat)) * SIN(RADIANS(prev_lat))
        ))
      )
    )::numeric, 2
  ) AS distance_km,
  ROUND(EXTRACT(EPOCH FROM (timestamp - prev_time)) / 60::numeric, 1) AS delta_time_minutes
FROM ranked_txns
WHERE prev_lat IS NOT NULL
  AND ROUND(EXTRACT(EPOCH FROM (timestamp - prev_time)) / 60::numeric, 1) <= {{MAX_INTERVAL_MINUTES}}
  AND (
    111.111 * DEGREES(
      ACOS(
        LEAST(1.0, GREATEST(-1.0, 
          COS(RADIANS(location_lat)) * COS(RADIANS(prev_lat)) * 
          COS(RADIANS(location_lon - prev_lon)) + 
          SIN(RADIANS(location_lat)) * SIN(RADIANS(prev_lat))
        ))
      )
    )
  ) >= {{MIN_DISTANCE_KM}};`,
      parameters: [
        {
          id: `p-${Date.now()}-1`,
          key: '{{MIN_DISTANCE_KM}}',
          label: 'Batas Jarak Minimum (Kilometer)',
          dataType: 'Number',
          defaultValue: 150,
          unit: 'KM',
          description: 'Jarak minimum antara dua transaksi berturut-turut yang memicu kecurigaan'
        },
        {
          id: `p-${Date.now()}-2`,
          key: '{{MAX_INTERVAL_MINUTES}}',
          label: 'Maksimum Selisih Waktu',
          dataType: 'Number',
          defaultValue: timeWindowMinutes >= 15 ? timeWindowMinutes : 30,
          unit: 'Menit',
          description: 'Batas waktu perpindahan lokasi fisik yang dinilai tidak realistis secara manusiawi'
        },
        {
          id: `p-${Date.now()}-3`,
          key: '{{TIME_WINDOW_MINUTES}}',
          label: 'Jendela Waktu Pemindaian Global',
          dataType: 'Number',
          defaultValue: 120,
          unit: 'Menit',
          description: 'Rentang waktu kueri mundur untuk mengambil data jejak transaksi'
        }
      ],
      technicalSummary: `Kueri memanfaatkan Window Function LAG() di atas partisi CIF untuk membandingkan koordinat geolokasi (Latitude & Longitude) antara dua transaksi berurutan dalam rentang waktu mundur {{TIME_WINDOW_MINUTES}} menit. Menggunakan formula Haversine untuk menghitung jarak absolut (KM). Jika jarak >= {{MIN_DISTANCE_KM}} KM terjadi dalam selisih waktu <= {{MAX_INTERVAL_MINUTES}} menit, transaksi ditandai sebagai indikasi pembajakan akun (Account Takeover) atau peretasan kartu/kredensial melalui jaringan VPN/Proxy.`,
      syntaxAudit: {
        status: 'WARNING',
        efficiencyScore: 86,
        bottleneckRisks: [
          'Kalkulasi trigonometri Haversine (ACOS, COS, SIN) membutuhkan CPU cycles per baris pada volume tinggi.',
          'Fungsi windowing LAG OVER (PARTITION BY cif ORDER BY timestamp) memerlukan pengurutan indeks pada (cif, timestamp).'
        ],
        optimizationTips: [
          'Wajib membuat indeks btree pada transactions(cif, timestamp, location_lat, location_lon).',
          'Pada fase engine screening real-time, koordinat lokasi sebelumnya disarankan disimpan di session cache Redis.'
        ]
      },
      guardrailNotice: 'Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.',
      prompt,
      generatedAt: nowStr
    };
  }

  // Scenario D: Multi-Account on Same Device (Device Mule / Fraud Ring)
  if (p.includes('device') || p.includes('perangkat') || p.includes('imei') || p.includes('banyak cif')) {
    return {
      name: `Cetak Biru Deteksi Sindikat Multi-Akun pada Perangkat Sama (Device Fraud Ring)`,
      domain: 'Fraud',
      category: 'Fraud Ring / Device Hijack',
      queryLogic: `-- Neo FMS Engine v1.22 (Bento Architecture)
-- Deteksi Sindikat Fraud: 1 Device ID digunakan untuk mengakses banyak CIF nasabah berbeda
SELECT 
  device_id,
  COUNT(DISTINCT cif) AS distinct_cif_count,
  COUNT(trx_id) AS total_transactions,
  SUM(amount) AS total_amount,
  ARRAY_AGG(DISTINCT cif) AS associated_cifs,
  ARRAY_AGG(DISTINCT channel) AS channels_used,
  MIN(timestamp) AS earliest_txn,
  MAX(timestamp) AS latest_txn
FROM transactions
WHERE timestamp >= NOW() - INTERVAL '{{TIME_WINDOW_MINUTES}} minute'
  AND device_id IS NOT NULL 
  AND device_id NOT IN ('UNKNOWN', 'WEB-BROWSER', '')
GROUP BY device_id
HAVING COUNT(DISTINCT cif) >= {{MAX_DISTINCT_CIF_COUNT}}
   AND COUNT(trx_id) >= {{MIN_TRANSACTION_COUNT}};`,
      parameters: [
        {
          id: `p-${Date.now()}-1`,
          key: '{{MAX_DISTINCT_CIF_COUNT}}',
          label: 'Batas Maksimum CIF per Perangkat',
          dataType: 'Number',
          defaultValue: 3,
          unit: 'CIF',
          description: 'Ambang batas jumlah CIF unik yang diakses dari satu perangkat fisik'
        },
        {
          id: `p-${Date.now()}-2`,
          key: '{{MIN_TRANSACTION_COUNT}}',
          label: 'Jumlah Transaksi Minimum',
          dataType: 'Number',
          defaultValue: maxFrequency,
          unit: 'Kali',
          description: 'Jumlah transaksi gabungan dari perangkat tersebut'
        },
        {
          id: `p-${Date.now()}-3`,
          key: '{{TIME_WINDOW_MINUTES}}',
          label: 'Jendela Waktu Pemantauan',
          dataType: 'Number',
          defaultValue: timeWindowMinutes >= 60 ? timeWindowMinutes : 1440,
          unit: 'Menit',
          description: 'Rentang waktu pemantauan perangkat (default 24 jam / 1440 menit)'
        }
      ],
      technicalSummary: `Kueri mengagregasi aktivitas transaksi berdasarkan 'device_id' dalam jendela waktu {{TIME_WINDOW_MINUTES}} menit. Menghitung jumlah CIF unik (DISTINCT cif) yang bertransaksi dari ID perangkat yang sama. Mengidentifikasi apakah 1 perangkat fisik menampung >= {{MAX_DISTINCT_CIF_COUNT}} nasabah berbeda dengan total transaksi >= {{MIN_TRANSACTION_COUNT}}. Pola ini merupakan indikasi kuat dari sindikat phishing, rekening penampung (money mule ring), atau perangkat sindikat kejahatan siber terorganisir.`,
      syntaxAudit: {
        status: 'OPTIMAL',
        efficiencyScore: 93,
        bottleneckRisks: [
          'Klausa COUNT(DISTINCT cif) dan ARRAY_AGG(DISTINCT cif) membutuhkan alokasi memori sort/hash table pada agregasi volume besar.'
        ],
        optimizationTips: [
          'Pastikan indeks komposit pada transactions (device_id, timestamp, cif) terdefinisi.',
          'Filter WHERE device_id IS NOT NULL menghindari scanning baris kosong.'
        ]
      },
      guardrailNotice: 'Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.',
      prompt,
      generatedAt: nowStr
    };
  }

  // Scenario E (Default / Velocity Burst): Frekuensi Cepat & Nominal Tinggi Lintas Kanal
  const formattedNominal = new Intl.NumberFormat('id-ID').format(thresholdAmount);
  return {
    name: `Cetak Biru Deteksi Lonjakan Transaksi Kecepatan Tinggi (Velocity Burst - ${detectedChannel})`,
    domain: domain,
    category: 'Velocity & Rapid Drain',
    queryLogic: `-- Neo FMS Engine v1.22 (Bento Architecture)
-- Deteksi Velocity Burst: Transaksi frekuensi tinggi melampaui ambang batas nominal
SELECT 
  cif,
  source_account,
  device_id,
  channel,
  COUNT(trx_id) AS txn_count,
  SUM(amount) AS total_amount,
  MAX(amount) AS max_single_amount,
  MIN(timestamp) AS burst_start_time,
  MAX(timestamp) AS burst_end_time
FROM transactions
WHERE timestamp >= NOW() - INTERVAL '{{TIME_WINDOW_MINUTES}} minute'
  AND channel = '{{TARGET_CHANNEL}}'
  AND amount >= {{THRESHOLD_AMOUNT}}
  AND status IN ('SUCCESS', 'PENDING')
GROUP BY cif, source_account, device_id, channel
HAVING COUNT(trx_id) >= {{MAX_FREQUENCY}};`,
    parameters: [
      {
        id: `p-${Date.now()}-1`,
        key: '{{THRESHOLD_AMOUNT}}',
        label: 'Ambang Batas Nominal per Transaksi',
        dataType: 'Number',
        defaultValue: thresholdAmount,
        unit: 'IDR',
        description: `Batas nominal minimum per transaksi pemicu alert (misal Rp ${formattedNominal})`
      },
      {
        id: `p-${Date.now()}-2`,
        key: '{{TIME_WINDOW_MINUTES}}',
        label: 'Jendela Waktu Pemantauan',
        dataType: 'Number',
        defaultValue: timeWindowMinutes,
        unit: 'Menit',
        description: 'Rentang waktu ke belakang untuk menghitung frekuensi transaksi'
      },
      {
        id: `p-${Date.now()}-3`,
        key: '{{MAX_FREQUENCY}}',
        label: 'Batas Frekuensi Pemicu Alert',
        dataType: 'Number',
        defaultValue: maxFrequency,
        unit: 'Kali',
        description: 'Jumlah transaksi minimum dalam rentang waktu yang dianggap sebagai anomali'
      },
      {
        id: `p-${Date.now()}-4`,
        key: '{{TARGET_CHANNEL}}',
        label: 'Kanal Transaksi Sasaran',
        dataType: 'Enum',
        defaultValue: detectedChannel,
        enumOptions: ['MB', 'OB', 'VA', 'QRIS', 'CARD'],
        unit: 'Kanal',
        description: 'Saluran transaksi finansial yang dipantau secara spesifik'
      }
    ],
    technicalSummary: `Kueri memantau transaksi pada saluran {{TARGET_CHANNEL}} dalam rentang {{TIME_WINDOW_MINUTES}} menit ke belakang. Mengelompokkan transaksi per kombinasi CIF, rekening, dan Device ID, lalu memicu alert apabila frekuensi transaksi bernilai >= {{THRESHOLD_AMOUNT}} terjadi sebanyak >= {{MAX_FREQUENCY}} kali. Ditujukan untuk menggagalkan upaya pengurasan saldo rekening nasabah (rapid account drain) pasca pencurian kredensial otentikasi.`,
    syntaxAudit: {
      status: 'OPTIMAL',
      efficiencyScore: 96,
      bottleneckRisks: [
        'Klausa GROUP BY pada cif, source_account, device_id berjalan efisien asalkan rentang timestamp dibatasi secara ketat.'
      ],
      optimizationTips: [
        'CREATE INDEX idx_trx_velocity ON transactions (channel, timestamp, amount, cif);',
        'Pertimbangkan filter status IN (\'SUCCESS\', \'PENDING\') agar transaksi yang sedang dalam proses verifikasi 2FA tetap terpantau.'
      ]
    },
    guardrailNotice: 'Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.',
    prompt,
    generatedAt: nowStr
  };
}
