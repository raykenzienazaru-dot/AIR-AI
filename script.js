// ================= NAVBAR EFFECTS =================

// Navbar scroll effect - FIXED (aman)
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar-aquacheck");
  if (!navbar) return; // Mencegah error jika navbar tidak ada

  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Active nav link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function () {
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// Navbar toggler animation - FIXED (aman)
const toggler = document.querySelector(".icon-toggler");
const navbarCollapse = document.getElementById("navbarContent");

if (navbarCollapse && toggler) { // Cek keberadaan elemen
  navbarCollapse.addEventListener("show.bs.collapse", () => {
    toggler.classList.add("active");
  });

  navbarCollapse.addEventListener("hide.bs.collapse", () => {
    toggler.classList.remove("active");
  });
}

// ================= HISTORY STORAGE =================

let historyData = JSON.parse(
  localStorage.getItem("aircek_history") || "[]"
);

function saveToHistory(query, response, status) {
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString("id-ID"),
    query: query,
    response: response,
    status: status,
  };

  historyData.unshift(entry);
  if (historyData.length > 20) historyData.pop();

  localStorage.setItem("aircek_history", JSON.stringify(historyData));
  updateHistoryDisplay();
}

function clearHistory() {
  if (confirm("Apakah Anda yakin ingin menghapus semua riwayat analisis?")) {
    localStorage.removeItem("aircek_history");
    historyData = [];
    updateHistoryDisplay();
    showToast("Riwayat berhasil dihapus", "success");
  }
}

// Fungsi untuk menampilkan toast/notifikasi
function showToast(message, type = "info") {
  // Cek apakah toast container sudah ada
  let toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastContainer";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Hapus toast setelah 3 detik
  setTimeout(() => {
    toast.remove();
    if (toastContainer.children.length === 0) {
      toastContainer.remove();
    }
  }, 3000);
}

