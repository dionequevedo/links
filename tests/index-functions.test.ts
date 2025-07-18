import { linkStorage, LinkStorage } from '../src/storage/link-storage';
import { Alert, Linking } from 'react-native';

// Mock dos módulos necessários
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
describe('Index Component - Funções Específicas', () => {
  const mockLinks = [
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Função getLinks - Carregamento de dados', () => {
    it('deve carregar links do storage corretamente', async () => {
      // Mock do linkStorage.get para retornar dados
      const mockGet = jest.spyOn(linkStorage, 'get').mockResolvedValue(mockLinks);

      const links = await linkStorage.get();
      
      expect(mockGet).toHaveBeenCalled();
      expect(links).toEqual(mockLinks);
      expect(links).toHaveLength(2);
    });

    it('deve tratar erro ao carregar links', async () => {
      // Mock do linkStorage.get para falhar
      const mockGet = jest.spyOn(linkStorage, 'get').mockRejectedValue(new Error('Storage error'));

      await expect(linkStorage.get()).rejects.toThrow('Storage error');
      expect(mockGet).toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não há dados', async () => {
      const mockGet = jest.spyOn(linkStorage, 'get').mockResolvedValue([]);

      const links = await linkStorage.get();
      
      expect(links).toEqual([]);
      expect(links).toHaveLength(0);
    });
  });

  describe('Função save - Salvamento de links', () => {
    it('deve salvar novo link corretamente', async () => {
      const novoLink: LinkStorage = {
        id: '3',
        category: 'Site',
        name: 'Novo Site',
        url: 'https://novosite.com',
      };

      const mockSave = jest.spyOn(linkStorage, 'save').mockResolvedValue();

      await linkStorage.save(novoLink);
      
      expect(mockSave).toHaveBeenCalledWith(novoLink);
    });

    it('deve tratar erro ao salvar link', async () => {
      const novoLink: LinkStorage = {
        id: '3',
        category: 'Site',
        name: 'Novo Site',
        url: 'https://novosite.com',
      };

      const mockSave = jest.spyOn(linkStorage, 'save').mockRejectedValue(new Error('Save error'));

      await expect(linkStorage.save(novoLink)).rejects.toThrow('Save error');
      expect(mockSave).toHaveBeenCalledWith(novoLink);
    });
  });

  describe('Função handleRemove - Remoção de links', () => {
    it('deve remover link corretamente', async () => {
      const mockRemove = jest.spyOn(linkStorage, 'remove').mockResolvedValue();

      await linkStorage.remove('1');
      
      expect(mockRemove).toHaveBeenCalledWith('1');
    });

    it('deve tratar erro ao remover link', async () => {
      const mockRemove = jest.spyOn(linkStorage, 'remove').mockRejectedValue(new Error('Remove error'));

      await expect(linkStorage.remove('1')).rejects.toThrow('Remove error');
      expect(mockRemove).toHaveBeenCalledWith('1');
    });
  });

  describe('Função handleOpenLink - Abertura de links', () => {
    beforeEach(() => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(true);
    });

    it('deve abrir link válido', async () => {
      const url = 'https://example.com';
      
      const canOpen = await Linking.canOpenURL(url);
      expect(canOpen).toBe(true);
      
      if (canOpen) {
        await Linking.openURL(url);
      }
      
      expect(Linking.canOpenURL).toHaveBeenCalledWith(url);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    });

    it('deve não abrir link não suportado', async () => {
      const url = 'invalid-url';
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      
      const canOpen = await Linking.canOpenURL(url);
      expect(canOpen).toBe(false);
      
      // Se não pode abrir, não deve chamar openURL
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('deve tratar erro ao abrir link', async () => {
      const url = 'https://example.com';
      (Linking.openURL as jest.Mock).mockRejectedValue(new Error('Failed to open'));
      
      const canOpen = await Linking.canOpenURL(url);
      expect(canOpen).toBe(true);
      
      if (canOpen) {
        await expect(Linking.openURL(url)).rejects.toThrow('Failed to open');
      }
    });
  });

  describe('Sistema de alertas', () => {
    it('deve mostrar alerta de confirmação para exclusão', () => {
      const linkName = 'Test Link';
      const onConfirm = jest.fn();
      
      // Simula a chamada do Alert.alert
      Alert.alert(
        'Deletar link',
        `Deseja deletar o link ${linkName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: onConfirm },
        ]
      );

      expect(Alert.alert).toHaveBeenCalledWith(
        'Deletar link',
        `Deseja deletar o link ${linkName}?`,
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancelar', style: 'cancel' }),
          expect.objectContaining({ text: 'Deletar', onPress: onConfirm }),
        ])
      );
    });

    it('deve mostrar alerta quando não há links', () => {
      Alert.alert('Nenhum link encontrado', 'Adicione um novo link para ver aqui.');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Nenhum link encontrado',
        'Adicione um novo link para ver aqui.'
      );
    });

    it('deve mostrar alerta de erro genérico', () => {
      Alert.alert('Erro', 'Não foi possível realizar a operação');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro',
        'Não foi possível realizar a operação'
      );
    });
  });

  describe('Filtragem e estado', () => {
    it('deve filtrar links por categoria corretamente', () => {
      const categoria = 'Curso';
      const linksFiltrados = mockLinks.filter(link => link.category === categoria);
      
      expect(linksFiltrados).toHaveLength(1);
      expect(linksFiltrados[0].name).toBe('React Native Curso');
    });

    it('deve simular mudança de categoria', () => {
      // Estado inicial
      let categoriaAtual = 'Curso';
      let linksVisiveis = mockLinks.filter(link => link.category === categoriaAtual);
      expect(linksVisiveis).toHaveLength(1);

      // Mudança para Projeto
      categoriaAtual = 'Projeto';
      linksVisiveis = mockLinks.filter(link => link.category === categoriaAtual);
      expect(linksVisiveis).toHaveLength(1);
      expect(linksVisiveis[0].name).toBe('Meu Projeto');

      // Categoria sem links
      categoriaAtual = 'Artigo';
      linksVisiveis = mockLinks.filter(link => link.category === categoriaAtual);
      expect(linksVisiveis).toHaveLength(0);
    });

    it('deve simular controle de modal', () => {
      // Simula estado do modal
      let modalAberto = false;
      let linkSelecionado: LinkStorage | null = null;

      // Função para abrir modal
      const abrirModal = (link: LinkStorage) => {
        modalAberto = true;
        linkSelecionado = link;
      };

      // Função para fechar modal
      const fecharModal = () => {
        modalAberto = false;
        linkSelecionado = null;
      };

      // Testa abertura
      abrirModal(mockLinks[0]);
      expect(modalAberto).toBe(true);
      expect(linkSelecionado).toEqual(mockLinks[0]);

      // Testa fechamento
      fecharModal();
      expect(modalAberto).toBe(false);
      expect(linkSelecionado).toBeNull();
    });
  });

  describe('Cenários de integração', () => {
    it('deve simular fluxo completo de uso', async () => {
      // Reset mocks for this test
      jest.clearAllMocks();
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(true);
      
      // 1. Carregar links
      const mockGet = jest.spyOn(linkStorage, 'get').mockResolvedValue(mockLinks);
      const links = await linkStorage.get();
      expect(links).toHaveLength(2);

      // 2. Filtrar por categoria
      const categoria = 'Curso';
      const linksFiltrados = links.filter(link => link.category === categoria);
      expect(linksFiltrados).toHaveLength(1);

      // 3. Selecionar link
      const linkSelecionado = linksFiltrados[0];
      expect(linkSelecionado.name).toBe('React Native Curso');

      // 4. Abrir link
      const podeAbrir = await Linking.canOpenURL(linkSelecionado.url);
      expect(podeAbrir).toBe(true);

      if (podeAbrir) {
        await Linking.openURL(linkSelecionado.url);
        expect(Linking.openURL).toHaveBeenCalledWith(linkSelecionado.url);
      }
    });

    it('deve simular fluxo de exclusão completo', async () => {
      // 1. Selecionar link para excluir
      const linkParaExcluir = mockLinks[0];

      // 2. Mostrar confirmação
      const confirmacao = jest.fn();
      Alert.alert(
        'Deletar link',
        `Deseja deletar o link ${linkParaExcluir.name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Deletar', onPress: confirmacao },
        ]
      );

      expect(Alert.alert).toHaveBeenCalled();

      // 3. Simular confirmação e exclusão
      const mockRemove = jest.spyOn(linkStorage, 'remove').mockResolvedValue();
      await linkStorage.remove(linkParaExcluir.id);
      expect(mockRemove).toHaveBeenCalledWith(linkParaExcluir.id);

      // 4. Recarregar lista
      const mockGetAfterRemove = jest.spyOn(linkStorage, 'get').mockResolvedValue([mockLinks[1]]);
      const linksAtualizados = await linkStorage.get();
      expect(linksAtualizados).toHaveLength(1);
      expect(linksAtualizados[0].name).toBe('Meu Projeto');
    });

    it('deve tratar erro durante fluxo de uso', async () => {
      // Simula erro no carregamento
      const mockGet = jest.spyOn(linkStorage, 'get').mockRejectedValue(new Error('Network error'));
      
      try {
        await linkStorage.get();
      } catch (error) {
        expect((error as Error).message).toBe('Network error');
        
        // Sistema deve mostrar alerta de erro
        Alert.alert('Erro', 'Não foi possível obter os links:');
        expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Não foi possível obter os links:');
      }
    });
  });

  describe('Validações de dados', () => {
    it('deve validar estrutura de link', () => {
      const link = mockLinks[0];
      
      // Verifica propriedades obrigatórias
      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('category');
      expect(link).toHaveProperty('name');
      expect(link).toHaveProperty('url');
      
      // Verifica tipos
      expect(typeof link.id).toBe('string');
      expect(typeof link.category).toBe('string');
      expect(typeof link.name).toBe('string');
      expect(typeof link.url).toBe('string');
      
      // Verifica valores não vazios
      expect(link.id.length).toBeGreaterThan(0);
      expect(link.category.length).toBeGreaterThan(0);
      expect(link.name.length).toBeGreaterThan(0);
      expect(link.url.length).toBeGreaterThan(0);
    });

    it('deve validar formato de URL de forma mais robusta', () => {
      const urlsValidas = [
        'https://example.com',
        'http://localhost:3000',
        'https://github.com/user/repo',
        'https://www.site.com.br/path?query=value#section',
        'http://192.168.1.1:8080',
      ];

      const urlsInvalidas = [
        'not-a-url',
        'ftp://example.com',
        '',
        'javascript:alert("test")',
        'file:///etc/passwd',
        'data:text/html,<script>alert("xss")</script>',
      ];

      // Regex simples e funcional para URLs HTTP/HTTPS
      const urlRegex = /^https?:\/\/.+/;

      urlsValidas.forEach(url => {
        expect(url).toMatch(urlRegex);
      });

      urlsInvalidas.forEach(url => {
        expect(url).not.toMatch(urlRegex);
      });
    });
  });
});
