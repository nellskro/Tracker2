const QUOTES = [
  "La discipline est le pont entre les objectifs et les accomplissements.",
  "Chaque jour est une nouvelle opportunité de progresser.",
  "Les petites habitudes construisent les grands succès.",
  "La constance est la clé de toute réussite durable.",
  "Un pas à la fois, une habitude à la fois.",
  "Le succès est la somme de petits efforts répétés jour après jour.",
  "La motivation vous lance, l'habitude vous maintient.",
  "Chaque routine accomplie est une victoire sur vous-même.",
  "Le progrès, pas la perfection.",
  "Vous devenez ce que vous répétez chaque jour.",
  "La cohérence bat le talent quand le talent n'est pas cohérent.",
  "Les champions ne sont pas nés, ils sont construits chaque jour.",
  "Votre futur est créé par ce que vous faites aujourd'hui.",
  "Commencez là où vous êtes, utilisez ce que vous avez, faites ce que vous pouvez.",
  "La transformation commence par une seule habitude.",
];

export function getQuoteOfDay() {
  const idx = Math.floor(Date.now() / 86400000) % QUOTES.length;
  return QUOTES[idx];
}