function updateHistoryDisplay() {
  const container = document.getElementById("historyContainer");
  if (!container) return;

  if (historyData.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted">
        <i class="fas fa-inbox fa-3x mb-3 floating"></i>
        <p>Belum ada riwayat analisis.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0">Riwayat Analisis (${historyData.length})</h6>
      <button onclick="clearHistory()" class="btn btn-sm btn-outline-danger">
        <i class="fas fa-trash me-1"></i>Hapus Semua
      </button>
    </div>
    ${historyData.map(
      (entry) => `
      <div class="history-card">
        <div class="history-header">
          <div>
            <i class="fas fa-clock me-2 text-muted"></i>
            <span class="history-date">${entry.date}</span>
          </div>
          <span class="status-badge status-${
            entry.status === "Layak" ? "layak" : "tidak-layak"
          }">
            ${entry.status}
          </span>
        </div>
        <div class="mb-2">
          <strong><i class="fas fa-question-circle me-2 text-primary"></i>Pertanyaan:</strong>
          <p class="mb-0 mt-1">${escapeHTML(entry.query)}</p>
        </div>
        <div>
          <strong><i class="fas fa-robot me-2 text-primary"></i>Hasil:</strong>
          <div class="mt-1" style="font-size: 13px;">${entry.response}</div>
        </div>
      </div>
    `
    ).join("")}`;
}

// ================= CHAT HELPER FUNCTIONS =================

// Fungsi escape HTML untuk mencegah XSS - FIXED
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addBubble(text, sender) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;
  
  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender}`;
  
  // Mencegah XSS: gunakan textContent dulu, lalu replace newline
  bubble.textContent = text;
  bubble.innerHTML = bubble.innerHTML.replace(/\n/g, "<br>");
  
  chatBody.appendChild(bubble);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeLastBotBubble() {
  const chatBody = document.getElementById("chatBody");
  const bots = chatBody.querySelectorAll(".bubble.bot");
  if (bots.length > 0) bots[bots.length - 1].remove();
}

function addTypingIndicator() {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;
  
  const indicator = document.createElement("div");
  indicator.className = "bubble bot typing-indicator";
  indicator.id = "typing";
  indicator.innerHTML = "<span></span><span></span><span></span>";
  chatBody.appendChild(indicator);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing");
  if (indicator) indicator.remove();
}

// ================= AI ENGINE (DENGAN PERBAIKAN) =================

function AIR_AI(input) {
  const q = input.toLowerCase().trim();
  
  // Mode edukasi
  if (q.includes("apa itu") || q.includes("apa yang dimaksud") || q.includes("definisi")) {
    return getEducationalContent(q);
  }
  
  // Reset variabel analisis dengan sistem flag yang lebih baik
  let statusObj = { 
    status: "Layak",
    isCritical: false // Flag untuk masalah kritis
  };
  let alasan = [];
  let solusi = [];
  let parameterTerdeteksi = [];
  
  // ===== DETEKSI MULTI-PARAMETER =====
  
  // Deteksi pH dengan validasi ekstrem
  const phRegex = /ph\s*[:=]?\s*(\d+(\.\d+)?)/i;
  const phMatch = q.match(phRegex);
  if (phMatch) {
    let ph = parseFloat(phMatch[1]);
    
    // Validasi nilai ekstrem
    if (ph < 0 || ph > 14) {
      statusObj.status = "Tidak Layak";
      statusObj.isCritical = true;
      alasan.push(" Nilai pH tidak realistis (harus antara 0-14)");
      solusi.push(" Periksa kembali pengukuran pH");
    } else {
      parameterTerdeteksi.push(`pH: ${ph}`);
      analyzePH(ph, alasan, solusi, statusObj);
    }
  }
  
  // Deteksi TDS dengan validasi ekstrem
  const tdsRegex = /tds\s*[:=]?\s*(\d+)/i;
  const tdsMatch = q.match(tdsRegex);
  if (tdsMatch) {
    let tds = parseInt(tdsMatch[1]);
    
    if (tds < 0 || tds > 10000) {
      alasan.push(" Nilai TDS tidak realistis (0-10,000 ppm)");
      statusObj.isCritical = true;
    } else {
      parameterTerdeteksi.push(`TDS: ${tds} ppm`);
      analyzeTDS(tds, alasan, solusi, statusObj);
    }
  }
  
  // Deteksi kekeruhan dengan validasi
  const turbidityMatch = q.match(/kekeruhan\s*[:=]?\s*(\d+(\.\d+)?)/i);
  if (turbidityMatch) {
    let turbidity = parseFloat(turbidityMatch[1]);
    
    if (turbidity < 0 || turbidity > 1000) {
      alasan.push(" Nilai kekeruhan tidak realistis");
      statusObj.isCritical = true;
    } else {
      parameterTerdeteksi.push(`Kekeruhan: ${turbidity} NTU`);
      analyzeTurbidity(turbidity, alasan, solusi, statusObj);
    }
  }

  // Deteksi kondisi fisik air
  analyzePhysicalConditions(q, alasan, solusi, statusObj);
  
  // Deteksi klorin dengan validasi
  const chlorineMatch = q.match(/klorin\s*[:=]?\s*(\d+(\.\d+)?)/i);
  if (chlorineMatch) {
    let chlorine = parseFloat(chlorineMatch[1]);
    
    if (chlorine < 0 || chlorine > 50) {
      alasan.push(" Nilai klorin tidak realistis");
      statusObj.isCritical = true;
    } else {
      parameterTerdeteksi.push(`Klorin: ${chlorine} mg/L`);
      analyzeChlorine(chlorine, alasan, solusi, statusObj);
    }
  }
  
  // Deteksi kesadahan dengan validasi
  const hardnessMatch = q.match(/kesadahan\s*[:=]?\s*(\d+)/i);
  if (hardnessMatch) {
    let hardness = parseInt(hardnessMatch[1]);
    
    if (hardness < 0 || hardness > 5000) {
      alasan.push(" Nilai kesadahan tidak realistis");
      statusObj.isCritical = true;
    } else {
      parameterTerdeteksi.push(`Kesadahan: ${hardness} mg/L`);
      analyzeHardness(hardness, alasan, solusi, statusObj);
    }
  }
  
  // Deteksi logam berat
  analyzeHeavyMetals(q, alasan, solusi, statusObj, parameterTerdeteksi);
  
  // ===== TANGGAPAN UNTUK INPUT KOSONG =====
  if (parameterTerdeteksi.length === 0 && alasan.length === 0) {
    return generateDefaultResponse();
  }
  
  // ===== FORMAT JAWABAN =====
  const response = generateFinalResponse(statusObj, alasan, solusi, parameterTerdeteksi);
  
  // Save to history
  saveToHistory(input, response, statusObj.status);
  
  return response;
}

// ================= FUNGSI ANALISIS INDIVIDUAL (DENGAN VALIDASI) =================

function analyzePH(ph, alasan, solusi, statusObj) {
  if (ph < 6.5) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` pH ${ph} terlalu asam (di bawah 6,5)`);
    solusi.push(" Netralkan dengan filter alkali atau tambahkan kapur");
    solusi.push(" Pertimbangkan sistem reverse osmosis dengan remineralisasi");
  } else if (ph > 8.5) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` pH ${ph} terlalu basa (di atas 8,5)`);
    solusi.push(" Netralkan dengan filter asam atau tambahkan asam organik lemah");
    solusi.push(" Gunakan filter dengan media penetral pH");
  } else if (ph >= 7.0 && ph <= 7.5) {
    alasan.push(` pH ${ph} optimal untuk konsumsi manusia`);
  } else {
    alasan.push(` pH ${ph} dalam batas aman (6,5-8,5)`);
  }
}

