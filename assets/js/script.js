/* Habi Wear - shared script for all pages. Frontend-only demo. */
(() => {
  "use strict";
  const ROOT = document.body.dataset.root || "";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const peso = n => "₱" + n.toLocaleString("en-PH");
  const byId = id => PRODUCTS.find(p => p.id === id);

  /* ---------- localStorage helpers (fail safely) ---------- */
  const store = {
    get(k, fallback) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };
  let cart = store.get("habi-cart", []).filter(i => byId(i.id) && i.qty > 0);
  let wish = store.get("habi-wish", []);
  let promo = store.get("habi-promo", "");
  const saveCart = () => { store.set("habi-cart", cart); updateBadge(); };

  /* ---------- Feature 1: shopping cart ---------- */
  function addToCart(id, size, qty = 1) {
    const line = cart.find(i => i.id === id && i.size === size);
    if (line) line.qty = Math.min(10, line.qty + qty); else cart.push({ id, size, qty });
    saveCart();
  }
  function updateBadge() {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    $$(".cart-count").forEach(b => { b.textContent = n; b.setAttribute("aria-label", n + " items in cart"); });
  }
  function showToast(msg) {
    const el = $("#toast"); if (!el) return;
    $(".toast-body", el).textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
  }

  /* ---------- Feature 2: wishlist ---------- */
  function toggleWish(id) {
    wish = wish.includes(id) ? wish.filter(w => w !== id) : [...wish, id];
    store.set("habi-wish", wish);
    return wish.includes(id);
  }

  /* ---------- Product cards + quick view ---------- */
  function cardHTML(p) {
    const saved = wish.includes(p.id);
    return `<div class="col-6 col-lg-4 col-xl-3"><article class="product-card h-100">
      <div class="product-media">
        <img src="${ROOT}assets/images/${p.id}.svg" alt="${p.name}, ${p.category.toLowerCase()}" width="400" height="500" loading="lazy">
        ${p.badge ? `<span class="badge-tag">${p.badge}</span>` : ""}
        <button type="button" class="wish-btn" data-wish="${p.id}" aria-pressed="${saved}" aria-label="Save ${p.name} to wishlist">${saved ? "♥" : "♡"}</button>
      </div>
      <div class="product-body">
        <h3>${p.name}</h3><p class="text-muted small mb-2">${p.category}</p>
        <div class="d-flex justify-content-between align-items-center gap-2">
          <strong>${peso(p.price)}</strong>
          <button type="button" class="btn btn-sm btn-ink" data-quick="${p.id}">Choose size</button>
        </div></div></article></div>`;
  }
  let quickId = null;
  function openQuick(id) {
    const p = byId(id), modalEl = $("#quickModal"); if (!p || !modalEl) return;
    quickId = id;
    $("#qvImg").src = `${ROOT}assets/images/${p.id}.svg`; $("#qvImg").alt = p.name;
    $("#qvName").textContent = p.name; $("#qvPrice").textContent = peso(p.price); $("#qvDesc").textContent = p.desc;
    $("#qvSizes").innerHTML = p.sizes.map((s, i) =>
      `<input type="radio" class="btn-check" name="qvSize" id="sz${i}" value="${s}" ${i === 0 ? "checked" : ""}>
       <label class="btn btn-outline-ink" for="sz${i}">${s}</label>`).join("");
    $("#qvQty").value = 1;
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }
  document.addEventListener("click", e => {
    const q = e.target.closest("[data-quick]"); if (q) return openQuick(q.dataset.quick);
    const w = e.target.closest("[data-wish]");
    if (w) {
      const on = toggleWish(w.dataset.wish);
      w.setAttribute("aria-pressed", on); w.textContent = on ? "♥" : "♡";
      showToast(on ? "Saved to your wishlist." : "Removed from your wishlist.");
      if (typeof renderShop === "function" && $("#wishOnly")?.checked) renderShop();
    }
  });
  $("#qvAdd")?.addEventListener("click", () => {
    const size = $('input[name="qvSize"]:checked')?.value;
    const qty = Math.max(1, Math.min(10, parseInt($("#qvQty").value, 10) || 1));
    addToCart(quickId, size, qty);
    bootstrap.Modal.getInstance($("#quickModal")).hide();
    showToast(`${byId(quickId).name} (${size}) added to cart.`);
  });

  /* ---------- Home: featured products ---------- */
  const featured = $("#featuredGrid");
  if (featured) featured.innerHTML = PRODUCTS.filter(p => p.badge).slice(0, 4).map(cardHTML).join("");

  /* ---------- Feature 3: shop search, filter, sort ---------- */
  var renderShop;
  const grid = $("#productGrid");
  if (grid) {
    const state = { q: "", cat: new URLSearchParams(location.search).get("cat") || "All", sort: "featured", max: 2000 };
    if (state.cat !== "All" && !CATEGORIES.includes(state.cat)) state.cat = "All";
    $("#filters").innerHTML = ["All", ...CATEGORIES].map(c =>
      `<button type="button" class="btn btn-outline-ink" data-cat="${c}" aria-pressed="${c === state.cat}">${c}</button>`).join("");
    renderShop = () => {
      const wishOnly = $("#wishOnly").checked;
      let list = PRODUCTS.filter(p =>
        (state.cat === "All" || p.category === state.cat) && p.price <= state.max &&
        (!wishOnly || wish.includes(p.id)) &&
        (p.name + " " + p.category + " " + p.desc).toLowerCase().includes(state.q));
      const sorts = { "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name) };
      if (sorts[state.sort]) list.sort(sorts[state.sort]);
      grid.innerHTML = list.map(cardHTML).join("");
      $("#emptyState").classList.toggle("d-none", list.length > 0);
      $("#resultCount").textContent = `${list.length} ${list.length === 1 ? "item" : "items"} shown`;
      $$("#filters button").forEach(b => { const on = b.dataset.cat === state.cat; b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
    };
    $("#search").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); renderShop(); });
    $("#sort").addEventListener("change", e => { state.sort = e.target.value; renderShop(); });
    $("#priceRange").addEventListener("input", e => { state.max = +e.target.value; $("#priceOut").textContent = peso(state.max); renderShop(); });
    $("#wishOnly").addEventListener("change", renderShop);
    $("#filters").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) { state.cat = b.dataset.cat; renderShop(); } });
    $("#resetFilters").addEventListener("click", () => {
      Object.assign(state, { q: "", cat: "All", sort: "featured", max: 2000 });
      $("#search").value = ""; $("#sort").value = "featured"; $("#priceRange").value = 2000; $("#priceOut").textContent = peso(2000); $("#wishOnly").checked = false;
      renderShop();
    });
    renderShop();
  }

  /* ---------- Cart page: quantities, totals, promo ---------- */
  const PROMOS = { HABI10: 0.10 };
  function renderCart() {
    const list = $("#cartItems"); if (!list) return;
    $("#cartEmpty").classList.toggle("d-none", cart.length > 0);
    $("#cartLayout").classList.toggle("d-none", cart.length === 0);
    list.innerHTML = cart.map((i, idx) => { const p = byId(i.id); return `
      <li class="cart-row d-flex gap-3 align-items-center mb-3">
        <img src="${ROOT}assets/images/${p.id}.svg" alt="${p.name}" width="84" height="105">
        <div class="flex-grow-1">
          <h3 class="h6 mb-0">${p.name}</h3><p class="small text-muted mb-2">Size ${i.size} · ${peso(p.price)} each</p>
          <div class="d-flex align-items-center gap-2" role="group" aria-label="Quantity for ${p.name}">
            <button type="button" class="btn btn-outline-ink qty-btn" data-qty="${idx}" data-d="-1" aria-label="Decrease quantity">−</button>
            <span class="px-1" aria-live="polite">${i.qty}</span>
            <button type="button" class="btn btn-outline-ink qty-btn" data-qty="${idx}" data-d="1" aria-label="Increase quantity">+</button>
          </div></div>
        <div class="text-end"><strong>${peso(p.price * i.qty)}</strong><br>
          <button type="button" class="btn btn-link btn-sm p-0" data-remove="${idx}" aria-label="Remove ${p.name} from cart">Remove</button></div>
      </li>`; }).join("");
    const sub = cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
    const disc = Math.round(sub * (PROMOS[promo] || 0));
    const ship = sub === 0 || sub - disc >= 2000 ? 0 : 120;
    $("#subtotal").textContent = peso(sub); $("#discount").textContent = "−" + peso(disc);
    $("#shipping").textContent = ship ? peso(ship) : "Free"; $("#total").textContent = peso(sub - disc + ship);
  }
  $("#cartItems")?.addEventListener("click", e => {
    const q = e.target.closest("[data-qty]"), r = e.target.closest("[data-remove]");
    if (q) { const l = cart[+q.dataset.qty]; l.qty = Math.max(0, Math.min(10, l.qty + +q.dataset.d)); if (!l.qty) cart.splice(+q.dataset.qty, 1); }
    else if (r) cart.splice(+r.dataset.remove, 1); else return;
    saveCart(); renderCart();
  });
  $("#clearCart")?.addEventListener("click", () => { cart = []; saveCart(); renderCart(); });
  $("#promoForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const code = $("#promoCode").value.trim().toUpperCase(), fb = $("#promoMsg");
    if (PROMOS[code]) { promo = code; store.set("habi-promo", promo); fb.className = "small text-success"; fb.textContent = "Code HABI10 applied: 10% off."; }
    else { promo = ""; store.set("habi-promo", ""); fb.className = "small text-danger"; fb.textContent = code ? "That code isn't valid. Try HABI10." : "Enter a promo code first."; }
    renderCart();
  });

  /* ---------- Feature 4: checkout form validation ---------- */
  const form = $("#checkoutForm");
  if (form) {
    const rules = {
      fullName: v => /^[A-Za-zÀ-ÿ'.\- ]{2,60}$/.test(v) || "Enter your full name (letters only, at least 2 characters).",
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email, like name@example.com.",
      phone: v => /^(09|\+639)\d{9}$/.test(v.replace(/[\s-]/g, "")) || "Enter a Philippine mobile number, like 0917 123 4567.",
      address: v => v.length >= 10 || "Enter your street address (at least 10 characters).",
      city: v => v !== "" || "Choose your city or municipality.",
      payment: v => v !== "" || "Choose a payment method."
    };
    const check = el => {
      const rule = rules[el.name]; if (!rule) return true;
      const res = rule(el.value.trim()), ok = res === true;
      el.classList.toggle("is-invalid", !ok); el.classList.toggle("is-valid", ok);
      el.setAttribute("aria-invalid", !ok); $(`#${el.id}Err`).textContent = ok ? "" : res;
      return ok;
    };
    $$("input, select, textarea", form).forEach(el => { el.addEventListener("blur", () => check(el)); el.addEventListener("input", () => el.classList.contains("is-invalid") && check(el)); });
    form.addEventListener("submit", e => {
      e.preventDefault();
      const status = $("#formStatus"); status.className = "alert d-none";
      const fields = $$("input[name], select[name]", form).filter(el => rules[el.name]);
      const results = fields.map(check), terms = $("#terms");
      terms.classList.toggle("is-invalid", !terms.checked);
      if (!cart.length) { status.className = "alert alert-warning"; status.textContent = "Your cart is empty. Add an item from the shop first."; return; }
      if (results.includes(false) || !terms.checked) {
        status.className = "alert alert-danger"; status.textContent = "Please fix the highlighted fields and try again.";
        (fields.find(f => f.classList.contains("is-invalid")) || terms).focus(); return;
      }
      const ref = "HW-" + Date.now().toString().slice(-6);
      cart = []; promo = ""; store.set("habi-promo", ""); saveCart(); renderCart(); form.reset();
      $$(".is-valid", form).forEach(el => el.classList.remove("is-valid"));
      $("#cartEmpty").classList.remove("d-none");
      $("#orderMsg").innerHTML = `<div class="alert alert-success" role="status"><strong>Order placed (demo).</strong> Your reference is ${ref}. No real payment or delivery happens in this frontend demonstration.</div>`;
    });
  }

  updateBadge(); renderCart();
})();
