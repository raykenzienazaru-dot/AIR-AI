// ================= NAVBAR ACTIVE =================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function () {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ================= HELPER CHAT =================
function addBubble(text, sender) {
  const chatBody = document.getElementById("chatBody");
  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender}`;
  bubble.innerText = text;
  chatBody.appendChild(bubble);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeLastBotBubble() {
  const chatBody = document.getElementById("chatBody");
  const bots = chatBody.querySelectorAll(".bubble.bot");
  if (bots.length > 0) bots[bots.length - 1].remove();
}

// ================= AI ENGINE (PURE JS) =================
function AIR_AI(input) {
  const q = input.toLowerCase().trim();
  
  // Mode edukasi - jika pengguna bertanya tentang definisi
  if (q.includes("apa itu") || q.includes("apa yang dimaksud") || q.includes("definisi")) {
    return getEducationalContent(q);
  }
  
  // Reset variabel analisis
 let statusObj = { status: "Layak" };
  let alasan = [];
  let solusi = [];
  let parameterTerdeteksi = [];
  
  // ===== DETEKSI MULTI-PARAMETER =====
  
  // Deteksi pH (mendukung format: pH 7.5, ph=6.8, ph:8)
  const phRegex = /ph\s*[:=]?\s*(\d+(\.\d+)?)/i;
  const phMatch = q.match(phRegex);
  if (phMatch) {
    const ph = parseFloat(phMatch[1]);
    parameterTerdeteksi.push(`pH: ${ph}`);
    analyzePH(ph, alasan, solusi, statusObj);
  }
  
  // Deteksi TDS (mendukung format: TDS 300, tds=500, tds:250)
  const tdsRegex = /tds\s*[:=]?\s*(\d+)/i;
  const tdsMatch = q.match(tdsRegex);
  if (tdsMatch) {
  const tds = parseInt(tdsMatch[1]);
  parameterTerdeteksi.push(`TDS: ${tds} ppm`);
  analyzeTDS(tds, alasan, solusi, statusObj);
}
  
  // Deteksi kekeruhan
  const turbidityMatch = q.match(/kekeruhan\s*[:=]?\s*(\d+(\.\d+)?)/i);
 if (turbidityMatch) {
  const turbidity = parseFloat(turbidityMatch[1]);
  parameterTerdeteksi.push(`Kekeruhan: ${turbidity} NTU`);
  analyzeTurbidity(turbidity, alasan, solusi, statusObj);
}

  // Deteksi kondisi fisik air
 analyzePhysicalConditions(q, alasan, solusi, statusObj);
  
  // Deteksi klorin
  const chlorineMatch = q.match(/klorin\s*[:=]?\s*(\d+(\.\d+)?)/i);
 if (chlorineMatch) {
  const chlorine = parseFloat(chlorineMatch[1]);
  parameterTerdeteksi.push(`Klorin: ${chlorine} mg/L`);
  analyzeChlorine(chlorine, alasan, solusi, statusObj);
}
  
  // Deteksi kesadahan (hardness)
  const hardnessMatch = q.match(/kesadahan\s*[:=]?\s*(\d+)/i);
  if (hardnessMatch) {
    const hardness = parseInt(hardnessMatch[1]);
    parameterTerdeteksi.push(`Kesadahan: ${hardness} mg/L`);
    analyzeHardness(hardness, alasan, solusi, statusObj);
  }
  
  // Deteksi logam berat (timbal, merkuri, dll)
  analyzeHeavyMetals(q, alasan, solusi, statusObj, parameterTerdeteksi);
  
  // ===== TANGGAPAN UNTUK INPUT KOSONG =====
  if (parameterTerdeteksi.length === 0 && alasan.length === 0) {
    return generateDefaultResponse();
  }
  
  // ===== FORMAT JAWABAN =====
  return generateFinalResponse(statusObj, alasan, solusi, parameterTerdeteksi);
}

// ================= FUNGSI ANALISIS INDIVIDUAL =================

function analyzePH(ph, alasan, solusi, statusObj) {
  if (ph < 6.5) {
    statusObj.status = "Tidak Layak";
    alasan.push(`pH ${ph} terlalu asam (di bawah 6,5)`);
    solusi.push("Netralkan dengan filter alkali atau tambahkan kapur");
    solusi.push("Pertimbangkan untuk menggunakan sistem reverse osmosis dengan remineralisasi");
  } else if (ph > 8.5) {
    statusObj.status = "Tidak Layak";
    alasan.push(`pH ${ph} terlalu basa (di atas 8,5)`);
    solusi.push("Netralkan dengan filter asam atau tambahkan asam organik lemah");
    solusi.push("Gunakan filter dengan media penetral pH");
  } else if (ph >= 7.0 && ph <= 7.5) {
    alasan.push(`pH ${ph} optimal untuk konsumsi manusia`);
  } else {
    alasan.push(`pH ${ph} dalam batas aman (6,5-8,5)`);
  }
}

function analyzeTDS(tds, alasan, solusi, statusObj) {
  if (tds > 1000) {
    statusObj.status = "Tidak Layak";
    alasan.push(`TDS ${tds} ppm sangat tinggi (berbahaya untuk dikonsumsi)`);
    solusi.push("Gunakan sistem reverse osmosis (RO)");
    solusi.push("Pertimbangkan distilasi air");
    solusi.push("Konsultasikan dengan ahli kualitas air");
  } else if (tds > 500) {
    statusObj.status = "Tidak Layak";
    alasan.push(`TDS ${tds} ppm melebihi batas maksimal 500 ppm`);
    solusi.push("Gunakan filter reverse osmosis");
    solusi.push("Pertimbangkan filter ultrafiltrasi");
  } else if (tds > 300) {
    alasan.push(`TDS ${tds} ppm masih dalam batas layak minum (<500 ppm)`);
    solusi.push("Pertahankan dengan filter karbon aktif untuk rasa yang lebih baik");
  } else if (tds > 50) {
    alasan.push(`TDS ${tds} ppm sangat baik untuk konsumsi`);
  } else {
    alasan.push(`TDS ${tds} ppm sangat rendah, kurang mineral`);
    solusi.push("Pertimbangkan untuk remineralisasi air setelah penyaringan");
  }
}

function analyzeTurbidity(turbidity, alasan, solusi, statusObj) {
  if (turbidity > 5) {
    statusObj.status = "Tidak Layak";
    alasan.push(`Kekeruhan ${turbidity} NTU terlalu tinggi (>5 NTU)`);
    solusi.push("Gunakan filter sedimentasi atau multi-media filter");
    solusi.push("Pertimbangkan koagulasi-flokulasi sebelum penyaringan");
  } else if (turbidity > 1) {
    alasan.push(`Kekeruhan ${turbidity} NTU dalam batas aman (<5 NTU)`);
    solusi.push("Filter sedimen 5 mikron dapat meningkatkan kejernihan");
  } else {
    alasan.push(`Kekeruhan ${turbidity} NTU sangat baik`);
  }
}

function analyzePhysicalConditions(q, alasan, solusi, statusObj) {
  if (q.includes("keruh") || q.includes("kabur") || q.includes("tidak jernih")) {
    statusObj.status = "Tidak Layak";
    alasan.push("Air keruh menunjukkan adanya partikel tersuspensi");
    solusi.push("Gunakan filter sedimentasi");
    solusi.push("Lakukan penyaringan bertahap (sand filter kemudian cartridge filter)");
  }
  
  if (q.includes("bau") || q.includes("anyir") || q.includes("amis")) {
    statusObj.status = "Tidak Layak";
    alasan.push("Air berbau menunjukkan kontaminasi organik atau kimia");
    solusi.push("Gunakan filter karbon aktif untuk menghilangkan bau");
    solusi.push("Pertimbangkan aerasi untuk bau yang disebabkan oleh gas");
  }
  
  if (q.includes("berwarna") || q.includes("kuning") || q.includes("coklat") || q.includes("kehijauan")) {
    statusObj.status = "Tidak Layak";
    alasan.push("Air berwarna menunjukkan kontaminasi logam atau organik");
    solusi.push("Gunakan filter dengan media khusus penyerap warna");
    solusi.push("Pertimbangkan sistem filtrasi multi-tahap dengan oksidasi");
  }
  
  if (q.includes("rasa") && (q.includes("aneh") || q.includes("tidak enak") || q.includes("logam"))) {
    alasan.push("Rasa tidak enak dapat berasal dari mineral atau kontaminan");
    solusi.push("Filter karbon aktif biasanya efektif menghilangkan rasa tidak enak");
  }
}

function analyzeChlorine(chlorine, alasan, solusi, statusObj) {
  if (chlorine > 5) {
    statusObj.status = "Tidak Layak";
    alasan.push(`Klorin ${chlorine} mg/L berbahaya (maksimal 4 mg/L)`);
    solusi.push("Biarkan air dalam wadah terbuka 24 jam untuk menguapkan klorin");
    solusi.push("Gunakan filter karbon aktif untuk menghilangkan klorin");
  } else if (chlorine > 2) {
    alasan.push(`Klorin ${chlorine} mg/L tinggi tetapi masih dalam batas aman`);
    solusi.push("Filter karbon aktif akan menghilangkan klorin berlebih");
  } else if (chlorine > 0.2) {
    alasan.push(`Klorin ${chlorine} mg/L optimal untuk disinfeksi residu`);
  } else {
    alasan.push("Klorin sangat rendah, risiko kontaminasi bakteri");
    solusi.push("Pertimbangkan disinfeksi sebelum konsumsi");
  }
}

function analyzeHardness(hardness, alasan, solusi, statusObj) {
  if (hardness > 500) {
    statusObj.status = "Tidak Layak";
    alasan.push(`Kesadahan ${hardness} mg/L sangat tinggi (>500 mg/L)`);
    solusi.push("Gunakan softener air atau sistem reverse osmosis");
    solusi.push("Pertimbangkan pelunakan dengan resin penukar ion");
  } else if (hardness > 300) {
    alasan.push(`Kesadahan ${hardness} mg/L tinggi (dapat menyebabkan kerak)`);
    solusi.push("Filter pelunak air dapat mengurangi kesadahan");
  } else if (hardness > 60) {
    alasan.push(`Kesadahan ${hardness} mg/L dalam batas normal`);
  } else {
    alasan.push(`Kesadahan ${hardness} mg/L rendah (air lunak)`);
  }
}

function analyzeHeavyMetals(q, alasan, solusi, statusObj, parameterTerdeteksi) {
  const metals = {
    "timbal": {max: 0.01, unit: "mg/L", nama: "Timbal (Pb)"},
    "merkuri": {max: 0.006, unit: "mg/L", nama: "Merkuri (Hg)"},
    "arsen": {max: 0.01, unit: "mg/L", nama: "Arsen (As)"},
    "kadmium": {max: 0.003, unit: "mg/L", nama: "Kadmium (Cd)"},
    "tembaga": {max: 2, unit: "mg/L", nama: "Tembaga (Cu)"}
  };
  
  for (const [metal, info] of Object.entries(metals)) {
    const regex = new RegExp(`${metal}\\s*[:=]?\\s*(\\d+(\\.\\d+)?)`, "i");
    const match = q.match(regex);
    
    if (match) {
      const value = parseFloat(match[1]);
      parameterTerdeteksi.push(`${info.nama}: ${value} ${info.unit}`);
      
      if (value > info.max) {
        statusObj.status = "Tidak Layak";
        alasan.push(`${info.nama} ${value} ${info.unit} melebihi batas maksimal ${info.max} ${info.unit}`);
        solusi.push(`Gunakan filter khusus penyerap logam berat seperti media KDF`);
        solusi.push(`Sistem reverse osmosis efektif menghilangkan logam berat`);
      } else {
        alasan.push(`${info.nama} dalam batas aman`);
      }
    }
  }
}

// ================= FUNGSI RESPONS EDUKASI =================

function getEducationalContent(q) {
 if (q.includes("ph"))
 {
    return ` **EDUKASI: Apa itu pH Air?**
    