function analyzeTDS(tds, alasan, solusi, statusObj) {
  if (tds > 1000) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` TDS ${tds} ppm sangat tinggi (berbahaya untuk dikonsumsi)`);
    solusi.push(" Gunakan sistem reverse osmosis (RO)");
    solusi.push(" Pertimbangkan distilasi air");
    solusi.push(" Konsultasikan dengan ahli kualitas air");
  } else if (tds > 500) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` TDS ${tds} ppm melebihi batas maksimal 500 ppm`);
    solusi.push(" Gunakan filter reverse osmosis");
    solusi.push(" Pertimbangkan filter ultrafiltrasi");
  } else if (tds > 300) {
    alasan.push(` TDS ${tds} ppm masih dalam batas layak minum (<500 ppm)`);
    solusi.push(" Pertahankan dengan filter karbon aktif untuk rasa yang lebih baik");
  } else if (tds > 50) {
    alasan.push(` TDS ${tds} ppm sangat baik untuk konsumsi`);
  } else {
    alasan.push(` TDS ${tds} ppm sangat rendah, kurang mineral`);
    solusi.push(" Pertimbangkan untuk remineralisasi air setelah penyaringan");
  }
}

function analyzeTurbidity(turbidity, alasan, solusi, statusObj) {
  if (turbidity > 5) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` Kekeruhan ${turbidity} NTU terlalu tinggi (>5 NTU)`);
    solusi.push(" Gunakan filter sedimentasi atau multi-media filter");
    solusi.push(" Pertimbangkan koagulasi-flokulasi sebelum penyaringan");
  } else if (turbidity > 1) {
    alasan.push(` Kekeruhan ${turbidity} NTU dalam batas aman (<5 NTU)`);
    solusi.push(" Filter sedimen 5 mikron dapat meningkatkan kejernihan");
  } else {
    alasan.push(` Kekeruhan ${turbidity} NTU sangat baik`);
  }
}

