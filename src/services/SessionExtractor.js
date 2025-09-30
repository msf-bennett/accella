//src/services/SessionExtractor.js
import PlatformUtils from '../utils/PlatformUtils';
import AIService from './AIService';

class SessionExtractor {
  constructor() {
    this.sessionPatterns = {
      // Week patterns
      weekPattern: /^(week\s*\d+|session\s*\d+|day\s*\d+)/i,
      
      // Training day patterns  
      trainingDayPattern: /(sunday|monday|tuesday|wednesday|thursday|friday|saturday).*?(\d+\s*hours?)/i,
      
      // Duration patterns
      durationPattern: /(\d+)\s*(minutes?|hours?|mins?|hrs?)/i,
      
      // Academy/Title patterns
      academyPattern: /^([A-Z][A-Z\s]+ACADEMY|[A-Z][A-Z\s]+CLUB)/i,
      
      // Age group patterns
      agePattern: /(\d+[-–]\d+\s*years?|under\s*\d+|u\d+|\d+\s*years?)/i,
      
      // Sport patterns
      sportPattern: /(soccer|football|basketball|tennis|volleyball|swimming)/i
    };

    // Comprehensive equipment database
this.equipmentDatabase = {
  soccer: {
    balls: ['soccer ball', 'football', 'size 3 ball', 'size 4 ball', 'size 5 ball', 'training ball', 'match ball'],
    training: ['cones', 'markers', 'disc cones', 'flat markers', 'training poles', 'corner flags', 'boundary markers'],
    goals: ['full size goal', 'portable goal', 'pop-up goal', 'mini goal', 'target goal', 'rebound goal'],
    protection: ['shin guards', 'goalkeeper gloves', 'bibs', 'pinnies', 'training vests', 'scrimmage vests'],
    advanced: ['agility ladder', 'speed ladder', 'hurdles', 'mini hurdles', 'slalom poles', 'training dummies', 'rebounders', 'passing arcs']
  },
  basketball: {
    balls: ['basketball', 'size 5 ball', 'size 6 ball', 'size 7 ball', 'training ball', 'weighted ball'],
    training: ['cones', 'markers', 'agility ladder', 'speed ladder', 'resistance bands', 'jump rope'],
    hoops: ['regulation hoop', 'adjustable hoop', 'training hoop', 'mini hoop'],
    advanced: ['shooting machine', 'dribble goggles', 'weighted vest', 'reaction ball', 'blocking pad', 'shooting targets']
  },
  tennis: {
    basic: ['tennis ball', 'racket', 'net', 'court'],
    training: ['cones', 'markers', 'agility ladder', 'ball hopper', 'target zones'],
    advanced: ['ball machine', 'speed radar', 'training targets', 'resistance bands', 'video analysis']
  },
  volleyball: {
    basic: ['volleyball', 'net', 'court markers', 'antenna'],
    training: ['cones', 'volleyball cart', 'ball cart', 'training pads'],
    protection: ['knee pads', 'ankle braces'],
    advanced: ['blocking sled', 'spike trainer', 'jump trainer', 'setting target']
  },
  general: {
    basic: ['cones', 'markers', 'balls', 'mats'],
    strength: ['dumbbells', 'resistance bands', 'medicine ball', 'kettlebells'],
    cardio: ['jump rope', 'agility ladder', 'hurdles'],
    advanced: ['TRX', 'battle ropes', 'plyo boxes', 'resistance parachute']
  }
};

// Comprehensive drill database with detailed metadata
this.drillDatabase = {
  soccer: {
    'dribbling through cones': { 
      type: 'technical', 
      equipment: ['cones', 'soccer ball'], 
      minPlayers: 1, 
      maxPlayers: 20, 
      duration: '10-15 min',
      skillLevel: 'beginner',
      focus: ['ball control', 'close control', 'agility']
    },
    'pass and move': { 
      type: 'technical', 
      equipment: ['soccer ball', 'cones'], 
      minPlayers: 2, 
      maxPlayers: 20, 
      duration: '15-20 min',
      skillLevel: 'beginner',
      focus: ['passing', 'movement', 'communication']
    },
    'rondo': { 
      type: 'tactical', 
      equipment: ['soccer ball', 'cones'], 
      minPlayers: 5, 
      maxPlayers: 12, 
      duration: '15-20 min',
      skillLevel: 'advanced',
      focus: ['possession', 'quick thinking', 'technique under pressure']
    },
    'small sided game': { 
      type: 'tactical', 
      equipment: ['soccer ball', 'goals', 'bibs'], 
      minPlayers: 6, 
      maxPlayers: 12, 
      duration: '20-30 min',
      skillLevel: 'intermediate',
      focus: ['game understanding', 'decision making', 'all skills']
    }
  },
  basketball: {
    'layup lines': { 
      type: 'technical', 
      equipment: ['basketball', 'hoop'], 
      minPlayers: 4, 
      maxPlayers: 20, 
      duration: '10-15 min',
      skillLevel: 'beginner',
      focus: ['finishing', 'footwork', 'coordination']
    },
    'mikan drill': { 
      type: 'technical', 
      equipment: ['basketball', 'hoop'], 
      minPlayers: 1, 
      maxPlayers: 10, 
      duration: '10-15 min',
      skillLevel: 'intermediate',
      focus: ['ambidextrous finishing', 'touch', 'repetition']
    },
    'shell drill': { 
      type: 'tactical', 
      equipment: ['basketball'], 
      minPlayers: 4, 
      maxPlayers: 12, 
      duration: '15-20 min',
      skillLevel: 'intermediate',
      focus: ['defensive positioning', 'rotations', 'communication']
    }
  },
  general: {
    'circuit training': { 
      type: 'conditioning', 
      equipment: ['cones', 'mats', 'various'], 
      minPlayers: 1, 
      maxPlayers: 30, 
      duration: '20-30 min',
      skillLevel: 'all levels',
      focus: ['fitness', 'strength', 'endurance']
    },
    'agility ladder': { 
      type: 'technical', 
      equipment: ['agility ladder'], 
      minPlayers: 1, 
      maxPlayers: 20, 
      duration: '10-15 min',
      skillLevel: 'all levels',
      focus: ['footwork', 'coordination', 'speed']
    }
  }
};

  //Create a comprehensive activity taxonomy
    this.activityTaxonomy = {
      warmUp: {
        keywords: ['warm', 'warmup', 'warm-up', 'activation', 'dynamic stretch', 'mobility', 'jog', 'jogging'],
        synonyms: ['preparación', 'échauffement', 'aufwärmen', 'riscaldamento'],
        activities: ['light jogging', 'dynamic stretching', 'movement prep', 'joint mobility']
      },
      technical: {
        keywords: ['drill', 'practice', 'technique', 'skill', 'training', 'exercise', 'work'],
        synonyms: ['técnica', 'technique', 'technik', 'tecnica'],
        activities: ['ball control', 'passing drill', 'shooting practice', 'dribbling']
      },
      tactical: {
        keywords: ['tactical', 'strategy', 'positioning', 'formation', 'game', 'match', 'scrimmage'],
        synonyms: ['táctica', 'tactique', 'taktik', 'tattica'],
        activities: ['small-sided game', 'positional play', 'team tactics', 'set pieces']
      },
      conditioning: {
        keywords: ['conditioning', 'fitness', 'cardio', 'endurance', 'stamina', 'running', 'sprint'],
        synonyms: ['acondicionamiento', 'conditionnement', 'kondition', 'condizionamento'],
        activities: ['interval running', 'shuttle runs', 'fitness circuit', 'stamina work']
      },
      coolDown: {
        keywords: ['cool', 'cooldown', 'cool-down', 'recovery', 'static stretch', 'flexibility'],
        synonyms: ['enfriamiento', 'retour au calme', 'abkühlen', 'defaticamento'],
        activities: ['static stretching', 'light walking', 'breathing exercises', 'foam rolling']
      }
    };

    //Add Multi-Language Patterns
    this.multiLangPatterns = {
      week: {
        english: ['week', 'wk', 'w'],
        spanish: ['semana', 'sem'],
        french: ['semaine', 'sem'],
        german: ['woche', 'wo'],
        portuguese: ['semana', 'sem'],
        italian: ['settimana', 'sett']
      },
      day: {
        english: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        spanish: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
        french: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        german: ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'],
        portuguese: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
        italian: ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']
      },
      duration: {
        minutes: ['minutes', 'mins', 'min', 'minutos', 'minuti'],
        hours: ['hours', 'hrs', 'hour', 'horas', 'ore', 'heures', 'stunden']
      }
    };

    this.languageDetectionCache = new Map();
      //mulitlanguage end

  }
  

  //Add a fuzzy matching helper method
fuzzyMatchWeek(text) {
  // First try multi-lingual detection
  const multiLangMatches = this.multiLingualWeekDetection(text);
  if (multiLangMatches.length > 0) {
    return {
      matched: true,
      weekNumber: multiLangMatches[0].weekNumber,
      originalText: text,
      language: multiLangMatches[0].language,
      pattern: 'multi_lingual'
    };
  }
  
  // Fallback to original English-only patterns
  const normalized = text.toLowerCase().trim();
  const weekVariations = [
    /w(?:ee)?k\s*(\d+)/i,
    /semana\s*(\d+)/i,
    /woche\s*(\d+)/i,
    /training\s*week\s*(\d+)/i,
    /phase\s*(\d+)/i,
    /cycle\s*(\d+)/i,
    /block\s*(\d+)/i
  ];
  
  for (const pattern of weekVariations) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const weekNum = parseInt(match[1]);
      if (weekNum > 0 && weekNum <= 52) {
        return {
          matched: true,
          weekNumber: weekNum,
          originalText: text,
          pattern: pattern.toString()
        };
      }
    }
  }
  
  return { matched: false, weekNumber: null, originalText: text };
}

//Add Language Detection Method
// Add after fuzzyMatchWeek method
detectDocumentLanguage(text) {
  // Check cache first
  const cacheKey = text.substring(0, 500);
  if (this.languageDetectionCache.has(cacheKey)) {
    return this.languageDetectionCache.get(cacheKey);
  }
  
  const sampleText = text.substring(0, 2000).toLowerCase();
  const languageScores = {};
  
  // Score each language based on keyword frequency
  for (const [lang, keywords] of Object.entries(this.multiLangPatterns.week)) {
    languageScores[lang] = 0;
    keywords.forEach(keyword => {
      const matches = (sampleText.match(new RegExp(keyword, 'gi')) || []).length;
      languageScores[lang] += matches;
    });
  }
  
  // Add day pattern scoring
  for (const [lang, days] of Object.entries(this.multiLangPatterns.day)) {
    days.forEach(day => {
      const matches = (sampleText.match(new RegExp(day, 'gi')) || []).length;
      languageScores[lang] = (languageScores[lang] || 0) + matches;
    });
  }
  
  // Find language with highest score
  const detectedLang = Object.keys(languageScores).reduce((a, b) => 
    languageScores[a] > languageScores[b] ? a : b
  );
  
  const confidence = languageScores[detectedLang] > 3 ? 'high' : 'medium';
  
  const result = {
    language: detectedLang,
    confidence: confidence,
    score: languageScores[detectedLang]
  };
  
  this.languageDetectionCache.set(cacheKey, result);
  
  console.log('SessionExtractor: Detected language:', result);
  return result;
}

multiLingualWeekDetection(text) {
  const detectedLang = this.detectDocumentLanguage(text);
  const weekKeywords = this.multiLangPatterns.week[detectedLang.language] || this.multiLangPatterns.week.english;
  
  const patterns = weekKeywords.map(keyword => 
    new RegExp(`${keyword}\\s*(\\d+)`, 'gi')
  );
  
  const matches = [];
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const weekNum = parseInt(match[1]);
      if (weekNum > 0 && weekNum <= 52) {
        matches.push({
          weekNumber: weekNum,
          position: match.index,
          text: match[0],
          language: detectedLang.language
        });
      }
    }
  });
  
  return matches;
}

