var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);

// src/lib/ruleCopilotSynthesizer.ts
function synthesizeRule(prompt, requestedDomain) {
  const p = prompt.toLowerCase();
  let domain = requestedDomain || "Fraud";
  if (!requestedDomain) {
    if (p.includes("aml") || p.includes("smurfing") || p.includes("pencucian uang") || p.includes("structuring") || p.includes("layering") || p.includes("dttot") || p.includes("pep") || p.includes("tppu")) {
      domain = "AML";
    } else {
      domain = "Fraud";
    }
  }
  let thresholdAmount = 5e7;
  const millionMatch = p.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/);
  const billionMatch = p.match(/(\d+(?:[.,]\d+)?)\s*(?:miliar|milyar|m)/);
  const rawNumMatch = p.match(/(?:rp|idr)?\s*(\d{1,3}(?:\.\d{3}){1,3}|\d{7,10})/);
  if (millionMatch) {
    const val = parseFloat(millionMatch[1].replace(",", "."));
    thresholdAmount = Math.round(val * 1e6);
  } else if (billionMatch) {
    const val = parseFloat(billionMatch[1].replace(",", "."));
    thresholdAmount = Math.round(val * 1e9);
  } else if (rawNumMatch) {
    const cleanNum = parseInt(rawNumMatch[1].replace(/\./g, ""), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      thresholdAmount = cleanNum;
    }
  }
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
  let maxFrequency = 3;
  const freqMatch = p.match(/(\d+)\s*(?:kali|x|transaksi)/);
  if (freqMatch) {
    maxFrequency = parseInt(freqMatch[1], 10);
  }
  let detectedChannel = "MB";
  if (p.includes("online banking") || p.includes("ob") || p.includes("web banking")) {
    detectedChannel = "OB";
  } else if (p.includes("virtual account") || p.includes("va")) {
    detectedChannel = "VA";
  } else if (p.includes("qris") || p.includes("qr")) {
    detectedChannel = "QRIS";
  } else if (p.includes("card") || p.includes("kartu") || p.includes("debit") || p.includes("atm") || p.includes("edc")) {
    detectedChannel = "CARD";
  } else if (p.includes("mobile") || p.includes("mb") || p.includes("m-banking")) {
    detectedChannel = "MB";
  }
  const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
  if (domain === "AML" || p.includes("smurfing") || p.includes("structuring") || p.includes("di bawah")) {
    const formattedAmount = new Intl.NumberFormat("id-ID").format(thresholdAmount);
    return {
      name: `Cetak Biru Deteksi Smurfing & Structuring Transaksi Finansial`,
      domain: "AML",
      category: "Structuring / Smurfing Pattern",
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
          key: "{{MIN_AMOUNT}}",
          label: "Batas Bawah Nominal Pemecahan (Split)",
          dataType: "Number",
          defaultValue: Math.max(1e7, Math.round(thresholdAmount * 0.4)),
          unit: "IDR",
          description: "Nominal minimum transaksi per pemecahan dana"
        },
        {
          id: `p-${Date.now()}-2`,
          key: "{{MAX_THRESHOLD_AMOUNT}}",
          label: "Batas Atas Nominal (Ambang Batas Structuring)",
          dataType: "Number",
          defaultValue: thresholdAmount,
          unit: "IDR",
          description: `Batas nominal maksimum (misal sedikit di bawah Rp ${formattedAmount})`
        },
        {
          id: `p-${Date.now()}-3`,
          key: "{{TIME_WINDOW_MINUTES}}",
          label: "Jendela Waktu Agregasi",
          dataType: "Number",
          defaultValue: timeWindowMinutes >= 60 ? timeWindowMinutes : 1440,
          unit: "Menit",
          description: "Periode akumulasi pemecahan transaksi (default 24 jam / 1440 menit)"
        },
        {
          id: `p-${Date.now()}-4`,
          key: "{{MIN_TXN_COUNT}}",
          label: "Frekuensi Minimum Transaksi",
          dataType: "Number",
          defaultValue: maxFrequency,
          unit: "Kali",
          description: "Jumlah minimum transaksi yang dicurigai sebagai pemecahan dana"
        },
        {
          id: `p-${Date.now()}-5`,
          key: "{{CUMULATIVE_ALERT_THRESHOLD}}",
          label: "Total Akumulasi Pemicu Alert",
          dataType: "Number",
          defaultValue: thresholdAmount * maxFrequency * 0.8,
          unit: "IDR",
          description: "Total akumulasi dana yang memicu alert kepatuhan AML"
        }
      ],
      technicalSummary: `Kueri mengagregasi transaksi sukses pada tabel 'transactions' dalam jendela waktu {{TIME_WINDOW_MINUTES}} menit. Mengelompokkan berdasarkan CIF dan nomor rekening asal, mencari pola pemecahan nominal antara {{MIN_AMOUNT}} dan {{MAX_THRESHOLD_AMOUNT}} yang dilakukan berulang kali (>= {{MIN_TXN_COUNT}} kali) dengan total kumulatif mencapai {{CUMULATIVE_ALERT_THRESHOLD}}. Pola ini memenuhi kriteria tipologi pencucian uang 'Structuring/Smurfing' untuk menghindari pelaporan transaksi tunai/keuangan regulator.`,
      syntaxAudit: {
        status: "OPTIMAL",
        efficiencyScore: 95,
        bottleneckRisks: [
          "Pencarian multi-interval pada tabel transaksi volume besar memerlukan indeks komposit (cif, timestamp, amount) agar kalkulasi HAVING berjalan di memory.",
          "Penyaringan status SUCCESS dapat memanfaatkan partial index (WHERE status = 'SUCCESS')."
        ],
        optimizationTips: [
          "CREATE INDEX idx_trx_aml_smurf ON transactions (cif, timestamp, amount) WHERE status = 'SUCCESS';",
          "Pastikan parameter {{TIME_WINDOW_MINUTES}} dibatasi maksimal 30 hari untuk mencegah query full table scan."
        ]
      },
      guardrailNotice: "Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.",
      prompt,
      generatedAt: nowStr
    };
  }
  if (p.includes("mule") || p.includes("pass-through") || p.includes("transit") || p.includes("virtual account") || p.includes("va")) {
    return {
      name: `Cetak Biru Deteksi Rekening Penampung Virtual Account (Mule Pass-Through)`,
      domain: "Fraud",
      category: "Mule Account / Rapid Pass-Through",
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
          key: "{{THRESHOLD_AMOUNT}}",
          label: "Batas Minimum Dana Masuk VA",
          dataType: "Number",
          defaultValue: thresholdAmount,
          unit: "IDR",
          description: "Total akumulasi dana masuk via kanal Virtual Account"
        },
        {
          id: `p-${Date.now()}-2`,
          key: "{{TIME_WINDOW_MINUTES}}",
          label: "Jendela Waktu Transit",
          dataType: "Number",
          defaultValue: timeWindowMinutes >= 10 ? timeWindowMinutes : 15,
          unit: "Menit",
          description: "Rentang waktu pemantauan siklus masuk dan keluar dana"
        },
        {
          id: `p-${Date.now()}-3`,
          key: "{{MIN_DRAIN_RATIO_PCT}}",
          label: "Rasio Pengurasan Dana (% Outflow vs Inflow)",
          dataType: "Number",
          defaultValue: 85,
          unit: "%",
          description: "Persentase dana yang langsung ditransfer keluar setelah diterima"
        },
        {
          id: `p-${Date.now()}-4`,
          key: "{{MAX_RETENTION_LATENCY_MINUTES}}",
          label: "Maksimum Waktu Endap (Latency)",
          dataType: "Number",
          defaultValue: 10,
          unit: "Menit",
          description: "Batas kecepatan penarikan dana keluar setelah dana masuk"
        }
      ],
      technicalSummary: `Kueri menggunakan Common Table Expressions (CTE) untuk membandingkan arus kas masuk pada Virtual Account ('VA') dengan arus transfer keluar dalam jendela waktu {{TIME_WINDOW_MINUTES}} menit. Memicu alert jika rasio penarikan dana keluar mencapai >= {{MIN_DRAIN_RATIO_PCT}}% dari dana masuk dengan waktu jeda penarikan <= {{MAX_RETENTION_LATENCY_MINUTES}} menit. Karakteristik ini identik dengan akun perantara/mule judi online atau tindak pidana penipuan.`,
      syntaxAudit: {
        status: "OPTIMAL",
        efficiencyScore: 91,
        bottleneckRisks: [
          "Penggunaan CTE ganda dengan agregasi GROUP BY dapat menyebabkan hash join bertingkat pada volume transaksi masif.",
          "Klausa NULLIF dan EXTRACT EPOCH dieksekusi per baris hasil join."
        ],
        optimizationTips: [
          "Pastikan indeks pada transactions (destination_account, channel, timestamp) dan (source_account, timestamp) tersedia.",
          "Dalam implementasi engine streaming FMS, logika ini idealnya didukung oleh in-memory windowing state (Redis/Apache Flink)."
        ]
      },
      guardrailNotice: "Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.",
      prompt,
      generatedAt: nowStr
    };
  }
  if (p.includes("geo") || p.includes("jarak") || p.includes("lokasi") || p.includes("luar negeri") || p.includes("ip luar")) {
    return {
      name: `Cetak Biru Deteksi Anomali Geografis & Kecepatan Perpindahan Lokasi (Impossible Travel)`,
      domain: "Fraud",
      category: "Geo-Anomaly / Impossible Travel",
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
          key: "{{MIN_DISTANCE_KM}}",
          label: "Batas Jarak Minimum (Kilometer)",
          dataType: "Number",
          defaultValue: 150,
          unit: "KM",
          description: "Jarak minimum antara dua transaksi berturut-turut yang memicu kecurigaan"
        },
        {
          id: `p-${Date.now()}-2`,
          key: "{{MAX_INTERVAL_MINUTES}}",
          label: "Maksimum Selisih Waktu",
          dataType: "Number",
          defaultValue: timeWindowMinutes >= 15 ? timeWindowMinutes : 30,
          unit: "Menit",
          description: "Batas waktu perpindahan lokasi fisik yang dinilai tidak realistis secara manusiawi"
        },
        {
          id: `p-${Date.now()}-3`,
          key: "{{TIME_WINDOW_MINUTES}}",
          label: "Jendela Waktu Pemindaian Global",
          dataType: "Number",
          defaultValue: 120,
          unit: "Menit",
          description: "Rentang waktu kueri mundur untuk mengambil data jejak transaksi"
        }
      ],
      technicalSummary: `Kueri memanfaatkan Window Function LAG() di atas partisi CIF untuk membandingkan koordinat geolokasi (Latitude & Longitude) antara dua transaksi berurutan dalam rentang waktu mundur {{TIME_WINDOW_MINUTES}} menit. Menggunakan formula Haversine untuk menghitung jarak absolut (KM). Jika jarak >= {{MIN_DISTANCE_KM}} KM terjadi dalam selisih waktu <= {{MAX_INTERVAL_MINUTES}} menit, transaksi ditandai sebagai indikasi pembajakan akun (Account Takeover) atau peretasan kartu/kredensial melalui jaringan VPN/Proxy.`,
      syntaxAudit: {
        status: "WARNING",
        efficiencyScore: 86,
        bottleneckRisks: [
          "Kalkulasi trigonometri Haversine (ACOS, COS, SIN) membutuhkan CPU cycles per baris pada volume tinggi.",
          "Fungsi windowing LAG OVER (PARTITION BY cif ORDER BY timestamp) memerlukan pengurutan indeks pada (cif, timestamp)."
        ],
        optimizationTips: [
          "Wajib membuat indeks btree pada transactions(cif, timestamp, location_lat, location_lon).",
          "Pada fase engine screening real-time, koordinat lokasi sebelumnya disarankan disimpan di session cache Redis."
        ]
      },
      guardrailNotice: "Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.",
      prompt,
      generatedAt: nowStr
    };
  }
  if (p.includes("device") || p.includes("perangkat") || p.includes("imei") || p.includes("banyak cif")) {
    return {
      name: `Cetak Biru Deteksi Sindikat Multi-Akun pada Perangkat Sama (Device Fraud Ring)`,
      domain: "Fraud",
      category: "Fraud Ring / Device Hijack",
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
          key: "{{MAX_DISTINCT_CIF_COUNT}}",
          label: "Batas Maksimum CIF per Perangkat",
          dataType: "Number",
          defaultValue: 3,
          unit: "CIF",
          description: "Ambang batas jumlah CIF unik yang diakses dari satu perangkat fisik"
        },
        {
          id: `p-${Date.now()}-2`,
          key: "{{MIN_TRANSACTION_COUNT}}",
          label: "Jumlah Transaksi Minimum",
          dataType: "Number",
          defaultValue: maxFrequency,
          unit: "Kali",
          description: "Jumlah transaksi gabungan dari perangkat tersebut"
        },
        {
          id: `p-${Date.now()}-3`,
          key: "{{TIME_WINDOW_MINUTES}}",
          label: "Jendela Waktu Pemantauan",
          dataType: "Number",
          defaultValue: timeWindowMinutes >= 60 ? timeWindowMinutes : 1440,
          unit: "Menit",
          description: "Rentang waktu pemantauan perangkat (default 24 jam / 1440 menit)"
        }
      ],
      technicalSummary: `Kueri mengagregasi aktivitas transaksi berdasarkan 'device_id' dalam jendela waktu {{TIME_WINDOW_MINUTES}} menit. Menghitung jumlah CIF unik (DISTINCT cif) yang bertransaksi dari ID perangkat yang sama. Mengidentifikasi apakah 1 perangkat fisik menampung >= {{MAX_DISTINCT_CIF_COUNT}} nasabah berbeda dengan total transaksi >= {{MIN_TRANSACTION_COUNT}}. Pola ini merupakan indikasi kuat dari sindikat phishing, rekening penampung (money mule ring), atau perangkat sindikat kejahatan siber terorganisir.`,
      syntaxAudit: {
        status: "OPTIMAL",
        efficiencyScore: 93,
        bottleneckRisks: [
          "Klausa COUNT(DISTINCT cif) dan ARRAY_AGG(DISTINCT cif) membutuhkan alokasi memori sort/hash table pada agregasi volume besar."
        ],
        optimizationTips: [
          "Pastikan indeks komposit pada transactions (device_id, timestamp, cif) terdefinisi.",
          "Filter WHERE device_id IS NOT NULL menghindari scanning baris kosong."
        ]
      },
      guardrailNotice: "Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.",
      prompt,
      generatedAt: nowStr
    };
  }
  const formattedNominal = new Intl.NumberFormat("id-ID").format(thresholdAmount);
  return {
    name: `Cetak Biru Deteksi Lonjakan Transaksi Kecepatan Tinggi (Velocity Burst - ${detectedChannel})`,
    domain,
    category: "Velocity & Rapid Drain",
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
        key: "{{THRESHOLD_AMOUNT}}",
        label: "Ambang Batas Nominal per Transaksi",
        dataType: "Number",
        defaultValue: thresholdAmount,
        unit: "IDR",
        description: `Batas nominal minimum per transaksi pemicu alert (misal Rp ${formattedNominal})`
      },
      {
        id: `p-${Date.now()}-2`,
        key: "{{TIME_WINDOW_MINUTES}}",
        label: "Jendela Waktu Pemantauan",
        dataType: "Number",
        defaultValue: timeWindowMinutes,
        unit: "Menit",
        description: "Rentang waktu ke belakang untuk menghitung frekuensi transaksi"
      },
      {
        id: `p-${Date.now()}-3`,
        key: "{{MAX_FREQUENCY}}",
        label: "Batas Frekuensi Pemicu Alert",
        dataType: "Number",
        defaultValue: maxFrequency,
        unit: "Kali",
        description: "Jumlah transaksi minimum dalam rentang waktu yang dianggap sebagai anomali"
      },
      {
        id: `p-${Date.now()}-4`,
        key: "{{TARGET_CHANNEL}}",
        label: "Kanal Transaksi Sasaran",
        dataType: "Enum",
        defaultValue: detectedChannel,
        enumOptions: ["MB", "OB", "VA", "QRIS", "CARD"],
        unit: "Kanal",
        description: "Saluran transaksi finansial yang dipantau secara spesifik"
      }
    ],
    technicalSummary: `Kueri memantau transaksi pada saluran {{TARGET_CHANNEL}} dalam rentang {{TIME_WINDOW_MINUTES}} menit ke belakang. Mengelompokkan transaksi per kombinasi CIF, rekening, dan Device ID, lalu memicu alert apabila frekuensi transaksi bernilai >= {{THRESHOLD_AMOUNT}} terjadi sebanyak >= {{MAX_FREQUENCY}} kali. Ditujukan untuk menggagalkan upaya pengurasan saldo rekening nasabah (rapid account drain) pasca pencurian kredensial otentikasi.`,
    syntaxAudit: {
      status: "OPTIMAL",
      efficiencyScore: 96,
      bottleneckRisks: [
        "Klausa GROUP BY pada cif, source_account, device_id berjalan efisien asalkan rentang timestamp dibatasi secara ketat."
      ],
      optimizationTips: [
        "CREATE INDEX idx_trx_velocity ON transactions (channel, timestamp, amount, cif);",
        "Pertimbangkan filter status IN ('SUCCESS', 'PENDING') agar transaksi yang sedang dalam proses verifikasi 2FA tetap terpantau."
      ]
    },
    guardrailNotice: "Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.",
    prompt,
    generatedAt: nowStr
  };
}

