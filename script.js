const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const colors = [
  "#b22222", // firebrick
  "#228b22", // forest green
  "#daa520", // goldenrod
  "#dda0dd", // plum
  "#ff69b4", // hotpink
  "#add8e6", // light blue
  "#66cdaa", // medium aguamarine
  "#ba55d3", // medium orchid
  "#663399", // rebecca purple
  "#8b2500", // OrangeRed4
];

const towerOffsets = {
  0: 0,
  1: 210,
  2: 420,
}

let midi = null;
let output = null;

navigator.requestMIDIAccess({sysex: true}).then( (midiAccess) => {
    midi = midiAccess;
    output = midi.outputs.values().next().value;
    midi.onstatechange = (e) => {
        console.log(e);
    }
    console.log(midi);
    console.log(output);
});

const solveButton = document.getElementById("solve");
const iiVIButton = document.getElementById("iiVI");
const resetButton = document.getElementById("reset");
const towers = [[], [], []];
let root = 466.16;
let fourth = Math.pow(2, 5/12) * root;
let timer;
let noteStream = [];
let iiV = [0, 1, 2];
let callStack = [];
let clickedTower = -1;

const drawCanvas = () => {
  ctx.clearRect(0, 0, 650, 500);
  ctx.shadowColor = 'black';

  let base = {
    color: "#000",
    x: 0,
    y: 350,
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
    y: 50,
    width: 10,
    height: 300,
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

const drawTower = (tower = 0) => {
  let discs = [];
  let root = 1000;
  for (var i = 0; i < 10; i++) {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = getPitch(tower, i);
    osc.connect(gain);
    gain.gain.value = 0.08;
    gain.connect(audioCtx.destination);
    osc.start();
    discs[i] = {
      size: i,
      x: i*7.5 + towerOffsets[tower],
      y: 340 - i*10,
      width: 200 - i*15,
      height: 10,
      color: colors[i],
      osc: osc,
      gain: gain,
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
    disc.y = 340 - 10*toTow.length;
    disc.osc.frequency.value = getPitch(to, disc.size);
    toTow.push(disc);
  }
  clickedTower = -1;
  redraw();
}

const fakeMove = (from, to) => {
  let fromTow = dumTows[from];
  let toTow = dumTows[to];
  if(from !== -1 && fromTow.length > 0 && (toTow.length === 0 || fromTow[fromTow.length - 1].size > toTow[toTow.length - 1].size))
  { // okay to move!
    let disc = fromTow.pop();
    //disc.x = disc.size*7.5 + towerOffsets[to];
    //disc.y = 340 - 10*toTow.length;
    //disc.osc.frequency.value = getPitch(to, disc.size);
    toTow.push(disc);
  }
}

const getPitch = (tower, partial) => {
  let pitch;
  switch (tower) {
    case 0: // ii
      pitch = root / (10 - partial);
      break;
    case 1: // V
      pitch = root / 8 * (partial + 1);
      break;
    case 2: // I
    pitch = fourth / 16 * (partial + 1);
      break;
  }
  return pitch;
}

const killDiscs = () => {
  towers.forEach((tower) => {
    tower.forEach((disk) => {
      disk.osc.stop();
      disk.osc.disconnect();
      disk.osc = null;
      disk.gain.disconnect();
      disk.gain = null;
    })
    tower.length = 0;
  })
}

document.addEventListener("click", function(e) {
  let x = e.clientX - canvas.offsetLeft;
  let y = e.clientY - canvas.offsetTop;
  let newTow = -1;
  if (y > 50 && y < 400 && x < 620 && x > 15) {
    if (x > 400) {
      newTow = 2;
    } else if (x > 200) {
      newTow = 1;
    } else if (x > 0) {
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

let dumTows = [
  [
    {
      size: 0,
    },
    {
      size: 1,
    },
    {
      size: 2,
    },
    {
      size: 3,
    },
    {
      size: 4,
    },
    {
      size: 5,
    },
    {
      size: 6,
    },
    {
      size: 7,
    },
    {
      size: 8,
    },
    {
      size: 9,
    },
  ],
  [],
  [],
];
const solve = () => {
  callStack = [];
  hanoi(10, 0, 2, 1);
  timer = setInterval(animateMove, 1200); // Start animation;
}

const writeStream = () => {
  let blob = new Blob([JSON.stringify(noteStream)], {type: "text/plain;charset=utf-8"});
  let url = URL.createObjectURL(blob);
  window.location.assign(url);
}

const noteOn = [
0x90,
0x91,
0x92,
0x93,
0x94,
0x95,
0x96,
0x97,
0x98,
0x99,
];

const noteOff = [
0x80,
0x81,
0x82,
0x83,
0x84,
0x85,
0x86,
0x87,
0x88,
0x89,
];

/*
const noteNum = [
[70, 34, 27],
[58, 46, 39],
[51, 53, 46],
[46],
[],
[],
[],
[],
[],
[],
];
*/

const pitchToNote = (pitch) => {
    Math.round(Math.log(pitch/440.0)/Math.log2() * 1200);
}

const midiSpew = (portId) => {
    // Status Byte 1xxx CCCC
    // Data Byte   0PPP PPPP // pitch
    // Data Byte   0VVV VVVV velocity
    // Note on 1001   0x90
    // Note off 1000  0x80
    let note = noteStream.shift();
    let pitch = pitchToNote(getPitch(note.partial, note.dst));
    let noteOnMsg = [noteOn[note.partial], pitch, 0x7f];
    console.log(noteOn[note.partial], pitch);
    output.send(noteOnMsg);
    let noteOffMsg = [noteOff[note.partial], pitch, 0x7f];
    output.send(noteOffMsg, window.performance.now() + 800.0);
    console.log(noteOff[note.partial], pitch);
}

solveButton.addEventListener("click", function(e){
  solve();
})

iiVIButton.addEventListener("click", function() {
  timer = setInterval(twoFiveOne, 1000);
})

resetButton.addEventListener("click", function() {
  reset();
})

const reset = () => {
  clearInterval(timer);
  killDiscs();
  drawCanvas();
  drawTower(0);
}

const hanoi = (n, src, dst, aux) => {
  let dumTow = dumTows[dst];
  if (n === 1 ) {
    callStack.push([src, dst]);
    fakeMove(src, dst);
    noteStream.push({
      partial: dumTow[dumTow.length - 1].size,
      src,
      dst,
    })
  } else {
    hanoi(n-1, src, aux, dst);
    callStack.push([src, dst]);
    fakeMove(src, dst);
    noteStream.push({
      partial: dumTow[dumTow.length - 1].size,
      src,
      dst,
    })
    hanoi(n-1, aux, dst, src);
  }
}

const animateMove = () => {
  if (callStack.length > 0) {
    let move = callStack.shift();
    moveDisc(move[0], move[1]);
    midiSpew();
 } else {
   clearInterval(timer);
 }
}

const twoFiveOne = () => {
  if (iiV.length > 0 ){
    killDiscs();
    drawCanvas();
    drawTower(iiV.shift());
  } else {
    clearInterval(timer);
    reset();
    iiV = [0, 1, 2];
}
}
drawCanvas();
drawTower(0);