// Main extraction method
async extractSessionsFromDocument(document, trainingPlan) {
  try {
    console.log('Starting intelligent session extraction');
    
    const DocumentProcessor = (await import('./DocumentProcessor')).default;
    const extractionResult = await DocumentProcessor.extractDocumentText(document);
    const text = extractionResult.text;
    
    // Use intelligent structure analysis
    const structureAnalysis = await DocumentProcessor.analyzeDocumentStructureIntelligently(text, document);
    
    console.log('Structure pattern detected:', structureAnalysis.organizationPattern);
    
    const academyInfo = this.extractAcademyInfo(text, trainingPlan, structureAnalysis);
    
    // Route to appropriate extraction method based on detected structure
    let sessions;
    switch (structureAnalysis.organizationPattern) {
      case 'weekly_with_days':
        sessions = await this.extractWeeklyWithDaysStructure(text, structureAnalysis, academyInfo);
        break;
      case 'weekly_only':
        sessions = await this.extractWeeklyOnlyStructure(text, structureAnalysis, academyInfo);
        break;
      case 'daily_only':
        sessions = await this.extractDailyOnlyStructure(text, structureAnalysis, academyInfo);
        break;
      case 'session_based':
        sessions = await this.extractSessionBasedStructure(text, structureAnalysis, academyInfo);
        break;
      default:
        sessions = await this.extractUnstructuredContent(text, structureAnalysis, academyInfo);
    }
    
    return {
      academyInfo,
      sessions,
      structureAnalysis,
      totalWeeks: sessions.length,
      totalSessions: sessions.reduce((sum, week) => sum + week.dailySessions.length, 0),
      organizationPattern: structureAnalysis.organizationPattern,
      extractedAt: new Date().toISOString(),
      sourceDocument: document.id,
      sourcePlan: trainingPlan.id
    };
    
  } catch (error) {
    console.error('Intelligent session extraction failed:', error);
    throw error;
  }
}

async extractWeeklyWithDaysStructure(text, structureAnalysis, academyInfo) {
  const sessions = [];
  const { weekStructure, dayStructure } = structureAnalysis;
  
  weekStructure.detectedWeeks.forEach(weekNum => {
    const weekContent = this.extractWeekContent(text, weekNum, weekStructure.weekMarkers);
    
    const weekSession = {
      id: `week_${weekNum}_${Date.now()}`,
      weekNumber: weekNum,
      title: this.extractWeekTitle(weekContent, weekNum),
      description: this.extractWeekDescription(weekContent),
      
      // CRITICAL: Store complete week raw content
      rawContent: weekContent,
      documentContent: weekContent,
      
      dailySessions: [],
      totalDuration: 0,
      focus: this.extractWeekFocus(weekContent),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };
    
    // Extract ACTUAL days within this specific week content
    const daysInWeek = this.extractDaysFromWeekContent(weekContent);
    
    // Group sessions by day
    const sessionsByDay = this.groupSessionsByDay(weekContent, daysInWeek);
    
   // Create daily sessions with proper session grouping
    Object.entries(sessionsByDay).forEach(([day, daySessions], dayIndex) => {
      // CRITICAL FIX: Extract the FULL day section from the original week content
      const dayStartPattern = new RegExp(`(${day}|day.*${day}).*`, 'gi');
      const dayMatch = weekContent.match(dayStartPattern);
      const dayStartIndex = dayMatch ? weekContent.indexOf(dayMatch[0]) : 0;
      
      // Find where this day's content ends (next day or end of week)
      const allDaysInWeek = Object.keys(sessionsByDay);
      const currentDayIndex = allDaysInWeek.indexOf(day);
      const nextDay = currentDayIndex < allDaysInWeek.length - 1 ? allDaysInWeek[currentDayIndex + 1] : null;
      
      let dayEndIndex = weekContent.length;
      if (nextDay) {
        const nextDayPattern = new RegExp(`(${nextDay}|day.*${nextDay}).*`, 'gi');
        const nextDayMatch = weekContent.match(nextDayPattern);
        if (nextDayMatch) {
          const nextDayStart = weekContent.indexOf(nextDayMatch[0]);
          if (nextDayStart > dayStartIndex) {
            dayEndIndex = nextDayStart;
          }
        }
      }
      
      // Extract the COMPLETE day content
      const completeDayContent = weekContent.substring(dayStartIndex, dayEndIndex).trim();
      
      const dailySessionEntry = {
        id: `day_${weekNum}_${dayIndex}_${Date.now()}`,
        weekNumber: weekNum,
        dayNumber: dayIndex + 1,
        day: day,
        date: this.calculateSessionDate(weekNum, day),
        
        // CRITICAL: Store COMPLETE day content
        rawContent: completeDayContent,
        documentContent: completeDayContent,
        
        sessionsForDay: daySessions.map((sessionContent, sessionIdx) => 
          this.createSessionFromContent(sessionContent, weekNum, dayIndex + 1, sessionIdx + 1, day, academyInfo, completeDayContent)
        )
      };
      
      weekSession.dailySessions.push(dailySessionEntry);
      weekSession.totalDuration += dailySessionEntry.sessionsForDay.reduce(
        (sum, s) => sum + (s.duration || 0), 0
      );
    });
    
    sessions.push(weekSession);
  });
  
  return sessions;
}

async extractWeeklyOnlyStructure(text, structureAnalysis, academyInfo) {
  const sessions = [];
  const { weekStructure } = structureAnalysis;
  
  weekStructure.detectedWeeks.forEach(weekNum => {
    const weekContent = this.extractWeekContent(text, weekNum, weekStructure.weekMarkers);
    
    const weekSession = {
      id: `week_${weekNum}_${Date.now()}`,
      weekNumber: weekNum,
      title: this.extractWeekTitle(weekContent, weekNum),
      description: this.extractWeekDescription(weekContent),
      
      rawContent: weekContent,
      documentContent: weekContent,
      
      dailySessions: [],
      totalDuration: 0,
      focus: this.extractWeekFocus(weekContent),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };
    
    // Create a general week overview session
    const overviewSession = {
      id: `session_${weekNum}_overview_${Date.now()}`,
      weekNumber: weekNum,
      dayNumber: 1,
      day: 'week_overview',
      title: `Week ${weekNum} Training Overview`,
      date: this.calculateSessionDate(weekNum, 'monday'),
      time: '08:00',
      duration: this.extractDurationFromContext(weekContent) || 120,
      location: academyInfo.location || 'Training Field',
      type: 'Weekly Overview',
      participants: this.estimateParticipants(academyInfo.ageGroup),
      status: 'scheduled',
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      ageGroup: academyInfo.ageGroup,
      
      rawContent: weekContent,
      documentContent: weekContent,
      
      activities: this.extractActivitiesFromContext(weekContent),
      focus: this.extractWeekFocus(weekContent)
    };
    
    weekSession.dailySessions.push(overviewSession);
    weekSession.totalDuration = overviewSession.duration;
    
    sessions.push(weekSession);
  });
  
  return sessions;
}

async extractDailyOnlyStructure(text, structureAnalysis, academyInfo) {
  const sessions = [];
  const { dayStructure } = structureAnalysis;
  
  // Group days into logical weeks (assume 1 week per unique set of days)
  const daysPerWeek = dayStructure.detectedDays.length;
  const weekCount = Math.ceil(daysPerWeek / 5); // Assume max 5 training days per week
  
  for (let weekNum = 1; weekNum <= weekCount; weekNum++) {
    const weekSession = {
      id: `week_${weekNum}_${Date.now()}`,
      weekNumber: weekNum,
      title: `Week ${weekNum} Training`,
      description: `Daily training sessions for week ${weekNum}`,
      dailySessions: [],
      totalDuration: 0,
      focus: ['daily training'],
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };
    
    // Extract days for this week
    const startIdx = (weekNum - 1) * 5;
    const endIdx = Math.min(startIdx + 5, dayStructure.detectedDays.length);
    const weekDays = dayStructure.detectedDays.slice(startIdx, endIdx);
    
    weekDays.forEach((day, dayIndex) => {
      const dayContent = this.extractDayContentFromText(text, day);
      
      const dailySession = {
        id: `session_${weekNum}_${dayIndex}_${Date.now()}`,
        weekNumber: weekNum,
        dayNumber: dayIndex + 1,
        day: day,
        title: `${this.capitalizeFirst(day)} Training`,
        date: this.calculateSessionDate(weekNum, day),
        time: '08:00',
        duration: 90,
        location: academyInfo.location || 'Training Field',
        type: 'Daily Training',
        participants: this.estimateParticipants(academyInfo.ageGroup),
        status: 'scheduled',
        academyName: academyInfo.academyName,
        sport: academyInfo.sport,
        ageGroup: academyInfo.ageGroup,
        
        rawContent: dayContent,
        documentContent: dayContent,
        
        activities: this.extractActivitiesFromContext(dayContent),
        focus: [day + ' focus']
      };
      
      weekSession.dailySessions.push(dailySession);
      weekSession.totalDuration += dailySession.duration;
    });
    
    sessions.push(weekSession);
  }
  
  return sessions;
}

async extractSessionBasedStructure(text, structureAnalysis, academyInfo) {
  const sessions = [];
  const { sessionStructure } = structureAnalysis;
  
  // Group sessions into weeks (3 sessions per week)
  const sessionsPerWeek = 3;
  const weekCount = Math.ceil(sessionStructure.sessionMarkers.length / sessionsPerWeek);
  
  for (let weekNum = 1; weekNum <= weekCount; weekNum++) {
    const weekSession = {
      id: `week_${weekNum}_${Date.now()}`,
      weekNumber: weekNum,
      title: `Week ${weekNum} Sessions`,
      description: `Training sessions for week ${weekNum}`,
      dailySessions: [],
      totalDuration: 0,
      focus: ['session training'],
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };
    
    const startIdx = (weekNum - 1) * sessionsPerWeek;
    const endIdx = Math.min(startIdx + sessionsPerWeek, sessionStructure.sessionMarkers.length);
    const weekSessions = sessionStructure.sessionMarkers.slice(startIdx, endIdx);
    
    weekSessions.forEach((sessionMarker, idx) => {
      const sessionContent = this.extractContentAroundMarker(text, sessionMarker);
      
      const dailySession = {
        id: `session_${weekNum}_${idx}_${Date.now()}`,
        weekNumber: weekNum,
        dayNumber: idx + 1,
        day: this.mapSessionToDay(idx + 1),
        title: sessionMarker.text,
        date: this.calculateSessionDate(weekNum, this.mapSessionToDay(idx + 1)),
        time: '08:00',
        duration: 90,
        location: academyInfo.location || 'Training Field',
        type: sessionMarker.type,
        participants: this.estimateParticipants(academyInfo.ageGroup),
        status: 'scheduled',
        academyName: academyInfo.academyName,
        sport: academyInfo.sport,
        ageGroup: academyInfo.ageGroup,
        
        rawContent: sessionContent,
        documentContent: sessionContent,
        
        activities: this.extractActivitiesFromContext(sessionContent),
        focus: [sessionMarker.type]
      };
      
      weekSession.dailySessions.push(dailySession);
      weekSession.totalDuration += dailySession.duration;
    });
    
    sessions.push(weekSession);
  }
  
  return sessions;
}

async extractUnstructuredContent(text, structureAnalysis, academyInfo) {
  // For completely unstructured documents, create a basic 4-week structure
  const sessions = [];
  
  for (let weekNum = 1; weekNum <= 4; weekNum++) {
    const weekSession = {
      id: `week_${weekNum}_${Date.now()}`,
      weekNumber: weekNum,
      title: `Week ${weekNum} Training`,
      description: `Training content for week ${weekNum}`,
      dailySessions: [],
      totalDuration: 270,
      focus: ['general training'],
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };
    
    // Create 3 sessions per week
    ['monday', 'wednesday', 'friday'].forEach((day, idx) => {
      const dailySession = {
        id: `session_${weekNum}_${idx}_${Date.now()}`,
        weekNumber: weekNum,
        dayNumber: idx + 1,
        day: day,
        title: `${this.capitalizeFirst(day)} Training`,
        date: this.calculateSessionDate(weekNum, day),
        time: '08:00',
        duration: 90,
        location: academyInfo.location || 'Training Field',
        type: 'General Training',
        participants: this.estimateParticipants(academyInfo.ageGroup),
        status: 'scheduled',
        academyName: academyInfo.academyName,
        sport: academyInfo.sport,
        ageGroup: academyInfo.ageGroup,
        
        rawContent: text.substring(0, 1000),
        documentContent: text.substring(0, 1000),
        
        activities: ['Training activities'],
        focus: ['general fitness']
      };
      
      weekSession.dailySessions.push(dailySession);
    });
    
    sessions.push(weekSession);
  }
  
  return sessions;
}

extractDayContentFromText(text, day) {
  const dayPattern = new RegExp(`${day}.*?(?=(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week\\s*\\d+|$))`, 'gis');
  const match = text.match(dayPattern);
  return match ? match[0] : `Training content for ${day}`;
}

extractContentAroundMarker(text, marker) {
  const start = Math.max(0, marker.position - 200);
  const end = Math.min(text.length, marker.position + 800);
  return text.substring(start, end);
}

