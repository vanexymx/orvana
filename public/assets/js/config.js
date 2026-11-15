// Store settings. Edit this file to change prices, products or contact details.
// Shared by the website (assets/js/*.js) and the order API (functions/api/order.js).
export const ORVANA = {
  // Delivery orders are emailed here by functions/api/order.js.
  orderEmail: "orvana.team@gmail.com",
  instagram: "https://www.instagram.com/orvana.automative/",
  // Opens a direct message to the shop on Instagram (used for custom orders).
  // Uses instagram.com rather than the ig.me short link, which doesn't connect on some networks.
  instagramDm: "https://www.instagram.com/m/orvana.automative",

  // Spam check on the order form (Cloudflare Turnstile). Paste the widget's
  // site key here to turn it on; leave empty to turn it off. See README.
  turnstileSiteKey: "",
  currency: "RM",

  // People who handle installation and physical handover.
  installers: [
    { area: "Kuala Lumpur", short: "KL", handle: "thomas.ps70" },
    { area: "Johor Bahru", short: "JB", handle: "gg_5968" }
  ],

  // To add a product: add it here, then copy s70-air-duct.html to <id>.html
  // and change the data-product attribute on its <body>.
  products: [
    {
      id: "s70-air-duct",
      name: "Proton S70 Air Duct",
      car: "Proton S70",
      price: 199, // shipping included
      available: true,
      page: "s70-air-duct.html",
      image: "assets/img/s70-studio.jpg",
      gallery: [
        { src: "assets/img/s70-studio.jpg", alt: "S70 air ducts in red and black" },
        { src: "assets/img/s70-grille.jpg", alt: "Red S70 air duct seen through the front grille" },
        { src: "assets/img/s70-fitted.jpg", alt: "Red S70 air duct fitted behind the grille" },
        { src: "assets/img/s70-batch.jpg", alt: "A batch of red and black S70 air ducts" }
      ],
      tagline: "Bigger opening, smoother path, colder air.",
      description:
        "The rounded inlet lip cuts entry loss by 82%, and the 50 mm clear passage pulls straight from behind the grille — so your engine breathes more, and breathes cooler.",
      specs: [
        ["Fits", "Proton S70"],
        ["Inlet", "Rounded lip, 82% less entry loss"],
        ["Passage", "50 mm clear, straight from behind the grille"],
        ["Install", "Plug-and-play, replaces the original cover/panel"],
        ["Lead time", "Made to order, up to 5 working days"]
      ],
      colours: [
        { id: "black", label: "Black", hex: "#141414", glow: "255, 255, 255" },
        { id: "red", label: "Red", hex: "#e1251b", glow: "225, 37, 27" }
      ]
    },
    {
      id: "myvi-g3-air-duct",
      name: "Myvi G3 & G3.5 Air Duct",
      car: "Perodua Myvi G3 / G3.5",
      price: null,
      available: false,
      page: null,
      image: "assets/img/myvi-grille.jpg",
      gallery: [
        { src: "assets/img/myvi-grille.jpg", alt: "Red air duct behind a Myvi front grille" },
        { src: "assets/img/myvi-bay.jpg", alt: "Myvi engine bay with the air duct fitted" }
      ],
      tagline: "Coming soon.",
      description: "Colder air for the Myvi G3 and G3.5. Follow us on Instagram to hear when it launches.",
      specs: [],
      colours: []
    }
  ]
};
