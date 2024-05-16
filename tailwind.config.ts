import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      height:{
        '36': '2.25rem'
      },
      colors:{
        'light-grey': '#f4f4f4',
        'medium-grey':'#c1c1c1',
        'dark-grey': '#CCCCCC',

      },
      borderRadius:{
        '20':'1.25rem'
      },
      fontSize:{
        '32': '2rem'
      },
      spacing:{
        '15': '3.75rem',
        '7px': '7px',
        '46px':'2.87rem',
        '25px':'1.56rem'
      }
    },
  },
  plugins: [],
} satisfies Config;
