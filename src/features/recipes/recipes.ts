export type Recipe = {
  id: string
  title: string
  description: string
  minutes: number
  servings: number
  ingredients: string[]
  materials: string[]
  steps: string[]
  own?: boolean
}

// Original sample texts created for AloneTogether; no third-party images or text.
export const catalog: Recipe[] = [
  {
    id: 'pasta-tomate',
    title: 'Pasta con tomate y albahaca',
    description:
      'Una comida cálida con pocos ingredientes y una salsa hecha en casa.',
    minutes: 25,
    servings: 2,
    ingredients: [
      '180 g de pasta seca',
      '3 tomates medianos picados',
      '1 diente de ajo picado',
      '1 cucharada de aceite de oliva',
      '6 hojas de albahaca lavadas',
      '½ cucharadita de sal, más al gusto',
      '1 litro de agua',
    ],
    materials: [
      'Olla mediana',
      'Sartén',
      'Colador',
      'Cuchillo y tabla',
      'Cuchara de madera',
    ],
    steps: [
      'Lava los tomates y la albahaca. Pica los tomates y el ajo sobre una tabla limpia.',
      'Hierve el agua en la olla con una pizca de sal. Añade la pasta y cocina el tiempo indicado en su empaque.',
      'Calienta el aceite en la sartén a fuego medio. Añade el ajo y remueve durante 30 segundos sin dejar que se queme.',
      'Agrega el tomate y la sal. Cocina a fuego medio durante 10 minutos, removiendo de vez en cuando.',
      'Escurre la pasta con cuidado, mézclala con la salsa y agrega la albahaca. Sirve caliente. Contiene gluten si utilizas pasta de trigo.',
    ],
  },
  {
    id: 'tostadas-frijoles',
    title: 'Tostadas de frijoles y aguacate',
    description: 'Crujientes, frescas y listas para esos días con poco tiempo.',
    minutes: 10,
    servings: 2,
    ingredients: [
      '4 tostadas de maíz',
      '1 taza de frijoles cocidos y escurridos',
      '1 aguacate',
      '1 tomate mediano',
      '½ limón',
      '¼ de cucharadita de sal',
      '2 cucharadas de agua',
    ],
    materials: [
      'Sartén pequeña',
      'Tenedor',
      'Cuchillo y tabla',
      'Cuchara',
      'Plato para servir',
    ],
    steps: [
      'Lava el tomate y córtalo en cubitos. Abre el aguacate y retira el hueso con una cuchara.',
      'Calienta los frijoles en una sartén con el agua a fuego medio durante 3 minutos. Machácalos con un tenedor y añade sal.',
      'Unta los frijoles sobre las tostadas. Agrega el aguacate en rebanadas y el tomate.',
      'Termina con unas gotas de limón y sirve enseguida para que las tostadas se mantengan crujientes.',
    ],
  },
  {
    id: 'avena-platano',
    title: 'Avena cremosa con plátano',
    description: 'Un desayuno sencillo para comenzar el día a tu ritmo.',
    minutes: 12,
    servings: 1,
    ingredients: [
      '½ taza de hojuelas de avena',
      '1 taza de leche o bebida vegetal',
      '1 plátano',
      '¼ de cucharadita de canela',
    ],
    materials: [
      'Olla pequeña',
      'Cuchara',
      'Taza medidora',
      'Cuchillo',
      'Tazón',
    ],
    steps: [
      'Coloca la avena y la leche o bebida vegetal en una olla pequeña.',
      'Calienta a fuego medio hasta que comience a hervir suavemente. Baja el fuego y cocina de 5 a 7 minutos, removiendo para evitar que se pegue.',
      'Pela el plátano y córtalo en rodajas. Mezcla la mitad con la avena.',
      'Sirve en un tazón y agrega el resto del plátano y la canela. Deja enfriar un poco antes de comer. Si tienes alergias, revisa las etiquetas de la avena y de la bebida elegida.',
    ],
  },
  {
    id: 'arroz-verduras',
    title: 'Arroz con verduras en una olla',
    description: 'Color, sabor y menos trastes por lavar.',
    minutes: 30,
    servings: 2,
    ingredients: [
      '1 taza de arroz blanco',
      '2 tazas de agua',
      '1 zanahoria mediana en cubitos',
      '½ taza de chícharos congelados',
      '1 cucharada de aceite',
      '½ cucharadita de sal',
    ],
    materials: [
      'Olla con tapa',
      'Colador fino',
      'Cuchillo y tabla',
      'Taza medidora',
      'Cuchara',
    ],
    steps: [
      'Lava la zanahoria y córtala en cubitos pequeños. Enjuaga el arroz en un colador fino.',
      'Calienta el aceite a fuego medio en la olla. Añade la zanahoria y cocina durante 3 minutos.',
      'Agrega el arroz, el agua, los chícharos y la sal. Remueve una vez y lleva a hervor.',
      'Baja el fuego al mínimo, tapa y cocina de 15 a 18 minutos, hasta que el arroz esté tierno y absorba el agua. Si sigue duro, añade un poco de agua y cocina unos minutos más.',
      'Apaga el fuego y deja reposar tapado durante 5 minutos. Separa los granos con un tenedor y sirve. Refrigera las sobras en un recipiente poco profundo antes de que pasen 2 horas.',
    ],
  },
]
export type RecipeCollection = { recipes: Recipe[]; favorites: string[] }
export const storageKey = 'alonetogether.recipes.v1'
export function validRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== 'object') return false
  const r = value as Recipe
  const list = (items: unknown) =>
    Array.isArray(items) &&
    items.length > 0 &&
    items.length <= 100 &&
    items.every(
      (item) =>
        typeof item === 'string' &&
        item.trim().length > 0 &&
        item.length <= 2000,
    )
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    r.own === true &&
    typeof r.title === 'string' &&
    r.title.trim().length > 0 &&
    r.title.length <= 100 &&
    typeof r.description === 'string' &&
    r.description.length <= 300 &&
    Number.isInteger(r.minutes) &&
    r.minutes > 0 &&
    r.minutes <= 1440 &&
    Number.isInteger(r.servings) &&
    r.servings > 0 &&
    r.servings <= 100 &&
    list(r.ingredients) &&
    list(r.materials) &&
    list(r.steps)
  )
}
export function readCollection(): RecipeCollection {
  const value = localStorage.getItem(storageKey)
  if (!value) return { recipes: [], favorites: [] }
  const data = JSON.parse(value) as RecipeCollection
  if (
    !Array.isArray(data.recipes) ||
    !data.recipes.every(validRecipe) ||
    !Array.isArray(data.favorites) ||
    !data.favorites.every((id) => typeof id === 'string') ||
    new Set(data.recipes.map((r) => r.id)).size !== data.recipes.length ||
    data.recipes.some((r) => catalog.some((c) => c.id === r.id))
  )
    throw new Error('Invalid recipe collection')
  return data
}
