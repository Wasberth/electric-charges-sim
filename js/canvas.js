const pointRadius = 5;
const mass = 1;
const k = 1000;
const existenceOffset = 500;

let points = [];

let playing = false;
let interv;

function Vector(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.add = (v) => {
        let s = new Vector(this.x + v.x, this.y + v.y);
        return s;
    };

    this.unit = () => {
        let m = this.magnitude();
        let uv = new Vector(this.x / m, this.y / m);
        return uv;
    };

    this.scale = (c) => {
        let v = new Vector(this.x * c, this.y * c);
        return v;
    };

    this.magnitude = () => {
        let m = Math.sqrt((this.x * this.x) + (this.y * this.y));
        return m;
    };
}

function Point(config) {
    this.x = config.x;
    this.y = config.y;

    this.c = 1;

    this.velocity = new Vector();
    this.aceleration = new Vector();

    this.invert = () => {
        this.c = this.c * -1;
    };

    this.calculateVel = () => {
        console.log(this.aceleration);
        this.velocity = this.velocity.add(this.aceleration.scale(1));
    };

    this.calculateAc = (points) => {
        let a = new Vector();

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (point == this) {
                continue;
            }

            let dir = new Vector(point.x - this.x, point.y - this.y);
            let dist = dir.magnitude();
            dir = dir.unit();

            let fors = k * Math.abs(point.c * this.c) / Math.pow(dist, 2);
            dir = dir.scale(fors);

            if (point.c * this.c > 0) {
                dir = dir.scale(-1);
            }

            a = a.add(dir);
        }

        this.aceleration = a.scale(1 / mass);
    };

    this.move = () => {
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    };
}

function Canvas(config) {
    this.canvas = config.canvas;
    this.context = config.context;

    let canvas = this.canvas;
    let context = this.context;

    this.clear = () => { context.clearRect(0, 0, window.innerWidth, window.innerHeight); };
    let clear = this.clear;

    this.draw = () => { clear(); drawCanvas(canvas, context); };
}

function drawCanvas(canvas, context) {
    let height = canvas.clientHeight - 100;
    let width = canvas.clientWidth - 100;

    for (let i = 0; i < points.length; i++) {
        const point = points[i];

        context.fillStyle = "#0000FF";
        context.strokeStyle = "#0000FF";

        if (point.c > 0) {
            context.fillStyle = "#FF0000";
            context.strokeStyle = "#FF0000";
        }

        context.beginPath();
        context.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
        context.stroke();
    }
}

window.onload = () => {
    let canvas = document.getElementById("XY");
    let content = document.getElementById("row-c");
    canvas.height = content.offsetHeight * 0.98;
    canvas.width = content.offsetWidth * 0.95;
    //canvas.width = ;
    let context = canvas.getContext("2d");
    let c = new Canvas({
        canvas: canvas,
        context: context
    });

    canvas.onclick = (e) => {
        let mX = e.clientX - canvas.offsetLeft;
        let mY = e.clientY - canvas.offsetTop;
        console.log(`(${mX}, ${mY})`);

        let inverted = false;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const xDist = mX - point.x;
            const yDist = mY - point.y;
            const dist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));

            if (dist < pointRadius + 3) {
                point.invert();
                inverted = true;
                continue;
            }
        }

        if (!inverted) {
            points.push(new Point({
                x: mX,
                y: mY
            }));
        }

        c.draw();
    };

    let playButton = document.getElementById("LeBoton");

    function update() {
        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            if (point.x + existenceOffset < 0 || point.x - existenceOffset > canvas.width
                || point.y + existenceOffset < 0 || point.y - existenceOffset > canvas.height) {
                points = points.filter(element => element !== point);
            }

            point.calculateAc(points);
            point.calculateVel();
        }

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            point.move();

            console.log(point);
        }

        c.draw();
    }

    playButton.onclick = () => {
        playing = !playing;

        if (interv) {
            clearInterval(interv);
        }

        if (playing) {
            interv = setInterval(update, 50);
        }
    };
};