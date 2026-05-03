// src/data/words.js
// Words organized by difficulty level
// Each entry: the word, an emoji hint, and the Web Speech API voice text

export const WORD_LEVELS = {
    1: [
      { word: "CAT",  hint: "🐱", speak: "cat"  },
      { word: "DOG",  hint: "🐶", speak: "dog"  },
      { word: "SUN",  hint: "☀️",  speak: "sun"  },
      { word: "HAT",  hint: "🎩", speak: "hat"  },
      { word: "CUP",  hint: "☕", speak: "cup"  },
      { word: "BUS",  hint: "🚌", speak: "bus"  },
    ],
    2: [
      { word: "FISH",  hint: "🐟", speak: "fish"  },
      { word: "BIRD",  hint: "🐦", speak: "bird"  },
      { word: "CAKE",  hint: "🎂", speak: "cake"  },
      { word: "FROG",  hint: "🐸", speak: "frog"  },
      { word: "STAR",  hint: "⭐", speak: "star"  },
      { word: "LEAF",  hint: "🍃", speak: "leaf"  },
    ],
    3: [
      { word: "APPLE",  hint: "🍎", speak: "apple"  },
      { word: "PLANT",  hint: "🌱", speak: "plant"  },
      { word: "TIGER",  hint: "🐯", speak: "tiger"  },
      { word: "BREAD",  hint: "🍞", speak: "bread"  },
      { word: "CHAIR",  hint: "🪑", speak: "chair"  },
      { word: "CLOUD",  hint: "☁️",  speak: "cloud"  },
    ],
};