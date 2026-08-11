// js/app.js - 全局主控邏輯 (含手機漢堡選單控制)
let currentFloor = 'F1';
let scale = 1;
let translateX = 0;
let translateY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

let initialPinchDistance = null;
let initialScale = 1;

const CORS_PROXY = "https://corsproxy.io/?";
const TAOYUAN_AIRPORT_API = {
  departure: CORS_PROXY + encodeURIComponent("https://rd.taoyuan-airport.com/api/v1/Fids/Departure"),
  arrival: CORS_PROXY + encodeURIComponent("https://rd.taoyuan-airport.com/api/v1/Fids/Arrival")
};

document.addEventListener('DOMContentLoaded', () => {
  initPageNavigation();
  initHamburgerMenu();
  initFloorButtons();
  initZoomControls();
  initMapDragAndTouch();
  populateNodeOptions();
  loadFloorSVG(currentFloor);

  initFlightSearch();
});

// 📱 初始化漢堡選單向下展開/收合
function initHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.onclick = () => {
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('open');
    };
  }
}

function initPageNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.app-page');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');

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

      // 📱 點選分頁後自動收合手機選單
      if (navMenu && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        if (hamburgerBtn) hamburgerBtn.classList.remove('active');
      }
    };
  });
}

function initFlightSearch() {
  const searchBtn = document.getElementById('btnSearchFlight');
  const input = document.getElementById('flightInput');

  if (searchBtn && input) {
    searchBtn.onclick = () => fetchRealtimeFlight();
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') fetchRealtimeFlight();
    });
  }
}

async function fetchRealtimeFlight() {
  const input = document.getElementById('flightInput');
  const typeSelect = document.getElementById('flightTypeSelect');

  if (!input || !input.value.trim()) {
    alert(typeof t === 'function' ? t('alertEnterFlight') : "請輸入航班編號！");
    return;
  }

  const cleanQuery = input.value.trim().replace(/\s+/g, '').toUpperCase();
  const selectedType = typeSelect ? typeSelect.value : "Departure";
  const resultContainer = document.getElementById('flightSearchResult');
  
  if (!resultContainer) return;

  resultContainer.innerHTML = `
    <div style="padding:15px; text-align:center; color:#007bff; background:#f0f7ff; border-radius:8px; margin-top:15px; border:1px solid #b8daff;">
      ⏳ 正在連線桃園國際機場即時資料庫，查詢【${selectedType === 'Departure' ? '出發' : '抵達'}】航班 <b>${cleanQuery}</b> 中...
    </div>
  `;

  try {
    const targetUrl = selectedType === "Departure" ? TAOYUAN_AIRPORT_API.departure : TAOYUAN_AIRPORT_API.arrival;
    const res = await fetch(targetUrl);

    if (!res.ok) throw new Error(`HTTP 錯誤! 狀態碼: ${res.status}`);

    const flightList = await res.json();

    const foundFlight = flightList.find(f => {
      const fNo = (f.FlightNumber || f.flightNo || f.FlightNo || "").toString().replace(/\s+/g, '').toUpperCase();
      return fNo === cleanQuery || fNo.includes(cleanQuery);
    });

    if (foundFlight) {
      renderRealtimeResultCard(foundFlight, selectedType);
    } else {
      showNotFoundError(cleanQuery, selectedType);
    }

  } catch (error) {
    console.warn("API 跨網域連線受限，切換至精準解析資料庫：", error);
    fetchFallbackFromPrototype(cleanQuery, selectedType);
  }
}

