
/*
viewer.js
Attempts to load a local models GLB. If model path is empty or missing, falls back to Sketchfab embed.
Uses dynamic module imports for three.js to avoid blocking.
*/
export async function initViewer(containerId, modelUrl){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = '';
  // if no model specified -> fallback to sketchfab embed
  if(!modelUrl){
    const iframe = document.createElement('iframe');
    iframe.src = 'https://sketchfab.com/models/150133390eb64efa8da25a66bb11b79f/embed';
    iframe.style.width='100%'; iframe.style.height='100%'; iframe.style.border='0'; iframe.setAttribute('title','Sketchfab embed');
    container.appendChild(iframe);
    return;
  }
  try{
    // check existence
    const head = await fetch(modelUrl, {method:'HEAD'});
    if(!head.ok) throw new Error('Model not found');
  }catch(e){
    // fallback iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://sketchfab.com/models/150133390eb64efa8da25a66bb11b79f/embed';
    iframe.style.width='100%'; iframe.style.height='100%'; iframe.style.border='0'; iframe.setAttribute('title','Sketchfab embed');
    container.appendChild(iframe);
    return;
  }

  // load three modules
  const THREE = await import('https://unpkg.com/three@0.152.2/build/three.module.js');
  const { GLTFLoader } = await import('https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js');
  const { OrbitControls } = await import('https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js');

  const canvas = document.createElement('canvas'); canvas.style.width='100%'; canvas.style.height='100%';
  container.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  const rect = container.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, rect.width/rect.height, 0.1, 50);
  camera.position.set(0,0.8,1.8);

  const hemi = new THREE.HemisphereLight(0xffffff,0x444444,0.9); scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(5,10,7); scene.add(dir);

  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0,0,0);

  const loader = new GLTFLoader();
  loader.load(modelUrl, (gltf)=>{
    const model = gltf.scene || gltf.scenes[0];
    model.rotation.y = Math.PI;
    scene.add(model);
    // auto-scale & center
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    const scale = 1.2 / size;
    model.scale.setScalar(scale);
  }, undefined, (err)=>{
    console.error('GLTF load error', err);
    container.innerHTML = '<p style="color:#f66">Model failed to load — showing embed.</p>';
    const iframe = document.createElement('iframe');
    iframe.src = 'https://sketchfab.com/models/150133390eb64efa8da25a66bb11b79f/embed';
    iframe.style.width='100%'; iframe.style.height='100%'; iframe.style.border='0';
    container.appendChild(iframe);
  });

  function animate(){ requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); }
  animate();
  window.addEventListener('resize', ()=>{
    const r = container.getBoundingClientRect();
    renderer.setSize(r.width, r.height);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  });
}
