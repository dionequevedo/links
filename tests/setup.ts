// Configuração de setup para os testes

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do expo-router
jest.mock('expo-router', () => require('./__mocks__/expo-router'));

// Suprimir avisos de act() e outros logs desnecessários para testes
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && (
        args[0].includes('An update to') && args[0].includes('was not wrapped in act') ||
        args[0].includes('Error fetching links:') // Suprimir logs de erro simulados em testes
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
