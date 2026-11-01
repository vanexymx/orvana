// Store settings. Edit this file to change prices, products or contact details.
window.ORVANA = {
  // Delivery orders are emailed here (via FormSubmit, see README).
  orderEmail: "orvana.team@gmail.com",
  instagram: "https://www.instagram.com/orvana.automative/",
  currency: "RM",

  // People who handle installation and physical handover.
  installers: [
    { area: "Kuala Lumpur", short: "KL", handle: "thomas.ps70" },
    { area: "Johor Bahru", short: "JB", handle: "gg_5968" }
  ],

  products: [
    {
      id: "s70-air-duct",
      name: "Proton S70 Air Duct",
      car: "Proton S70",
      price: 199, // shipping included
      available: true,
      image: "assets/img/s70-air-duct.jpg",
      tagline: "Bigger opening, smoother path, colder air.",
      description:
        "The rounded inlet lip cuts entry loss by 82%, and the 50 mm clear passage pulls straight from behind the grille — so your engine breathes more, and breathes cooler.",
      colours: [
        { id: "black", label: "Black", hex: "#141414" },
        { id: "red", label: "Red", hex: "#e1251b" },
        { id: "white", label: "White", hex: "#f2f2f2" }
      ]
    },
    {
      id: "myvi-g3-air-duct",
      name: "Myvi Gen 3 Air Duct",
      car: "Perodua Myvi Gen 3",
      price: null,
      available: false,
      image: null,
      tagline: "Coming soon.",
      description: "Follow us on Instagram to hear when it launches.",
      colours: []
    }
  ]
};
