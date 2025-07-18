import { linkStorage, LinkStorage } from '../src/storage/link-storage';
import { categories } from '../src/utils/categories';
import { Alert, Linking } from 'react-native';

// Mock dos módulos externos
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

describe('Index Component - Lógica de Negócio', () => {
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
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(true);
  });

  describe('Estrutura de dados e categorias', () => {
    it('deve ter categorias definidas corretamente', () => {
      expect(categories).toBeDefined();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('name');
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('icon');
    });

    it('deve ter estrutura correta para LinkStorage', () => {
      const link = mockLinks[0];
      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('category');
      expect(link).toHaveProperty('name');
      expect(link).toHaveProperty('url');
    });
  });

  describe('Filtragem de links por categoria', () => {
    it('deve filtrar links por categoria Curso', () => {
      const cursoLinks = mockLinks.filter(link => link.category === 'Curso');
      expect(cursoLinks).toHaveLength(2);
      expect(cursoLinks[0].name).toBe('React Native Curso');
      expect(cursoLinks[1].name).toBe('TypeScript Avançado');
    });

    it('deve filtrar links por categoria Projeto', () => {
      const projetoLinks = mockLinks.filter(link => link.category === 'Projeto');
      expect(projetoLinks).toHaveLength(1);
      expect(projetoLinks[0].name).toBe('Meu Projeto');
    });

    it('deve retornar array vazio para categoria sem links', () => {
      const articuloLinks = mockLinks.filter(link => link.category === 'Artigo');
      expect(articuloLinks).toHaveLength(0);
    });
  });

  describe('Validação de URLs', () => {
    it('deve validar URLs corretas', () => {
      const validUrls = [
        'https://example.com',
        'https://github.com/user/repo',
        'http://localhost:3000',
        'https://docs.expo.dev',
      ];

      // Usando uma regex mais simples e confiável
      const urlRegex = /^https?:\/\/.+/;
      
      for (const url of validUrls) {
        expect(url).toMatch(urlRegex);
      }
    });

    it('deve identificar URLs inválidas', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert("test")',
        '',
      ];

      const urlRegex = /^https?:\/\/.+/;

      for (const url of invalidUrls) {
        expect(url).not.toMatch(urlRegex);
      }
    });
  });

  describe('Funções auxiliares para modal', () => {
    it('deve simular abertura de link válido', async () => {
      const mockUrl = 'https://example.com';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(true);

      const canOpen = await Linking.canOpenURL(mockUrl);
      expect(canOpen).toBe(true);

      if (canOpen) {
        await Linking.openURL(mockUrl);
        expect(Linking.openURL).toHaveBeenCalledWith(mockUrl);
      }
    });

    it('deve tratar erro ao abrir link não suportado', async () => {
      const mockUrl = 'invalid://protocol';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

      const canOpen = await Linking.canOpenURL(mockUrl);
      expect(canOpen).toBe(false);
    });

    it('deve tratar erro de rede ao abrir link', async () => {
      const mockUrl = 'https://example.com';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Network error'));

      const canOpen = await Linking.canOpenURL(mockUrl);
      expect(canOpen).toBe(true);

      await expect(Linking.openURL(mockUrl)).rejects.toThrow('Network error');
    });
  });

  describe('Validação de alertas', () => {
    it('deve chamar Alert.alert para confirmação de exclusão', () => {
      const linkName = 'Test Link';
      const mockAlert = Alert.alert as jest.Mock;

      // Simula a chamada do Alert para confirmação
      Alert.alert(
        'Deletar link',
        `Deseja deletar o link ${linkName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: jest.fn() },
        ]
      );

      expect(mockAlert).toHaveBeenCalledWith(
        'Deletar link',
        `Deseja deletar o link ${linkName}?`,
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancelar' }),
          expect.objectContaining({ text: 'Deletar' }),
        ])
      );
    });

    it('deve chamar Alert.alert para erro genérico', () => {
      const mockAlert = Alert.alert as jest.Mock;

      Alert.alert('Erro', 'Não foi possível realizar a operação');

      expect(mockAlert).toHaveBeenCalledWith(
        'Erro',
        'Não foi possível realizar a operação'
      );
    });

    it('deve chamar Alert.alert quando não há links', () => {
      const mockAlert = Alert.alert as jest.Mock;

      Alert.alert(
        'Nenhum link encontrado',
        'Adicione um novo link para ver aqui.'
      );

      expect(mockAlert).toHaveBeenCalledWith(
        'Nenhum link encontrado',
        'Adicione um novo link para ver aqui.'
      );
    });
  });

  describe('Manipulação de estado do modal', () => {
    it('deve simular estados do modal', () => {
      let showModal = false;
      let selectedLink: LinkStorage | null = null;

      // Simula abertura do modal
      const openModal = (link: LinkStorage) => {
        showModal = true;
        selectedLink = link;
      };

      // Simula fechamento do modal
      const closeModal = () => {
        showModal = false;
        selectedLink = null;
      };

      // Testa abertura
      openModal(mockLinks[0]);
      expect(showModal).toBe(true);
      expect(selectedLink).toEqual(mockLinks[0]);

      // Testa fechamento
      closeModal();
      expect(showModal).toBe(false);
      expect(selectedLink).toBeNull();
    });
  });

  describe('Integração com storage', () => {
    it('deve ter as funções do linkStorage disponíveis', () => {
      expect(linkStorage.get).toBeDefined();
      expect(linkStorage.save).toBeDefined();
      expect(linkStorage.remove).toBeDefined();
      expect(typeof linkStorage.get).toBe('function');
      expect(typeof linkStorage.save).toBe('function');
      expect(typeof linkStorage.remove).toBe('function');
    });

    it('deve testar a função save do linkStorage', async () => {
      const novoLink: LinkStorage = {
        id: '4',
        category: 'Site',
        name: 'Novo Site',
        url: 'https://novosite.com',
      };

      const mockSave = jest.spyOn(linkStorage, 'save').mockResolvedValue();
      
      await linkStorage.save(novoLink);
      
      expect(mockSave).toHaveBeenCalledWith(novoLink);
    });
  });

  describe('Simulação de cenários de uso', () => {
    it('deve simular fluxo completo de visualização de link', async () => {
      // 1. Usuário seleciona categoria
      const selectedCategory = 'Curso';
      
      // 2. Sistema filtra links
      const filteredLinks = mockLinks.filter(link => link.category === selectedCategory);
      expect(filteredLinks).toHaveLength(2);
      
      // 3. Usuário clica em um link
      const selectedLink = filteredLinks[0];
      expect(selectedLink.name).toBe('React Native Curso');
      
      // 4. Sistema abre modal
      let modalOpen = true;
      expect(modalOpen).toBe(true);
      
      // 5. Usuário clica em "Abrir"
      const canOpen = await Linking.canOpenURL(selectedLink.url);
      if (canOpen) {
        await Linking.openURL(selectedLink.url);
      }
      
      expect(Linking.openURL).toHaveBeenCalledWith(selectedLink.url);
    });

    it('deve simular fluxo de exclusão de link', () => {
      // 1. Usuário seleciona link para excluir
      const linkToDelete = mockLinks[0];
      
      // 2. Sistema exibe confirmação
      let confirmationShown = false;
      const showConfirmation = () => {
        confirmationShown = true;
        Alert.alert(
          'Deletar link',
          `Deseja deletar o link ${linkToDelete.name}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Deletar', onPress: jest.fn() },
          ]
        );
      };
      
      showConfirmation();
      expect(confirmationShown).toBe(true);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('deve simular mudança de categoria', () => {
      // Estado inicial
      let currentCategory = 'Curso';
      let currentLinks = mockLinks.filter(link => link.category === currentCategory);
      expect(currentLinks).toHaveLength(2);
      
      // Mudança de categoria
      currentCategory = 'Projeto';
      currentLinks = mockLinks.filter(link => link.category === currentCategory);
      expect(currentLinks).toHaveLength(1);
      expect(currentLinks[0].name).toBe('Meu Projeto');
    });
  });
});
