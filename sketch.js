const canvas = document.getElementById("spinnerCanvas");
const ctx = canvas.getContext("2d");

const spinnerViewport = document.getElementById("spinnerViewport");

const graphs = document.getElementById("graphs");

const simulationButton = document.getElementById("simulationTab");
const graphsButton = document.getElementById("graphsTab");

const resetButton = document.getElementById("resetButton");
const velocityBox = document.getElementById("velocityBox");
let showVelocity = false;
const accelerationBox = document.getElementById("accelerationBox");
let showAcceleration = false;

const angleInput = document.getElementById("angleInput");
const angleSlider = document.getElementById("angleSlider");

const omegaInput = document.getElementById("omegaInput");
const omegaSlider = document.getElementById("omegaSlider");

const tauInput = document.getElementById("torqueInput");
const tauSlider = document.getElementById("torqueSlider");

const playButton = document.getElementById("pauseButton");
const stepButton = document.getElementById("stepButton");

const r = 3;

let mass = 0.1;
let theta = 0;
let omega = Math.PI/4;
let tau = 0;
let MOI = 0.01;

let angle = theta;
let speed = omega;
let torque = tau;

let x=r;
let y=0;

let t=0;
let dt=0.03/2;

let start = false;

const xOffSet = 100;
const yOffSet = 0;

const centerX = canvas.width / 2 + xOffSet;
const centerY = canvas.height / 2 +yOffSet;

const METER_TO_PIXEL_SCALE = 60;
const VECTOR_SCALE = 30;
let simulationScale = 1;

let scaleLabelLeft =250;
let scaleLabelUp = 110;

let draggedBug = null;

class Ladybug {
    constructor(radius, angle, color) {
        this.radius = radius;
        this.angle = angle;

        this.startRadius =radius;
        this.startAngle = angle;

        this.x = 0;
        this.y = 0;
        this.color=color;

        this.onPlatform = false;
        this.verifyOnPlatform();
        this.moving = false;
        this.updatePosition();
    }

    updatePosition() {
        this.x = this.radius * Math.cos(this.angle);
        this.y = this.radius * Math.sin(this.angle);
    }
    verifyOnPlatform(){
        if(this.radius<=4){
            this.onPlatform=true;
        }
        else this.onPlatform = false;
    }

    update(omega, dt) {
        if (this.onPlatform) {
            this.angle += omega * dt;
            this.updatePosition();
        }

    }


    draw(ctx, centerX, centerY, scale) {
        const pixelX = centerX + this.x * scale;
        const pixelY = centerY - this.y * scale;

        const size = 16;

        // Body
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Black outline
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(pixelX, pixelY - size * 0.7, size * 0.45, 0, 2 * Math.PI);
        ctx.fillStyle = "#111111";
        ctx.fill();

        // Center line down the wings
        ctx.beginPath();
        ctx.moveTo(pixelX, pixelY - size * 0.7);
        ctx.lineTo(pixelX, pixelY + size * 0.8);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#111111";
        ctx.stroke();

        // Spots
        const spots = [
            [-0.45, -0.25],
            [ 0.45, -0.25],
            [-0.5,  0.35],
            [ 0.5,  0.35]
        ];

        for (const [dx, dy] of spots) {
            ctx.beginPath();
            ctx.arc(
                pixelX + dx * size,
                pixelY + dy * size,
                size * 0.16,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = "#111111";
            ctx.fill();
        }

        // Antennae
        ctx.beginPath();
        ctx.moveTo(pixelX - size * 0.25, pixelY - size * 0.85);
        ctx.lineTo(pixelX - size * 0.55, pixelY - size * 1.25);
        ctx.moveTo(pixelX + size * 0.25, pixelY - size * 0.85);
        ctx.lineTo(pixelX + size * 0.55, pixelY - size * 1.25);
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Antenna tips
        ctx.beginPath();
        ctx.arc(
            pixelX - size * 0.55,
            pixelY - size * 1.25,
            1.5,
            0,
            2 * Math.PI
        );
        ctx.arc(
            pixelX + size * 0.55,
            pixelY - size * 1.25,
            1.5,
            0,
            2 * Math.PI
        );
        ctx.fillStyle = "#111111";
        ctx.fill();
    }
}


const ladybugs = [
    new Ladybug(2,0,"#ff0000"),
    new Ladybug(3,Math.PI/2,"#009dff")
];

function calculateMOI(){
    let moi = 0.01;

    for (const bug of ladybugs){
        if (bug.onPlatform){
            moi += mass * bug.radius * bug.radius;
        }
    }

    return moi;
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
    const headLength = 10;

    // Main line
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Direction of the arrow
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Arrowhead
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - headLength * Math.cos(angle - Math.PI / 6),
        y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - headLength * Math.cos(angle + Math.PI / 6),
        y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
}


function loop(){
    if(start){
        t+=dt;
        MOI = calculateMOI();
        omega+=tau/MOI*dt;
        theta+=omega*dt;
        for (const bug of ladybugs){
            bug.updatePosition();
        }

        thetaGraph.data.datasets[0].data.push({
            x: t,
            y: theta * 180/Math.PI
        });
        thetaGraph.update("none");

        omegaGraph.data.datasets[0].data.push({
            x: t,
            y: omega*180/Math.PI
        });
        omegaGraph.update("none");

        positionGraph.data.datasets[0].data.push({
            x: t,
            y: ladybugs[0].x
        });

        positionGraph.data.datasets[1].data.push({
            x: t,
            y: ladybugs[0].y
        });

        positionGraph.data.datasets[2].data.push({
            x: t,
            y: ladybugs[1].x
        });

        positionGraph.data.datasets[3].data.push({
            x: t,
            y: ladybugs[1].y
        });

        positionGraph.update("none");
    }

    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let circle=4; circle>=1;circle--){
        ctx.beginPath();
        if(circle==1){
            ctx.fillStyle="#ffff7a";
        }
        else if(circle==2){
            ctx.fillStyle="#fd7b7b";
        }
        else if(circle==3){
            ctx.fillStyle="#7ddbfd";
        }
        else ctx.fillStyle="#888888";

        ctx.arc(centerX,centerY,metersToPixels(circle),0,2*Math.PI);
        ctx.fill();
    }

