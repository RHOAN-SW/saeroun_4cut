const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('./frontend/public/frames/custom_frame.png');
const png = PNG.sync.read(data);

const width = png.width;
const height = png.height;
const pixels = png.data;

let transparentX = new Set();
let transparentY = new Set();

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const a = pixels[idx + 3];
    if (a < 10) { // almost fully transparent
      transparentX.add(x);
      transparentY.add(y);
    }
  }
}

let tx = Array.from(transparentX).sort((a,b)=>a-b);
let ty = Array.from(transparentY).sort((a,b)=>a-b);

function group(arr) {
  if (arr.length === 0) return [];
  let groups = [];
  let current = [arr[0]];
  for(let i=1; i<arr.length; i++){
    if(arr[i] === arr[i-1] + 1) {
      current.push(arr[i]);
    } else {
      groups.push(current);
      current = [arr[i]];
    }
  }
  groups.push(current);
  return groups;
}

let xGroups = group(tx);
let yGroups = group(ty);

console.log("X groups:", xGroups.map(g => [g[0], g[g.length-1]]));
console.log("Y groups:", yGroups.map(g => [g[0], g[g.length-1]]));

let holes = [];
for (let yg of yGroups) {
  for (let xg of xGroups) {
    let cx = Math.floor((xg[0] + xg[xg.length-1])/2);
    let cy = Math.floor((yg[0] + yg[yg.length-1])/2);
    let idx = (width * cy + cx) << 2;
    if (pixels[idx+3] < 10) {
      holes.push({
        x: xg[0], y: yg[0],
        w: xg[xg.length-1] - xg[0] + 1,
        h: yg[yg.length-1] - yg[0] + 1
      });
    }
  }
}

console.log(holes);
