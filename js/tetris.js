//some utils
var $ = function(name){
    return document.getElementsByClassName(name)[0];
};

var addEventHandler = function(target, event, fun){
    if(target.addEventListener){
        target.addEventListener(event, fun, false);
    }else if(target.attachEvent){
        target.attachEvent('on'+event, fun);
    }else{
        target["on"+event] = fun;
    }
}

var createBlock = function(container,cla,pos,center){
    if(!center){
        var center = [7,20];
    }
    var block = document.createElement('div');
    var posArr = pos;
    block.setAttribute('class',cla);
    $(container).appendChild(block);
    block.style.left = (center[0] + posArr[0])*30- 1 + 'px';
    block.style.top = (20 - center[1] + posArr[1])*30 + 'px';

    return block;
}




var Class = {
    create: function(){
        return function(){this.initialize.apply(this, arguments);}
    }
}

var Extend = function(destination, source){
    for (var property in source){
        destination[property] = source[property];
    }
}

//app part
var tetris = {};

tetris.ground = [];
tetris.rows = 21;
tetris.cols = 15;
tetris.status = 0;
tetris.score = 0;

tetris.start = function(){
    console.log('tetris start');
    tetris.status = 1;
    tetris.block = new Block('play-ground');
    tetris.background = $('background');
    tetris.scoreContainer = $('score').getElementsByTagName('span')[0];
    tetris.scoreContainer.innerHTML = tetris.score;

    for(var i = 0;i< tetris.cols;i++){
        tetris.ground[i] = [];
        for(var j = 0;j < tetris.rows;j++){
            if(j==0) tetris.ground[i][j] = 1;
            else tetris.ground[i][j] = 0;
        }
    }

    for(var i = 0;i<tetris.rows;i++){
        var row = document.createElement('tr');
        tetris.background.appendChild(row);
        for(var j = 0;j<tetris.cols;j++){
            var col = document.createElement('td');
            row.appendChild(col);
        }
    }

    document.onkeydown = function(e){
        var code = e.keycode || e.which;
        switch(code){
            case 37:
                tetris.block.moveLeft();
                break;
            case 38:
                tetris.block.turn();
                break;
            case 39:
                tetris.block.moveRight();
                break;
            case 40:
                tetris.block.moveDown();
                break;
        }
    }
    //addEventHandler(window, 'keydown', (function(){block.moverVertical()}));
}

tetris.stop = function(){
    if(tetris.status == 1){
        tetris.block.pause();
        tetris.status = 0;
    }
}

tetris.resume = function(){
    if(tetris.status == 0){
        tetris.block.resume();
        tetris.status = 1;
    }
}

tetris.cleanLines = function(){
    var lines = [];
    for(var i= 0;i<tetris.rows;i++){
        for(var j = 0;j< tetris.cols;j++){
            if(tetris.ground[j][i] == 0) break;
            if(tetris.ground[j][i] == 1 && j == (tetris.cols -1)) lines.push(i);
        }
    }
    if(lines[1]){
        for(var i=(lines.length -1 );i>0;i--){
            tetris.background.removeChild(tetris.background.rows[20-i]);
            var row = document.createElement('tr');
            for(var j=0;j<15;j++){
                row.appendChild(document.createElement('td'));
                tetris.ground[j].splice(i,1);
                tetris.ground[j][20] = 0;
            }
            tetris.background.insertBefore(row,tetris.background.childNodes[0]);

        }
        tetris.score += tetris.addScore(lines.length - 1);
        tetris.scoreContainer.innerHTML = tetris.score;
    }
}

tetris.check = function(center, shape){
    for(var i=0;i<4;i++){
        if((center[0]+shape[2*i])>14||(center[0]+shape[2*i])<0) return false;
        if((center[1]-shape[2*i+1])>19) return false;
        if(tetris.ground[center[0]+shape[2*i]][center[1]-shape[2*i+1]] == 1){
            return false;
        }
    }
    return true;
}

tetris.addScore = function(n){
    var score;
    if(n == 1)     score = 1;
    else score = tetris.addScore(n-1) + n
    return score;
}



//block object

var Block = Class.create();

