export interface ChallengeHabitTemplate {
  title: string
  iconName: string
  colorHex: string
  frequency: 'daily' | 'weekly'
  trackingType: 'boolean' | 'numeric' | 'timer'
  targetValue?: number
  unit?: string
  targetMinutes?: number
}

export interface ChallengeTemplate {
  id: string
  category: string
  name: string
  description: string
  iconName: string
  colorHex: string
  durationDays: number
  habits: ChallengeHabitTemplate[]
}

const h = (title: string, iconName: string, colorHex: string, frequency: 'daily' | 'weekly' = 'daily', trackingType: 'boolean' | 'numeric' | 'timer' = 'boolean', targetValue?: number, unit?: string, targetMinutes?: number): ChallengeHabitTemplate =>
  ({ title, iconName, colorHex, frequency, trackingType, targetValue, unit, targetMinutes })

export const CATEGORIES = ['Santé', 'Productivité', 'Mental', 'Social', 'Apprentissage', 'Lifestyle'] as const

export const CHALLENGES: ChallengeTemplate[] = [
  // Santé
  { id: 'c1', category: 'Santé', name: '30 Jours Bien-Être', description: 'Méditation, exercice et journaling chaque jour', iconName: 'heart', colorHex: '#FF6B9D', durationDays: 30, habits: [h('Méditation 10 min', 'brain', '#B084FF', 'daily', 'timer', undefined, undefined, 10), h('Exercice physique', 'running', '#3DD68C'), h('Journaling', 'pencil', '#5B9FFF')] },
  { id: 'c2', category: 'Santé', name: 'Forme Physique', description: '5 séances de sport + hydratation', iconName: 'dumbbell', colorHex: '#3DD68C', durationDays: 30, habits: [h('Séance de sport', 'running', '#3DD68C', 'weekly'), h('Boire 2L d\'eau', 'droplets', '#00E5FF', 'daily', 'numeric', 2, 'L')] },
  { id: 'c3', category: 'Santé', name: 'Hydratation', description: 'Boire suffisamment chaque jour', iconName: 'droplets', colorHex: '#00E5FF', durationDays: 21, habits: [h('Boire 2.5L', 'droplets', '#00E5FF', 'daily', 'numeric', 2.5, 'L'), h('Pas de soda', 'x-circle', '#FF5252')] },
  { id: 'c4', category: 'Santé', name: 'Sommeil Réparateur', description: 'Améliorer la qualité du sommeil', iconName: 'moon', colorHex: '#B084FF', durationDays: 21, habits: [h('Couché avant 23h', 'moon', '#B084FF'), h('Pas d\'écran 1h avant', 'smartphone-off', '#FF5252'), h('8h de sommeil', 'bed-double', '#5B9FFF', 'daily', 'numeric', 8, 'h')] },
  { id: 'c5', category: 'Santé', name: 'Bonne Posture', description: 'Corriger ta posture au quotidien', iconName: 'user', colorHex: '#FFEB3B', durationDays: 30, habits: [h('Étirements matin', 'stretch-horizontal', '#FFEB3B', 'daily', 'timer', undefined, undefined, 10), h('Renforcement dos', 'dumbbell', '#3DD68C', 'daily', 'timer', undefined, undefined, 15)] },
  { id: 'c6', category: 'Santé', name: 'Alimentation Saine', description: 'Manger équilibré pendant 30 jours', iconName: 'utensils', colorHex: '#3DD68C', durationDays: 30, habits: [h('5 fruits & légumes', 'leaf', '#3DD68C', 'daily', 'numeric', 5, 'portions'), h('Cuisiner maison', 'utensils', '#FF9F5A')] },

  // Productivité
  { id: 'c7', category: 'Productivité', name: 'Morning Routine', description: 'Routine matinale complète', iconName: 'sun', colorHex: '#FF9F5A', durationDays: 21, habits: [h('Se lever à 6h', 'alarm-clock', '#FF9F5A'), h('Étirements 5 min', 'stretch-horizontal', '#FFEB3B', 'daily', 'timer', undefined, undefined, 5), h('Petit-déjeuner sain', 'utensils', '#3DD68C')] },
  { id: 'c8', category: 'Productivité', name: 'Deep Work', description: '2h de travail profond par jour', iconName: 'brain', colorHex: '#5B9FFF', durationDays: 30, habits: [h('Deep Work 2h', 'brain', '#5B9FFF', 'daily', 'timer', undefined, undefined, 120), h('Mode avion activé', 'plane', '#FF9F5A')] },
  { id: 'c9', category: 'Productivité', name: 'Pomodoro Master', description: 'Travailler par sessions Pomodoro', iconName: 'clock', colorHex: '#FF5252', durationDays: 21, habits: [h('8 Pomodoros', 'clock', '#FF5252', 'daily', 'numeric', 8, 'pomodoros'), h('Pause entre', 'coffee', '#FF9F5A')] },
  { id: 'c10', category: 'Productivité', name: 'Anti-Procrastination', description: 'Vaincre la procrastination', iconName: 'zap', colorHex: '#FFEB3B', durationDays: 14, habits: [h('Tâche difficile en premier', 'zap', '#FFEB3B'), h('3 priorités/jour', 'list', '#5B9FFF')] },
  { id: 'c11', category: 'Productivité', name: 'Inbox Zero', description: 'Gérer efficacement tes emails', iconName: 'inbox', colorHex: '#5B9FFF', durationDays: 21, habits: [h('Traiter tous les emails', 'mail', '#5B9FFF'), h('Répondre en < 24h', 'clock', '#FF9F5A')] },
  { id: 'c12', category: 'Productivité', name: 'Weekly Review', description: 'Bilan hebdomadaire structuré', iconName: 'calendar', colorHex: '#B084FF', durationDays: 30, habits: [h('Planifier la semaine', 'calendar', '#B084FF', 'weekly'), h('Bilan du vendredi', 'file-text', '#5B9FFF', 'weekly')] },

  // Mental
  { id: 'c13', category: 'Mental', name: 'Mindfulness', description: 'Pleine conscience et gratitude', iconName: 'sparkles', colorHex: '#B084FF', durationDays: 21, habits: [h('Méditation guidée', 'brain', '#B084FF', 'daily', 'timer', undefined, undefined, 15), h('3 gratitudes', 'heart', '#FF6B9D'), h('Respiration profonde', 'wind', '#00E5FF', 'daily', 'timer', undefined, undefined, 5)] },
  { id: 'c14', category: 'Mental', name: 'Journal de Gratitude', description: 'Écrire 3 choses positives chaque jour', iconName: 'heart', colorHex: '#FF6B9D', durationDays: 30, habits: [h('3 gratitudes écrites', 'heart', '#FF6B9D'), h('1 compliment donné', 'thumbs-up', '#FF9F5A')] },
  { id: 'c15', category: 'Mental', name: 'Journaling', description: 'Écrire ses pensées chaque jour', iconName: 'pencil', colorHex: '#5B9FFF', durationDays: 30, habits: [h('Écrire 10 min', 'pencil', '#5B9FFF', 'daily', 'timer', undefined, undefined, 10)] },
  { id: 'c16', category: 'Mental', name: 'Stoïcisme', description: 'Pratiquer la philosophie stoïcienne', iconName: 'building', colorHex: '#7C4DFF', durationDays: 30, habits: [h('Lecture stoïcienne', 'book-open', '#7C4DFF', 'daily', 'timer', undefined, undefined, 15), h('Réflexion du soir', 'moon', '#B084FF')] },
  { id: 'c17', category: 'Mental', name: 'Visualisation', description: 'Visualiser ses objectifs chaque matin', iconName: 'eye', colorHex: '#00E5FF', durationDays: 21, habits: [h('Visualisation 5 min', 'eye', '#00E5FF', 'daily', 'timer', undefined, undefined, 5)] },
  { id: 'c18', category: 'Mental', name: 'Affirmations Positives', description: 'Répéter des affirmations chaque matin', iconName: 'quote', colorHex: '#FFEB3B', durationDays: 21, habits: [h('5 affirmations', 'quote', '#FFEB3B'), h('Se regarder dans le miroir', 'smile', '#FF9F5A')] },

  // Social
  { id: 'c19', category: 'Social', name: 'Networking', description: 'Développer son réseau', iconName: 'users', colorHex: '#5B9FFF', durationDays: 30, habits: [h('Contacter 1 personne', 'message-circle', '#5B9FFF'), h('Poster sur LinkedIn', 'globe', '#00E5FF', 'weekly')] },
  { id: 'c20', category: 'Social', name: 'Communication', description: 'Améliorer ses compétences sociales', iconName: 'message-circle', colorHex: '#3DD68C', durationDays: 21, habits: [h('Écoute active 15 min', 'ear', '#3DD68C', 'daily', 'timer', undefined, undefined, 15), h('Compliment sincère', 'thumbs-up', '#FF9F5A')] },
  { id: 'c21', category: 'Social', name: 'Qualité Famille', description: 'Du temps de qualité en famille', iconName: 'home', colorHex: '#FF9F5A', durationDays: 30, habits: [h('Repas en famille', 'utensils', '#FF9F5A'), h('Appeler un proche', 'phone', '#5B9FFF')] },
  { id: 'c22', category: 'Social', name: 'Actes de Gentillesse', description: 'Un acte de gentillesse par jour', iconName: 'gift', colorHex: '#FF6B9D', durationDays: 30, habits: [h('1 acte de gentillesse', 'gift', '#FF6B9D'), h('Sourire aux inconnus', 'smile', '#FFEB3B')] },
  { id: 'c23', category: 'Social', name: 'No Social Media', description: 'Réduire les réseaux sociaux', iconName: 'smartphone-off', colorHex: '#FF5252', durationDays: 14, habits: [h('Max 30 min réseaux', 'clock', '#FF5252', 'daily', 'numeric', 30, 'min'), h('Pas de scroll au réveil', 'sun', '#FF9F5A')] },
  { id: 'c24', category: 'Social', name: 'Écoute Active', description: 'Devenir un meilleur auditeur', iconName: 'ear', colorHex: '#B084FF', durationDays: 21, habits: [h('Écouter sans interrompre', 'ear', '#B084FF'), h('Poser 3 questions', 'help-circle', '#3DD68C')] },

  // Apprentissage
  { id: 'c25', category: 'Apprentissage', name: 'Lecteur Assidu', description: 'Lire 20 pages par jour', iconName: 'book-open', colorHex: '#5B9FFF', durationDays: 30, habits: [h('Lire 20 pages', 'book-open', '#5B9FFF', 'daily', 'numeric', 20, 'pages')] },
  { id: 'c26', category: 'Apprentissage', name: 'Langue Étrangère', description: 'Pratiquer une langue chaque jour', iconName: 'globe', colorHex: '#3DD68C', durationDays: 30, habits: [h('Leçon 15 min', 'globe', '#3DD68C', 'daily', 'timer', undefined, undefined, 15), h('10 mots de vocabulaire', 'type', '#5B9FFF', 'daily', 'numeric', 10, 'mots')] },
  { id: 'c27', category: 'Apprentissage', name: 'Podcast Quotidien', description: 'Écouter un podcast éducatif', iconName: 'headphones', colorHex: '#B084FF', durationDays: 30, habits: [h('Écouter 1 épisode', 'headphones', '#B084FF'), h('Prendre des notes', 'pencil', '#5B9FFF')] },
  { id: 'c28', category: 'Apprentissage', name: 'Écriture Créative', description: 'Écrire pour développer sa créativité', iconName: 'pencil', colorHex: '#FF6B9D', durationDays: 30, habits: [h('Écrire 500 mots', 'pencil', '#FF6B9D', 'daily', 'numeric', 500, 'mots')] },
  { id: 'c29', category: 'Apprentissage', name: 'Coding Challenge', description: 'Coder chaque jour', iconName: 'code', colorHex: '#00E5FF', durationDays: 30, habits: [h('Coder 1h', 'code', '#00E5FF', 'daily', 'timer', undefined, undefined, 60), h('1 problème algo', 'function-square', '#FFEB3B')] },
  { id: 'c30', category: 'Apprentissage', name: 'Culture Générale', description: 'Apprendre quelque chose de nouveau', iconName: 'lightbulb', colorHex: '#FFEB3B', durationDays: 30, habits: [h('1 article éducatif', 'file-text', '#FFEB3B'), h('1 vidéo éducative', 'play', '#FF5252')] },

  // Lifestyle
  { id: 'c31', category: 'Lifestyle', name: 'Digital Detox', description: 'Réduire le temps d\'écran', iconName: 'smartphone-off', colorHex: '#FF5252', durationDays: 14, habits: [h('Max 2h écran loisir', 'clock', '#FF5252'), h('Pas de téléphone au lit', 'bed-double', '#B084FF'), h('Lire un livre', 'book-open', '#5B9FFF')] },
  { id: 'c32', category: 'Lifestyle', name: 'Minimalisme', description: 'Se débarrasser du superflu', iconName: 'layers', colorHex: '#7C4DFF', durationDays: 30, habits: [h('Jeter/donner 1 objet', 'trash', '#7C4DFF'), h('Pas d\'achat impulsif', 'x-circle', '#FF5252')] },
  { id: 'c33', category: 'Lifestyle', name: 'Écologie', description: 'Adopter des gestes éco-responsables', iconName: 'leaf', colorHex: '#3DD68C', durationDays: 30, habits: [h('Zéro déchet', 'leaf', '#3DD68C'), h('Transport doux', 'bike', '#5B9FFF')] },
  { id: 'c34', category: 'Lifestyle', name: 'Finances Saines', description: 'Gérer son argent intelligemment', iconName: 'banknote', colorHex: '#3DD68C', durationDays: 30, habits: [h('Noter ses dépenses', 'list', '#3DD68C'), h('Épargner 10%', 'banknote', '#FFEB3B')] },
  { id: 'c35', category: 'Lifestyle', name: 'Cuisine Maison', description: 'Cuisiner soi-même tous les jours', iconName: 'utensils', colorHex: '#FF9F5A', durationDays: 21, habits: [h('Cuisiner 1 repas', 'utensils', '#FF9F5A'), h('Nouvelle recette', 'book-open', '#5B9FFF', 'weekly')] },
  { id: 'c36', category: 'Lifestyle', name: 'Créativité', description: 'Stimuler sa créativité chaque jour', iconName: 'paintbrush', colorHex: '#FF6B9D', durationDays: 30, habits: [h('Créer quelque chose', 'paintbrush', '#FF6B9D'), h('S\'inspirer 15 min', 'sparkles', '#B084FF', 'daily', 'timer', undefined, undefined, 15)] },
]
