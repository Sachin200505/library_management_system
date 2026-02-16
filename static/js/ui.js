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

  // Stack tables on small screens by copying headers into data-labels
  const enhanceTables = () => {
    document.querySelectorAll('.table-modern table').forEach((table) => {
      const headers = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim());
      table.classList.add('table-stack');
      table.querySelectorAll('tbody tr').forEach((row) => {
        row.querySelectorAll('td').forEach((td, idx) => {
          if (!td.dataset.label) {
            td.dataset.label = headers[idx] || '';
          }
        });
      });
    });
  };

  // Simple paginator that works with duplicated desktop/mobile rows via shared data-book-id
  const paginateContainers = () => {
    document.querySelectorAll('[data-paginate]').forEach((container) => {
      const pageSize = parseInt(container.dataset.pageSize || '10', 10);
      const rowSelector = container.dataset.rowSelector || '.js-item';
      const paginationSelector = container.dataset.pagination;
      const paginationEl = paginationSelector ? document.querySelector(paginationSelector) : container.querySelector('[data-pagination]');
      if (!paginationEl) return;

      const rows = Array.from(container.querySelectorAll(rowSelector));
      const groups = new Map();
      rows.forEach((row, idx) => {
        const key = row.dataset.bookId || row.dataset.itemId || row.dataset.id || row.dataset.key || `row-${idx}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
      });

      const visibleKeys = Array.from(groups.entries()).filter(([, list]) => list.some((el) => el.style.display !== 'none' && !el.dataset.searchHidden));
      const pageCount = Math.max(1, Math.ceil(visibleKeys.length / pageSize));
      const current = Math.min(Math.max(parseInt(container.dataset.page || '1', 10), 1), pageCount);
      container.dataset.page = current;

      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      const keysToShow = new Set(visibleKeys.slice(start, end).map(([key]) => key));

      groups.forEach((list, key) => {
        const shouldShow = keysToShow.has(key);
        list.forEach((el) => {
          if (shouldShow && !el.dataset.searchHidden) {
            el.style.display = '';
            el.dataset.paginatedHidden = '';
          } else {
            el.style.display = 'none';
            el.dataset.paginatedHidden = '1';
          }
        });
      });

      paginationEl.innerHTML = '';
      if (pageCount <= 1) return;

      const addPage = (page, label, disabled = false, active = false) => {
        const li = document.createElement('li');
        li.className = `page-item${disabled ? ' disabled' : ''}${active ? ' active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = label;
        a.dataset.page = page;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          if (disabled) return;
          container.dataset.page = page;
          paginateContainers();
        });
        li.appendChild(a);
        paginationEl.appendChild(li);
      };

      addPage(current - 1, 'Prev', current === 1);
      for (let i = 1; i <= pageCount; i += 1) {
        addPage(i, i, false, i === current);
      }
      addPage(current + 1, 'Next', current === pageCount);
    });
  };

  enhanceTables();
  paginateContainers();

  // Live filter helper
  document.querySelectorAll('[data-search-input]')?.forEach(input => {
    const targetSelector = input.dataset.searchTarget;
    if (!targetSelector) return;
    const rows = document.querySelectorAll(targetSelector);
    input.addEventListener('input', () => {
      const term = input.value.toLowerCase();
      rows.forEach(row => {
        const value = (row.dataset.searchValue || '').toLowerCase();
        const match = value.includes(term);
        row.style.display = match ? '' : 'none';
        if (match) {
          delete row.dataset.searchHidden;
        } else {
          row.dataset.searchHidden = '1';
        }
      });
      document.dispatchEvent(new CustomEvent('list:filtered'));
    });
  });

  document.addEventListener('list:filtered', paginateContainers);

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