**Definisi**: pH adalah ukuran keasaman atau kebasaan air pada skala 0-14.
- **pH < 7**: Asam (semakin kecil semakin asam)
- **pH = 7**: Netral
- **pH > 7**: Basa/Alkali (semakin besar semakin basa)

**pH Air Minum Ideal**: 6.5 - 8.5
- **Terlalu asam (<6.5)**: Dapat mengikis pipa, mengandung logam berat terlarut
- **Terlalu basa (>8.5)**: Rasa pahit, dapat menyebabkan pengendapan mineral

**Pengaruh pH terhadap kesehatan**:
- pH optimal membantu menjaga keseimbangan asam-basa tubuh
- Air dengan pH ekstrem dapat mengganggu pencernaan

**Cara mengukur**: Gunakan pH meter, kertas lakmus, atau pH strip`;
  }
  
  if (q.includes("tds")) {
    return ` **EDUKASI: Apa itu TDS (Total Dissolved Solids)?**
    
**Definisi**: TDS adalah total zat padat terlarut dalam air, diukur dalam ppm (parts per million).

**Komponen TDS**:
- Mineral alami (kalsium, magnesium, natrium)
- Garam anorganik
- Logam terlarut
- Zat organik tertentu

**Standar TDS Air Minum**:
- **< 50 ppm**: Sangat rendah, hampir murni
- **50-150 ppm**: Ideal untuk konsumsi
- **150-300 ppm**: Baik untuk kesehatan (mengandung mineral)
- **300-500 ppm**: Masih dapat diterima
- **> 500 ppm**: Tidak direkomendasikan untuk minum jangka panjang
- **> 1000 ppm**: Tidak layak minum