extractDaysFromWeekContent(weekContent) {
  const daysFound = new Map();
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const lines = weekContent.split('\n');
  
  lines.forEach((line, lineIndex) => {
    const lineLower = line.toLowerCase();
    
    // Pattern 1: "Day 1 (Monday) & Day 3 (Friday)" format
    const dayNumberPattern = /day\s*\d+\s*\(([a-z]+)\)/gi;
    let dayMatch;
    while ((dayMatch = dayNumberPattern.exec(lineLower)) !== null) {
      const day = dayMatch[1];
      if (allDays.includes(day) && !daysFound.has(day)) {
        daysFound.set(day, {
          day: day,
          lineIndex: lineIndex,
          content: line,
          isShared: line.includes('&') || line.includes('/')
        });
      }
    }
    
    // Pattern 2: "Monday/Friday" or "Wednesday/Saturday/Sunday" format
    const slashPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*\/\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
    if (slashPattern.test(lineLower)) {
      const foundDaysInLine = allDays.filter(day => lineLower.includes(day));
      foundDaysInLine.forEach(day => {
        if (!daysFound.has(day)) {
          daysFound.set(day, {
            day: day,
            lineIndex: lineIndex,
            content: line,
            isShared: true,
            sharedWith: foundDaysInLine.filter(d => d !== day)
          });
        }
      });
    }
    
    // Pattern 3: Simple day headers "## Day 2 (Wednesday) & Day 4 (Saturday)"
    allDays.forEach(day => {
      const simplePattern = new RegExp(`##\\s*day\\s*\\d+\\s*\\(${day}\\)`, 'i');
      if (simplePattern.test(lineLower) && !daysFound.has(day)) {
        daysFound.set(day, {
          day: day,
          lineIndex: lineIndex,
          content: line,
          isShared: line.includes('&') || line.includes('/')
        });
      }
    });
    
    // Pattern 4: Standalone day names as headers
    allDays.forEach(day => {
      if (lineLower.trim() === day || lineLower.startsWith(day + ' ')) {
        if (!daysFound.has(day)) {
          daysFound.set(day, {
            day: day,
            lineIndex: lineIndex,
            content: line,
            isShared: false
          });
        }
      }
    });
  });
  
  // Sort by appearance order
  return Array.from(daysFound.values()).sort((a, b) => a.lineIndex - b.lineIndex);
}

groupSessionsByDay(weekContent, daysInWeek) {
  const sessionsByDay = {};
  
  if (daysInWeek.length === 0) {
    sessionsByDay['week_overview'] = [weekContent];
    return sessionsByDay;
  }
  
  const lines = weekContent.split('\n');
  
  daysInWeek.forEach((dayInfo, index) => {
    const day = dayInfo.day;
    const dayLineIndex = dayInfo.lineIndex;
    
    // Find the next day boundary OR next major section
    let nextBoundaryIndex = lines.length;
    
    // Check for next day
    if (index + 1 < daysInWeek.length) {
      nextBoundaryIndex = daysInWeek[index + 1].lineIndex;
    } else {
      // Look for major section markers if this is the last day
      const majorSectionPatterns = [
        /^(Week \d+|Alternative|Specific Drills)/i,
        /^={3,}/,  // Line of equals signs
        /^-{3,}/   // Line of dashes
      ];
      
      for (let i = dayLineIndex + 1; i < lines.length; i++) {
        if (majorSectionPatterns.some(pattern => pattern.test(lines[i].trim()))) {
          nextBoundaryIndex = i;
          break;
        }
      }
    }
    
    // Extract ALL content between this day and next boundary
    const dayLines = lines.slice(dayLineIndex, nextBoundaryIndex);
    
    // Clean up the content - remove the day header line itself from content
    const contentLines = dayLines.slice(1); // Skip the header line
    const completeDayContent = contentLines
      .filter(line => line.trim().length > 0) // Remove empty lines
      .join('\n')
      .trim();
    
    // Only store if we have substantial content (more than just the header)
    if (completeDayContent.length > 20) {
      sessionsByDay[day] = [completeDayContent];
      
      console.log(`SessionExtractor: Captured ${day} content:`, {
        startLine: dayLineIndex,
        endLine: nextBoundaryIndex,
        contentLength: completeDayContent.length,
        firstChars: completeDayContent.substring(0, 100)
      });
    } else {
      // Fallback with diagnostic
      console.warn(`SessionExtractor: ${day} has minimal content, using fallback`);
      sessionsByDay[day] = [`Training session for ${day}\n\nContent not found in expected location.`];
    }
  });
  
  return sessionsByDay;
}


extractAllDaysFromSharedPattern(sharedText) {
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const foundDays = [];
  
  allDays.forEach(day => {
    if (new RegExp(`\\b${day}\\b`, 'i').test(sharedText)) {
      foundDays.push(day);
    }
  });
  
  return foundDays;
}