function analyzePhysicalConditions(q, alasan, solusi, statusObj) {
  if (q.includes("keruh") || q.includes("kabur") || q.includes("tidak jernih")) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(" Air keruh menunjukkan adanya partikel tersuspensi");
    solusi.push(" Gunakan filter sedimentasi");
    solusi.push(" Lakukan penyaringan bertahap (sand filter kemudian cartridge filter)");
  }
  
  if (q.includes("bau") || q.includes("anyir") || q.includes("amis")) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(" Air berbau menunjukkan kontaminasi organik atau kimia");
    solusi.push(" Gunakan filter karbon aktif untuk menghilangkan bau");
    solusi.push(" Pertimbangkan aerasi untuk bau yang disebabkan oleh gas");
  }
  
  if (q.includes("berwarna") || q.includes("kuning") || q.includes("coklat") || q.includes("kehijauan")) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(" Air berwarna menunjukkan kontaminasi logam atau organik");
    solusi.push(" Gunakan filter dengan media khusus penyerap warna");
    solusi.push(" Pertimbangkan sistem filtrasi multi-tahap dengan oksidasi");
  }
  
  if (q.includes("rasa") && (q.includes("aneh") || q.includes("tidak enak") || q.includes("logam"))) {
    alasan.push(" Rasa tidak enak dapat berasal dari mineral atau kontaminan");
    solusi.push(" Filter karbon aktif biasanya efektif menghilangkan rasa tidak enak");
  }
}

function analyzeChlorine(chlorine, alasan, solusi, statusObj) {
  if (chlorine > 5) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` Klorin ${chlorine} mg/L berbahaya (maksimal 4 mg/L)`);
    solusi.push(" Biarkan air dalam wadah terbuka 24 jam untuk menguapkan klorin");
    solusi.push(" Gunakan filter karbon aktif untuk menghilangkan klorin");
  } else if (chlorine > 2) {
    alasan.push(` Klorin ${chlorine} mg/L tinggi tetapi masih dalam batas aman`);
    solusi.push(" Filter karbon aktif akan menghilangkan klorin berlebih");
  } else if (chlorine > 0.2) {
    alasan.push(` Klorin ${chlorine} mg/L optimal untuk disinfeksi residu`);
  } else {
    alasan.push(" Klorin sangat rendah, risiko kontaminasi bakteri");
    solusi.push(" Pertimbangkan disinfeksi sebelum konsumsi");
  }
}

function analyzeHardness(hardness, alasan, solusi, statusObj) {
  if (hardness > 500) {
    statusObj.status = "Tidak Layak";
    statusObj.isCritical = true;
    alasan.push(` Kesadahan ${hardness} mg/L sangat tinggi (>500 mg/L)`);
    solusi.push(" Gunakan softener air atau sistem reverse osmosis");
    solusi.push(" Pertimbangkan pelunakan dengan resin penukar ion");
  } else if (hardness > 300) {
    alasan.push(` Kesadahan ${hardness} mg/L tinggi (dapat menyebabkan kerak)`);
    solusi.push(" Filter pelunak air dapat mengurangi kesadahan");
  } else if (hardness > 60) {
    alasan.push(` Kesadahan ${hardness} mg/L dalam batas normal`);
  } else {
    alasan.push(` Kesadahan ${hardness} mg/L rendah (air lunak)`);
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
      
      // Validasi nilai ekstrem
      if (value < 0 || value > 100) {
        alasan.push(` Nilai ${info.nama} tidak realistis`);
        statusObj.isCritical = true;
        continue;
      }
      
      parameterTerdeteksi.push(`${info.nama}: ${value} ${info.unit}`);
      
      if (value > info.max) {
        statusObj.status = "Tidak Layak";
        statusObj.isCritical = true;
        alasan.push(`${info.nama} ${value} ${info.unit} melebihi batas maksimal ${info.max} ${info.unit}`);
        solusi.push(` Gunakan filter khusus penyerap logam berat seperti media KDF`);
        solusi.push(` Sistem reverse osmosis efektif menghilangkan logam berat`);
      } else {
        alasan.push(`${info.nama} dalam batas aman`);
      }
    }
  }
}

// ================= FUNGSI RESPONS EDUKASI =================

