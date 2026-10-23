export const colors = {
  background: '#F8FAFC', // slate-50
  card: '#FFFFFF',
  border: '#E2E8F0', // slate-200
  borderDark: '#CBD5E1', // slate-300
  textPrimary: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94A3B8', // slate-400
  
  primary: '#F59E0B', // amber-500
  primaryDark: '#B45309', // amber-700
  primaryLight: '#FEF3C7', // amber-100
  
  success: '#10B981', // emerald-500
  successDark: '#047857', // emerald-700
  successLight: '#D1FAE5', // emerald-100
  
  danger: '#EF4444', // red-500
  dangerDark: '#B91C1C', // red-700
  dangerLight: '#FEE2E2', // red-100
  
  info: '#0EA5E9', // sky-500
  infoLight: '#E0F2FE', // sky-100
};

export const typography = {
  h1: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  h2: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 13, color: colors.textSecondary },
  caption: { fontSize: 11, color: colors.textMuted },
  mono: { fontFamily: 'Courier', fontSize: 11 },
};
