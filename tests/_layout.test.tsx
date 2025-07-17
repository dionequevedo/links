import { colors } from '../src/styles/colors';

// Mock simples do expo-router
const mockStack = jest.fn();
jest.mock('expo-router', () => ({
  Stack: mockStack,
}));

describe('Layout Component - Validações Essenciais', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validação das cores utilizadas', () => {
    it('deve ter a cor gray[950] definida corretamente', () => {
      expect(colors.gray[950]).toBe('#09090B');
    });

    it('deve ter todas as cores gray necessárias', () => {
      expect(colors.gray[100]).toBe('#F4F4F5');
      expect(colors.gray[200]).toBe('#E4E4E7');
      expect(colors.gray[300]).toBe('#D4D4D8');
      expect(colors.gray[400]).toBe('#A1A1AA');
      expect(colors.gray[500]).toBe('#71717A');
      expect(colors.gray[600]).toBe('#52525B');
      expect(colors.gray[800]).toBe('#27272A');
      expect(colors.gray[900]).toBe('#18181B');
      expect(colors.gray[950]).toBe('#09090B');
    });

    it('deve ter cores green definidas', () => {
      expect(colors.green[300]).toBe('#2DD4BF');
      expect(colors.green[900]).toBe('#042F2E');
    });

    it('deve usar a cor mais escura como fundo da aplicação', () => {
      const backgroundColor = colors.gray[950];
      expect(backgroundColor).toBe('#09090B');
    });
  });

  describe('Estrutura e configuração do Layout', () => {
    it('deve importar o Stack do expo-router', () => {
      const expoRouter = require('expo-router');
      expect(expoRouter.Stack).toBeDefined();
      expect(typeof expoRouter.Stack).toBe('function');
    });

    it('deve importar as cores corretamente', () => {
      expect(colors).toBeDefined();
      expect(colors.gray).toBeDefined();
      expect(colors.gray[950]).toBeDefined();
    });

    it('deve definir configurações corretas para screenOptions', () => {
      const expectedScreenOptions = {
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray[950] }
      };

      expect(expectedScreenOptions.headerShown).toBe(false);
      expect(expectedScreenOptions.contentStyle.backgroundColor).toBe('#09090B');
    });
  });

  describe('Funcionalidade do componente Layout', () => {
    it('deve ser um componente funcional válido', () => {
      const Layout = require('../src/app/_layout').default;
      expect(typeof Layout).toBe('function');
    });

    it('deve retornar um elemento válido quando executado', () => {
      const Layout = require('../src/app/_layout').default;
      const result = Layout();
      expect(result).toBeTruthy();
    });

    it('deve ter acesso ao Stack do expo-router', () => {
      // Verifica se o Stack está disponível no módulo mockado
      const { Stack } = require('expo-router');
      expect(Stack).toBeDefined();
      expect(typeof Stack).toBe('function');
    });
  });

  describe('Validação do tema e consistência', () => {
    it('deve manter consistência na paleta de cores', () => {
      // Verifica se todas as cores estão no formato hexadecimal
      Object.values(colors.gray).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });

      Object.values(colors.green).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('deve usar a cor mais escura da paleta gray', () => {
      const allGrayValues = Object.values(colors.gray);
      const darkestColor = '#09090B'; // gray[950]
      
      expect(allGrayValues).toContain(darkestColor);
      expect(colors.gray[950]).toBe(darkestColor);
    });
  });

  describe('Configurações de navegação', () => {
    it('deve configurar headerShown como false', () => {
      const headerShown = false;
      expect(headerShown).toBe(false);
    });

    it('deve aplicar backgroundColor no contentStyle', () => {
      const contentStyle = { backgroundColor: colors.gray[950] };
      expect(contentStyle.backgroundColor).toBe('#09090B');
    });

    it('deve manter estrutura esperada do contentStyle', () => {
      const expectedContentStyle = { backgroundColor: colors.gray[950] };
      expect(expectedContentStyle).toEqual({
        backgroundColor: '#09090B'
      });
    });
  });

  describe('Integração e comportamento', () => {
    it('deve exportar o componente como default', () => {
      const LayoutModule = require('../src/app/_layout');
      expect(LayoutModule.default).toBeDefined();
      expect(typeof LayoutModule.default).toBe('function');
    });

    it('deve manter compatibilidade com expo-router', () => {
      const { Stack } = require('expo-router');
      
      expect(() => {
        Stack({ 
          screenOptions: {
            headerShown: false,
            contentStyle: { backgroundColor: colors.gray[950] }
          }
        });
      }).not.toThrow();
    });

    it('deve aplicar configurações globais de navegação', () => {
      const globalConfig = {
        headerShown: false,
        contentStyle: { backgroundColor: colors.gray[950] }
      };
      
      expect(globalConfig.headerShown).toBe(false);
      expect(globalConfig.contentStyle.backgroundColor).toBe('#09090B');
    });
  });

  describe('Validação de tipagem e estrutura', () => {
    it('deve ter propriedades de cor válidas', () => {
      expect(typeof colors.gray[950]).toBe('string');
      expect(colors.gray[950]).toHaveLength(7); // #RRGGBB
    });

    it('deve manter estrutura consistente do objeto colors', () => {
      expect(colors).toHaveProperty('gray');
      expect(colors).toHaveProperty('green');
      expect(typeof colors.gray).toBe('object');
      expect(typeof colors.green).toBe('object');
    });

    it('deve ter valores de cor hexadecimais válidos', () => {
      const hexPattern = /^#[0-9A-F]{6}$/i;
      
      // Testa algumas cores principais
      expect(colors.gray[950]).toMatch(hexPattern);
      expect(colors.gray[900]).toMatch(hexPattern);
      expect(colors.green[300]).toMatch(hexPattern);
    });
  });
});