function getEducationalContent(q) {
  if (q.includes("ph")) {
    return `<b> EDUKASI: Apa itu pH Air?</b><br><br>
<b>Definisi</b>: pH adalah ukuran keasaman atau kebasaan air pada skala 0-14.<br>
• <b>pH < 7</b>: Asam (semakin kecil semakin asam)<br>
• <b>pH = 7</b>: Netral<br>
• <b>pH > 7</b>: Basa/Alkali (semakin besar semakin basa)<br><br>
<b>pH Air Minum Ideal</b>: 6.5 - 8.5<br>
• <b>Terlalu asam (<6.5)</b>: Dapat mengikis pipa, mengandung logam berat terlarut<br>
• <b>Terlalu basa (>8.5)</b>: Rasa pahit, dapat menyebabkan pengendapan mineral<br><br>
<b>Pengaruh pH terhadap kesehatan</b>:<br>
- pH optimal membantu menjaga keseimbangan asam-basa tubuh<br>
- Air dengan pH ekstrem dapat mengganggu pencernaan<br><br>
<b>Cara mengukur</b>: Gunakan pH meter, kertas lakmus, atau pH strip`;
  }
  
  if (q.includes("tds")) {
    return `<b>EDUKASI: Apa itu TDS (Total Dissolved Solids)?</b><br><br>
<b>Definisi</b>: TDS adalah total zat padat terlarut dalam air, diukur dalam ppm (parts per million).<br><br>
<b>Komponen TDS</b>:<br>
- Mineral alami (kalsium, magnesium, natrium)<br>
- Garam anorganik<br>
- Logam terlarut<br>
- Zat organik tertentu<br><br>
<b>Standar TDS Air Minum</b>:<br>
• <b>< 50 ppm</b>: Sangat rendah, hampir murni<br>
• <b>50-150 ppm</b>: Ideal untuk konsumsi<br>
• <b>150-300 ppm</b>: Baik untuk kesehatan (mengandung mineral)<br>
• <b>300-500 ppm</b>: Masih dapat diterima<br>
• <b>> 500 ppm</b>: Tidak direkomendasikan untuk minum jangka panjang<br>
• <b>> 1000 ppm</b>: Tidak layak minum<br><br>
<b>TDS tinggi tidak selalu buruk</b>:<br>
Air dengan TDS 200-400 ppm dari mineral alami lebih sehat daripada air dengan TDS rendah tetapi terkontaminasi.`;
  }
  
  if (q.includes("kekeruhan")) {
    return `<b>📚 EDUKASI: Apa itu Kekeruhan Air?</b><br><br>
<b>Definisi</b>: Kekeruhan mengukur kejernihan air, disebabkan oleh partikel tersuspensi.<br><br>
<b>Penyebab kekeruhan</b>:<br>
- Partikel tanah liat, lumpur, sedimen<br>
- Mikroorganisme (algae, bakteri)<br>
- Zat organik terdekomposisi<br>
- Polutan industri<br><br>
<b>Satuan pengukuran</b>: NTU (Nephelometric Turbidity Units)<br><br>
<b>Standar kekeruhan air minum</b>:<br>
• <b>< 1 NTU</b>: Sangat jernih<br>
• <b>1-5 NTU</b>: Dapat diterima<br>
• <b>> 5 NTU</b>: Tidak layak minum (membutuhkan pengolahan)<br><br>
<b>Bahaya air keruh</b>:<br>
- Dapat menyembunyikan patogen berbahaya<br>
- Mengurangi efektivitas disinfeksi<br>
- Menunjukkan kemungkinan kontaminasi`;
  }
  
  if (q.includes("klorin")) {
    return `<b>📚 EDUKASI: Klorin dalam Air</b><br><br>
<b>Fungsi</b>: Disinfektan untuk membunuh bakteri dan virus.<br><br>
<b>Standar dalam air minum</b>:<br>
• <b>Maksimal</b>: 4 mg/L (WHO)<br>
• <b>Optimal residual</b>: 0.2-0.5 mg/L (setelah pengolahan)<br><br>
<b>Bahaya kelebihan klorin</b>:<br>
- Iritasi kulit dan mata<br>
- Rasa dan bau tidak enak<br>
- Membentuk trihalometana (THM) yang berpotensi karsinogenik<br><br>
<b>Cara menghilangkan</b>: Filter karbon aktif, aerasi, atau didiamkan 24 jam.`;
  }
  
  return `<b>📚 EDUKASI: Parameter Kualitas Air</b><br><br>
Parameter utama untuk menilai air layak minum:<br><br>
1. <b>pH (6.5-8.5)</b>: Keasaman air<br>
2. <b>TDS (<500 ppm)</b>: Total zat terlarut<br>
3. <b>Kekeruhan (<5 NTU)</b>: Kejernihan air<br>
4. <b>Klorin (<4 mg/L)</b>: Disinfektan residual<br>
5. <b>Kesadahan (60-300 mg/L)</b>: Kandungan mineral kalsium & magnesium<br>
6. <b>Kondisi fisik</b>: Jernih, tidak berbau, tidak berwarna<br>
7. <b>Logam berat</b>: Timbal, merkuri, arsen (harus sangat rendah)<br><br>
Ketik "apa itu [parameter]" untuk penjelasan detail, contoh: "apa itu pH"`;
}