Block.prototype = {
    //初始化一个block
    exist: false,
    initialize: function(container){
        this.container = $(container);
        this.exist = true;
        self = this;
        this.center = [7,20];
        this.block = [];

        this.color = this.randomColor();
        this.shape = this.randomShape();
        this.shapeIndex = 0;

        for(var i = 0;i < 4;i++){
            var tempArr = this.shape.shape.slice(i*2, i*2 + 2);

            this.block.push(createBlock('play-ground','block'+' '+this.color, tempArr, this.center));
        }
        this.randomColor();
        this.timeCtl = setInterval(function(){self.moveDown()}, 1000);
    },
    randomShape: function(){
        var shapeArr = [[0,0,1,0,0,1,1,1],[0,0,1,0,2,0,3,0],[0,1,1,1,2,1,1,0]]
        var random = Math.floor(Math.random()*3);
        return {shape:shapeArr[random],type:random};
    },
    randomColor: function(){
      var color = ['blue','green','red'][Math.floor(Math.random()*3)];
      return color;
    },
    moveDown: function(){
        var tempCenter = [this.center[0],this.center[1]-1];
        var check = tetris.check(tempCenter,this.shape.shape);
        if(check){
            this.center[1] -= 1;
            for(var i in this.block){
                this.block[i].style.top = 30 + this.block[i].offsetTop + 'px';
            }
        }else{
             this.stop();
        }
    },
    moveLeft: function(e){
        var tempCenter = [this.center[0]-1,this.center[1]];
        var check = tetris.check(tempCenter,this.shape.shape);
        if(check){
            this.center[0] -= 1;
            for(var i in this.block){
                this.block[i].style.left = this.block[i].offsetLeft - 30 + 'px';
            }
        }
    },
    moveRight: function(e){
        var tempCenter = [this.center[0]+1,this.center[1]];
        var check = tetris.check(tempCenter, this.shape.shape);

        if(check){
            this.center[0] += 1;
            for(var i in this.block){
                this.block[i].style.left = this.block[i].offsetLeft + 30 + 'px';
            }
        }
    },
    turn: function(){
        var type = this.shape.type; //block type

        var turnArr = [
          [[0,0,1,0,0,1,1,1]],
          [[0,0,1,0,2,0,3,0],[0,0,0,1,0,2,0,3]],
          [[0,1,1,1,2,1,1,0],[1,0,1,1,1,2,2,1],[0,1,1,1,2,1,1,2],[1,0,1,1,1,2,0,1]]
        ];

        var index = this.shapeIndex;

        var nextIndex = (index + 1)%(turnArr[type].length);
        var tempShape = turnArr[type][nextIndex];

        var check = tetris.check(this.center, tempShape);
        if(check){
            this.shapeIndex = nextIndex;
            this.shape.shape = turnArr[type][nextIndex];

            for(var i in this.block){
                this.block[i].style.left = this.center[0]*30 + this.shape.shape[2*i]*30 + 'px';
                this.block[i].style.top = (20 - this.center[1])*30 + this.shape.shape[2*i + 1]*30 + 'px';
            }
        }
    },
    stop: function(){
        console.log(this.exist);
        if(this.exist){
            this.exist = false;
            clearInterval(this.timeCtl);
            var center = this.center;
            var shape = this.shape.shape;

            for(var i=0;i< 4;i++){
                tetris.background.rows[20-center[1] + shape[2*i+1]].cells[center[0]+shape[2*i]].setAttribute('class', this.color);
                tetris.ground[center[0]+shape[2*i]][center[1]-shape[2*i+1]] = 1;
                this.block[i].parentNode.removeChild(this.block[i]);
            }
            tetris.cleanLines();
            tetris.block = new Block();
        }
        return;
    },
    pause:function(){
        clearInterval(this.timeCtl);
    },
    resume:function(){
        self = this;
        this.timeCtl = setInterval(function(){self.moveDown()}, 1000);
    }
}


window.onload = function(){
    $('ctl-button').onclick = function(){
        tetris.start();
    };
    $('pause-button').onclick = function(e){
        if(e.target.name == 'pause'){
            console.log('trigger stop');
            e.target.innerText = '继续';
            e.target.name = 'resume';
            tetris.stop();
        }else{
            tetris.resume();
            e.target.innerText = '暂停';
            e.target.name = 'pause';
        }
    }
}








