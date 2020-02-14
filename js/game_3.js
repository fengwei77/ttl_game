// import '@babel/polyfill';
// import '@babel/standalone';
import $ from 'jquery';
window.$ = $;
import * as Promise from 'es6-promise-polyfill'
import * as axios from 'axios'
import * as EE3Timer  from 'eventemitter3-timer'
import * as PIXI from 'pixi.js';
import { gsap, ScrollToPlugin, Draggable, MotionPathPlugin, EaselPlugin, PixiPlugin, TextPlugin, TweenMax, TimelineMax, Power2 } from "gsap/all"
import { Viewport } from 'pixi-viewport';
import * as  Cull  from 'pixi-cull';
// var Cull = require('pixi-cull');
console.log($().jquery);
global.PIXI = PIXI;
require("pixi-projection");
gsap.registerPlugin(MotionPathPlugin,PixiPlugin,EaselPlugin);

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
//Aliases
var opt = {
  backgroundColor: 0x1099bb,
  width: 800,
  height: 700,
  antialias: false,    // default: false
  transparent: false, // default: false
  resolution: 1,       // default: 1
};


const time = 2.0;

const app = new PIXI.Application(opt);
// const graphics = new PIXI.Graphics(opt);
$('#gameContainer').append(app.view);
// document.getElementById('gameContainer').appendChild(app.view);

// create viewport
const viewport = new Viewport({
  screenWidth: app.view.offsetWidth,
  screenHeight: app.view.offsetHeight,
  worldWidth: window.innerWidth,
  worldHeight: window.innerHeight,
  interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
});
console.log('viewport');
console.log(viewport.getVisibleBounds());
console.log(app.screen.height);

const block_wall = new PIXI.Graphics();

// Rectangle
block_wall.beginFill(0xDE3249,0.2);
block_wall.drawRect(0, 200, 1000, 400);
block_wall.endFill();
// console.log(block_wall.getVisibleBounds());

//遠近身
const container_2d = new PIXI.projection.Container2d();
container_2d.position.set(app.screen.width / 2, app.screen.height);

const squareFar = new PIXI.Sprite(PIXI.Texture.WHITE);
squareFar.tint = 0x00ff00;
squareFar.factor = 1;
squareFar.anchor.set(0.5);
squareFar.position.set(app.screen.width / 2, 200);
app.stage.addChild(squareFar);

const tiling = new PIXI.projection.TilingSprite2d(PIXI.Texture.from('../images/bg-1.png'), app.screen.width, app.screen.height);
tiling.position.set(app.screen.width / 2, app.screen.height);
tiling.anchor.set(0.5, 1.0);
tiling.tint = 0x808080;


const surface = new PIXI.projection.Sprite2d(PIXI.Texture.from('../images/bg-1.png'));
surface.anchor.set(0.5, 1.0);
surface.width = app.screen.width;
surface.height = app.screen.height;
container_2d.addChild(surface);
app.stage.addChild(container_2d);

let pos = container_2d.toLocal(squareFar.position, undefined, undefined, undefined, PIXI.projection.TRANSFORM_STEP.BEFORE_PROJ);
pos.y = -pos.y;
pos.x = -pos.x;
container_2d.proj.setAxisY(pos, -2);

const doctor = new PIXI.projection.Sprite2d(PIXI.Texture.from('../images/dr.png'));
doctor.anchor.set(0.5, 1.0);
doctor.factor = 1;
doctor.proj.affine = PIXI.projection.AFFINE.AXIS_X;
doctor.anchor.set(0.5, 0.0);
doctor.position.set(-app.screen.width / 1, -app.screen.height / 1);
doctor.scale.set(1);

const doctor_2 = new PIXI.projection.Sprite2d(PIXI.Texture.from('../images/dr.png'));
doctor_2.anchor.set(0.5, 1.0);
doctor_2.factor = 1;
doctor_2.proj.affine = PIXI.projection.AFFINE.AXIS_X;
doctor_2.anchor.set(0.5, 0.0);
doctor_2.position.set(-app.screen.width / 1, -app.screen.height / 1);
doctor_2.scale.set(1);

viewport.addChild(doctor);
viewport.addChild(doctor_2);
//
// app.stage.addChild(doctor);
// app.stage.addChild(doctor_2);

