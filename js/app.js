// js/app.js - 全局主控邏輯
let currentFloor = 'F1';
let scale = 1;
let translateX = 0;
let translateY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

document.addEventListener('DOMContentLoaded', () => {
  initPageNavigation(); // 👈 初始化分頁切換
  initFloorButtons();
  initZoomControls();
  initMapDrag();
  populateNodeOptions();
  loadFloorSVG(currentFloor);
});

// 🌐 1. 初始化頁面分頁切換邏輯
function initPageNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const pages = document.querySelectorAll('.app-page');

  tabs.forEach(tab => {
    tab.onclick = () => {
      // 標籤切換高亮
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 頁面顯示切換
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

// 2. 初始化樓層按鈕
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

// 3. 縮放控制
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

// 4. 滑鼠與手勢拖動地圖
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

// 5. 載入 SVG
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

// 6. 繪製 POI
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

// 7. 選單選項
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