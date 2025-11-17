// Wait until everything is loaded
window.addEventListener("load", () => {
    console.log("App loaded.");

    // --- GLOBALS ---
    let scene, camera, renderer, cube, animating = true;

    const canvas = document.getElementById("introCanvas");
    const enterBtn = document.getElementById("enterBtn");
    const catalog = document.getElementById("catalog");
    const introSection = document.getElementById("introSection");

    startIntro();


    // ---------- INTRO 3D ANIMATION ----------
    function startIntro() {
        if (typeof THREE === "undefined") {
    console.warn("THREE.js failed to load — skipping intro animation.");
    introSection.classList.add("hidden");
    catalog.classList.remove("hidden");
    loadProducts();
    return;
}


        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 3;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const light = new THREE.PointLight(0xffffff, 1);
        light.position.set(3, 3, 3);
        scene.add(light);

        animate();
    }

    function animate() {
        if (!animating) return;

        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }


    // ---------- ENTER BUTTON ----------
    enterBtn.addEventListener("click", () => {
        animating = false; // stop animation
        introSection.style.opacity = "0";

        setTimeout(() => {
            introSection.classList.add("hidden");
            catalog.classList.remove("hidden");
        }, 600);

        loadProducts();
    });


    // ---------- CATALOG DATA ----------
    function loadProducts() {
        const items = [
            { name: "VX-01 Glasses", price: "$79", img: "p1.png" },
            { name: "VX-02 Edge", price: "$92", img: "p2.png" },
            { name: "VX-03 Phantom", price: "$69", img: "p3.png" }
        ];

        catalog.innerHTML = items.map(p => `
            <div class="card">
                <img src="${p.img}" alt="" />
                <h3>${p.name}</h3>
                <p>${p.price}</p>
            </div>
        `).join("");
    }
});
