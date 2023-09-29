var canvas = document.getElementById("canvas");
var pen = canvas.getContext("2d");
// // canvas.width = window.innerWidth;
// canvas.width = window.innerWidth;
// console.log(window.innerWidth,window.innerHeight);
// console.log(Math.floor(window.innerHeight/15)*15);
// canvas.height = Math.floor(window.innerHeight/15)*15;
class Game
{
    constructor()
    {
        this.len=0;
        //The position where player is spawn
        this.pX = 100;
        this.pVX=0;
        this.pVY=0;
        this.pY = 600;
        //camera position
        this.camX = 0;
        this.camY = this.pY;

        this.width = 40; //Width of each square block
        this.h = 30; //Height of the grid (Vertical scrolling limit)
        //The position where block is added
        this.cY = 20;
        this.cX = 0;
        this.step = 15;
        // this.spike = 0;
        this.map = [];
        for(var i = 0; i < this.h; i++)
        {
            var row = [];
            this.map.push(row);
        }
        this.tile_rects=[]
        this.inAir=true;
        this.hidden=false;
        this.score = 0;
    }
    addCol()
    {
        if(this.cX >= this.step)
        {
            this.cX = 0;
            this.spike = 0;
            this.step = 2 + Math.floor(Math.random() * 9);
            var dY = 0;
            if(Math.random() > 0.7)
                dY = 2;
            else
                dY = 1;

            if(this.cY >= this.h - 7)
                this.cY -= dY;
            else if(this.cY <= 7)
                this.cY += dY;
            else	if(Math.random() > 0.5)
                this.cY -= dY;
            else
                this.cY += dY;
        }
        if(this.spike == 0 && this.len > 15)
        {
            if(this.cX > 1 && this.cX < this.step - 1 && Math.random() > this.sProb)
            {
                this.spike = 1 + Math.floor(Math.random() * this.sLen);
            }
        }
        else if(this.spike > 0)
        {
            if(this.cX == this.step - 1)
                this.spike = 0;
            this.spike--;
            if(this.spike == 0)
                this.spike = -this.sGap;
        }
        else if(this.spike < 0)
            this.spike++;
        
        for(var i = 0; i < this.h; i++)
        {
            if(i > this.cY)
                this.map[i].push(1);
            else if(i == this.cY && this.spike > 0)
                this.map[i].push(2);
            else
                this.map[i].push(0);	
        }
        this.cX++;
        this.len++;
        if(this.cX == this.step - 1)
        {
            this.score++;
        }
    }
    colliderect(x1,y1,x2,y2)
    {
        return (x1 < x2 + 40 &&
            x1 + 40 > x2 &&
            y1 < y2+ 40 &&
            y1 + 40> y2) 
    }
    collision_test()
    {
        var hitlist=[]
        this.tile_rects.forEach(tile =>
            {
                if(this.colliderect(this.pX,this.pY,tile.x,tile.y))
                {
                    hitlist.push(tile);
                }
            }
        );
        pen.fillStyle="ff0000";
        hitlist.forEach(tile =>
        {
            pen.beginPath();
            pen.fillRect(tile.x, tile.y , this.width, this.width);
            if(this.map[tile.y/this.width][tile.x/this.width] == 2)
            {
                this.reset();
            }
        });
        pen.fillStyle="000";
        return hitlist;
    }
    move()
    {
        // this.pY=800;
        var collision_types={"top":false,"bottom":false,"left":false,"right":false};
        if(keys[39])
            {this.pVX= 5;
            this.hidden=false;}
        else if(keys[37])
           { this.pVX =-5;
            this.hidden=false;}
        else
            this.pVX=0;
        if(keys[38]&&!this.inAir)
        {
            this.pVY =-15;
            this.inAir=true;  
        }
        this.pX+=this.pVX;
        var hitlist=this.collision_test();
        
        hitlist.forEach(tile => 
        {
            if(this.pVX>0)
            {
                this.pX=tile.x-40;
                collision_types.right=true;
                this.hidden=true;
            }
            if(this.pVX<0)
            {
                this.pX=tile.x+40;
                collision_types.left=true;
                this.hidden=true;
            }
        });
        this.pY=this.pY+this.pVY;
        this.pVY+=0.5;
        if(this.pVY>10)
        {
            this.pVY=10;
        }
        var hitlist=this.collision_test();
        hitlist.forEach(tile =>
        {
            if(this.pVY>0)
            {
                this.pY=tile.y-40;
                collision_types.bottom=true;
            }
            if(this.pVY<0)
            {
                this.pY=tile.y+40;
                collision_types.top=true;
            }
        });
        if (collision_types.bottom)
        {   
            this.pVY = 0;
            this.inAir=false;
        }
    }
    render()
    {
        var mapX = Math.floor(this.camX/this.width);
        var drawX = -(this.camX % this.width);
        this.tile_rects=[]
        while(drawX < canvas.width)
        {
            if(mapX >= this.len)
                this.addCol();
            var mapY = Math.floor(this.camY/this.width);
            for(var drawY = -(this.camY % this.width); drawY < canvas.height; drawY += this.width)
            {
                var tile = this.map[mapY][mapX];
                if(tile > 0)
                {
                    if(tile == 1)	
                        pen.fillRect(drawX, drawY, this.width + 1, this.width + 1);
                    else if(tile == 2)
                    {
                        pen.beginPath();
                        pen.moveTo(drawX, drawY + this.width + 1);
                        pen.lineTo(drawX + this.width/2, drawY);
                        pen.lineTo(drawX + this.width, drawY + this.width + 1);
                        pen.closePath();
                        pen.fill();
                    }
                    if(tile!=0)
                    {
                        this.tile_rects.push({x:mapX*this.width,y:mapY*this.width});
                    }	
                }
                mapY++;
            }
            drawX += this.width;	
            mapX++;
        }
        
        pen.fillStyle = "#F00";	
        if(this.hidden&&!this.inAir)
            pen.fillStyle = "#000";	
        pen.fillRect(this.pX - this.camX, this.pY - this.camY, this.width, this.width);
        pen.fillStyle = "#000";	
        pen.font = "30px Arial";
        pen.fillText("Score: " + this.score, 10, 50);
    }
    reset()
    {
        console.log("You are killed!!! Let's try again");
        g=new Game();
    }
    update()
    {
        if(this.len < 50)
            this.set_difficulty(1, 3, 0.7);
        else if(this.len < 150)
            this.set_difficulty(2, 2, 0.7);
        else if(this.len < 300)
            this.set_difficulty(3, 2, 0.5);
        else if(this.len < 500)
            this.set_difficulty(4, 1, 0.5);
        else
            this.set_difficulty(4, 0, 0.5);

        this.move();

        var targetX = (this.pX + this.width/2) - canvas.width/2;
        var targetY = (this.pY + this.width/2) - canvas.height/2;
            
        this.camX += (targetX - this.camX) * 0.1;
        this.camY += (targetY - this.camY) * 0.1;
        
        this.camX = Math.max(0, this.camX);
        this.camY = Math.max(0, this.camY);
        this.camY = Math.min(this.h * this.width - canvas.height, this.camY);
    }
    set_difficulty(a,b,c)
    {
        this.sLen = a;
        this.sGap = b;
        this.sProb = c;
    }
}
var g=new Game();
// g.render()
var keys=[]
window.onkeydown = function(e) 
{
    keys[e.keyCode] = true;
};
window.onkeyup = function(e)
{
    keys[e.keyCode] = false;
};
var gameloop = function()
{
	pen.clearRect(0, 0, canvas.width, canvas.height);
	g.render();
	g.update();
	requestAnimationFrame(gameloop);
}

gameloop();