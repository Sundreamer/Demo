// 贪吃蛇类
function Snake(config){
	this.snakes = null;
	this.dir = null;
	this.score= 0;
	this.config = config;
}
// 根据移动方向来修改坐标
Snake.prototype.timing = function(){
	var moveX = 0,
		moveY = 0;
	switch(this.dir){
		case "top":
			moveX = this.config.location[0][0];
			moveY = this.config.location[0][1] - 1;
			break;
		case "right":
			moveX = this.config.location[0][0] + 1;
			moveY = this.config.location[0][1];
			break;
		case "bottom":
			moveX = this.config.location[0][0];
			moveY = this.config.location[0][1] + 1;
			break;
		case "left":
			moveX = this.config.location[0][0] - 1;
			moveY = this.config.location[0][1];
			break;
	}
	this.config.control.crash(moveX,moveY);
}
// 根据坐标来依次修改每一截身体的位置
Snake.prototype.move = function(newX,newY) {
	var snakeX, snakeY;
	var lastSnake = this.config.location.pop();
	var delX = lastSnake[0];
	var delY = lastSnake[1];
	this.config.allSite[delX][delY] = 0;
	this.snakes = this.config.gameModule.mainBox.children;
	this.config.location.unshift([newX,newY]);
	for (var i = 0; i < this.snakes.length; i++) {
		snakeX = this.config.location[i][0];
		snakeY = this.config.location[i][1];
		this.snakes[i].style.left = snakeX * 20 + "px";
		this.snakes[i].style.top = snakeY * 20 + "px";
		this.config.allSite[snakeX][snakeY] = 2;
	}
}
// 吃到新的身体后添加到后面
Snake.prototype.eat = function(index,x,y){
	var lastIndex = this.config.location.length - 1;
	x = this.config.location[lastIndex][0];
	y = this.config.location[lastIndex][1];
	this.config.location.push([x,y]);
	this.config.gameModule.mainBox.appendChild(this.config.eats[index]);
	this.config.gameModule.scoreBox.innerHTML = ++this.score;
	this.config.eats.splice(index,1);
	this.config.factory.newEat(1);
}

