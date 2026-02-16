export interface HabitTemplate {
  id: string
  category: string
  title: string
  description: string
  iconName: string
  colorHex: string
  frequency: 'daily' | 'weekly'
  trackingType: 'boolean' | 'numeric' | 'timer'
  targetValue?: number
  unit?: string
  targetMinutes?: number
}

export const CATEGORIES = ['Santé', 'Productivité', 'Mental', 'Social', 'Apprentissage', 'Lifestyle'] as const

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // ── Santé ──
  { id: 'h1',  category: 'Santé', title: 'Méditation',             description: '10 minutes de méditation guidée',          iconName: 'brain',              colorHex: '#B084FF', frequency: 'daily', trackingType: 'timer', targetMinutes: 10 },
  { id: 'h2',  category: 'Santé', title: 'Exercice physique',      description: 'Bouger son corps chaque jour',             iconName: 'dumbbell',           colorHex: '#3DD68C', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h3',  category: 'Santé', title: 'Boire 2L d\'eau',       description: 'Rester bien hydraté',                      iconName: 'droplets',           colorHex: '#64B5F6', frequency: 'daily', trackingType: 'numeric', targetValue: 2, unit: 'L' },
  { id: 'h4',  category: 'Santé', title: 'Couché avant 23h',      description: 'Améliorer la qualité du sommeil',          iconName: 'moon',               colorHex: '#9575CD', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h5',  category: 'Santé', title: '8h de sommeil',          description: 'Dormir suffisamment chaque nuit',          iconName: 'bed-double',         colorHex: '#7986CB', frequency: 'daily', trackingType: 'numeric', targetValue: 8, unit: 'h' },
  { id: 'h6',  category: 'Santé', title: 'Pas d\'écran avant dodo', description: 'Couper les écrans 1h avant le coucher',  iconName: 'smartphone-off',     colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h7',  category: 'Santé', title: 'Étirements',             description: '10 minutes d\'étirements le matin',        iconName: 'stretch-horizontal', colorHex: '#FFD54F', frequency: 'daily', trackingType: 'timer', targetMinutes: 10 },
  { id: 'h8',  category: 'Santé', title: '5 fruits & légumes',     description: 'Manger équilibré chaque jour',             iconName: 'leaf',               colorHex: '#81C784', frequency: 'daily', trackingType: 'numeric', targetValue: 5, unit: 'portions' },
  { id: 'h9',  category: 'Santé', title: 'Cuisiner maison',        description: 'Préparer un repas fait maison',            iconName: 'utensils',           colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h10', category: 'Santé', title: 'Pas de soda',            description: 'Éviter les boissons sucrées',              iconName: 'x-circle',           colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h11', category: 'Santé', title: 'Séance de sport',        description: '5 séances par semaine',                    iconName: 'running',            colorHex: '#4DB6AC', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h12', category: 'Santé', title: 'Renforcement dos',       description: '15 min de renforcement musculaire',        iconName: 'dumbbell',           colorHex: '#4DB6AC', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h13', category: 'Santé', title: 'Marcher 30 min',         description: 'Prendre l\'air chaque jour',               iconName: 'footprints',         colorHex: '#81C784', frequency: 'daily', trackingType: 'timer', targetMinutes: 30 },
  { id: 'h14', category: 'Santé', title: 'Pas de fast-food',       description: 'Éviter la malbouffe',                      iconName: 'x-circle',           colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },

  // ── Productivité ──
  { id: 'h15', category: 'Productivité', title: 'Se lever à 6h',         description: 'Commencer la journée tôt',                iconName: 'alarm-clock',        colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h16', category: 'Productivité', title: 'Deep Work',              description: '2h de travail profond sans distraction',   iconName: 'brain',              colorHex: '#64B5F6', frequency: 'daily', trackingType: 'timer', targetMinutes: 120 },
  { id: 'h17', category: 'Productivité', title: 'Pomodoros',              description: '8 sessions Pomodoro par jour',             iconName: 'clock',              colorHex: '#E57373', frequency: 'daily', trackingType: 'numeric', targetValue: 8, unit: 'pomodoros' },
  { id: 'h18', category: 'Productivité', title: 'Tâche difficile en 1er', description: 'Commencer par le plus dur',               iconName: 'zap',                colorHex: '#FFD54F', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h19', category: 'Productivité', title: '3 priorités du jour',    description: 'Définir ses 3 objectifs principaux',      iconName: 'list',               colorHex: '#64B5F6', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h20', category: 'Productivité', title: 'Inbox Zero',             description: 'Traiter tous les emails',                  iconName: 'mail',               colorHex: '#7986CB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h21', category: 'Productivité', title: 'Planifier la semaine',   description: 'Bilan et planification hebdomadaire',      iconName: 'calendar',           colorHex: '#9575CD', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h22', category: 'Productivité', title: 'Mode avion 2h',          description: 'Couper les notifications pour se concentrer', iconName: 'plane',          colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h23', category: 'Productivité', title: 'Petit-déjeuner sain',    description: 'Bien commencer la journée',               iconName: 'utensils',           colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h24', category: 'Productivité', title: 'Bilan du vendredi',      description: 'Revue hebdomadaire de ses progrès',        iconName: 'file-text',          colorHex: '#7986CB', frequency: 'weekly', trackingType: 'boolean' },

  // ── Mental ──
  { id: 'h25', category: 'Mental', title: 'Méditation guidée',       description: '15 min de pleine conscience',                iconName: 'brain',           colorHex: '#9575CD', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h26', category: 'Mental', title: '3 gratitudes',            description: 'Écrire 3 choses positives chaque jour',      iconName: 'heart',           colorHex: '#F48FB1', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h27', category: 'Mental', title: 'Respiration profonde',    description: '5 min d\'exercices de respiration',           iconName: 'wind',            colorHex: '#80DEEA', frequency: 'daily', trackingType: 'timer', targetMinutes: 5 },
  { id: 'h28', category: 'Mental', title: 'Journaling',              description: 'Écrire ses pensées pendant 10 min',          iconName: 'pencil',          colorHex: '#64B5F6', frequency: 'daily', trackingType: 'timer', targetMinutes: 10 },
  { id: 'h29', category: 'Mental', title: 'Lecture stoïcienne',      description: '15 min de philosophie stoïcienne',            iconName: 'book-open',       colorHex: '#9575CD', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h30', category: 'Mental', title: 'Réflexion du soir',       description: 'Prendre du recul sur sa journée',            iconName: 'moon',            colorHex: '#B39DDB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h31', category: 'Mental', title: 'Visualisation',           description: '5 min pour visualiser ses objectifs',         iconName: 'eye',             colorHex: '#80DEEA', frequency: 'daily', trackingType: 'timer', targetMinutes: 5 },
  { id: 'h32', category: 'Mental', title: '5 affirmations',          description: 'Répéter des affirmations positives',          iconName: 'quote',           colorHex: '#FFD54F', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h33', category: 'Mental', title: 'Compliment donné',        description: 'Faire un compliment sincère à quelqu\'un',   iconName: 'thumbs-up',       colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },

  // ── Social ──
  { id: 'h34', category: 'Social', title: 'Contacter 1 personne',    description: 'Garder le lien avec son réseau',             iconName: 'message-circle',  colorHex: '#64B5F6', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h35', category: 'Social', title: 'Écoute active',           description: '15 min d\'écoute attentive',                  iconName: 'ear',             colorHex: '#81C784', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h36', category: 'Social', title: 'Repas en famille',        description: 'Partager un repas en bonne compagnie',        iconName: 'utensils',        colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h37', category: 'Social', title: 'Appeler un proche',       description: 'Prendre des nouvelles de quelqu\'un',         iconName: 'phone',           colorHex: '#7986CB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h38', category: 'Social', title: 'Acte de gentillesse',     description: 'Faire un geste gentil pour quelqu\'un',       iconName: 'gift',            colorHex: '#F48FB1', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h39', category: 'Social', title: 'Max 30 min réseaux',      description: 'Limiter le temps sur les réseaux sociaux',    iconName: 'clock',           colorHex: '#E57373', frequency: 'daily', trackingType: 'numeric', targetValue: 30, unit: 'min' },
  { id: 'h40', category: 'Social', title: 'Pas de scroll au réveil', description: 'Commencer la journée sans téléphone',         iconName: 'sun',             colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h41', category: 'Social', title: 'Poster sur LinkedIn',     description: 'Partager du contenu chaque semaine',           iconName: 'globe',           colorHex: '#64B5F6', frequency: 'weekly', trackingType: 'boolean' },

  // ── Apprentissage ──
  { id: 'h42', category: 'Apprentissage', title: 'Lire 20 pages',          description: 'Lire chaque jour pour progresser',          iconName: 'book-open',    colorHex: '#64B5F6', frequency: 'daily', trackingType: 'numeric', targetValue: 20, unit: 'pages' },
  { id: 'h43', category: 'Apprentissage', title: 'Leçon de langue',        description: '15 min de pratique d\'une langue',           iconName: 'globe',        colorHex: '#81C784', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h44', category: 'Apprentissage', title: '10 mots de vocabulaire', description: 'Apprendre du vocabulaire chaque jour',       iconName: 'type',         colorHex: '#7986CB', frequency: 'daily', trackingType: 'numeric', targetValue: 10, unit: 'mots' },
  { id: 'h45', category: 'Apprentissage', title: 'Écouter un podcast',     description: 'Un épisode éducatif par jour',               iconName: 'headphones',   colorHex: '#B39DDB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h46', category: 'Apprentissage', title: 'Écrire 500 mots',       description: 'Développer sa créativité par l\'écriture',   iconName: 'pencil',       colorHex: '#F48FB1', frequency: 'daily', trackingType: 'numeric', targetValue: 500, unit: 'mots' },
  { id: 'h47', category: 'Apprentissage', title: 'Coder 1h',              description: 'Pratiquer la programmation',                  iconName: 'code',         colorHex: '#80DEEA', frequency: 'daily', trackingType: 'timer', targetMinutes: 60 },
  { id: 'h48', category: 'Apprentissage', title: '1 article éducatif',    description: 'Apprendre quelque chose de nouveau',          iconName: 'file-text',    colorHex: '#FFD54F', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h49', category: 'Apprentissage', title: 'Prendre des notes',     description: 'Résumer ce qu\'on apprend',                   iconName: 'pencil',       colorHex: '#7986CB', frequency: 'daily', trackingType: 'boolean' },

  // ── Lifestyle ──
  { id: 'h50', category: 'Lifestyle', title: 'Max 2h écran loisir',     description: 'Réduire le temps d\'écran récréatif',      iconName: 'clock',           colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h51', category: 'Lifestyle', title: 'Jeter/donner 1 objet',    description: 'Simplifier son quotidien',                  iconName: 'trash',           colorHex: '#9575CD', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h52', category: 'Lifestyle', title: 'Zéro déchet',             description: 'Adopter des gestes éco-responsables',        iconName: 'leaf',            colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h53', category: 'Lifestyle', title: 'Transport doux',          description: 'Marcher, vélo ou transports en commun',      iconName: 'bike',            colorHex: '#4DB6AC', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h54', category: 'Lifestyle', title: 'Noter ses dépenses',      description: 'Suivre son budget au quotidien',             iconName: 'list',            colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h55', category: 'Lifestyle', title: 'Épargner',                description: 'Mettre de côté chaque semaine',              iconName: 'banknote',        colorHex: '#FFD54F', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h56', category: 'Lifestyle', title: 'Nouvelle recette',        description: 'Essayer une nouvelle recette par semaine',   iconName: 'book-open',       colorHex: '#64B5F6', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h57', category: 'Lifestyle', title: 'Créer quelque chose',     description: 'Stimuler sa créativité chaque jour',         iconName: 'paintbrush',      colorHex: '#F48FB1', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h58', category: 'Lifestyle', title: 'S\'inspirer 15 min',      description: 'Explorer des idées et de l\'inspiration',    iconName: 'sparkles',        colorHex: '#B39DDB', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h59', category: 'Lifestyle', title: 'Pas d\'achat impulsif',   description: 'Réfléchir avant d\'acheter',                 iconName: 'x-circle',        colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h60', category: 'Lifestyle', title: 'Lire un livre',           description: 'Remplacer les écrans par la lecture',         iconName: 'book-open',       colorHex: '#64B5F6', frequency: 'daily', trackingType: 'boolean' },
]
