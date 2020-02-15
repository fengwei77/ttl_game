const show_debug = true;
const dev_grid_line = 1;

gsap.registerPlugin(gsap, MotionPathPlugin, EaselPlugin, PixiPlugin, TextPlugin, TweenMax, TimelineMax, Power2);
let WIDTH = 1024;
let HEIGHT = WIDTH * (10 / 16);
let extend_height = 150;
let germs_speed = 0.8;
let germs_speed_base = 1.5;
let countdown = 30;
let damage_ratio = 0.12;
let health_width = 300;
let health_width_in = 300;
let numberOfgerms_pop = 2;
let germs_origin_height = 1;
let germs_origin_fade_in = 0.2;
let germs_origin_fade_out = 1.2;
let bg_sprite, state, health, bg_container, germs_pop, all_obj_container;  //基礎設定
const germs_fade_out_set = 0.2;
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
  show_console('start');
});
timer.on('end', elapsed => {
  show_console('end', elapsed);
  timer_txt.text = '時間到';

  player_action = false;
  for (let i = 0; i < germs_pop.length; i++) {
    if (germs_pop[i].alpha > 0) {
      germs_pop[i].alpha  =  .5

      all_obj_container.destroy();
    }
  }
});
timer.on('repeat', (elapsed, repeat) => {
  // show_console('repeat', repeat);
  countdown--;
  timer_txt.text = countdown;
});
timer.on('stop', elapsed => {
  show_console('stop');
});
timer.start();
//>倒數計時
//細菌<
let germs = [];
// let germs_container = [];
let germs_container = ['container', new Container, new Container, new Container, new Container, new Container];
//>細菌

