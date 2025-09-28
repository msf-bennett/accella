// PersonalEvents.js - Event and Calendar Management Database
import AsyncStorage from '@react-native-async-storage/async-storage';

// Event types
export const EVENT_TYPES = {
  TRAINING_SESSION: 'training_session',
  GROUP_TRAINING: 'group_training',
  MATCH: 'match',
  TOURNAMENT: 'tournament',
  ASSESSMENT: 'assessment',
  MEETING: 'meeting',
  CAMP: 'camp',
  WORKSHOP: 'workshop',
  PERSONAL: 'personal',
  BREAK: 'break',
  AVAILABILITY: 'availability',
};

// Event status
export const EVENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
};

// Recurrence types
export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
};

// Reminder types
export const REMINDER_TYPES = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app',
};

class PersonalEvents {
  constructor() {
    this.events = new Map();
    this.userEvents = new Map(); // userId -> event IDs
    this.eventAttendees = new Map(); // eventId -> attendee data
    this.eventNotes = new Map(); // eventId -> notes
    this.eventRecurrence = new Map(); // eventId -> recurrence rules
    this.eventReminders = new Map(); // eventId -> reminder settings
    this.availabilitySlots = new Map(); // userId -> availability slots
    this.initialized = false;
  }

  // Initialize the database
  async initialize() {
    if (this.initialized) return;

    try {
      // Load data from AsyncStorage
      const storedEvents = await AsyncStorage.getItem('personal_events');
      const storedUserEvents = await AsyncStorage.getItem('user_events_mapping');
      const storedAttendees = await AsyncStorage.getItem('event_attendees');
      const storedNotes = await AsyncStorage.getItem('event_notes');
      const storedRecurrence = await AsyncStorage.getItem('event_recurrence');
      const storedReminders = await AsyncStorage.getItem('event_reminders');
      const storedAvailability = await AsyncStorage.getItem('availability_slots');

      if (storedEvents) {
        const eventsArray = JSON.parse(storedEvents);
        eventsArray.forEach(event => {
          this.events.set(event.id, event);
        });
      }

      if (storedUserEvents) {
        const userEventsArray = JSON.parse(storedUserEvents);
        userEventsArray.forEach(mapping => {
          this.userEvents.set(mapping.userId, mapping.eventIds);
        });
      }

      if (storedAttendees) {
        const attendeesArray = JSON.parse(storedAttendees);
        attendeesArray.forEach(attendee => {
          this.eventAttendees.set(attendee.eventId, attendee.attendees);
        });
      }

      if (storedNotes) {
        const notesArray = JSON.parse(storedNotes);
        notesArray.forEach(note => {
          this.eventNotes.set(note.eventId, note.notes);
        });
      }

      if (storedRecurrence) {
        const recurrenceArray = JSON.parse(storedRecurrence);
        recurrenceArray.forEach(rec => {
          this.eventRecurrence.set(rec.eventId, rec.rules);
        });
      }

      if (storedReminders) {
        const remindersArray = JSON.parse(storedReminders);
        remindersArray.forEach(reminder => {
          this.eventReminders.set(reminder.eventId, reminder.settings);
        });
      }

      if (storedAvailability) {
        const availabilityArray = JSON.parse(storedAvailability);
        availabilityArray.forEach(avail => {
          this.availabilitySlots.set(avail.userId, avail.slots);
        });
      }

      // Generate mock events if no data exists
      if (this.events.size === 0) {
        await this.generateMockEvents();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize PersonalEvents:', error);
      await this.generateMockEvents();
      this.initialized = true;
    }
  }

  // Create new event
  async createEvent(eventData) {
    await this.initialize();

    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newEvent = {
      id: eventId,
      title: eventData.title,
      description: eventData.description || '',
      type: eventData.type || EVENT_TYPES.TRAINING_SESSION,
      status: eventData.status || EVENT_STATUS.SCHEDULED,
      
      // Date and time
      startTime: new Date(eventData.startTime).toISOString(),
      endTime: new Date(eventData.endTime).toISOString(),
      timeZone: eventData.timeZone || 'UTC',
      allDay: eventData.allDay || false,
      
      // Location
      location: eventData.location || {},
      isVirtual: eventData.isVirtual || false,
      virtualLink: eventData.virtualLink || null,
      
      // Organizer and participants
      organizerId: eventData.organizerId,
      participantIds: eventData.participantIds || [],
      maxParticipants: eventData.maxParticipants || null,
      
      // Session details (for training sessions)
      sport: eventData.sport || null,
      skillLevel: eventData.skillLevel || null,
      sessionPlan: eventData.sessionPlan || null,
      equipment: eventData.equipment || [],
      objectives: eventData.objectives || [],
      
      // Pricing (for paid sessions)
      price: eventData.price || 0,
      currency: eventData.currency || 'USD',
      paymentStatus: eventData.paymentStatus || 'pending',
      
      // Metadata
      tags: eventData.tags || [],
      color: eventData.color || '#667eea',
      priority: eventData.priority || 'medium',
      isPrivate: eventData.isPrivate || false,
      
      // System fields
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: eventData.createdBy || eventData.organizerId,
    };

    this.events.set(eventId, newEvent);

    // Add to user events mapping
    await this.addEventToUser(eventData.organizerId, eventId);
    
    // Add participants to user events mapping
    if (eventData.participantIds) {
      for (const participantId of eventData.participantIds) {
        await this.addEventToUser(participantId, eventId);
      }
    }

    // Set up recurrence if specified
    if (eventData.recurrence && eventData.recurrence.type !== RECURRENCE_TYPES.NONE) {
      await this.setEventRecurrence(eventId, eventData.recurrence);
    }

    // Set up reminders if specified
    if (eventData.reminders) {
      await this.setEventReminders(eventId, eventData.reminders);
    }

    await this.saveEvents();
    return newEvent;
  }

  // Update event
  async updateEvent(eventId, updates) {
    await this.initialize();
    
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const updatedEvent = {
      ...event,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.events.set(eventId, updatedEvent);
    await this.saveEvents();

    return updatedEvent;
  }

  // Delete event
  async deleteEvent(eventId, deleteRecurring = false) {
    await this.initialize();
    
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Remove from user events mappings
    for (const [userId, eventIds] of this.userEvents.entries()) {
      const updatedEventIds = eventIds.filter(id => id !== eventId);
      this.userEvents.set(userId, updatedEventIds);
    }

    // Remove related data
    this.events.delete(eventId);
    this.eventAttendees.delete(eventId);
    this.eventNotes.delete(eventId);
    this.eventRecurrence.delete(eventId);
    this.eventReminders.delete(eventId);

    // Handle recurring events
    if (deleteRecurring && event.recurrenceGroupId) {
      const recurringEvents = Array.from(this.events.values()).filter(
        e => e.recurrenceGroupId === event.recurrenceGroupId
      );
      
      for (const recurringEvent of recurringEvents) {
        await this.deleteEvent(recurringEvent.id, false);
      }
    }

    await this.saveEvents();
    await this.saveUserEvents();
    await this.saveAttendees();
    await this.saveNotes();
    await this.saveRecurrence();
    await this.saveReminders();

    return true;
  }

  // Get event by ID
  async getEventById(eventId) {
    await this.initialize();
    return this.events.get(eventId);
  }

  // Get user events
  async getUserEvents(userId, filters = {}) {
    await this.initialize();
    
    const userEventIds = this.userEvents.get(userId) || [];
    let userEvents = userEventIds.map(id => this.events.get(id)).filter(Boolean);

    // Apply filters
    if (filters.type) {
      userEvents = userEvents.filter(event => event.type === filters.type);
    }

    if (filters.status) {
      userEvents = userEvents.filter(event => event.status === filters.status);
    }

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      userEvents = userEvents.filter(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        
        return (eventStart >= startDate && eventStart <= endDate) ||
               (eventEnd >= startDate && eventEnd <= endDate) ||
               (eventStart <= startDate && eventEnd >= endDate);
      });
    }

    if (filters.sport) {
      userEvents = userEvents.filter(event => event.sport === filters.sport);
    }

    // Sort by start time
    userEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return userEvents;
  }

