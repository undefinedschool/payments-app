module.exports = {
  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
        worksans: ['Work Sans', 'sans-serif'],
      },
    },
    customForms: theme => ({
      default: {
        radio: {
          icon:
            '<svg fill="#00c6b3" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="5"/></svg>',
        },
      },
    }),
    screens: {
      xs: { max: '320px' },
      sm: { max: '415px' },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/custom-forms')],
};