    for(let i = 0;i<2;i++){
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle="#000000";
        ctx.moveTo(centerX+metersToPixels(4)*Math.cos(theta+Math.PI/2*i), centerY-metersToPixels(4)*Math.sin(theta+Math.PI/2*i));
        ctx.lineTo(centerX+metersToPixels(4)*Math.cos(theta+Math.PI+Math.PI/2*i), centerY-metersToPixels(4)*Math.sin(theta+Math.PI+Math.PI/2*i));
        ctx.stroke();
    }

   // Draw Scale
    const scaleX = centerX - metersToPixels(4) - 150;
    const scaleY = centerY;

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";

    ctx.moveTo(
        scaleX,
        scaleY - metersToPixels(4)
    );

    ctx.lineTo(
        scaleX,
        scaleY
    );

    ctx.stroke();

    for (let i = 0; i < 5; i++) {
        ctx.beginPath();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";

        ctx.moveTo(
            scaleX - 25,
            scaleY + metersToPixels(i - 4)
        );

        ctx.lineTo(
            scaleX + 25,
            scaleY + metersToPixels(i - 4)
        );

        ctx.stroke();

        ctx.font = "30px Times New Roman";
        ctx.fillStyle = "#000000";

        ctx.fillText(
            4 - i,
            scaleX - 45,
            scaleY + metersToPixels(i - 4) + 5
        );
    }

    ctx.font = "40px Times New Roman";
    ctx.fillStyle = "#000000";

    ctx.fillText(
        "Scale (m)",
        scaleX - scaleLabelLeft,
        scaleY - scaleLabelUp
    );

    for (const bug of ladybugs) {
        if (start && !bug.moving) {
            bug.update(omega, dt);
        }

        bug.draw(ctx, centerX, centerY, METER_TO_PIXEL_SCALE);
    }

    if(showVelocity){
        for (const bug of ladybugs){
            if(bug.onPlatform){
                const pixelX = centerX + bug.x * METER_TO_PIXEL_SCALE;
                const pixelY = centerY - bug.y * METER_TO_PIXEL_SCALE;

                const vx = -1*omega*bug.radius*Math.sin(bug.angle);
                const vy = -1*omega*bug.radius*Math.cos(bug.angle);
                drawArrow(ctx, pixelX, pixelY, pixelX+VECTOR_SCALE*vx, pixelY+VECTOR_SCALE*vy, "#ff0000");
            }
        }
    }