// 游戏控制器类
function Control(config){
	this.config = config;
	this.snake = config.snake;
	this.factory = config.factory;
	this.timer = null;
	this.gameover = false;
	this.acceleration = true;
}
// 开始游戏
Control.prototype.run = function(){
	this.load();
	this.timer = setInterval(function(){
		this.snake.timing();
	}.bind(this),300);
	window.onkeydown = function(e){
		this.changeDir(e);
	}.bind(this);
	window.onkeyup = function(e){
		if(e.keyCode == 32){
			this.speed(false);
		}
	}.bind(this);
}
// 暂停游戏
Control.prototype.delay = function(that){
	if(!this.gameover){
		this.config.gameModule.delayBtn.innerHTML = "开始";
		this.gameover = true;
		clearInterval(this.timer);
	}else{
		this.config.gameModule.delayBtn.innerHTML = "暂停";
		this.gameover = false;
		this.timer = setInterval(function(){
			that.snake.timing.call(that.snake,that);
		},300);
	}	
}
// 随机初始化
Control.prototype.load = function(){
	var dirs = ['top','right','bottom','left'];
	var rDir = parseInt(Math.random() * 4);
	this.snake.dir = dirs[rDir];
	var rX = parseInt(Math.random() * (this.config.gameModule.widthIndex - 10) + 3);
	var rY = parseInt(Math.random() * (this.config.gameModule.heightIndex - 10) + 3);
	for(var i = 0; i < 3; i++){
		switch(this.snake.dir){
			case 'top': rY += 1; break;
			case 'right': rX -= 1; break;
			case 'bottom': rY -= 1 ;break;
			case 'left': rX += 1; break;
		}
		this.config.gameModule.mainBox.appendChild(this.factory.create(rX*20,rY*20,"snake"));
		this.config.location.push([rX,rY]);
		this.config.allSite[rX][rY] = 2;
	}
	this.factory.hinder(10);
	this.factory.newEat(10);
}
// 根据按键改变运动方向
Control.prototype.changeDir = function(e){
	e = e || window.event;
	switch(true){
		case e.keyCode == 87 && this.snake.dir != 'bottom':
			this.snake.dir = 'top';
			break;
		case e.keyCode == 68 && this.snake.dir != 'left':
			this.snake.dir = 'right';
			break;
		case e.keyCode == 83 && this.snake.dir != 'top':
			this.snake.dir = 'bottom';
			break;
		case e.keyCode == 65 && this.snake.dir != 'right':
			this.snake.dir = 'left';
			break;
		case e.keyCode == 32:
			this.speed(true);
	}
}
// 判断是否加速
Control.prototype.speed = function(flag){
	if(!this.gameover){
		if(flag && this.acceleration){
			this.acceleration = false;
			clearInterval(this.timer);
			this.timer = setInterval(function(){
				this.snake.timing();
			}.bind(this),150);
		}else if(!flag){
			this.acceleration = true;
			clearInterval(this.timer);
			this.timer = setInterval(function(){
				this.snake.timing();
			}.bind(this),300);
		}	
	}
}
// 碰撞检测
Control.prototype.crash = function(newX,newY){
	var eatX, eatY, eatIndex = 0;
	if(newX >= 0 && newX <= 49 && newY >= 0 && newY <= 23){
		switch(this.config.allSite[newX][newY]){
		case 0 :
			this.snake.move(newX,newY); 
			break;
		case 1 : 
			eatIndex = this.find(newX,newY);
			this.config.allSite[newX][newY] = 0;
			this.snake.eat(eatIndex,newX,newY);
			this.snake.move(newX,newY);
			break;
		case 2 :  
			clearInterval(this.timer);
			this.gameover = true;
			this.config.gameModule.resultBox.style.transform = "scale(1)";
			this.config.gameModule.resultInfo.innerHTML = "游戏结束！你的分数：" + this.snake.score;
		}
	}else{
		clearInterval(this.timer);
		this.gameover = true;
		this.config.gameModule.resultBox.style.transform = "scale(1)";
		this.config.gameModule.resultInfo.innerHTML = "游戏结束！你的分数：" + this.snake.score;
	}
}
// 根据坐标来判断是哪个元素
Control.prototype.find = function(x,y){
	var index = 0;
	for(var i = 0; i < this.config.eats.length; i++){
		if(this.config.eats[i].offsetLeft == x * 20 && this.config.eats[i].offsetTop == y * 20){
			index = i;
			return index;
		}
	}
}

