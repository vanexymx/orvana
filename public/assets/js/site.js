// Shared by every page: header, footer, product cards and the motion effects.
import { ORVANA as cfg } from "./config.js";

export { cfg };
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const money = (n) => `${cfg.currency}${n.toLocaleString("en-MY")}`;
export const igUrl = (handle) => `https://www.instagram.com/${handle}/`;
export const mailto = (subject, body) =>
  `mailto:${cfg.orderEmail}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const page = document.body.dataset.page;

/* ---------- Header and footer (one copy for every page) ---------- */

function renderChrome() {
  const link = (href, label, key) =>
    `<a href="${href}"${page === key ? ' aria-current="page"' : ""}>${label}</a>`;
  $("#site-header").innerHTML = `
    <div class="wrap header-inner">
      <a href="index.html" class="brand" aria-label="ORVANA home">
        <img src="assets/img/logo-mark.png" alt="" width="20" height="24">
        <img src="assets/img/logo-wordmark.png" alt="ORVANA" class="wordmark" width="100" height="18">
      </a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span></button>
      <nav class="nav" id="nav" aria-label="Main">
        ${link("products.html", "Products", "products")}
        ${link("index.html#install", "Install")}
        ${link("index.html#faq", "FAQ")}
        <a href="${esc(cfg.instagramDm)}" target="_blank" rel="noopener">Custom</a>
        <a href="order.html" class="btn btn-small">Order</a>
      </nav>
    </div>`;

  $("#site-footer").innerHTML = `
    <div class="wrap footer-inner">
      <span>© ${new Date().getFullYear()} ORVANA Automotive</span>
      <nav aria-label="Footer">
        <a href="products.html">Products</a>
        <a href="terms.html">Terms</a>
        <a href="${esc(cfg.instagram)}" target="_blank" rel="noopener">Instagram</a>
        <a href="${mailto("Question about ORVANA air ducts")}">Email</a>
      </nav>
    </div>`;

  const btn = $(".menu-btn");
  const header = $("#site-header");
  btn.addEventListener("click", () => {
    const open = header.classList.toggle("menu-open");
    btn.setAttribute("aria-expanded", open);
  });
  $("#nav").addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    header.classList.remove("menu-open");
    btn.setAttribute("aria-expanded", "false");
  });
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Building blocks ---------- */

export function productCard(p) {
  const href = p.available && p.page ? p.page : cfg.instagram;
  const ext = p.available ? "" : ' target="_blank" rel="noopener"';
  const dots = p.colours.map((c) => `<span title="${esc(c.label)}" style="background:${esc(c.hex)}"></span>`).join("");
  return `
    <article class="card product tilt reveal">
      <a class="product-img" href="${esc(href)}"${ext} tabindex="-1" aria-hidden="true">
        <img src="${esc(p.image)}" alt="" loading="lazy" style="view-transition-name: img-${esc(p.id)}">
        ${p.available ? "" : `<span class="badge badge-float">Coming soon</span>`}
      </a>
      <div class="product-body">
        <p class="eyebrow">${esc(p.car)}</p>
        <h3><a href="${esc(href)}"${ext}>${esc(p.name)}</a></h3>
        <p>${esc(p.available ? p.tagline : p.description)}</p>
        ${dots ? `<div class="dots">${dots}</div>` : ""}
        <div class="product-meta">
          <span class="price">${p.price != null ? `${money(p.price)} <small>incl. shipping</small>` : ""}</span>
          ${
            p.available
              ? `<a href="${esc(p.page)}" class="btn btn-small">View</a>`
              : `<a href="${esc(cfg.instagram)}" class="btn btn-small btn-ghost" target="_blank" rel="noopener">Follow for updates</a>`
          }
        </div>
      </div>
    </article>`;
}

export function customCard() {
  return `
    <article class="card product custom reveal">
      <div class="product-img custom-art" aria-hidden="true">
        <img src="assets/img/logo-mark.png" alt="">
        <i></i><i></i><i></i>
      </div>
      <div class="product-body">
        <p class="eyebrow">Made to order</p>
        <h3>Custom order</h3>
        <p>Not just air ducts. If you want a custom part or item made, tell us what you have in mind and we'll take it from there.</p>
        <div class="product-meta">
          <span class="price"><small>Quoted per job</small></span>
          <a href="${esc(cfg.instagramDm)}" class="btn btn-small" target="_blank" rel="noopener">Message us on Instagram</a>
        </div>
      </div>
    </article>`;
}

function installerCards() {
  return cfg.installers
    .map(
      (p) => `
      <a class="installer reveal" href="${igUrl(esc(p.handle))}" target="_blank" rel="noopener">
        <span class="installer-area">${esc(p.short)}</span>
        <span class="installer-text"><strong>${esc(p.area)}</strong>@${esc(p.handle)}</span>
        <span class="installer-go" aria-hidden="true">→</span>
      </a>`
    )
    .join("");
}

function fillShared() {
  $$("[data-products]").forEach((el) => {
    el.innerHTML = cfg.products.map(productCard).join("") + customCard();
  });
  $$("[data-installers]").forEach((el) => (el.innerHTML = installerCards()));
  $$("[data-ig-link]").forEach((a) => (a.href = cfg.instagram));
  $$("[data-ig-dm]").forEach((a) => (a.href = cfg.instagramDm));
  $$("[data-installer]").forEach((a) => {
    const person = cfg.installers.find((p) => p.short === a.dataset.installer);
    if (!person) return;
    a.href = igUrl(person.handle);
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = `@${person.handle}`;
  });
  // Price mentions in the page copy come from config.js, so there's one place to change it
  const headline = cfg.products.find((p) => p.available);
  if (headline) $$("[data-price]").forEach((el) => (el.textContent = el.dataset.price.replace("{price}", money(headline.price))));
}

/* ---------- Motion ---------- */

// Fades and slides elements in as they scroll into view; siblings stagger.
export function initReveal(root = document) {
  const els = $$(".reveal:not(.in)", root);
  if (reducedMotion || !("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  els.forEach((el) => {
    const i = [...el.parentElement.children].filter((c) => c.classList.contains("reveal")).indexOf(el);
    el.style.setProperty("--i", Math.min(i, 6));
    io.observe(el);
  });
}

// Counts numbers up when they come into view: <strong data-count="82" data-suffix="%">
function initCounters() {
  const els = $$("[data-count]");
  const show = (el, n) => (el.textContent = `${n}${el.dataset.suffix || ""}`);
  if (reducedMotion || !("IntersectionObserver" in window)) return els.forEach((el) => show(el, el.dataset.count));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const end = Number(el.dataset.count);
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / 1200);
          show(el, Math.round(end * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { threshold: 0.6 }
  );
  els.forEach((el) => {
    show(el, 0);
    io.observe(el);
  });
}

// Cards lean slightly toward the pointer (mouse only).
function initTilt() {
  if (reducedMotion || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest?.(".tilt");
    $$(".tilt.tilting").forEach((c) => c !== card && resetTilt(c));
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add("tilting");
    card.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
    card.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`);
    card.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
  });
  const resetTilt = (c) => {
    c.classList.remove("tilting");
    c.style.setProperty("--rx", "0deg");
    c.style.setProperty("--ry", "0deg");
  };
  document.addEventListener("pointerleave", () => $$(".tilt.tilting").forEach(resetTilt));
}