**TDS tinggi tidak selalu buruk**:
Air dengan TDS 200-400 ppm dari mineral alami lebih sehat daripada air dengan TDS rendah tetapi terkontaminasi.`;
  }
  
  if (q.includes("kekeruhan")) {
    return ` **EDUKASI: Apa itu Kekeruhan Air?**
    
**Definisi**: Kekeruhan mengukur kejernihan air, disebabkan oleh partikel tersuspensi.

**Penyebab kekeruhan**:
- Partikel tanah liat, lumpur, sedimen
- Mikroorganisme (algae, bakteri)
- Zat organik terdekomposisi
- Polutan industri

**Satuan pengukuran**: NTU (Nephelometric Turbidity Units)

**Standar kekeruhan air minum**:
- **< 1 NTU**: Sangat jernih
- **1-5 NTU**: Dapat diterima
- **> 5 NTU**: Tidak layak minum (membutuhkan pengolahan)

**Bahaya air keruh**:
- Dapat menyembunyikan patogen berbahaya
- Mengurangi efektivitas disinfeksi
- Menunjukkan kemungkinan kontaminasi`;
  }
  
  if (q.includes("klorin")) {
    return ` **EDUKASI: Klorin dalam Air**
    
**Fungsi**: Disinfektan untuk membunuh bakteri dan virus.

