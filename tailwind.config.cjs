module.exports = {
  content: ['./index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          150: '#EBEFF5',
          950: '#0A0F1D',
        },
        cyan: {
          cyber: '#0891B2',
          glow: '#06B6D4',
        },
        blue: {
          electric: '#2563EB',
          deep: '#1D4ED8',
        },
        emerald: {
          cta: '#10B981',
          ctaHover: '#059669',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
};
