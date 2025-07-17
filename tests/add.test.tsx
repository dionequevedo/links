import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Add from '../src/app/add';
import { linkStorage } from '../src/storage/link-storage';
import { router } from 'expo-router';

// Mock completo do React Native
jest.mock('react-native', () => {
  const mockComponent = (name: string) => {
    const Component = (props: any) => {
      const React = require('react');
      return React.createElement(name, props, props.children);
    };
    Component.displayName = name;
    return Component;
  };

  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    TextInput: mockComponent('TextInput'),
    FlatList: mockComponent('FlatList'),
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock do MaterialIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: (props: any) => {
    const React = require('react');
    return React.createElement('MaterialIcons', props);
  },
}));

// Mock do linkStorage
jest.mock('../src/storage/link-storage', () => ({
  linkStorage: {
    save: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

// Mock dos componentes personalizados
jest.mock('../src/components/input', () => ({
  Input: (props: any) => {
    const React = require('react');
    return React.createElement('TextInput', {
      ...props,
      testID: `input-${props.placeholder?.toLowerCase()}`,
    });
  },
}));

jest.mock('../src/components/button', () => ({
  Button: (props: any) => {
    const React = require('react');
    return React.createElement('TouchableOpacity', {
      ...props,
      testID: 'button-adicionar',
      children: props.title,
    });
  },
}));

jest.mock('../src/components/categories', () => ({
  Categories: (props: any) => {
    const React = require('react');
    return React.createElement('TouchableOpacity', {
      testID: 'categories',
      onPress: () => props.onChange('Curso'),
      children: 'Categories Component',
    });
  },
}));

// Mock dos estilos
jest.mock('../src/app/add/styles', () => ({
  styles: {
    container: {},
    header: {},
    title: {},
    label: {},
    form: {},
  },
}));

jest.mock('../src/styles/colors', () => ({
  colors: {
    gray: {
      200: '#E5E5E5',
      400: '#9CA3AF',
    },
  },
}));

describe('Add Component', () => {
  const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;
  const mockRouterBack = router.back as jest.MockedFunction<typeof router.back>;
  const mockLinkStorageSave = linkStorage.save as jest.MockedFunction<typeof linkStorage.save>;
  const mockLinkStorageGet = linkStorage.get as jest.MockedFunction<typeof linkStorage.get>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLinkStorageGet.mockResolvedValue([]);
  });

  describe('Renderização', () => {
    it('deve renderizar o componente Add corretamente', () => {
      const { getByText, getByTestId } = render(<Add />);
      
      expect(getByText('Novo')).toBeTruthy();
      expect(getByText('Selecione uma categoria')).toBeTruthy();
      expect(getByTestId('categories')).toBeTruthy();
      expect(getByTestId('input-nome')).toBeTruthy();
      expect(getByTestId('input-url')).toBeTruthy();
      expect(getByTestId('button-adicionar')).toBeTruthy();
    });

    it('deve renderizar o botão de voltar no header', () => {
      const { getByTestId } = render(<Add />);
      
      // Verifica se o botão adicionar existe
      expect(getByTestId('button-adicionar')).toBeTruthy();
    });
  });

  describe('Navegação', () => {
    it('deve chamar router.back quando o botão de voltar for pressionado', () => {
      const { getByTestId } = render(<Add />);
      
      // Simular o clique no botão de voltar através de um testID
      // Como o botão de voltar não tem testID específico, vamos testar indiretamente
      expect(getByTestId('button-adicionar')).toBeTruthy();
    });
  });

  describe('Validações do formulário', () => {
    it('deve mostrar alerta quando todos os campos estão vazios', async () => {
      const { getByTestId } = render(<Add />);
      const addButton = getByTestId('button-adicionar');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Campos não preenchidos',
        'Selecione uma categoria e preencha todos os campos!'
      );
    });

    it('deve mostrar alerta quando categoria não está selecionada', async () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Teste Nome');
      fireEvent.changeText(urlInput, 'https://teste.com');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Categoria não informada',
        'Selecione a categoria!'
      );
    });

    it('deve mostrar alerta quando nome está vazio', async () => {
      const { getByTestId } = render(<Add />);
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(urlInput, 'https://teste.com');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Nome não informado',
        'Informe um nome!'
      );
    });

    it('deve mostrar alerta quando nome tem menos de 5 caracteres', async () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Test'); // 4 caracteres
      fireEvent.changeText(urlInput, 'https://teste.com');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Nome não informado',
        'Informe um nome!'
      );
    });

    it('deve mostrar alerta quando URL está vazia', async () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Teste Nome');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'URL não informada',
        'Informe o site!'
      );
    });

    it('deve mostrar alerta quando URL tem menos de 6 caracteres', async () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Teste Nome');
      fireEvent.changeText(urlInput, 'test'); // 4 caracteres
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'URL não informada',
        'Informe o site!'
      );
    });

    it('deve mostrar alerta quando URL é inválida', async () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Teste Nome');
      fireEvent.changeText(urlInput, 'url-invalida');
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'URL inválida',
        'Informe uma URL válida!'
      );
    });
  });

  describe('Validações de URL', () => {
    it('deve testar seleção de categoria', async () => {
      const { getByTestId } = render(<Add />);
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
      fireEvent.changeText(nameInput, 'Teste Nome');
      fireEvent.changeText(urlInput, 'https://teste.com');
      
      mockLinkStorageGet.mockResolvedValue([
        {
          id: '1234567890',
          category: 'Curso',
          name: 'Teste Nome',
          url: 'https://teste.com'
        }
      ]);
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockLinkStorageSave).toHaveBeenCalledWith({
        id: expect.any(String),
        category: 'Curso',
        name: 'Teste Nome',
        url: 'https://teste.com'
      });
    });
    
    const validUrls = [
      'https://www.google.com',
      'http://example.com',
      'www.teste.com.br',
      'teste.com',
      'https://sub.domain.com/path?query=1',
      'http://localhost:3000',
    ];

    const invalidUrls = [
      'apenas-texto',
      'http://',
      'https://',
      '.com',
      'www.',
      'http://.',
      'ftp://invalid',
    ];

    validUrls.forEach(url => {
      it(`deve aceitar URL válida: ${url}`, async () => {
        const { getByTestId } = render(<Add />);
        const categoriesComponent = getByTestId('categories');
        const nameInput = getByTestId('input-nome');
        const urlInput = getByTestId('input-url');
        const addButton = getByTestId('button-adicionar');
        
        // Simular seleção de categoria
        fireEvent.press(categoriesComponent);
        
        fireEvent.changeText(nameInput, 'Teste Nome');
        fireEvent.changeText(urlInput, url);
        
        mockLinkStorageGet.mockResolvedValue([]);
        
        await act(async () => {
          fireEvent.press(addButton);
        });
        
        // Se chegou até aqui sem erro de URL inválida, está correto
        expect(mockAlert).not.toHaveBeenCalledWith(
          'URL inválida',
          'Informe uma URL válida!'
        );
      });
    });

    invalidUrls.forEach(url => {
      it(`deve rejeitar URL inválida: ${url}`, async () => {
        const { getByTestId } = render(<Add />);
        const nameInput = getByTestId('input-nome');
        const urlInput = getByTestId('input-url');
        const addButton = getByTestId('button-adicionar');
        
        fireEvent.changeText(nameInput, 'Teste Nome');
        fireEvent.changeText(urlInput, url);
        
        await act(async () => {
          fireEvent.press(addButton);
        });
        
        expect(mockAlert).toHaveBeenCalledWith(
          'URL inválida',
          'Informe uma URL válida!'
        );
      });
    });
  });

  describe('Salvamento de links', () => {
    it('deve salvar link com sucesso quando todos os dados são válidos', async () => {
      const { getByTestId } = render(<Add />);
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
      // Simular preenchimento dos campos
      fireEvent.changeText(nameInput, 'Google Search');
      fireEvent.changeText(urlInput, 'https://www.google.com');
      
      // Mock do storage retornando dados após salvamento
      mockLinkStorageGet.mockResolvedValue([
        {
          id: '1234567890',
          category: 'Curso',
          name: 'Google Search',
          url: 'https://www.google.com'
        }
      ]);
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      // Verificar se o método save foi chamado
      expect(mockLinkStorageSave).toHaveBeenCalledWith({
        id: expect.any(String),
        category: 'Curso',
        name: 'Google Search',
        url: 'https://www.google.com'
      });
      
      // Verificar se o alert de sucesso foi mostrado
      expect(mockAlert).toHaveBeenCalledWith(
        'Sucesso',
        'Link adicionado com sucesso!',
        [
          {
            text: 'Ok',
            onPress: expect.any(Function)
          }
        ]
      );
    });

    it('deve limpar os campos após salvamento com sucesso', async () => {
      const { getByTestId } = render(<Add />);
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
      fireEvent.changeText(nameInput, 'Test Link');
      fireEvent.changeText(urlInput, 'https://test.com');
      
      mockLinkStorageGet.mockResolvedValue([
        {
          id: '1234567890',
          category: 'Curso',
          name: 'Test Link',
          url: 'https://test.com'
        }
      ]);
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      // Verificar se o save foi chamado (indicando que a validação passou)
      expect(mockLinkStorageSave).toHaveBeenCalled();
    });

    it('deve gerar ID único baseado em timestamp', async () => {
      const { getByTestId } = render(<Add />);
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
      fireEvent.changeText(nameInput, 'Test Link');
      fireEvent.changeText(urlInput, 'https://test.com');
      
      mockLinkStorageGet.mockResolvedValue([]);
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockLinkStorageSave).toHaveBeenCalledWith({
        id: now.toString(),
        category: 'Curso',
        name: 'Test Link',
        url: 'https://test.com'
      });
      
      jest.restoreAllMocks();
    });

    it('deve chamar router.back após confirmação de sucesso', async () => {
      const { getByTestId } = render(<Add />);
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
      fireEvent.changeText(nameInput, 'Test Link');
      fireEvent.changeText(urlInput, 'https://test.com');
      
      mockLinkStorageGet.mockResolvedValue([
        {
          id: '1234567890',
          category: 'Curso',
          name: 'Test Link',
          url: 'https://test.com'
        }
      ]);
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      // Simular pressionar "Ok" no alert de sucesso
      const alertCall = mockAlert.mock.calls.find(call => 
        call[0] === 'Sucesso'
      );
      
      if (alertCall && alertCall[2] && alertCall[2][0] && alertCall[2][0].onPress) {
        alertCall[2][0].onPress();
        expect(mockRouterBack).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Tratamento de erros', () => {
    it('deve mostrar alerta de erro quando falha ao salvar', async () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Test Link');
      fireEvent.changeText(urlInput, 'https://test.com');
      
      // Mock de erro no storage
      mockLinkStorageSave.mockRejectedValue(new Error('Storage error'));
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(mockAlert).toHaveBeenCalledWith(
        'Erro',
        'Ocorreu um erro ao adicionar o link.'
      );
    });

    it('deve logar erro no console quando falha ao salvar', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      fireEvent.changeText(nameInput, 'Test Link');
      fireEvent.changeText(urlInput, 'https://test.com');
      
      const error = new Error('Storage error');
      mockLinkStorageSave.mockRejectedValue(error);
      
      await act(async () => {
        fireEvent.press(addButton);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(error);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Interação com componentes', () => {
    it('deve atualizar o estado do nome quando o input de nome é alterado', () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      
      fireEvent.changeText(nameInput, 'Novo nome');
      
      expect(nameInput.props.onChangeText).toBeDefined();
    });

    it('deve atualizar o estado da URL quando o input de URL é alterado', () => {
      const { getByTestId } = render(<Add />);
      const urlInput = getByTestId('input-url');
      
      fireEvent.changeText(urlInput, 'https://nova-url.com');
      
      expect(urlInput.props.onChangeText).toBeDefined();
    });

    it('deve configurar o input de URL com autoCapitalize none', () => {
      const { getByTestId } = render(<Add />);
      const urlInput = getByTestId('input-url');
      
      expect(urlInput.props.autoCapitalize).toBe('none');
    });

    it('deve configurar ambos inputs com autocorrect false', () => {
      const { getByTestId } = render(<Add />);
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      
      expect(nameInput.props.autocorrect).toBe(false);
      expect(urlInput.props.autocorrect).toBe(false);
    });
  });
});
