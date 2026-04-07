# Painel SST - Sistema de Gestão de Segurança do Trabalho

Sistema completo de gestão de laudos de SST com autenticação de usuários e banco de dados integrado.

## Funcionalidades Implementadas

### 1. Autenticação de Usuários
- Tela de login e cadastro com tema verde e preto
- Email e senha (mínimo 6 caracteres)
- Cada usuário vê apenas seus próprios dados
- Sessão persistente
- Botão de logout no menu lateral

### 2. Banco de Dados Supabase
Todas as informações são salvas no banco de dados:

#### Tabelas criadas:
- **companies**: Empresas cadastradas
- **employees**: Funcionários vinculados às empresas
- **ltcat_reports**: Laudos LTCAT (preparado para expansão)

#### Segurança:
- Row Level Security (RLS) habilitado em todas as tabelas
- Usuários só podem ver/editar seus próprios dados
- Políticas de segurança para SELECT, INSERT, UPDATE e DELETE

### 3. Gestão de Empresas
- Cadastro completo (CNPJ, razão social, nome fantasia, CNAE, etc)
- Busca automática de dados por CNPJ (API Brasil)
- Listagem, edição e exclusão
- Busca por campos

### 4. Gestão de Funcionários
- Cadastro completo (nome, CPF, CTPS, PIS, função, CBO)
- Vinculação à empresa
- Seleção de laudos vinculados (ASO, PGR, LTCAT, PCMSO, PPP)
- Listagem, edição e exclusão
- Busca por campos

### 5. Dashboard
- Estatísticas em tempo real
- Contadores de empresas e funcionários
- Contadores de laudos vinculados
- Resumo rápido do sistema

### 6. Módulos de Laudos
- ASO, PGR, LTCAT, PCMSO e PPP
- Estrutura modular preparada para expansão

## Como Usar

### 1. Criar Conta
- Acesse `/auth.html`
- Clique em "Criar conta"
- Preencha email e senha
- Confirme a senha
- Clique em "Criar conta"

### 2. Fazer Login
- Digite email e senha
- Clique em "Entrar"

### 3. Cadastrar Empresas
- Vá em "Empresas" no menu lateral
- Clique em "Nova empresa"
- Preencha os dados (pode usar "Buscar CNPJ")
- Salve

### 4. Cadastrar Funcionários
- Vá em "Funcionários" no menu lateral
- Clique em "Novo funcionário"
- Selecione a empresa
- Preencha os dados
- Marque os laudos vinculados
- Salve

### 5. Sair do Sistema
- Clique em "Sair" no menu lateral
- Confirme a ação

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript (ES Modules)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: Supabase PostgreSQL
- **Build**: Vite
- **Fonte**: Barlow (Google Fonts)

## Tema Visual

- **Cores principais**: Verde (#0f7a4d, #17965f) e Preto (#0a0e0d, #151a18)
- **Design**: Moderno, clean e profissional
- **Responsivo**: Funciona em desktop, tablet e mobile

## Estrutura do Projeto

```
/
├── auth.html           # Tela de login/cadastro
├── auth.css            # Estilos da autenticação
├── auth.js             # Lógica de autenticação
├── index.html          # Dashboard principal
├── index.css           # Estilos do dashboard
├── index.js            # Lógica do dashboard
├── lib/
│   └── supabase.js     # Cliente Supabase configurado
├── ASO/                # Módulo ASO
├── PGR/                # Módulo PGR
├── LTCAT/              # Módulo LTCAT
├── PCMSO/              # Módulo PCMSO
└── PPP/                # Módulo PPP
```

## Próximos Passos

Para evoluir o sistema:

1. **Integrar LTCAT com banco de dados**: Salvar laudos completos
2. **Upload de logos**: Integrar Supabase Storage
3. **Upload de fotos**: Memória fotográfica no banco
4. **Gerar PDF**: Exportação de laudos
5. **Relatórios**: Dashboards avançados
6. **Notificações**: Vencimentos de laudos
7. **Permissões**: Diferentes níveis de acesso

## Observações Importantes

- Os dados são isolados por usuário (segurança RLS)
- Build funcionando corretamente
- Pronto para deploy
- Tema personalizado verde e preto conforme solicitado
