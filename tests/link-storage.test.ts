import AsyncStorage from '@react-native-async-storage/async-storage';
import { linkStorage, LinkStorage } from '../src/storage/link-storage';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('linkStorage', () => {
  // Limpa o storage antes de cada teste
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('deve retornar array vazio quando não há dados armazenados', async () => {
      const result = await linkStorage.get();
      expect(result).toEqual([]);
    });

    it('deve retornar os links armazenados', async () => {
      const mockLinks: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        },
        {
          id: '2',
          category: 'social',
          name: 'Facebook',
          url: 'https://facebook.com'
        },
        {
          id: '3',
          category: 'images',
          name: 'Instagram',
          url: 'https://instagram.com'
        },
        {
          id: '4',
          category: 'professional',
          name: 'Linkedin',
          url: 'https://linkedin.com'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(mockLinks));
      
      const result = await linkStorage.get();
      expect(result).toEqual(mockLinks);
    });

    it('deve retornar array vazio quando AsyncStorage retorna null', async () => {
      // Simula um valor null no storage
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValueOnce(null);
      
      const result = await linkStorage.get();
      expect(result).toEqual([]);
    });

    it('deve lidar com erros e retornar array vazio', async () => {
      // Simula um erro no AsyncStorage
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await linkStorage.get();
      
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching links:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('save', () => {
    it('deve salvar um novo link no storage vazio', async () => {
      const newLink: LinkStorage = {
        id: '1',
        category: 'tecnologia',
        name: 'Google',
        url: 'https://google.com/'
      };

      await linkStorage.save(newLink);
      
      const storedData = await AsyncStorage.getItem('links-storage');
      const parsedData = JSON.parse(storedData || '[]');
      
      expect(parsedData).toEqual([newLink]);
    });

    it('deve adicionar um novo link aos links existentes', async () => {
      const existingLinks: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(existingLinks));

      const newLink: LinkStorage = {
        id: '2',
        category: 'social',
        name: 'Facebook',
        url: 'https://facebook.com/'
      };

      await linkStorage.save(newLink);
      
      const storedData = await AsyncStorage.getItem('links-storage');
      const parsedData = JSON.parse(storedData || '[]');
      
      expect(parsedData).toEqual([...existingLinks, newLink]);
    });

    it('deve lançar erro quando AsyncStorage falha', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));
      
      const newLink: LinkStorage = {
        id: '1',
        category: 'tecnologia',
        name: 'Google',
        url: 'https://google.com'
      };

      await expect(linkStorage.save(newLink)).rejects.toThrow('Storage error');
    });
  });

  describe('remove', () => {
    it('deve remover um link específico', async () => {
      const links: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        },
        {
          id: '2',
          category: 'social',
          name: 'Facebook',
          url: 'https://facebook.com'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(links));
      
      await linkStorage.remove('1');
      
      const storedData = await AsyncStorage.getItem('links-storage');
      const parsedData = JSON.parse(storedData || '[]');
      
      expect(parsedData).toEqual([links[1]]);
    });

    it('deve remover completamente o item do storage quando não há mais links', async () => {
      const links: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(links));
      
      await linkStorage.remove('1');
      
      const storedData = await AsyncStorage.getItem('links-storage');
      
      expect(storedData).toBeNull();
    });

    it('deve não retornar nada quando remove o último item', async () => {
      const links: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(links));
      
      const result = await linkStorage.remove('1');
      
      expect(result).toBeUndefined();
    });

    it('deve manter outros links quando remove um específico', async () => {
      const links: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        },
        {
          id: '2',
          category: 'social',
          name: 'Facebook',
          url: 'https://facebook.com'
        },
        {
          id: '3',
          category: 'educacao',
          name: 'Wikipedia',
          url: 'https://wikipedia.org'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(links));
      
      await linkStorage.remove('2');
      
      const storedData = await AsyncStorage.getItem('links-storage');
      const parsedData = JSON.parse(storedData || '[]');
      
      expect(parsedData).toEqual([links[0], links[2]]);
    });

    it('deve não fazer nada quando tenta remover um ID que não existe', async () => {
      const links: LinkStorage[] = [
        {
          id: '1',
          category: 'tecnologia',
          name: 'Google',
          url: 'https://google.com'
        }
      ];

      await AsyncStorage.setItem('links-storage', JSON.stringify(links));
      
      await linkStorage.remove('999');
      
      const storedData = await AsyncStorage.getItem('links-storage');
      const parsedData = JSON.parse(storedData || '[]');
      
      expect(parsedData).toEqual(links);
    });
  });

  describe('integração - fluxo completo', () => {
    it('deve executar um fluxo completo de save, get e remove', async () => {
      // 1. Verificar que está vazio
      let links = await linkStorage.get();
      expect(links).toEqual([]);

      // 2. Adicionar primeiro link
      const link1: LinkStorage = {
        id: '1',
        category: 'tecnologia',
        name: 'Google',
        url: 'https://google.com'
      };
      await linkStorage.save(link1);

      // 3. Verificar que foi salvo
      links = await linkStorage.get();
      expect(links).toEqual([link1]);

      // 4. Adicionar segundo link
      const link2: LinkStorage = {
        id: '2',
        category: 'social',
        name: 'Facebook',
        url: 'https://facebook.com'
      };
      await linkStorage.save(link2);

      // 5. Verificar que ambos estão salvos
      links = await linkStorage.get();
      expect(links).toEqual([link1, link2]);

      // 6. Remover o primeiro link
      await linkStorage.remove('1');

      // 7. Verificar que só o segundo permanece
      links = await linkStorage.get();
      expect(links).toEqual([link2]);

      // 8. Remover o último link
      await linkStorage.remove('2');

      // 9. Verificar que está vazio novamente
      links = await linkStorage.get();
      expect(links).toEqual([]);
    });
  });
});
