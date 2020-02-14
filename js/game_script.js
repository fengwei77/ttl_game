const show_debug = true;
const dev_grid_line = 1;

gsap.registerPlugin(gsap, MotionPathPlugin, EaselPlugin, PixiPlugin, TextPlugin, TweenMax, TimelineMax, Power2);
let WIDTH = 1024;
let HEIGHT = WIDTH * (10 / 16);
let countdown = 30;
let health = 10;
const germs_fade_out_set = 0.05;
show_console('WIDTH =' + WIDTH);
show_console('HEIGHT =' + HEIGHT);
let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}
show_console(type);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
//遊戲基本設定
let opt = {
  backgroundColor: 0x1099bb,
  width: WIDTH,
  height: HEIGHT,
  antialias: true,    // default: false
  transparent: false, // default: false
  autoResize: true,
  forceCanvas: true,
  resolution: window.devicePixelRatio || 1,
};
//player can click?
let player_action = true;
//遊戲場景
let app = new PIXI.Application(opt);
const loader = PIXI.Loader.shared;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;
app.stage.interactive = true;
app.stage.buttonMode = true;
app.stage.sortableChildren = true;
$('#gameContainer').append(app.view);
//遊戲元件
//倒數計時<
const timer_txt = new PIXI.Text(countdown, {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, align: 'center'});
timer_txt.anchor.set(0.5);
app.stage.addChild(timer_txt);
timer_txt.position.set(400, 30);
const timer = new EE3Timer.Timer(1000);
timer.repeat = countdown;
timer.on('start', elapsed => {
  console.log('start');
});
timer.on('end', elapsed => {
  console.log('end', elapsed);
  timer_txt.text = '時間到';

  player_action = false;
  for (let i = 1; i < action_gsap.length; i++) {
    if (germs[i].alpha > 0) {
      germs[i].alpha -= germs_fade_out_set;
    } else if (germs[i].alpha <= 0) {
      action_gsap[i].kill();
      germs_container[i].destroy();
    }
  }
});
timer.on('repeat', (elapsed, repeat) => {
  console.log('repeat', repeat);
  countdown--;
  timer_txt.text = countdown;
});
timer.on('stop', elapsed => {
  console.log('stop');
});
timer.start();
//>倒數計時
//細菌<
let germs = [];
//>細菌

//軌道線<
const isometryPlane = [
  [ new PIXI.Graphics(), new PIXI.Graphics()],
  new PIXI.Graphics(),
  new PIXI.Graphics(),
  new PIXI.Graphics(),
  new PIXI.Graphics(),
  new PIXI.Graphics(),
];
isometryPlane[0][0].lineStyle(5, 0xFF0000, dev_grid_line);
isometryPlane[0][0].moveTo(WIDTH / 2, 0);
isometryPlane[0][0].lineTo(WIDTH / 2, HEIGHT);
isometryPlane[0][1].lineStyle(5, 0x00FF00, dev_grid_line);
isometryPlane[0][1].moveTo(0, HEIGHT/2);
isometryPlane[0][1].lineTo( WIDTH, HEIGHT/2);
app.stage.addChild(isometryPlane[0][0]);
app.stage.addChild(isometryPlane[0][1]);
const isometryPlane_distance = [0, -200, -100, 0, 100, 200];
const isometryPlane_distance_to = [0, -500, -250, 0, 250, 500];
const point_arr = [];
for (let i = 1; i < isometryPlane.length; i++) {
  isometryPlane[i].lineStyle(2, 0xffffff, dev_grid_line);
  isometryPlane[i].moveTo(WIDTH / 2 + (isometryPlane_distance[i]), HEIGHT / 2);
  isometryPlane[i].lineTo(WIDTH / 2 + (isometryPlane_distance_to[i]), HEIGHT + 100);
  app.stage.addChild(isometryPlane[i]);
}
const iso_path_array = [[], [], [], [], [], []];
const action_gsap = [];
//>軌道線

//血量<
const healthBar = new PIXI.Container();
healthBar.position.set(20, 20)
app.stage.addChild(healthBar);
let innerBar = new PIXI.Graphics();
innerBar.beginFill(0x000000);
innerBar.drawRect(0, 0, 300, 20);
innerBar.endFill();
healthBar.addChild(innerBar);
let outerBar = new PIXI.Graphics();
outerBar.beginFill(0xFF3300);
outerBar.drawRect(0, 0, 300, 20);
outerBar.endFill();
healthBar.addChild(outerBar);
healthBar.outer = outerBar;
//>血量

//增加按鈕< Z X C V B
let keys = [
  'KEY_CODE',
  keyboard(90),
  keyboard(88),
  keyboard(67),
  keyboard(86),
  keyboard(66)
];
//>增加按鈕

let bg_container = new Container;
let germs_container = ['container', new Container, new Container, new Container, new Container, new Container];

