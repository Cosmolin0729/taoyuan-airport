let currentFloor = 'F1';
let currentLang = 'zh-TW';
let scale = 1;

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initFloorButtons();
  initZoomControls();
  populateNodeOptions();
  loadFloorSVG(currentFloor);
});

// 1. 切換多國語言
function initI18n() {
  const langSelect = document.getElementById('langSelector');
  langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateLanguageTexts();
  });
}

function updateLanguageTexts() {
  const dict = i18nDictionary[currentLang] || i18nDictionary['zh-TW'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
}

// 2. 樓層按鈕切換
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

// 3. 載入 SVG 檔 (讀取 assets/icons/{Floor}.svg)
// 載入 SVG 檔 (讀取 assets/{Floor}.svg)
async function loadFloorSVG(floor) {
  const container = document.getElementById('mapContainer');
  
  // 強制轉為大寫，確保與檔名 B2.svg, F1.svg 等完全吻合
  const formattedFloor = floor.toUpperCase(); 
  
  // 📍 路徑直接指向 assets/ 目錄
  const filePath = `./assets/${formattedFloor}.svg`; 

  container.innerHTML = `<div class="loading-text">${i18nDictionary[currentLang]?.loading || '地圖載入中...'}</div>`;

  try {
    const res = await fetch(filePath);
    if (!res.ok) {
      throw new Error(`HTTP 狀態碼: ${res.status}`);
    }
    const svgContent = await res.text();
    container.innerHTML = svgContent;
    resetZoom();
  } catch (err) {
    console.error("地圖載入詳細錯誤資訊：", err);
    container.innerHTML = `<div style="color:red; text-align:center;">
      ⚠️ 無法載入地圖檔: <code>${filePath}</code><br>
      <small style="color:#666;">請確認 SVG 已直接放在 assets/ 資料夾中，且檔名是大寫</small>
    </div>`;
  }
}
// 4. 地圖縮放控制
function initZoomControls() {
  const container = document.getElementById('mapContainer');
  document.getElementById('zoomIn').onclick = () => { scale += 0.15; applyTransform(); };
  document.getElementById('zoomOut').onclick = () => { if (scale > 0.5) scale -= 0.15; applyTransform(); };
  document.getElementById('zoomReset').onclick = resetZoom;

  function applyTransform() { container.style.transform = `scale(${scale})`; }
}

function resetZoom() {
  scale = 1;
  document.getElementById('mapContainer').style.transform = `scale(1)`;
}

// 5. 填入導航節點選單
function populateNodeOptions() {
  const startSelect = document.getElementById('startNodeSelect');
  const endSelect = document.getElementById('endNodeSelect');

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