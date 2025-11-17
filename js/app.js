
// UV Protocols v0.2 - procedural Three.js sunglasses and product flow
const PRODUCTS_URL = 'products.json';
const catalogEl = document.getElementById('catalog');
const viewerDialog = document.getElementById('viewerDialog');
const viewerEl = document.getElementById('viewer');
const productInfo = document.getElementById('productInfo');
const skipBtn = document.getElementById('skipIntro');
let products = [];
skipBtn.onclick = ()=>{stopIntro=true;};

fetch(PRODUCTS_URL).then(r=>r.json()).then(data=>{products=data;renderCatalog();startIntro();}).catch(e=>{catalogEl.innerHTML='<p style="color:#f88">Failed to load products.json</p>'; console.error(e); startIntro();});

function renderCatalog(){
  catalogEl.innerHTML='';
  products.forEach(p=>{
    const card = document.createElement('article'); card.className='card';
    const soldTag = !p.available?'<div class="sold">SOLD</div>':'';
    card.innerHTML = `
      ${soldTag}
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <div class="actions">
        <button class="viewBtn">View</button>
        ${p.available?`<button class="buyBtn">Reserve</button>`:`<button disabled>Sold Out</button>`}
      </div>
    `;
    card.querySelector('.viewBtn').addEventListener('click', ()=> openViewer(p));
    if(p.available){ card.querySelector('.buyBtn').addEventListener('click', ()=> {
        const subject = encodeURIComponent(`Reserve: ${p.title} (${p.id})`);
        const body = encodeURIComponent(`Hi,%0DI'd like to reserve ${p.title} (${p.id}). Please confirm.`);
        window.location.href = `mailto:yourstore@example.com?subject=${subject}&body=${body}`;
    });}
    catalogEl.appendChild(card);
  });
}

// ---------------- Intro scene ----------------
let introRenderer, introScene, introCamera, introCanvas, stopIntro=false;
function startIntro(){
  const canvas = document.getElementById('introCanvas');
  introRenderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  introRenderer.setPixelRatio(window.devicePixelRatio);
  introRenderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  introScene = new THREE.Scene();
  introCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
  introCamera.position.set(0,0,4);
  const hemi = new THREE.HemisphereLight(0xffffff,0x222222,1.2); introScene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff,0.6); dir.position.set(5,10,7); introScene.add(dir);

  const headGeo = new THREE.SphereGeometry(1.0, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({color:0x222222, metalness:0.1, roughness:0.8});
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headMesh.position.set(0,0,0);
  introScene.add(headMesh);

  const glasses = buildSunglasses('aviator');
  glasses.position.set(0,0.18,0.9);
  glasses.rotation.y = Math.PI;
  glasses.scale.set(1.0,1.0,1.0);
  introScene.add(glasses);

  let t=0;
  function animate(){
    if(stopIntro){ introRenderer.clear(); return; }
    requestAnimationFrame(animate);
    t += 0.02;
    // simple movement to simulate putting on
    glasses.position.z = 0.9 - Math.min(t,1.0)*0.6;
    glasses.position.y = 0.18 + Math.max(0,1.0 - Math.abs(1.0 - t))*0.04;
    glasses.rotation.x = 0.05*Math.sin(t*1.5);
    introRenderer.render(introScene, introCamera);
  }
  animate();
  window.addEventListener('resize', ()=> {
    introCamera.aspect = canvas.clientWidth/canvas.clientHeight; introCamera.updateProjectionMatrix();
    introRenderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  });
}

// ---------------- Viewer (re-uses procedural model) ----------------
let viewerRenderer, viewerScene, viewerCamera, viewerControls;
function initViewer(container){
  container.innerHTML='';
  const canvas = document.createElement('canvas'); canvas.style.width='100%'; canvas.style.height='100%';
  container.appendChild(canvas);
  viewerRenderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  viewerRenderer.setPixelRatio(window.devicePixelRatio);
  viewerRenderer.setSize(container.clientWidth, container.clientHeight, false);
  viewerScene = new THREE.Scene();
  viewerCamera = new THREE.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 1000);
  viewerCamera.position.set(0,0,2.5);
  viewerScene.add(new THREE.HemisphereLight(0xffffff,0x444444,1.0));
  viewerScene.add(new THREE.DirectionalLight(0xffffff,0.6));
  viewerControls = new THREE.OrbitControls(viewerCamera, viewerRenderer.domElement);
  viewerControls.enableDamping = true;
  animateViewer();
  window.addEventListener('resize', ()=> {
    viewerCamera.aspect = container.clientWidth/container.clientHeight; viewerCamera.updateProjectionMatrix();
    viewerRenderer.setSize(container.clientWidth, container.clientHeight, false);
  });
}

function animateViewer(){
  requestAnimationFrame(animateViewer);
  if(viewerControls) viewerControls.update();
  if(viewerRenderer && viewerScene && viewerCamera) viewerRenderer.render(viewerScene, viewerCamera);
}

function openViewer(product){
  productInfo.innerHTML = `<h2>${product.title}</h2><p>${product.description}</p><p>Price: $${product.price}</p>`;
  viewerDialog.showModal();
  initViewer(viewerEl);
  const model = buildSunglasses(product.variant || 'aviator');
  model.rotation.y = Math.PI;
  viewerScene.clear();
  viewerScene.add(new THREE.AmbientLight(0x222222, 0.8));
  viewerScene.add(new THREE.DirectionalLight(0xffffff, 0.8));
  viewerScene.add(model);
}

// ---------------- Procedural sunglasses builder ----------------
function buildSunglasses(style){
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({color:0x111111, metalness:0.6, roughness:0.3});
  const lensMat = new THREE.MeshStandardMaterial({color:0x101018, metalness:0.1, roughness:0.2, transparent:true, opacity:0.95});
  if(style==='aviator'){
    const left = new THREE.Mesh(new THREE.SphereGeometry(0.22,24,16), lensMat);
    left.scale.set(1.2,0.85,0.2);
    left.position.set(-0.35,0,0);
    const right = left.clone(); right.position.set(0.35,0,0);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.04,0.02), frameMat); bridge.position.set(0,0,0.05);
    const rimL = new THREE.Mesh(new THREE.TorusGeometry(0.25,0.03,8,60), frameMat); rimL.position.set(-0.35,0,0.01); rimL.rotation.y = Math.PI/2;
    const rimR = rimL.clone(); rimR.position.set(0.35,0,0.01);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.04,0.04), frameMat); armL.position.set(-0.9,0.02,-0.02); armL.rotation.z = 0.15;
    const armR = armL.clone(); armR.position.set(0.9,0.02,-0.02); armR.rotation.z = -0.15;
    group.add(left,right,bridge,rimL,rimR,armL,armR);
  } else {
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.34,0.26,0.12), lensMat); left.position.set(-0.37,0,0);
    const right = left.clone(); right.position.set(0.37,0,0);
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.38,0.3,0.06), frameMat); frameL.position.set(-0.37,0,0.03);
    const frameR = frameL.clone(); frameR.position.set(0.37,0,0.03);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14,0.06,0.06), frameMat); bridge.position.set(0,0,0.06);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.64,0.04,0.04), frameMat); armL.position.set(-0.95,0.02,-0.02); armL.rotation.z = 0.12;
    const armR = armL.clone(); armR.position.set(0.95,0.02,-0.02); armR.rotation.z = -0.12;
    group.add(frameL,frameR,left,right,bridge,armL,armR);
  }
  return group;
}

// close viewer
document.getElementById('closeViewer').addEventListener('click', ()=> viewerDialog.close());
