// ══════════════════════════════════════════════════════════════
// COMBOBOX CON BUSCADOR — reemplaza el comportamiento nativo del
// <select>, que solo busca por la LETRA INICIAL del texto.
// Con esto se puede escribir cualquier palabra en cualquier parte
// del nombre (ej. "impulsor") y encuentra la opción aunque el
// texto completo empiece con otra cosa (ej. "Arranque Despiece | ...").
//
// NO TOCA DATOS: el <select> original sigue existiendo tal cual
// (oculto), con el mismo id, se sigue poblando con el mismo código
// de siempre (sel.innerHTML = ...) y sigue disparando el mismo
// onchange="..." que ya tenía. Este script es 100% visual.
//
// Uso: makeSearchableSelect('id-del-select');
// ══════════════════════════════════════════════════════════════

window.makeSearchableSelect = function (selectId) {
  const sel = document.getElementById(selectId);
  if (!sel || sel._searchified) return; // ya envuelto, no duplicar
  sel._searchified = true;

  // ── Armamos el wrapper y el input visible que reemplaza al select ──
  const wrap = document.createElement('div');
  wrap.className = 'searchsel-wrap';
  const inlineStyle = sel.getAttribute('style'); // ej: width:170px;font-size:12px
  if (inlineStyle) wrap.style.cssText = inlineStyle; // mantiene el tamaño/posición que ya tenía el select
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add('searchsel-native'); // el select real queda oculto (display:none por CSS)

  const input = document.createElement('input');
  input.type = 'text';
  input.className = (sel.className || 'form-select').replace('searchsel-native', '').trim() + ' searchsel-input';
  input.autocomplete = 'off';
  input.spellcheck = false;
  wrap.appendChild(input);

  const list = document.createElement('div');
  list.className = 'searchsel-list';
  wrap.appendChild(list);

  let activeIdx = -1;

  function optsFromSelect() {
    return [...sel.options].map(o => ({ value: o.value, text: o.text }));
  }

  function renderList(filter) {
    const q = (filter || '').toLowerCase();
    const opts = optsFromSelect().filter(o => !q || o.text.toLowerCase().includes(q));
    list.innerHTML = opts.length
      ? opts.map(o =>
          `<div class="searchsel-opt${o.value === sel.value ? ' sel' : ''}" data-value="${o.value.replace(/"/g, '&quot;')}">${o.text}</div>`
        ).join('')
      : '<div class="searchsel-empty">Sin resultados</div>';
    activeIdx = -1;
  }

  function syncInputFromSelect() {
    const cur = sel.options[sel.selectedIndex];
    input.value = cur ? cur.text : '';
  }

  // Si en cualquier parte del código original se hace sel.value = "..."
  // a mano (ej: precargar la categoría al editar un repuesto), esto lo
  // detecta y actualiza el input visible automáticamente.
  const nativeValueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(sel, 'value', {
    get() { return nativeValueDesc.get.call(sel); },
    set(v) { nativeValueDesc.set.call(sel, v); syncInputFromSelect(); },
    configurable: true
  });

  function openList() { renderList(''); list.style.display = 'block'; }
  function closeList() { list.style.display = 'none'; }

  function chooseValue(val) {
    sel.value = val;
    sel.dispatchEvent(new Event('change', { bubbles: true })); // dispara el onchange="" original
    syncInputFromSelect();
    closeList();
  }

  input.addEventListener('focus', () => { input.select(); openList(); });
  input.addEventListener('input', () => { renderList(input.value); list.style.display = 'block'; });

  input.addEventListener('keydown', (e) => {
    const items = [...list.querySelectorAll('.searchsel-opt')];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list.style.display !== 'block') { openList(); return; }
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
      items.forEach(it => it.classList.remove('active'));
      items[activeIdx]?.classList.add('active');
      items[activeIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      items.forEach(it => it.classList.remove('active'));
      items[activeIdx]?.classList.add('active');
      items[activeIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[activeIdx] || items[0];
      if (it) chooseValue(it.dataset.value);
    } else if (e.key === 'Escape') {
      closeList();
      syncInputFromSelect();
      input.blur();
    }
  });

  list.addEventListener('mousedown', (e) => {
    const opt = e.target.closest('.searchsel-opt');
    if (!opt) return;
    chooseValue(opt.dataset.value);
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) { closeList(); syncInputFromSelect(); }
  });

  // Si el código original repuebla el <select> más tarde (ej: options
  // que llegan de Firestore después de cargar la página), lo detectamos
  // acá y refrescamos el input/la lista automáticamente.
  new MutationObserver(() => {
    syncInputFromSelect();
    if (list.style.display === 'block') renderList(input.value);
  }).observe(sel, { childList: true });

  syncInputFromSelect();
};
