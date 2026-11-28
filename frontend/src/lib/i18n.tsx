import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "fr" | "ar";

export type Translations = {
  // Navigation
  nav: {
    findRoom: string;
    myBookings: string;
    scheduling: string;
    administration: string;
    statistics: string;
    aiReports: string;
    users: string;
  };
  // Auth
  auth: {
    signIn: string;
    signOut: string;
    email: string;
    password: string;
    showPassword: string;
    hidePassword: string;
    signingIn: string;
    enterCredentials: string;
    invalidCredentials: string;
    demoData: string;
    chooseAccount: string;
  };
  // User menu
  user: {
    professor: string;
    administrator: string;
  };
  // Page headers
  headers: {
    findRoom: { title: string; lead: string };
    myBookings: { title: string; lead: string };
    scheduling: { title: string; lead: string };
    administration: { title: string; lead: string };
    statistics: { title: string; lead: string };
    aiReports: { title: string; lead: string };
    users: { title: string; lead: string };
  };
  // Scheduling page
  scheduling: {
    selectPromo: string;
    promoPlaceholder: string;
    noPromoAssigned: string;
    timetable: string;
    day: string;
    time: string;
    module: string;
    classroom: string;
    promotion: string;
    noSessions: string;
    officialSessionsOnly: string;
    today: string;
    newBooking: string;
    editBooking: string;
    room: string;
    roomRequired: string;
    capacity: string;
    title: string;
    titlePlaceholder: string;
    titleRequired: string;
    description: string;
    descriptionPlaceholder: string;
    date: string;
    startTime: string;
    endTime: string;
    conflict: string;
    confirmDelete: string;
    subtitle: string;
    dayView: string;
    weekView: string;
    weekOf: string;
    bookSlot: string;
    createBooking: string;
    oddWeeks: string;
    evenWeeks: string;
  };
  // Admin Statistics
  stats: {
    title: string;
    subtitle: string;
    totalBookings: string;
    totalHours: string;
    avgUtilization: string;
    activeRooms: string;
    vsPrevPeriod: string;
    chartLabel: string;
    timeRange: string;
    bookingTrends: string;
    selectMetric: string;
    metricBookings: string;
    metricHours: string;
    metricRooms: string;
    metricProfessors: string;
    chartType: string;
    chartTypeLine: string;
    chartTypeArea: string;
    chartTypeBar: string;
    roomUtilization: string;
    high: string;
    medium: string;
    low: string;
    capacity: string;
    utilization: string;
    aiInsights: string;
    aiSubtitle: string;
    refreshInsights: string;
    impactHigh: string;
    impactMedium: string;
    impactLow: string;
    confidence: string;
    totalRooms: string;
    totalProfessors: string;
    avgBookingDuration: string;
    peakUtilization: string;
    weeklyBookings: string;
    cancelRate: string;
    summarySection: string;
    kpiSection: string;
    bookings: string;
    kpi: {
      totalUsers: string;
      totalProfessors: string;
      totalAdmins: string;
      totalRooms: string;
      totalBookings: string;
      totalSessions: string;
      roomUtilization: string;
      avgSessionDuration: string;
    };
    charts: {
      userActivity: string;
      professorActivity: string;
      roomUsage: string;
      bookingTrends: string;
      scheduleDensity: string;
      conflictRate: string;
    };
  };
  // Admin AI Reports
  aiReports: {
    title: string;
    subtitle: string;
    welcomeTitle: string;
    welcomeMessage: string;
    newChat: string;
    newChatWelcome: string;
    untitledChat: string;
    templates: string;
    reportTemplates: string;
    history: string;
    chatHistory: string;
    messages: string;
    aiAssistant: string;
    confidence: string;
    inputPlaceholder: string;
    welcomePlaceholder: string;
    voiceInput: string;
    followUp: string;
    sources: string;
    inputHint: string;
    newLine: string;
    templateStarted: string;
    generatingReport: string;
    addFile: string;
    customAnalysis: string;
    customAnalysisDesc: string;
    customPlaceholder: string;
    startAnalysis: string;
    confirmDelete: string;
    noHistory: string;
    conversation: string;
    suggestedPrompts: {
      generateReport: string;
      analyzeProfessors: string;
      analyzeRooms: string;
      summarizeActivity: string;
      findConflicts: string;
      generateRecommendations: string;
    };
    addFileHint: string;
    addFileSuccess: string;
    fileTypeError: string;
  };
  // Admin Users
  // Admin Users
  users: {
    title: string;
    lead: string;
    searchPlaceholder: string;
    columns: {
      name: string;
      email: string;
      role: string;
      status: string;
      actions: string;
    };
    status: {
      active: string;
      inactive: string;
    };
    actions: {
      delete: string;
      activities: string;
      edit: string;
    };
    deleteConfirm: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    activities: {
      title: string;
      noActivities: string;
      createdSession: string;
      bookedRoom: string;
      recentAction: string;
      date: string;
    };
    edit: {
      title: string;
      save: string;
      cancel: string;
      name: string;
      email: string;
      role: string;
    };
  };
  // Homepage AI Recommendations
  recommendations: {
    title: string;
    subtitle: string;
    items: {
      findRoom: { title: string; description: string };
      bookSession: { title: string; description: string };
      checkAvailability: { title: string; description: string };
      viewSchedule: { title: string; description: string };
      manageRooms: { title: string; description: string };
      viewAnalytics: { title: string; description: string };
    };
  };
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    close: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    clear: string;
    noData: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    copy: string;
    export: string;
    refresh: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    english: string;
    french: string;
    arabic: string;
    send: string;
  };
};