extractSharedSessionContent(lines, startLineIndex) {
  // Extract content from the shared session header until the next day/section marker
  const contentLines = [];
  let currentIndex = startLineIndex + 1;
  
  const stopPatterns = [
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(?:\(|:|-)/i,
    /^week\s*\d+/i,
    /^day\s*\d+/i
  ];
  
  while (currentIndex < lines.length) {
    const line = lines[currentIndex].trim();
    
    // Stop if we hit another day/section marker
    if (stopPatterns.some(pattern => pattern.test(line))) {
      break;
    }
    
    contentLines.push(lines[currentIndex]);
    currentIndex++;
    
    // Safety limit
    if (contentLines.length > 100) break;
  }
  
  return contentLines.join('\n');
}

extractMultipleSessionsFromDayContent(dayContent) {
  const sessions = [];
  const sessionMarkers = [
    /session\s*\d+/gi,
    /\d{1,2}:\d{2}/g, // Time markers
    /warm[\s-]?up|technical|tactical|conditioning|cool[\s-]?down/gi
  ];
  
  const lines = dayContent.split('\n');
  let currentSession = [];
  
  lines.forEach(line => {
    const hasMarker = sessionMarkers.some(pattern => pattern.test(line));
    
    if (hasMarker && currentSession.length > 0) {
      sessions.push(currentSession.join('\n'));
      currentSession = [line];
    } else {
      currentSession.push(line);
    }
  });
  
  if (currentSession.length > 0) {
    sessions.push(currentSession.join('\n'));
  }
  
  return sessions.length > 1 ? sessions : [dayContent];
}

createSessionFromContent(sessionContent, weekNum, dayNum, sessionNum, day, academyInfo, completeDayContext = null) {
  // Use the complete day context if available, otherwise fall back to session content
  const contentToStore = completeDayContext || sessionContent;
  
  return {
    id: `session_${weekNum}_${dayNum}_${sessionNum}_${Date.now()}`,
    weekNumber: weekNum,
    dayNumber: dayNum,
    sessionNumber: sessionNum,
    title: `Session ${sessionNum} - ${this.capitalizeFirst(day)}`,
    day: day,
    date: this.calculateSessionDate(weekNum, day),
    time: this.extractTimeFromContext(sessionContent) || '08:00',
    duration: this.extractDurationFromContext(sessionContent) || 90,
    location: academyInfo.location || 'Training Field',
    type: this.identifySessionType(sessionContent),
    participants: this.estimateParticipants(academyInfo.ageGroup),
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    activities: this.extractActivitiesFromContext(sessionContent),
    
    // CRITICAL: Store the COMPLETE day context
    rawContent: contentToStore,
    documentContent: contentToStore,
    
    // Also store the specific session portion
    sessionSpecificContent: sessionContent,
    
    focus: this.extractSessionFocus([sessionContent])
  };
}

detectIfSharedSession(content) {
  const sharedPatterns = [
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*\/\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*,\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+and\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  ];
  
  return sharedPatterns.some(pattern => pattern.test(content));
}

extractSharedDays(content) {
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const foundDays = [];
  
  // Look in the first 5 lines for day mentions
  const firstLines = content.split('\n').slice(0, 5).join(' ');
  
  allDays.forEach(day => {
    if (new RegExp(`\\b${day}\\b`, 'i').test(firstLines)) {
      foundDays.push(day);
    }
  });
  
  return foundDays;
}

extractWeekContent(text, weekNumber, weekMarkers) {
  const weekMarker = weekMarkers.find(m => m.weekNumber === weekNumber);
  if (!weekMarker) return '';
  
  const nextWeekMarker = weekMarkers.find(m => m.weekNumber === weekNumber + 1);
  const endPos = nextWeekMarker ? nextWeekMarker.position : text.length;
  
  return text.substring(weekMarker.position, endPos);
}

findDaysInWeekContent(weekContent, dayStructure) {
  const daysFound = [];
  
  dayStructure.dayMarkers.forEach(marker => {
    if (weekContent.includes(marker.context.substring(0, 50))) {
      daysFound.push(marker);
    }
  });
  
  return daysFound;
}

createDailySessionFromDetection(dayMarker, weekNum, dayIndex, academyInfo, content) {
  return {
    id: `session_${weekNum}_${dayIndex}_${Date.now()}`,
    weekNumber: weekNum,
    dayNumber: dayIndex,
    title: `${academyInfo.academyName} - Week ${weekNum}, ${this.capitalizeFirst(dayMarker.day)} Training`,
    day: dayMarker.day,
    date: this.calculateSessionDate(weekNum, dayMarker.day),
    time: this.extractTimeFromContext(dayMarker.context) || '08:00',
    duration: this.extractDurationFromContext(dayMarker.context) || 90,
    location: academyInfo.location || 'Training Field',
    type: 'Team Training',
    participants: 15,
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    activities: this.extractActivitiesFromContext(dayMarker.context),
    rawContent: dayMarker.context,
    focus: this.extractSessionFocus([dayMarker.context])
  };
  // In createDailySessionFromDetection or similar methods, add:
const dailySessionEntry = {
  id: `day_${weekNum}_${dayIndex}_${Date.now()}`,
  weekNumber: weekNum,
  dayNumber: dayIndex + 1,
  day: day,
  date: this.calculateSessionDate(weekNum, day),
  
  // ADD: Complete week context
  parentWeekSession: weekSession.id,
  weekTitle: weekSession.title,
  weekDescription: weekSession.description,
  weekFocus: weekSession.focus,
  
  // Grouped sessions for this day
  sessionsForDay: daySessions.map((sessionContent, sessionIdx) => ({
    ...this.createSessionFromContent(sessionContent, weekNum, dayIndex + 1, sessionIdx + 1, day, academyInfo),
    // ADD: Link back to day
    parentDaySession: `day_${weekNum}_${dayIndex}_${Date.now()}`
  }))
};
}

extractTimeFromContext(context) {
  const timeMatch = context.match(/(\d{1,2}):(\d{2})/);
  return timeMatch ? timeMatch[0] : null;
}

extractDurationFromContext(context) {
  const durationMatch = context.match(/(\d+)\s*(min|hour)/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    return durationMatch[2].toLowerCase().includes('hour') ? value * 60 : value;
  }
  return null;
}

extractActivitiesFromContext(context) {
  const lines = context.split('\n').filter(line => this.isActivity(line.trim()));
  return lines.length > 0 ? lines : ['Training activities'];
}

// NEW: Structure-aware session extraction
async extractSessionsWithStructureAwareness(text, structureAnalysis, academyInfo) {
  console.log('Starting structure-aware session extraction');
  
  const { organizationLevel, weekStructure, dayStructure, sessionStructure } = structureAnalysis;
  
  // Choose extraction strategy based on structure level
  switch (organizationLevel.level) {
    case 'highly_structured':
      return this.extractFromHighlyStructuredDocument(text, structureAnalysis, academyInfo);
    
    case 'moderately_structured':
      return this.extractFromModeratelyStructuredDocument(text, structureAnalysis, academyInfo);
    
    case 'basic_structure':
      return this.extractFromBasicStructuredDocument(text, structureAnalysis, academyInfo);
    
    default:
      return this.extractFromUnstructuredDocument(text, structureAnalysis, academyInfo);
  }
}

//Validation & Confidence Scoring
validateAndScoreExtraction(extractedSessions, document, structureAnalysis) {
  const validation = {
    overallConfidence: 0,
    warnings: [],
    errors: [],
    scores: {
      structureScore: 0,
      contentScore: 0,
      consistencyScore: 0,
      completenessScore: 0
    },
    sessionValidation: []
  };
  
  // 1. Structure Score (0-25 points)
  if (structureAnalysis.organizationLevel.level === 'highly_structured') {
    validation.scores.structureScore = 25;
  } else if (structureAnalysis.organizationLevel.level === 'moderately_structured') {
    validation.scores.structureScore = 18;
  } else if (structureAnalysis.organizationLevel.level === 'basic_structure') {
    validation.scores.structureScore = 10;
  } else {
    validation.scores.structureScore = 5;
    validation.warnings.push('Document has minimal structure - extraction may be incomplete');
  }
  
  // 2. Content Score (0-25 points)
  const avgContentLength = extractedSessions.reduce((sum, week) => {
    const weekContent = week.dailySessions.reduce((wSum, session) => 
      wSum + (session.rawContent?.length || 0), 0);
    return sum + weekContent;
  }, 0) / Math.max(extractedSessions.length, 1);
  
  if (avgContentLength > 500) {
    validation.scores.contentScore = 25;
  } else if (avgContentLength > 200) {
    validation.scores.contentScore = 18;
  } else if (avgContentLength > 100) {
    validation.scores.contentScore = 10;
    validation.warnings.push('Limited content per session - sessions may need manual review');
  } else {
    validation.scores.contentScore = 5;
    validation.errors.push('Very limited content extracted - sessions may be incomplete');
  }
  
  // 3. Consistency Score (0-25 points)
  const consistencyChecks = this.checkExtractionConsistency(extractedSessions);
  validation.scores.consistencyScore = consistencyChecks.score;
  validation.warnings.push(...consistencyChecks.warnings);
  
  // 4. Completeness Score (0-25 points)
  const completenessChecks = this.checkExtractionCompleteness(extractedSessions, structureAnalysis);
  validation.scores.completenessScore = completenessChecks.score;
  validation.warnings.push(...completenessChecks.warnings);
  
  // Calculate overall confidence
  validation.overallConfidence = Object.values(validation.scores).reduce((sum, score) => sum + score, 0) / 100;
  
  // Validate individual sessions
  extractedSessions.forEach(week => {
    week.dailySessions.forEach(session => {
      const sessionValidation = this.validateSession(session);
      validation.sessionValidation.push({
        sessionId: session.id,
        ...sessionValidation
      });
      
      // Add session confidence
      session.extractionConfidence = sessionValidation.confidence;
      session.extractionWarnings = sessionValidation.warnings;
    });
  });
  
  return validation;
}

checkExtractionConsistency(sessions) {
  const warnings = [];
  let score = 25;
  
  // Check week numbering consistency
  const weekNumbers = sessions.map(s => s.weekNumber).sort((a, b) => a - b);
  for (let i = 1; i < weekNumbers.length; i++) {
    if (weekNumbers[i] - weekNumbers[i-1] > 1) {
      warnings.push(`Gap in week numbering: Week ${weekNumbers[i-1]} to ${weekNumbers[i]}`);
      score -= 3;
    }
  }
  
  // Check session count consistency
  const sessionCounts = sessions.map(s => s.dailySessions.length);
  const avgCount = sessionCounts.reduce((sum, c) => sum + c, 0) / sessionCounts.length;
  const variance = sessionCounts.some(c => Math.abs(c - avgCount) > 2);
  
  if (variance) {
    warnings.push('Inconsistent session counts across weeks');
    score -= 5;
  }
  
  // Check duration consistency
  const durations = sessions.flatMap(week => 
    week.dailySessions.map(s => s.duration)
  ).filter(d => d > 0);
  
  if (durations.length > 0) {
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const hasOutliers = durations.some(d => Math.abs(d - avgDuration) > avgDuration * 0.5);
    
    if (hasOutliers) {
      warnings.push('Significant variation in session durations - verify extracted times');
      score -= 3;
    }
  }
  
  return { score: Math.max(0, score), warnings };
}

checkExtractionCompleteness(sessions, structureAnalysis) {
  const warnings = [];
  let score = 25;
  
  // Check if we extracted expected number of weeks
  if (structureAnalysis.weekStructure.totalWeeks > 0) {
    const expectedWeeks = structureAnalysis.weekStructure.totalWeeks;
    const extractedWeeks = sessions.length;
    
    if (extractedWeeks < expectedWeeks * 0.8) {
      warnings.push(`Extracted ${extractedWeeks} weeks but document suggests ${expectedWeeks} weeks`);
      score -= 10;
    }
  }
  
  // Check for missing critical fields
  let missingFieldCount = 0;
  sessions.forEach(week => {
    week.dailySessions.forEach(session => {
      if (!session.duration || session.duration <= 0) missingFieldCount++;
      if (!session.activities || session.activities.length === 0) missingFieldCount++;
      if (!session.focus || session.focus.length === 0) missingFieldCount++;
    });
  });
  
  if (missingFieldCount > sessions.length * 2) {
    warnings.push('Many sessions missing critical fields (duration, activities, focus)');
    score -= 8;
  }
  
  return { score: Math.max(0, score), warnings };
}

validateSession(session) {
  const warnings = [];
  let confidence = 1.0;
  
  // Check duration
  if (!session.duration || session.duration <= 0) {
    warnings.push('Missing or invalid duration');
    confidence -= 0.15;
  } else if (session.duration < 30 || session.duration > 180) {
    warnings.push('Unusual session duration: ' + session.duration + ' minutes');
    confidence -= 0.05;
  }
  
  // Check content
  if (!session.rawContent || session.rawContent.length < 50) {
    warnings.push('Limited content extracted');
    confidence -= 0.15;
  }
  
  // Check activities
  if (!session.activities || session.activities.length === 0) {
    warnings.push('No activities extracted');
    confidence -= 0.10;
  }
  
  // Check focus areas
  if (!session.focus || session.focus.length === 0) {
    warnings.push('No focus areas identified');
    confidence -= 0.10;
  }
  
  return {
    confidence: Math.max(0.3, confidence),
    warnings,
    isValid: confidence >= 0.6
  };
}


// NEW: Extraction for highly structured documents
extractFromHighlyStructuredDocument(text, structureAnalysis, academyInfo) {
  const { weekStructure, dayStructure, durationAnalysis } = structureAnalysis;
  const sessions = [];
  
  console.log(`Extracting from highly structured document: ${weekStructure.totalWeeks} weeks identified`);
  
  // Split text by weeks
  const weekSections = this.splitTextByWeeks(text, weekStructure);
  
  weekSections.forEach((weekSection, weekIndex) => {
    const weekNumber = weekStructure.identifiedWeeks[weekIndex] || (weekIndex + 1);
    
    const weekSession = {
      id: `week_${weekNumber}_${Date.now()}`,
      weekNumber: weekNumber,
      title: this.extractWeekTitle(weekSection.content, weekNumber),
      description: this.extractWeekDescription(weekSection.content),
      dailySessions: [],
      totalDuration: 0,
      focus: this.extractWeekFocus(weekSection.content),
      notes: [],
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      weekSchedule: this.extractWeekScheduleFromStructure(weekSection.content, dayStructure)
    };

    // Extract daily sessions within this week
    const dailySessions = this.extractDailySessionsFromWeekSection(weekSection, weekNumber, academyInfo, durationAnalysis);
    weekSession.dailySessions = dailySessions;
    weekSession.totalDuration = dailySessions.reduce((sum, session) => sum + session.duration, 0);

    sessions.push(weekSession);
  });
  
  return sessions;
}

// NEW: Extraction for moderately structured documents
extractFromModeratelyStructuredDocument(text, structureAnalysis, academyInfo) {
  const { weekStructure, sessionStructure, durationAnalysis } = structureAnalysis;
  const sessions = [];
  
  console.log(`Extracting from moderately structured document`);
  
  if (weekStructure.totalWeeks > 0) {
    // Has week structure but maybe not perfect
    return this.extractWithPartialWeekStructure(text, structureAnalysis, academyInfo);
  } else if (sessionStructure.hasStructuredSessions) {
    // Has session structure but no weeks
    return this.extractWithSessionStructure(text, structureAnalysis, academyInfo);
  } else {
    // Fall back to basic extraction
    return this.extractFromBasicStructuredDocument(text, structureAnalysis, academyInfo);
  }
}

// NEW: Helper methods for structure-aware extraction
splitTextByWeeks(text, weekStructure) {
  const weekSections = [];
  const weekTitles = weekStructure.weekTitles.sort((a, b) => a.position - b.position);
  
  for (let i = 0; i < weekTitles.length; i++) {
    const startPos = weekTitles[i].position;
    const endPos = i + 1 < weekTitles.length ? weekTitles[i + 1].position : text.length;
    
    weekSections.push({
      weekNumber: weekTitles[i].number,
      title: weekTitles[i].title,
      content: text.substring(startPos, endPos), // This should always be a string
      startPosition: startPos,
      endPosition: endPos
    });
  }
  
  return weekSections;
}

// Week Boundary Detection
// Add this NEW method to improve week boundary detection
detectWeekBoundaries(text) {
  const lines = text.split('\n');
  const boundaries = [];
  let contentDensity = [];
  
  // Calculate content density per line (words per line)
  lines.forEach((line, index) => {
    const wordCount = line.trim().split(/\s+/).filter(w => w.length > 0).length;
    contentDensity.push({
      index: index,
      wordCount: wordCount,
      line: line,
      isEmpty: wordCount === 0
    });
  });
  
  // Find natural breaks (low density areas after high density)
  for (let i = 5; i < contentDensity.length - 5; i++) {
    const prevAvg = this.calculateAverageDensity(contentDensity, i - 5, i);
    const currentDensity = contentDensity[i].wordCount;
    const nextAvg = this.calculateAverageDensity(contentDensity, i + 1, i + 6);
    
    // A boundary is likely if:
    // 1. Current line is empty or very short
    // 2. Previous section had content
    // 3. Next section has content
    if (currentDensity < 3 && prevAvg > 5 && nextAvg > 5) {
      boundaries.push({
        lineIndex: i,
        type: 'natural_break',
        confidence: 0.7
      });
    }
    
    // Check for explicit week markers
    const weekMatch = this.fuzzyMatchWeek(lines[i]);
    if (weekMatch.matched) {
      boundaries.push({
        lineIndex: i,
        type: 'week_marker',
        weekNumber: weekMatch.weekNumber,
        confidence: 0.95
      });
    }
  }
  
  return boundaries;
}

// Add this helper method right after
calculateAverageDensity(contentDensity, startIdx, endIdx) {
  const slice = contentDensity.slice(startIdx, endIdx);
  if (slice.length === 0) return 0;
  
  const sum = slice.reduce((total, item) => total + item.wordCount, 0);
  return sum / slice.length;
}

extractDailySessionsFromWeekSection(weekSection, weekNumber, academyInfo, durationAnalysis) {
  const dailySessions = [];
  const content = weekSection.content;
  
  // Look for daily patterns within this week section
  const dayPatterns = [
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi,
    /day\s*(\d+)/gi,
    /(session\s*\d+)/gi
  ];
  
  const foundDays = [];
  dayPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      foundDays.push({
        day: match[1] || match[0],
        position: match.index,
        fullMatch: match[0]
      });
    }
  });
  
  // Create sessions for found days
  foundDays.forEach((dayInfo, index) => {
    const session = this.createStructuredDailySession(
      dayInfo, 
      weekNumber, 
      index + 1, 
      academyInfo,
      content,
      durationAnalysis
    );
    dailySessions.push(session);
  });
  
  // If no specific days found, create a general week session
  if (dailySessions.length === 0) {
    const generalSession = this.createGeneralWeekSession(weekSection, weekNumber, academyInfo);
    dailySessions.push(generalSession);
  }
  
  return dailySessions;
}

createStructuredDailySession(dayInfo, weekNumber, dayIndex, academyInfo, content, durationAnalysis) {
  const dayName = this.normalizeDayName(dayInfo.day);
  const sessionDate = this.calculateSessionDate(weekNumber, dayName);
  
  // Extract duration for this specific session
  const sessionDuration = this.extractSessionDuration(content, dayInfo, durationAnalysis);
  
  return {
    id: `session_${weekNumber}_${dayIndex}_${Date.now()}`,
    weekNumber: weekNumber,
    dayNumber: dayIndex,
    title: `${academyInfo.academyName} - Week ${weekNumber}, ${this.capitalizeFirst(dayName)} Training`,
    day: dayName,
    date: sessionDate,
    time: this.extractSessionTime(content, dayInfo) || '08:00',
    duration: sessionDuration,
    location: academyInfo.location || 'Training Field',
    type: this.identifySessionType(content, dayInfo),
    participants: this.estimateParticipants(academyInfo.ageGroup),
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    difficulty: academyInfo.difficulty,
    activities: this.extractActivitiesFromSection(content, dayInfo),
    drills: this.extractDrillsFromSection(content, dayInfo),
    objectives: this.extractObjectivesFromSection(content, dayInfo),
    equipment: this.extractEquipmentFromSection(content, dayInfo),
    notes: this.extractNotesFromSection(content, dayInfo),
    rawContent: content,
    documentContent: this.extractRelevantContent(content, dayInfo),
    completionRate: 0,
    focus: this.extractSessionFocus(content, dayInfo),
    week: `Week ${weekNumber}`,
    weekDescription: content.substring(0, 200)
  };
}