// ================= FUNGSI PEMBANTU =================

function generateDefaultResponse() {
  return `<b>🤖 AIR-AI Enhanced siap membantu!</b><br><br>
<b>Contoh input multi-parameter</b>:<br>
• "pH 7.5, TDS 300, air jernih"<br>
• "TDS=450, pH:6.2, air sedikit keruh"<br>
• "Kekeruhan 3 NTU, kesadahan 250 mg/L"<br>
• "pH 8, TDS 600, klorin 1.5"<br><br>
<b>Untuk edukasi</b>, tanyakan:<br>
• "Apa itu pH?"<br>
• "Definisi TDS"<br>
• "Apa yang dimaksud dengan kekeruhan air?"<br><br>
<b>Parameter yang didukung</b>:<br>
1. pH (6.5-8.5)<br>
2. TDS (Total Dissolved Solids)<br>
3. Kekeruhan (NTU)<br>
4. Klorin (mg/L)<br>
5. Kesadahan (mg/L)<br>
6. Logam berat (timbal, merkuri, arsen, dll)<br>
7. Kondisi fisik (jernih, keruh, bau, berwarna)`;
}

function generateFinalResponse(statusObj, alasan, solusi, parameterTerdeteksi) {
  const status = statusObj.status;
  
  // Hitung skor kualitas air
  const waterScore = calculateWaterScore(statusObj, alasan, parameterTerdeteksi);
  
  // Tentukan confidence level
  let confidenceLevel = "Sedang";
  if (parameterTerdeteksi.length >= 3) confidenceLevel = "Tinggi";
  if (parameterTerdeteksi.length === 1) confidenceLevel = "Rendah";
  
  let response = `<b> ANALISIS KUALITAS AIR</b><br><br>`;
  
  if (parameterTerdeteksi.length > 0) {
    response += `<b> Parameter Terdeteksi</b>:<br>`;
    parameterTerdeteksi.forEach(p => response += `• ${escapeHTML(p)}<br>`);
    response += `<br>`;
  }
  
  const icon = status === "Layak" ? "✅" : "❌";
  response += `<b>Status</b>: ${icon} <b>${status === "Layak" ? "LAYAK" : "TIDAK LAYAK"} KONSUMSI</b><br><br>`;
  
  response += `<b> Analisis</b>:<br>`;
  alasan.forEach(a => response += `• ${escapeHTML(a)}<br>`);
  
  if (solusi.length > 0) {
    response += `<br><b> Rekomendasi Perbaikan</b>:<br>`;
    solusi.forEach(s => response += `${escapeHTML(s)}<br>`);
  }
  
  // Tambahkan skor kualitas air
  response += `<br><b>🏆 Skor Kualitas Air</b>: ${waterScore}/100`;
  
  // Tambahkan confidence level
  response += `<br><b>🎯 Tingkat Keyakinan Analisis</b>: ${confidenceLevel}`;
  
  // Tambahkan tips berdasarkan status
  if (status === "Tidak Layak") {
    response += `<br><br><b> PERINGATAN</b>: Air ini tidak direkomendasikan untuk dikonsumsi langsung tanpa pengolahan terlebih dahulu.`;
  } else {
    response += `<br><br><b> Tips</b>: Meskipun layak, selalu pastikan air disimpan dalam wadah bersih dan terlindung dari kontaminasi.`;
  }
  
  // Tambahkan saran edukasi
  response += `<br><br><b> Ingin belajar lebih?</b> Tanyakan "apa itu [parameter]" untuk penjelasan detail.`;
  
  // Disclaimer akademik (NILAI TAMBAH UNTUK LOMBA)
  response += `<br><br><small><i> Catatan: Hasil analisis bersifat estimasi berbasis logika AI dan tidak menggantikan uji laboratorium. Konsultasikan dengan ahli untuk diagnosis yang lebih akurat.</i></small>`;
  
  return response;
}

