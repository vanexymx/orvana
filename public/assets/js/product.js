// Product page: fills #pdp from config.js for the product named in <body data-product="...">.
import { cfg, $, $$, esc, money, priceHtml, orderUrl } from "./site.js";

const p = cfg.products.find((x) => x.id === document.body.dataset.product);
const root = $("#pdp");

if (p && root) {
  root.innerHTML = `
    <div class="pdp-media">
      <div class="pdp-main" id="pdp-main">
        ${p.gallery
          .map(
            (g, i) =>
              `<img src="${esc(g.src)}" alt="${esc(g.alt)}" class="${i === 0 ? "on" : ""}"${i === 0 ? ` style="view-transition-name: img-${esc(p.id)}" fetchpriority="high"` : ' loading="lazy"'}>`
          )
          .join("")}
      </div>
      <div class="thumbs">
        ${p.gallery
          .map(
            (g, i) =>
              `<button type="button" data-i="${i}" aria-pressed="${i === 0}" aria-label="Photo ${i + 1}: ${esc(g.alt)}"><img src="${esc(g.src)}" alt="" loading="lazy"></button>`
          )
          .join("")}
      </div>
    </div>

    <div class="pdp-info">
      <p class="eyebrow">${esc(p.car)}${p.preorder ? ` <span class="badge badge-hot">Pre-order</span>` : ""}</p>
      <h1>${esc(p.name)}</h1>
      <p class="pdp-price">${priceHtml(p)} <small>shipping included</small></p>
      ${
        p.preorder
          ? `<p class="promo"><strong>Pre-launch promo: save ${money(p.preorder.normalPrice - p.price)}.</strong> Normally ${money(p.preorder.normalPrice)}. Officially launching ${esc(p.preorder.launch)}.</p>`
          : ""
      }
      <p class="lede"><strong>${esc(p.tagline)}</strong> ${esc(p.description)}</p>

      <fieldset>
        <legend>Colour</legend>
        <div class="swatches" role="radiogroup">
          ${p.colours
            .map(
              (c, i) => `
              <div class="swatch">
                <input type="radio" name="colour" id="pc-${esc(c.id)}" value="${esc(c.id)}" ${i === p.colours.length - 1 ? "checked" : ""}>
                <label for="pc-${esc(c.id)}"><i style="background:${esc(c.hex)}"></i>${esc(c.label)}</label>
              </div>`
            )
            .join("")}
        </div>
      </fieldset>

      <div class="pdp-actions">
        <a href="${esc(orderUrl(p))}" class="btn" id="pdp-order">${p.preorder ? `Pre-order · ${money(p.price)}` : "Order this duct"}</a>
        <a href="${esc(cfg.instagramDm)}" class="btn btn-ghost" target="_blank" rel="noopener">Ask a question</a>
      </div>
      <p class="note">${esc(p.note || "")} Installation and handover available in KL and JB.</p>

      <dl class="specs">
        ${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        <div><dt>Colours</dt><dd>${p.colours.map((c) => esc(c.label)).join(", ")}</dd></div>
      </dl>
    </div>`;

  // Photo gallery: thumbnails cross-fade the main photo
  const photos = $$("#pdp-main img");
  const thumbs = $$(".thumbs button");
  thumbs.forEach((b) =>
    b.addEventListener("click", () => {
      photos.forEach((img, i) => img.classList.toggle("on", i === Number(b.dataset.i)));
      thumbs.forEach((t) => t.setAttribute("aria-pressed", t === b));
    })
  );

  // Colour choice tints the page glow and is carried to the order form
  const applyColour = () => {
    const c = p.colours.find((x) => x.id === $('input[name="colour"]:checked', root).value);
    document.documentElement.style.setProperty("--glow", c.glow);
    $("#pdp-order").href = orderUrl(p, c.id);
  };
  $$('input[name="colour"]', root).forEach((r) => r.addEventListener("change", applyColour));
  applyColour();
}