//軌道線<
const isometryPlane = [
  [new PIXI.Graphics(), new PIXI.Graphics()],
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
isometryPlane[0][1].moveTo(0, HEIGHT / 2);
isometryPlane[0][1].lineTo(WIDTH, HEIGHT / 2);
app.stage.addChild(isometryPlane[0][0]);
app.stage.addChild(isometryPlane[0][1]);
const isometryPlane_distance = [0, -200, -100, 0, 100, 200];
const isometryPlane_distance_to = [0, -500, -250, 0, 250, 500];
const point_arr = [];
for (let i = 1; i < isometryPlane.length; i++) {
  isometryPlane[i].lineStyle(2, 0xffffff, dev_grid_line);
  isometryPlane[i].moveTo(WIDTH / 2 + (isometryPlane_distance[i]), HEIGHT / 2);
  isometryPlane[i].lineTo(WIDTH / 2 + (isometryPlane_distance_to[i]), HEIGHT + extend_height);
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
innerBar.drawRect(0, 0, health_width, 20);
innerBar.endFill();
healthBar.addChild(innerBar);
let outerBar = new PIXI.Graphics();
outerBar.beginFill(0xFF3300);
outerBar.drawRect(0, 0, health_width_in, 20);
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
  germs_pop = [];
  bg_container = new Container;
  all_obj_container = new Container;
  show_console('health = 300');
  bg_sprite = new Sprite(loader.resources["bg_sprite"].texture);
  germs_origin_height = new Sprite(loader.resources["germs_1"].texture).height;
  show_console('germs_origin_height = ' + germs_origin_height);
  // action_gsap[i].pause();
  // action_gsap[i].play();

  app.stage.addChild(all_obj_container);
  //背景<
  bg_sprite.width = bg_sprite.width * (WIDTH / bg_sprite.width);
  bg_sprite.height = bg_sprite.height * (HEIGHT / bg_sprite.height);
  // show_console(bg_sprite.width);
  bg_sprite.x = 0;
  bg_sprite.y = 0;
  bg_container.addChild(bg_sprite);
  app.stage.addChild(bg_container);
  bg_container.zIndex = -1;
  // show_console(bg_container.width);
  // show_console(app.stage.width);
  bg_container.x = (WIDTH - bg_container.width) / 2;
  bg_container.y = (HEIGHT - bg_container.height) / 2;
  //>背景
  for (let i = 1; i < iso_path_array.length; i++) {
    point_arr[i] = isometryPlane[i].geometry.graphicsData;
    let this_points = point_arr[i][0].shape.points;
    for (let j = 0; j < this_points.length; j += 2) {
      // show_console(this_points[j]);
      iso_path_array[i].push({x: this_points[j], y: this_points[j + 1]});
      // show_console(iso_path_array[i]);
    }

  }
  //執行遊戲
  state = play;
  app.ticker.add(delta => gameLoop(delta));
}

let is_run = true;
let damage_sum = 0;
let damage = health_width * damage_ratio;

// if (is_run) {
//   for (let i = 1; i < action_gsap.length; i++) {
//     action_gsap[i].play();
//   }
// }
//偵測細菌位置
// for (let i = 1; i < action_gsap.length; i++) {
//   if (germs_container[i].y >= (HEIGHT + extend_height - 10)) {
//     // bleeding(damage);
//     break;
//     // show_console(germs_container[1].y);
//     // healthBar.outer.width -= health_width_in * damage_ratio;
//     // show_console('damage - ' + damage);
//     // damage_sum += damage;
//     // healthBar.outer.width -= damage;
//     // show_console('damage_sum - ' + damage_sum);
//     // // damage_sum = 0;
//     // break;
//   }
// }

function gameLoop(delta) {
  //更新遊戲場景:
  state(delta);
}

function play(delta) {
  // if(out_contain( germs_container[2], {x: 0, y: 0, width: WIDTH, height: HEIGHT + 200}) != undefined == health > 0 ){
  //   show_console('health = ' + (health-=1));
  // }
  if(player_action) {
    creatGerms();
  }

  removeGerms();
  // germs_pop.forEach(function(_germs) {
  //
  // });

  timer.timerManager.update(app.ticker.elapsedMS); //倒數計時

  //>細菌

}

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

function creatGerms() {
  //set 敵人
  // show_console('creatGerms' + germs_pop.length);
  //根据最大敌车数创建车子
  for (let i = 0; i < numberOfgerms_pop - germs_pop.length; i++) {
//細菌<
    let _germs_container = [];
    let _germs = [
      'sprite'
      , new Sprite(loader.resources["germs_1"].texture)
      , new Sprite(loader.resources["germs_2"].texture)
      , new Sprite(loader.resources["germs_3"].texture)
      , new Sprite(loader.resources["germs_4"].texture)
      , new Sprite(loader.resources["germs_5"].texture)
    ];
    // for (let i = 1; i < 6; i++) {
    let i = getRandomInt(1,5);
      _germs_container[i] = new Container;
      _germs[i].anchor.x = 0.5;
      _germs[i].anchor.y = 0.5;
      _germs[i].width = _germs[i].width * (WIDTH / bg_sprite.width) / 2;
      _germs[i].height = _germs[i].height * (HEIGHT / bg_sprite.height) / 2;
      // show_console('_germs[' + i + '].width-' + _germs[i].width);
      _germs[i].x = 0;
      _germs[i].y = 0;
      _germs_container[i].addChild(_germs[i]);
      all_obj_container.addChild(_germs_container[i]);
      _germs_container[i].zIndex = i + 10;
      _germs_container[i].x = (WIDTH - _germs_container[i].width) / 2 + (i * 10);
      _germs_container[i].y = (HEIGHT - _germs_container[i].height) / 2 + (i * 10);
      // show_console('germs -' + i);
      //細菌加入動作
      _germs_container[i].position.copyFrom(iso_path_array[i][0]);
      _germs_container[i].pivot.set(0.5);
      _germs_container[i].scale.set(germs_origin_fade_in);
      action_gsap[i] = gsap.to(_germs_container[i], {
        pixi: {scale: germs_origin_fade_out},
        duration: germs_speed * getRandomInt(1, 5) + germs_speed_base ,
        repeat: 1,
        motionPath: {
          path: iso_path_array[i]
        },
        ease: Power2.easeIn
      });
      //物件監聽動作
      addInteraction(_germs_container[i]);
      keys[i].press = function () {
        if (!rectsIntersect(_germs_container[i], block_wall)) {
          show_console('germs -' + i);
        }
      };
      germs_pop.push(_germs_container[i]);
      // show_console('germs_pop.push' + germs_pop.length)
      // show_console('germs_pop[i].y - ' + _germs_container[i].height);

    // }
  }


}

function removeGerms() {
  // show_console('removeGerms');
  // show_console('HEIGHT - ' + (HEIGHT + germs_origin_height));
  for (let i = 0; i < germs_pop.length; i++) {
    //
    // show_console('germs_pop[i] - ' + germs_pop[i].height);
    // show_console('germs_pop[i].y - ' + germs_pop[i].y);
    // show_console('HEIGHT = ' + HEIGHT);

    if (germs_pop[i].y > (HEIGHT) ) {
      // show_console('health_width = ' + health_width);
      // show_console('damage = ' + damage);
      // show_console('360 - health = ' + (health_width_in -= (health_width * damage_ratio)));
      // show_console('361 - health_width_in = ' + health_width_in);
      health_width_in = health_width_in - damage;
      if(health_width_in  > damage){
        healthBar.outer.width = health_width_in;
      }else{
        healthBar.outer.width = 0;

      }


      //刪除陣列
      germs_pop.splice(i, 1);
      //刪除物件
       // all_obj_container.removeChildAt(i);
    }
  }
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
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
