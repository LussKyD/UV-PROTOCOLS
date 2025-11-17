const catalogEl=document.getElementById('catalog');
const viewerDialog=document.getElementById('viewerDialog');
const viewerEl=document.getElementById('viewer');
const productInfo=document.getElementById('productInfo');
document.getElementById('closeViewer').onclick=()=>viewerDialog.close();

fetch('products.json').then(r=>r.json()).then(products=>{
    products.forEach(p=>{
        const el=document.createElement('div');
        el.className='card';
        el.innerHTML=`${p.available?'':'<div class="sold">SOLD</div>'}
        <img src="${p.image}">
        <h3>${p.title}</h3><p>${p.description}</p>
        <button class="viewBtn">View</button>`;
        el.querySelector('.viewBtn').onclick=()=>openViewer(p);
        catalogEl.appendChild(el);
    });
});

function openViewer(p){
    productInfo.innerHTML=`<h2>${p.title}</h2><p>${p.description}</p>`;
    viewerDialog.showModal();
    loadModel(p);
}

function loadModel(p){
    viewerEl.innerHTML='';
    const img=document.createElement('img');
    img.src=p.image;
    img.style="max-width:100%;max-height:100%;object-fit:contain";
    const loader=new THREE.GLTFLoader();
    loader.load(p.model, gltf=>{
        try{
            viewerEl.innerHTML='';
            const canvas=document.createElement('canvas');
            viewerEl.appendChild(canvas);
            const renderer=new THREE.WebGLRenderer({canvas});
            renderer.setSize(viewerEl.clientWidth,viewerEl.clientHeight);
            const scene=new THREE.Scene();
            const cam=new THREE.PerspectiveCamera(45,viewerEl.clientWidth/viewerEl.clientHeight);
            cam.position.set(0,0,2);
            const light=new THREE.HemisphereLight(0xffffff,0x444444,1);
            scene.add(light);
            scene.add(gltf.scene);
            function anim(){requestAnimationFrame(anim);renderer.render(scene,cam);}
            anim();
        }catch(e){fallback();}
    },err=>fallback());

    function fallback(){viewerEl.innerHTML='';viewerEl.appendChild(img);}
}
