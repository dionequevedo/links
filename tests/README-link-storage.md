# Testes do Storage

Este diretório contém os testes automatizados para validar o funcionamento do sistema de storage da aplicação.

## Estrutura dos Testes

### `link-storage.test.ts`
Arquivo principal de testes que valida todas as funcionalidades do `linkStorage`:

#### **Testes da função `get()`**
- ✅ Retorna array vazio quando não há dados armazenados
- ✅ Retorna os links armazenados corretamente
- ✅ Retorna array vazio quando AsyncStorage retorna null
- ✅ Lida com erros e retorna array vazio

#### **Testes da função `save()`**
- ✅ Salva um novo link no storage vazio
- ✅ Adiciona um novo link aos links existentes
- ✅ Lança erro quando AsyncStorage falha

#### **Testes da função `remove()`**
- ✅ Remove um link específico
- ✅ Remove completamente o item do storage quando não há mais links
- ✅ Não retorna nada (void) quando remove um item
- ✅ Mantém outros links quando remove um específico
- ✅ Não faz nada quando tenta remover um ID que não existe

#### **Teste de Integração**
- ✅ Executa um fluxo completo de save, get e remove

## Como Executar os Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes uma única vez (sem watch mode)
```bash
npm test -- --watchAll=false
```

### Executar testes com coverage
```bash
npm test -- --coverage
```

### Executar apenas os testes do storage
```bash
npm test -- tests/link-storage.test.ts
```

## Configuração

Os testes utilizam:
- **Jest** como framework de testes
- **jest-expo** como preset para aplicações Expo
- **AsyncStorage Mock** para simular o comportamento do AsyncStorage

### Configuração do Jest (package.json)
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"],
    "testMatch": ["<rootDir>/tests/**/*.test.{js,ts,tsx}"],
    "collectCoverageFrom": [
      "src/**/*.{js,ts,tsx}",
      "!src/**/*.d.ts"
    ]
  }
}
```

## Cobertura de Testes

Os testes cobrem:
- ✅ Cenários de sucesso
- ✅ Tratamento de erros
- ✅ Estados vazios
- ✅ Operações CRUD completas
- ✅ Casos edge (IDs inexistentes, dados corrompidos)

## Dependências de Teste

```json
{
  "@types/jest": "^29.x.x",
  "@testing-library/react-native": "^12.x.x",
  "jest": "^29.x.x",
  "jest-expo": "~53.x.x"
}
```

## Observações

- O AsyncStorage é mockado para não interferir com dados reais
- Cada teste limpa o storage antes da execução
- Os testes são isolados e não dependem uns dos outros
- A função `remove()` foi refatorada para retornar `void` ao invés de array
