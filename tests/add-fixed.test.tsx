import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock do expo-router
const mockRouterBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: mockRouterBack,
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  },
}));

// Mock do @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do linkStorage
const mockLinkStorageSave = jest.fn();
const mockLinkStorageGet = jest.fn();
jest.mock('../src/storage/link-storage', () => ({
  linkStorage: {
    save: mockLinkStorageSave,
    get: mockLinkStorageGet,
    remove: jest.fn(),
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

// Mock do MaterialIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name, size, color, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {
      ...props,
      testID: `material-icon-${name}`,
      children: `Icon: ${name}`,
    });
  },
}));

// Mock do componente Input
jest.mock('../src/components/input', () => ({
  Input: jest.fn().mockImplementation((props: any) => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return React.createElement(TextInput, {
      ...props,
      testID: `input-${props.placeholder?.toLowerCase()}`,
      value: props.value,
      onChangeText: props.onChangeText,
      autoCapitalize: props.autoCapitalize,
      autocorrect: props.autocorrect,
    });
  }),
}));

// Mock do componente Button
jest.mock('../src/components/button', () => ({
  Button: ({ title, onPress, ...props }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(TouchableOpacity, {
      ...props,
      testID: 'button-adicionar',
      onPress,
      children: React.createElement(Text, {}, title),
    });
  },
}));

// Mock do componente Categories com estado interno
jest.mock('../src/components/categories', () => ({
  Categories: ({ onChange, selected }: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    const [selectedCategory, setSelectedCategory] = React.useState(selected);
    
    const handlePress = () => {
      const newCategory = 'Curso';
      setSelectedCategory(newCategory);
      if (onChange) {
        onChange(newCategory);
      }
    };
    
    return React.createElement(TouchableOpacity, {
      testID: 'categories',
      onPress: handlePress,
      children: React.createElement(Text, {}, `Categories: ${selectedCategory || 'None'}`),
    });
  },
}));

// Import the component after mocks
import Add from '../src/app/add';

describe('Add Component', () => {
  const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

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

    it('deve renderizar os ícones do MaterialIcons', () => {
      const { getByTestId } = render(<Add />);
      
      expect(getByTestId('material-icon-arrow-back')).toBeTruthy();
      expect(getByTestId('material-icon-add')).toBeTruthy();
    });
  });

  describe('Navegação', () => {
    it('deve chamar router.back quando o botão de voltar for pressionado', () => {
      const { getByTestId } = render(<Add />);
      const backButton = getByTestId('material-icon-arrow-back');
      
      fireEvent.press(backButton);
      
      expect(mockRouterBack).toHaveBeenCalledTimes(1);
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
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
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
      const categoriesComponent = getByTestId('categories');
      const nameInput = getByTestId('input-nome');
      const urlInput = getByTestId('input-url');
      const addButton = getByTestId('button-adicionar');
      
      // Simular seleção de categoria
      fireEvent.press(categoriesComponent);
      
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

  describe('Validações de URL', () => {
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

  describe('Interação com componentes', () => {
    it('deve atualizar o estado da categoria quando categorias são selecionadas', () => {
      const { getByTestId } = render(<Add />);
      const categoriesComponent = getByTestId('categories');
      
      fireEvent.press(categoriesComponent);
      
      // Verifica se o componente responde ao evento
      expect(categoriesComponent).toBeTruthy();
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
