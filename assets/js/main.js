import { ORVANA as cfg } from "./config.js";

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => `${cfg.currency}${n.toLocaleString("en-MY")}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const igUrl = (handle) => `https://www.instagram.com/${handle}/`;
  const mailto = (subject, body) =>
    `mailto:${cfg.orderEmail}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;

  // Shared links
  $$("[data-ig-link]").forEach((a) => (a.href = cfg.instagram));
  $$("[data-email-link]").forEach((a) => (a.href = mailto("Question about ORVANA air ducts")));
  $$("[data-installer]").forEach((a) => {
    const person = cfg.installers.find((p) => p.short === a.dataset.installer);
    if (!person) return;
    a.href = igUrl(person.handle);
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = `@${person.handle}`;
  });
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  // Price mentions in the page copy come from config.js, so there's one place to change it
  const headline = cfg.products.find((p) => p.available);
  if (headline) $$("[data-price]").forEach((el) => (el.textContent = el.dataset.price.replace("{price}", money(headline.price))));

  // Installation / handover contacts
  const installerCards = cfg.installers
    .map(
      (p) => `
      <a class="installer" href="${igUrl(esc(p.handle))}" target="_blank" rel="noopener">
        <span class="installer-area">${esc(p.short)}</span>
        <span class="installer-text"><strong>${esc(p.area)}</strong>@${esc(p.handle)}</span>
        <span class="installer-go" aria-hidden="true">→</span>
      </a>`
    )
    .join("");
  $("#installers") && ($("#installers").innerHTML = installerCards);

  // Product cards
  const list = $("#product-list");
  if (list) {
    list.innerHTML = cfg.products
      .map((p) => {
        const img = p.image
          ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`
          : `<img src="assets/img/logo-mark.png" alt="" class="placeholder-mark">`;
        const dots = p.colours.map((c) => `<span title="${esc(c.label)}" style="background:${esc(c.hex)}"></span>`).join("");
        const action = p.available
          ? `<a href="#order" class="btn btn-small" data-pick="${esc(p.id)}">Order</a>`
          : `<a href="${esc(cfg.instagram)}" class="btn btn-small btn-ghost" target="_blank" rel="noopener">Follow for updates</a>`;
        return `
          <article class="card product">
            <div class="product-img">${img}</div>
            <div class="product-body">
              ${p.available ? "" : `<span class="badge">Coming soon</span>`}
              <h3>${esc(p.name)}</h3>
              <p><strong>${esc(p.tagline)}</strong> ${esc(p.description)}</p>
              ${dots ? `<div class="dots">${dots}</div>` : ""}
              <div class="product-meta">
                <span class="price">${p.price != null ? `${money(p.price)} <small>incl. shipping</small>` : ""}</span>
                ${action}
              </div>
            </div>
          </article>`;
      })
      .join("");
  }

  // Order form
  const form = $("#order-form");
  if (!form) return;

  const available = cfg.products.filter((p) => p.available);
  const productSel = $("#f-product");
  const qtyInput = $("#f-qty");
  const errorBox = $("#form-error");
  const submitBtn = $("#submit-btn");
  const done = $("#order-done");

  productSel.innerHTML = available
    .map((p) => `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}</option>`)
    .join("");

  const radios = (name, options) =>
    options
      .map(
        ([value, label, checked]) => `
        <div class="pill">
          <input type="radio" name="${name}" id="${name}-${esc(value)}" value="${esc(value)}" ${checked ? "checked" : ""}>
          <label for="${name}-${esc(value)}">${label}</label>
        </div>`
      )
      .join("");

  $("#f-area").innerHTML = radios("area", cfg.installers.map((p) => [p.short, esc(p.area)]));
  $("#f-referral").innerHTML = radios("referral", [
    ...cfg.installers.map((p) => [p.handle, `@${esc(p.handle)}`]),
    ["none", "None", true]
  ]);

  // Spam check (Cloudflare Turnstile). Off until turnstileSiteKey is set in config.js.
  let turnstileId = null;
  if (cfg.turnstileSiteKey) {
    window.onTurnstileLoad = () => {
      $("#turnstile").hidden = false;
      turnstileId = window.turnstile.render("#turnstile", { sitekey: cfg.turnstileSiteKey, theme: "dark" });
    };
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
    script.async = true;
    document.head.append(script);
  }
  const turnstileToken = () => (turnstileId !== null ? window.turnstile.getResponse(turnstileId) || "" : "");
  const resetTurnstile = () => turnstileId !== null && window.turnstile.reset(turnstileId);

  const product = () => available.find((p) => p.id === productSel.value);
  const isMeet = () => $("#m-meet").checked;
  const qty = () => Math.min(20, Math.max(1, parseInt(qtyInput.value, 10) || 1));

  function renderColours() {
    $("#f-colours").innerHTML = product()
      .colours.map(
        (c, i) => `
        <div class="swatch">
          <input type="radio" name="colour" id="c-${esc(c.id)}" value="${esc(c.id)}" ${i === 0 ? "checked" : ""}>
          <label for="c-${esc(c.id)}"><i style="background:${esc(c.hex)}"></i>${esc(c.label)}</label>
        </div>`
      )
      .join("");
  }

  function renderSummary() {
    const p = product();
    $("#s-line").textContent = `${money(p.price)} × ${qty()}`;
    $("#s-sub").textContent = money(p.price * qty());
    $("#s-total").textContent = money(p.price * qty());
  }

  // Delivery needs an address; install/handover needs an area instead
  function applyMode() {
    $("#area-field").hidden = !isMeet();
    $("#address-field").hidden = isMeet();
    $("#s-ship-label").textContent = isMeet() ? "Install / handover" : "Shipping";
  }
  $$('input[name="mode"]').forEach((r) => r.addEventListener("change", applyMode));

  productSel.addEventListener("change", () => { renderColours(); renderSummary(); });
  qtyInput.addEventListener("input", renderSummary);
  qtyInput.addEventListener("blur", () => { qtyInput.value = qty(); renderSummary(); });
  $$("[data-qty]", form).forEach((b) =>
    b.addEventListener("click", () => {
      qtyInput.value = qty() + Number(b.dataset.qty);
      qtyInput.value = qty();
      renderSummary();
    })
  );

  // "Order" buttons on product cards preselect that product
  document.addEventListener("click", (e) => {
    const pick = e.target.closest("[data-pick]");
    if (!pick) return;
    productSel.value = pick.dataset.pick;
    renderColours();
    renderSummary();
  });

  function validate() {
    const problems = [];
    $$(".invalid", form).forEach((el) => el.classList.remove("invalid"));
    const flag = (el, msg) => { el.classList.add("invalid"); problems.push(msg); };

    if (!form.name.value.trim()) flag(form.name, "your name");
    if (!/^\+?\d{9,13}$/.test(form.phone.value.replace(/[\s-]/g, ""))) flag(form.phone, "a valid phone number");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) flag(form.email, "a valid email");
    if (isMeet()) {
      if (!form.area.value) problems.push("your area (KL or JB)");
    } else if (form.address.value.trim().length < 10) {
      flag(form.address, "your full delivery address");
    }
    if (!form.agree.checked) problems.push("agreement to the terms");
    return problems;
  }

  function orderDetails() {
    const p = product();
    const colour = p.colours.find((c) => c.id === form.colour.value);
    const area = cfg.installers.find((a) => a.short === form.area.value);
    return {
      Receive: isMeet() ? `Install / handover — ${area ? area.area : "-"}` : "Delivery",
      Product: p.name,
      Colour: colour ? colour.label : "-",
      Quantity: qty(),
      "Unit price": money(p.price),
      Total: money(p.price * qty()),
      Name: form.name.value.trim(),
      Phone: form.phone.value.trim(),
      Email: form.email.value.trim(),
      ...(isMeet() ? {} : { Address: form.address.value.trim() }),
      "Discount code": form.discount.value.trim() || "-",
      Referral: form.referral.value === "none" ? "None" : `@${form.referral.value}`,
      "Agreed to terms": "Yes"
    };
  }

  function showError(html) {
    errorBox.innerHTML = html;
    errorBox.hidden = false;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const problems = validate();
    if (problems.length) return showError(`Please add ${esc(problems.join(", "))}.`);
    if (cfg.turnstileSiteKey && !turnstileToken()) return showError("Please wait for the spam check above to finish, then try again.");
    errorBox.hidden = true;

    const details = orderDetails();
    const subject = `New ORVANA order — ${details.Name} (${details.Quantity}× ${details.Colour})`;
    const fallback = mailto(subject, Object.entries(details).map(([k, v]) => `${k}: ${v}`).join("\n"));

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isMeet() ? "meet" : "ship",
          area: isMeet() ? form.area.value : "",
          product: productSel.value,
          colour: form.colour.value,
          qty: qty(),
          name: form.name.value,
          phone: form.phone.value,
          email: form.email.value,
          address: isMeet() ? "" : form.address.value,
          discount: form.discount.value,
          referral: form.referral.value,
          agree: form.agree.checked,
          turnstileToken: turnstileToken(),
          website: form.website.value // honeypot, left empty by people
        })
      });
      const data = await res.json().catch(() => ({}));
      // 400 means the server rejected the details; show its reason instead of the email fallback
      if (res.status === 400 && data.error) return showError(esc(data.error));
      if (!res.ok || !data.ok) throw new Error(data.error || res.statusText);
      $("#order-id").textContent = data.orderId;
      form.hidden = true;
      done.hidden = false;
      form.reset();
      applyMode();
      renderColours();
      renderSummary();
    } catch (err) {
      showError(`Sorry, we couldn't send your order. <a href="${esc(fallback)}">Email it to us instead</a> — your details will be filled in.`);
    } finally {
      resetTurnstile(); // each token works once
      submitBtn.disabled = false;
      submitBtn.textContent = "Send order";
    }
  });

  $("#order-again").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
  });

  applyMode();
  renderColours();
  renderSummary();
})();