    if(showAcceleration){
        for (const bug of ladybugs){
            if(bug.onPlatform){
                const pixelX = centerX + bug.x * METER_TO_PIXEL_SCALE;
                const pixelY = centerY - bug.y * METER_TO_PIXEL_SCALE;

                const ax = -1*omega*omega*bug.radius*Math.cos(bug.angle);
                const ay = omega*omega*bug.radius*Math.sin(bug.angle);
                drawArrow(ctx, pixelX, pixelY, pixelX+VECTOR_SCALE*ax, pixelY+VECTOR_SCALE*ay, "#0000ff");
        
            }
        }
    }



    

    requestAnimationFrame(loop);
};


const thetaGraph = new Chart(
    document.getElementById("thetaGraph"),
    {
        type: "line",
        data: {
            datasets: [{
                label: "Angle",
                data: [],
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    title: {
                        display: true,
                        text: "Time (s)"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Angle (degrees)"
                    }
                }
            }
        }
    }
);

const omegaGraph = new Chart(
    document.getElementById("omegaGraph"),
    {
        type: "line",
        data: {
            datasets: [{
                label: "Ladybug Angular Velocity",
                data: [],
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    title: {
                        display: true,
                        text: "Time (s)"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Angular Velocity (degrees/s)"
                    }
                }
            }
        }
    }
);

const positionGraph = new Chart(
    document.getElementById("positionGraph"),
    {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Ladybug x",
                    data: [],
                    borderColor: "#ff0000",
                    backgroundColor: "#ff0000",
                    borderWidth: 2,
                    borderDash: [],
                    pointRadius: 0
                },
                {
                    label: "Ladybug y",
                    data: [],
                    borderColor: "#ff0000",
                    backgroundColor: "#ff0000",
                    borderWidth: 2,
                    borderDash: [8,5],
                    pointRadius: 0
                },
                {
                    label: "Beetle x",
                    data: [],
                    borderColor: "#009dff",
                    backgroundColor: "#009dff",
                    borderWidth: 2,
                    borderDash: [],
                    pointRadius: 0
                },
                {
                    label: "Beetle y",
                    data: [],
                    borderColor: "#009dff",
                    backgroundColor: "#009dff",
                    borderWidth: 2,
                    borderDash: [8,5],
                    pointRadius: 0
                }
            ]
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: "linear",
                    title: {
                        display: true,
                        text: "Time (s)"
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: "Position (m)"
                    }
                }
            }
        }
    }
);

function clearGraph() {
    thetaGraph.data.datasets[0].data = [];
    thetaGraph.update("none");

    omegaGraph.data.datasets[0].data = [];
    omegaGraph.update("none");

    positionGraph.data.datasets[0].data = [];
    positionGraph.data.datasets[1].data = [];
    positionGraph.data.datasets[2].data = [];
    positionGraph.data.datasets[3].data = [];
    positionGraph.update("none");
}

function metersToPixels(pixelInput){
    return pixelInput*METER_TO_PIXEL_SCALE;
};

function pixelsToMeters(meterInput){
    return meterInput/METER_TO_PIXEL_SCALE;
};

simulationButton.addEventListener("click", function() {
    graphs.style.display = "none";

    simulationScale = 1;

    spinnerViewport.style.width="1250px";
    spinnerViewport.style.height="600px";
    spinnerCanvas.style.left="0px";
    spinnerCanvas.style.top="0px";
    spinnerCanvas.style.width = `${1250*simulationScale}px`;
    spinnerCanvas.style.height = `${600*simulationScale}px`;

    scaleLabelLeft = 250;
    scaleLabelUp = 110;

});

graphsButton.addEventListener("click", function() {
    graphs.style.display = "grid";

    simulationScale = 0.3;

    spinnerCanvas.style.width =
        `${canvas.width * simulationScale}px`;

    spinnerCanvas.style.height =
        `${canvas.height * simulationScale}px`;

    // Center the useful simulation area
    const visibleLeft = 35;
    const visibleRight = 965;
    const visibleCenter = (visibleLeft + visibleRight) / 2;

    spinnerCanvas.style.left =
        `${125 - visibleCenter * simulationScale}px`;

    spinnerCanvas.style.top =
        `${125 - centerY * simulationScale}px`;

    scaleLabelLeft = 60;
    scaleLabelUp = -100;
});

resetButton.addEventListener("click",function(){
    t=0;
    for(const bug of ladybugs){
        bug.angle = bug.startAngle;
        bug.radius = bug.startRadius;
        bug.updatePosition();
    }
    theta=angle;
    omega=speed;
    tau=torque;

    clearGraph();
});

