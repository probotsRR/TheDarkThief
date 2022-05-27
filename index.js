var canvas = document.getElementById("canvas");
var pen = canvas.getContext("2d");
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
        //camera positionthi
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
    }
    addRow()
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
        
        var row=[];
        for(var i = 0; i < this.h; i++)
        {
            if(i > this.cY)
                row.push(1);
            else if(i == this.cY && this.spike > 0)
                row.push(2);
            else
                row.push(0);	
        }
        this.map.push(row);
        this.cX++;
        this.len++;
    }
    render()
    {
        var mapX = Math.floor(this.camX/this.width);
        var drawX = -(this.camX % this.width);
        // console.log(this.map)
        while(drawX < canvas.width)
        {
            if(mapX >= this.len)
                this.addRow();
            var mapY = Math.floor(this.camY/this.width);
            for(var drawY = -(this.camY % this.width); drawY < canvas.height; drawY += this.width)
            {
                var tile = this.map[mapX][mapY];
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
                }
                mapY++;
            }
            drawX += this.width;	
            mapX++;
        }
        pen.fillStyle = "#F00";	
        pen.fillRect(this.pX - this.camX, this.pY - this.camY, this.width, this.width);
        pen.fillStyle = "#000";	
    }
    // draw()
    // {

    // }
    reset()
    {
        
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

        this.movement();

        var targetX = (this.pX + this.width/2) - canvas.width/2;
        var targetY = (this.pY + this.width/2) - canvas.height/2;
            
        this.camX += (targetX - this.camX) * 0.1;
        this.camY += (targetY - this.camY) * 0.1;
        
        this.camX = Math.max(0, this.camX);
        this.camY = Math.max(0, this.camY);
        this.camY = Math.min(this.h * this.width - canvas.height, this.camY);
    }
    getGround()
    {
        var n1=this.map[Math.floor(this.pX/this.width)].indexOf(1)
        var n2=this.map[Math.ceil(this.pX/this.width)].indexOf(1)
        n1=30-n1
        n2=30-n2
        return [Math.min(n1,n2),Math.max(n1,n2)];
    }
    physics()
    {
        var fl=this.getGround();
        if(1200-this.pY-40>fl[1]*this.width)
        {
            this.pVY-=0.2;
        }
        else if(1200-fl[1]*this.width-40-this.pY<0&&1200-fl[1]*this.width-40-this.pY>-25&&this.pVY<0)
        {
            this.pY=1200-fl[1]*this.width-40;
            this.pVY=0;
        }
        else if(1200-fl[1]*this.width-40-this.pY<0&&this.pVY<0)
        {
            this.pX=this.pX-this.pVX;
        }
        if(1200-this.pY-40<fl[1]*this.width)
        {
            this.pX=this.pX-this.pVX
            // this.pVY=0
            console.log("Collided");
        }
    }
    movement()
    {
        // console.log(keys)
        if(keys[39])
            this.pVX= 5;
        else if(keys[37])
            this.pVX =-5;
        else
            this.pVX=0;
        if(keys[38]&&this.pVY==0)
        {
            console.log("True")
            this.pVY += 9;
        }
            // if(keys[40])
            // this.pY += 5;
        this.pX+=this.pVX;
        this.physics();
        this.pY-=this.pVY;
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