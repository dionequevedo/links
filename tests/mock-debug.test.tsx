// Mock simples para verificar se o problema é na configuração
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Primeiro reseto todos os módulos
beforeEach(() => {
  jest.resetModules();
});

// Mock do storage diretamente no require
const mockStorage = {
  save: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue([]),
  remove: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../src/storage/link-storage', () => ({
  linkStorage: mockStorage,
}));

console.log('Mock configurado:', mockStorage);

// Mock do router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Teste simples
describe('Verificação do Mock', () => {
  it('deve ter o mock configurado corretamente', async () => {
    // Verificar se o mock existe
    const linkStorageModule = require('../src/storage/link-storage');
    console.log('Module carregado:', linkStorageModule);
    console.log('LinkStorage:', linkStorageModule.linkStorage);
    console.log('Save function:', linkStorageModule.linkStorage.save);
    
    expect(linkStorageModule.linkStorage.save).toBeDefined();
    expect(typeof linkStorageModule.linkStorage.save).toBe('function');
    
    // Tentar chamar a função
    await linkStorageModule.linkStorage.save({ id: '1', name: 'test', url: 'test.com', category: 'test' });
    expect(mockStorage.save).toHaveBeenCalled();
  });
});
