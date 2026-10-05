/* متجر ياسر أبو الشيخ — دوال مشتركة */
const API = "";

/* تنسيق السعر بالليرة السورية */
function fmt(n) {
  return Number(n || 0).toLocaleString("en-US") + " ل.س";
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || data.message || "حدث خطأ");
  return data;
}

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(t._h);
  t._h = setTimeout(() => (t.style.display = "none"), 2600);
}

/* ---------- السلة (localStorage) ---------- */
const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem("ys_cart") || "[]"); } catch { return []; }
  },
  save(items) {
    localStorage.setItem("ys_cart", JSON.stringify(items));
    Cart.badge();
  },
  add(id, qty = 1) {
    const items = Cart.get();
    const it = items.find((i) => i.id === id);
    if (it) it.qty = Math.min(20, it.qty + qty);
    else items.push({ id, qty });
    Cart.save(items);
    toast("✅ أُضيف إلى السلة");
  },
  setQty(id, qty) {
    let items = Cart.get();
    if (qty <= 0) items = items.filter((i) => i.id !== id);
    else items.forEach((i) => { if (i.id === id) i.qty = qty; });
    Cart.save(items);
  },
  remove(id) { Cart.setQty(id, 0); },
  clear() { Cart.save([]); },
  count() { return Cart.get().reduce((s, i) => s + i.qty, 0); },
  badge() {
    document.querySelectorAll(".cart-btn .count").forEach((el) => {
      el.textContent = Cart.count();
      el.style.display = Cart.count() ? "grid" : "none";
    });
  },
};

function stars(r) {
  r = Math.round(Number(r) || 5);
  return "★".repeat(r) + "☆".repeat(5 - r);
}

function productCard(p) {
  const img = (p.images && p.images[0]) || "/img/placeholder.webp";
  const disc = p.old_price && p.old_price > p.price
    ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  return `
  <div class="card">
    ${disc ? `<span class="badge">خصم ${disc}%</span>` : (p.featured ? `<span class="badge goldb">مميز</span>` : "")}
    <a href="/product.html?id=${p.id}"><div class="img"><img src="${img}" alt="${p.name}" loading="lazy"></div></a>
    <div class="body">
      <div class="cat">${catName(p.category)}</div>
      <h3><a href="/product.html?id=${p.id}">${p.name}</a></h3>
      <div class="rating">${stars(p.rating)} <span style="color:var(--muted)">(${p.reviews_count})</span></div>
      <div class="price-row" style="margin-top:8px">
        <span class="price">${fmt(p.price)}</span>
        ${p.old_price ? `<span class="old-price">${fmt(p.old_price)}</span>` : ""}
      </div>
      <div class="actions">
        <button class="btn" onclick="Cart.add(${p.id});event.stopPropagation()">🛒 أضف للسلة</button>
        <a class="btn ghost" href="/product.html?id=${p.id}">التفاصيل</a>
      </div>
    </div>
  </div>`;
}

let _catMap = {};
async function loadCats() {
  try {
    const cats = await api("/api/categories");
    _catMap = Object.fromEntries(cats.map((c) => [c.slug, c.name]));
    return cats;
  } catch { return []; }
}
function catName(slug) { return _catMap[slug] || slug; }

document.addEventListener("DOMContentLoaded", () => Cart.badge());
