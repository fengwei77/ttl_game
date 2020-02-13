const show_debug = true;
gsap.registerPlugin(MotionPathPlugin,PixiPlugin,EaselPlugin);
const WIDTH = 1200;
const HEIGHT = WIDTH * (9/16);
show_console('WIDTH ='+ WIDTH);
show_console('HEIGHT ='+ HEIGHT);

let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
  type = "canvas"
}
show_console(type);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
//遊戲基本設定
const opt = {
  backgroundColor: 0x1099bb,
  width: WIDTH,
  height: HEIGHT,
  antialias: true,    // default: false
  transparent: false, // default: false
  autoResize: true,
  forceCanvas: true,
  resolution: window.devicePixelRatio || 1,
};
//遊戲場景
const app = new PIXI.Application(opt);
const loader = PIXI.Loader.shared;
const Sprite = PIXI.Sprite;
const Container =  PIXI.Container;
app.stage.interactive = true;
app.stage.buttonMode = true;
app.stage.sortableChildren = true;
$('#gameContainer').append(app.view);
//遊戲元件
// 向下延伸線條
const isometryPlane = [
  null,
  new PIXI.Graphics(),
  new PIXI.Graphics(),
  new PIXI.Graphics(),
  new PIXI.Graphics(),
  new PIXI.Graphics(),
];
const isometryPlane_distance = [0, -200, -100, 0, 100, 200];
const isometryPlane_distance_to = [0, -500, -250, 0, 250, 500];
const point_arr = [];
const point_rail_arr = [];
const point_rail_arr_value = [];
  //軌道線<
  for(let i = 1 ; i < isometryPlane.length ; i++) {
    isometryPlane[i].lineStyle(2, 0xffffff,1);
    isometryPlane[i].moveTo(WIDTH/2 + ( isometryPlane_distance[i]  ), HEIGHT/2);
    isometryPlane[i].lineTo(WIDTH/2 + ( isometryPlane_distance_to[i]  ), HEIGHT);
    app.stage.addChild(isometryPlane[i]);
  }
  const iso_path_array = [[],[],[],[],[],[]];
//>軌道線
let bg_container = new Container;
let germs_container = ['container', new Container, new Container, new Container, new Container, new Container];
let germs_1_container = new Container;
let germs_2_container = new Container;
let germs_3_container = new Container;
let germs_4_container = new Container;
let germs_5_container = new Container;
// 遮擋區塊 -z50
const block_wall = new PIXI.Graphics();
block_wall.beginFill(0xFFFFFF,0.5);
block_wall.drawRect(0, 0, WIDTH, HEIGHT*0.85);
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
//遊戲動作
//點擊效果

//加入場景
// let values_1 = [];
function setup() {
   let bg_sprite = new Sprite(loader.resources["bg_sprite"].texture);
  //細菌<
  let germs = [
    'sprite'
    ,  new Sprite(loader.resources["germs_1"].texture)
    ,  new Sprite(loader.resources["germs_2"].texture)
    ,  new Sprite(loader.resources["germs_3"].texture)
    ,  new Sprite(loader.resources["germs_4"].texture)
    ,  new Sprite(loader.resources["germs_5"].texture)
  ];
  for(let i = 1 ; i < germs.length ; i++){
    germs[i].width = germs[i].width * (WIDTH/bg_sprite.width) / 2;
    germs[i].height = germs[i].height * (HEIGHT/bg_sprite.height) / 2;
    show_console(germs[2].width );
    germs[i].x = 0;
    germs[i].y = 0;
    germs_container[i].addChild(germs[i]);
    app.stage.addChild(germs_container[i]);
    germs_container[i].zIndex = i + 10;
    germs_container[i].x = (WIDTH - germs_container[i].width) / 2 + (i * 10);
    germs_container[i].y = (HEIGHT - germs_container[i].height) / 2 + (i * 10);
    show_console('germs -' +  i );
  }
  for (let i = 1; i < iso_path_array.length; i++) {
    point_arr[i] = isometryPlane[i].geometry.graphicsData ;
    let this_points =  point_arr[i][0].shape.points;
    for (let j = 0; j < this_points.length; j+= 2) {
      show_console(this_points[j]);
      iso_path_array[i].push({ x: this_points[j], y: this_points[j+1] });
      show_console(iso_path_array[i]);
    }
    //細菌加入動作
    germs_container[i].position.copyFrom(iso_path_array[i][0]);
    germs_container[i].anchor.set(0.5);
    germs_container[i].pivot.set(0.5);
    germs_container[i].scale.set(0.2);
  }
  //>細菌

  //背景<
  bg_sprite.width = bg_sprite.width * (WIDTH/bg_sprite.width);
  bg_sprite.height = bg_sprite.height * (HEIGHT/bg_sprite.height);
  show_console(bg_sprite.width );
  bg_sprite.x = 0;
  bg_sprite.y = 0;
  bg_container.addChild(bg_sprite);
  app.stage.addChild(bg_container);
  bg_container.zIndex = -1;
  show_console(bg_container.width );
  show_console(  app.stage.width );
  bg_container.x = (WIDTH - bg_container.width) / 2;
  bg_container.y = (HEIGHT - bg_container.height) / 2;
  //>背景

}
//執行遊戲
//FACEBOOK分享和授權判斷
//debug

show_console('jquery - ' + $().jquery);
function show_console(msg = '') {
  if (show_debug) {
    console.log(msg);
  }
}
