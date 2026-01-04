let allTenders = [];
let chart;

fetch("data/tenders.csv")
  .then(res => res.text())
  .then(data => loadData(data));

function loadData(csv) {
  const rows = csv.trim().split("\n").slice(1);
  allTenders = rows.map(r => {
    const c = r.split(",");
    const deviation = ((c[4]-c[3])/c[3]*100).toFixed(1);
    let score = 0;
    let reasons = [];

    if (c[5] == 1) { score += 50; reasons.push("Single Bidder"); }
    if (deviation > 30) { score += 40; reasons.push("Inflated Cost"); }

    let risk = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";

    return { id:c[0], dept:c[1], vendor:c[6], bidders:c[5], deviation, risk, reasons };
  });

  updateDashboard("All");
  renderChart();
}

function updateDashboard(filter) {
  const tbody = document.getElementById("tenderTable");
  tbody.innerHTML = "";

  let counts = {High:0, Medium:0, Low:0};

  allTenders.forEach(t => {
    if (filter !== "All" && t.risk !== filter) return;
    counts[t.risk]++;

    const row = document.createElement("tr");
    row.onclick = () => showModal(t.reasons);
    row.innerHTML = `
      <td>${t.id}</td>
      <td>${t.dept}</td>
      <td>${t.vendor}</td>
      <td>${t.bidders}</td>
      <td>${t.deviation}%</td>
      <td>${t.risk}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("highRisk").innerText = counts.High;
  document.getElementById("mediumRisk").innerText = counts.Medium;
  document.getElementById("lowRisk").innerText = counts.Low;
}

function renderChart() {
  const ctx = document.getElementById("riskChart");
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        label: 'Tender Risk Distribution',
        data: [
          allTenders.filter(t=>t.risk=="High").length,
          allTenders.filter(t=>t.risk=="Medium").length,
          allTenders.filter(t=>t.risk=="Low").length
        ]
      }]
    }
  });
}

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function filterRisk(level, btn) {
  updateDashboard(level);

  document.querySelectorAll(".filter-btn").forEach(b => {
    b.classList.remove("active");
  });

  btn.classList.add("active");
}

function showModal(reasons) {
  document.getElementById("modalText").innerText = reasons.join(", ");
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}