// Hero background: streaks of air that bend toward the duct and get pulled in.
function initAirflow(canvas) {
  if (!canvas || reducedMotion) return;
  const ctx = canvas.getContext("2d");
  let w, h, fx, fy, running = false;
  const parts = [];

  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wide = w >= 860;
    fx = w * (wide ? 0.74 : 0.5); // roughly where the product photo sits
    fy = h * (wide ? 0.5 : 0.72);
  };
  const spawn = (p, fresh) => {
    p.x = fresh ? Math.random() * fx : -Math.random() * 200;
    p.y0 = Math.random() * h;
    p.v = 2.5 + Math.random() * 5;
    p.len = 50 + Math.random() * 140;
    p.a = 0.1 + Math.random() * 0.4;
    p.red = Math.random() < 0.4;
    return p;
  };
  const yAt = (p, x) => {
    const t = Math.max(0, Math.min(1, x / fx));
    return p.y0 + (fy - p.y0) * t * t * 0.9;
  };
  const frame = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    for (const p of parts) {
      p.x += p.v * (1 + (p.x / fx) * 1.2); // speeds up as it nears the inlet
      if (p.x > fx) spawn(p);
      const x0 = p.x - p.len;
      const fade = Math.min(1, p.x / 160) * (1 - Math.max(0, p.x / fx - 0.75) * 4);
      const g = ctx.createLinearGradient(x0, 0, p.x, 0);
      const rgb = p.red ? "255, 70, 58" : "255, 255, 255";
      g.addColorStop(0, `rgba(${rgb}, 0)`);
      g.addColorStop(1, `rgba(${rgb}, ${(p.a * Math.max(0, fade)).toFixed(3)})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = p.red ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(x0, yAt(p, x0));
      ctx.lineTo(p.x, yAt(p, p.x));
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  };

  size();
  const count = Math.round(Math.min(90, Math.max(36, w / 14)));
  for (let i = 0; i < count; i++) parts.push(spawn({}, true));
  addEventListener("resize", size);
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting && !document.hidden;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(canvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
  });
}

/* ---------- Start ---------- */

renderChrome();
fillShared();
initReveal();
initCounters();
initTilt();
initAirflow($("#airflow"));
document.documentElement.classList.add("ready");
