/*
  # Schema SST - Sistema de Segurança do Trabalho

  1. Novas Tabelas
    - `companies` (empresas)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `cnpj` (text)
      - `name` (text, razão social)
      - `trade_name` (text, nome fantasia)
      - `cnae` (text)
      - `activity` (text)
      - `risk` (text, grau de risco)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `employees` (funcionários)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `company_id` (uuid, foreign key para companies)
      - `name` (text, nome completo)
      - `cpf` (text)
      - `ctps` (text)
      - `pis` (text)
      - `role` (text, função)
      - `cbo` (text, código CBO)
      - `admission` (date, data de admissão)
      - `laudos` (jsonb, array de laudos vinculados)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ltcat_reports` (laudos LTCAT)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `company_id` (uuid, foreign key para companies)
      - `employee_id` (uuid, foreign key para employees, nullable)
      - `report_number` (text, número do laudo)
      - `activity_type` (text, tipo de atividade)
      - `issue_date` (date)
      - `assessment_date` (date)
      - `sector` (text, setor avaliado)
      - `evaluated_role` (text, função avaliada)
      - `purpose` (text, objetivo)
      - `logo_url` (text, URL da logo)
      - `introduction` (text)
      - `legal_basis` (text)
      - `technical_analysis` (text)
      - `activity_details` (text)
      - `exposure_framework` (text)
      - `neutralization` (text)
      - `conclusion` (text)
      - `technical_lead` (text, responsável técnico)
      - `technical_registry` (text, registro profissional)
      - `photo_memory` (text, observações da memória fotográfica)
      - `agents` (jsonb, tabela de agentes nocivos)
      - `photos` (jsonb, array de fotos)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados verem apenas seus próprios dados
    - Políticas de INSERT, UPDATE, DELETE restritas ao proprietário
*/

-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cnpj text DEFAULT '',
  name text NOT NULL,
  trade_name text DEFAULT '',
  cnae text DEFAULT '',
  activity text DEFAULT '',
  risk text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cpf text NOT NULL,
  ctps text DEFAULT '',
  pis text DEFAULT '',
  role text DEFAULT '',
  cbo text DEFAULT '',
  admission date,
  laudos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de laudos LTCAT
CREATE TABLE IF NOT EXISTS ltcat_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  report_number text DEFAULT '',
  activity_type text DEFAULT 'custom',
  issue_date date,
  assessment_date date,
  sector text DEFAULT '',
  evaluated_role text DEFAULT '',
  purpose text DEFAULT '',
  logo_url text DEFAULT '',
  introduction text DEFAULT '',
  legal_basis text DEFAULT '',
  technical_analysis text DEFAULT '',
  activity_details text DEFAULT '',
  exposure_framework text DEFAULT '',
  neutralization text DEFAULT '',
  conclusion text DEFAULT '',
  technical_lead text DEFAULT '',
  technical_registry text DEFAULT '',
  photo_memory text DEFAULT '',
  agents jsonb DEFAULT '[]'::jsonb,
  photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE ltcat_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para companies
CREATE POLICY "Usuários podem ver suas próprias empresas"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias empresas"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias empresas"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias empresas"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para employees
CREATE POLICY "Usuários podem ver seus próprios funcionários"
  ON employees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios funcionários"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios funcionários"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios funcionários"
  ON employees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para ltcat_reports
CREATE POLICY "Usuários podem ver seus próprios laudos"
  ON ltcat_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios laudos"
  ON ltcat_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios laudos"
  ON ltcat_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios laudos"
  ON ltcat_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_ltcat_reports_user_id ON ltcat_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ltcat_reports_company_id ON ltcat_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_ltcat_reports_employee_id ON ltcat_reports(employee_id);
