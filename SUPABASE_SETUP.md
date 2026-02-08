# Supabase Setup Instructions

## 📋 Passo a Passo

### 1. Executar o Schema SQL

1. Acesse seu projeto no Supabase: https://ksiownddstajjcajzcrc.supabase.co
2. No menu lateral, clique em **SQL Editor**
3. Clique em **+ New query**
4. Copie todo o conteúdo do arquivo `supabase-schema.sql` (na raiz do projeto)
5. Cole no editor SQL
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a confirmação de sucesso ✅

### 2. Habilitar Autenticação por Email

1. No menu lateral, vá em **Authentication** → **Providers**
2. Encontre **Email** na lista
3. Certifique-se de que está **habilitado** (toggle verde)
4. **Desabilite** a opção "Confirm email" por enquanto (para facilitar testes)
   - Isso permite criar contas sem precisar confirmar o email
5. Clique em **Save**

### 3. Configurar URLs de Redirecionamento

1. Ainda em **Authentication**, vá em **URL Configuration**
2. Em **Site URL**, adicione: `http://localhost:5173`
3. Em **Redirect URLs**, adicione:
   - `http://localhost:5173`
   - `http://localhost:3000`
4. Clique em **Save**

### 4. Verificar Tabelas Criadas

1. No menu lateral, vá em **Table Editor**
2. Você deve ver 3 tabelas:
   - ✅ `transactions`
   - ✅ `category_rules`
   - ✅ `user_categories`

### 5. Testar a Aplicação

Agora você pode testar localmente:

```bash
npm run dev
```

**O que vai acontecer:**
1. Você verá a tela de login/cadastro
2. Crie uma conta com qualquer email (ex: `teste@teste.com`)
3. Após criar, faça login
4. As categorias padrão serão criadas automaticamente! 🎉

## 🔍 Verificação

Para verificar se tudo funcionou:

1. Crie uma conta de teste
2. Faça login
3. Vá em **Table Editor** → **user_categories**
4. Você deve ver 18 categorias criadas para seu usuário

## ⚠️ Problemas Comuns

**Erro ao executar SQL:**
- Certifique-se de copiar TODO o conteúdo do arquivo
- Execute novamente se necessário (o script é idempotente)

**Não consigo fazer login:**
- Verifique se a autenticação por email está habilitada
- Verifique se as URLs de redirecionamento estão corretas
- Veja os logs em Authentication → Logs

**Categorias não aparecem:**
- O trigger cria automaticamente no primeiro signup
- Se não funcionou, execute manualmente: `SELECT seed_default_categories();`

## 📝 Próximos Passos

Após executar o SQL e testar o login, me avise para eu continuar com:
- ✅ Refatoração do store para usar Supabase
- ✅ Criação dos services (transactionService, ruleService, etc.)
- ✅ Integração completa com a aplicação