// NEW: Derive schedule preferences from structure analysis
deriveSchedulePreferences(structureAnalysis) {
  const { dayStructure, durationAnalysis, schedulePattern } = structureAnalysis;
  
  const preferences = {
    availableDays: ['monday', 'wednesday', 'friday'], // default
    preferredTime: '16:00',
    sessionDuration: 90,
    intensity: 'moderate'
  };
  
  // Override with document insights
  if (dayStructure.identifiedDays.length > 0) {
    preferences.availableDays = dayStructure.identifiedDays;
  }
  
  if (durationAnalysis.averageDuration) {
    preferences.sessionDuration = durationAnalysis.averageDuration;
  }
  
  if (schedulePattern.recommendedFrequency) {
    // Adjust available days based on frequency
    const frequency = schedulePattern.recommendedFrequency;
    if (frequency <= 2) {
      preferences.availableDays = ['monday', 'thursday'];
    } else if (frequency === 3) {
      preferences.availableDays = ['monday', 'wednesday', 'friday'];
    } else if (frequency >= 4) {
      preferences.availableDays = ['monday', 'tuesday', 'thursday', 'friday'];
    }
  }
  
  return preferences;
}

// Additional helper methods
normalizeDayName(dayText) {
  const dayMap = {
    'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday',
    'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
  };
  
  const lower = dayText.toLowerCase();
  return dayMap[lower] || lower;
}

extractSessionDuration(content, dayInfo, durationAnalysis) {
  // Look for duration near this day mention
  const nearbyText = content.substring(
    Math.max(0, dayInfo.position - 100),
    Math.min(content.length, dayInfo.position + 200)
  );
  
  const durationMatch = nearbyText.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    return unit.includes('hour') ? value * 60 : value;
  }
  
  // Fall back to average duration
  return durationAnalysis.averageDuration || 90;
}

extractSessionTime(content, dayInfo) {
  // Look for time near this day mention
  const nearbyText = content.substring(
    Math.max(0, dayInfo.position - 50),
    Math.min(content.length, dayInfo.position + 100)
  );
  
  const timeMatch = nearbyText.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*(am|pm)/i);
  if (timeMatch) {
    if (timeMatch[1] && timeMatch[2]) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    } else if (timeMatch[3] && timeMatch[4]) {
      let hour = parseInt(timeMatch[3]);
      if (timeMatch[4].toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
      } else if (timeMatch[4].toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  }
  
  return null;
}

identifySessionType(content, dayInfo = null) {
  // If no dayInfo provided, analyze the entire content
  let nearbyText;
  if (dayInfo && dayInfo.position !== undefined) {
    nearbyText = content.substring(
      Math.max(0, dayInfo.position - 100),
      Math.min(content.length, dayInfo.position + 200)
    ).toLowerCase();
  } else {
    // Use the whole content if no position info available
    nearbyText = typeof content === 'string' ? content.toLowerCase() : '';
  }
  
  if (!nearbyText) return 'Team Training';
  
  if (nearbyText.includes('warm')) return 'Warm-up Session';
  if (nearbyText.includes('technical')) return 'Technical Training';
  if (nearbyText.includes('tactical')) return 'Tactical Training';
  if (nearbyText.includes('conditioning')) return 'Conditioning';
  if (nearbyText.includes('match') || nearbyText.includes('game')) return 'Match/Game';
  
  return 'Team Training';
}

extractActivitiesFromSection(content, dayInfo) {
  const activities = [];
  const nearbyText = content.substring(
    Math.max(0, dayInfo.position - 50),
    Math.min(content.length, dayInfo.position + 300)
  );
  
  const lines = nearbyText.split('\n');
  lines.forEach(line => {
    if (this.isActivity(line.trim())) {
      activities.push(line.trim());
    }
  });
  
  return activities.slice(0, 5);
}

extractRelevantContent(content, dayInfo) {
  return content.substring(
    Math.max(0, dayInfo.position - 100),
    Math.min(content.length, dayInfo.position + 500)
  );
}

// NEW: Extract from documents with partial week structure
extractWithPartialWeekStructure(text, structureAnalysis, academyInfo) {
  const { weekStructure } = structureAnalysis;
  const sessions = [];
  
  // Fill in missing weeks if we have some but not all
  const maxWeek = weekStructure.totalWeeks || 12;
  
  for (let weekNum = 1; weekNum <= maxWeek; weekNum++) {
    const hasExplicitWeek = weekStructure.identifiedWeeks.includes(weekNum);
    
    const weekSession = {
      id: `week_${weekNum}_partial_${Date.now()}`,
      weekNumber: weekNum,
      title: hasExplicitWeek ? 
        this.findWeekTitle(text, weekNum) : 
        `Week ${weekNum} Training`,
      description: hasExplicitWeek ?
        this.extractWeekContentByNumber(text, weekNum) :
        this.generateWeekDescription(weekNum, academyInfo),
      dailySessions: [],
      totalDuration: 0,
      focus: hasExplicitWeek ?
        this.extractWeekFocusByNumber(text, weekNum) :
        this.generateWeekFocus(weekNum, academyInfo.sport),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };

    // Create sessions for this week
    const dailySessions = hasExplicitWeek ?
      this.extractSessionsForSpecificWeek(text, weekNum, academyInfo) :
      this.generateDefaultWeekSessions(weekNum, academyInfo);
    
    weekSession.dailySessions = dailySessions;
    weekSession.totalDuration = dailySessions.reduce((sum, s) => sum + s.duration, 0);
    
    sessions.push(weekSession);
  }
  
  return sessions;
}

// NEW: Extract from session-structured documents
extractWithSessionStructure(text, structureAnalysis, academyInfo) {
  const { sessionStructure } = structureAnalysis;
  const sessions = [];
  
  // Group sessions into weeks (assume 3 sessions per week)
  const sessionsPerWeek = 3;
  const totalSessions = sessionStructure.totalSessions;
  const totalWeeks = Math.ceil(totalSessions / sessionsPerWeek);
  
  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const startSessionIndex = (weekNum - 1) * sessionsPerWeek;
    const endSessionIndex = Math.min(startSessionIndex + sessionsPerWeek, totalSessions);
    
    const weekSessions = sessionStructure.sessionDetails
      .slice(startSessionIndex, endSessionIndex)
      .map((sessionDetail, index) => 
        this.createSessionFromDetail(sessionDetail, weekNum, index + 1, academyInfo)
      );
    
    const weekSession = {
      id: `week_${weekNum}_sessions_${Date.now()}`,
      weekNumber: weekNum,
      title: `Week ${weekNum} Training Sessions`,
      description: `Training week with ${weekSessions.length} structured sessions`,
      dailySessions: weekSessions,
      totalDuration: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      focus: this.deriveWeekFocusFromSessions(weekSessions),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport
    };
    
    sessions.push(weekSession);
  }
  
  return sessions;
}

// Additional helper methods for new functionality
findWeekTitle(text, weekNumber) {
  const weekPattern = new RegExp(`week\\s*${weekNumber}[^\\n]*`, 'gi');
  const match = text.match(weekPattern);
  return match ? match[0] : `Week ${weekNumber}`;
}

extractWeekContentByNumber(text, weekNumber) {
  const weekStart = text.search(new RegExp(`week\\s*${weekNumber}`, 'gi'));
  if (weekStart === -1) return '';
  
  const nextWeekStart = text.search(new RegExp(`week\\s*${weekNumber + 1}`, 'gi'));
  const endPos = nextWeekStart === -1 ? weekStart + 500 : nextWeekStart;
  
  return text.substring(weekStart, endPos).substring(0, 200);
}

generateWeekDescription(weekNumber, academyInfo) {
  const progressionMap = {
    1: 'Foundation building and basic skill introduction',
    2: 'Skill development and coordination improvement',
    3: 'Technique refinement and tactical awareness',
    4: 'Integration of skills in game situations'
  };
  
  const baseDescription = progressionMap[weekNumber % 4 || 4];
  return `${baseDescription} for ${academyInfo.sport} training`;
}

generateWeekFocus(weekNumber, sport) {
  const sportFocusMap = {
    soccer: ['ball control', 'passing', 'shooting', 'defending'],
    basketball: ['dribbling', 'shooting', 'defense', 'teamwork'],
    tennis: ['serves', 'groundstrokes', 'volleys', 'strategy']
  };
  
  const focuses = sportFocusMap[sport] || ['technique', 'fitness', 'tactics', 'teamwork'];
  return [focuses[(weekNumber - 1) % focuses.length]];
}

createSessionFromDetail(sessionDetail, weekNumber, dayNumber, academyInfo) {
  return {
    id: `session_${weekNumber}_${dayNumber}_detail_${Date.now()}`,
    weekNumber: weekNumber,
    dayNumber: dayNumber,
    title: `${academyInfo.academyName} - ${sessionDetail.text}`,
    day: this.mapSessionToDay(dayNumber),
    date: this.calculateSessionDate(weekNumber, this.mapSessionToDay(dayNumber)),
    time: '08:00',
    duration: 90,
    location: academyInfo.location || 'Training Field',
    type: sessionDetail.type,
    participants: this.estimateParticipants(academyInfo.ageGroup),
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    difficulty: academyInfo.difficulty,
    activities: [sessionDetail.text],
    focus: [sessionDetail.type],
    rawContent: sessionDetail.text
  };
}

mapSessionToDay(dayNumber) {
  const dayMap = ['monday', 'wednesday', 'friday', 'tuesday', 'thursday', 'saturday', 'sunday'];
  return dayMap[dayNumber - 1] || 'monday';
}

// Add these missing methods to SessionExtractor.js
extractWeekTitle(content, weekNumber) {
  const lines = typeof content === 'string' 
    ? content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    : (Array.isArray(content) ? content : []);
  
  // Look for the FULL week header line in first 5 lines
  for (const line of lines.slice(0, 5)) {
    // Match: "Week N: [Description]" or "Week N - [Description]"
    const fullTitleMatch = line.match(/^week\s*\d+\s*[:\-–—]\s*(.+?)$/i);
    if (fullTitleMatch) {
      const focusText = fullTitleMatch[1].trim();
      
      // Skip scheduling lines
      if (this.isSchedulingLine(focusText)) continue;
      
      // Return in format: "Focus - [description]"
      return `Focus - ${focusText}`;
    }
  }
  
  // Fallback: try to extract focus from content
  const focus = this.extractWeekFocus(lines);
  if (focus && focus.length > 0) {
    return `Focus - ${focus.join(', ')}`;
  }
  
  return `Week ${weekNumber} Training`;
}

isSchedulingLine(line) {
  const schedulingPatterns = [
    /\(.*hours?\s*each\)/i,
    /(sunday|monday|tuesday|wednesday|thursday|friday|saturday).*\d+\s*hours?/i,
    /^\d+\s*hours?\s*each$/i
  ];
  return schedulingPatterns.some(pattern => pattern.test(line));
}

extractWeekDescription(content) {
  let processableContent;
  
  if (Array.isArray(content)) {
    processableContent = content;
  } else if (typeof content === 'string') {
    processableContent = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  } else if (content && typeof content === 'object' && content.content) {
    processableContent = typeof content.content === 'string' 
      ? content.content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      : content.content;
  } else {
    console.warn('extractWeekDescription: unexpected content type:', typeof content);
    return 'Training week focused on skill development and physical conditioning.';
  }
  
  // Skip header and scheduling lines, get to actual training content
  const meaningfulLines = processableContent.filter(line => {
    if (typeof line !== 'string') return false;
    if (line.length < 15) return false;
    if (this.isHeaderLine(line)) return false;
    if (this.isSchedulingLine(line)) return false; // NEW: Skip scheduling lines
    return true;
  });
  
  // Look for activity sections (Warm-up, Technical Drill, etc.)
  const activitySections = [];
  for (const line of meaningfulLines.slice(0, 15)) {
    if (line.match(/^(warm[- ]?up|technical|conditioning|special|gameplay|cool[- ]?down)/i)) {
      activitySections.push(line);
      if (activitySections.length >= 3) break; // Get first 3 activity types
    }
  }
  
  // If we found activity sections, use those for description
  if (activitySections.length > 0) {
    const description = activitySections
      .map(s => s.replace(/\(\d+\s*minutes?\)/i, '').trim())
      .join(', ');
    return description.substring(0, 200);
  }
  
  // Otherwise take first meaningful lines
  const descriptionLines = meaningfulLines.slice(0, 3);
  const description = descriptionLines.join(' ').substring(0, 200);
  
  return description || 'Training week focused on skill development and physical conditioning.';
}

