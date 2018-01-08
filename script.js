const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const colors = [
  "#900",
  "#011",
  "#022",
  "#303",
  "#111",
  "#511",
  "#641",
  "#161",
  "#318",
  "#771",
];

const towerOffsets = {
  0: 0,
  1: 210,
  2: 420,
}

const solveButton = document.getElementById("solve");
const root = 1000;
const towers = [[], [], []];
let clickedTower = -1;
const drawCanvas = () => {
  ctx.clearRect(0, 0, 1000, 1200);
  ctx.shadowColor = 'black';

  let base = {
    color: "#000",
    x: 0,
    y: 500,
    width: 620,
    height: 50,
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  let pegs = {
    color: "#033",
    x: 0,
    y: 150,
    width: 10,
    height: 350,
    draw() {
      ctx.fillStyle = this.color;
      towers.forEach((tower, i) => {
        if(i === clickedTower) {
          ctx.shadowBlur = 10;
        }
        ctx.fillRect(this.x + 95 + towerOffsets[i], this.y, this.width, this.height);
        ctx.shadowBlur = 0;
      });
    }
  }

  base.draw();
  pegs.draw();
}

drawCanvas();

const drawTower = (tower = 0) => {
  let discs = [];
  let root = 1000;
  for (var i = 0; i < 10; i++) {
    let osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = root / (i+1);
    osc.connect(audioCtx.destination);
    osc.start();
    discs[i] = {
      size: i,
      x: i*7.5 + towerOffsets[tower],
      y: 490 - i*10,
      width: 200 - i*15,
      height: 10,
      color: colors[i],
      osc: osc,
      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
      }
    }
    discs[i].draw();
    towers[tower] = discs;
  }
}

const redraw = () => {
  drawCanvas();
  towers.forEach( function(tower, ind){
    tower.forEach( function(disc) {
      if(ind === clickedTower) {
        ctx.shadowBlur = 10;
      }
      disc.draw();
    })
  })
}

const moveDisc = (from, to) => {
  let fromTow = towers[from];
  let toTow = towers[to];
  if(from !== -1 && fromTow.length > 0 && (toTow.length === 0 || fromTow[fromTow.length - 1].size > toTow[toTow.length - 1].size))
  { // okay to move!
    let disc = fromTow.pop();
    disc.x = disc.size*7.5 + towerOffsets[to];
    disc.y = 490 - 10*toTow.length;
    disc.osc.frequency.value = getPitch(to, disc.size);
    toTow.push(disc);
  } else {
    console.log("fail: ", fromTow, toTow);
  }
  clickedTower = -1;
  redraw();
}

const getPitch = (tower, partial) => {
  let pitch;
  switch (tower) {
    case 0:
      pitch = root / (partial + 1);
      break;
    case 1:
      pitch = root + partial;
      break;
    case 2:
    pitch = root * (partial + 1);
      break;
  }
  return pitch;
}

document.addEventListener("click", function(e) {
  let x = e.clientX;
  let y = e.clientY;
  let newTow = -1;
  if (y > 160 && y < 500 && x < 620 && x > 15) {
    if (x > 450) {
      newTow = 2;
    } else if (x > 230) {
      newTow = 1;
    } else if (x > 15) {
      newTow = 0;
    }
    let newTowerDiscs = towers[newTow];
    if (clickedTower === -1 && newTowerDiscs.length > 0 ) {
      clickedTower = newTow;
      redraw();
    } else if (clickedTower !== newTow) {
      moveDisc(clickedTower, newTow);
    }
  }
});
let callStack = [];
let timer;
const solve = () => {
  callStack = [];
  hanoi(10, 0, 2, 1);
  timer = setInterval(animateMove, 300); // Start animation;
}

solveButton.addEventListener("click", function(e){
  solve();
})

drawTower();

const hanoi = (n, src, dst, aux) => {
  if (n === 1 ) {
    callStack.push([src, dst]);
  } else {
    hanoi(n-1, src, aux, dst);
    callStack.push([src, dst]);
    hanoi(n-1, aux, dst, src);
  }
}

const animateMove = () => {
  if (callStack.length > 0) {
    let move = callStack.shift();
    moveDisc(move[0], move[1]);
 } else {
   clearInterval(timer);
 }
}
