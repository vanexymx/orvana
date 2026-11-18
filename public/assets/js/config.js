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

  // To add a product: add it here, then copy s70-air-duct.html to its page
  // and change the data-product attribute on its <body>.
  // available: false shows it as "Coming soon".
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
      note: "Pre-order: made within 5 working days.",
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
      price: 159, // pre-launch promo price, shipping included; this is what orders are charged
      // Pre-order: shows the normal price struck through and sends orders to orderPage.
      // When it launches, set price to 199 and delete this preorder block.
      preorder: {
        normalPrice: 199,
        launch: "December 2026",
        orderPage: "myvi-preorder.html"
      },
      available: true,
      page: "myvi-air-duct.html",
      image: "assets/img/myvi-studio.jpg",
      gallery: [
        { src: "assets/img/myvi-studio.jpg", alt: "Black Myvi G3 air duct" },
        { src: "assets/img/myvi-grille.jpg", alt: "Red air duct seen through a Myvi front grille" },
        { src: "assets/img/myvi-fitted.jpg", alt: "Red air duct fitted beside the bonnet latch" },
        { src: "assets/img/myvi-hose.jpg", alt: "Myvi engine bay with the intake hose running to the air box" },
        { src: "assets/img/myvi-bay.jpg", alt: "Myvi engine bay with the air duct fitted" }
      ],
      tagline: "Cold air for the Myvi, fully plug-and-play.",
      description:
        "Feeds your Myvi G3 or G3.5 intake with cooler air from the front of the car. Fully plug-and-play: no cutting, drilling or modifications.",
      note: "Pre-order at the launch promo price. Orders ship once we officially launch.",
      specs: [
        ["Fits", "Perodua Myvi G3 and G3.5"],
        ["Install", "Fully plug-and-play, no cutting or drilling"],
        ["Launch", "Officially launching December 2026"]
      ],
      colours: [
        { id: "black", label: "Black", hex: "#141414", glow: "255, 255, 255" },
        { id: "red", label: "Red", hex: "#e1251b", glow: "225, 37, 27" }
      ]
    }
  ]
};
