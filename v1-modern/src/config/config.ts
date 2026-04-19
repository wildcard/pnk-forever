export default {
  gameTitle: "P&K Forever",
  saveFileName: "pnk-forever-save",

  layout: {
    backgrounds: {
      beach_rest: {
        image: "img/beach_rest.jpg"
      },
      beach: {
        image: "img/beach.jpg"
      },
      beach_sunset: {
        image: "img/sunset.jpg"
      },
      jaffa_apt: {
        image: "img/apartment.jpg"
      },
      jaffa_street: {
        image: "img/street.jpg"
      },
      japan: {
        image: "img/kyoto.jpg"
      },
      kyoto_apt: {
        image: "img/kyoto_apt.jpg"
      },
      kitchen: {
        image: "img/kitchen.jpg"
      },
      home: {
        image: "img/home.jpg"
      }
    }
  },

  characters: {
    config: {
      phoenix: {
        name: "Phoenix",
        color: "#FF6B35",
        sprites: {
          idle: "img/phoenix.png"
        }
      },
      k: {
        name: "K",
        color: "#1A1A1A",
        sprites: {
          idle: "img/k.png"
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