// Fungsi hitung skor kualitas air (dimanfaatkan)
function calculateWaterScore(statusObj, alasan, parameterTerdeteksi) {
  let score = 70; // Skor dasar
  
  // Pengaruh status
  if (statusObj.status === "Layak") score += 20;
  if (statusObj.status === "Tidak Layak") score -= 30;
  
  // Pengaruh jumlah parameter
  score += Math.min(parameterTerdeteksi.length * 3, 10); // Maks +10
  
  // Pengaruh alasan kritis
  if (statusObj.isCritical) score -= 20;
  
  // Pastikan skor dalam rentang 0-100
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

// ================= FUNGSI SEND MESSAGE =================

function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  
  if (!message) return;
  
  // Tampilkan pesan user
  addBubble(escapeHTML(message), "user");
  input.value = "";
  
  // Tampilkan typing indicator
  addTypingIndicator();
  
  // Kirim ke AI dan dapatkan respons
  setTimeout(() => {
    removeTypingIndicator();
    const response = AIR_AI(message);
    addBubble(response, "bot");
  }, 1000);
}

// ================= ENTER KEY =================

const chatInput = document.getElementById("chatInput");
if (chatInput) {
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
}

// ================= IMAGE UPLOAD PREVIEW =================

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");

if (imageInput && imagePreview && previewImg) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Harap upload file gambar!", "warning");
      return;
    }

    // Validasi ukuran file (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file terlalu besar (maks 5MB)", "warning");
      this.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      imagePreview.classList.remove("d-none");

      previewImg.onload = () => {
        addTypingIndicator();
        
        setTimeout(() => {
          removeTypingIndicator();
          
          const result = analyzePHFromImage(previewImg);

          let status = "LAYAK";
          let solusi = "Air aman untuk diminum";
          let confidence = "Rendah"; // Confidence untuk analisis gambar

          if (result.ph < 6.5 || result.ph > 8.5) {
            status = "TIDAK LAYAK";
            solusi = result.ph < 6.5
              ? "Air terlalu asam, gunakan filter penetral pH"
              : "Air terlalu basa, gunakan filter penurun pH";
          }

          const response = `<b> HASIL ANALISIS FOTO pH</b><br><br>
• <b>Warna Terdeteksi:</b> ${result.label}<br>
• <b>Perkiraan pH:</b> ${result.ph}<br>
• <b>Status:</b> ${status}<br>
• <b>Solusi:</b> ${solusi}<br>
• <b>🎯 Tingkat Keyakinan:</b> ${confidence}<br><br>
<small><i>Catatan: Analisis warna bersifat estimasi visual dan tidak seakurat pH meter.</i></small>`;

          addBubble(response, "bot");
          saveToHistory(
            "Upload foto analisis pH",
            response,
            status === "LAYAK" ? "Layak" : "Tidak Layak"
          );
        }, 1500);
      };
    };

    reader.readAsDataURL(file);
  });
}

function removeImage() {
  if (imageInput && imagePreview && previewImg) {
    imageInput.value = "";
    imagePreview.classList.add("d-none");
    previewImg.src = "";
  }
}

