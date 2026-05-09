// CROOPIC App — Design Tokens & Color System

export const COLORS = {
  // Primary green palette
  primary:       '#2ECC71',
  primaryDark:   '#27AE60',
  primaryLight:  '#A8F0C6',

  // Accent
  accent:        '#F39C12',
  accentLight:   '#FDEBD0',

  // Danger
  danger:        '#E74C3C',
  dangerLight:   '#FADBD8',

  // Warning
  warning:       '#F39C12',
  warningLight:  '#FDEBD0',

  // Backgrounds
  bg:            '#0D1117',
  bgCard:        '#161B22',
  bgCardLight:   '#1E2630',
  bgModal:       '#1A2030',

  // Text
  textPrimary:   '#ECEFF4',
  textSecondary: '#8B9BB4',
  textMuted:     '#4A5568',

  // Borders
  border:        '#2D3748',
  borderLight:   '#374151',

  // Severity colors
  severityHigh:   '#E74C3C',
  severityMedium: '#F39C12',
  severityLow:    '#3498DB',
  severityNone:   '#2ECC71',

  // Gradients (used with LinearGradient)
  gradientPrimary: ['#2ECC71', '#27AE60'],
  gradientCard:    ['#161B22', '#1E2630'],
  gradientHero:    ['#0D1117', '#162032'],
  gradientDanger:  ['#E74C3C', '#C0392B'],
};

export const FONTS = {
  regular:    'System',
  medium:     'System',
  bold:       'System',
  sizes: {
    xs:   10,
    sm:   12,
    base: 14,
    md:   16,
    lg:   18,
    xl:   22,
    xxl:  28,
    hero: 36,
  },
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 999,
};
