export default {
  gameTitle: "P&K Forever",
  saveFileName: "pnk-forever-save",

  layout: {
    backgrounds: {
      beach_rest: {
        image: "beach_rest.jpg"
      },
      beach: {
        image: "beach.jpg"
      },
      beach_sunset: {
        image: "sunset.jpg"
      },
      jaffa_apt: {
        image: "apartment.jpg"
      },
      jaffa_street: {
        image: "street.jpg"
      },
      japan: {
        image: "kyoto.jpg"
      },
      kyoto_apt: {
        image: "kyoto_apt.jpg"
      },
      kitchen: {
        image: "kitchen.jpg"
      },
      home: {
        image: "home.jpg"
      }
    }
  },

  characters: {
    config: {
      phoenix: {
        name: "Phoenix",
        color: "#FF6B35",
        sprites: {
          idle: "phoenix.png"
        }
      },
      k: {
        name: "K",
        color: "#1A1A1A",
        sprites: {
          idle: "k.png"
        }
      }
    }
  },

  skills: {},
  skillChecks: {},

  items: {},

  buttons: {},

  screens: {
    default: {
      background: "beach_rest"
    }
  },

  hudStats: {}
};