**Standar dalam air minum**:
- **Maksimal**: 4 mg/L (WHO)
- **Optimal residual**: 0.2-0.5 mg/L (setelah pengolahan)

**Bahaya kelebihan klorin**:
- Iritasi kulit dan mata
- Rasa dan bau tidak enak
- Membentuk trihalometana (THM) yang berpotensi karsinogenik

**Cara menghilangkan**: Filter karbon aktif, aerasi, atau didiamkan 24 jam.`;
  }
  
  return ` **EDUKASI: Parameter Kualitas Air**

Parameter utama untuk menilai air layak minum:

1. **pH (6.5-8.5)**: Keasaman air
2. **TDS (<500 ppm)**: Total zat terlarut
3. **Kekeruhan (<5 NTU)**: Kejernihan air
4. **Klorin (<4 mg/L)**: Disinfektan residual
5. **Kesadahan (60-300 mg/L)**: Kandungan mineral kalsium & magnesium
6. **Kondisi fisik**: Jernih, tidak berbau, tidak berwarna
7. **Logam berat**: Timbal, merkuri, arsen (harus sangat rendah)

Ketik "apa itu [parameter]" untuk penjelasan detail, contoh: "apa itu pH"`;
}

// ================= FUNGSI PEMBANTU =================

function generateDefaultResponse() {
  return ` **AIR-AI Enhanced** siap membantu!

