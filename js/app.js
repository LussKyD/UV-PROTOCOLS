
window.addEventListener('load', ()=>{

  const logo = document.getElementById('logo3d');
  logo.setAttribute('data-text', logo.textContent);

  const wrap = document.getElementById('logoWrap');
  let t = 0;
  let raf;
  function loop(){
    t += 0.01;
    const rx = Math.sin(t)*6;
    const ry = Math.cos(t*0.7)*6;
    logo.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  const enter = document.getElementById('enterBtn');
  const catalog = document.getElementById('catalog');
  enter.addEventListener('click', ()=>{
    if (raf) cancelAnimationFrame(raf);
    document.querySelector('.hero').style.transition = 'opacity 0.45s ease';
    document.querySelector('.hero').style.opacity = '0';
    setTimeout(()=> {
      document.querySelector('.hero').classList.add('hidden');
      catalog.classList.remove('hidden');
      loadProducts();
      window.scrollTo({top:0,behavior:'smooth'});
    },480);
  });

  function loadProducts(){
    const items = [
      { id:'vx1', title:'VX-01 Glasses', price:'KSh 7,900', img:'img/p1.png', sold:false},
      { id:'vx2', title:'VX-02 Edge', price:'KSh 9,200', img:'img/p2.png', sold:false},
      { id:'vx3', title:'VX-03 Phantom', price:'KSh 6,900', img:'img/p3.png', sold:true}
    ];
    const html = items.map(it=>{
      return `<article class="card" tabindex="0" role="button" aria-pressed="${!it.sold}">
        ${it.sold?'<div class="sold" aria-hidden="true" style="color:#ff6b6b;font-weight:700;margin-bottom:8px">SOLD</div>':''}
        <img src="${it.img}" alt="${it.title}">
        <h3>${it.title}</h3>
        <p>${it.price}</p>
      </article>`;
    }).join('');
    catalog.innerHTML = html;
  }

});
