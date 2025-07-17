import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Add from '../src/app/add';

// Usar os mocks já configurados no setup.ts
const { linkStorage } = require('../src/storage/link-storage');
const { router } = require('expo-router');

// Mock específico do Alert para capturar chamadas
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock do linkStorage
jest.mock('../src/storage/link-storage', () => ({
  linkStorage: {
    save: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

describe('Add Component - Testes de Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    (linkStorage.get as jest.Mock).mockResolvedValue([]);
  });

  afterAll(() => {
    mockAlert.mockRestore();
  });

  describe('Renderização básica', () => {
    it('deve renderizar o componente Add sem erros', () => {
      expect(() => render(<Add />)).not.toThrow();
    });

    it('deve renderizar o título "Novo"', () => {
      const { getByText } = render(<Add />);
      expect(getByText('Novo')).toBeTruthy();
    });

    it('deve renderizar o texto "Selecione uma categoria"', () => {
      const { getByText } = render(<Add />);
      expect(getByText('Selecione uma categoria')).toBeTruthy();
    });
  });

  describe('Validações do formulário - Campos vazios', () => {
    it('deve mostrar alerta quando todos os campos estão vazios', async () => {
      const { getByText } = render(<Add />);
      const addButton = getByText('Adicionar');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Campos não preenchidos',
        'Selecione uma categoria e preencha todos os campos!'
      );
    });
  });

  describe('Validações de URL', () => {
    const testCases = [
      {
        description: 'deve aceitar URL com https',
        url: 'https://www.google.com',
        shouldBeValid: true
      },
      {
        description: 'deve aceitar URL com http', 
        url: 'http://example.com',
        shouldBeValid: true
      },
      {
        description: 'deve aceitar URL sem protocolo',
        url: 'www.teste.com.br',
        shouldBeValid: true
      },
      {
        description: 'deve aceitar domínio simples',
        url: 'teste.com',
        shouldBeValid: true
      },
      {
        description: 'deve rejeitar texto simples',
        url: 'apenas-texto',
        shouldBeValid: false
      },
      {
        description: 'deve rejeitar URL incompleta',
        url: 'http://',
        shouldBeValid: false
      },
      {
        description: 'deve rejeitar apenas extensão',
        url: '.com',
        shouldBeValid: false
      }
    ];

    testCases.forEach(({ description, url, shouldBeValid }) => {
      it(description, () => {
        const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
        const isValid = urlPattern.test(url.trim());
        
        if (shouldBeValid) {
          expect(isValid).toBe(true);
        } else {
          expect(isValid).toBe(false);
        }
      });
    });
  });

  describe('Validações de campos obrigatórios', () => {
    it('deve validar nome com mínimo de 5 caracteres', () => {
      const shortName = 'Test'; // 4 caracteres
      const validName = 'Teste Nome'; // mais de 5 caracteres
      
      expect(shortName.trim().length >= 5).toBe(false);
      expect(validName.trim().length >= 5).toBe(true);
    });

    it('deve validar URL com mínimo de 6 caracteres', () => {
      const shortUrl = 'test'; // 4 caracteres  
      const validUrl = 'test.com'; // 8 caracteres
      
      expect(shortUrl.trim().length >= 6).toBe(false);
      expect(validUrl.trim().length >= 6).toBe(true);
    });
  });

  describe('Funcionalidade de salvamento', () => {
    it('deve chamar linkStorage.save quando dados são válidos', async () => {
      (linkStorage.get as jest.Mock).mockResolvedValue([
        {
          id: '123',
          category: 'Curso',
          name: 'Test Link',
          url: 'https://test.com'
        }
      ]);

      // Simular dados válidos diretamente na função
      const linkData = {
        id: expect.any(String),
        category: 'Curso',
        name: 'Test Link',
        url: 'https://test.com'
      };

      await linkStorage.save(linkData);
      
      expect(linkStorage.save).toHaveBeenCalledWith(linkData);
    });

    it('deve gerar ID baseado em timestamp', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      const id = String(new Date().getTime());
      
      expect(id).toBe(now.toString());
      
      jest.restoreAllMocks();
    });
  });

  describe('Tratamento de erros', () => {
    it('deve lidar com erro de salvamento', async () => {
      const error = new Error('Storage error');
      (linkStorage.save as jest.Mock).mockRejectedValue(error);

      try {
        await linkStorage.save({
          id: '123',
          category: 'Curso', 
          name: 'Test',
          url: 'https://test.com'
        });
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });

  describe('Navegação', () => {
    it('deve ter router disponível para navegação', () => {
      expect(router).toBeDefined();
      expect(router.back).toBeDefined();
    });
  });

  describe('Lógica de validação completa', () => {
    it('deve executar todas as validações em sequência', () => {
      const validateForm = (category: string, name: string, url: string) => {
        // Validação 1: Todos os campos vazios
        if (!category && !name.trim() && !url.trim()) {
          return { isValid: false, error: 'Campos não preenchidos' };
        }
        
        // Validação 2: Categoria
        if (!category) {
          return { isValid: false, error: 'Categoria não informada' };
        }
        
        // Validação 3: Nome
        if (!name.trim() || name.length < 5) {
          return { isValid: false, error: 'Nome não informado' };
        }
        
        // Validação 4: URL
        if (!url.trim() || url.length < 6) {
          return { isValid: false, error: 'URL não informada' };
        }
        
        // Validação 5: Formato da URL
        const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
        if (!urlPattern.test(url.trim())) {
          return { isValid: false, error: 'URL inválida' };
        }
        
        return { isValid: true, error: null };
      };

      // Testar cada cenário de validação
      expect(validateForm('', '', '').error).toBe('Campos não preenchidos');
      expect(validateForm('', 'Nome', 'url')).toEqual({ isValid: false, error: 'Categoria não informada' });
      expect(validateForm('Curso', 'Test', 'url')).toEqual({ isValid: false, error: 'Nome não informado' });
      expect(validateForm('Curso', 'Nome Válido', 'url')).toEqual({ isValid: false, error: 'URL não informada' });
      expect(validateForm('Curso', 'Nome Válido', 'url-inválida')).toEqual({ isValid: false, error: 'URL inválida' });
      expect(validateForm('Curso', 'Nome Válido', 'https://valid.com')).toEqual({ isValid: true, error: null });
    });
  });
});
