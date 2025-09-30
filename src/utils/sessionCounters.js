export const calculateSessionCounts = (sessions, todaySchedule = []) => {
  const now = new Date();
  const today = now.toDateString();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const allSessions = [...sessions, ...todaySchedule];
  
  return {
    total: allSessions.length,  // Return total
    today: allSessions.filter(s => {
      const sessionDate = new Date(s.date || s.time);
      return sessionDate.toDateString() === today;
    }).length,
    tomorrow: allSessions.filter(s => {
      const sessionDate = new Date(s.date || s.time);
      return sessionDate.toDateString() === tomorrow;
    }).length,
    thisWeek: allSessions.filter(s => {
      const sessionDate = new Date(s.date || s.time);
      return sessionDate >= now && sessionDate <= weekEnd;
    }).length,
    thisMonth: allSessions.filter(s => {
      const sessionDate = new Date(s.date || s.time);
      return sessionDate >= now && sessionDate <= monthEnd;
    }).length
  };
};
