const menu = [
  {
    id: 1,
    name: "Vada Pav",
    category: "Snacks",
    ingredients: [
      "pav",
      "batata vada",
      "green chutney",
      "dry garlic chutney"
    ],
    price: 22,
    avgPrepTimeMinutes: 5,
    image_url: "https://images.unsplash.com/photo-1626074964019-2244c5f86c85?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Samosa Pav",
    category: "Snacks",
    ingredients: [
      "pav",
      "samosa",
      "green chutney",
      "dry garlic chutney"
    ],
    price: 22,
    avgPrepTimeMinutes: 5,
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Masala Dosa",
    category: "Dosa",
    ingredients: [
      "dosa batter",
      "potato",
      "onion",
      "spices",
      "oil",
      "sambar",
      "coconut chutney"
    ],
    price: 68,
    avgPrepTimeMinutes: 10,
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Sada Dosa",
    category: "Dosa",
    ingredients: [
      "dosa batter",
      "oil",
      "sambar",
      "coconut chutney"
    ],
    price: 47,
    avgPrepTimeMinutes: 8,
    image_url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Masala Uttappa",
    category: "Uttappam",
    ingredients: [
      "uttappam batter",
      "onion",
      "tomato",
      "green chilli",
      "spices",
      "oil",
      "sambar",
      "chutney"
    ],
    price: 79,
    avgPrepTimeMinutes: 10,
    image_url: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Veg Sandwich",
    category: "Sandwiches",
    ingredients: [
      "bread",
      "onion",
      "tomato",
      "cucumber",
      "capsicum",
      "butter",
      "green chutney"
    ],
    price: 45,
    avgPrepTimeMinutes: 7,
    image_url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Veg Cheese Sandwich",
    category: "Sandwiches",
    ingredients: [
      "bread",
      "onion",
      "tomato",
      "cucumber",
      "capsicum",
      "cheese",
      "butter",
      "green chutney"
    ],
    price: 55,
    avgPrepTimeMinutes: 8,
    image_url: "https://images.unsplash.com/photo-1553909489-cd47ce5634e7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    name: "Grilled Sandwich",
    category: "Grilled",
    ingredients: [
      "bread",
      "potato",
      "onion",
      "tomato",
      "capsicum",
      "butter",
      "green chutney"
    ],
    price: 60,
    avgPrepTimeMinutes: 9,
    image_url: "https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    name: "Veg Fried Rice",
    category: "Rice",
    ingredients: [
      "rice",
      "cabbage",
      "carrot",
      "capsicum",
      "spring onion",
      "soy sauce",
      "spices",
      "oil"
    ],
    price: 100,
    avgPrepTimeMinutes: 12,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    name: "Schezwan Rice",
    category: "Rice",
    ingredients: [
      "rice",
      "cabbage",
      "carrot",
      "capsicum",
      "spring onion",
      "schezwan sauce",
      "soy sauce",
      "spices"
    ],
    price: 105,
    avgPrepTimeMinutes: 12,
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    name: "Hakka Noodles",
    category: "Noodles",
    ingredients: [
      "noodles",
      "cabbage",
      "carrot",
      "capsicum",
      "spring onion",
      "soy sauce",
      "spices",
      "oil"
    ],
    price: 97,
    avgPrepTimeMinutes: 12,
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    name: "Manchow Noodles",
    category: "Noodles",
    ingredients: [
      "noodles",
      "mixed vegetables",
      "manchow sauce",
      "soy sauce",
      "garlic",
      "spices"
    ],
    price: 105,
    avgPrepTimeMinutes: 13,
    image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 13,
    name: "Veg Manchurian",
    category: "Gravy",
    ingredients: [
      "cabbage",
      "carrot",
      "capsicum",
      "corn flour",
      "garlic",
      "soy sauce",
      "manchurian sauce",
      "spices"
    ],
    price: 74,
    avgPrepTimeMinutes: 12,
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 14,
    name: "Paneer Chilly",
    category: "Gravy",
    ingredients: [
      "paneer",
      "capsicum",
      "onion",
      "green chilli",
      "soy sauce",
      "chilli sauce",
      "corn flour"
    ],
    price: 74,
    avgPrepTimeMinutes: 12,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 15,
    name: "Manchow Soup",
    category: "Soup",
    ingredients: [
      "mixed vegetables",
      "garlic",
      "ginger",
      "soy sauce",
      "manchow sauce",
      "corn flour",
      "spices"
    ],
    price: 79,
    avgPrepTimeMinutes: 8,
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 16,
    name: "Bhel Puri",
    category: "Chaat",
    ingredients: [
      "puffed rice",
      "onion",
      "tomato",
      "sev",
      "coriander",
      "tamarind chutney",
      "green chutney",
      "spices"
    ],
    price: 42,
    avgPrepTimeMinutes: 4,
    image_url: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 17,
    name: "Sev Puri",
    category: "Chaat",
    ingredients: [
      "puri",
      "potato",
      "onion",
      "sev",
      "coriander",
      "tamarind chutney",
      "green chutney",
      "spices"
    ],
    price: 42,
    avgPrepTimeMinutes: 5,
    image_url: "https://images.unsplash.com/photo-1626074964019-2244c5f86c85?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 18,
    name: "Pav Bhaji",
    category: "Lunch",
    ingredients: [
      "pav",
      "potato",
      "tomato",
      "peas",
      "cauliflower",
      "capsicum",
      "butter",
      "pav bhaji masala"
    ],
    price: 60,
    avgPrepTimeMinutes: 10,
    image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 19,
    name: "Misal Pav",
    category: "Snacks",
    ingredients: [
      "matki sprouts",
      "onion",
      "tomato",
      "spices",
      "farsan",
      "pav",
      "coriander"
    ],
    price: 40,
    avgPrepTimeMinutes: 7,
    image_url: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 20,
    name: "Poha",
    category: "Snacks",
    ingredients: [
      "semolina or poha",
      "onion",
      "potato",
      "green chilli",
      "mustard seeds",
      "curry leaves",
      "peanuts",
      "spices"
    ],
    price: 37,
    avgPrepTimeMinutes: 6,
    image_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80"
  }
];

module.exports = menu;