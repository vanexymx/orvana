// Order form (order.html and pre-order pages): the form, its live total, and sending the order to /api/order.
// <body data-order="preorder"> lists only pre-order products; otherwise only products in stock.
import { cfg, $, $$, esc, money, mailto } from "./site.js";

(function () {
  const form = $("#order-form");
  if (!form) return;

  const preorderPage = document.body.dataset.order === "preorder";
  const available = cfg.products.filter((p) => p.available && Boolean(p.preorder) === preorderPage);
  const productSel = $("#f-product");
  const qtyInput = $("#f-qty");
  const errorBox = $("#form-error");
  const submitBtn = $("#submit-btn");
  const done = $("#order-done");

  productSel.innerHTML = available
    .map((p) => `<option value="${esc(p.id)}">${esc(p.name)} — ${money(p.price)}</option>`)
    .join("");
  // One product: no need to choose
  $("#product-field").hidden = available.length < 2;

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
    const save = $("#s-save");
    if (save && p.preorder) save.textContent = `−${money((p.preorder.normalPrice - p.price) * qty())}`;
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

  // The product photo beside the form follows the chosen product and colour
  function renderAside() {
    const p = product();
    $("#order-img").src = p.image;
    const c = p.colours.find((x) => x.id === form.colour.value);
    if (c && c.glow) document.documentElement.style.setProperty("--glow", c.glow);
  }
  form.addEventListener("change", renderAside);

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
      ...(p.preorder ? { Type: `Pre-order — ships from ${p.preorder.launch}` } : {}),
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
    const subject = `New ORVANA ${product().preorder ? "pre-order" : "order"} — ${details.Name} (${details.Quantity}× ${details.Colour})`;
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
      done.scrollIntoView({ block: "center" });
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

  // Arriving from a product page: order.html?product=<id>&colour=<id>
  const query = new URLSearchParams(location.search);
  if (available.some((p) => p.id === query.get("product"))) productSel.value = query.get("product");

  applyMode();
  renderColours();
  const wanted = $(`#f-colours input[value="${CSS.escape(query.get("colour") || "")}"]`);
  if (wanted) wanted.checked = true;
  renderSummary();
  renderAside();
})();
