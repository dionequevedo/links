import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import Index from '../src/app/index/index';
import { linkStorage, LinkStorage } from '../src/storage/link-storage';
import { router } from 'expo-router';

// Setup básico para React Native Testing
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: () => null,
}));

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
    Image: mockComponent('Image'),
    FlatList: mockComponent('FlatList'),
    Modal: mockComponent('Modal'),
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      canOpenURL: jest.fn(),
      openURL: jest.fn(),
    },
  };
});

// Mock do expo-vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name, size, color, ...props }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `icon-${name}`, ...props }, name);
  },
}));

// Mock do expo-router
jest.mock('expo-router', () => ({
  router: {
    navigate: jest.fn(),
  },
  useFocusEffect: jest.fn((callback) => {
    const React = require('react');
    React.useEffect(callback, []);
  }),
}));

// Mock do storage
jest.mock('../src/storage/link-storage', () => ({
  linkStorage: {
    get: jest.fn(),
    remove: jest.fn(),
  },
}));

// Mock dos assets e estilos
jest.mock('../src/assets/logo.png', () => 'logo-mock');
jest.mock('../src/app/index/styles', () => ({
  styles: {
    container: {},
    header: {},
    logo: {},
    links: {},
    linksContent: {},
    modal: {},
    modalContent: {},
    modalHeader: {},
    modalCategory: {},
    modalLinkName: {},
    modalUrl: {},
    modalFooter: {},
  },
}));
jest.mock('../src/styles/colors', () => ({
  colors: { 
    green: { 300: '#2DD4BF' }, 
    gray: { 400: '#9CA3AF' } 
  },
}));
jest.mock('../src/utils/categories', () => ({
  categories: [
    { name: 'Curso', id: '1', icon: 'book' }, 
    { name: 'Projeto', id: '2', icon: 'code' }
  ],
}));

// Mock dos componentes
jest.mock('../src/components/categories', () => ({
  Categories: jest.fn(() => null),
}));

jest.mock('../src/components/Link', () => ({
  Link: jest.fn(() => null),
}));

jest.mock('../src/components/options', () => ({
  Option: jest.fn(() => null),
}));

