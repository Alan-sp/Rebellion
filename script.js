    //获取画布对象
    var canvas = document.getElementById("canvas");
    //设置画布为2D方式
    var context = canvas.getContext("2d");
    //获取浏览器窗口的宽度和高度
    var w = window.innerWidth;
    var h = window.innerHeight;
    //设置画布的宽度和高度
    canvas.width = w;
    canvas.height = h;
    //设置雪片数量
    var num = 400;
    //定义雪花数组
    var snows = [];
    for (var i = 0; i < num; i++) {
        //向数组填充元素，元素属性有坐标及半径，均为随机生成，其中半径上限为5
        snows.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 5,
        });
    };
    //绘制图片
    function draw() {
        context.clearRect(0, 0, w, h); //清空画布
        context.beginPath(); //画笔开始
        for (var i = 0; i < num; i++) {
            var snow = snows[i];
            context.fillStyle = "rgba(255,255,255,0.5)"; //设定填充方式为白色半透明
            context.moveTo(snow.x, snow.y); //画笔移动到指定坐标处
            context.arc(snow.x, snow.y, snow.r, 0, Math.PI * 2); //根据属性绘制圆形
        }
        context.fill(); //填充路径
        //雪片落下
        move();
    };
    function move() {
        for (var i = 0; i < num; i++) {
            var snow = snows[i];
            snow.y += (7 - snow.r) / 10 //根据雪片大小调整落下速度
            if(snow.y > h){ //如果雪片超出画布范围，则在顶端重绘
                snows[i]={x:Math.random() * w,y:0,r:snow.r}
            }
        }
    };
    //执行和调用函数
    draw();
    setInterval(draw, 1); //每隔一毫秒重绘一次