// src/lib/utils.ts
function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

// src/lib/caseRecommendationEngine.ts
function generateCaseRecommendation(c, forcedDomain) {
  if (!c) {
    return getFallbackRecommendation(forcedDomain || "fraud");
  }
  const domain = forcedDomain || (c.alertCategory === "AML" ? "aml" : "fraud");
  const amount = c.transaction?.amount || 0;
  const channel = c.transaction?.channel || "MB";
  const riskScore = c.finalRiskScore || c.baseScore || 65;
  const formulaPoints = c.formulaRiskPoints || 0;
  const device = c.deviceId || c.transaction?.deviceModel || "Perangkat Nasabah";
  const ip = c.transaction?.ipAddress || "180.252.74.19";
  const loc = c.transaction?.location || "Jakarta Barat, ID";
  const customerName = c.customerName || "Nasabah Bank Sampoerna";
  const cif = c.cif || "CIF-990123";
  const account = c.accountNumber || c.transaction?.sourceAccount || "Rekening Utama";
  const destAccount = c.transaction?.destinationAccount || "Rekening Tujuan";
  const destBank = c.transaction?.destinationBank || "Bank Eksternal";
  const ruleName = c.ruleName || "Anomali Perilaku Transaksi";
  const kris = [];
  if (amount >= 5e7) {
    kris.push({
      label: "High-Value Outlier",
      level: "CRITICAL",
      detail: `Nominal transaksi ${formatIDR(amount)} melampaui limit wajar historis 30 hari nasabah.`
    });
  } else if (amount >= 15e6) {
    kris.push({
      label: "Elevated Transaction Value",
      level: "HIGH",
      detail: `Nominal ${formatIDR(amount)} melalui channel ${channel} terindikasi di atas rata-rata harian.`
    });
  }
  if (channel.toUpperCase() === "MB" || channel.toUpperCase() === "OB") {
    if (c.deviceId && c.deviceId.length > 5) {
      kris.push({
        label: "Device Signature Analysis",
        level: riskScore >= 75 ? "HIGH" : "MEDIUM",
        detail: `Device ID ${c.deviceId.slice(0, 8)}... tercatat melakukan login dengan parameter sesi anomali.`
      });
    }
  }
  if (loc.toLowerCase().includes("red zone") || loc.toLowerCase().includes("unknown") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    kris.push({
      label: "Geographical / IP Mismatch",
      level: "HIGH",
      detail: `Aktivitas dari IP ${ip} (${loc}) berada di luar pola kebiasaan geografis nasabah.`
    });
  } else {
    kris.push({
      label: "Network IP Verification",
      level: "MEDIUM",
      detail: `IP Akses ${ip} terverifikasi dari penyedia jaringan seluler domestik.`
    });
  }
  if (formulaPoints > 0) {
    kris.push({
      label: "Formula Risk Engine Hit",
      level: formulaPoints >= 30 ? "CRITICAL" : "HIGH",
      detail: `Formula Risk mencatat akumulasi ${formulaPoints} poin dari ${c.formulaMatches?.length || 1} parameter matriks risiko.`
    });
  }
  if (ruleName.toLowerCase().includes("velocity") || ruleName.toLowerCase().includes("frekuensi") || ruleName.toLowerCase().includes("rapid")) {
    kris.push({
      label: "Velocity Spike Detected",
      level: "CRITICAL",
      detail: `Terdeteksi lonjakan frekuensi transaksi berulang dalam rentang waktu singkat (< 5 menit).`
    });
  }
  let violationType = "";
  let violationDescription = "";
  let primaryConfidence = 92;
  let recommendedScenarioId = "temp_block";
  if (domain === "fraud") {
    if (ruleName.toLowerCase().includes("take over") || ruleName.toLowerCase().includes("ato") || riskScore >= 80 && amount >= 25e6) {
      violationType = "FR-TOF-001 - Account Take Over (ATO)";
      violationDescription = "Indikasi pengambilalihan akun perbankan (ATO) disertai percobaan transfer dana cepat ke rekening penampung eksternal.";
      primaryConfidence = Math.min(97, 88 + Math.floor(riskScore / 10));
      recommendedScenarioId = "temp_block";
    } else if (ruleName.toLowerCase().includes("cnp") || channel.toUpperCase() === "CARD") {
      violationType = "FR-TOF-002 - Card not Present (CNP)";
      violationDescription = "Indikasi penyalahgunaan kredensial kartu tanpa kartu fisik melalui kanal digital tidak terverifikasi 3DS.";
      primaryConfidence = 91;
      recommendedScenarioId = "temp_block";
    } else if (ruleName.toLowerCase().includes("penipuan") || ruleName.toLowerCase().includes("social engineering")) {
      violationType = "FR-TOF-005 - Penipuan Akun";
      violationDescription = "Indikasi nasabah korban rekayasa sosial (phishing/social engineering) menginstruksikan pemindahan saldo.";
      primaryConfidence = 93;
      recommendedScenarioId = "temp_block";
    } else if (ruleName.toLowerCase().includes("cyber") || ip.toLowerCase().includes("tor") || loc.toLowerCase().includes("red zone")) {
      violationType = "FR-TOF-006 - Cyber Crime/Cyber Fraud";
      violationDescription = "Indikasi intrusi sistem atau otomasi skrip siber melalui jaringan anomali (Tor/VPN/Emulator).";
      primaryConfidence = 95;
      recommendedScenarioId = "permanent_block";
    } else if (riskScore < 50) {
      violationType = "FR-TOF-012 - False Positive";
      violationDescription = "Aktivitas transaksi sesuai dengan riwayat profil belanja dan payroll nasabah, tidak ditemukan anomali kritis.";
      primaryConfidence = 89;
      recommendedScenarioId = "false_positive";
    } else {
      violationType = "FR-TOF-009 - Fraud Transfer Dana";
      violationDescription = "Pola pergerakan dana tidak lazim dengan lonjakan nominal atau penerima dana baru yang berisiko tinggi.";
      primaryConfidence = 92;
      recommendedScenarioId = "temp_block";
    }
  } else {
    if (ruleName.toLowerCase().includes("judi") || ruleName.toLowerCase().includes("gambling") || destBank.toLowerCase().includes("slot")) {
      violationType = "AM-TOF-002 - Judi Online";
      violationDescription = "Indikasi penyaluran dana ke rekening bandar / agen penampung transaksi perjudian daring tanpa underlying wajar.";
      primaryConfidence = 94;
      recommendedScenarioId = "permanent_block";
    } else if (ruleName.toLowerCase().includes("pinjol") || ruleName.toLowerCase().includes("pinjaman")) {
      violationType = "AM-TOF-001 - Pinjaman Online";
      violationDescription = "Indikasi transaksi pembiayaan tidak terdaftar atau penarikan dana sindikat pinjol ilegal.";
      primaryConfidence = 90;
      recommendedScenarioId = "temp_block";
    } else if (riskScore < 50) {
      violationType = "AM-TOF-003 - Transaksi Wajar Sesuai Profile";
      violationDescription = "Akumulasi transaksi sejalan dengan bukti profil nasabah (CDD/EDD) dan dokumen SPT/NPWP yang terdaftar.";
      primaryConfidence = 91;
      recommendedScenarioId = "false_positive";
    } else {
      violationType = "AM-TOF-001 - Pinjaman Online";
      violationDescription = "Indikasi pola transaksi terpecah (smurfing/structuring) atau pass-through account yang memerlukan laporan analisa mendalam.";
      primaryConfidence = 91;
      recommendedScenarioId = "temp_block";
    }
  }
  const scenarios = [];
  if (domain === "fraud") {
    scenarios.push({
      id: "temp_block",
      name: "Blokir Sementara 1 x 24 Jam",
      badge: "Mitigasi Cepat (Rekomendasi)",
      badgeColor: "amber",
      description: "Bekukan sementara akses rekening/channel selama 24 jam untuk melindungi saldo nasabah sambil melakukan konfirmasi telepon (Outbound Call).",
      reviewerResult: "FR-RR-001 - Fraud",
      finalResult: "FR-FR-001 - Fraud",
      closingAction: "FR-CA-005 - Temporary Suspend Account",
      suspendDuration: "1 x 24 Jam",
      typeOfFraud: violationType,
      confidenceScore: primaryConfidence,
      suggestedComment: `[AI RECOMMENDATION - TEMPORARY BLOCK]
1. Indikasi Kasus: Terindikasi ${violationType} pada CIF ${cif} (${customerName}).
2. Fakta Transaksi: Terjadi transaksi anomali sebesar ${formatIDR(amount)} via channel ${channel} pada ${c.transaction?.timestamp || "waktu terdeteksi"} ke ${destBank} (${destAccount}).
3. Analisis Risiko: Skor anomali ${riskScore}/100 dengan indikasi ${kris[0]?.detail || "anomali pola frekuensi"}.
4. Tindakan Mitigasi: Dilakukan Temporary Suspend Account selama 1 x 24 Jam (FR-CA-005) sesuai SOP FMS BSS untuk mencegah pembobolan lebih lanjut. Tim Investigasi akan menghubungi nasabah melalui Call Center guna validasi kepemilikan transaksi.`
    });
    scenarios.push({
      id: "permanent_block",
      name: "Blokir Permanen & Freeze CIF",
      badge: "Tindakan Keras (Confirmed)",
      badgeColor: "red",
      description: "Lakukan pemblokiran permanen terhadap CIF dan seluruh rekening terkait karena terbukti merupakan tindak pidana fraud terkonfirmasi.",
      reviewerResult: "FR-RR-001 - Fraud",
      finalResult: "FR-FR-001 - Fraud",
      closingAction: "FR-CA-002 - Suspend CIF",
      typeOfFraud: violationType,
      confidenceScore: Math.max(85, primaryConfidence - 3),
      suggestedComment: `[AI RECOMMENDATION - PERMANENT CIF FREEZE]
1. Indikasi Kasus: Terkonfirmasi kejahatan ${violationType} melibatkan CIF ${cif} (${customerName}).
2. Analisis Investigasi: Ditemukan bukti kuat upaya penarikan saldo ilegal sebesar ${formatIDR(amount)} dengan pelanggaran rule ${ruleName} (Risk Score: ${riskScore}).
3. Tindakan Eksekusi: Diajukan Suspend CIF permanen (FR-CA-002) dan pencantuman ke Internal Blacklist. Seluruh akses kanal digital dinonaktifkan permanen sesuai instruksi Fraud Management Unit.`
    });
    scenarios.push({
      id: "false_positive",
      name: "False Positive (Tutup Alert)",
      badge: "Transaksi Wajar (Legitimate)",
      badgeColor: "emerald",
      description: "Tutup alert investigasi dan lepaskan penahanan transaksi karena nasabah terverifikasi melakukan transaksi secara sah dan sadar.",
      reviewerResult: "FR-RR-002 - False Positive",
      finalResult: "FR-FR-002 - False Positive",
      closingAction: "FR-CA-009 - Release Account",
      typeOfFraud: "FR-TOF-012 - False Positive",
      confidenceScore: Math.min(95, 100 - riskScore / 2),
      suggestedComment: `[AI RECOMMENDATION - FALSE POSITIVE RELEASE]
1. Klarifikasi Nasabah: Telah dilakukan verifikasi silang terhadap nasabah ${customerName} (CIF ${cif}). Nasabah mengonfirmasi transaksi ${formatIDR(amount)} ke ${destBank} adalah sah untuk keperluan pribadi/bisnis.
2. Evaluasi Keamanan: Kredensial nasabah aman, OTP berhasil divalidasi, dan tidak ada indikasi pengambilalihan akun pihak ketiga.
3. Kesimpulan: Alert ditutup sebagai False Positive (FR-FR-002), transaksi dilepaskan (Release Account FR-CA-009) dan direkomendasikan untuk pembaharuan profil batas whitelist.`
    });
  } else {
    scenarios.push({
      id: "temp_block",
      name: "Lembar Analisa Manual (Eskalasi L2)",
      badge: "Analisis Kepatuhan (Rekomendasi)",
      badgeColor: "amber",
      description: "Buat Lembar Analisa Manual dan eskalasikan ke AML Checker/Compliance Officer untuk penelaahan pelaporan LTKM/SIPESAT PPATK.",
      reviewerResult: "AM-RR-001 - Mencurigakan",
      finalResult: "AM-FR-001 - Mencurigakan",
      closingAction: "AM-CA-001 - Membuat Lembar Analisa Manual",
      typeOfFraud: violationType,
      confidenceScore: primaryConfidence,
      suggestedComment: `[AI RECOMMENDATION AML - LEMBAR ANALISA MANUAL]
1. Indikasi AML: Teridentifikasi indikasi ${violationType} pada rekening ${account} milik nasabah ${customerName} (CIF: ${cif}).
2. Temuan Anomali: Transaksi sebesar ${formatIDR(amount)} menunjukkan pola pass-through / structuring yang tidak selaras dengan profil penghasilan yang terdaftar pada form CDD.
3. Rekomendasi Kepatuhan: Direkomendasikan pembuatan Lembar Analisa Manual (AM-CA-001) dan eskalasi ke Analyst L2 untuk penentuan penyusunan Laporan Transaksi Keuangan Mencurigakan (LTKM) ke PPATK.`
    });
    scenarios.push({
      id: "permanent_block",
      name: "Indikasi Tegas / Eskalasi Prioritas",
      badge: "Prioritas Tinggi (High Risk)",
      badgeColor: "red",
      description: "Eskalasi prioritas tinggi dengan status mencurigakan untuk penanganan mendesak indikasi tindak pidana pencucian uang/judi online.",
      reviewerResult: "AM-RR-003 - Eskalasi",
      finalResult: "AM-FR-003 - Eskalasi",
      closingAction: "AM-CA-001 - Membuat Lembar Analisa Manual",
      typeOfFraud: violationType,
      confidenceScore: Math.max(88, primaryConfidence - 2),
      suggestedComment: `[AI RECOMMENDATION AML - ESKALASI PRIORITAS TINGGI]
1. Indikasi Pelanggaran: Rekening nasabah CIF ${cif} terindikasi kuat sebagai penampung transaksi ${violationType} dengan skor kepatuhan kritis ${riskScore}.
2. Akumulasi Transaksi: Terdeteksi akumulasi transfer berulang bernilai signifikan (${formatIDR(amount)}) dalam jendela waktu pendek tanpa justifikasi ekonomi yang rasional.
3. Instruksi: Eskalasi langsung ke Pejabat Kepatuhan / AML Checker (AM-RR-003 / AM-FR-003) untuk pembekuan rekening preventif dan verifikasi Enhanced Due Diligence (EDD).`
    });
    scenarios.push({
      id: "false_positive",
      name: "Transaksi Wajar Sesuai Profil",
      badge: "Kepatuhan Wajar (Clear)",
      badgeColor: "emerald",
      description: "Tutup investigasi kepatuhan karena transaksi nasabah memiliki underlying ekonomi yang terbukti sah sesuai profil usaha/penghasilan.",
      reviewerResult: "AM-RR-002 - Tidak Mencurigakan",
      finalResult: "AM-FR-002 - Tidak Mencurigakan",
      closingAction: "AM-CA-002 - Transaksi Wajar",
      typeOfFraud: "AM-TOF-003 - Transaksi Wajar Sesuai Profile",
      confidenceScore: 92,
      suggestedComment: `[AI RECOMMENDATION AML - TRANSAKSI WAJAR]
1. Hasil Tinjauan Profil: Telah dilakukan review berkas CDD/EDD nasabah ${customerName} (CIF: ${cif}). Transaksi senilai ${formatIDR(amount)} bersumber dari aktivitas operasional usaha yang terdaftar resmi.
2. Verifikasi Dokumen: Dokumen pendukung (invoice/bukti transfer) telah diverifikasi dan valid.
3. Kesimpulan: Dinyatakan Tidak Mencurigakan (AM-FR-002 - Transaksi Wajar AM-CA-002). Alert diselesaikan tanpa perlu penerbitan LTKM.`
    });
  }
  const summaryAnalysis = `Sistem Neo FMS AI Assistant mendeteksi anomali ${domain.toUpperCase()} berlevel ${riskScore >= 75 ? "TINGGI" : "MODERAT"} (Risk Score: ${riskScore}) dengan tingkat keyakinan ${primaryConfidence}%. Direkomendasikan skenario ${scenarios.find((s) => s.id === recommendedScenarioId)?.name || "Mitigasi Cepat"} untuk pengamanan saldo perbankan nasabah.`;
  return {
    domain,
    caseId: c.caseId || c.id || "CASE-UNKNOWN",
    cif,
    customerName,
    violationType,
    violationDescription,
    primaryConfidence,
    recommendedScenarioId,
    keyRiskIndicators: kris,
    scenarios,
    summaryAnalysis
  };
}
function getFallbackRecommendation(domain) {
  return {
    domain,
    caseId: "CASE-PREVIEW",
    cif: "CIF-000000",
    customerName: "Nasabah Terpilih",
    violationType: domain === "fraud" ? "FR-TOF-001 - Account Take Over (ATO)" : "AM-TOF-001 - Pinjaman Online",
    violationDescription: "Deteksi otomatis anomali parameter transaksi.",
    primaryConfidence: 90,
    recommendedScenarioId: "temp_block",
    keyRiskIndicators: [
      { label: "Analisis Risiko Standar", level: "HIGH", detail: "Parameter kasus memenuhi kriteria pengawasan Neo FMS." }
    ],
    scenarios: [
      {
        id: "temp_block",
        name: "Blokir Sementara 1 x 24 Jam",
        badge: "Mitigasi Cepat",
        badgeColor: "amber",
        description: "Blokir sementara selama 24 jam.",
        reviewerResult: domain === "fraud" ? "FR-RR-001 - Fraud" : "AM-RR-001 - Mencurigakan",
        finalResult: domain === "fraud" ? "FR-FR-001 - Fraud" : "AM-FR-001 - Mencurigakan",
        closingAction: domain === "fraud" ? "FR-CA-005 - Temporary Suspend Account" : "AM-CA-001 - Membuat Lembar Analisa Manual",
        suspendDuration: "1 x 24 Jam",
        typeOfFraud: domain === "fraud" ? "FR-TOF-001 - Account Take Over (ATO)" : "AM-TOF-001 - Pinjaman Online",
        suggestedComment: "[AI RECOMMENDATION] Rekomendasi mitigasi standar sistem.",
        confidenceScore: 90
      }
    ],
    summaryAnalysis: "Analisis rekomendasi siap digunakan."
  };
}