extractWeekFocus(content) {
  let textContent;
  if (Array.isArray(content)) {
    textContent = content.join(' ').toLowerCase();
  } else if (typeof content === 'string') {
    textContent = content.toLowerCase();
  } else {
    return ['general training'];
  }
  
  // PRIORITY 1: Extract from week title if present
  const titleMatch = textContent.match(/week\s*\d+[:\-–—]\s*(.+?)(?:\n|sunday|monday|tuesday|wednesday)/i);
  if (titleMatch && titleMatch[1]) {
    const titleFocus = titleMatch[1].toLowerCase();
    
    // Clean up the focus text
    const focusText = titleFocus
      .replace(/\(\d+\s*hours?\s*each\)/gi, '')
      .replace(/sunday|monday|tuesday|wednesday|thursday|friday|saturday/gi, '')
      .trim();
    
    if (focusText.length > 10 && focusText.length < 150) {
      return [focusText];
    }
  }
  
  // PRIORITY 2: Search for focus keywords
  const focusKeywords = [
    'body positioning', 'arm recovery', 'arm entry', 'underwater catch',
    'kick', 'head positioning', 'breathing', 'stroke timing',
    'shooting', 'passing', 'dribbling', 'defending', 'tactics',
    'fitness', 'conditioning', 'technique', 'teamwork', 'strategy'
  ];
  
  const foundFocus = focusKeywords.filter(keyword => 
    textContent.includes(keyword)
  );
  
  return foundFocus.length > 0 ? foundFocus.slice(0, 3) : ['general training'];
}

extractWeekScheduleFromStructure(content, dayStructure) {
  const schedule = [];
  
  if (dayStructure.identifiedDays && dayStructure.identifiedDays.length > 0) {
    dayStructure.identifiedDays.forEach(day => {
      schedule.push({
        day: this.capitalizeFirst(day),
        time: '08:00', // default
        duration: '90min', // default
        focus: `${day} training session`
      });
    });
  }
  
  return schedule;
}

// Add missing helper methods
isHeaderLine(line) {
  return /^(week\s*\d+|session\s*\d+|day\s*\d+|training\s*week)/i.test(line.trim()) ||
         line.length < 10 ||
         /^[A-Z\s]{5,}$/.test(line.trim()); // All caps headers
}

capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Add methods for partial structure extraction
extractFromBasicStructuredDocument(text, structureAnalysis, academyInfo) {
  const sessions = [];
  const { weekStructure } = structureAnalysis;
  
  // Create default week structure
  const totalWeeks = weekStructure.totalWeeks || 8;
  
  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const weekSession = {
  id: `week_${weekNumber}_${Date.now()}`,
      weekNumber: weekNumber,
      title: this.extractWeekTitle(weekContent, weekNumber), // This should now get the proper title
      description: this.extractWeekDescription(weekContent),
      dailySessions: [],
      totalDuration: 0,
      focus: this.generateDefaultFocus(weekNum, academyInfo.sport),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      weekSchedule: { days: ['monday', 'wednesday', 'friday'], pattern: 'Three days per week' }
    };

    // Create default sessions for this week
    const dailySessions = this.generateDefaultWeekSessions(weekNum, academyInfo);
    weekSession.dailySessions = dailySessions;
    weekSession.totalDuration = dailySessions.reduce((sum, s) => sum + s.duration, 0);
    
    sessions.push(weekSession);
  }
  
  return sessions;
}

extractFromUnstructuredDocument(text, structureAnalysis, academyInfo) {
  const sessions = [];
  
  // Create minimal structure from unstructured text
  const totalWeeks = 4; // Default to 4 weeks for unstructured
  
  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const weekSession = {
      id: `week_${weekNum}_unstructured_${Date.now()}`,
      weekNumber: weekNum,
      title: `Week ${weekNum} Training Program`,
      description: `Training program derived from document content`,
      dailySessions: [],
      totalDuration: 270, // 3 sessions × 90 min
      focus: this.generateDefaultFocus(weekNum, academyInfo.sport),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      weekSchedule: { days: ['monday', 'wednesday', 'friday'], pattern: 'Standard 3-day week' }
    };

    // Create basic sessions
    const dailySessions = [
      this.createBasicSession(weekNum, 1, 'monday', academyInfo),
      this.createBasicSession(weekNum, 2, 'wednesday', academyInfo),
      this.createBasicSession(weekNum, 3, 'friday', academyInfo)
    ];
    
    weekSession.dailySessions = dailySessions;
    sessions.push(weekSession);
  }
  
  return sessions;
}

generateDefaultFocus(weekNumber, sport) {
  const sportFocus = {
    soccer: ['ball control', 'passing', 'shooting', 'defending'],
    basketball: ['dribbling', 'shooting', 'defense', 'teamwork'],
    tennis: ['serves', 'groundstrokes', 'volleys', 'strategy'],
    general: ['technique', 'fitness', 'tactics', 'teamwork']
  };
  
  const focuses = sportFocus[sport] || sportFocus.general;
  return [focuses[(weekNumber - 1) % focuses.length]];
}

generateDefaultWeekSessions(weekNumber, academyInfo) {
  const days = ['monday', 'wednesday', 'friday'];
  
  return days.map((day, index) => 
    this.createBasicSession(weekNumber, index + 1, day, academyInfo)
  );
}

createBasicSession(weekNumber, dayNumber, dayName, academyInfo) {
  return {
    id: `session_${weekNumber}_${dayNumber}_basic_${Date.now()}`,
    weekNumber: weekNumber,
    dayNumber: dayNumber,
    title: `${academyInfo.academyName} - Week ${weekNumber}, ${this.capitalizeFirst(dayName)} Training`,
    day: dayName,
    date: this.calculateSessionDate(weekNumber, dayName),
    time: '08:00',
    duration: 90,
    location: academyInfo.location || 'Training Field',
    type: 'Team Training',
    participants: this.estimateParticipants(academyInfo.ageGroup),
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    difficulty: academyInfo.difficulty,
    activities: [`${this.capitalizeFirst(dayName)} training activities`],
    drills: [`Basic ${academyInfo.sport} drills`],
    objectives: [`Week ${weekNumber} skill development`],
    equipment: this.getBasicEquipment(academyInfo.sport),
    notes: `Standard ${dayName} training session`,
    rawContent: `Week ${weekNumber} ${dayName} training`,
    documentContent: `Training session for week ${weekNumber}`,
    completionRate: 0,
    focus: this.generateDefaultFocus(weekNumber, academyInfo.sport),
    week: `Week ${weekNumber}`,
    weekDescription: `Week ${weekNumber} training focus`
  };
}

getBasicEquipment(sport) {
  const equipmentMap = {
    soccer: ['soccer balls', 'cones', 'goals', 'bibs'],
    basketball: ['basketballs', 'hoops', 'cones'],
    tennis: ['tennis balls', 'rackets', 'net'],
    general: ['cones', 'markers', 'equipment']
  };
  
  return equipmentMap[sport] || equipmentMap.general;
}

// Add methods called by other extraction functions
extractSessionsForSpecificWeek(text, weekNumber, academyInfo) {
  const weekPattern = new RegExp(`week\\s*${weekNumber}[\\s\\S]*?(?=week\\s*${weekNumber + 1}|$)`, 'gi');
  const weekMatch = text.match(weekPattern);
  
  if (!weekMatch) {
    return this.generateDefaultWeekSessions(weekNumber, academyInfo);
  }
  
  const weekContent = weekMatch[0];
  const dayPatterns = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
  const days = [];
  
  let match;
  while ((match = dayPatterns.exec(weekContent)) !== null) {
    days.push(match[1].toLowerCase());
  }
  
  if (days.length === 0) {
    return this.generateDefaultWeekSessions(weekNumber, academyInfo);
  }
  
  return days.map((day, index) => 
    this.createBasicSession(weekNumber, index + 1, day, academyInfo)
  );
}

extractWeekFocusByNumber(text, weekNumber) {
  const weekPattern = new RegExp(`week\\s*${weekNumber}[\\s\\S]*?(?=week\\s*${weekNumber + 1}|$)`, 'gi');
  const weekMatch = text.match(weekPattern);
  
  if (!weekMatch) {
    return ['general training'];
  }
  
  return this.extractWeekFocus(weekMatch[0]);
}

deriveWeekFocusFromSessions(sessions) {
  const allFocus = sessions.flatMap(session => session.focus || []);
  const uniqueFocus = [...new Set(allFocus)];
  return uniqueFocus.slice(0, 3);
}

// Add methods for section extraction
extractActivitiesFromSection(content, dayInfo) {
  const startPos = Math.max(0, dayInfo.position - 50);
  const endPos = Math.min(content.length, dayInfo.position + 200);
  const section = content.substring(startPos, endPos);
  
  const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 5);
  const activities = lines.filter(line => this.isActivity(line)).slice(0, 3);
  
  return activities.length > 0 ? activities : [`${dayInfo.day} training activities`];
}

extractDrillsFromSection(content, dayInfo) {
  const startPos = Math.max(0, dayInfo.position - 50);
  const endPos = Math.min(content.length, dayInfo.position + 200);
  const section = content.substring(startPos, endPos);
  
  const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 5);
  const drills = lines.filter(line => this.isDrill(line)).slice(0, 3);
  
  return drills.length > 0 ? drills.map(drill => ({ name: drill, description: drill })) : [{ name: 'Basic drills', description: 'Fundamental skill development' }];
}

extractObjectivesFromSection(content, dayInfo) {
  const startPos = Math.max(0, dayInfo.position - 50);
  const endPos = Math.min(content.length, dayInfo.position + 200);
  const section = content.substring(startPos, endPos);
  
  const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 5);
  const objectives = lines.filter(line => this.isObjective(line)).slice(0, 2);
  
  return objectives.length > 0 ? objectives : [`${dayInfo.day} training objectives`];
}

extractEquipmentFromSection(content, dayInfo) {
  const equipmentKeywords = ['ball', 'cone', 'goal', 'bib', 'ladder', 'hurdle', 'marker', 'net', 'racket'];
  const startPos = Math.max(0, dayInfo.position - 100);
  const endPos = Math.min(content.length, dayInfo.position + 200);
  const section = content.substring(startPos, endPos).toLowerCase();
  
  const foundEquipment = equipmentKeywords.filter(equipment => section.includes(equipment));
  return foundEquipment.length > 0 ? foundEquipment : ['basic training equipment'];
}

extractNotesFromSection(content, dayInfo) {
  const startPos = Math.max(0, dayInfo.position - 30);
  const endPos = Math.min(content.length, dayInfo.position + 150);
  const section = content.substring(startPos, endPos);
  
  const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 10);
  const notes = lines.filter(line => this.isNote(line)).slice(0, 2);
  
  return notes.length > 0 ? notes.join('\n') : `Training notes for ${dayInfo.day}`;
}

extractSessionFocus(content, dayInfo) {
  const startPos = Math.max(0, dayInfo.position - 100);
  const endPos = Math.min(content.length, dayInfo.position + 200);
  const section = content.substring(startPos, endPos);
  
  return this.extractWeekFocus(section);
}

parseDocumentStructure(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const structure = {
    title: '',
    weeks: [],
    currentWeek: null,
    currentDay: null,
    sections: []
  };

  // Enhanced week pattern to catch more variations
  const enhancedWeekPattern = /^(week\s*\d+|session\s*\d+|day\s*\d+|training\s*week\s*\d+|week\s*\d+\s*[-–—:]\s*)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    
    // Check for week/session headers with improved detection
    if (enhancedWeekPattern.test(line) || this.isWeekHeader(line, nextLine)) {
      if (structure.currentWeek) {
        structure.weeks.push(structure.currentWeek);
      }
      
      structure.currentWeek = {
        title: line,
        lineNumber: i,
        days: [],
        content: [line]
      };
      structure.currentDay = null; // Reset current day
      continue;
    }

    // Enhanced training day detection
    const dayMatch = line.match(this.sessionPatterns.trainingDayPattern) || 
                    this.detectTrainingDay(line);
    
    if (dayMatch && structure.currentWeek) {
      structure.currentDay = {
        day: dayMatch[1] || this.extractDayName(line),
        duration: dayMatch[2] || this.extractDuration(line) || '',
        lineNumber: i,
        activities: [],
        content: [line]
      };
      structure.currentWeek.days.push(structure.currentDay);
      continue;
    }

    // Add content to current context
    if (structure.currentDay) {
      structure.currentDay.content.push(line);
    } else if (structure.currentWeek) {
      structure.currentWeek.content.push(line);
    }
  }

  // Don't forget the last week
  if (structure.currentWeek) {
    structure.weeks.push(structure.currentWeek);
  }

  PlatformUtils.logDebugInfo('Document structure parsed', {
    totalWeeks: structure.weeks.length,
    linesProcessed: lines.length
  });

  return structure;
}

// Add these helper methods to the SessionExtractor class:

isWeekHeader(line, nextLine) {
  // Check if line looks like a week header even without exact pattern match
  const weekIndicators = [
    /week\s*\d+/i,
    /training.*week/i,
    /session.*\d+/i,
    /^w\d+/i // Handles "W1", "W2" etc.
  ];
  
  const hasWeekIndicator = weekIndicators.some(pattern => pattern.test(line));
  const isShortLine = line.length < 50;
  const nextLineHasContent = nextLine && nextLine.length > 20;
  
  return hasWeekIndicator && isShortLine && nextLineHasContent;
}

