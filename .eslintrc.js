module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:react-hooks/recommended', // Adicione esta linha
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'warn', // Adicione esta linha
    'react-hooks/exhaustive-deps': 'warn', // Adicione esta linha
  },
};
