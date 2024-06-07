const container = document.querySelector('.container');
const landingPage = document.querySelector('.landing-page');
const startPage = document.querySelector('.start-page');
const centerPage = document.querySelector('.center-page');
const lastPage = document.querySelector('.last-page');
const mainContent = document.querySelector('.main-content');
const slides = document.querySelector('.slides');
const endingPage = document.querySelector('.ending-page');
const intermediatePages = [startPage, centerPage, lastPage];

let currentStage = 0;

window.addEventListener('wheel', (event) => {
    if (event.deltaY > 0) {
        // Scroll down
        if (currentStage === 0) {
            landingPage.classList.add('hidden');
            setTimeout(() => {
                landingPage.style.display = 'none';
                mainContent.style.display = 'flex';
                mainContent.classList.add('visible');
                slides.style.opacity = 1;
                setup();
                currentStage++;
            }, 1000);
        } else if (currentStage === 1) {
            mainContent.classList.remove('visible');
            slides.style.opacity = 0;
            setTimeout(() => {
                mainContent.style.display = 'none';
                startPage.style.display = 'flex';
                startPage.classList.remove('hidden');
                currentStage++;
            }, 1000);
        } else if (currentStage > 1 && currentStage <= intermediatePages.length) {
            intermediatePages[currentStage - 2].classList.add('hidden');
            setTimeout(() => {
                intermediatePages[currentStage - 2].style.display = 'none';
                if (currentStage - 1 < intermediatePages.length) {
                    intermediatePages[currentStage - 1].style.display = 'flex';
                    intermediatePages[currentStage - 1].classList.remove('hidden');
                    currentStage++;
                } else {
                    endingPage.style.display = 'flex';
                    endingPage.classList.remove('hidden');
                    currentStage++;
                }
            }, 1000);
        } else if (currentStage === intermediatePages.length + 1) {
            intermediatePages[currentStage - 2].classList.add('hidden');
            setTimeout(() => {
                intermediatePages[currentStage - 2].style.display = 'none';
                endingPage.style.display = 'flex';
                endingPage.classList.remove('hidden');
                currentStage++;
            }, 1000);
        } else if (currentStage === intermediatePages.length + 2) {
            // If on the ending page and scroll further, redirect to another HTML file
            window.location.href = 'waymond.html'; // Replace 'your_next_page.html' with the actual file you want to link to
        }
    } else {
        // Scroll up
        if (currentStage > 1 && currentStage <= intermediatePages.length + 1) {
            if (currentStage - 2 < intermediatePages.length) {
                intermediatePages[currentStage - 2].classList.add('hidden');
                setTimeout(() => {
                    intermediatePages[currentStage - 2].style.display = 'none';
                    intermediatePages[currentStage - 3].style.display = 'flex';
                    intermediatePages[currentStage - 3].classList.remove('hidden');
                    currentStage--;
                }, 1000);
            }
        } else if (currentStage === intermediatePages.length + 1) {
            endingPage.classList.add('hidden');
            setTimeout(() => {
                endingPage.style.display = 'none';
                intermediatePages[intermediatePages.length - 1].style.display = 'flex';
                intermediatePages[intermediatePages.length - 1].classList.remove('hidden');
                currentStage--;
            }, 1000);
        }
    }
});

// Scroll the ending page horizontally
endingPage.addEventListener('wheel', (event) => {
    endingPage.scrollLeft += event.deltaY;
});

// Your existing setup() and render() functions

const { Engine, World, Bodies, Mouse, MouseConstraint } = Matter;

let engine;
let world;
let items = [];
let mouseConstraint;

function setup() {
    if (engine) return;

    const canvas = document.getElementById('canvas');
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = 1;

    const ground = Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true });
    World.add(world, [ground, leftWall, rightWall]);

    const imagePath = './image/guggelyEye.png';

    for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * -500;
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            let scale;
            if (Math.random() < 0.8) {
                scale = Math.random() * (2 - 0.5) + 0.5;
            } else {
                scale = Math.random() * (3.5 - 1.5) + 1.5;
            }
            const item = Bodies.circle(x, y, 25 * scale, {
                restitution: 0.8,
                friction: 0.1,
                frictionAir: 0.01
            });
            World.add(world, item);
            items.push({ body: item, image: img, scale: scale });
        };
    }

    const mouse = Mouse.create(canvas);
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    World.add(world, mouseConstraint);

    Matter.Engine.run(engine);

    requestAnimationFrame(render);
}

function render() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.body.position.y > canvas.height + 25) {
            World.remove(world, item.body);
            items.splice(i, 1);
            continue;
        }
        ctx.drawImage(item.image, item.body.position.x - (25 * item.scale), item.body.position.y - (25 * item.scale), 50 * item.scale, 50 * item.scale);
    }

    items.forEach(item => {
        if (mouseConstraint.mouse.position.x > item.body.position.x - 25 * item.scale &&
            mouseConstraint.mouse.position.x < item.body.position.x + 25 * item.scale &&
            mouseConstraint.mouse.position.y > item.body.position.y - 25 * item.scale &&
            mouseConstraint.mouse.position.y < item.body.position.y + 25 * item.scale) {
            let dx = mouseConstraint.mouse.position.x - item.body.position.x;
            let dy = mouseConstraint.mouse.position.y - item.body.position.y;
            let angle = Math.atan2(dy, dx);
            let forceMagnitude = 0.01; // The strength of the bounce
            let force = {
                x: forceMagnitude * Math.cos(angle),
                y: forceMagnitude * Math.sin(angle)
            };
            Matter.Body.applyForce(item.body, item.body.position, force);
        }
    });

    requestAnimationFrame(render);
}
