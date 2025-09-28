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
  }

// Main extraction method
// Replace the existing extractSessionsFromDocument method in SessionExtractor.js
async extractSessionsFromDocument(document, trainingPlan) {
  try {
    PlatformUtils.logDebugInfo('Starting enhanced AI session extraction', {
      documentId: document.id,
      planId: trainingPlan.id
    });

    // Get DocumentProcessor and extract text
    const DocumentProcessor = (await import('./DocumentProcessor')).default;
    const extractionResult = await DocumentProcessor.extractDocumentText(document);
    const text = extractionResult.text;

    // NEW: Enhanced document structure analysis
    const structureAnalysis = await DocumentProcessor.analyzeDocumentStructure(text, document);
    
    console.log('Enhanced structure analysis:', structureAnalysis);

    // Extract academy info with structure context
    const academyInfo = this.extractAcademyInfo(text, trainingPlan, structureAnalysis);
    
    // NEW: Smart session extraction based on structure
    const sessions = await this.extractSessionsWithStructureAwareness(text, structureAnalysis, academyInfo);
    
    // AI Enhancement with structure context
    let enhancedSessions = sessions;
    try {
      enhancedSessions = await AIService.enhanceExtractedSessions(sessions, {
        ageGroup: academyInfo.ageGroup,
        sport: academyInfo.sport,
        experience: trainingPlan.difficulty || 'beginner',
        structureContext: structureAnalysis
      });
      console.log('Sessions enhanced with AI and structure awareness');
    } catch (error) {
      console.warn('AI enhancement failed, using structure-aware sessions:', error);
    }

    // Generate optimal schedule with structure insights
    let optimizedSchedule = null;
    try {
      const schedulePreferences = this.deriveSchedulePreferences(structureAnalysis);
      optimizedSchedule = await AIService.generateOptimalSchedule(trainingPlan, schedulePreferences);
      console.log('Structure-aware schedule generated');
    } catch (error) {
      console.warn('Schedule generation failed:', error);
    }

    const result = {
      academyInfo,
      sessions: enhancedSessions,
      optimizedSchedule,
      structureAnalysis, // NEW: Include structure analysis
      totalWeeks: enhancedSessions.length,
      totalSessions: enhancedSessions.reduce((sum, week) => sum + week.dailySessions.length, 0),
      extractedAt: new Date().toISOString(),
      sourceDocument: document.id,
      sourcePlan: trainingPlan.id,
      aiEnhanced: enhancedSessions !== sessions,
      aiScheduled: !!optimizedSchedule,
      structureAware: true // NEW: Flag for structure-aware extraction
    };

    PlatformUtils.logDebugInfo('Enhanced session extraction completed', {
      totalWeeks: result.totalWeeks,
      totalSessions: result.totalSessions,
      structureLevel: structureAnalysis.organizationLevel.level,
      aiEnhanced: result.aiEnhanced,
      structureAware: result.structureAware
    });

    return result;
  } catch (error) {
    console.error('Enhanced session extraction failed:', error);
    throw PlatformUtils.handlePlatformError(error, 'Enhanced Session Extraction');
  }
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
      content: text.substring(startPos, endPos),
      startPosition: startPos,
      endPosition: endPos
    });
  }
  
  return weekSections;
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

identifySessionType(content, dayInfo) {
  const nearbyText = content.substring(
    Math.max(0, dayInfo.position - 100),
    Math.min(content.length, dayInfo.position + 200)
  ).toLowerCase();
  
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
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for the week header line
  for (const line of lines.slice(0, 5)) { // Check first 5 lines
    if (line.toLowerCase().includes(`week ${weekNumber}`) || 
        line.toLowerCase().includes(`week${weekNumber}`)) {
      // Clean up the title
      return line
        .replace(/^week\s*\d+[:\-–—]?\s*/i, '')
        .replace(/[:\-–—]/g, '')
        .trim() || `Week ${weekNumber} Training`;
    }
  }
  
  return `Week ${weekNumber} Training`;
}

extractWeekDescription(content) {
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 20 && !this.isHeaderLine(line));
  
  // Take first 2-3 meaningful lines as description
  const descriptionLines = lines.slice(0, 3);
  const description = descriptionLines.join(' ').substring(0, 200);
  
  return description || 'Training week focused on skill development and physical conditioning.';
}

extractWeekFocus(content) {
  const focusKeywords = [
    'shooting', 'passing', 'dribbling', 'defending', 'tactics', 
    'fitness', 'conditioning', 'technique', 'teamwork', 'strategy',
    'coordination', 'agility', 'strength', 'endurance', 'flexibility'
  ];
  
  const lowerContent = content.toLowerCase();
  const foundFocus = focusKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  return foundFocus.slice(0, 3);
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
      id: `week_${weekNum}_basic_${Date.now()}`,
      weekNumber: weekNum,
      title: `Week ${weekNum} Training`,
      description: `Training focus for week ${weekNum}`,
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
  
  content.forEach(line => {
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
    
    content.forEach(line => {
      if (this.isActivity(line)) {
        activities.push(line.trim());
      }
    });
    
    return activities.slice(0, 5); // Limit to top 5 activities
  }

  extractDrills(content) {
    const drills = [];
    
    content.forEach(line => {
      if (this.isDrill(line)) {
        const drill = {
          name: this.extractDrillName(line),
          description: line.trim(),
          duration: this.extractDrillDuration(line)
        };
        drills.push(drill);
      }
    });
    
    return drills;
  }

  extractObjectives(content) {
    const objectives = [];
    
    content.forEach(line => {
      if (this.isObjective(line)) {
        objectives.push(line.trim());
      }
    });
    
    return objectives.slice(0, 3);
  }

  extractEquipment(content) {
    const equipment = [];
    const equipmentKeywords = ['cones', 'balls', 'goals', 'bibs', 'ladders', 'hurdles', 'markers'];
    
    const text = content.join(' ').toLowerCase();
    equipmentKeywords.forEach(item => {
      if (text.includes(item)) {
        equipment.push(item);
      }
    });
    
    return equipment;
  }

  extractWeekDescription(content) {
    const meaningfulLines = content.filter(line => 
      line.length > 20 && 
      !this.sessionPatterns.weekPattern.test(line) &&
      !this.isActivity(line)
    );
    
    return meaningfulLines.slice(0, 2).join(' ').substring(0, 200) + '...';
  }

  extractWeekFocus(content) {
    const focus = [];
    const focusKeywords = ['shooting', 'passing', 'dribbling', 'defending', 'tactics', 'fitness'];
    
    const text = content.join(' ').toLowerCase();
    focusKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        focus.push(keyword);
      }
    });
    
    return focus.slice(0, 3);
  }

  extractSessionFocus(content) {
    return this.extractWeekFocus(content);
  }

  // Pattern recognition helpers
  isActivity(line) {
    const activityPatterns = [
      /^\d+\./,  // Numbered list
      /^[A-Z][a-z].*:/, // Title with colon
      /drill|exercise|activity|practice/i,
      /warm.*up|cool.*down/i
    ];
    
    return activityPatterns.some(pattern => pattern.test(line.trim()));
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
