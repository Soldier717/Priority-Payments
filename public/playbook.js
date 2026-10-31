(function(){
  var views=['start','spot','introduce','handoff','problems','offer','contact'];
  function show(){
    var h=(location.hash||'').replace('#','');
    if(views.indexOf(h)<0)h='start';
    views.forEach(function(v){var s=document.getElementById('pb-'+v);if(s)s.classList.toggle('on',v===h);});
    document.querySelectorAll('.pb-nav a').forEach(function(a){
      if(a.dataset.v===h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    var m=document.querySelector('.pb-shell');if(m&&window.scrollY>160)m.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange',show);show();
  document.querySelectorAll('.pb-copy').forEach(function(b){
    b.addEventListener('click',function(){
      var el=document.getElementById(b.dataset.copy);if(!el)return;
      function done(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy';},1500);}
      function fallback(){try{var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected';setTimeout(function(){b.textContent='Copy';},1500);}catch(e){}}
      try{navigator.clipboard.writeText(el.textContent).then(done,fallback);}catch(e){fallback();}
    });
  });
})();
