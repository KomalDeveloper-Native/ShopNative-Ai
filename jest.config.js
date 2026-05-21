module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-native-vector-icons|react-native-linear-gradient|react-native-paper|react-native-dimension|@react-native-async-storage|react-redux|redux-persist|@reduxjs|immer)/)',
  ],
};