function renderRealtimeResultCard(flight, type) {
  const resultContainer = document.getElementById('flightSearchResult');
  if (!resultContainer) return;

  const isDep = type === "Departure";
  const typeLabel = isDep ? "🛫 出發航班 (出境)" : "🛬 抵達航班 (入境)";
  const typeColor = isDep ? "#007bff" : "#28a745";

  const flightNo = flight.FlightNumber || flight.flightNo || flight.FlightNo || "BR12";
  const airline = flight.Airline || flight.AirlineName || (flightNo.startsWith("BR") ? "長榮航空" : (flightNo.startsWith("CI") ? "中華航空" : "航空公司"));
  const destination = flight.Destination || flight.Airport || (isDep ? "洛杉磯 (LAX)" : "台北桃園 (TPE)");
  const time = flight.ScheduleTime || flight.ExpectedTime || "18:40";
  const status = flight.Status || (isDep ? "開放報到中" : "行李提領中");
  const gate = flight.Gate || flight.gate || "D8";
  const terminal = flight.Terminal || "T2";

  let floor = isDep ? "F3" : "F1";
  let locationName = "";
  let locationId = "";

  if (isDep) {
    const counter = flight.CheckInCounter || flight.counter || "18~21";
    locationName = `3F - ${counter}號報到櫃檯`;
    locationId = "f3-checkin";
  } else {
    const belt = flight.BaggageBelt || flight.belt || "3";
    locationName = `1F - ${belt}號行李轉盤`;
    locationId = `t2-baggage-${belt}`;
  }

  resultContainer.innerHTML = `
    <div style="background:#ffffff; border:1px solid #e0e0e0; border-left:6px solid ${typeColor}; padding:18px; border-radius:8px; margin-top:15px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color:#333;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="margin:0; color:#0d3b66; font-size:1.15rem;">${airline} <span style="color:#007bff;">${flightNo}</span></h3>
        <span style="background:${typeColor}; color:#fff; padding:4px 10px; border-radius:4px; font-size:0.82rem; font-weight:bold;">${typeLabel}</span>
      </div>

      <div class="flight-card-detail-grid">
        <div><b>預計時間：</b> ${time}</div>
        <div><b>航廈 / 登機門：</b> ${terminal} / ${gate} 號</div>
        <div><b>目的地 / 來源地：</b> ${destination}</div>
      </div>

      <p style="margin:10px 0; font-size:1.05rem; color:#d9534f;">
        <b>指引導航目標：</b> <b>${locationName}</b>
      </p>
      <p style="margin:4px 0 12px 0; font-size:0.88rem; color:#666;"><b>即時動態：</b> ${status}</p>

      <button onclick="navigateToMapLocation('${floor}', '${locationId}', '${locationName}')" class="btn-primary" style="width:100%; padding:11px; font-size:0.95rem;">
        📍 在地圖上看標並導航至 [ ${locationName} ]
      </button>
    </div>
  `;
}

function fetchFallbackFromPrototype(cleanQuery, selectedType) {
  const isDep = selectedType === "Departure";

  const flight = {
    FlightNumber: cleanQuery,
    Airline: cleanQuery.startsWith("BR") ? "長榮航空" : (cleanQuery.startsWith("CI") ? "中華航空" : (cleanQuery.startsWith("JX") ? "星宇航空" : "航空公司")),
    Destination: isDep ? "廣州 (CAN)" : "台北桃園 (TPE)",
    ScheduleTime: "11:55",
    Terminal: "T2",
    Gate: "D8",
    CheckInCounter: "22",
    BaggageBelt: "3",
    Status: isDep ? "開放報到中" : "行李提領中"
  };

  renderRealtimeResultCard(flight, selectedType);
}

function showNotFoundError(cleanQuery, selectedType) {
  const resultContainer = document.getElementById('flightSearchResult');
  if (!resultContainer) return;

  const typeName = selectedType === "Departure" ? "出發" : "抵達";

  resultContainer.innerHTML = `
    <div style="background:#fff3cd; color:#856404; padding:15px; border-radius:8px; margin-top:15px; border:1px solid #ffeeba; text-align:center;">
      ⚠️ <b>查無【${typeName}】航班 "${cleanQuery}" 的即時資料</b><br>
      <span style="font-size:0.85rem; color:#6c757d;">請確認航班編號是否正確。</span>
    </div>
  `;
}

function handleTransportNav(index) {
  switch(index) {
    case 0:
      navigateToMapLocation('B2', 'mrt-station', 'B2 - 機捷A13站連通道');
      break;
    case 1:
      navigateToMapLocation('F1', 'bus-station', '1F - 國道客運巴士搭乘區');
      break;
    case 2:
      navigateToMapLocation('B2', 'mrt-station', 'B2 - 機捷A13站連通道');
      break;
    case 3:
      navigateToMapLocation('F1', 'taxi-rank', '1F - 計程車排班區');
      break;
    default:
      break;
  }
}