detectTrainingDay(line) {
  const dayPatterns = [
    /(daily\s*session)/i,
    /(training\s*session)/i,
    /(\d+\s*hour.*session)/i,
    /(warm.*up|technical|conditioning)/i
  ];
  
  for (const pattern of dayPatterns) {
    const match = line.match(pattern);
    if (match) {
      return [match[0], match[1] || 'training'];
    }
  }
  
  return null;
}

extractDayName(line) {
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const foundDay = dayNames.find(day => line.toLowerCase().includes(day));
  
  if (foundDay) {
    return foundDay;
  }
  
  // Default naming based on content
  if (line.toLowerCase().includes('warm') || line.toLowerCase().includes('coordination')) {
    return 'training_day';
  }
  
  return 'session';
}

extractDuration(line) {
  const durationMatch = line.match(/(\d+)\s*(minutes?|hours?|mins?|hrs?)/i);
  if (durationMatch) {
    const value = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    return unit.includes('hour') ? `${value} hours` : `${value} minutes`;
  }
  return null;
}

// Update the extractAcademyInfo method in SessionExtractor.js
extractAcademyInfo(text, trainingPlan, structureAnalysis = null) {
  const lines = text.split('\n').slice(0, 20); // Check first 20 lines
  
  let academyName = '';
  let sport = '';
  let ageGroup = '';
  let program = '';

  // Extract academy name with structure context
  for (const line of lines) {
    const academyMatch = line.match(this.sessionPatterns.academyPattern);
    if (academyMatch) {
      academyName = academyMatch[1].trim();
      break;
    }
  }

  // Use structure analysis if available
  if (structureAnalysis) {
    if (structureAnalysis.documentType === 'curriculum') {
      program = 'Training Curriculum';
    } else if (structureAnalysis.documentType === 'weekly_schedule') {
      program = 'Weekly Training Schedule';
    }
  }

  // Extract sport
  const sportMatch = text.match(this.sessionPatterns.sportPattern);
  if (sportMatch) {
    sport = sportMatch[1].toLowerCase();
  }

  // Extract age group
  const ageMatch = text.match(this.sessionPatterns.agePattern);
  if (ageMatch) {
    ageGroup = ageMatch[1];
  }

  // Extract program name
  if (!program) {
    const programLines = lines.filter(line => 
      line.includes('COACHING') || 
      line.includes('PLAN') || 
      line.includes('PROGRAM')
    );
    if (programLines.length > 0) {
      program = programLines[0].trim();
    }
  }

  return {
    academyName: academyName || trainingPlan.academyName || trainingPlan.title || 'Training Academy',
    sport: sport || trainingPlan.category || 'soccer',
    ageGroup: ageGroup || 'Youth',
    program: program || trainingPlan.title || 'Training Program',
    location: 'Training Facility', // Default value
    difficulty: trainingPlan.difficulty || 'intermediate'
  };
}

extractWeeklySessions(text, structure, academyInfo) {
  const sessions = [];

  // Log the structure for debugging
  PlatformUtils.logDebugInfo('Extracting sessions from structure', {
    weeksFound: structure.weeks.length,
    textLength: text.length,
    academyName: academyInfo.academyName
  });

  structure.weeks.forEach((week, weekIndex) => {
    const weekSession = {
      id: `week_${weekIndex + 1}_${Date.now()}`,
      weekNumber: weekIndex + 1,
      title: this.cleanWeekTitle(week.title) || `Week ${weekIndex + 1} Training`,
      description: this.extractWeekDescription(week.content),
      dailySessions: [],
      totalDuration: 0,
      focus: this.extractWeekFocus(week.content),
      notes: week.content.filter(line => this.isNote(line)),
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      weekSchedule: this.extractWeekScheduleInfo(week.content)
    };

    // Log each week being processed
    PlatformUtils.logDebugInfo(`Processing week ${weekIndex + 1}`, {
      weekTitle: week.title,
      contentLines: week.content.length,
      daysFound: week.days.length
    });

    // Extract daily sessions from the week
    week.days.forEach((day, dayIndex) => {
      const dailySession = this.createDailySession(day, weekIndex, dayIndex, academyInfo, week);
      weekSession.dailySessions.push(dailySession);
      weekSession.totalDuration += dailySession.duration;
    });

    // If no daily sessions found, create a general week session
    if (weekSession.dailySessions.length === 0) {
      const generalSession = this.createGeneralWeekSession(week, weekIndex, academyInfo);
      weekSession.dailySessions.push(generalSession);
      weekSession.totalDuration += generalSession.duration;
    }

    sessions.push(weekSession);
  });

  // Final validation and logging
  PlatformUtils.logDebugInfo('Session extraction completed', {
    totalWeeks: sessions.length,
    totalDailySessions: sessions.reduce((sum, week) => sum + week.dailySessions.length, 0),
    extractionSource: 'document_structure'
  });

  // If we have significantly fewer sessions than expected, try alternative extraction
  if (sessions.length < 8 && text.includes('Week') && text.includes('12')) {
    console.warn('Detected potential missing weeks, attempting alternative extraction');
    const alternativeSessions = this.attemptAlternativeWeekExtraction(text, academyInfo);
    if (alternativeSessions.length > sessions.length) {
      PlatformUtils.logDebugInfo('Using alternative extraction results', {
        originalCount: sessions.length,
        alternativeCount: alternativeSessions.length
      });
      return alternativeSessions;
    }
  }

  return sessions;
}

// Add this alternative extraction method:

attemptAlternativeWeekExtraction(text, academyInfo) {
  const sessions = [];
  const weekPattern = /Week\s+(\d+)/gi;
  const matches = [];
  let match;
  
  while ((match = weekPattern.exec(text)) !== null) {
    matches.push({
      weekNumber: parseInt(match[1]),
      index: match.index,
      fullMatch: match[0]
    });
  }
  
  // Create sessions for each found week
  matches.forEach((weekMatch, index) => {
    const nextWeekIndex = index + 1 < matches.length ? matches[index + 1].index : text.length;
    const weekText = text.substring(weekMatch.index, nextWeekIndex);
    
    const weekSession = {
      id: `week_${weekMatch.weekNumber}_alt_${Date.now()}`,
      weekNumber: weekMatch.weekNumber,
      title: `Week ${weekMatch.weekNumber} Training`,
      description: this.extractWeekDescription([weekText]),
      dailySessions: [],
      totalDuration: 120, // Default duration
      focus: this.extractWeekFocus([weekText]),
      notes: [],
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      weekSchedule: { days: [], pattern: 'Weekly training' }
    };

    // Create a general session for this week
    const generalSession = {
      id: `session_${weekMatch.weekNumber}_alt_${Date.now()}`,
      weekNumber: weekMatch.weekNumber,
      dayNumber: 1,
      title: `${academyInfo.academyName} - Week ${weekMatch.weekNumber} Training Plan`,
      day: 'week_plan',
      date: this.calculateSessionDate(weekMatch.weekNumber, 'monday'),
      time: '08:00',
      duration: 120,
      location: academyInfo.location || 'Training Field',
      type: 'Weekly Plan',
      participants: this.estimateParticipants(academyInfo.ageGroup),
      status: 'scheduled',
      academyName: academyInfo.academyName,
      sport: academyInfo.sport,
      ageGroup: academyInfo.ageGroup,
      difficulty: academyInfo.difficulty,
      activities: this.extractActivities([weekText]),
      drills: this.extractDrills([weekText]),
      objectives: this.extractObjectives([weekText]),
      equipment: this.extractEquipment([weekText]),
      notes: weekText,
      rawContent: weekText,
      documentContent: weekText.substring(0, 1000),
      completionRate: 0,
      focus: this.extractWeekFocus([weekText]),
      week: `Week ${weekMatch.weekNumber}`,
      weekDescription: weekText.substring(0, 200)
    };

    weekSession.dailySessions.push(generalSession);
    sessions.push(weekSession);
  });

  return sessions;
}

cleanWeekTitle(title) {
  if (!title) return null;
  return title
    .replace(/^week\s*\d+/i, '')
    .replace(/[-–—:]/g, '')
    .trim();
}

createDailySession(day, weekIndex, dayIndex, academyInfo, week) {
  const sessionDate = this.calculateSessionDate(weekIndex + 1, day.day);
  
  return {
    id: `session_${weekIndex + 1}_${dayIndex + 1}_${Date.now()}`,
    weekNumber: weekIndex + 1,
    dayNumber: dayIndex + 1,
    title: `${academyInfo.academyName} - Week ${weekIndex + 1}, ${this.capitalizeFirst(day.day)} Training`,
    day: day.day.toLowerCase(),
    date: sessionDate,
    time: this.extractTime(day.content.join(' ')) || '08:00',
    duration: this.parseDuration(day.duration) || 90,
    location: academyInfo.location || 'Training Field',
    type: 'Team Training',
    participants: this.estimateParticipants(academyInfo.ageGroup),
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    difficulty: academyInfo.difficulty,
    activities: this.extractActivities(day.content),
    drills: this.extractDrills(day.content),
    objectives: this.extractObjectives(day.content),
    equipment: this.extractEquipment(day.content),
    notes: day.content.join('\n'),
    rawContent: day.content.join('\n'),
    documentContent: this.extractSessionContent(day.content),
    completionRate: 0,
    focus: this.extractSessionFocus(day.content),
    week: week.title || `Week ${weekIndex + 1}`,
    weekDescription: week.content.slice(0, 3).join(' ')
  };
}

createGeneralWeekSession(week, weekIndex, academyInfo) {
  const sessionDate = this.calculateSessionDate(weekIndex + 1, 'monday');
  
  return {
    id: `session_${weekIndex + 1}_general_${Date.now()}`,
    weekNumber: weekIndex + 1,
    dayNumber: 1,
    title: `${academyInfo.academyName} - Week ${weekIndex + 1} Training Plan`,
    day: 'week_plan',
    date: sessionDate,
    time: '08:00',
    duration: 120,
    location: academyInfo.location || 'Training Field',
    type: 'Weekly Plan',
    participants: this.estimateParticipants(academyInfo.ageGroup),
    status: 'scheduled',
    academyName: academyInfo.academyName,
    sport: academyInfo.sport,
    ageGroup: academyInfo.ageGroup,
    difficulty: academyInfo.difficulty,
    activities: this.extractActivities(week.content),
    drills: this.extractDrills(week.content),
    objectives: this.extractObjectives(week.content),
    equipment: this.extractEquipment(week.content),
    notes: week.content.join('\n'),
    rawContent: week.content.join('\n'),
    documentContent: week.content.join('\n'),
    completionRate: 0,
    focus: this.extractWeekFocus(week.content),
    week: week.title || `Week ${weekIndex + 1}`,
    weekDescription: this.extractWeekDescription(week.content)
  };
}

extractSessionContent(content) {
  // Extract the most relevant content for this specific session
  return content
    .filter(line => line.trim().length > 10)
    .filter(line => !this.isHeaderLine(line))
    .join('\n')
    .substring(0, 1000); // Limit to reasonable length
}

extractWeekScheduleInfo(content) {
  const scheduleInfo = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  let lines;
  if (Array.isArray(content)) {
    lines = content;
  } else if (typeof content === 'string') {
    lines = content.split('\n');
  } else {
    console.warn('extractWeekScheduleInfo: unexpected content type:', typeof content);
    return [];
  }
  
  lines.forEach(line => {
    if (typeof line !== 'string') return;
    
    days.forEach(day => {
      if (line.toLowerCase().includes(day)) {
        const timeMatch = line.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*(am|pm)/i);
        const durationMatch = line.match(/(\d+)\s*(min|hour)/i);
        
        scheduleInfo.push({
          day: this.capitalizeFirst(day),
          time: timeMatch ? timeMatch[0] : '08:00',
          duration: durationMatch ? durationMatch[0] : '90min',
          focus: line.trim()
        });
      }
    });
  });
  
  return scheduleInfo;
}

capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

