/* eslint-disable no-undef */
'use strict';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./test.html'],
  theme: {
    extend: {
      colors: {
        background: "#1e1e1e",
      }
    }
  },
  plugins: []
};