playButton.addEventListener("click", function(){
    start = !start;
});

stepButton.addEventListener("click",function(){
    t+=57/10*dt;
    MOI = calculateMOI();
    omega+=tau/MOI*57/10*dt;
    theta+=omega*57/10*dt;       //57*dt is approximately 1 second of motion

    x=r*Math.cos(theta);
    y=r*Math.sin(theta);

    for (const bug of ladybugs){
        if(bug.onPlatform){
            bug.update(omega,57/10*dt);
        }
    }

    thetaGraph.data.datasets[0].data.push({
            x: t,
            y: theta * 180/Math.PI
        });
        thetaGraph.update("none");

        omegaGraph.data.datasets[0].data.push({
            x: t,
            y: omega*180/Math.PI
        });
        omegaGraph.update("none");

        positionGraph.data.datasets[0].data.push({
            x: t,
            y: ladybugs[0].x
        });

        positionGraph.data.datasets[1].data.push({
            x: t,
            y: ladybugs[0].y
        });

        positionGraph.data.datasets[2].data.push({
            x: t,
            y: ladybugs[1].x
        });

        positionGraph.data.datasets[3].data.push({
            x: t,
            y: ladybugs[1].y
        });

        positionGraph.update("none");
});

velocityBox.addEventListener("click", function(){
    showVelocity=velocityBox.checked;
});

accelerationBox.addEventListener("click", function(){
    showAcceleration=accelerationBox.checked;
});


angleInput.addEventListener("input", function(){
    angleSlider.value = angleInput.value;

    angle = angleSlider.value/180*Math.PI;
    if(!start) theta = angle;
});

angleSlider.addEventListener("input", function(){
    angleInput.value = angleSlider.value;

    angle = angleSlider.value/180*Math.PI;
    if(!start) theta = angle;
});

omegaInput.addEventListener("input", function(){
    omegaSlider.value = omegaInput.value;

    speed = omegaSlider.value/180*Math.PI;
    if(!start) omega = speed;
});

omegaSlider.addEventListener("input", function(){
    omegaInput.value = omegaSlider.value;

    speed = omegaSlider.value/180*Math.PI;

    omega = speed;
});

tauInput.addEventListener("input", function(){
    tauSlider.value = tauInput.value;

    torque = tauSlider.value;
    if(!start) tau = torque;
});

tauSlider.addEventListener("input", function(){
    tauInput.value = tauSlider.value;

    torque = tauSlider.value;

    tau = torque;
});

canvas.addEventListener("mousedown", function(event) {
    const mouse = getMousePosition(event);

    for (const bug of ladybugs) {
        const dx = mouse.x - bug.x;
        const dy = mouse.y - bug.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20 / METER_TO_PIXEL_SCALE) {
            draggedBug = bug;
            draggedBug.moving = true;
            break;
        }
    }
});

function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();

    const pixelX = event.clientX - rect.left;
    const pixelY = event.clientY - rect.top;

    return {
        x: (pixelX - centerX) / METER_TO_PIXEL_SCALE,
        y: (centerY - pixelY) / METER_TO_PIXEL_SCALE
    };
}

canvas.addEventListener("mousemove", function(event) {
    if (draggedBug === null) {
        return;
    }

    const mouse = getMousePosition(event);

    draggedBug.x = mouse.x;
    draggedBug.y = mouse.y;

    draggedBug.radius = Math.sqrt(
        draggedBug.x ** 2 +
        draggedBug.y ** 2
    );

    draggedBug.angle = Math.atan2(
        draggedBug.y,
        draggedBug.x
    );
});

canvas.addEventListener("mouseup", function() {
    if (draggedBug === null) {
        return;
    }

    draggedBug.radius = Math.sqrt((draggedBug.x)**2+(draggedBug.y)**2);
    draggedBug.angle = Math.atan2((draggedBug.y),draggedBug.x)
    draggedBug.verifyOnPlatform();
    draggedBug.moving=false;
    draggedBug=null;
});

window.addEventListener("mouseup", function() {
    if (draggedBug === null) {
        return;
    }

    draggedBug.radius = Math.sqrt(
        draggedBug.x ** 2 +
        draggedBug.y ** 2
    );

    draggedBug.angle = Math.atan2(
        draggedBug.y,
        draggedBug.x
    );

    draggedBug.verifyOnPlatform();
    draggedBug.moving = false;
    draggedBug = null;
});

loop();