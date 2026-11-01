(function () {
  const cfg = window.ORVANA;
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
  $$("#installers, #meet-installers").forEach((el) => (el.innerHTML = installerCards));

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
  const meetPanel = $("#meet-panel");
  const done = $("#order-done");

  productSel.innerHTML = available
    .map((p) => `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}</option>`)
    .join("");

  const product = () => available.find((p) => p.id === productSel.value);
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

  // Delivery vs. install/handover
  $$('input[name="mode"]').forEach((r) =>
    r.addEventListener("change", () => {
      const meet = $("#m-meet").checked;
      meetPanel.hidden = !meet;
      form.hidden = meet;
      done.hidden = true;
    })
  );

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
    if (form.address.value.trim().length < 10) flag(form.address, "your full delivery address");
    if (!form.agree.checked) problems.push("agreement to the terms");
    return problems;
  }

  function orderDetails() {
    const p = product();
    const colour = p.colours.find((c) => c.id === form.colour.value);
    return {
      Product: p.name,
      Colour: colour ? colour.label : "-",
      Quantity: qty(),
      "Unit price": money(p.price),
      Total: `${money(p.price * qty())} (shipping included)`,
      Name: form.name.value.trim(),
      Phone: form.phone.value.trim(),
      Email: form.email.value.trim(),
      Address: form.address.value.trim(),
      "Discount code": form.discount.value.trim() || "-",
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
    errorBox.hidden = true;

    const details = orderDetails();
    const subject = `New ORVANA order — ${details.Name} (${details.Quantity}× ${details.Colour})`;
    const fallback = mailto(subject, Object.entries(details).map(([k, v]) => `${k}: ${v}`).join("\n"));

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${cfg.orderEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...details, _subject: subject, _replyto: details.Email, _template: "table" })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.statusText);
      form.hidden = true;
      done.hidden = false;
      form.reset();
      renderColours();
      renderSummary();
    } catch (err) {
      showError(`Sorry, we couldn't send your order. <a href="${esc(fallback)}">Email it to us instead</a> — your details will be filled in.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send order";
    }
  });

  $("#order-again").addEventListener("click", () => {
    done.hidden = true;
    form.hidden = false;
  });

  renderColours();
  renderSummary();
})();
