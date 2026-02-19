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

  // ══════════════════════════════════════════════════════════
  // 60 nouveaux challenges
  // ══════════════════════════════════════════════════════════

  // ── Santé (10 nouveaux) ──
  { id: 'h61',  category: 'Santé', title: 'Yoga 20 min',              description: 'Séance de yoga pour la souplesse et le calme',   iconName: 'flower-2',        colorHex: '#B084FF', frequency: 'daily', trackingType: 'timer', targetMinutes: 20 },
  { id: 'h62',  category: 'Santé', title: '10 000 pas',               description: 'Atteindre 10k pas chaque jour',                  iconName: 'footprints',      colorHex: '#3DD68C', frequency: 'daily', trackingType: 'numeric', targetValue: 10000, unit: 'pas' },
  { id: 'h63',  category: 'Santé', title: 'Pas d\'alcool',            description: 'Journée sans consommer d\'alcool',               iconName: 'wine',            colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h64',  category: 'Santé', title: 'Prendre ses vitamines',    description: 'Ne pas oublier ses compléments',                 iconName: 'pill',            colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h65',  category: 'Santé', title: 'Douche froide',            description: 'Terminer par 30s d\'eau froide',                 iconName: 'droplets',        colorHex: '#00E5FF', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h66',  category: 'Santé', title: 'Posture correcte',         description: 'Vérifier sa posture 5x par jour',                iconName: 'activity',        colorHex: '#4DB6AC', frequency: 'daily', trackingType: 'numeric', targetValue: 5, unit: 'checks' },
  { id: 'h67',  category: 'Santé', title: 'Pas de sucre ajouté',      description: 'Éviter le sucre raffiné toute la journée',       iconName: 'candy-off',       colorHex: '#F48FB1', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h68',  category: 'Santé', title: 'Cardio 30 min',            description: 'Course, natation ou vélo',                       iconName: 'heart',           colorHex: '#FF5252', frequency: 'daily', trackingType: 'timer', targetMinutes: 30 },
  { id: 'h69',  category: 'Santé', title: 'Bain de soleil 15 min',    description: 'S\'exposer au soleil pour la vitamine D',        iconName: 'sun',             colorHex: '#FFEB3B', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h70',  category: 'Santé', title: 'Jeûne intermittent',       description: 'Respecter sa fenêtre alimentaire',               iconName: 'timer',           colorHex: '#7C4DFF', frequency: 'daily', trackingType: 'boolean' },

  // ── Productivité (10 nouveaux) ──
  { id: 'h71',  category: 'Productivité', title: 'Routine matinale',          description: 'Suivre sa routine du matin sans faillir',       iconName: 'sunrise',       colorHex: '#FFB74D', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h72',  category: 'Productivité', title: 'Time blocking',             description: 'Planifier sa journée par blocs horaires',       iconName: 'calendar-check', colorHex: '#64B5F6', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h73',  category: 'Productivité', title: 'Ranger son bureau',         description: 'Terminer la journée avec un bureau propre',     iconName: 'home',          colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h74',  category: 'Productivité', title: 'Pas de multitâche',         description: 'Se concentrer sur une seule tâche à la fois',   iconName: 'target',        colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h75',  category: 'Productivité', title: 'Automatiser 1 chose',       description: 'Éliminer une tâche répétitive par semaine',     iconName: 'rocket',        colorHex: '#B084FF', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h76',  category: 'Productivité', title: 'Dire non 1x',              description: 'Refuser une demande non prioritaire',            iconName: 'shield',        colorHex: '#FF5252', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h77',  category: 'Productivité', title: 'Revue de notes',            description: 'Relire et organiser ses notes',                  iconName: 'file-text',     colorHex: '#7986CB', frequency: 'daily', trackingType: 'timer', targetMinutes: 10 },
  { id: 'h78',  category: 'Productivité', title: '2 min rule',                description: 'Faire immédiatement ce qui prend < 2 min',      iconName: 'zap',           colorHex: '#FFEB3B', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h79',  category: 'Productivité', title: 'Side project 30 min',       description: 'Travailler sur son projet personnel',            iconName: 'laptop',        colorHex: '#00E5FF', frequency: 'daily', trackingType: 'timer', targetMinutes: 30 },
  { id: 'h80',  category: 'Productivité', title: 'Pas de réunion inutile',    description: 'Décliner les meetings sans agenda clair',        iconName: 'x-circle',      colorHex: '#9575CD', frequency: 'daily', trackingType: 'boolean' },

  // ── Mental (10 nouveaux) ──
  { id: 'h81',  category: 'Mental', title: 'Scan corporel',             description: '10 min de body scan pour se détendre',           iconName: 'activity',      colorHex: '#80DEEA', frequency: 'daily', trackingType: 'timer', targetMinutes: 10 },
  { id: 'h82',  category: 'Mental', title: 'Se féliciter',              description: 'Reconnaître une victoire chaque jour',           iconName: 'trophy',        colorHex: '#FFD54F', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h83',  category: 'Mental', title: 'Zéro plainte',              description: 'Passer la journée sans se plaindre',             iconName: 'smile',         colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h84',  category: 'Mental', title: 'Promenade contemplative',   description: '15 min de marche en pleine conscience',          iconName: 'footprints',    colorHex: '#4DB6AC', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h85',  category: 'Mental', title: 'Déconnexion digitale',      description: '1h sans aucun écran',                            iconName: 'smartphone-off', colorHex: '#E57373', frequency: 'daily', trackingType: 'timer', targetMinutes: 60 },
  { id: 'h86',  category: 'Mental', title: 'Lettre à soi-même',         description: 'Écrire à son futur soi chaque semaine',          iconName: 'pencil',        colorHex: '#F48FB1', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h87',  category: 'Mental', title: 'Écouter de la musique',     description: '15 min de musique relaxante ou motivante',       iconName: 'music',         colorHex: '#B39DDB', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h88',  category: 'Mental', title: 'Pas de comparaison',        description: 'Éviter de se comparer aux autres',               iconName: 'heart',         colorHex: '#FF80AB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h89',  category: 'Mental', title: 'Pardonner quelqu\'un',      description: 'Lâcher prise sur un ressentiment',               iconName: 'hand-heart',    colorHex: '#9575CD', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h90',  category: 'Mental', title: 'Cohérence cardiaque',       description: '5 min de respiration 5-5-5',                     iconName: 'heart',         colorHex: '#E57373', frequency: 'daily', trackingType: 'timer', targetMinutes: 5 },

  // ── Social (10 nouveaux) ──
  { id: 'h91',  category: 'Social', title: 'Sourire à un inconnu',      description: 'Répandre de la positivité au quotidien',         iconName: 'smile',         colorHex: '#FFD54F', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h92',  category: 'Social', title: 'Sortie entre amis',         description: 'Voir ses amis au moins 1x par semaine',          iconName: 'users',         colorHex: '#64B5F6', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h93',  category: 'Social', title: 'Aider quelqu\'un',          description: 'Rendre un service désintéressé',                 iconName: 'hand-heart',    colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h94',  category: 'Social', title: 'Écrire un message positif', description: 'Envoyer un message d\'encouragement',            iconName: 'message-circle', colorHex: '#F48FB1', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h95',  category: 'Social', title: 'Networking 15 min',         description: 'Développer son réseau professionnel',             iconName: 'globe',         colorHex: '#7986CB', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h96',  category: 'Social', title: 'Date night',                description: 'Temps de qualité en couple chaque semaine',       iconName: 'heart',         colorHex: '#FF80AB', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h97',  category: 'Social', title: 'Jouer avec les enfants',    description: '30 min de jeu dédié avec les enfants',            iconName: 'gamepad-2',     colorHex: '#FFB74D', frequency: 'daily', trackingType: 'timer', targetMinutes: 30 },
  { id: 'h98',  category: 'Social', title: 'Remercier quelqu\'un',      description: 'Exprimer sa gratitude à une personne',            iconName: 'star',          colorHex: '#FFEB3B', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h99',  category: 'Social', title: 'Bénévolat',                 description: 'Donner de son temps chaque semaine',              iconName: 'heart-handshake', colorHex: '#4DB6AC', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h100', category: 'Social', title: 'Écouter sans interrompre', description: 'Pratiquer l\'écoute active dans chaque échange',  iconName: 'ear',           colorHex: '#B39DDB', frequency: 'daily', trackingType: 'boolean' },

  // ── Apprentissage (10 nouveaux) ──
  { id: 'h101', category: 'Apprentissage', title: 'Vidéo éducative',         description: 'Regarder 1 vidéo pour apprendre',                iconName: 'video',        colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h102', category: 'Apprentissage', title: 'Flashcards Anki',         description: 'Réviser ses cartes chaque jour',                  iconName: 'layers',       colorHex: '#64B5F6', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h103', category: 'Apprentissage', title: 'Dessiner 15 min',         description: 'Pratiquer le dessin quotidiennement',             iconName: 'paintbrush',   colorHex: '#F48FB1', frequency: 'daily', trackingType: 'timer', targetMinutes: 15 },
  { id: 'h104', category: 'Apprentissage', title: 'Instrument de musique',   description: '20 min de pratique instrumentale',                iconName: 'music',        colorHex: '#B084FF', frequency: 'daily', trackingType: 'timer', targetMinutes: 20 },
  { id: 'h105', category: 'Apprentissage', title: 'Cours en ligne',          description: 'Suivre 1 leçon de cours en ligne',                iconName: 'graduation-cap', colorHex: '#7986CB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h106', category: 'Apprentissage', title: 'Apprendre 1 recette',     description: 'Maîtriser une nouvelle recette par semaine',      iconName: 'utensils',     colorHex: '#FFB74D', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h107', category: 'Apprentissage', title: 'Écrire un résumé',        description: 'Résumer ce qu\'on a appris dans la journée',      iconName: 'pencil',       colorHex: '#81C784', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h108', category: 'Apprentissage', title: 'Débat / Discussion',      description: 'Discuter d\'un sujet en profondeur',              iconName: 'message-circle', colorHex: '#80DEEA', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h109', category: 'Apprentissage', title: 'Photo du jour',           description: 'Capturer un moment et progresser en photo',       iconName: 'camera',       colorHex: '#9575CD', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h110', category: 'Apprentissage', title: 'Enseigner à quelqu\'un', description: 'Expliquer un concept pour mieux le comprendre',   iconName: 'lightbulb',    colorHex: '#FFD54F', frequency: 'daily', trackingType: 'boolean' },

  // ── Lifestyle (10 nouveaux) ──
  { id: 'h111', category: 'Lifestyle', title: 'Faire son lit',             description: 'Commencer la journée par une petite victoire',  iconName: 'bed-double',    colorHex: '#B39DDB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h112', category: 'Lifestyle', title: 'Skincare routine',          description: 'Prendre soin de sa peau matin et soir',         iconName: 'sparkles',      colorHex: '#F48FB1', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h113', category: 'Lifestyle', title: 'Ranger 10 min',            description: 'Désencombrer un espace de la maison',            iconName: 'home',          colorHex: '#81C784', frequency: 'daily', trackingType: 'timer', targetMinutes: 10 },
  { id: 'h114', category: 'Lifestyle', title: 'Plantes / Jardin',         description: 'S\'occuper de ses plantes chaque jour',          iconName: 'leaf',          colorHex: '#4DB6AC', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h115', category: 'Lifestyle', title: 'Pas d\'achat en ligne',    description: 'Résister aux achats compulsifs en ligne',        iconName: 'credit-card',   colorHex: '#E57373', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h116', category: 'Lifestyle', title: 'Préparer ses vêtements',   description: 'Choisir sa tenue la veille au soir',             iconName: 'shirt',         colorHex: '#7986CB', frequency: 'daily', trackingType: 'boolean' },
  { id: 'h117', category: 'Lifestyle', title: 'Écouter un audiobook',     description: '20 min d\'audiobook chaque jour',                iconName: 'headphones',    colorHex: '#B084FF', frequency: 'daily', trackingType: 'timer', targetMinutes: 20 },
  { id: 'h118', category: 'Lifestyle', title: 'Sortir dans la nature',    description: 'Passer du temps en plein air chaque semaine',    iconName: 'mountain',      colorHex: '#3DD68C', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h119', category: 'Lifestyle', title: 'DIY / Bricolage',          description: 'Créer ou réparer quelque chose par semaine',     iconName: 'wrench',        colorHex: '#FFB74D', frequency: 'weekly', trackingType: 'boolean' },
  { id: 'h120', category: 'Lifestyle', title: 'Digital cleanup',          description: 'Supprimer fichiers, mails et apps inutiles',     iconName: 'trash',         colorHex: '#9575CD', frequency: 'weekly', trackingType: 'boolean' },
]
