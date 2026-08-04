// js/poiData.js - 依樓層分類之標點資料庫
const floorPOIs = {
  "B2": [
    { id: "b2-mrt", category: "transport", x: 45.2, y: 60.5, icon: "🚆", name: "桃園機場捷運站", desc: "可搭乘直達車或普通車前往台北/中壢" },
    { id: "b2-food", category: "food", x: 30.0, y: 40.0, icon: "🍔", name: "美食廣場", desc: "提供各式餐飲與休息區" }
  ],

  "F1": [
    // --- 🧳 1~6號行李轉盤 (中央縱向一字排開) ---
    { id: "t2-baggage-1", category: "baggage", x: 51.5, y: 40.0, icon: "🧳", name: "1號行李轉盤", desc: "入境旅客行李提領區" },
    { id: "t2-baggage-2", category: "baggage", x: 51.5, y: 44.5, icon: "🧳", name: "2號行李轉盤", desc: "入境旅客行李提領區" },
    { id: "t2-baggage-3", category: "baggage", x: 51.5, y: 49.0, icon: "🧳", name: "3號行李轉盤", desc: "入境旅客行李提領區" },
    { id: "t2-baggage-4", category: "baggage", x: 51.5, y: 53.5, icon: "🧳", name: "4號行李轉盤", desc: "入境旅客行李提領區" },
    { id: "t2-baggage-5", category: "baggage", x: 51.5, y: 58.0, icon: "🧳", name: "5號行李轉盤", desc: "入境旅客行李提領區" },
    { id: "t2-baggage-6", category: "baggage", x: 51.5, y: 62.5, icon: "🧳", name: "6號行李轉盤", desc: "入境旅客行李提領區" },

    // --- 🧳 7B / 8A 行李轉盤 (位於右側獨立區域) ---
    { id: "t2-baggage-7b", category: "baggage", x: 55.5, y: 42.5, icon: "🧳", name: "7B行李轉盤", desc: "入境旅客行李提領區" },
    { id: "t2-baggage-8a", category: "baggage", x: 55.5, y: 58.0, icon: "🧳", name: "8A行李轉盤", desc: "入境旅客行李提領區" },

    // --- 🏥 醫療中心 (落在右下角灰色邊界處) ---
    { id: "t2-medical-center", category: "sos", x: 48.2, y: 72.5, icon: "🏥", name: "醫療中心", desc: "提供緊急醫療與身體不適諮詢" },

    // --- ❤️‍🩹 AED (嚴格依據原圖 6 個位置佈局) ---
    { id: "t2-aed-1", category: "sos", x: 40.8, y: 40.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" },
    { id: "t2-aed-2", category: "sos", x: 56.0, y: 33.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" },
    { id: "t2-aed-3", category: "sos", x: 54.0, y: 49.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" },
    { id: "t2-aed-4", category: "sos", x: 44.0, y: 64.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" },
    { id: "t2-aed-5", category: "sos", x: 55.0, y: 70.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" },
    { id: "t2-aed-6", category: "sos", x: 49.5, y: 36.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" }
  ],

  "F2": [],

  "F3": [
    { id: "f3-checkin", category: "service", x: 50.0, y: 45.0, icon: "🛫", name: "報到櫃檯", desc: "出境航班報到與行李托運" }
  ],

  "F4": [
    { id: "f4-lounge", category: "service", x: 60.0, y: 20.0, icon: "☕", name: "貴賓室區", desc: "航空公司與機場貴賓室" }
  ],

  "F5": [
    { id: "f5-deck", category: "service", x: 50.0, y: 50.0, icon: "📷", name: "觀景台", desc: "機場飛機起降觀景台與休閒商業區" }
  ]
};