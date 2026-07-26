function calculate() {
    // Girdileri Al
    const V = parseFloat(document.getElementById('voltage').value);
    const I = parseFloat(document.getElementById('current').value);
    const L = parseFloat(document.getElementById('length').value);
    const cosPhi = parseFloat(document.getElementById('cosPhi').value);
    const k = parseFloat(document.getElementById('conductor').value); // Özgül iletkenlik (Cu=56, Al=35)
    const S = parseFloat(document.getElementById('section').value);

    if (!V || !I || !L || !S) {
        alert("Lütfen tüm alanları geçerli değerlerle doldurun.");
        return;
    }

    // IEC 3 Fazlı Gerilim Düşümü Formülü:
    // ΔU = (√3 * L * I * cosφ) / (k * S)
    const sqrt3 = Math.sqrt(3);
    const deltaU = (sqrt3 * L * I * cosPhi) / (k * S);
    const percentDrop = (deltaU / V) * 100;
    const endVoltage = V - deltaU;

    // Ekrana Yazdır
    document.getElementById('resVoltDrop').innerText = deltaU.toFixed(2) + " V";
    document.getElementById('resPercentDrop').innerText = "% " + percentDrop.toFixed(2);
    document.getElementById('resEndVolt').innerText = endVoltage.toFixed(2) + " V";

    // Durum Kontrolü (%3 standart sınır kabul edilmiştir)
    const badge = document.getElementById('statusBadge');
    if (percentDrop <= 3) {
        badge.className = "status-badge status-pass";
        badge.innerText = "✓ UYGUN (%3 Sınırı İçinde)";
    } else {
        badge.className = "status-badge status-fail";
        badge.innerText = "✕ UYGUN DEĞİL (%3 Sınırı Aşıldı!)";
    }

    // Sonuç alanını göster
    document.getElementById('resultsBlock').classList.add('active');
}