// ================= ANALISIS WARNA pH (AI SEDERHANA) =================

const pHColorMap = [
  { ph: 2, color: [255, 0, 0], label: "Merah (Sangat Asam)" },
  { ph: 4, color: [255, 165, 0], label: "Oranye (Asam)" },
  { ph: 6, color: [255, 255, 0], label: "Kuning (Agak Asam)" },
  { ph: 7, color: [0, 255, 0], label: "Hijau (Netral)" },
  { ph: 8, color: [0, 128, 255], label: "Biru Muda (Agak Basa)" },
  { ph: 10, color: [0, 0, 255], label: "Biru (Basa)" },
  { ph: 12, color: [128, 0, 128], label: "Ungu (Sangat Basa)" }
];

function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

function analyzePHFromImage(imgElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = Math.min(imgElement.width, 200); // Batasi ukuran untuk performa
  canvas.height = Math.min(imgElement.height, 200);
  
  // Gambar gambar ke canvas
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let r = 0, g = 0, b = 0, count = 0;

  // Ambil sampel acak untuk performa
  for (let i = 0; i < imageData.length; i += 16) { // Ambil setiap 4 pixel (16 byte)
    r += imageData[i];
    g += imageData[i + 1];
    b += imageData[i + 2];
    count++;
  }

  if (count === 0) count = 1; // Hindari pembagian nol
  
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return detectPH([r, g, b]);
}

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

// ================= FITUR TAMBAHAN =================

// Rekomendasi filter berdasarkan masalah
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

// Database parameter standar
const waterStandards = {
  "pH": { min: 6.5, max: 8.5, unit: "", ideal: "7.0-7.5" },
  "TDS": { min: 50, max: 500, unit: "ppm", ideal: "50-150" },
  "Turbidity": { min: 0, max: 5, unit: "NTU", ideal: "<1" },
  "Chlorine": { min: 0.2, max: 4, unit: "mg/L", ideal: "0.2-0.5" },
  "Hardness": { min: 60, max: 300, unit: "mg/L", ideal: "60-120" },
  "Lead": { min: 0, max: 0.01, unit: "mg/L", ideal: "0" },
  "Mercury": { min: 0, max: 0.006, unit: "mg/L", ideal: "0" }
};

// Fungsi untuk menampilkan semua standar
function showAllStandards() {
  let standardsText = "<b>📋 STANDAR KUALITAS AIR MINUM</b>:<br><br>";
  
  for (const [param, data] of Object.entries(waterStandards)) {
    standardsText += `<b>${param}</b>: ${data.min}-${data.max} ${data.unit} (Ideal: ${data.ideal} ${data.unit})<br>`;
  }
  
  standardsText += "<br><small><i>Sumber: Permenkes No. 492/MENKES/PER/IV/2010</i></small>";
  
  return standardsText;
}

// ================= CSS TOAST STYLE =================
function addToastStyles() {
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-message {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 300px;
      }
      
      .toast-success {
        background: linear-gradient(135deg, #28a745, #20c997);
        border-left: 4px solid #1e7e34;
      }
      
      .toast-warning {
        background: linear-gradient(135deg, #ffc107, #fd7e14);
        border-left: 4px solid #d39e00;
      }
      
      .toast-info {
        background: linear-gradient(135deg, #17a2b8, #007bff);
        border-left: 4px solid #117a8b;
      }
      
      .toast-error {
        background: linear-gradient(135deg, #dc3545, #c82333);
        border-left: 4px solid #bd2130;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ================= INITIALIZE =================

// Tambahkan style toast
addToastStyles();

// Initialize history display on page load
document.addEventListener('DOMContentLoaded', function() {
  updateHistoryDisplay();
  
  // Tambahkan event listener untuk tombol enter jika chatInput ada
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
  
  // Auto-focus pada input chat jika ada
  if (chatInput) {
    setTimeout(() => {
      chatInput.focus();
    }, 500);
  }
});