import React, { createContext, useContext, useState, useCallback } from 'react';
import DocumentProcessor from '../services/DocumentProcessor';
import SessionExtractor from '../services/SessionExtractor';
import { calculateSessionCounts } from '../utils/sessionCounters';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionCounts, setSessionCounts] = useState({
    total: 0,
    today: 0,
    tomorrow: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshSessionCounts = useCallback(async (todaySchedule = []) => {
    try {
      setLoading(true);
      const plans = await DocumentProcessor.getTrainingPlans();
      const extractedSessions = [];
      
      for (const plan of plans) {
        if (plan.sourceDocument) {
          const documents = await DocumentProcessor.getStoredDocuments();
          const sourceDoc = documents.find(doc => doc.id === plan.sourceDocument);
          
          if (sourceDoc) {
            const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, plan);
            
            if (extractionResult?.sessions) {
              extractionResult.sessions.forEach((weekSession) => {
                if (weekSession.dailySessions?.length > 0) {
                  weekSession.dailySessions.forEach((dailySession) => {
                    extractedSessions.push({
                      id: `daily_${dailySession.id}`,
                      date: dailySession.date,
                      time: dailySession.time
                    });
                  });
                }
              });
            }
          }
        }
      }
      
      const counts = calculateSessionCounts(extractedSessions, todaySchedule);
      setSessionCounts(counts);
      setAllSessions(extractedSessions);
      
      return counts;
    } catch (error) {
      console.error('Error refreshing session counts:', error);
      return sessionCounts;
    } finally {
      setLoading(false);
    }
  }, [sessionCounts]);

  return (
    <SessionContext.Provider value={{ 
      sessionCounts, 
      allSessions,
      loading,
      refreshSessionCounts 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionCounts = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionCounts must be used within SessionProvider');
  }
  return context;
};