**Contoh input multi-parameter**:
- "pH 7.5, TDS 300, air jernih"
- "TDS=450, pH:6.2, air sedikit keruh"
- "Kekeruhan 3 NTU, kesadahan 250 mg/L"
- "pH 8, TDS 600, klorin 1.5"

**Untuk edukasi**, tanyakan:
- "Apa itu pH?"
- "Definisi TDS"
- "Apa yang dimaksud dengan kekeruhan air?"

**Parameter yang didukung**:
1. pH (6.5-8.5)
2. TDS (Total Dissolved Solids)
3. Kekeruhan (NTU)
4. Klorin (mg/L)
5. Kesadahan (mg/L)
6. Logam berat (timbal, merkuri, arsen, dll)
7. Kondisi fisik (jernih, keruh, bau, berwarna)`;
}

function generateFinalResponse(statusObj, alasan, solusi, parameterTerdeteksi) {
  const status = statusObj.status; 
  let response = ` **ANALISIS KUALITAS AIR**
  
 **Parameter Terdeteksi**:
${parameterTerdeteksi.map(p => `• ${p}`).join('\n')}

 **Status**: ${status === "Layak" ? " LAYAK KONSUMSI" : " TIDAK LAYAK KONSUMSI"}

 **Analisis**:
${alasan.map(a => `• ${a}`).join('\n')}`;

  if (solusi.length > 0) {
    response += `

 **Rekomendasi Perbaikan**:
