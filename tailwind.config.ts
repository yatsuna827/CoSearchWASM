import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        appear: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        disappear: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        pulsate: {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
      animation: {
        appear: 'appear 1.5s ease 2s 1 forwards',
        disappear: 'disappear 3s ease 0s 1 forwards',
        pulsate: 'pulsate .5s linear forwards',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-poke-ball': 'linear-gradient(red 46%, black 46%, black 54%, white 54%)',
      },
    },
  },
  plugins: [],
} satisfies Config
