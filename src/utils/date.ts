export const getCurrentDateTimeBrasiliaISO = (): string => {
  // Get current UTC time
  const now = new Date();
  // Brasília is UTC-3, so subtract 3 hours from UTC
  const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
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

export const diasInatividade = (dataUltimaInteracao: string): number => {
  return Math.floor((Date.now() - new Date(dataUltimaInteracao).getTime()) / (1000 * 60 * 60 * 24));
};

export const daysDifference = (date1: Date, date2: Date): number => {
  return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
};

export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  if (dateString.includes('-')) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
};
