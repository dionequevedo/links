# Testes do Layout Component

Este arquivo contém os testes para validar o funcionamento correto do componente `_layout.tsx`.

## O que é testado:

### 1. **Validação das cores utilizadas**
- ✅ Cor `gray[950]` definida corretamente (`#09090B`)
- ✅ Todas as cores da paleta gray estão presentes e corretas
- ✅ Cores green estão definidas corretamente
- ✅ Uso da cor mais escura como fundo da aplicação

### 2. **Estrutura e configuração do Layout**
- ✅ Importação correta do Stack do expo-router
- ✅ Importação correta das cores do sistema
- ✅ Configurações corretas para screenOptions

### 3. **Funcionalidade do componente Layout**
- ✅ Componente é uma função válida
- ✅ Retorna um elemento válido quando executado
- ✅ Tem acesso ao Stack do expo-router

### 4. **Validação do tema e consistência**
- ✅ Consistência na paleta de cores (formato hexadecimal)
- ✅ Uso da cor mais escura da paleta gray

### 5. **Configurações de navegação**
- ✅ `headerShown` configurado como `false`
- ✅ `backgroundColor` aplicado no `contentStyle`
- ✅ Estrutura esperada do `contentStyle`

### 6. **Integração e comportamento**
- ✅ Exportação como default do componente
- ✅ Compatibilidade com expo-router
- ✅ Configurações globais de navegação aplicadas

### 7. **Validação de tipagem e estrutura**
- ✅ Propriedades de cor válidas
- ✅ Estrutura consistente do objeto colors
- ✅ Valores hexadecimais válidos

## Configurações validadas:

```typescript
// Configurações esperadas do Layout
const expectedScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: "#09090B" }
};
```

## Como executar:

```bash
# Executar apenas os testes do _layout
npm test -- --testPathPattern="_layout.test.tsx"

# Executar todos os testes
npm test
```

## Mocks utilizados:

- **expo-router**: Mock simples do Stack para permitir teste sem dependências externas
- **colors**: Importação real do sistema de cores para validação

## Total de testes: 21 ✅

Todos os testes validam aspectos essenciais do componente Layout, garantindo que:
- As cores estão corretas e consistentes
- A configuração de navegação está adequada
- O componente funciona como esperado
- A integração com expo-router está funcionando
- A tipagem e estrutura estão consistentes
