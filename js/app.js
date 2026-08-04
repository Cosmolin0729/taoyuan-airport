// js/app.js - 全局主控邏輯 (含點擊安全防護與出入境自動分流)
let currentFloor = 'F1';
let scale = 1;
let translateX = 0;
let translateY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

// ✈️ 假資料庫 (包含出境 Departure 與 入境 Arrival 兩種狀態)
const mockFlightsData = [
  {
    type: "Departure", // 出境
    flightNo: "BR12",
    airline: "長榮航空",
    destination: "洛杉磯 (LAX)",
    time: "18:40",
    floor: "F3",
    locationName: "3F - 12號報到櫃檯",
    locationId: "f3-checkin",
    status: "開放報到中"
  },
  {
    type: "Departure", // 出境
    flightNo: "JX800",
    airline: "星宇航空",
    destination: "東京成田 (NRT)",
    time: "19:20",
    floor: "F3",
    locationName: "3F - 6號報到櫃檯",
    locationId: "f3-checkin",
    status: "開放報到中"
  },
  {
    type: "Arrival", // 入境
    flightNo: "CI501",
    airline: "中華航空",
    destination: "上海浦東 (PVG)",
    time: "17:15",
    floor: "F1",
    locationName: "1F - 3號行李轉盤",
    locationId: "t2-baggage-3",
    status: "行李提領中"
  },
  {
    type: "Arrival", // 入境
    flightNo: "AK1510",
    airline: "亞洲航空",
    destination: "吉隆坡 (KUL)",
    time: "17:50",
    floor: "F1",
    locationName: "1F - 5號行李轉盤",
    locationId: "t2-baggage-5",
    status: "航班已抵達"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initPageNavigation();
  initFloorButtons();
  initZoomControls();
  initMapDrag();
  populateNodeOptions();
  loadFloorSVG(currentFloor);

  // 初始化航班頁面
  initFlightSearch();
  renderFlightTable();
});

// 🌐 1. 初始化頁面分頁切換邏輯
function initPageNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.app-page');

  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetPageId = tab.dataset.page;
      pages.forEach(page => {
        if (page.id === targetPageId) {
          page.classList.add('active');
        } else {
          page.classList.remove('active');
        }
      });
    };
  });
}

// ✈️ 2. 初始化航班搜尋與出/入境判斷邏輯
function initFlightSearch() {
  const searchBtn = document.getElementById('btnSearchFlight');
  const input = document.getElementById('flightInput');

  if (searchBtn && input) {
    searchBtn.onclick = () => performFlightSearch(input.value);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performFlightSearch(input.value);
    });
  }
}

// 執行搜尋與分流判斷
function performFlightSearch(query) {
  if (!query || !query.trim()) {
    alert("請輸入航班編號！(可嘗試輸入：BR12、CI501、JX800、AK1510)");
    return;
  }

  const cleanQuery = query.trim().toUpperCase();
  const flight = mockFlightsData.find(f => f.flightNo.toUpperCase() === cleanQuery);

  const resultContainer = document.getElementById('flightSearchResult');
  if (!resultContainer) return;

  if (flight) {
    const isDeparture = flight.type === "Departure";
    const typeLabel = isDeparture ? "🛫 出境航班" : "🛬 入境航班";
    const typeColor = isDeparture ? "#007bff" : "#28a745";
    const targetGuideLabel = isDeparture ? "報到櫃檯" : "行李提領轉盤";

    resultContainer.innerHTML = `
      <div style="background:#f8f9fa; border:1px solid #ddd; border-left:6px solid ${typeColor}; padding:16px; border-radius:8px; margin-top:15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; color:#0d3b66;">${flight.airline} ${flight.flightNo}</h3>
          <span style="background:${typeColor}; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">${typeLabel}</span>
        </div>
        <p style="margin:4px 0; font-size:0.9rem;"><b>預計時間：</b> ${flight.time} | <b>目的地/來源地：</b> ${flight.destination}</p>
        <p style="margin:6px 0; font-size:1rem; color:#d9534f;"><b>指引 ${targetGuideLabel}：</b> <b>${flight.locationName}</b></p>
        <p style="margin:4px 0; font-size:0.85rem; color:#666;"><b>目前狀態：</b> ${flight.status}</p>
        <button onclick="navigateToMapLocation('${flight.floor}', '${flight.locationId}', '${flight.locationName}')" class="btn-primary" style="margin-top:10px; width:100%; padding:10px;">
          📍 在地圖上記標並導航至 [ ${flight.locationName} ]
        </button>
      </div>
    `;
  } else {
    resultContainer.innerHTML = `
      <div style="background:#fff3cd; color:#856404; padding:12px; border-radius:6px; margin-top:15px; text-align:center; border:1px solid #ffeeba;">
        ⚠️ 查無航班 <b>${cleanQuery}</b>，請確認編號是否正確 (可嘗試預設航班：BR12、CI501、JX800、AK1510)。
      </div>
    `;
  }
}

