// 機場地圖節點資料 (範例資料，後續可針對你的實際座標調整)
const mapNodes = [
  { id: "node_b2_mrt", name: "B2 捷運站", floor: "B2", x: 100, y: 150 },
  { id: "node_f1_info", name: "1F 服務台", floor: "F1", x: 200, y: 200 },
  { id: "node_f1_gate", name: "1F 出境大廳", floor: "F1", x: 350, y: 200 },
  { id: "node_f2_dutyfree", name: "2F 免稅店", floor: "F2", x: 300, y: 150 },
  { id: "node_f3_food", name: "3F 美食街", floor: "F3", x: 250, y: 180 }
];

// Dijkstra 算最短路徑
function findShortestPath(graph, startNode, endNode) {
  let distances = {};
  let prev = {};
  let pq = new Set();

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    prev[node] = null;
    pq.add(node);
  });

  distances[startNode] = 0;

  while (pq.size > 0) {
    let currNode = [...pq].reduce((minNode, node) => 
      distances[node] < distances[minNode] ? node : minNode
    );

    if (currNode === endNode) break;
    pq.delete(currNode);

    if (graph[currNode]) {
      Object.keys(graph[currNode]).forEach(neighbor => {
        let alt = distances[currNode] + graph[currNode][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          prev[neighbor] = currNode;
        }
      });
    }
  }

  let path = [];
  let u = endNode;
  while (u) {
    path.unshift(u);
    u = prev[u];
  }
  return path;
}