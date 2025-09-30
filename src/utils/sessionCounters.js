export const calculateSessionCounts = (sessions, todaySchedule = []) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const allSessions = [...sessions, ...todaySchedule];
  
  const parseDate = (session) => {
    const dateStr = session.date || session.time;
    const parsed = new Date(dateStr);
    parsed.setHours(0, 0, 0, 0);
    return parsed;
  };
  
  return {
    total: allSessions.length,
    today: allSessions.filter(s => {
      const sessionDate = parseDate(s);
      return sessionDate.getTime() === now.getTime();
    }).length,
    tomorrow: allSessions.filter(s => {
      const sessionDate = parseDate(s);
      return sessionDate.getTime() === tomorrow.getTime();
    }).length,
    thisWeek: allSessions.filter(s => {
      const sessionDate = parseDate(s);
      return sessionDate >= now && sessionDate <= weekEnd;
    }).length,
    thisMonth: allSessions.filter(s => {
      const sessionDate = parseDate(s);
      return sessionDate >= now && sessionDate <= monthEnd;
    }).length
  };
};