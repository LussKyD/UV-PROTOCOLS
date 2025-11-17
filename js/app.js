async function loadProducts(){
 try{
  let r=await fetch('products.json');
  let data=await r.json();
  return data;
 }catch(e){
  document.getElementById('errorBox').textContent='Failed to load products.json';
  return [];
 }
}

function init3D(){
 const viewer=document.getElementById('viewer');
 const scene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(60, viewer.clientWidth/viewer.clientHeight,0.1,1000);
 const renderer=new THREE.WebGLRenderer({antialias:true});
 renderer.setSize(viewer.clientWidth, viewer.clientHeight);
 viewer.appendChild(renderer.domElement);
 camera.position.z=5;
 const light=new THREE.PointLight(0xffffff,1);
 light.position.set(10,10,10);
 scene.add(light);
 const geo=new THREE.BoxGeometry();
 const mat=new THREE.MeshStandardMaterial({color:0x996633});
 const cube=new THREE.Mesh(geo,mat);
 scene.add(cube);
 function animate(){
  requestAnimationFrame(animate);
  cube.rotation.y+=0.01;
  renderer.render(scene,camera);
 }
 animate();
}

loadProducts();
init3D();