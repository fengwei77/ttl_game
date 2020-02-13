// import '@babel/polyfill';
// // import '@babel/standalone';
import * as Promise from '../node_modules/es6-promise-polyfill/promise.min.js';
import * as axios from '../node_modules/axios/dist/axios.min.js';
import * as EE3Timer  from '../node_modules/eventemitter3-timer/dist/eventemitter3-timer.min.js';
import * as PIXI from '../node_modules/pixi.js/dist/pixi.min.js';
import { gsap, ScrollToPlugin, Draggable, MotionPathPlugin } from "../node_modules/gsap/all.js";
import { Viewport } from '../node_modules/pixi-viewport/dist/viewport.js';
gsap.registerPlugin(ScrollToPlugin, Draggable, MotionPathPlugin);

let type = "WebGL";
let countdown = 60;

if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}
//Aliases
var opt = {
  backgroundColor: 0x1099bb,
  width:800,
  height: 700,
  antialias: true,    // default: false
  transparent: false, // default: false
  resolution: 1,       // default: 1
};


const app = new PIXI.Application(opt);
const loader = PIXI.Loader.shared;
const container = PIXI.Container;
let Sprite = PIXI.Sprite;
let gameScene;
//設置遊戲場景容器
gameScene = new container();
app.stage.addChild(gameScene);

const time = 2.0;
// document.body.appendChild(container);
document.body.appendChild(app.view);
const txt = new PIXI.Text( countdown, {fontFamily : 'Arial', fontSize: 24, fill : 0xffffff, align : 'center'});
txt.anchor.set(0.5);
txt.position.set(app.screen.width / 2, app.screen.height / 2);

app.stage.addChild(txt);

gsap.to(txt, {
  x: 500, duration: time, repeat: -1, yoyo: true,
});
let timer = new EE3Timer.Timer(1000);
timer.repeat = countdown;
timer.on('start', elapsed => { console.log('start'); });
timer.on('end', elapsed => {
  console.log('end', elapsed);
  txt.text = 'Countdown End';
});
timer.on('repeat', (elapsed, repeat) => {
  console.log('repeat', repeat);
  countdown --;
  txt.text = countdown;
});
timer.on('stop', elapsed => { console.log('stop'); });

timer.start();
app.ticker.add(() => {
  timer.timerManager.update(app.ticker.elapsedMS);
}, this);

//設定遊戲大小隨視窗大小改變
// onResize();
// window.onresize = onResize;

let wow, wow2, house ;
let state ;
let bg;
let texture_0, texture_1, texture_2;
loader.add([
  "../images/player.json"
]).load((loader, resources) => {

  //設置背景
  const frames = [];
  let i;
  let framekey = '../images/dr.png';
  let texture = PIXI.Texture.from(framekey);
  wow = new Sprite(texture);
  wow.y = 300;
  wow.x = 220;
  gameScene.addChild(wow);

  framekey = '../images/house.png';
  texture = PIXI.Texture.from(framekey);
  house = new Sprite(texture);
  house.y = 500;
  house.x = 220;
  gameScene.addChild(house);
  // for (i = 0; i < 3; i++) {
  //     let framekey =  i +'.png';
  //     texture = PIXI.Texture.from(framekey);
  //     frames.push(texture);
  // }
  framekey = '../images/0.png';
  texture_0 = PIXI.Texture.from('../images/0.png');
  texture_1 = PIXI.Texture.from('../images/1.png');
  texture_2 = PIXI.Texture.from('../images/2.png');
  wow2 = new Sprite(texture_0);
  // frames.push(texture);
  // wow2 = new PIXI.AnimatedSprite(frames);

  // set speed, start playback and add it to the stage
  // wow2.animationSpeed = 0.05;
  // wow2.play();
  wow2.vy = 0;//y軸加速度
  wow2.vx = 0;//x軸加速度

  //設置按鍵代碼
  let left= keyboard(37),
    up= keyboard(38),
    right= keyboard(39),
    down= keyboard(40);

  //左按下去之後
  left.press = function () {
    // console.log('left');
    //改變自己車子的加速度
    wow2.vx = -5;
    wow2.vy = 0;
    wow2.texture= texture_1;

  };
  //鬆開左鍵
  left.release = function () {

    wow2.texture= texture_0;
    //防止鍵位衝突
    if (!right.isDown && wow2.vy === 0) {
      wow2.vx = 0;
    }
  };

  //Up
  up.press = function () {
    wow2.vy = -5;
    wow2.vx = 0;

    wow2.texture= texture_0;
  };
  up.release = function () {
    if (!down.isDown && wow2.vx === 0) {
      wow2.vy = 0;
    }
  };

  //Right
  right.press = function () {
    wow2.texture= texture_2;
    wow2.vx = 5;
    wow2.vy = 0;
  };
  right.release = function () {

    wow2.texture= texture_0;
    if (!left.isDown && wow2.vy === 0) {
      wow2.vx = 0;
    }
  };

  //Down
  down.press = function () {
    wow2.vy = 5;
    wow2.vx = 0;
  };
  down.release = function () {
    if (!up.isDown && wow2.vx === 0) {
      wow2.vy = 0;
    }
  };

  //移動賽車
  gameScene.addChild(wow2);

  state = play;
  app.ticker.add(delta => gameLoop(delta));
});