// 渲染預設航班列表
function renderFlightTable() {
  const tbody = document.getElementById('flightTableBody');
  if (!tbody) return;

  tbody.innerHTML = mockFlightsData.map(flight => {
    const isDeparture = flight.type === "Departure";
    const typeBadge = isDeparture 
      ? `<span class="badge badge-blue">出境</span>` 
      : `<span class="badge badge-green">入境</span>`;

    return `
      <tr>
        <td>${typeBadge}</td>
        <td>${flight.time}</td>
        <td><b>${flight.flightNo}</b></td>
        <td>${flight.airline}</td>
        <td>${flight.destination}</td>
        <td><b>${flight.locationName}</b></td>
        <td>
          <button onclick="navigateToMapLocation('${flight.floor}', '${flight.locationId}', '${flight.locationName}')" class="btn-primary" style="padding:6px 10px; font-size:0.8rem;">
            地圖定位
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 📍 關鍵功能：由航班卡片直接自動帶到地圖並切換樓層
function navigateToMapLocation(targetFloor, locationId, locationName) {
  // 1. 切換至地圖主分頁
  const mapTab = document.querySelector('.nav-tab[data-page="page-map"]');
  if (mapTab) mapTab.click();

  // 2. 切換對應樓層
  const floorBtn = document.querySelector(`.btn-floor[data-floor="${targetFloor}"]`);
  if (floorBtn) floorBtn.click();

  // 3. 自動設定導航終點選單
  const endSelect = document.getElementById('endNodeSelect');
  if (endSelect) {
    for (let opt of endSelect.options) {
      if (opt.value.includes(locationId) || opt.textContent.includes(locationName)) {
        endSelect.value = opt.value;
        break;
      }
    }
  }

  // 4. 彈出指引提示
  setTimeout(() => {
    alert(`已為您切換至 ${targetFloor} 地圖！\n已將導航終點設為：${locationName}`);
  }, 300);
}

// 3. 初始化樓層按鈕
function initFloorButtons() {
  const buttons = document.querySelectorAll('#floorButtons button');
  buttons.forEach(btn => {
    btn.onclick = () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFloor = btn.dataset.floor;
      loadFloorSVG(currentFloor);
    };
  });
}

// 4. 縮放控制
function initZoomControls() {
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const zoomResetBtn = document.getElementById('zoomReset');

  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      scale = Math.min(scale + 0.15, 3.0);
      applyTransform();
    };
  }

  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      scale = Math.max(scale - 0.15, 0.6);
      applyTransform();
    };
  }

  if (zoomResetBtn) {
    zoomResetBtn.onclick = resetZoom;
  }
}

function applyTransform(withTransition = true) {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  container.style.transition = withTransition ? 'transform 0.15s ease-out' : 'none';
  container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function resetZoom() {
  scale = 1;
  translateX = 0;
  translateY = 0;
  applyTransform(true);
}

// 5. 滑鼠與手勢拖動地圖
function initMapDrag() {
  const wrapper = document.querySelector('.map-wrapper');
  if (!wrapper) return;

  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.zoom-controls') || e.target.closest('.poi-marker')) return;

    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    wrapper.classList.add('grabbing');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform(false);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.classList.remove('grabbing');
    }
  });
}

function formatFloorName(floorStr) {
  let clean = floorStr.trim().toUpperCase();
  if (clean.endsWith('F') && !clean.startsWith('F') && clean !== 'B2') {
    clean = 'F' + clean.replace('F', '');
  }
  return clean;
}

// 6. 載入 SVG
async function loadFloorSVG(floor) {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  const floorFileName = formatFloorName(floor);
  const filePath = `./assets/${floorFileName}.svg`; 

  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const svgContent = await res.text();
    container.innerHTML = svgContent;
    
    resetZoom();
    renderFloorPOIs(floorFileName);

  } catch (err) {
    container.innerHTML = `<div style="color:red; padding:40px; text-align:center;">
      <h3>⚠️ 無法載入地圖</h3>
      <p>路徑：<code>${filePath}</code></p>
    </div>`;
  }
}

// 7. 繪製 POI 標點
function renderFloorPOIs(floor) {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) return;

  let poiGroup = svg.querySelector('#svg-poi-layer');
  if (poiGroup) poiGroup.remove();

  poiGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  poiGroup.setAttribute("id", "svg-poi-layer");
  svg.appendChild(poiGroup);

  let viewBox = svg.viewBox.baseVal;
  let svgWidth = (viewBox && viewBox.width > 0) ? viewBox.width : (svg.clientWidth || 1000);
  let svgHeight = (viewBox && viewBox.height > 0) ? viewBox.height : (svg.clientHeight || 1000);

  const pois = (typeof floorPOIs !== 'undefined' && floorPOIs[floor]) ? floorPOIs[floor] : [];

  pois.forEach(poi => {
    const realX = (poi.x / 100) * svgWidth;
    const realY = (poi.y / 100) * svgHeight;

    const foreignObj = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    const iconSize = 30;
    
    foreignObj.setAttribute("x", realX - iconSize / 2);
    foreignObj.setAttribute("y", realY - iconSize / 2);
    foreignObj.setAttribute("width", iconSize);
    foreignObj.setAttribute("height", iconSize);
    foreignObj.style.overflow = "visible";

    const marker = document.createElement('div');
    marker.className = `poi-marker category-${poi.category}`;
    marker.innerHTML = `<span class="poi-icon">${poi.icon}</span>`;
    marker.style.width = "100%";
    marker.style.height = "100%";
    marker.style.display = "flex";
    marker.style.justifyContent = "center";
    marker.style.alignItems = "center";
    marker.style.cursor = "pointer";
    marker.title = poi.name;

    marker.onclick = (e) => {
      e.stopPropagation();
      alert(`📌 ${poi.name}\nℹ️ ${poi.desc}`);
    };

    foreignObj.appendChild(marker);
    poiGroup.appendChild(foreignObj);
  });
}

// 8. 填入導航下拉選單
function populateNodeOptions() {
  const startSelect = document.getElementById('startNodeSelect');
  const endSelect = document.getElementById('endNodeSelect');
  if (!startSelect || !endSelect) return;

  if (typeof mapNodes !== 'undefined') {
    mapNodes.forEach(node => {
      const opt1 = document.createElement('option');
      opt1.value = node.id;
      opt1.textContent = `[${node.floor}] ${node.name}`;
      startSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = node.id;
      opt2.textContent = `[${node.floor}] ${node.name}`;
      endSelect.appendChild(opt2);
    });
  }
}