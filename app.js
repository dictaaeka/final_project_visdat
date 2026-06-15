/* logika utama dashboard */

/* konfigurasi global chart.js */
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = "#8b949e";  /* warna teks label default */

/* filter by pulau
* nyaring array dataPoverty bdsrkn nama pulau.
* jika pulau = "semua", kembalikan semua data (tidak disaring) */
function filterByPulau(pulau) {
    if (pulau === "semua") {
        return dataPoverty;
    }

    return dataPoverty.filter(d => d.pulau === pulau);
}

    /* warnaBatang (nilai)
    * menentukan warna bar chart bdsrkn tingkat kemiskinan.
    * semakin tinggi tingkat kemiskinan, semakin gelap warnanya. */
    function warnaBatang(nilai) {
        if (nilai > 20) return "rgba(239, 68, 68, 0.8)";  // merah
        if (nilai > 10) return "rgba(249, 115, 22, 0.75)"; // orange
        return "rgba(230, 168, 23, 0.75)"; //emas
    }

    // palet warna
    const WARNA_PULAU = [
        "#e6a817", /* emas      — Sumatera        */
        "#3b82f6", /* biru      — Jawa            */
        "#22c55e", /* hijau     — Bali & NT       */
        "#a855f7", /* ungu      — Kalimantan      */
        "#ef4444", /* merah     — Sulawesi        */
        "#06b6d4", /* cyan      — Maluku & Papua  */
    ];

    // konfigurasi objek dgn tooltip yg sama dan dipakai di 3 chart
    const tooltipConfig = {
        backgroundColor: "#161b22",
        borderColor: "#21262d",
        borderWidth: 1,
        titleColor: "#e6edf3",
        bodyColor: "#8b949e",
        padding: 10,
        cornerRadius: 8,
    };

    // isi kpi cards
    // ambil nilai dari dataPoverty trs ditampilkan.

    // cari provinsi dgn kemiskinan tertinggi
    const prov_tertinggi = [...dataPoverty].sort((a, b) => b.jumlah_sep - a.jumlah_sep)[0];
    document.getElementById("kpi-tertinggi").textContent = prov_tertinggi.jumlah_sep + "%";
    document.getElementById("kpi-tertinggi-prov").textContent = prov_tertinggi.provinsi;

    // cari provinsi dgn kemiskinan terendah
    const prov_terendah = [...dataPoverty].sort((a, b) => a.jumlah_sep - b.jumlah_sep)[0];
    document.getElementById("kpi-terendah").textContent = prov_terendah.jumlah_sep + "%";
    document.getElementById("kpi-terendah-prov").textContent = prov_terendah.provinsi;

    // animasi count-up (angka naik dr 0 ke nilai yg ada di atribut data-target)
    document.querySelectorAll(".count-up").forEach(el => {
        const target = parseFloat(el.dataset.target); /* nilai akhir */
        const durasi = 1500;   /* durasi animasi dalam milidetik */
        const interval = 16;     /* update tiap ~16ms ≈ 60fps */
        const langkah = target / (durasi / interval); /* kenaikan per frame */
        let current = 0;

        const timer = setInterval(() => {
            current += langkah;

            if (current >= target) {
                /* animasi selesai — pastikan nilai tepat (tidak over) */
                el.textContent = target + "%";
                clearInterval(timer);
            } else {
                /* update tampilan, bulatkan 2 desimal agar rapi */
                el.textContent = current.toFixed(2) + "%";
            }
        }, interval);
    });

    // chart 1: tingkat kemiskinan per provinsi (bar chart)
    const ctxBar = document.getElementById("chartBar").getContext("2d");

    // buat data bar(pulau)
    function buatDataBar(pulau = "semua") {
        const filtered = filterByPulau(pulau);
        /* urutkan dari tertinggi ke terendah supaya mudah dibaca */
        const sorted = [...filtered].sort((a, b) => b.jumlah_sep - a.jumlah_sep);

        return {
            labels: sorted.map(d => d.provinsi),           /* nama provinsi di sumbu X */
            values: sorted.map(d => d.jumlah_sep),          /* nilai kemiskinan (%) */
            colors: sorted.map(d => warnaBatang(d.jumlah_sep)), /* warna tiap bar */
        };
    }

    // buat chart bar pertama dgn semua data
    const initBar = buatDataBar("semua");
    const chartBar = new Chart(ctxBar, {
        type: "bar",  /* jenis chart */

        data: {
            labels: initBar.labels,
            datasets: [{
                label: "% Penduduk Miskin (Sept 2024)",
                data: initBar.values,
                backgroundColor: initBar.colors,
                borderRadius: 4,    /* sudut bar sedikit melengkung */
                borderSkipped: false,
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 700,
                easing: "easeOutQuart",
            },

            plugins: {
                legend: { display: false },
                tooltip: {
                    ...tooltipConfig,
                    callbacks: {
                        label: ctx => ` ${ctx.parsed.y.toFixed(2)}% penduduk miskin`,
                    }
                }
            },

            scales: {
                x: {
                    grid: { display: false },  /* sembunyikan grid vertikal */
                    ticks: {
                        maxRotation: 45,  /* rotasi label agar tidak bertabrakan */
                        font: { size: 10 }
                    },
                },
                y: {
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { callback: v => v + "%" },  /* tambah % di tiap label sumbu Y */
                    min: 0,
                    suggestedMax: 35,
                }
            }
        }
    });

    // doughnut chart 
    const ctxDonut = document.getElementById("chartDoughnut").getContext("2d");

    /* dataPulau sudah disiapkan di data.js (rata-rata per pulau) */
    const chartDoughnut = new Chart(ctxDonut, {
        type: "doughnut",

        data: {
            labels: dataPulau.map(d => d.pulau),    /* nama pulau */
            datasets: [{
                data: dataPulau.map(d => d.avg),   /* rata-rata % kemiskinan */
                backgroundColor: WARNA_PULAU,
                borderColor: "#161b22",  /* warna celah antar irisan = warna background */
                borderWidth: 3,
                hoverOffset: 10,         /* irisan sedikit keluar saat dihover */
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                duration: 800,
            },

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#8b949e",
                        padding: 14,
                        boxWidth: 12,
                        font: { size: 11 }
                    }
                },

                tooltip: {
                    ...tooltipConfig,
                    callbacks: {
                        label: ctx => {
                            const nama = ctx.label;
                            const val = ctx.parsed.toFixed(2);
                            return ` ${nama}: ${val}% rata-rata`;
                        }
                    }
                }
            }
        }
    });

    // line chart
    const ctxLine = document.getElementById("chartLine").getContext("2d");

    function buatDataLine(pulau = "semua") {
        const filtered = filterByPulau(pulau);

        return {
            labels: filtered.map(d => d.provinsi),

            datasets: [
                {
                    label: "Perkotaan — Maret",
                    data: filtered.map(d => d.perkotaan_mar),
                    borderColor: "#3b82f6",           /* biru */
                    backgroundColor: "rgba(59,130,246,0.15)",
                    tension: 0.35,                /* lengkungan garis */
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
                {
                    label: "Perkotaan — Sept",
                    data: filtered.map(d => d.perkotaan_sep),
                    borderColor: "#93c5fd",           /* biru muda */
                    backgroundColor: "rgba(147,197,253,0.1)",
                    tension: 0.35,
                    borderDash: [5, 3],              /* garis putus-putus untuk pembeda */
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
                {
                    label: "Perdesaan — Maret",
                    data: filtered.map(d => d.perdesaan_mar),
                    borderColor: "#e6a817",           /* emas */
                    backgroundColor: "rgba(230,168,23,0.15)",
                    tension: 0.35,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
                {
                    label: "Perdesaan — Sept",
                    data: filtered.map(d => d.perdesaan_sep),
                    borderColor: "#fcd34d",           /* kuning */
                    backgroundColor: "rgba(252,211,77,0.1)",
                    tension: 0.35,
                    borderDash: [5, 3],
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                },
            ]
        };
    }

    /* Buat chart Line pertama kali */
    const initLine = buatDataLine("semua");
    const chartLine = new Chart(ctxLine, {
        type: "line",

        data: initLine,

        options: {
            responsive: true,
            maintainAspectRatio: false,

            /* Animasi entrance: garis tergambar dari kiri ke kanan */
            animation: {
                duration: 900,
                easing: "easeInOutQuart",
            },

            interaction: {
                /* Tooltip muncul untuk semua dataset di posisi X yang sama */
                mode: "index",
                intersect: false,
            },

            plugins: {
                /* Legend aktif — user bisa KLIK untuk toggle tiap garis
                   Ini memenuhi syarat interaktif: toggle dataset */
                legend: {
                    position: "top",
                    labels: {
                        color: "#8b949e",
                        padding: 16,
                        boxWidth: 24,
                        font: { size: 11 }
                    }
                },

                tooltip: {
                    ...tooltipConfig,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2) ?? "N/A"}%`
                    }
                }
            },

            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        font: { size: 10 }
                    }
                },
                y: {
                    grid: { color: "rgba(255,255,255,0.05)" },
                    ticks: { callback: v => v + "%" },
                    min: 0,
                    suggestedMax: 40,
                }
            }
        }
    });

    // filter dropdown, fungsi ini akan :
    // 1. ngambil nilai pilihan (nama pulau/semua)
    // 2. hitung ulang bar/line chart sesuai filter
    // 3. update kedua chat tnp harus reload halaman

    document.getElementById("filter-pulau").addEventListener("change", function () {
        const pilihanPulau = this.value; /* nilai <option> yang dipilih */

        /* Teks label di atas chart — update sesuai pilihan */
        const labelTeks = pilihanPulau === "semua" ? "Semua Provinsi" : pilihanPulau;
        document.getElementById("label-filter-aktif").textContent = labelTeks;
        document.getElementById("label-filter-aktif-line").textContent = labelTeks;

        // update chart bar
        const dataBar = buatDataBar(pilihanPulau);
        chartBar.data.labels = dataBar.labels;
        chartBar.data.datasets[0].data = dataBar.values;
        chartBar.data.datasets[0].backgroundColor = dataBar.colors;
        chartBar.update(); /* render ulang chart dengan data baru */

        // update chart line
        const dataLine = buatDataLine(pilihanPulau);
        chartLine.data.labels = dataLine.labels;
        // update tiap dataset
        dataLine.datasets.forEach((ds, i) => {
            chartLine.data.datasets[i].data = ds.data;
        });
        chartLine.update();
    });