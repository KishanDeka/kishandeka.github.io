(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const slides = [...root.querySelectorAll('.slide')];
    const track = root.querySelector('.slide-track');
    const dots = [...root.querySelectorAll('[data-slide]')];
    const play = root.querySelector('[data-play]');
    const windowEl = root.querySelector('.slide-window');
    let index = 0, paused = true, hovered = false, focused = false, visible = true, timer, touch;
    const playingVideo = () => slides.some(s => [...s.querySelectorAll('video')].some(v => !v.paused));
    function playLabel() {
      play.textContent = paused ? 'Play' : 'Pause';
      play.setAttribute('aria-label', `${paused ? 'Start' : 'Pause'} automatic sliding`);
      play.setAttribute('aria-pressed', String(!paused));
    }
    function render(announce) {
      track.style.transform = `translateX(-${100 * index}%)`;
      slides.forEach((slide,i) => {
        slide.inert = i !== index;
        slide.setAttribute('aria-hidden', String(i !== index));
        if (i !== index) slide.querySelectorAll('video').forEach(video => video.pause());
      });
      dots.forEach((dot,i) => dot.setAttribute('aria-pressed', String(i === index)));
      root.querySelector('[data-count]').textContent = `${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
      if (announce) root.querySelector('[data-announcement]').textContent = `Slide ${index+1} of ${slides.length}: ${slides[index].querySelector('h3').textContent}`;
    }
    function schedule() {
      clearTimeout(timer);
      if (paused || hovered || focused || !visible || document.hidden || slides.length < 2) return;
      timer = setTimeout(() => {
        if (!playingVideo()) { index = (index+1) % slides.length; render(false); }
        schedule();
      }, 5500);
    }
    function move(delta) { index = (index+delta+slides.length)%slides.length; render(true); schedule(); }
    root.querySelector('[data-prev]').addEventListener('click', () => move(-1));
    root.querySelector('[data-next]').addEventListener('click', () => move(1));
    dots.forEach((dot,i) => dot.addEventListener('click', () => { index=i; render(true); schedule(); }));
    play.addEventListener('click', () => { paused=!paused; playLabel(); schedule(); });
    root.addEventListener('mouseenter', () => { hovered=true; schedule(); });
    root.addEventListener('mouseleave', () => { hovered=false; schedule(); });
    root.addEventListener('focusin', () => { focused=true; schedule(); });
    root.addEventListener('focusout', event => { focused=root.contains(event.relatedTarget); schedule(); });
    root.addEventListener('keydown', event => {
      if (event.target.closest('video') || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const wasInSlide = !!event.target.closest('.slide');
      move(event.key==='ArrowRight' ? 1 : -1);
      if (wasInSlide) dots[index].focus();
    });
    windowEl.addEventListener('touchstart', event => {
      if (event.target.closest('video')) return;
      touch = [event.changedTouches[0].clientX,event.changedTouches[0].clientY];
    }, {passive:true});
    windowEl.addEventListener('touchend', event => {
      if (!touch) return;
      const dx=event.changedTouches[0].clientX-touch[0],dy=event.changedTouches[0].clientY-touch[1];
      touch=null;
      if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)) move(dx<0 ? 1 : -1);
    }, {passive:true});
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      visible=entries[0].isIntersecting;
      if (!visible) slides.forEach(s=>s.querySelectorAll('video').forEach(v=>v.pause()));
      schedule();
    }, {threshold:0.15}).observe(root);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) slides.forEach(s=>s.querySelectorAll('video').forEach(v=>v.pause()));
      schedule();
    });
    motion.addEventListener('change', event => { if(event.matches) {paused=true;playLabel();schedule();} });
    playLabel();render(false);schedule();
  });
  const filters=[...document.querySelectorAll('[data-skill-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const category=button.dataset.skillFilter;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let count=0;
    document.querySelectorAll('[data-skill-category]').forEach(item=>{
      item.hidden=category!=='All' && item.dataset.skillCategory!==category;
      if(!item.hidden) count++;
    });
    document.querySelector('[data-skill-status]').textContent=`${count} ${category==='All'?'technical skills':category.toLowerCase()} shown`;
  }));
  // Brand images are optional; local typographic marks remain usable offline.
  document.querySelectorAll('[data-brand-logo]').forEach(img=>{
    const failed=()=>{img.hidden=true;};
    img.addEventListener('error',failed);
    if(img.complete && img.naturalWidth===0) failed();
  });
})();
