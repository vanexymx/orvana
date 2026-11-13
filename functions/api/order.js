// POST /api/order — validates an order and emails it to the shop.
// Runs as a Cloudflare Pages Function. Email is delivered through the Resend API.
//
// Environment variables (Cloudflare → Workers & Pages → orvana → Settings → Variables and Secrets):
//   RESEND_API_KEY  (secret, required)  API key from resend.com
//   ORDER_EMAIL     (optional)          where orders go; defaults to orderEmail in config.js
//   MAIL_FROM       (optional)          sender; defaults to Resend's test sender, which can only
//                                       deliver to the email address you signed up to Resend with

import { ORVANA } from "../../assets/js/config.js";

const DEFAULT_FROM = "ORVANA Orders <onboarding@resend.dev>";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const money = (n) => `${ORVANA.currency}${n.toLocaleString("en-MY")}`;
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

function orderId() {
  const d = new Date(Date.now() + 8 * 3600 * 1000); // Malaysia time
  const date = d.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 4).toUpperCase().padStart(4, "0");
  return `ORV-${date}-${rand}`;
}

// Re-checks everything on the server and prices the order from config.js,
// so a tampered request can't change the total.
function validate(input) {
  const product = ORVANA.products.find((p) => p.id === input.product && p.available);
  if (!product) return { error: "That product isn't available." };

  const colour = product.colours.find((c) => c.id === input.colour);
  if (!colour) return { error: "Please choose a colour." };

  const qty = Number(input.qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) return { error: "Quantity must be between 1 and 20." };

  const order = {
    name: clean(input.name, 100),
    phone: clean(input.phone, 30),
    email: clean(input.email, 200),
    address: clean(input.address, 500),
    discount: clean(input.discount, 50)
  };
  if (!order.name) return { error: "Please add your name." };
  if (!/^\+?\d{9,13}$/.test(order.phone.replace(/[\s-]/g, ""))) return { error: "Please add a valid phone number." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) return { error: "Please add a valid email." };
  if (order.address.length < 10) return { error: "Please add your full delivery address." };
  if (input.agree !== true) return { error: "Please agree to the terms." };

  return { order: { ...order, product, colour, qty, total: product.price * qty } };
}

function renderEmail(id, o) {
  const rows = [
    ["Order", id],
    ["Product", o.product.name],
    ["Colour", o.colour.label],
    ["Quantity", o.qty],
    ["Unit price", money(o.product.price)],
    ["Total", `${money(o.total)} (shipping included)`],
    ["Name", o.name],
    ["Phone", o.phone],
    ["Email", o.email],
    ["Address", o.address],
    ["Discount code", o.discount || "-"]
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">New ORVANA order</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([k, v]) => `<tr>
              <td style="padding:8px;border:1px solid #ddd;background:#f6f6f6;font-weight:600;white-space:nowrap;vertical-align:top">${esc(k)}</td>
              <td style="padding:8px;border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td>
            </tr>`
          )
          .join("")}
      </table>
      <p style="color:#666;font-size:13px">Reply to this email to contact the customer.</p>
    </div>`;
  return { text, html };
}

export async function onRequestPost({ request, env }) {
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  // Honeypot: real visitors never see this field. Pretend success so bots move on.
  if (input.website) return json({ ok: true, orderId: orderId() });

  const { order, error } = validate(input);
  if (error) return json({ ok: false, error }, 400);

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    // TEMP diagnostic: names only, never values. Remove once ordering works.
    const seen = Object.keys(env).filter((k) => typeof env[k] === "string").map((k) => `${k}(${env[k].length})`);
    return json({ ok: false, error: "Ordering is not set up yet.", debug: seen }, 500);
  }

  const id = orderId();
  const { text, html } = renderEmail(id, order);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM || DEFAULT_FROM,
      to: [env.ORDER_EMAIL || ORVANA.orderEmail],
      reply_to: order.email,
      subject: `New order ${id} — ${order.name} (${order.qty}× ${order.colour.label})`,
      text,
      html
    })
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return json({ ok: false, error: "Couldn't send the order." }, 502);
  }
  return json({ ok: true, orderId: id });
}
