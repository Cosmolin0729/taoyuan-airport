// js/i18n.js - 全局多國語言翻譯引擎
let currentLang = 'zh-TW';

// 取得當前語言字典物件
function getActiveDict() {
  const dicts = {
    'en': typeof i18n_en !== 'undefined' ? i18n_en : {},
    'ja': typeof i18n_ja !== 'undefined' ? i18n_ja : {},
    'ko': typeof i18n_ko !== 'undefined' ? i18n_ko : {},
    'es': typeof i18n_es !== 'undefined' ? i18n_es : {},
    'th': typeof i18n_th !== 'undefined' ? i18n_th : {},
    'vi': typeof i18n_vi !== 'undefined' ? i18n_vi : {}
  };
  return dicts[currentLang] || {};
}

// 取得翻譯文字 (若無對應 key 則回傳原本文字)
function t(key, params = {}) {
  const dict = getActiveDict();
  let text = dict[key] || key;

  for (const p in params) {
    text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
  }
  return text;
}

// 執行語言切換主邏輯
function applyLanguage(lang) {
  if (!lang) return;
  currentLang = lang;
  const dict = getActiveDict();

  // 1. 替換帶有 data-i18n 屬性的文字 (使用 textContent 避免刪除圖示 span)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    
    if (lang === 'zh-TW') {
      if (el.getAttribute('data-zh')) {
        el.textContent = el.getAttribute('data-zh');
      }
    } else if (dict[key]) {
      if (!el.getAttribute('data-zh')) {
        el.setAttribute('data-zh', el.textContent.trim());
      }
      el.textContent = dict[key];
    }
  });

  // 2. 替換搜尋框 Placeholder
  const flightInput = document.getElementById('flightInput');
  if (flightInput) {
    if (lang !== 'zh-TW' && dict['inputFlightPlaceholder']) {
      if (!flightInput.getAttribute('data-zh-ph')) {
        flightInput.setAttribute('data-zh-ph', flightInput.placeholder);
      }
      flightInput.placeholder = dict['inputFlightPlaceholder'];
    } else if (lang === 'zh-TW' && flightInput.getAttribute('data-zh-ph')) {
      flightInput.placeholder = flightInput.getAttribute('data-zh-ph');
    }
  }

  // 3. 重繪地圖 POI 以更新地圖標註點擊彈窗
  if (typeof renderFloorPOIs === 'function' && typeof currentFloor !== 'undefined') {
    renderFloorPOIs(formatFloorName(currentFloor));
  }
}

// 自動綁定下拉選單監聽事件
document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  }
});