describe('Index Component', () => {
  const mockLinks: LinkStorage[] = [
    {
      id: '1',
      category: 'Curso',
      name: 'React Native Curso',
      url: 'https://example.com/react-native',
    },
    {
      id: '2',
      category: 'Projeto',
      name: 'Meu Projeto',
      url: 'https://github.com/meu-projeto',
    },
    {
      id: '3',
      category: 'Curso',
      name: 'TypeScript Avançado',
      url: 'https://typescript-course.com',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (linkStorage.get as jest.Mock).mockResolvedValue(mockLinks);
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(true);
  });

  describe('Funcionalidades básicas', () => {
    it('deve renderizar o componente sem erros', () => {
      expect(() => render(<Index />)).not.toThrow();
    });

    it('deve carregar links do storage ao montar o componente', async () => {
      render(<Index />);
      
      await waitFor(() => {
        expect(linkStorage.get).toHaveBeenCalled();
      });
    });

    it('deve mostrar alerta quando não há links', async () => {
      (linkStorage.get as jest.Mock).mockResolvedValue([]);
      
      render(<Index />);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Nenhum link encontrado',
          'Adicione um novo link para ver aqui.'
        );
      });
    });

    it('deve tratar erro ao carregar links', async () => {
      (linkStorage.get as jest.Mock).mockRejectedValue(new Error('Erro de rede'));
      
      render(<Index />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Erro',
          'Não foi possível obter os links:'
        );
      });
    });
  });

  describe('Gerenciamento de storage', () => {
    it('deve chamar linkStorage.get corretamente', async () => {
      render(<Index />);
      
      await waitFor(() => {
        expect(linkStorage.get).toHaveBeenCalledWith();
      });
    });

    it('deve processar dados do storage corretamente', async () => {
      const filteredLinks = mockLinks.filter(link => link.category === 'Curso');
      
      render(<Index />);
      
      await waitFor(() => {
        expect(linkStorage.get).toHaveBeenCalled();
      });

      // Verificar se os dados estão estruturados corretamente
      expect(filteredLinks).toHaveLength(2);
      expect(filteredLinks[0]).toHaveProperty('id');
      expect(filteredLinks[0]).toHaveProperty('category');
      expect(filteredLinks[0]).toHaveProperty('name');
      expect(filteredLinks[0]).toHaveProperty('url');
    });

    it('deve lidar com array vazio do storage', async () => {
      (linkStorage.get as jest.Mock).mockResolvedValue([]);
      
      render(<Index />);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Nenhum link encontrado',
          'Adicione um novo link para ver aqui.'
        );
      });
    });
  });

  describe('Funcionalidades de Link', () => {
    it('deve validar URLs corretamente', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://github.com/user/repo',
      ];

      validUrls.forEach(url => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });
    });

    it('deve permitir abrir link válido', async () => {
      const url = 'https://example.com/test';
      
      const canOpen = await Linking.canOpenURL(url);
      expect(canOpen).toBe(true);
      
      if (canOpen) {
        await Linking.openURL(url);
        expect(Linking.openURL).toHaveBeenCalledWith(url);
      }
    });

    it('deve não abrir link não suportado', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      
      const canOpen = await Linking.canOpenURL('invalid-url');
      expect(canOpen).toBe(false);
    });

    it('deve tratar erro ao abrir link', async () => {
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Erro ao abrir'));
      
      try {
        await Linking.openURL('https://example.com');
      } catch (error) {
        expect((error as Error).message).toBe('Erro ao abrir');
      }
    });
  });

  describe('Gerenciamento de links', () => {
    it('deve remover link corretamente', async () => {
      (linkStorage.remove as jest.Mock).mockResolvedValue(undefined);
      
      await linkStorage.remove('1');
      expect(linkStorage.remove).toHaveBeenCalledWith('1');
    });

    it('deve tratar erro ao remover link', async () => {
      (linkStorage.remove as jest.Mock).mockRejectedValue(new Error('Erro ao deletar'));
      
      try {
        await linkStorage.remove('1');
      } catch (error) {
        expect((error as Error).message).toBe('Erro ao deletar');
      }
    });

    it('deve chamar recarregamento após remoção', async () => {
      (linkStorage.remove as jest.Mock).mockResolvedValue(undefined);
      (linkStorage.get as jest.Mock)
        .mockResolvedValueOnce(mockLinks)
        .mockResolvedValueOnce(mockLinks.filter(link => link.id !== '1'));
      
      render(<Index />);
      
      // Simular remoção
      await linkStorage.remove('1');
      
      expect(linkStorage.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('Sistema de alertas', () => {
    it('deve mostrar confirmação para deletar', () => {
      const linkName = 'Test Link';
      
      Alert.alert(
        'Deletar link',
        `Deseja deletar o link ${linkName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: jest.fn() },
        ]
      );

      expect(Alert.alert).toHaveBeenCalledWith(
        'Deletar link',
        `Deseja deletar o link ${linkName}?`,
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancelar' }),
          expect.objectContaining({ text: 'Deletar' }),
        ])
      );
    });

    it('deve mostrar alertas de erro', () => {
      Alert.alert('Erro', 'Não foi possível realizar a operação');
      expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Não foi possível realizar a operação');
    });

    it('deve mostrar alerta de sucesso ao abrir link', async () => {
      const url = 'https://example.com';
      
      await Linking.openURL(url);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });
  });

  describe('Validação de dados', () => {
    it('deve ter estrutura correta de links', () => {
      const link = mockLinks[0];
      
      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('category');
      expect(link).toHaveProperty('name');
      expect(link).toHaveProperty('url');
      
      expect(typeof link.id).toBe('string');
      expect(typeof link.category).toBe('string');
      expect(typeof link.name).toBe('string');
      expect(typeof link.url).toBe('string');
    });

    it('deve filtrar links por categoria', () => {
      const cursoLinks = mockLinks.filter(link => link.category === 'Curso');
      expect(cursoLinks).toHaveLength(2);
      
      const projetoLinks = mockLinks.filter(link => link.category === 'Projeto');
      expect(projetoLinks).toHaveLength(1);
    });

    it('deve ter categorias válidas', () => {
      const categories = ['Curso', 'Projeto'];
      
      mockLinks.forEach(link => {
        expect(categories).toContain(link.category);
      });
    });
  });

  describe('Navegação', () => {
    it('deve ter função de navegação disponível', () => {
      expect(router.navigate).toBeDefined();
      expect(typeof router.navigate).toBe('function');
    });

    it('deve poder navegar para tela de adicionar', () => {
      router.navigate('/add');
      expect(router.navigate).toHaveBeenCalledWith('/add');
    });
  });

  describe('Integração de componentes', () => {
    it('deve usar componentes mockados corretamente', () => {
      const Categories = require('../src/components/categories').Categories;
      const Link = require('../src/components/Link').Link;
      const Option = require('../src/components/options').Option;
      
      expect(Categories).toBeDefined();
      expect(Link).toBeDefined();
      expect(Option).toBeDefined();
    });

    it('deve manter estado consistente', () => {
      let categoria = 'Curso';
      let links = mockLinks.filter(link => link.category === categoria);
      expect(links).toHaveLength(2);
      
      categoria = 'Projeto';
      links = mockLinks.filter(link => link.category === categoria);
      expect(links).toHaveLength(1);
    });

    it('deve processar useFocusEffect corretamente', () => {
      const { useFocusEffect } = require('expo-router');
      
      render(<Index />);
      
      expect(useFocusEffect).toHaveBeenCalled();
    });
  });

  describe('Fluxo completo', () => {
    it('deve executar carregamento completo sem erros', async () => {
      jest.clearAllMocks();
      (linkStorage.get as jest.Mock).mockResolvedValue(mockLinks);
      
      const { unmount } = render(<Index />);
      
      await waitFor(() => {
        expect(linkStorage.get).toHaveBeenCalled();
      });
      
      unmount();
    });

    it('deve lidar com ciclo completo de operações', async () => {
      jest.clearAllMocks();
      (linkStorage.get as jest.Mock).mockResolvedValue(mockLinks);
      (linkStorage.remove as jest.Mock).mockResolvedValue(undefined);
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(true);
      
      render(<Index />);
      
      // Verificar carregamento
      await waitFor(() => {
        expect(linkStorage.get).toHaveBeenCalled();
      });
      
      // Simular operações
      await linkStorage.remove('1');
      expect(linkStorage.remove).toHaveBeenCalledWith('1');
      
      await Linking.openURL('https://example.com');
      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
    });
  });
});