const squarePlane = new PIXI.projection.Sprite2d(PIXI.Texture.WHITE);
squarePlane.tint = 0xff0000;
squarePlane.factor = 1;
squarePlane.proj.affine = PIXI.projection.AFFINE.AXIS_X;
squarePlane.anchor.set(0.5, 0.0);
squarePlane.position.set(0, -app.screen.height / 1);
squarePlane.width = 15;
container_2d.addChild(squarePlane);





const loader = PIXI.Loader.shared;
const container = PIXI.Container;

let Sprite = PIXI.Sprite;
let gameScene;
//設置遊戲場景容器
gameScene = new container();
gameScene.rotation = 0;
app.stage.addChild(gameScene);
let state;
loader.add('germ_1', "../images/germ_1.png").load(setup);
// loader.onProgress.add((loader) => {
//   console.log(loader.progress);
// });

app.stage.addChild.interactive = true;
app.stage.addChild.buttonMode = true;

//畫線
let isometryPlane_1 = new PIXI.Graphics();
isometryPlane_1.lineStyle(2, 0xffffff,1);
isometryPlane_1.moveTo(330, 400);
isometryPlane_1.lineTo(100, 800);
app.stage.addChild(isometryPlane_1);
let isometryPlane_2 = new PIXI.Graphics();
isometryPlane_2.lineStyle(2, 0xffffff,1);
isometryPlane_2.moveTo(430, 400);
isometryPlane_2.lineTo(250, 800);
app.stage.addChild(isometryPlane_2);


console.log(viewport.children.length);
const cull = new Cull.Simple();
cull.addList(viewport.children);
cull.cull(viewport.getVisibleBounds());
console.log( 'length 1 -> ' + viewport.children.length);
// cull.cull(viewport.getVisibleBounds());
// console.log(viewport.dirty);

let point_arr_1 = isometryPlane_1.geometry.graphicsData ;
let point_arr_2 = isometryPlane_2.geometry.graphicsData ;

let values_1 = [];
let values_2 = [];

addInteraction(squarePlane);
addInteraction(squareFar);
addInteraction(doctor);
addInteraction(doctor_2);

let key_z= keyboard(90),
  key_x= keyboard(88),
  key_c= keyboard(66),
  key_v= keyboard(67),
  key_b= keyboard(86);

//左按下去之後
key_z.press = function () {
  if(!rectsIntersect(doctor, block_wall)){
    console.log('click');
    console.log( 'length click -> ' + viewport.children.length);
   // cull.cull(viewport.getVisibleBounds());
    console.log(viewport.dirty);

  }

};
//鬆開左鍵
key_z.release = function () {

};

function addInteraction(obj) {
  obj.interactive = true;
  obj
    .on('pointerdown', onClick)
    .on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove);

}

function setup() {

  const germ_1 = new Sprite(
    loader.resources["germ_1"].texture
  );
  gsap.to(germ_1, {
    y: 800, duration: time, repeat: -1, yoyo: false,
  });
  germ_1.x = 20;
  germ_1.y = 20;
  germ_1.width = 100;
  germ_1.height = 75;

  gameScene.addChild(germ_1);
  let this_points = point_arr_1[0].shape.points;
  // values_1.push({ x: 500, y: 200 });
  for (let i = 0; i < this_points.length; i += 2) {
    values_1.push({ x: this_points[i], y: this_points[i+1] });
  }

  this_points = point_arr_2[0].shape.points;
  // values_1.push({ x: 500, y: 200 });
  for (let i = 0; i < this_points.length; i += 2) {
    values_2.push({ x: this_points[i], y: this_points[i+1] });
  }

  doctor.position.copyFrom(values_1[0]);
  doctor.anchor.set(0.5);
  doctor.pivot.set(0.5);
  doctor.scale.set(0.2);

  doctor_2.position.copyFrom(values_2[0]);
  doctor_2.anchor.set(0.5);
  doctor_2.pivot.set(0.5);
  doctor_2.scale.set(0.2);


  gsap.to(doctor, {
    pixi: { scale: 2.2},
    duration: 2.8,
    repeat: 0,
    motionPath:{
      path: values_1
    },
    ease: Power2.easeIn
  });
  gsap.to(doctor_2, {
    pixi: { scale: 2.2},
    duration: 2.8,
    repeat: 0,
    motionPath:{
      path: values_2
    },
    ease: Power2.easeIn
  });



  app.stage.addChild(viewport);
  app.stage.addChild(block_wall);


  app.ticker.add((delta) => {
     const pos = container_2d.toLocal(squareFar.position, undefined, undefined, undefined, PIXI.projection.TRANSFORM_STEP.BEFORE_PROJ);
    // need to invert this thing, otherwise we'll have to use scale.y=-1 which is not good
    pos.y = -pos.y;
    pos.x = -pos.x;
    container_2d.proj.setAxisY(pos, -squareFar.factor);

    tiling.tileScale.copyFrom(surface.scale);
    // dont overflow tilePosition, shaders will have less precision
    tiling.tilePosition.x = (tiling.tilePosition.x + delta) % tiling.texture.width;
    // sync container proj and tiling inside proj
    tiling.tileProj.setAxisY(pos, -squareFar.factor);

    squarePlane.proj.affine = squarePlane.factor
      ? PIXI.projection.AFFINE.AXIS_X : PIXI.projection.AFFINE.NONE;

console.log(viewport.dirty);
    if (viewport.dirty)
    {
      cull.cull(viewport.getVisibleBounds());
      viewport.dirty = false;
    }

    //離開block
    // console.log( hitTestRectangle(doctor, block_wall) );
    // console.log( rectsIntersect(doctor, block_wall) );


  });
  // console.log( values_1);
}


