// Featured showcase: match the responsive catalog columns and stop at the final page.
(() => {
  let page = 0;
  const perPage = () => window.matchMedia('(max-width:620px)').matches ? 1 : window.matchMedia('(max-width:900px)').matches ? 2 : 4;
  const lastPage = count => Math.max(0, Math.ceil(count / perPage()) - 1);

  renderTop = function() {
    const c = $('topSellers'); if (!c) return;
    const featured = state.products.filter(p => p.featured === true).sort(sortSales).slice(0, 6);
    const maxPage = lastPage(featured.length);
    page = Math.min(page, maxPage);
    c.innerHTML = '';
    featured.forEach(p => c.appendChild(card(p)));
    requestAnimationFrame(() => move(false));
  };

  scrollTop = function(direction) {
    const c = $('topSellers'); if (!c) return;
    const maxPage = lastPage(c.children.length);
    if (maxPage <= 0) { updateControls(); return; }

    const nextPage = Math.max(0, Math.min(maxPage, page + (direction > 0 ? 1 : -1)));
    if (nextPage === page) { updateControls(); return; }

    page = nextPage;
    move(true);
  };

  function move(smooth) {
    const c = $('topSellers'); if (!c) return;
    const count = c.children.length;
    const visible = perPage();
    page = Math.min(page, lastPage(count));
    // Keep the last group filled when the remaining items are fewer than a full row.
    const first = Math.min(page * visible, Math.max(0, count - visible));
    const target = c.children[first];
    c.scrollTo({ left: target ? target.offsetLeft - c.offsetLeft : 0, behavior: smooth ? 'smooth' : 'instant' });

    let status = $('v4TopStatus');
    const controls = document.querySelector('.carousel-controls');
    if (!status && controls) {
      status = document.createElement('span');
      status.id = 'v4TopStatus';
      status.className = 'v4-top-status';
      controls.insertBefore(status, controls.firstChild);
    }
    if (status) {
      const start = count ? first + 1 : 0;
      status.textContent = `${start}–${Math.min(first + visible, count)} / ${count}`;
    }
    updateControls();
  }

  function updateControls() {
    const c = $('topSellers'); if (!c) return;
    const maxPage = lastPage(c.children.length);
    const controls = document.querySelector('.carousel-controls');
    if (controls) controls.hidden = c.children.length <= perPage();
    $('topPrev')?.toggleAttribute('disabled', page <= 0);
    $('topNext')?.toggleAttribute('disabled', page >= maxPage);
  }
  window.addEventListener('resize', () => move(false));
})();