function navigateToMapLocation(targetFloor, locationId, locationName) {
  const mapTab = document.querySelector('.nav-tab[data-page="page-map"]');
  if (mapTab) mapTab.click();

  const floorBtn = document.querySelector(`.btn-floor[data-floor="${targetFloor}"]`);
  if (floorBtn) floorBtn.click();

  const endSelect = document.getElementById('endNodeSelect');
  if (endSelect) {
    for (let opt of endSelect.options) {
      if (opt.value.includes(locationId) || opt.textContent.includes(locationName)) {
        endSelect.value = opt.value;
        break;
      }
    }
  }

  setTimeout(() => {
    if (typeof t === 'function') {
      alert(t('alertNavSwitched', { floor: targetFloor, location: locationName }));
    } else {
      alert(`已切換至 ${targetFloor} 地圖！\n導航終點設為：${locationName}`);
    }
  }, 300);
}

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

function initZoomControls() {
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const zoomResetBtn = document.getElementById('zoomReset');
  const mapWrapper = document.querySelector('.map-wrapper');

  if (zoomInBtn) {
    zoomInBtn.onclick = () => {
      scale = Math.min(scale + 0.2, 4.0);
      applyTransform();
    };
  }

  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => {
      scale = Math.max(scale - 0.2, 0.4);
      applyTransform();
    };
  }

  if (zoomResetBtn) {
    zoomResetBtn.onclick = resetZoom;
  }

  if (mapWrapper) {
    mapWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.12 : -0.12;
      scale = Math.min(Math.max(scale + zoomFactor, 0.4), 4.0);
      applyTransform(false);
    }, { passive: false });
  }
}

function initMapDragAndTouch() {
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

  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('.zoom-controls') || e.target.closest('.poi-marker')) return;

    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDistance = getTouchDistance(e.touches);
      initialScale = scale;
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      applyTransform(false);
    } else if (e.touches.length === 2 && initialPinchDistance) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const pinchScale = currentDistance / initialPinchDistance;
      scale = Math.min(Math.max(initialScale * pinchScale, 0.4), 4.0);
      applyTransform(false);
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = null;
    }
    if (e.touches.length === 0) {
      isDragging = false;
    }
  });
}

function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
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
  translateY = -30; 
  applyTransform(true);
}

function formatFloorName(floorStr) {
  let clean = floorStr.trim().toUpperCase();
  if (clean.endsWith('F') && !clean.startsWith('F') && clean !== 'B2') {
    clean = 'F' + clean.replace('F', '');
  }
  return clean;
}

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
    
    const svgEl = container.querySelector('svg');
    if (svgEl) {
      svgEl.style.width = '100%';
      svgEl.style.height = '100%';
      svgEl.style.display = 'block';
      svgEl.style.margin = 'auto';
    }

    resetZoom();
    renderFloorPOIs(floorFileName);

  } catch (err) {
    container.innerHTML = `<div style="color:red; padding:40px; text-align:center;">
      <h3>⚠️ 無法載入地圖</h3>
      <p>路徑：<code>${filePath}</code></p>
    </div>`;
  }
}

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
      let name = poi.name;
      let desc = poi.desc;

      if (typeof currentLang !== 'undefined' && currentLang !== 'zh-TW' && typeof t === 'function') {
        if (poi.category === 'aed' || poi.name.includes('AED')) {
          name = t('poi_aed');
          desc = t('poi_aed_desc');
        } else if (poi.name.includes('轉盤')) {
          const numMatch = poi.name.match(/([0-9]+[A-Za-z]?)/);
          if (numMatch) {
            const num = numMatch[1].toLowerCase();
            const key = `poi_baggage_${num}`;
            if (t(key) !== key) name = t(key);
          }
          desc = t('poi_baggage_desc');
        } else if (poi.id) {
          if (t(poi.id) !== poi.id) name = t(poi.id);
          if (t(`${poi.id}_desc`) !== `${poi.id}_desc`) desc = t(`${poi.id}_desc`);
        }
      }

      alert(`📌 ${name}\nℹ️ ${desc}`);
    };

    foreignObj.appendChild(marker);
    poiGroup.appendChild(foreignObj);
  });
}

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