// 遮擋區塊 -z50
const block_wall = new PIXI.Graphics();
block_wall.beginFill(0xFFFFFF, 0.5);
block_wall.drawRect(0, 0, WIDTH, HEIGHT * 0.75);
block_wall.endFill();
app.stage.addChild(block_wall);
block_wall.zIndex = 50;
// 載入圖片
loader
  .add('germs_1', "images/b_1.png")
  .add('germs_2', "images/b_2.png")
  .add('germs_3', "images/b_3.png")
  .add('germs_4', "images/b_4.png")
  .add('germs_5', "images/b_5.png")
  .add('bg_sprite', "images/bg_blue.png")
  .load(setup);

//加入場景
function setup() {
  let bg_sprite = new Sprite(loader.resources["bg_sprite"].texture);
  //細菌<
  germs = [
    'sprite'
    , new Sprite(loader.resources["germs_1"].texture)
    , new Sprite(loader.resources["germs_2"].texture)
    , new Sprite(loader.resources["germs_3"].texture)
    , new Sprite(loader.resources["germs_4"].texture)
    , new Sprite(loader.resources["germs_5"].texture)
  ];
  for (let i = 1; i < germs.length; i++) {
    germs[i].anchor.x = 0.5;
    germs[i].anchor.y = 0.5;
    germs[i].width = germs[i].width * (WIDTH / bg_sprite.width) / 2;
    germs[i].height = germs[i].height * (HEIGHT / bg_sprite.height) / 2;
    show_console(germs[2].width);
    germs[i].x = 0;
    germs[i].y = 0;
    germs_container[i].addChild(germs[i]);
    app.stage.addChild(germs_container[i]);
    germs_container[i].zIndex = i + 10;
    germs_container[i].x = (WIDTH - germs_container[i].width) / 2 + (i * 10);
    germs_container[i].y = (HEIGHT - germs_container[i].height) / 2 + (i * 10);
    show_console('germs -' + i);

    //物件監聽動作
    addInteraction(germs_container[i]);
    keys[i].press = function () {
      if (!rectsIntersect(germs_container[i], block_wall)) {
        show_console('germs -' + i);
      }
    };
  }
  for (let i = 1; i < iso_path_array.length; i++) {
    point_arr[i] = isometryPlane[i].geometry.graphicsData;
    let this_points = point_arr[i][0].shape.points;
    for (let j = 0; j < this_points.length; j += 2) {
      show_console(this_points[j]);
      iso_path_array[i].push({x: this_points[j], y: this_points[j + 1]});
      show_console(iso_path_array[i]);
    }
    //細菌加入動作
    germs_container[i].position.copyFrom(iso_path_array[i][0]);
    germs_container[i].pivot.set(0.5);
    germs_container[i].scale.set(0.2);

    action_gsap[i] = gsap.to(germs_container[i], {
      pixi: {scale: 2},
      duration: 0.5 * getRandomInt(3, 5),
      repeat: -1,
      motionPath: {
        path: iso_path_array[i]
      },
      ease: Power2.easeIn
    });
  }

  //>細菌

  //背景<
  bg_sprite.width = bg_sprite.width * (WIDTH / bg_sprite.width);
  bg_sprite.height = bg_sprite.height * (HEIGHT / bg_sprite.height);
  show_console(bg_sprite.width);
  bg_sprite.x = 0;
  bg_sprite.y = 0;
  bg_container.addChild(bg_sprite);
  app.stage.addChild(bg_container);
  bg_container.zIndex = -1;
  show_console(bg_container.width);
  show_console(app.stage.width);
  bg_container.x = (WIDTH - bg_container.width) / 2;
  bg_container.y = (HEIGHT - bg_container.height) / 2;
  //>背景

}

//執行遊戲
app.ticker.add((delta) => {
  timer.timerManager.update(app.ticker.elapsedMS); //倒數計時
  if (healthBar.outer.width > 0) {
    healthBar.outer.width -= 1;
  } else {
    healthBar.outer.width = 0;
    player_action = false;
    for (let i = 1; i < action_gsap.length; i++) {
      if (germs[i].alpha > 0) {
        germs[i].alpha -= germs_fade_out_set;
      } else if (germs[i].alpha <= 0) {
        action_gsap[i].kill();
        germs_container[i].destroy();
      }
    }
  }
});

//動作
function addInteraction(obj) {
  obj.interactive = true;
  obj.on('pointerdown', onClick);

}

//CLICK方法
function onClick() {
  if (!rectsIntersect(this, block_wall) && player_action) {
    show_console(this._zIndex);
  }
}

//感應區塊
function rectsIntersect(a, b) {
  let aBox = a.getBounds();
  let bBox = b.getBounds();
  return aBox.x + aBox.width > bBox.x &&
    aBox.x < bBox.x + bBox.width &&
    aBox.y + aBox.height > bBox.y &&
    aBox.y < bBox.y + bBox.height;
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
    if (event.keyCode === key.code && player_action) {
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

//FACEBOOK分享和授權判斷
//debug

show_console('jquery - ' + $().jquery);

function show_console(msg = '') {
  if (show_debug) {
    console.log(msg);
  }
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
