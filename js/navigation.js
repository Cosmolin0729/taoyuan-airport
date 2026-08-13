// js/navigation.js - 3F & 5F 多樓層狀態保持導航模組

// 🧭 1. 全局導航狀態控制
let isNavigating = false;

// 🧭 2. 定義 3 樓與 5 樓兩條「完全不同」的路線 coordinates
const multiFloorRoutes = {
  "F3": {
    name: "3F 15號報到櫃檯 ➔ 北側電梯",
    waypoints: "M 580,400 L 600,450 L 600,200" // 👈 3樓專屬路線 (你可以自己修改 X,Y)
  },
  "F5": {
    name: "5F 電梯出口 ➔ 北擴觀景台",
    waypoints: "M 600,200 L 680,200 L 680,30"          // 👈 5樓專屬路線 (你可以自己修改 X,Y)
  }
};

// 🚀 按下「開始導航」時觸發
function showDemoNavigationPath() {
  isNavigating = true; // 開啟導航狀態標記

  const activeFloorBtn = document.querySelector('#floorButtons .btn-floor.active');
  const currentFloor = activeFloorBtn ? activeFloorBtn.dataset.floor : 'F3';

  // 如果目前不在 3F 或 5F，自動幫使用者切換到 3F 起點
  if (currentFloor !== 'F3' && currentFloor !== 'F5') {
    const btnF3 = document.querySelector('.btn-floor[data-floor="F3"]');
    if (btnF3) btnF3.click(); // 這會觸發 loadFloorSVG，進而調用 autoRedrawNavigationForCurrentFloor
  } else {
    autoRedrawNavigationForCurrentFloor(currentFloor);
  }

  showMapToast("🧭 【導航已啟動】3F 與 5F 路線已生成！請切換樓層查看。");
}

// 📌 核心函式：根據當前樓層自動重繪對應路線 (供 loadFloorSVG 切換樓層時調用)
function autoRedrawNavigationForCurrentFloor(floor) {
  // 若未啟動導航，不畫線
  if (!isNavigating) return;

  const routeData = multiFloorRoutes[floor];

  if (routeData) {
    // 繪製該樓層專屬路線
    drawNavigationPathOnSVG(routeData.waypoints);
    showMapToast(`📍 當前呈現：【${floor}】${routeData.name}`);
  } else {
    // 非 3F/5F 清除線條
    clearDemoNavigationPath();
  }
}

// 📍 在 SVG 畫布內部繪製發光流動導航線
function drawNavigationPathOnSVG(waypoints) {
  const container = document.getElementById('mapContainer');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;

  clearDemoNavigationPath();

  let navGroup = svg.querySelector('#svg-nav-layer');
  if (!navGroup) {
    navGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    navGroup.setAttribute("id", "svg-nav-layer");
    svg.appendChild(navGroup);
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("id", "demoNavPath");
  path.setAttribute("d", waypoints);
  path.setAttribute("stroke", "#00d2ff");
  path.setAttribute("stroke-width", "8");
  path.setAttribute("stroke-dasharray", "10, 10");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("fill", "none");
  path.setAttribute("filter", "drop-shadow(0px 0px 8px rgba(0, 210, 255, 0.9))");
  path.style.animation = "navPathFlow 1.2s linear infinite";

  navGroup.appendChild(path);
}

// 🧹 清除導航狀態與線條 (按下「清除路徑」按鈕時呼叫)
function clearDemoNavigationPath() {
  const container = document.getElementById('mapContainer');
  if (!container) return;
  const svg = container.querySelector('svg');
  if (svg) {
    const navGroup = svg.querySelector('#svg-nav-layer');
    if (navGroup) navGroup.remove();
  }
}

// 清除按鈕專用 (徹底關閉導航狀態)
function resetNavigationState() {
  isNavigating = false;
  clearDemoNavigationPath();
  showMapToast("🧹 導航路徑已清除");
}

// 💡 懸浮提示 Toast
function showMapToast(message) {
  let toast = document.getElementById('mapToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'mapToast';
    toast.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(13, 59, 102, 0.92);
      color: #fff;
      padding: 10px 22px;
      border-radius: 20px;
      border: 1px solid #00d2ff;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      font-size: 0.9rem;
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
      backdrop-filter: blur(8px);
      transition: opacity 0.4s ease;
      text-align: center;
      max-width: 90%;
    `;
    const wrapper = document.querySelector('.map-wrapper');
    if (wrapper) wrapper.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.opacity = '0';
  }, 3500);
}