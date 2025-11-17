// ---------- INTRO 3D ANIMATION ----------
let introRenderer, introScene, introCamera, introFrame = 0;

function startIntro() {
    const canvas = document.getElementById("introCanvas");
    introRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    introRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    introScene = new THREE.Scene();

    introCamera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    );
    introCamera.position.set(0, 0, 5);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 5);
    introScene.add(light);

    const loader = new THREE.GLTFLoader();
    loader.load("models/introSunglasses.glb", gltf => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        introScene.add(model);

        animateIntro();
    });
}

function animateIntro() {
    introFrame++;
    introCamera.position.z = 5 - (introFrame * 0.02);
    introRenderer.render(introScene, introCamera);

    if (introCamera.position.z > 1.2) {
        requestAnimationFrame(animateIntro);
    }
}

document.getElementById("enterBtn").onclick = () => {
    document.getElementById("introSection").style.display = "none";
};

// ---------------- CATALOG ----------------

async function loadProducts() {
    const res = await fetch("products.json");
    const items = await res.json();

    const container = document.getElementById("catalog");
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            ${!item.available ? "<div class='sold'>SOLD</div>" : ""}
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>$${item.price}</p>
        `;

        card.onclick = () => openProduct(item);
        container.appendChild(card);
    });
}

// -------------- PRODUCT MODAL + VIEWER -------------

let viewerRenderer, viewerScene, viewerCamera, viewerControls;

function openProduct(product) {
    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("productInfo").innerHTML = `
        <h2>${product.name}</h2>
        <p>$${product.price}</p>
        <p>Status: ${product.available ? "Available" : "Sold Out"}</p>
        <a href="mailto:orders@uvprotocols.com?subject=Reserve: ${product.name}">
            <button ${product.available ? "" : "disabled"}>Reserve</button>
        </a>
    `;

    const canvas = document.getElementById("viewerCanvas");

    viewerRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    viewerRenderer.setSize(600, 350);

    viewerScene = new THREE.Scene();
    viewerCamera = new THREE.PerspectiveCamera(60, 600/350, 0.1, 100);
    viewerCamera.position.set(0, 0, 2);

    viewerControls = new THREE.OrbitControls(viewerCamera, canvas);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2,2,5);
    viewerScene.add(light);

    const loader = new THREE.GLTFLoader();
    loader.load(product.model, gltf => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        viewerScene.add(model);
        renderViewer();
    }, undefined, () => {
        document.getElementById("viewerContainer").innerHTML =
            `<img src="${product.image}" style="width:100%;border-radius:8px;">`;
    });
}

function renderViewer() {
    viewerRenderer.render(viewerScene, viewerCamera);
    requestAnimationFrame(renderViewer);
}

document.getElementById("closeModal").onclick = () => {
    document.getElementById("modal").classList.add("hidden");
};

// ---------- INIT ----------
startIntro();
loadProducts();