// 工厂类
function Factory(config){
	this.config = config;
}
// 物体工厂
Factory.prototype.create = function(x,y,type){
	var node = document.createElement("i");		
	node.className = type;
	node.style.left = x + 'px';
	node.style.top = y + 'px';
	return node;
}
// 随机生成身体
Factory.prototype.newEat = function(num){
	var count = 0;
	while(count < num){
		var rX = parseInt(Math.random() * this.config.gameModule.widthIndex);
		var rY = parseInt(Math.random() * this.config.gameModule.heightIndex);
		if(this.config.allSite[rX][rY] === 0){
			var snake = this.create(rX*20,rY*20,"snake");
			this.config.gameModule.eatBox.appendChild(snake);
			this.config.eats.push(snake);
			this.config.allSite[rX][rY] = 1;
			count++;
		}
	}	
}
// 随机生成障碍物
Factory.prototype.hinder = function(num){
	var count = 0,flag = false;
	var site, sX, sY;
	while(count < num){
		flag = true;
		var type = parseInt(Math.random() * 5);
		var rX = parseInt(Math.random() * (this.config.gameModule.widthIndex - 10) + 5);
		var rY = parseInt(Math.random() * (this.config.gameModule.heightIndex - 10) + 5);
		if(this.config.allSite[rX][rY] === 0){
			site = this.shape(rX,rY,type);
			for (var i in site) {
				sX = site[i][0];
				sY = site[i][1];
				this.config.allSite[sX][sY] != 0 ? flag = false : "";
			}
			if(flag){
				for(var i in site){
					sX = site[i][0];
					sY = site[i][1];
					var brick = this.create(sX*20,sY*20,"brick");
					this.config.gameModule.hinderBox.appendChild(brick);
					this.config.allSite[sX][sY] = 2;
				}
				count++;
			}		
		}
	}	
}
// 生成各种形状['tl','tr','bl','br','cross','squre']
Factory.prototype.shape = function(x,y,type){
	var site = [];
	switch(type){
		case 0:
			site = [[x,y],[x+1,y],[x+2,y],[x,y+1],[x,y+2]];
			break;
		case 1:
			site = [[x,y],[x-1,y],[x-2,y],[x,y+1],[x,y+2]];
			break;
		case 2:
			site = [[x,y],[x+1,y],[x+2,y],[x,y-1],[x,y-2]];
			break;
		case 3:
			site = [[x,y],[x-1,y],[x-2,y],[x,y-1],[x,y-2]];
			break;
		case 4:
			site = [[x,y],[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
			break;
		case 5:
			site = [[x,y],[x+1,y],[x+1,y+1],[x,y+1]];
	}
	return site;
}

// 初始化配置类
function Config(){
	this.allSite = [];
	this.eats = [];
	this.location = [];
	this.gameStart = false; 
	this.snake = null;
	this.factory = null;
	this.control = null;
	this.gameModule = {
		mainBox : null,
		eatBox : null,
		hinderBox : null,
		scoreBox : null,
		resultBox : null,
		resultInfo : null,
		startBtn : null,
		delayBtn : null,
		endBtn : null,
		restartBtn : null,
		widthIndex : null,
		heightIndex : null
	};
	this.pageModule = {
		menu : null,
		tipBox : null,
		tipBtn : null
	}
}
// 初始化所有数据
Config.prototype.init = function(){
	this.gameModule.widthIndex = this.gameModule.mainBox.offsetWidth / 20;
	this.gameModule.heightIndex = this.gameModule.mainBox.offsetHeight / 20;
	for(var i = 0; i < this.gameModule.widthIndex; i++){
		this.allSite[i] = new Array(this.gameModule.heightIndex);
		for(var j = 0; j < this.gameModule.heightIndex; j++){
			this.allSite[i][j] = 0;
		}
	}
	this.snake = new Snake(this);
	this.factory = new Factory(this);
	this.control = new Control(this);
	this.control.run();
};
// 清除所有数据
Config.prototype.clearData = function(){
	this.allSite = [];
	this.eats = [];
	this.location = [];
	this.gameStart = false; 
	this.snake = null;
	this.factory = null;
	this.control = null;
	this.gameModule.scoreBox.innerHTML = '0';
	this.gameModule.mainBox.innerHTML = '';
	this.gameModule.eatBox.innerHTML = '';
	this.gameModule.hinderBox.innerHTML = '';
};
// 绑定所有按钮的点击事件
Config.prototype.btnEvent = function(){
	document.body.onclick = function(e){
		switch(e.target){
			case this.gameModule.startBtn:
				this.gameStart = true;
				this.pageModule.menu.style.transform = "scale(0)";
				setTimeout(function(){
					this.init();
				}.bind(this),500);
				break;
			case this.gameModule.delayBtn:
				this.gameStart?this.control.delay(this.control):"";
				break;
			case this.gameModule.endBtn:
				this.gameStart = false;
				this.gameModule.resultBox.style.transform = "scale(0)";
				this.pageModule.menu.style.transform = "scale(1)";
				this.clearData();
				break;
			case this.gameModule.restartBtn:
				this.gameModule.resultBox.style.transform = "scale(0)";
				this.clearData();
				this.init();
				break;
			case this.pageModule.tipBtn:
				this.pageModule.tipBox.style.transform = "scale(1)";
				break;
			default: this.pageModule.tipBox.style.transform = "scale(0)";
		}
	}.bind(this);
};