(() => {
  const search = document.getElementById('book-search');
  const filter = document.getElementById('category-filter');
  const cards = document.querySelectorAll('.book-card');
  if (search || filter) {
    const applyFilter = () => {
      const term = (search?.value || '').toLowerCase();
      const cat = filter?.value || '';
      cards.forEach(card => {
        const matchText = (card.dataset.title || '').includes(term);
        const matchCat = !cat || card.dataset.category === cat;
        card.style.display = matchText && matchCat ? 'block' : 'none';
      });
    };
    search?.addEventListener('input', applyFilter);
    filter?.addEventListener('change', applyFilter);
  }

  // Modal population (book details)
  const modal = document.getElementById('bookModal');
  if (modal) {
    const modalTitle = modal.querySelector('[data-modal-title]');
    const modalMeta = modal.querySelector('[data-modal-meta]');
    const modalDesc = modal.querySelector('[data-modal-desc]');
    const modalAvail = modal.querySelector('[data-modal-avail]');
    modal.addEventListener('show.bs.modal', (event) => {
      const btn = event.relatedTarget;
      if (!btn) return;
      modalTitle.textContent = btn.dataset.title || '';
      modalMeta.textContent = `${btn.dataset.author || ''} · ${btn.dataset.category || ''}`;
      modalDesc.textContent = btn.dataset.desc || 'No description available.';
      modalAvail.textContent = btn.dataset.available || '0';
    });
  }
})();
