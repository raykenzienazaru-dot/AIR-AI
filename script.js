 
      // Navbar scroll effect
      window.addEventListener("scroll", function () {
        const navbar = document.querySelector(".navbar-aquacheck");
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

      // History storage
      let historyData = JSON.parse(
        localStorage.getItem("aircek_history") || "[]"
      );

      // Chat helper functions
      function addBubble(text, sender) {
        const chatBody = document.getElementById("chatBody");
        const bubble = document.createElement("div");
        bubble.className = `bubble ${sender}`;
        bubble.innerHTML = text.replace(/\n/g, "<br>");
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      function addTypingIndicator() {
        const chatBody = document.getElementById("chatBody");
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

      // AI Engine
      function AIR_AI(input) {
        const q = input.toLowerCase().trim();

        if (
          q.includes("apa itu") ||
          q.includes("apa yang dimaksud") ||
          q.includes("definisi")
        ) {
          return getEducationalContent(q);
        }

        let statusObj = { status: "Layak" };
        let alasan = [];
        let solusi = [];
        let parameterTerdeteksi = [];

        // Deteksi pH
        const phRegex = /ph\s*[:=]?\s*(\d+(\.\d+)?)/i;
        const phMatch = q.match(phRegex);
        if (phMatch) {
          const ph = parseFloat(phMatch[1]);
          parameterTerdeteksi.push(`pH: ${ph}`);
          analyzePH(ph, alasan, solusi, statusObj);
        }

        // Deteksi TDS
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

        analyzePhysicalConditions(q, alasan, solusi, statusObj);

        if (parameterTerdeteksi.length === 0 && alasan.length === 0) {
          return generateDefaultResponse();
        }

        const response = generateFinalResponse(
          statusObj,
          alasan,
          solusi,
          parameterTerdeteksi
        );

        // Save to history
        saveToHistory(input, response, statusObj.status);

        return response;
      }

      function analyzePH(ph, alasan, solusi, statusObj) {
        if (ph < 6.5) {
          statusObj.status = "Tidak Layak";
          alasan.push(` pH ${ph} terlalu asam (di bawah 6,5)`);
          solusi.push(" Netralkan dengan filter alkali atau tambahkan kapur");
        } else if (ph > 8.5) {
          statusObj.status = "Tidak Layak";
          alasan.push(` pH ${ph} terlalu basa (di atas 8,5)`);
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
          alasan.push(` TDS ${tds} ppm sangat tinggi (berbahaya)`);
          solusi.push(" Gunakan sistem reverse osmosis (RO)");
        } else if (tds > 500) {
          statusObj.status = "Tidak Layak";
          alasan.push(` TDS ${tds} ppm melebihi batas maksimal 500 ppm`);
          solusi.push(" Gunakan filter reverse osmosis");
        } else if (tds > 300) {
          alasan.push(` TDS ${tds} ppm masih dalam batas layak`);
        } else if (tds > 50) {
          alasan.push(` TDS ${tds} ppm sangat baik untuk konsumsi`);
        } else {
          alasan.push(` TDS ${tds} ppm sangat rendah, kurang mineral`);
        }
      }

      function analyzeTurbidity(turbidity, alasan, solusi, statusObj) {
        if (turbidity > 5) {
          statusObj.status = "Tidak Layak";
          alasan.push(` Kekeruhan ${turbidity} NTU terlalu tinggi (>5 NTU)`);
          solusi.push(" Gunakan filter sedimentasi");
        } else if (turbidity > 1) {
          alasan.push(` Kekeruhan ${turbidity} NTU dalam batas aman`);
        } else {
          alasan.push(` Kekeruhan ${turbidity} NTU sangat baik`);
        }
      }

      function analyzePhysicalConditions(q, alasan, solusi, statusObj) {
        if (q.includes("keruh") || q.includes("kabur")) {
          statusObj.status = "Tidak Layak";
          alasan.push(" Air keruh menunjukkan partikel tersuspensi");
          solusi.push(" Gunakan filter sedimentasi");
        }

        if (q.includes("bau") || q.includes("anyir")) {
          statusObj.status = "Tidak Layak";
          alasan.push(" Air berbau menunjukkan kontaminasi");
          solusi.push(" Gunakan filter karbon aktif");
        }

        if (
          q.includes("berwarna") ||
          q.includes("kuning") ||
          q.includes("coklat")
        ) {
          statusObj.status = "Tidak Layak";
          alasan.push(" Air berwarna menunjukkan kontaminasi");
          solusi.push(" Gunakan sistem filtrasi multi-tahap");
        }
      }

      function getEducationalContent(q) {
        if (q.includes("ph")) {
          return `<b> EDUKASI: Apa itu pH Air?</b><br><br>
<b>Definisi:</b> pH adalah ukuran keasaman/kebasaan air (skala 0-14)<br>
• pH < 7: Asam<br>
• pH = 7: Netral<br>
• pH > 7: Basa<br><br>
<b>pH Ideal Air Minum:</b> 6.5 - 8.5<br>
<b>Cara mengukur:</b> pH meter, kertas lakmus, pH strip`;
        }

        if (q.includes("tds")) {
          return `<b> EDUKASI: Apa itu TDS?</b><br><br>
<b>Definisi:</b> Total Dissolved Solids - zat padat terlarut dalam air (ppm)<br><br>
<b>Standar TDS:</b><br>
• < 50 ppm: Sangat rendah<br>
• 50-150 ppm: Ideal<br>
• 150-300 ppm: Baik<br>
• 300-500 ppm: Dapat diterima<br>
• > 500 ppm: Tidak direkomendasikan`;
        }

        return `<b> Parameter Kualitas Air:</b><br><br>
1. <b>pH (6.5-8.5)</b>: Keasaman air<br>
2. <b>TDS (<500 ppm)</b>: Total zat terlarut<br>
3. <b>Kekeruhan (<5 NTU)</b>: Kejernihan air<br><br>
Ketik "apa itu [parameter]" untuk detail`;
      }

      function generateDefaultResponse() {
        return `<b> AIR.ai siap membantu!</b><br><br>
<b>Contoh input:</b><br>
• "pH 7.5, TDS 300"<br>
• "Air saya keruh dan berbau"<br>
• "TDS 450, pH 6.2"<br><br>
<b>Atau tanyakan:</b><br>
• "Apa itu pH?"<br>
• "Definisi TDS"`;
      }

      function generateFinalResponse(
        statusObj,
        alasan,
        solusi,
        parameterTerdeteksi
      ) {
        let response = `<b> ANALISIS KUALITAS AIR</b><br><br>`;

        if (parameterTerdeteksi.length > 0) {
          response += `<b> Parameter Terdeteksi:</b><br>`;
          parameterTerdeteksi.forEach((p) => {
            response += `• ${p}<br>`;
          });
          response += `<br>`;
        }

        const icon = statusObj.status === "Layak" ? "✅" : "❌";
        response += `<b>Status:</b> ${icon} <b>${statusObj.status.toUpperCase()} KONSUMSI</b><br><br>`;

        response += `<b> Menganalisis:</b><br>`;
        alasan.forEach((a) => {
          response += `${a}<br>`;
        });

        if (solusi.length > 0) {
          response += `<br><b> Rekomendasi:</b><br>`;
          solusi.forEach((s) => {
            response += `${s}<br>`;
          });
        }

        return response;
      }

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

      function updateHistoryDisplay() {
        const container = document.getElementById("historyContainer");

        if (historyData.length === 0) {
          container.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-inbox fa-3x mb-3 floating"></i>
                        <p>Belum ada riwayat analisis.</p>
                    </div>
                `;
          return;
        }

        container.innerHTML = historyData
          .map(
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
                        <p class="mb-0 mt-1">${entry.query}</p>
                    </div>
                    <div>
                        <strong><i class="fas fa-robot me-2 text-primary"></i>Hasil:</strong>
                        <div class="mt-1" style="font-size: 13px;">${
                          entry.response
                        }</div>
                    </div>
                </div>
            `
          )
          .join("");
      }

      // Send message function
      function sendMessage() {
        const input = document.getElementById("chatInput");
        const message = input.value.trim();

        if (!message) return;

        addBubble(message, "user");
        input.value = "";

        addTypingIndicator();

        setTimeout(() => {
          removeTypingIndicator();
          const response = AIR_AI(message);
          addBubble(response, "bot");
        }, 1000);
      }

      document
        .getElementById("chatInput")
        .addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
          }
        });

      // Image upload
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

            addTypingIndicator();
            setTimeout(() => {
              removeTypingIndicator();

              let status = "LAYAK";
              let solusi = "Air aman untuk diminum";

              if (result.ph < 6.5 || result.ph > 8.5) {
                status = "TIDAK LAYAK";
                solusi =
                  result.ph < 6.5
                    ? "Air terlalu asam, gunakan filter penetral pH"
                    : "Air terlalu basa, gunakan filter penurun pH";
              }

              const response = `<b> HASIL ANALISIS FOTO pH</b><br><br>
• <b>Warna Terdeteksi:</b> ${result.label}<br>
• <b>Perkiraan pH:</b> ${result.ph}<br>
• <b>Status:</b> ${status}<br>
• <b>Solusi:</b> ${solusi}`;

              addBubble(response, "bot");
              saveToHistory(
                "Upload foto pH",
                response,
                status === "LAYAK" ? "Layak" : "Tidak Layak"
              );
            }, 1500);
          };
        };

        reader.readAsDataURL(file);
      });

      function removeImage() {
        imageInput.value = "";
        imagePreview.classList.add("d-none");
        previewImg.src = "";
      }

      // pH Color Analysis
      const pHColorMap = [
        { ph: 2, color: [255, 0, 0], label: "Merah (Sangat Asam)" },
        { ph: 4, color: [255, 165, 0], label: "Oranye (Asam)" },
        { ph: 6, color: [255, 255, 0], label: "Kuning (Agak Asam)" },
        { ph: 7, color: [0, 255, 0], label: "Hijau (Netral)" },
        { ph: 8, color: [0, 128, 255], label: "Biru Muda (Agak Basa)" },
        { ph: 10, color: [0, 0, 255], label: "Biru (Basa)" },
        { ph: 12, color: [128, 0, 128], label: "Ungu (Sangat Basa)" },
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

        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < imageData.length; i += 4) {
          r += imageData[i];
          g += imageData[i + 1];
          b += imageData[i + 2];
          count++;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        let closest = pHColorMap[0];
        let minDist = Infinity;

        pHColorMap.forEach((item) => {
          const dist = colorDistance([r, g, b], item.color);
          if (dist < minDist) {
            minDist = dist;
            closest = item;
          }
        });

        return closest;
      }

      // Initialize
      updateHistoryDisplay();
  const toggler = document.querySelector(".icon-toggler");
const navbarCollapse = document.getElementById("navbarContent");

navbarCollapse.addEventListener("show.bs.collapse", () => {
  toggler.classList.add("active");
});

navbarCollapse.addEventListener("hide.bs.collapse", () => {
  toggler.classList.remove("active");
});
    