// server.ts
import_dotenv.default.config();
var currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.post("/api/copilot/case-recommendation", async (req, res) => {
  try {
    const { caseData, domain, customContext } = req.body;
    const baseRec = generateCaseRecommendation(caseData, domain);
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && caseData) {
      try {
        const promptText = `Anda adalah Senior Fraud & AML Case Investigator di Bank Sahabat Sampoerna (BSS) untuk Neo FMS v1.22.
Tugas Anda adalah menelaah kasus transaksi berikut dan memberikan rekomendasi keputusan investigasi, durasi blokir, dan draf komentar naratif reviewer.

Kasus:
- Domain: ${domain || caseData.alertCategory}
- Case ID: ${caseData.caseId || caseData.id}
- CIF: ${caseData.cif} (${caseData.customerName})
- Nominal Transaksi: Rp ${caseData.transaction?.amount || 0}
- Channel: ${caseData.transaction?.channel}
- Bank/Rek Tujuan: ${caseData.transaction?.destinationBank} (${caseData.transaction?.destinationAccount})
- Skor Risiko: ${caseData.finalRiskScore || caseData.baseScore}
- Rule Terpicu: ${caseData.ruleName}
- Catatan Tambahan: ${customContext || "Tidak ada"}

Hasilkan analisis ringkas dan narasi formal perbankan dalam format JSON:
{
  "summaryAnalysis": "1-2 kalimat ringkasan analisis cerdas",
  "recommendedScenarioId": "temp_block" | "permanent_block" | "false_positive",
  "primaryConfidence": 94,
  "suggestedReviewerComment": "Draf komentar formal lengkap mencakup fakta, anomali, dan SOP"
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });
        const outputText = response.text || "";
        const parsed = JSON.parse(outputText);
        if (parsed.suggestedReviewerComment) {
          const recScenario = baseRec.scenarios.find((s) => s.id === (parsed.recommendedScenarioId || baseRec.recommendedScenarioId)) || baseRec.scenarios[0];
          recScenario.suggestedComment = parsed.suggestedReviewerComment;
          if (parsed.summaryAnalysis) baseRec.summaryAnalysis = parsed.summaryAnalysis;
          if (parsed.primaryConfidence) baseRec.primaryConfidence = Number(parsed.primaryConfidence);
        }
        return res.json({ success: true, data: baseRec, source: "gemini-3.8-flash" });
      } catch (geminiError) {
        console.warn("Gemini API call failed for case recommendation, using deterministic engine:", geminiError?.message || geminiError);
      }
    }
    return res.json({ success: true, data: baseRec, source: "fms-case-recommendation-engine" });
  } catch (err) {
    console.error("Error in case recommendation endpoint:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});
app.post("/api/copilot/generate-rule", async (req, res) => {
  try {
    const { prompt, domain, currentCode } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
      try {
        const systemInstruction = `Anda adalah AI Lead Fraud & AML Rule Architect untuk Neo FMS v1.22 di Bank Sahabat Sampoerna (BSS).
Tugas Anda adalah menerima deskripsi skenario kejahatan/anomali perbankan dalam bahasa alami dan menghasilkan blueprint Rule Template yang presisi, efisien, dan siap pakai.

Database Schema (Tabel 'transactions'):
- trx_id (VARCHAR): ID unik transaksi
- cif (VARCHAR): Customer Identification File
- source_account (VARCHAR): Nomor rekening asal
- source_account_name (VARCHAR): Nama pemilik rekening asal
- destination_account (VARCHAR): Nomor rekening tujuan
- beneficiary_name (VARCHAR): Nama penerima
- destination_bank (VARCHAR): Bank tujuan
- amount (NUMERIC): Nominal transaksi dalam Rupiah (IDR)
- currency (VARCHAR): Mata uang ('IDR')
- channel (VARCHAR): Saluran transaksi ('MB', 'OB', 'VA', 'QRIS', 'CARD')
- ip_address (VARCHAR): Alamat IP nasabah
- location_lat, location_lon (NUMERIC): Koordinat geolokasi transaksi
- device_id (VARCHAR): ID perangkat / IMEI / UUID
- timestamp (TIMESTAMP): Waktu transaksi
- status (VARCHAR): Status transaksi ('SUCCESS', 'PENDING', 'FAILED', 'BLOCKED')
- trx_type (VARCHAR): Jenis transaksi ('TRANSFER', 'PAYMENT', 'TOPUP', 'WITHDRAWAL')

Aturan Pembuatan Template:
1. Syntax Query: Gunakan dialek PostgreSQL / SQL standar perbankan yang valid.
2. Parameter Placeholders: Seluruh nilai ambang batas dinamis WAJIB dibungkus dengan format {{NAMA_VARIABEL}} (misal: {{THRESHOLD_AMOUNT}}, {{TIME_WINDOW_MINUTES}}, {{MAX_FREQUENCY}}, {{GEO_RADIUS_KM}}, dll).
3. Ekstraksi Placeholders: Ekstrak setiap placeholder menjadi objek VariablePlaceholder lengkap dengan key, label (Bahasa Indonesia), dataType ('Number'|'String'|'Boolean'|'Enum'), defaultValue, unit, dan description.
4. Syntax Audit & Performance: Lakukan analisa potensi bottleneck (misal: index requirement, window function, full table scan) dan berikan saran optimasi indeks.
5. Technical Summary: Buat ringkasan teknis komprehensif dalam Bahasa Indonesia formal untuk review L2 Checker.
6. Guardrail: Hasil ini adalah Draft Unverified untuk L1 Maker dan wajib divalidasi manual.

Format Response WAJIB JSON murni persis seperti ini:
{
  "name": "Nama Template Rule yang Profesional",
  "domain": "Fraud" atau "AML",
  "category": "Kategori kejahatan",
  "queryLogic": "SQL query lengkap dengan tag {{PLACEHOLDER}}",
  "parameters": [
    {
      "id": "param-1",
      "key": "{{KEY_NAME}}",
      "label": "Label Indonesia",
      "dataType": "Number",
      "defaultValue": 50000000,
      "unit": "IDR",
      "description": "Penjelasan fungsi parameter"
    }
  ],
  "technicalSummary": "Penjelasan teknis lengkap alur kuari dan indikasi kejahatan dalam Bahasa Indonesia untuk L2 Checker",
  "syntaxAudit": {
    "status": "OPTIMAL",
    "efficiencyScore": 94,
    "bottleneckRisks": ["Potensi bottleneck 1"],
    "optimizationTips": ["Rekomendasi indeks 1"]
  }
}`;
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: systemInstruction },
                { text: `Deskripsi Skenario dari Pengguna:
"${prompt}"
Target Domain: ${domain || "Auto-detect"}
Template Code: ${currentCode || "TPL-NEW"}

Hasilkan blueprint Rule Template dalam format JSON:` }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });
        const textOutput = response.text || "";
        const parsed = JSON.parse(textOutput);
        return res.json({ success: true, data: parsed, source: "gemini-3.8-flash" });
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to rule synthesizer:", geminiError?.message || geminiError);
      }
    }
    const fallbackData = synthesizeRule(prompt, domain);
    return res.json({ success: true, data: fallbackData, source: "fms-rule-synthesizer" });
  } catch (err) {
    console.error("Error generating rule:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(import_express.default.static(import_path.default.resolve(currentDir, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.resolve(currentDir, "dist", "index.html"));
    });
  } else {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Neo FMS Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
