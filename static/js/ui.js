(() => {
  const body = document.body;
  const spinner = document.getElementById('page-spinner');

  // Loading spinner on submit
  document.querySelectorAll('form[data-loading]')?.forEach(form => {
    form.addEventListener('submit', () => spinner?.classList.remove('d-none'));
  });

  // Confirm helpers
  document.querySelectorAll('[data-confirm]')?.forEach(el => {
    el.addEventListener('click', (ev) => {
      if (!confirm(el.dataset.confirm || 'Are you sure?')) {
        ev.preventDefault();
      }
    });
  });

  // Auto dismiss toasts
  document.querySelectorAll('.toast-card[data-auto-dismiss]')?.forEach(toast => {
    setTimeout(() => toast.classList.add('animate-fade-out'), toast.dataset.autoDismiss || 4200);
    toast.addEventListener('animationend', () => toast.remove());
  });

  // Ripple effect
  const addRipple = (e) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'btn-ripple';
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  document.querySelectorAll('.btn, .btn-gradient')?.forEach(btn => {
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', addRipple);
  });

  // Sidebar toggle (mobile)
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarBackdrop = document.querySelector('.sidebar-backdrop');
  const closeSidebar = () => body.classList.remove('sidebar-open');
  sidebarToggle?.addEventListener('click', () => {
    body.classList.toggle('sidebar-open');
  });
  sidebarBackdrop?.addEventListener('click', closeSidebar);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Live filter helper
  document.querySelectorAll('[data-search-input]')?.forEach(input => {
    const targetSelector = input.dataset.searchTarget;
    if (!targetSelector) return;
    const rows = document.querySelectorAll(targetSelector);
    input.addEventListener('input', () => {
      const term = input.value.toLowerCase();
      rows.forEach(row => {
        const value = (row.dataset.searchValue || '').toLowerCase();
        row.style.display = value.includes(term) ? '' : 'none';
      });
    });
  });

  // Fine preview: data-fine-preview="{daysLate}" -> update target span
  document.querySelectorAll('[data-fine-preview]')?.forEach(input => {
    const targetId = input.dataset.fineTarget;
    const rate = parseFloat(input.dataset.fineRate || '1');
    const target = targetId ? document.getElementById(targetId) : null;
    const update = () => {
      const days = parseInt(input.value || '0', 10) || 0;
      const fine = Math.max(days, 0) * rate;
      if (target) target.textContent = fine.toFixed(2);
    };
    input.addEventListener('input', update);
    update();
  });
})();
