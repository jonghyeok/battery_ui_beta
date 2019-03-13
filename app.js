const gui = require('gui');
const path = require('path');
const si = require('systeminformation');
const notifier = require('node-notifier');

let p = null;
let battery_info = {hasbattery: false};

const win = gui.Window.create({frame: false, transparent: true})
// win.setAlwaysOnTop(true)
win.setContentSize({width: 200, height: 100})
win.onClose = () => gui.MessageLoop.quit()



const contentview = gui.Container.create()
contentview.setMouseDownCanMoveWindow(true)
win.setContentView(contentview)

const menu = gui.MenuBar.create([
  {
    label: 'Exit',
    submenu: [
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        onClick: () => gui.messageLoop.quit()
      },
    ],
  },
])

async function updateBatteryInfo(){
  battery_info = si.battery();
  setTimeout( () => updateBatteryInfo(), 3000);
}


function drawWalls(painter){
  painter.beginPath();
  painter.rect({x: 5, y: 5, width: 180, height: 90});   
  painter.lineWidth = 10;
  painter.setColor('#000000');
  painter.stroke();

  painter.beginPath();
  painter.rect({x: 190, y: 40, width: 10, height: 20});   
  painter.setFillColor('#000000');
  painter.fill();
  painter.stroke();
  updateCharge(painter);
}

function drawCharge(painter, charge){

  let rgb_color_key_1 = Number(Math.floor((1-(charge/100))*255)).toString(16).toUpperCase();
  if(rgb_color_key_1.length == 1){
    rgb_color_key_1 = "0"+rgb_color_key_1;
  }
  let rgb_color_key_2 = Number(Math.floor((charge/100)*255)).toString(16).toUpperCase();
  if(rgb_color_key_2.length == 1){
    rgb_color_key_2 = "0"+rgb_color_key_2;
  }

  console.log('#'+rgb_color_key_1+rgb_color_key_2+"00")

  drawClear(p);
  p.beginPath();
  p.rect({x: 10, y: 10, width: (170 * (charge/100)), height: 80});
  painter.setFillColor('#'+rgb_color_key_1+rgb_color_key_2+"00");
  //p.fillStyle = 'rgb('+ Math.floor((1-(charge/100))*255) + ',' + Math.floor((charge/100)*255) + ',0)';
  p.fill();
}

function drawClear(painter){
  p.beginPath();
  p.rect({x: 10, y: 10, width: 170, height: 80});
  p.fill();
}

function drawUpdate(painter, charge){
  drawClear(painter);
  drawCharge(painter, charge);
}

function updateCharge(painter){

  const data = battery_info;
  let charge = 0;
  if(data.hasbattery){
    charge = data.percent;
  }else{
    charge = 100;
  }
  drawUpdate(painter, charge);
  

}

function repaint(){
  contentview.schedulePaint()
  console.log("re!");
  setTimeout(() => repaint(), 2000);
};

repaint()

function initLoad(painter){
  drawWalls(painter);
}



contentview.onDraw = (self, painter) => {
  p = painter;
  //setTimeout(() => repaint(), 2000);
  //self.schedulePaint();
  initLoad(p);
}


notifier.notify({title: 'Battery ui', message: 'Battery ui started!',sound: true, subtitle: '', icon: path.join(__dirname, 'icon/icon.png')});
updateBatteryInfo();
win.activate()
win.setAlwaysOnTop(true)

if (process.platform == 'darwin')
  gui.app.setApplicationMenu(menu)
else
  win.setMenuBar(menu)


if (!process.versions.yode) {
  gui.MessageLoop.run()
  process.exit(0)
}