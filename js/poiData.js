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
    { id: "t2-aed-6", category: "sos", x: 49.5, y: 36.0, icon: "❤️‍🩹", name: "自動體外心臟電擊去顫器 (AED)", desc: "緊急救護設備" },
  
    {
      id: "f1-nursing-room-1",
      name: "哺集乳室 (北側)",
      category: "accessible",
      icon: "🍼",
      x: 44, // 👈 座標百分比 (x: 0~100)，請自行調整
      y: 30, // 👈 座標百分比 (y: 0~100)，請自行調整
      desc: "提供溫水、飲水機、尿布台與隱密哺乳空間"
    },
    {
      id: "f1-nursing-room-2",
      name: "哺集乳室 (南側)",
      category: "accessible",
      icon: "🍼",
      x: 47, // 👈 座標百分比，請自行調整
      y: 68, // 👈 座標百分比，請自行調整
      desc: "提供溫水、飲水機、尿布台與隱密哺乳空間"
    }
  
  ],

  "F2": [],

  "F3": [
  
    {
      id: "f3-buggy-service",
      name: "愛心車服務 (Buggy Service)",
      category: "accessible",
      icon: "🛺",
      x: 50, // 👈 座標百分比，請自行調整
      y: 10, // 👈 座標百分比，請自行調整
      desc: "提供高齡長者、行動不便旅客與孕婦之航廈內免費電動接駁車服務"
    },

    // ℹ️ 3 樓新增：報到大廳服務台
    {
      id: "f3-info-desk",
      name: "報到大廳服務台",
      category: "service",
      icon: "ℹ️",
      x: 50, // 👈 座標百分比，請自行調整
      y: 50, // 👈 座標百分比，請自行調整
      desc: "出境大廳諮詢、遺失物處理與無障礙博愛服務櫃檯"
    }
   

  ],

  "F4": [
    { id: "f4-lounge", category: "service", x: 60.0, y: 20.0, icon: "☕", name: "貴賓室區", desc: "航空公司與機場貴賓室" }
  ],

  "F5": [
    { id: "f5-deck", category: "service", x: 50.0, y: 50.0, icon: "📷", name: "觀景台", desc: "機場飛機起降觀景台與休閒商業區" }
  ]
};

// 💡 邏輯程式碼放在物件宣告花括號外
const checkinCounters = [
  { num: 6, x: 42.5, y: 28.5 },
  { num: 7, x: 42.5, y: 30.5 },
  { num: 8, x: 42.5, y: 34 },
  { num: 9, x: 42.5, y: 36 },
  { num: 10, x: 42.5, y: 40 },
  { num: 11, x: 42.5, y: 42 },
  { num: 12, x: 42.5, y: 46 },
  { num: 13, x: 42.5, y: 48 },
  { num: 14, x: 42.5, y: 52 },
  { num: 15, x: 42.5, y: 54 },
  { num: 16, x: 42.5, y: 58 },
  { num: 17, x: 42.5, y: 60 },
  { num: 18, x: 42.5, y: 63.5 },
  { num: 19, x: 42.5, y: 65.5 },
  { num: 20, x: 42.5, y: 70 },
  { num: 21, x: 42.5, y: 72 }
];

// 動態加入 6~21 號報到櫃檯至 3 樓 POI
checkinCounters.forEach(c => {
  floorPOIs["F3"].push({
    id: `f3-checkin-${c.num}`,
    name: `3F - ${c.num}號報到櫃檯`,
    category: "facility",
    icon: "🛫",
    x: c.x,
    y: c.y,
    desc: `出境報到大廳第 ${c.num} 號航空公司報到與託運櫃檯`
  });
});