isHeaderLine(line) {
  return /^(week\s*\d+|session\s*\d+|day\s*\d+)/i.test(line.trim());
}

  extractSchedulingInfo(text) {
    const days = [];
    const daysPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
    const matches = text.match(daysPattern);
    
    if (matches) {
      const uniqueDays = [...new Set(matches.map(day => day.toLowerCase()))];
      days.push(...uniqueDays);
    }

    // Extract frequency
    let frequency = 'weekly';
    if (text.includes('twice') || text.includes('2 times')) {
      frequency = 'bi-weekly';
    } else if (text.includes('daily') || text.includes('every day')) {
      frequency = 'daily';
    }

    return {
      frequency,
      days,
      pattern: `${days.length} days per week`,
      preferredTime: this.extractTime(text) || '08:00'
    };
  }

  // Helper methods
  extractTime(text) {
    const timePattern = /(\d{1,2}):(\d{2})|(\d{1,2})\s*(am|pm)/i;
    const match = text.match(timePattern);
    
    if (match) {
      if (match[1] && match[2]) {
        return `${match[1].padStart(2, '0')}:${match[2]}`;
      } else if (match[3] && match[4]) {
        let hour = parseInt(match[3]);
        if (match[4].toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (match[4].toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }
        return `${hour.toString().padStart(2, '0')}:00`;
      }
    }
    
    return null;
  }

  parseDuration(durationText) {
    if (!durationText) return 90; // Default duration
    
    const match = durationText.match(this.sessionPatterns.durationPattern);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('hour') || unit.includes('hr')) {
        return value * 60;
      } else {
        return value;
      }
    }
    
    return 90;
  }

extractActivities(content) {
  const activities = [];
  let lines;
  
  if (Array.isArray(content)) {
    lines = content;
  } else if (typeof content === 'string') {
    lines = content.split('\n');
  } else {
    console.warn('extractActivities: unexpected content type:', typeof content);
    return ['General training activities'];
  }
  
  lines.forEach(line => {
    if (typeof line === 'string' && this.isActivity(line)) {
      activities.push(line.trim());
    }
  });
  
  return activities.slice(0, 5);
}

extractDrills(content) {
  const drills = [];
  let lines;
  
  if (Array.isArray(content)) {
    lines = content;
  } else if (typeof content === 'string') {
    lines = content.split('\n');
  } else {
    console.warn('extractDrills: unexpected content type:', typeof content);
    return [{ name: 'Basic drills', description: 'Fundamental skill development' }];
  }
  
  lines.forEach(line => {
    if (typeof line === 'string' && this.isDrill(line)) {
      const drill = {
        name: this.extractDrillName(line),
        description: line.trim(),
        duration: this.extractDrillDuration(line)
      };
      drills.push(drill);
    }
  });
  
  return drills.length > 0 ? drills : [{ name: 'Basic drills', description: 'Fundamental skill development' }];
}

extractObjectives(content) {
  const objectives = [];
  let lines;
  
  if (Array.isArray(content)) {
    lines = content;
  } else if (typeof content === 'string') {
    lines = content.split('\n');
  } else {
    console.warn('extractObjectives: unexpected content type:', typeof content);
    return ['Training objectives'];
  }
  
  lines.forEach(line => {
    if (typeof line === 'string' && this.isObjective(line)) {
      objectives.push(line.trim());
    }
  });
  
  return objectives.length > 0 ? objectives.slice(0, 3) : ['Training objectives'];
}

extractEquipment(content) {
  const equipment = [];
  const equipmentKeywords = ['cones', 'balls', 'goals', 'bibs', 'ladders', 'hurdles', 'markers'];
  
  let text;
  if (Array.isArray(content)) {
    text = content.join(' ').toLowerCase();
  } else if (typeof content === 'string') {
    text = content.toLowerCase();
  } else {
    console.warn('extractEquipment: unexpected content type:', typeof content);
    return ['basic training equipment'];
  }
  
  equipmentKeywords.forEach(item => {
    if (text.includes(item)) {
      equipment.push(item);
    }
  });
  
  return equipment.length > 0 ? equipment : ['basic training equipment'];
}

// Add after the extractEquipment method
extractEquipmentAdvanced(content, sport) {
  const equipmentFound = new Set();
  let textContent;
  
  if (Array.isArray(content)) {
    textContent = content.join(' ').toLowerCase();
  } else {
    textContent = content.toLowerCase();
  }
  
  // Get sport-specific equipment from AIService
  const sportData = AIService.sportsKnowledge[sport] || AIService.sportsKnowledge.general;
  
  // Check all equipment categories
  const allEquipment = [
    ...(sportData.equipment.essential || []),
    ...(sportData.equipment.recommended || []),
    ...(sportData.equipment.advanced || [])
  ];
  
  allEquipment.forEach(item => {
    const itemLower = item.toLowerCase();
    if (textContent.includes(itemLower)) {
      equipmentFound.add(item);
    }
    
    // Check for variations and synonyms
    const variations = this.getEquipmentVariations(item);
    variations.forEach(variation => {
      if (textContent.includes(variation.toLowerCase())) {
        equipmentFound.add(item);
      }
    });
  });
  
  return Array.from(equipmentFound);
}

// Add after existing extractEquipment method
extractSportSpecificEquipment(text, sport) {
  const equipmentFound = [];
  const textLower = text.toLowerCase();
  
  // Get comprehensive equipment list from AIService
  const sportData = AIService.sportsKnowledge[sport] || AIService.sportsKnowledge.general;
  
  // Check essential equipment first
  sportData.equipment.essential.forEach(item => {
    if (textLower.includes(item.toLowerCase())) {
      equipmentFound.push({ item, category: 'essential', priority: 'high' });
    }
  });
  
  // Check recommended equipment
  sportData.equipment.recommended.forEach(item => {
    if (textLower.includes(item.toLowerCase())) {
      equipmentFound.push({ item, category: 'recommended', priority: 'medium' });
    }
  });
  
  // Check advanced equipment
  sportData.equipment.advanced.forEach(item => {
    if (textLower.includes(item.toLowerCase())) {
      equipmentFound.push({ item, category: 'advanced', priority: 'low' });
    }
  });
  
  return equipmentFound;
}

getEquipmentVariations(equipment) {
  const variationsMap = {
    'soccer balls': ['footballs', 'soccer ball', 'football'],
    'cones': ['markers', 'pylons', 'disc cones'],
    'goals': ['posts', 'goalposts', 'nets'],
    'bibs': ['pinnies', 'vests', 'scrimmage vests'],
    'agility ladder': ['speed ladder', 'coordination ladder'],
    'basketballs': ['basketball', 'ball'],
    'hoops': ['baskets', 'rims'],
    'tennis balls': ['tennis ball', 'ball'],
    'rackets': ['racquet', 'tennis racket']
  };
  
  return variationsMap[equipment.toLowerCase()] || [equipment];
}

  extractSessionFocus(content) {
    return this.extractWeekFocus(content);
  }

  // Pattern recognition helpers
// REPLACE the entire isActivity method with this enhanced version:
isActivity(line) {
  if (!line || line.length < 5) return false;
  
  const lineLower = line.toLowerCase().trim();
  
  // Check basic patterns first
  const basicPatterns = [
    /^\d+\./,                    // Numbered list
    /^[A-Z][a-z].*:/,           // Title with colon
    /^\-\s/,                     // Dash list
    /^•\s/,                      // Bullet point
    /^[a-z]\)/                   // Lettered list: a), b)
  ];
  
  if (basicPatterns.some(pattern => pattern.test(line))) {
    return true;
  }
  
  // Check against activity taxonomy
  for (const [category, config] of Object.entries(this.activityTaxonomy)) {
    // Check keywords
    if (config.keywords.some(keyword => lineLower.includes(keyword))) {
      return true;
    }
    
    // Check synonyms (multi-language support)
    if (config.synonyms && config.synonyms.some(syn => lineLower.includes(syn))) {
      return true;
    }
    
    // Check known activities
    if (config.activities && config.activities.some(activity => 
      lineLower.includes(activity.toLowerCase())
    )) {
      return true;
    }
  }
  
  // Check for time indicators (activities often have durations)
  if (/\d+\s*(?:min|minutes?|hrs?|hours?)/.test(lineLower)) {
    return true;
  }
  
  // Check for action verbs common in activities
  const actionVerbs = ['perform', 'execute', 'practice', 'run', 'complete', 'focus on', 'work on'];
  if (actionVerbs.some(verb => lineLower.includes(verb))) {
    return true;
  }
  
  return false;
}

//Add activity classification confidence scoring
  // Add this NEW method after isActivity
classifyActivity(line) {
  const lineLower = line.toLowerCase().trim();
  let bestCategory = 'general';
  let bestScore = 0;
  let confidence = 0;
  
  // Score against each category
  for (const [category, config] of Object.entries(this.activityTaxonomy)) {
    let score = 0;
    
    // Check keywords (weight: 3)
    score += config.keywords.filter(keyword => 
      lineLower.includes(keyword)
    ).length * 3;
    
    // Check synonyms (weight: 2)
    if (config.synonyms) {
      score += config.synonyms.filter(syn => 
        lineLower.includes(syn)
      ).length * 2;
    }
    
    // Check activities (weight: 4)
    if (config.activities) {
      score += config.activities.filter(activity => 
        lineLower.includes(activity.toLowerCase())
      ).length * 4;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // Calculate confidence (0-1 scale)
  confidence = Math.min(bestScore / 10, 1.0);
  
  return {
    category: bestCategory,
    confidence: confidence,
    score: bestScore,
    line: line
  };
}

  isDrill(line) {
    return line.toLowerCase().includes('drill') || 
           line.toLowerCase().includes('exercise') ||
           /^\d+\./.test(line.trim());
  }

  isNote(line) {
    return line.startsWith('*') || 
           line.toLowerCase().includes('note') ||
           line.toLowerCase().includes('emphasize') ||
           line.toLowerCase().includes('encourage');
  }

  isObjective(line) {
    return line.toLowerCase().includes('focus') ||
           line.toLowerCase().includes('objective') ||
           line.toLowerCase().includes('goal') ||
           line.toLowerCase().includes('emphasize');
  }

  extractDrillName(line) {
    // Extract drill name from line
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      return line.substring(0, colonIndex).trim();
    }
    
    const dotIndex = line.indexOf('.');
    if (dotIndex !== -1 && dotIndex < 50) {
      return line.substring(dotIndex + 1, Math.min(line.length, dotIndex + 30)).trim();
    }
    
    return line.substring(0, Math.min(30, line.length)).trim();
  }

  extractDrillDuration(line) {
    const match = line.match(this.sessionPatterns.durationPattern);
    return match ? parseInt(match[1]) : null;
  }

  estimateParticipants(ageGroup) {
    if (ageGroup.includes('individual') || ageGroup.includes('1-on-1')) {
      return 1;
    } else if (ageGroup.includes('small') || ageGroup.includes('youth')) {
      return 12;
    } else {
      return 15;
    }
  }

  // Convert extracted sessions to UpcomingSessions format
  convertToUpcomingSessions(extractedData) {
    const upcomingSessions = [];
    
    extractedData.sessions.forEach(week => {
      week.dailySessions.forEach(session => {
        // Convert to UpcomingSessions format
        const upcomingSession = {
          id: session.id,
          title: session.title,
          time: session.time,
          duration: session.duration,
          date: this.calculateSessionDate(week.weekNumber, session.day),
          location: session.location,
          type: session.type,
          participants: session.participants,
          status: session.status,
          academyName: session.academyName,
          sport: session.sport,
          ageGroup: session.ageGroup,
          difficulty: session.difficulty,
          completionRate: session.completionRate,
          notes: session.notes,
          activities: session.activities,
          drills: session.drills,
          objectives: session.objectives,
          equipment: session.equipment,
          focus: session.focus,
          // Additional fields for session details
          weekNumber: week.weekNumber,
          dayNumber: session.dayNumber,
          rawContent: session.rawContent,
          sourceDocument: extractedData.sourceDocument,
          sourcePlan: extractedData.sourcePlan
        };
        
        upcomingSessions.push(upcomingSession);
      });
    });
    
    return upcomingSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  calculateSessionDate(weekNumber, dayName) {
    const today = new Date();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .indexOf(dayName.toLowerCase());
    
    // Calculate the date for this session
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (weekNumber - 1) * 7);
    
    // Adjust to the correct day of week
    const currentDay = targetDate.getDay();
    const daysToAdd = (dayIndex - currentDay + 7) % 7;
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    
    return targetDate.toISOString().split('T')[0];
  }

  // Get extraction statistics
  getExtractionStats(extractedData) {
    return {
      totalWeeks: extractedData.totalWeeks,
      totalSessions: extractedData.totalSessions,
      averageSessionsPerWeek: Math.round(extractedData.totalSessions / extractedData.totalWeeks),
      totalDuration: extractedData.sessions.reduce((sum, week) => sum + week.totalDuration, 0),
      sports: [extractedData.academyInfo.sport],
      ageGroups: [extractedData.academyInfo.ageGroup],
      equipment: [...new Set(
        extractedData.sessions.flatMap(week => 
          week.dailySessions.flatMap(session => session.equipment)
        )
      )],
      focus: [...new Set(
        extractedData.sessions.flatMap(week => 
          week.dailySessions.flatMap(session => session.focus)
        )
      )]
    };
  }
}

export default new SessionExtractor();