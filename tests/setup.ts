// Configuração de setup para os testes

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do expo-router
jest.mock('expo-router', () => require('./__mocks__/expo-router'));