${solusi.map(s => `• ${s}`).join('\n')}`;
  }

  // Tambahkan tips umum berdasarkan status
  if (status === "Tidak Layak") {
    response += `

 **PERINGATAN**: Air ini tidak direkomendasikan untuk dikonsumsi langsung tanpa pengolahan terlebih dahulu.`;
  } else {
    response += `

 **Tips**: Meskipun layak, selalu pastikan air disimpan dalam wadah bersih dan terlindung dari kontaminasi.`;
  }

  // Tambahkan saran edukasi
  response += `

 **Ingin belajar lebih?** Tanyakan "apa itu [parameter]" untuk penjelasan detail.`;

  return response;
}

// ================= FUNGSI SEND MESSAGE =================
function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  
  if (!message) return;
  
  // Tampilkan pesan user
  addBubble(message, "user");
  
  // Kosongkan input
  input.value = "";
  
  // Kirim ke AI dan dapatkan respons
  const response = AIR_AI(message);
  
  // Tampilkan respons AI
  addBubble(response, "bot");
}

// ================= ENTER KEY =================
document.getElementById("chatInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// ================= FITUR TAMBAHAN =================

// 1. Sistem scoring kualitas air
function calculateWaterScore(parameters) {
  let score = 100;
  
  // Kurangi skor berdasarkan penyimpangan parameter
  if (parameters.pH < 6.5 || parameters.pH > 8.5) score -= 30;
  if (parameters.TDS > 500) score -= 25;
  if (parameters.turbidity > 5) score -= 20;
  if (parameters.contamination) score -= 40;
  
  return Math.max(0, score); // Minimal 0
}

// 2. Rekomendasi filter berdasarkan masalah
function recommendFilterSystem(problems) {
  const recommendations = [];
  
  if (problems.includes("TDS tinggi")) {
    recommendations.push("Sistem Reverse Osmosis (RO)");
  }
  
  if (problems.includes("pH tidak normal")) {
    recommendations.push("Filter penetral pH dengan media calcite/calcium carbonate");
  }
  
  if (problems.includes("kekeruhan")) {
    recommendations.push("Multi-media filter (sand, carbon, sediment)");
  }
  
  if (problems.includes("bau")) {
    recommendations.push("Filter karbon aktif granular");
  }
  
  if (problems.includes("logam berat")) {
    recommendations.push("Filter dengan media KDF atau zeolit");
  }
  
  return recommendations;
}

// 3. Database parameter standar (dapat diperluas)
const waterStandards = {
  "pH": { min: 6.5, max: 8.5, unit: "", ideal: "7.0-7.5" },
  "TDS": { min: 50, max: 500, unit: "ppm", ideal: "50-150" },
  "Turbidity": { min: 0, max: 5, unit: "NTU", ideal: "<1" },
  "Chlorine": { min: 0.2, max: 4, unit: "mg/L", ideal: "0.2-0.5" },
  "Hardness": { min: 60, max: 300, unit: "mg/L", ideal: "60-120" },
  "Lead": { min: 0, max: 0.01, unit: "mg/L", ideal: "0" },
  "Mercury": { min: 0, max: 0.006, unit: "mg/L", ideal: "0" }
};

// 4. Fungsi untuk menampilkan semua standar
function showAllStandards() {
  let standardsText = " **STANDAR KUALITAS AIR MINUM**:\n\n";
  
  for (const [param, data] of Object.entries(waterStandards)) {
    standardsText += `**${param}**: ${data.min}-${data.max} ${data.unit} (Ideal: ${data.ideal} ${data.unit})\n`;
  }
  
  return standardsText;
}
// ================= IMAGE UPLOAD PREVIEW =================
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");

imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Harap upload file gambar!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImg.src = e.target.result;
    imagePreview.classList.remove("d-none");

    previewImg.onload = () => {
      const result = analyzePHFromImage(previewImg);

      let status = "LAYAK KONSUMSI";
      let solusi = "Air aman untuk diminum.";

      if (result.ph < 6.5 || result.ph > 8.5) {
        status = "TIDAK LAYAK KONSUMSI";
        solusi = result.ph < 6.5
          ? "Air terlalu asam, gunakan filter penetral pH."
          : "Air terlalu basa, gunakan filter penurun pH.";
      }

      addBubble(
`🧪 HASIL ANALISIS FOTO pH
• Warna: ${result.label}
• Perkiraan pH: ${result.ph}
• Status: ${status}
• Solusi: ${solusi}`, 
"bot"
      );
    };
  };

  reader.readAsDataURL(file);
});

function removeImage() {
  imageInput.value = "";
  imagePreview.classList.add("d-none");
  previewImg.src = "";
}
// ================= ANALISIS WARNA pH (AI SEDERHANA) =================

// Mapping warna ke pH (perkiraan)
const pHColorMap = [
  { ph: 2, color: [255, 0, 0], label: "Merah (Sangat Asam)" },
  { ph: 4, color: [255, 165, 0], label: "Oranye (Asam)" },
  { ph: 6, color: [255, 255, 0], label: "Kuning (Agak Asam)" },
  { ph: 7, color: [0, 255, 0], label: "Hijau (Netral)" },
  { ph: 8, color: [0, 128, 255], label: "Biru Muda (Agak Basa)" },
  { ph: 10, color: [0, 0, 255], label: "Biru (Basa)" },
  { ph: 12, color: [128, 0, 128], label: "Ungu (Sangat Basa)" }
];

// Hitung jarak warna (RGB)
function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

// Ambil warna dominan dari gambar
function analyzePHFromImage(imgElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  ctx.drawImage(imgElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let r = 0, g = 0, b = 0, count = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    r += imageData[i];
    g += imageData[i + 1];
    b += imageData[i + 2];
    count++;
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return detectPH([r, g, b]);
}

// Cocokkan warna ke pH
function detectPH(rgb) {
  let closest = pHColorMap[0];
  let minDist = Infinity;

  pHColorMap.forEach(item => {
    const dist = colorDistance(rgb, item.color);
    if (dist < minDist) {
      minDist = dist;
      closest = item;
    }
  });

  return closest;
}