loader.onComplete.add(loadProgressHandler);
loader.onProgress.add((e) => {
  console.log("Loading..." + Math.floor(e.progress) + "%");
});

function loadProgressHandler() {
  console.log(" loading ");
}


//按鍵方法
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}

function gameLoop(delta){
  //更新遊戲場景:
  state(delta);
}

function play(delta) {


  contain(wow2, {x: 64, y: 64, width: 800, height: 700});

  let explorerHit = false;
  if(hitTestRectangle(wow2, wow)) {
    explorerHit = true;
  }


  let collisionWay = hitObstacleRectangle(wow2, house);
  if(collisionWay== "left"){
    wow2.x += 5;
  }else if(collisionWay== "right"){
    wow2.x -= 5;
    wow2.y -= 5;
  }else if(collisionWay== "top"){
    wow2.y -= 5;
  }else if(collisionWay== "bottom"){
    wow2.x += 5;
    wow2.y += 5;
  }
  if(explorerHit) {
    console.log('hit it!!');
    explorerHit = false;
    collisionWay = hitObstacleRectangle(wow2, wow);
    if(collisionWay== "left"){
      wow2.x += 5;
    }else if(collisionWay== "right"){
      wow2.x -= 5;
      wow2.y -= 5;
    }else if(collisionWay== "top"){
      wow2.y -= 5;
    }else if(collisionWay== "bottom"){
      wow2.x += 5;
      wow2.y += 5;
    }
  }else {
    //移動賽車
    wow2.x += wow2.vx;
    wow2.y += wow2.vy;
  }

}

//判斷是否超出畫布
function contain(sprite, container) {

  let collision = undefined;

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    collision = "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    collision = "bottom";
  }

  return collision;
}

//碰撞檢測
function hitTestRectangle(r1, r2) {

  //設置需要的變數
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //初始化是否碰撞
  hit = false;

  //尋找精靈中心點
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //計算精靈一半的寬度和高度
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //計算相互之間的距離
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //計算xy重疊的數值
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  if(Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights){
    hit = true;
  }else{
    hit = false;
  }
  return hit;
}

//碰障礙物
function hitObstacleRectangle(r1, r2) {

  //設置需要的變數
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //初始化是否碰撞
  hit = false;

  //尋找精靈中心點
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //計算精靈一半的寬度和高度
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //計算相互之間的距離
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //計算xy重疊的數值
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;


  let collision = "";
  //console.log(vx+'-'+vy);
  if(Math.abs(vx) < combinedHalfWidths && Math.abs(vy) < combinedHalfHeights) {
    //Left
    if (vx> 0) {
      collision = "left";
    }

    //Top
    if (vy< 0) {
      collision = "top";
    }

    //Right
    if (vx< 0) {
      collision = "right";
    }

    //Bottom
    if (vy> 0) {
      collision = "bottom";
    }

  }

  console.log(collision);
  return collision;
}

function onResize() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  var scale = Math.min(w/860,h/540);
  app.view.style.left = (w-scale*860)/2 + "px";
  app.view.style.top = (h-scale*540)/2 + "px";
  app.view.style.width = scale*860 + "px";
  app.view.style.height = scale*540 + "px";
}