function onClick() {
  if(!rectsIntersect(doctor, block_wall)){
    console.log('click');
  }
}

function play(delta) {
  // contain(germ_1, {x: 64, y: 64, width: 800, height: 700});

}


function onDragStart(event) {
  const obj = event.currentTarget;
  obj.dragData = event.data;
  obj.dragging = 1;
  obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
  obj.dragObjStart = new PIXI.Point();
  obj.dragObjStart.copyFrom(obj.position);
  obj.dragGlobalStart = new PIXI.Point();
  obj.dragGlobalStart.copyFrom(event.data.global);
  event.stopPropagation();
}

function onDragEnd(event) {
  const obj = event.currentTarget;
  if (!obj.dragging) return;
  if (obj.dragging === 1) {
    toggle(obj);
  } else {
    snap(obj);
  }

  obj.dragging = 0;
  obj.dragData = null;

  event.stopPropagation();
  // set the interaction data to null
}

function onDragMove(event) {
  const obj = event.currentTarget;
  if (!obj.dragging) return;
  event.stopPropagation();
  const data = obj.dragData; // it can be different pointer!
  if (obj.dragging === 1) {
    // click or drag?
    if (Math.abs(data.global.x - obj.dragGlobalStart.x)
      + Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3) {
      // DRAG
      obj.dragging = 2;
    }
  }
  if (obj.dragging === 2) {
    const dragPointerEnd = data.getLocalPosition(obj.parent);
    // DRAG
    obj.position.set(
      obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x),
      obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y),
    );
  }
}

// changes axis factor
function toggle(obj) {
  // if (obj !== doctor) {
  obj.factor = 1.0 - obj.factor;
  obj.tint = obj.factor ? 0xff0033 : 0x00ff00;
  // }
}

function snap(obj) {
  if (obj === doctor) {
    obj.position.set(0);
  } else if (obj === squarePlane) {
    // plane bounds
    obj.position.x = Math.min(Math.max(obj.position.x, -app.screen.width / 2 + 10), app.screen.width / 2 - 10);
    obj.position.y = Math.min(Math.max(obj.position.y, -app.screen.height + 10), 10);
  } else {
    // far
    obj.position.x = Math.min(Math.max(obj.position.x, 0), app.screen.width);
    obj.position.y = Math.min(Math.max(obj.position.y, 0), app.screen.height);
  }
}

function rectsIntersect(a, b) {
  let aBox = a.getBounds();
  let bBox = b.getBounds();

  return aBox.x + aBox.width > bBox.x &&
    aBox.x < bBox.x + bBox.width &&
    aBox.y + aBox.height > bBox.y &&
    aBox.y < bBox.y + bBox.height;
}

function hitTestRectangle(r1, r2) {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  hit = false;
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }
  return hit;
};


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