  // Get events by date range
  async getEventsByDateRange(startDate, endDate, filters = {}) {
    await this.initialize();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let events = Array.from(this.events.values()).filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return (eventStart >= start && eventStart <= end) ||
             (eventEnd >= start && eventEnd <= end) ||
             (eventStart <= start && eventEnd >= end);
    });

    // Apply additional filters
    if (filters.userId) {
      const userEventIds = this.userEvents.get(filters.userId) || [];
      events = events.filter(event => userEventIds.includes(event.id));
    }

    if (filters.type) {
      events = events.filter(event => event.type === filters.type);
    }

    if (filters.status) {
      events = events.filter(event => event.status === filters.status);
    }

    return events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  // Get today's events
  async getTodaysEvents(userId = null) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return this.getEventsByDateRange(startOfDay, endOfDay, { userId });
  }

  // Get upcoming events
  async getUpcomingEvents(userId = null, daysAhead = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));

    return this.getEventsByDateRange(now, futureDate, { userId });
  }

  // Add participant to event
  async addParticipant(eventId, participantId) {
    await this.initialize();
    
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.participantIds.includes(participantId)) {
      throw new Error('Participant already added to event');
    }

    if (event.maxParticipants && event.participantIds.length >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    event.participantIds.push(participantId);
    event.updatedAt = new Date().toISOString();

    this.events.set(eventId, event);
    await this.addEventToUser(participantId, eventId);
    await this.saveEvents();

    return event;
  }

  // Remove participant from event
  async removeParticipant(eventId, participantId) {
    await this.initialize();
    
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.participantIds = event.participantIds.filter(id => id !== participantId);
    event.updatedAt = new Date().toISOString();

    this.events.set(eventId, event);
    await this.removeEventFromUser(participantId, eventId);
    await this.saveEvents();

    return event;
  }

  // Set event attendance
  async setEventAttendance(eventId, attendanceData) {
    await this.initialize();
    
    const attendance = {
      eventId,
      attendees: attendanceData.map(data => ({
        userId: data.userId,
        status: data.status, // 'present', 'absent', 'late', 'excused'
        checkInTime: data.checkInTime || null,
        checkOutTime: data.checkOutTime || null,
        notes: data.notes || '',
        recordedBy: data.recordedBy,
        recordedAt: new Date().toISOString(),
      })),
      updatedAt: new Date().toISOString(),
    };

    this.eventAttendees.set(eventId, attendance);
    await this.saveAttendees();

    return attendance;
  }

  // Get event attendance
  async getEventAttendance(eventId) {
    await this.initialize();
    return this.eventAttendees.get(eventId);
  }

  // Add event notes
  async addEventNotes(eventId, notes) {
    await this.initialize();
    
    const existingNotes = this.eventNotes.get(eventId) || [];
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: notes.content,
      author: notes.author,
      isPrivate: notes.isPrivate || false,
      tags: notes.tags || [],
      createdAt: new Date().toISOString(),
    };

    existingNotes.push(newNote);
    this.eventNotes.set(eventId, existingNotes);
    await this.saveNotes();

    return newNote;
  }

  // Get event notes
  async getEventNotes(eventId, userId = null) {
    await this.initialize();
    
    const notes = this.eventNotes.get(eventId) || [];
    
    // Filter private notes if user is not the author
    if (userId) {
      return notes.filter(note => !note.isPrivate || note.author === userId);
    }
    
    return notes.filter(note => !note.isPrivate);
  }

  // Set event recurrence
  async setEventRecurrence(eventId, recurrenceRules) {
    await this.initialize();
    
    const rules = {
      eventId,
      type: recurrenceRules.type,
      interval: recurrenceRules.interval || 1,
      daysOfWeek: recurrenceRules.daysOfWeek || [],
      endDate: recurrenceRules.endDate || null,
      occurrences: recurrenceRules.occurrences || null,
      exceptions: recurrenceRules.exceptions || [],
      groupId: recurrenceRules.groupId || `recurrence_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.eventRecurrence.set(eventId, rules);
    
    // Generate recurring events
    if (rules.type !== RECURRENCE_TYPES.NONE) {
      await this.generateRecurringEvents(eventId, rules);
    }

    await this.saveRecurrence();
    return rules;
  }

  // Set event reminders
  async setEventReminders(eventId, reminders) {
    await this.initialize();
    
    const reminderSettings = {
      eventId,
      reminders: reminders.map(reminder => ({
        type: reminder.type,
        timing: reminder.timing, // minutes before event
        message: reminder.message || null,
        isActive: reminder.isActive !== false,
        recipients: reminder.recipients || [], // user IDs
      })),
      updatedAt: new Date().toISOString(),
    };

    this.eventReminders.set(eventId, reminderSettings);
    await this.saveReminders();

    return reminderSettings;
  }

  // Set user availability
  async setUserAvailability(userId, availability) {
    await this.initialize();
    
    const availabilitySlots = {
      userId,
      slots: availability.map(slot => ({
        id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dayOfWeek: slot.dayOfWeek, // 0 = Sunday, 1 = Monday, etc.
        startTime: slot.startTime, // HH:MM format
        endTime: slot.endTime, // HH:MM format
        isRecurring: slot.isRecurring !== false,
        startDate: slot.startDate || null,
        endDate: slot.endDate || null,
        exceptions: slot.exceptions || [], // specific dates to exclude
        isActive: slot.isActive !== false,
      })),
      timezone: availability.timezone || 'UTC',
      updatedAt: new Date().toISOString(),
    };

    this.availabilitySlots.set(userId, availabilitySlots);
    await this.saveAvailability();

    return availabilitySlots;
  }

  // Get user availability
  async getUserAvailability(userId, dateRange = null) {
    await this.initialize();
    
    const availability = this.availabilitySlots.get(userId);
    if (!availability || !dateRange) {
      return availability;
    }

    // Filter availability by date range if provided
    const { startDate, endDate } = dateRange;
    const filteredSlots = availability.slots.filter(slot => {
      if (!slot.startDate || !slot.endDate) return true;
      
      const slotStart = new Date(slot.startDate);
      const slotEnd = new Date(slot.endDate);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      
      return (slotStart <= rangeEnd && slotEnd >= rangeStart);
    });

    return {
      ...availability,
      slots: filteredSlots,
    };
  }

  // Find available time slots
  async findAvailableSlots(userId, duration, dateRange, excludeEventIds = []) {
    await this.initialize();
    
    const availability = await this.getUserAvailability(userId, dateRange);
    const userEvents = await this.getUserEvents(userId, {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    // Filter out excluded events
    const relevantEvents = userEvents.filter(event => !excludeEventIds.includes(event.id));
    
    const availableSlots = [];
    
    // This would contain complex logic to calculate available time slots
    // considering user's availability, existing events, and duration requirements
    
    return availableSlots;
  }

  // Helper methods
  async addEventToUser(userId, eventId) {
    const userEventIds = this.userEvents.get(userId) || [];
    if (!userEventIds.includes(eventId)) {
      userEventIds.push(eventId);
      this.userEvents.set(userId, userEventIds);
      await this.saveUserEvents();
    }
  }

  async removeEventFromUser(userId, eventId) {
    const userEventIds = this.userEvents.get(userId) || [];
    const updatedEventIds = userEventIds.filter(id => id !== eventId);
    this.userEvents.set(userId, updatedEventIds);
    await this.saveUserEvents();
  }

  async generateRecurringEvents(baseEventId, recurrenceRules) {
    const baseEvent = this.events.get(baseEventId);
    if (!baseEvent) return;

    const generatedEvents = [];
    const startDate = new Date(baseEvent.startTime);
    const endDate = recurrenceRules.endDate ? new Date(recurrenceRules.endDate) : 
                   new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year default

    // Generate recurring events based on rules
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;
    
    while (currentDate <= endDate && 
           (!recurrenceRules.occurrences || occurrenceCount < recurrenceRules.occurrences)) {
      
      if (currentDate > startDate) { // Skip the base event
        const recurringEvent = {
          ...baseEvent,
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          startTime: new Date(currentDate).toISOString(),
          endTime: new Date(currentDate.getTime() + 
                   (new Date(baseEvent.endTime) - new Date(baseEvent.startTime))).toISOString(),
          recurrenceGroupId: recurrenceRules.groupId,
          parentEventId: baseEventId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.events.set(recurringEvent.id, recurringEvent);
        generatedEvents.push(recurringEvent);

        // Add to user events
        await this.addEventToUser(recurringEvent.organizerId, recurringEvent.id);
        for (const participantId of recurringEvent.participantIds) {
          await this.addEventToUser(participantId, recurringEvent.id);
        }
      }

      // Calculate next occurrence
      switch (recurrenceRules.type) {
        case RECURRENCE_TYPES.DAILY:
          currentDate.setDate(currentDate.getDate() + recurrenceRules.interval);
          break;
        case RECURRENCE_TYPES.WEEKLY:
          currentDate.setDate(currentDate.getDate() + (7 * recurrenceRules.interval));
          break;
        case RECURRENCE_TYPES.BIWEEKLY:
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case RECURRENCE_TYPES.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + recurrenceRules.interval);
          break;
        default:
          break;
      }

      occurrenceCount++;
    }

    return generatedEvents;
  }

  // Generate mock events for development
  async generateMockEvents() {
    const mockEvents = [];
    const eventTypes = Object.values(EVENT_TYPES);
    const sports = ['Football', 'Basketball', 'Tennis', 'Swimming', 'Athletics'];
    
    for (let i = 1; i <= 50; i++) {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + Math.floor(Math.random() * 60) - 30);
      startTime.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + Math.floor(Math.random() * 3) + 1);
      
      const event = await this.createEvent({
        title: `${sports[Math.floor(Math.random() * sports.length)]} Training Session`,
        description: 'Mock training session for development',
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        status: Object.values(EVENT_STATUS)[Math.floor(Math.random() * Object.values(EVENT_STATUS).length)],
        startTime,
        endTime,
        organizerId: `coach_${Math.floor(Math.random() * 20) + 1}`,
        participantIds: [`player_${Math.floor(Math.random() * 30) + 1}`],
        sport: sports[Math.floor(Math.random() * sports.length)],
        price: Math.floor(Math.random() * 100) + 25,
        location: {
          name: 'Training Center',
          address: '123 Sports Ave',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        createdBy: `coach_${Math.floor(Math.random() * 20) + 1}`,
      });
      
      mockEvents.push(event);
    }
    
    return mockEvents;
  }

  // Data persistence methods
  async saveEvents() {
    try {
      const eventsArray = Array.from(this.events.values());
      await AsyncStorage.setItem('personal_events', JSON.stringify(eventsArray));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  }

  async saveUserEvents() {
    try {
      const userEventsArray = Array.from(this.userEvents.entries()).map(([userId, eventIds]) => ({
        userId,
        eventIds,
      }));
      await AsyncStorage.setItem('user_events_mapping', JSON.stringify(userEventsArray));
    } catch (error) {
      console.error('Failed to save user events:', error);
    }
  }

  async saveAttendees() {
    try {
      const attendeesArray = Array.from(this.eventAttendees.entries()).map(([eventId, attendees]) => ({
        eventId,
        attendees,
      }));
      await AsyncStorage.setItem('event_attendees', JSON.stringify(attendeesArray));
    } catch (error) {
      console.error('Failed to save attendees:', error);
    }
  }

  async saveNotes() {
    try {
      const notesArray = Array.from(this.eventNotes.entries()).map(([eventId, notes]) => ({
        eventId,
        notes,
      }));
      await AsyncStorage.setItem('event_notes', JSON.stringify(notesArray));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }

  async saveRecurrence() {
    try {
      const recurrenceArray = Array.from(this.eventRecurrence.entries()).map(([eventId, rules]) => ({
        eventId,
        rules,
      }));
      await AsyncStorage.setItem('event_recurrence', JSON.stringify(recurrenceArray));
    } catch (error) {
      console.error('Failed to save recurrence:', error);
    }
  }

  async saveReminders() {
    try {
      const remindersArray = Array.from(this.eventReminders.entries()).map(([eventId, settings]) => ({
        eventId,
        settings,
      }));
      await AsyncStorage.setItem('event_reminders', JSON.stringify(remindersArray));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  async saveAvailability() {
    try {
      const availabilityArray = Array.from(this.availabilitySlots.entries()).map(([userId, slots]) => ({
        userId,
        slots,
      }));
      await AsyncStorage.setItem('availability_slots', JSON.stringify(availabilityArray));
    } catch (error) {
      console.error('Failed to save availability:', error);
    }
  }

  // Clear all data (for testing)
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        'personal_events',
        'user_events_mapping',
        'event_attendees',
        'event_notes',
        'event_recurrence',
        'event_reminders',
        'availability_slots',
      ]);
      
      this.events.clear();
      this.userEvents.clear();
      this.eventAttendees.clear();
      this.eventNotes.clear();
      this.eventRecurrence.clear();
      this.eventReminders.clear();
      this.availabilitySlots.clear();
      this.initialized = false;
    } catch (error) {
      console.error('Failed to clear events data:', error);
    }
  }
}

// Create and export singleton instance
const personalEvents = new PersonalEvents();

export default personalEvents;
export { EVENT_TYPES, EVENT_STATUS, RECURRENCE_TYPES, REMINDER_TYPES };