const translations: Record<Locale, Translations> = {
  en: {
    nav: {
      findRoom: "Find a room",
      myBookings: "My bookings",
      scheduling: "Scheduling",
      administration: "Administration",
      statistics: "Statistics",
      aiReports: "AI Reports",
      users: "Users",
    },
    auth: {
      signIn: "Sign in",
      signOut: "Sign out",
      email: "University email",
      password: "Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      signingIn: "Signing in…",
      enterCredentials: "Enter your email and password.",
      invalidCredentials: "The email or password is not correct.",
      demoData: "Demo data only. Choose an account to fill the form.",
      chooseAccount: "Choose an account",
    },
    user: {
      professor: "Professor",
      administrator: "Administrator",
    },
    headers: {
      findRoom: { title: "Find a room", lead: "Describe what you need, or set the filters yourself." },
      myBookings: { title: "My bookings", lead: "Your upcoming additional sessions." },
      scheduling: { title: "Scheduling", lead: "View your officially programmed teaching schedule." },
      administration: { title: "Administration", lead: "Rooms, timetable, bookings and room-usage insights." },
      statistics: { title: "Statistics", lead: "AI-powered analytics dashboard with key insights." },
      aiReports: { title: "AI Reports", lead: "Conversational AI assistant for platform insights." },
      users: { title: "Users", lead: "Manage platform users and their activity." },
    },
    scheduling: {
      selectPromo: "Select promotion",
      promoPlaceholder: "Choose a promotion…",
      noPromoAssigned: "No promotions assigned to you.",
      timetable: "Official Timetable",
      day: "Day",
      time: "Time",
      module: "Module",
      classroom: "Classroom",
      promotion: "Promotion",
      noSessions: "No official sessions scheduled for this promotion.",
      officialSessionsOnly: "This timetable displays only officially programmed sessions from the university timetable. Additional sessions booked by professors are shown in the Bookings page.",
      today: "Today",
      newBooking: "New booking",
      editBooking: "Edit booking",
      room: "Room",
      roomRequired: "Room is required",
      capacity: "Capacity",
      title: "Title",
      titlePlaceholder: "Booking title",
      titleRequired: "Title is required",
      description: "Description",
      descriptionPlaceholder: "Description (optional)",
      date: "Date",
      startTime: "Start time",
      endTime: "End time",
      conflict: "Conflict detected",
      confirmDelete: "Are you sure you want to delete this booking?",
      subtitle: "View your officially programmed teaching schedule.",
      dayView: "Day view",
      weekView: "Week view",
      weekOf: "Week of",
      bookSlot: "Book this slot",
      createBooking: "Create booking",
      oddWeeks: "Odd weeks",
      evenWeeks: "Even weeks",
    },
    stats: {
      title: "Statistics",
      subtitle: "AI-powered analytics dashboard with key insights",
      totalBookings: "Total Bookings",
      totalHours: "Total Hours",
      avgUtilization: "Avg Utilization",
      activeRooms: "Active Rooms",
      vsPrevPeriod: "vs previous period",
      chartLabel: "Chart",
      timeRange: "Time Range",
      bookingTrends: "Booking Trends",
      selectMetric: "Select Metric",
      metricBookings: "Bookings",
      metricHours: "Hours",
      metricRooms: "Rooms",
      metricProfessors: "Professors",
      chartType: "Chart Type",
      chartTypeLine: "Line",
      chartTypeArea: "Area",
      chartTypeBar: "Bar",
      roomUtilization: "Room Utilization",
      high: "High",
      medium: "Medium",
      low: "Low",
      capacity: "Capacity",
      utilization: "Utilization",
      aiInsights: "AI Insights",
      aiSubtitle: "Automated observations based on current data",
      refreshInsights: "Refresh Insights",
      impactHigh: "High Impact",
      impactMedium: "Medium Impact",
      impactLow: "Low Impact",
      confidence: "Confidence",
      totalRooms: "Total Rooms",
      totalProfessors: "Total Professors",
      avgBookingDuration: "Avg Booking Duration",
      peakUtilization: "Peak Utilization",
      weeklyBookings: "Weekly Bookings",
      cancelRate: "Cancellation Rate",
      summarySection: "Summary",
      kpiSection: "KPIs",
      bookings: "bookings",
      kpi: {
        totalUsers: "Total Users",
        totalProfessors: "Professors",
        totalAdmins: "Administrators",
        totalRooms: "Rooms",
        totalBookings: "Total Bookings",
        totalSessions: "Total Sessions",
        roomUtilization: "Room Utilization",
        avgSessionDuration: "Avg Session Duration",
      },
      charts: {
        userActivity: "User Activity",
        professorActivity: "Professor Activity",
        roomUsage: "Room Usage",
        bookingTrends: "Booking Trends",
        scheduleDensity: "Schedule Density",
        conflictRate: "Conflict Rate",
      },
    },
    aiReports: {
      title: "AI Reports",
      subtitle: "Conversational AI assistant for platform insights",
      welcomeTitle: "New Analysis",
      welcomeMessage: "Hello! I'm your AI assistant. I can help you analyze platform data, generate reports, and provide insights. What would you like to know?",
      newChat: "New Chat",
      newChatWelcome: "Start a new conversation or choose a template below.",
      untitledChat: "Untitled Chat",
      templates: "Templates",
      reportTemplates: "Report Templates",
      history: "History",
      chatHistory: "Chat History",
      messages: "messages",
      aiAssistant: "AI Assistant",
      confidence: "confidence",
      inputPlaceholder: "Ask me anything about the platform…",
      welcomePlaceholder: "Start a conversation or pick a template…",
      voiceInput: "Voice input",
      followUp: "Follow up",
      sources: "Sources",
      inputHint: "Press Enter to send. Use Shift+Enter for a new line.",
      newLine: "New line",
      templateStarted: "Started analysis from template:",
      generatingReport: "Generating report…",
      addFile: "Add CSV File",
      addFileHint: "Upload a CSV file for analysis",
      addFileSuccess: "CSV file uploaded successfully",
      fileTypeError: "Please upload a valid CSV file",
      customAnalysis: "Custom Analysis",
      customAnalysisDesc: "Describe what you'd like me to analyze in your own words.",
      customPlaceholder: "e.g., Compare Lab 1 vs Lab 2 utilization last month…",
      startAnalysis: "Start Analysis",
      confirmDelete: "Are you sure you want to delete this conversation?",
      noHistory: "No chat history yet. Start a new conversation!",
      conversation: "Conversation",
      suggestedPrompts: {
        generateReport: "Generate platform report",
        analyzeProfessors: "Analyze professor activity",
        analyzeRooms: "Analyze classroom usage",
        summarizeActivity: "Summarize recent activity",
        findConflicts: "Identify scheduling conflicts",
        generateRecommendations: "Generate recommendations",
      },
    },
    users: {
      title: "Users",
      lead: "Manage platform users and their activity.",
      searchPlaceholder: "Search users…",
      columns: {
        name: "Name",
        email: "Email",
        role: "Role",
        status: "Status",
        actions: "Actions",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
      actions: {
        delete: "Delete",
        activities: "Activities",
        edit: "Edit",
      },
      deleteConfirm: {
        title: "Delete user",
        message: "Are you sure you want to delete this user? This action cannot be undone.",
        confirm: "Delete",
        cancel: "Cancel",
      },
      activities: {
        title: "User Activity",
        noActivities: "No activity recorded yet.",
        createdSession: "Created additional session",
        bookedRoom: "Booked room",
        recentAction: "Recent action",
        date: "Date",
      },
      edit: {
        title: "Edit User",
        save: "Save",
        cancel: "Cancel",
        name: "Full name",
        email: "Email",
        role: "Role",
      },
    },
    recommendations: {
      title: "AI Recommendations",
      subtitle: "Smart suggestions to help you get started",
      items: {
        findRoom: { title: "Find a room", description: "Search for available classrooms by capacity, equipment, or time slot." },
        bookSession: { title: "Book a session", description: "Schedule an additional teaching session in just a few clicks." },
        checkAvailability: { title: "Check availability", description: "See real-time room availability for any date and time." },
        viewSchedule: { title: "View your schedule", description: "Access your official teaching timetable and upcoming bookings." },
        manageRooms: { title: "Manage rooms", description: "Administer room inventory, equipment, and availability rules." },
        viewAnalytics: { title: "View analytics", description: "Explore usage statistics, booking trends, and AI-powered insights." },
      },
    },
    common: {
      loading: "Loading…",
      error: "Error",
      retry: "Retry",
      close: "Close",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      noData: "No data available",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      copy: "Copy",
      export: "Export",
      refresh: "Refresh",
      language: "Language",
      theme: "Theme",
      lightMode: "Light mode",
      darkMode: "Dark mode",
      english: "English",
      french: "French",
      arabic: "Arabic",
      send: "Send",
    },
  },
  fr: {
    nav: {
      findRoom: "Trouver une salle",
      myBookings: "Mes réservations",
      scheduling: "Planification",
      administration: "Administration",
      statistics: "Statistiques",
      aiReports: "Rapports IA",
      users: "Utilisateurs",
    },
    auth: {
      signIn: "Se connecter",
      signOut: "Se déconnecter",
      email: "Email universitaire",
      password: "Mot de passe",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      signingIn: "Connexion…",
      enterCredentials: "Entrez votre email et votre mot de passe.",
      invalidCredentials: "L'email ou le mot de passe est incorrect.",
      demoData: "Données de démo uniquement. Choisissez un compte pour préremplir le formulaire.",
      chooseAccount: "Choisir un compte",
    },
    user: {
      professor: "Professeur",
      administrator: "Administrateur",
    },
    headers: {
      findRoom: { title: "Trouver une salle", lead: "Décrivez vos besoins ou définissez les filtres vous-même." },
      myBookings: { title: "Mes réservations", lead: "Vos prochaines sessions supplémentaires." },
      scheduling: { title: "Planification", lead: "Consultez votre emploi du temps d'enseignement officiel." },
      administration: { title: "Administration", lead: "Salles, emploi du temps, réservations et analyses d'utilisation." },
      statistics: { title: "Statistiques", lead: "Tableau de bord analytique alimenté par l'IA avec insights clés." },
      aiReports: { title: "Rapports IA", lead: "Assistant IA conversationnel pour les insights de la plateforme." },
      users: { title: "Utilisateurs", lead: "Gérez les utilisateurs de la plateforme et leur activité." },
    },
    scheduling: {
      selectPromo: "Sélectionner une promotion",
      promoPlaceholder: "Choisir une promotion…",
      noPromoAssigned: "Aucune promotion ne vous est assignée.",
      timetable: "Emploi du temps officiel",
      day: "Jour",
      time: "Heure",
      module: "Module",
      classroom: "Salle",
      promotion: "Promotion",
      noSessions: "Aucune session officielle programmée pour cette promotion.",
      officialSessionsOnly: "Cet emploi du temps n'affiche que les sessions officiellement programmées dans l'emploi du temps universitaire. Les sessions supplémentaires réservées par les professeurs sont visibles dans la page Réservations.",
      today: "Aujourd'hui",
      newBooking: "Nouvelle réservation",
      editBooking: "Modifier la réservation",
      room: "Salle",
      roomRequired: "La salle est requise",
      capacity: "Capacité",
      title: "Titre",
      titlePlaceholder: "Titre de la réservation",
      titleRequired: "Le titre est requis",
      description: "Description",
      descriptionPlaceholder: "Description (optionnel)",
      date: "Date",
      startTime: "Heure de début",
      endTime: "Heure de fin",
      conflict: "Conflit détecté",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cette réservation ?",
      subtitle: "Consultez votre emploi du temps d'enseignement officiel.",
      dayView: "Vue jour",
      weekView: "Vue semaine",
      weekOf: "Semaine du",
      bookSlot: "Réserver ce créneau",
      createBooking: "Créer la réservation",
      oddWeeks: "Semaines impaires",
      evenWeeks: "Semaines paires",
    },
    stats: {
      title: "Statistiques",
      subtitle: "Tableau de bord analytique alimenté par l'IA avec insights clés",
      totalBookings: "Total réservations",
      totalHours: "Total heures",
      avgUtilization: "Utilisation moyenne",
      activeRooms: "Salles actives",
      vsPrevPeriod: "vs période précédente",
      chartLabel: "Graphique",
      timeRange: "Période",
      bookingTrends: "Tendances de réservation",
      selectMetric: "Sélectionner la métrique",
      metricBookings: "Réservations",
      metricHours: "Heures",
      metricRooms: "Salles",
      metricProfessors: "Professeurs",
      chartType: "Type de graphique",
      chartTypeLine: "Ligne",
      chartTypeArea: "Zone",
      chartTypeBar: "Barres",
      roomUtilization: "Utilisation des salles",
      high: "Élevé",
      medium: "Moyen",
      low: "Faible",
      capacity: "Capacité",
      utilization: "Utilisation",
      aiInsights: "Insights IA",
      aiSubtitle: "Observations automatisées basées sur les données actuelles",
      refreshInsights: "Actualiser les insights",
      impactHigh: "Impact élevé",
      impactMedium: "Impact moyen",
      impactLow: "Impact faible",
      confidence: "Confiance",
      totalRooms: "Total salles",
      totalProfessors: "Total professeurs",
      avgBookingDuration: "Durée moyenne réservation",
      peakUtilization: "Pic d'utilisation",
      weeklyBookings: "Réservations hebdomadaires",
      cancelRate: "Taux d'annulation",
      summarySection: "Résumé",
      kpiSection: "KPIs",
      bookings: "réservations",
      kpi: {
        totalUsers: "Total utilisateurs",
        totalProfessors: "Professeurs",
        totalAdmins: "Administrateurs",
        totalRooms: "Salles",
        totalBookings: "Total réservations",
        totalSessions: "Total sessions",
        roomUtilization: "Taux d'utilisation des salles",
        avgSessionDuration: "Durée moyenne des sessions",
      },
      charts: {
        userActivity: "Activité utilisateurs",
        professorActivity: "Activité professeurs",
        roomUsage: "Utilisation des salles",
        bookingTrends: "Tendances de réservation",
        scheduleDensity: "Densité de l'emploi du temps",
        conflictRate: "Taux de conflits",
      },
    },
    aiReports: {
      title: "Rapports IA",
      subtitle: "Assistant IA conversationnel pour les insights de la plateforme",
      welcomeTitle: "Nouvelle analyse",
      welcomeMessage: "Bonjour ! Je suis votre assistant IA. Je peux vous aider à analyser les données de la plateforme, générer des rapports et fournir des insights. Que souhaitez-vous savoir ?",
      newChat: "Nouvelle discussion",
      newChatWelcome: "Commencez une nouvelle conversation ou choisissez un modèle ci-dessous.",
      untitledChat: "Discussion sans titre",
      templates: "Modèles",
      reportTemplates: "Modèles de rapports",
      history: "Historique",
      chatHistory: "Historique des discussions",
      messages: "messages",
      aiAssistant: "Assistant IA",
      confidence: "confiance",
      inputPlaceholder: "Posez-moi n'importe quelle question sur la plateforme…",
      welcomePlaceholder: "Démarrez une conversation ou choisissez un modèle…",
      voiceInput: "Saisie vocale",
      followUp: "Suivi",
      sources: "Sources",
      inputHint: "Appuyez sur Entrée pour envoyer. Utilisez Shift+Entrée pour une nouvelle ligne.",
      newLine: "Nouvelle ligne",
      templateStarted: "Analyse démarrée depuis le modèle :",
      generatingReport: "Génération du rapport…",
      addFile: "Ajouter un fichier CSV",
      addFileHint: "Téléverser un fichier CSV pour l'analyse",
      addFileSuccess: "Fichier CSV téléversé avec succès",
      fileTypeError: "Veuillez téléverser un fichier CSV valide",
      customAnalysis: "Analyse personnalisée",
      customAnalysisDesc: "Décrivez ce que vous souhaitez analyser dans vos propres mots.",
      customPlaceholder: "ex: Comparez l'utilisation du Lab 1 vs Lab 2 le mois dernier…",
      startAnalysis: "Lancer l'analyse",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cette conversation ?",
      noHistory: "Aucun historique pour l'instant. Commencez une nouvelle conversation !",
      conversation: "Conversation",
      suggestedPrompts: {
        generateReport: "Générer un rapport de plateforme",
        analyzeProfessors: "Analyser l'activité des professeurs",
        analyzeRooms: "Analyser l'utilisation des salles",
        summarizeActivity: "Résumer l'activité récente",
        findConflicts: "Identifier les conflits d'emploi du temps",
        generateRecommendations: "Générer des recommandations",
      },
    },
    users: {
      title: "Utilisateurs",
      lead: "Gérez les utilisateurs de la plateforme et leur activité.",
      searchPlaceholder: "Rechercher des utilisateurs…",
      columns: {
        name: "Nom",
        email: "Email",
        role: "Rôle",
        status: "Statut",
        actions: "Actions",
      },
      status: {
        active: "Actif",
        inactive: "Inactif",
      },
      actions: {
        delete: "Supprimer",
        activities: "Activités",
        edit: "Modifier",
      },
      deleteConfirm: {
        title: "Supprimer l'utilisateur",
        message: "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
        confirm: "Supprimer",
        cancel: "Annuler",
      },
      activities: {
        title: "Activité de l'utilisateur",
        noActivities: "Aucune activité enregistrée pour le moment.",
        createdSession: "A créé une session supplémentaire",
        bookedRoom: "A réservé une salle",
        recentAction: "Action récente",
        date: "Date",
      },
      edit: {
        title: "Modifier l'utilisateur",
        save: "Enregistrer",
        cancel: "Annuler",
        name: "Nom complet",
        email: "Email",
        role: "Rôle",
      },
    },
    recommendations: {
      title: "Recommandations IA",
      subtitle: "Suggestions intelligentes pour bien démarrer",
      items: {
        findRoom: { title: "Trouver une salle", description: "Recherchez des salles disponibles par capacité, équipement ou créneau horaire." },
        bookSession: { title: "Réserver une session", description: "Planifiez une session d'enseignement supplémentaire en quelques clics." },
        checkAvailability: { title: "Vérifier la disponibilité", description: "Consultez la disponibilité en temps réel des salles pour n'importe quelle date." },
        viewSchedule: { title: "Voir votre emploi du temps", description: "Accédez à votre emploi du temps officiel et vos réservations à venir." },
        manageRooms: { title: "Gérer les salles", description: "Administrez l'inventaire des salles, les équipements et les règles de disponibilité." },
        viewAnalytics: { title: "Voir les analyses", description: "Explorez les statistiques d'utilisation, tendances de réservation et insights IA." },
      },
    },
    common: {
      loading: "Chargement…",
      error: "Erreur",
      retry: "Réessayer",
      close: "Fermer",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      view: "Voir",
      search: "Rechercher",
      filter: "Filtrer",
      clear: "Effacer",
      noData: "Aucune donnée disponible",
      confirm: "Confirmer",
      back: "Retour",
      next: "Suivant",
      previous: "Précédent",
      copy: "Copier",
      export: "Exporter",
      refresh: "Actualiser",
      language: "Langue",
      theme: "Thème",
      lightMode: "Mode clair",
      darkMode: "Mode sombre",
      english: "Anglais",
      french: "Français",
      arabic: "Arabe",
      send: "Envoyer",
    },
  },
  ar: {
    nav: {
      findRoom: "البحث عن قاعة",
      myBookings: "حجوزاتي",
      scheduling: "الجدولة",
      administration: "الإدارة",
      statistics: "الإحصائيات",
      aiReports: "تقارير الذكاء الاصطناعي",
      users: "المستخدمون",
    },
    auth: {
      signIn: "تسجيل الدخول",
      signOut: "تسجيل الخروج",
      email: "البريد الجامعي",
      password: "كلمة المرور",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
      signingIn: "جاري تسجيل الدخول…",
      enterCredentials: "أدخل بريدك الإلكتروني وكلمة المرور.",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      demoData: "بيانات تجريبية فقط. اختر حساباً لملء النموذج.",
      chooseAccount: "اختر حساباً",
    },
    user: {
      professor: "أستاذ",
      administrator: "مدير",
    },
    headers: {
      findRoom: { title: "البحث عن قاعة", lead: "صف ما تحتاجه، أو اضبط المرشحات بنفسك." },
      myBookings: { title: "حجوزاتي", lead: "جلساتك الإضافية القادمة." },
      scheduling: { title: "الجدولة", lead: "عرض جدول التدريس الرسمي المبرمج." },
      administration: { title: "الإدارة", lead: "القاعات، الجدول الزمني، الحجوزات وتحليلات الاستخدام." },
      statistics: { title: "الإحصائيات", lead: "لوحة تحليلات مدعومة بالذكاء الاصطناعي مع رؤى رئيسية." },
      aiReports: { title: "تقارير الذكاء الاصطناعي", lead: "مساعد ذكي تفاعلي لرؤى المنصة." },
      users: { title: "المستخدمون", lead: "إدارة مستخدمي المنصة ونشاطهم." },
    },
    scheduling: {
      selectPromo: "اختر الدفعة",
      promoPlaceholder: "اختر دفعة…",
      noPromoAssigned: "لا توجد دفعات مسندة إليك.",
      timetable: "الجدول الزمني الرسمي",
      day: "اليوم",
      time: "الوقت",
      module: "المادة",
      classroom: "القاعة",
      promotion: "الدفعة",
      noSessions: "لا توجد جلسات رسمية مجدولة لهذه الدفعة.",
      officialSessionsOnly: "يعرض هذا الجدول جلسات مبرمجة رسمياً من جدول الجامعة فقط. الجلسات الإضافية المحجوزة من قبل الأساتذة تظهر في صفحة الحجوزات.",
      today: "اليوم",
      newBooking: "حجز جديد",
      editBooking: "تعديل الحجز",
      room: "القاعة",
      roomRequired: "القاعة مطلوبة",
      capacity: "السعة",
      title: "العنوان",
      titlePlaceholder: "عنوان الحجز",
      titleRequired: "العنوان مطلوب",
      description: "الوصف",
      descriptionPlaceholder: "الوصف (اختياري)",
      date: "التاريخ",
      startTime: "وقت البدء",
      endTime: "وقت الانتهاء",
      conflict: "تعارض مكتشف",
      confirmDelete: "هل أنت متأكد من حذف هذه الحجز؟",
      subtitle: "عرض جدول التدريس الرسمي المبرمج.",
      dayView: "عرض اليوم",
      weekView: "عرض الأسبوع",
      weekOf: "أسبوع",
      bookSlot: "احجز هذا الموعد",
      createBooking: "إنشاء حجز",
      oddWeeks: "الأسابيع الفردية",
      evenWeeks: "الأسابيع الزوجية",
    },
    stats: {
      title: "الإحصائيات",
      subtitle: "لوحة تحليلات مدعومة بالذكاء الاصطناعي مع رؤى رئيسية",
      totalBookings: "إجمالي الحجوزات",
      totalHours: "إجمالي الساعات",
      avgUtilization: "متوسط الاستخدام",
      activeRooms: "قاعات نشطة",
      vsPrevPeriod: "مقابل الفترة السابقة",
      chartLabel: "مخطط",
      timeRange: "النطاق الزمني",
      bookingTrends: "اتجاهات الحجوزات",
      selectMetric: "اختر المقياس",
      metricBookings: "الحجوزات",
      metricHours: "الساعات",
      metricRooms: "القاعات",
      metricProfessors: "الأساتذة",
      chartType: "نوع المخطط",
      chartTypeLine: "خط",
      chartTypeArea: "مساحة",
      chartTypeBar: "أعمدة",
      roomUtilization: "استخدام القاعات",
      high: "عالي",
      medium: "متوسط",
      low: "منخفض",
      capacity: "السعة",
      utilization: "الاستخدام",
      aiInsights: "رؤى الذكاء الاصطناعي",
      aiSubtitle: "ملاحظات آلية بناءً على البيانات الحالية",
      refreshInsights: "تحديث الرؤى",
      impactHigh: "تأثير عالٍ",
      impactMedium: "تأثير متوسط",
      impactLow: "تأثير منخفض",
      confidence: "الثقة",
      totalRooms: "إجمالي القاعات",
      totalProfessors: "إجمالي الأساتذة",
      avgBookingDuration: "متوسط مدة الحجز",
      peakUtilization: "ذروة الاستخدام",
      weeklyBookings: "الحجوزات الأسبوعية",
      cancelRate: "معدل الإلغاء",
      summarySection: "الملخص",
      kpiSection: "مؤشرات الأداء",
      bookings: "الحجوزات",
      kpi: {
        totalUsers: "إجمالي المستخدمين",
        totalProfessors: "الأساتذة",
        totalAdmins: "المدراء",
        totalRooms: "القاعات",
        totalBookings: "إجمالي الحجوزات",
        totalSessions: "إجمالي الجلسات",
        roomUtilization: "معدل استخدام القاعات",
        avgSessionDuration: "متوسط مدة الجلسة",
      },
      charts: {
        userActivity: "نشاط المستخدمين",
        professorActivity: "نشاط الأساتذة",
        roomUsage: "استخدام القاعات",
        bookingTrends: "اتجاهات الحجوزات",
        scheduleDensity: "كثافة الجدول",
        conflictRate: "معدل التعارضات",
      },
    },
    aiReports: {
      title: "تقارير الذكاء الاصطناعي",
      subtitle: "مساعد ذكي تفاعلي لرؤى المنصة",
      welcomeTitle: "تحليل جديد",
      welcomeMessage: "مرحباً! أنا مساعدك الذكي. يمكنني مساعدتك في تحليل بيانات المنصة، إنشاء التقارير، وتقديم الرؤى. ماذا تود أن تعرف؟",
      newChat: "محادثة جديدة",
      newChatWelcome: "ابدأ محادثة جديدة أو اختر نموذجاً من الأسفل.",
      untitledChat: "محادثة بدون عنوان",
      templates: "النماذج",
      reportTemplates: "نماذج التقارير",
      history: "السجل",
      chatHistory: "سجل المحادثات",
      messages: "رسائل",
      aiAssistant: "المساعد الذكي",
      confidence: "الثقة",
      inputPlaceholder: "اسألني أي شيء عن المنصة…",
      welcomePlaceholder: "ابدأ محادثة أو اختر نموذجاً…",
      voiceInput: "إدخال صوتي",
      followUp: "متابعة",
      sources: "المصادر",
      inputHint: "اضغط Enter للإرسال. استخدم Shift+Enter لسطر جديد.",
      newLine: "سطر جديد",
      templateStarted: "بدأ التحليل من النموذج:",
      generatingReport: "جاري إنشاء التقرير…",
      addFile: "إضافة ملف CSV",
      addFileHint: "رفع ملف CSV للتحليل",
      addFileSuccess: "تم رفع ملف CSV بنجاح",
      fileTypeError: "يرجى تحميل ملف CSV صالح",
      customAnalysis: "تحليل مخصص",
      customAnalysisDesc: "صف ما تريد أن أحلله بأسلوبك الخاص.",
      customPlaceholder: "مثال: قارن استخدام المعمل 1 مقابل المعمل 2 الشهر الماضي…",
      startAnalysis: "بدء التحليل",
      confirmDelete: "هل أنت متأكد من حذف هذه المحادثة؟",
      noHistory: "لا يوجد سجل محادثات بعد. ابدأ محادثة جديدة!",
      conversation: "محادثة",
      suggestedPrompts: {
        generateReport: "إنشاء تقرير المنصة",
        analyzeProfessors: "تحليل نشاط الأساتذة",
        analyzeRooms: "تحليل استخدام القاعات",
        summarizeActivity: "ملخص النشاط الأخير",
        findConflicts: "تحديد تعارضات الجدولة",
        generateRecommendations: "إنشاء توصيات",
      },
    },
    users: {
      title: "المستخدمون",
      lead: "إدارة مستخدمي المنصة ونشاطهم.",
      searchPlaceholder: "البحث عن مستخدمين…",
      columns: {
        name: "الاسم",
        email: "البريد الإلكتروني",
        role: "الدور",
        status: "الحالة",
        actions: "الإجراءات",
      },
      status: {
        active: "نشط",
        inactive: "غير نشط",
      },
      actions: {
        delete: "حذف",
        activities: "الأنشطة",
        edit: "تعديل",
      },
      deleteConfirm: {
        title: "حذف المستخدم",
        message: "هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.",
        confirm: "حذف",
        cancel: "إلغاء",
      },
      activities: {
        title: "نشاط المستخدم",
        noActivities: "لا يوجد نشاط مسجل بعد.",
        createdSession: "أنشأ جلسة إضافية",
        bookedRoom: "حجز قاعة",
        recentAction: "إجراء حديث",
        date: "التاريخ",
      },
      edit: {
        title: "تعديل المستخدم",
        save: "حفظ",
        cancel: "إلغاء",
        name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        role: "الدور",
      },
    },
    recommendations: {
      title: "توصيات الذكاء الاصطناعي",
      subtitle: "اقتراحات ذكية لمساعدتك على البدء",
      items: {
        findRoom: { title: "البحث عن قاعة", description: "ابحث عن قاعات متاحة حسب السعة، التجهيزات، أو الموعد." },
        bookSession: { title: "حجز جلسة", description: "جدول جلسة تدريس إضافية ببضع نقرات." },
        checkAvailability: { title: "التحقق من التوفر", description: "اطلع على توفر القاعات في الوقت الفعلي لأي تاريخ ووقت." },
        viewSchedule: { title: "عرض جدولك", description: "الوصول إلى جدول التدريس الرسمي والحجوزات القادمة." },
        manageRooms: { title: "إدارة القاعات", description: "إدارة مخزون القاعات، التجهيزات، وقواعد التوفر." },
        viewAnalytics: { title: "عرض التحليلات", description: "استكشف إحصائيات الاستخدام، اتجاهات الحجوزات، والرؤى المدعومة بالذكاء الاصطناعي." },
      },
    },
    common: {
      loading: "جاري التحميل…",
      error: "خطأ",
      retry: "إعادة المحاولة",
      close: "إغلاق",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      view: "عرض",
      search: "بحث",
      filter: "تصفية",
      clear: "مسح",
      noData: "لا توجد بيانات متاحة",
      confirm: "تأكيد",
      back: "رجوع",
      next: "التالي",
      previous: "السابق",
      copy: "نسخ",
      export: "تصدير",
      refresh: "تحديث",
      language: "اللغة",
      theme: "السمة",
      lightMode: "الوضع الفاتح",
      darkMode: "الوضع الداكن",
      english: "الإنجليزية",
      french: "الفرنسية",
      arabic: "العربية",
      send: "إرسال",
    },
  },
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, initialLocale = "en" }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("smart-room.locale") as Locale | null;
      if (stored && translations[stored]) return stored;
    }
    return initialLocale;
  });

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("smart-room.locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const value = useMemo(() => ({ locale, setLocale, t: translations[locale], dir }), [locale, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}