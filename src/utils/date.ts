export const getCurrentDateTimeBrasiliaISO = (): string => {
  const now = new Date();
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return brasiliaTime.toISOString();
};

export const formatDateTimeBrasilia = (dateString: string): string => {
  let date: Date;
  if (dateString.includes('T') || dateString.length > 10) {
    // If it has time, parse as is (assuming UTC or ISO)
    date = new Date(dateString);
  } else {
    // If date only (YYYY-MM-DD), parse as local date
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day); // Local timezone
  }
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDateBrasilia = (dateString: string): string => {
  let date: Date;
  if (dateString.includes('T') || dateString.length > 10) {
    date = new Date(dateString);
  } else {
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
