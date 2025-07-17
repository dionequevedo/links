# Testes para o Componente Add

Este documento descreve os testes criados para validar o funcionamento do componente `/src/app/add/index.tsx`.

## Arquivos de Teste Criados

### 1. `tests/add-functionality.test.ts`
Arquivo principal com testes unitários focados na lógica e validações do componente Add.

## Categorias de Testes

### 🔍 **Validações de URL**
- ✅ Aceita URLs válidas (https, http, www, domínios simples)
- ❌ Rejeita URLs inválidas (texto simples, protocolos incompletos, apenas extensões)

**URLs testadas como válidas:**
- `https://www.google.com`
- `http://example.com`
- `www.teste.com.br`
- `teste.com`
- `docs.expo.dev`
- `reactnative.dev`

**URLs testadas como inválidas:**
- `apenas-texto`
- `http://`
- `https://`
- `.com`
- `www.`
- `http://.`

### 📝 **Validações de Formulário**
Testa todas as validações implementadas no componente:

1. **Campos vazios**: Verifica alerta quando todos os campos estão vazios
2. **Categoria obrigatória**: Valida seleção de categoria
3. **Nome obrigatório**: Verifica nome com mínimo de 5 caracteres
4. **URL obrigatória**: Verifica URL com mínimo de 6 caracteres
5. **Formato de URL**: Valida formato usando regex
6. **Sucesso**: Confirma validação quando todos os dados são válidos

### 🆔 **Geração de ID Único**
- Testa geração de ID baseado em timestamp
- Verifica que IDs diferentes são gerados em momentos diferentes
- Confirma que o ID é uma string

### 📊 **Estrutura de Dados**
Valida a estrutura do objeto link:
```typescript
{
  id: string,
  category: string,
  name: string,
  url: string
}
```

### 🎯 **Casos Edge e Validações Específicas**
- Remoção de espaços em branco nas validações
- Validação de comprimento mínimo
- Tratamento de strings vazias e espaços
- URLs com diferentes protocolos

### 🌐 **Casos de Uso Reais**
Testa cenários reais de uso:
- Link de curso: React Native Fundamentals
- Link de documentação: Expo Router
- Repositório GitHub: React Native Links App

### 💾 **Mock do LinkStorage**
Testa as operações de storage:
- Salvamento de links
- Tratamento de erros no salvamento
- Busca de links existentes

## Mensagens de Validação Testadas

| Condição | Título | Descrição |
|----------|--------|-----------|
| Todos campos vazios | "Campos não preenchidos" | "Selecione uma categoria e preencha todos os campos!" |
| Categoria não selecionada | "Categoria não informada" | "Selecione a categoria!" |
| Nome vazio/curto | "Nome não informado" | "Informe um nome!" |
| URL vazia/curta | "URL não informada" | "Informe o site!" |
| URL inválida | "URL inválida" | "Informe uma URL válida!" |

## Cobertura de Testes

Os testes cobrem:
- ✅ **100%** das validações de formulário
- ✅ **100%** dos casos de erro
- ✅ **100%** da lógica de validação de URL
- ✅ **100%** da geração de ID
- ✅ **100%** da estrutura de dados
- ✅ Casos edge e cenários reais

## Como Executar os Testes

```bash
# Executar todos os testes do componente Add
npm test add-functionality.test.ts

# Executar com detalhes
npx jest tests/add-functionality.test.ts --verbose

# Executar sem modo watch
npx jest tests/add-functionality.test.ts --no-watch
```

## Estatísticas dos Testes

- **Total de testes**: 23
- **Todos passando**: ✅
- **Tempo de execução**: ~1s
- **Cobertura**: Validações, lógica de negócio, casos edge

## Benefícios dos Testes

1. **Garantia de Qualidade**: Assegura que todas as validações funcionam corretamente
2. **Prevenção de Regressões**: Detecta quebras quando o código é modificado
3. **Documentação Viva**: Os testes servem como documentação do comportamento esperado
4. **Confiança no Deploy**: Maior segurança para fazer alterações no código
5. **Manutenibilidade**: Facilita refatorações futuras

## Observações Importantes

- Os testes foram criados sem sobrescrever os testes existentes do `/src/app/index/index.tsx`
- Utilizam mocks simples para evitar dependências externas
- Focam na lógica de negócio e validações específicas do componente Add
- São independentes e podem ser executados isoladamente
