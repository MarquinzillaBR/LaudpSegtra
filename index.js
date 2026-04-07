import { supabase } from './lib/supabase.js';

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const navLinks = document.querySelectorAll(".nav-link");
const sections = {
  dashboard: document.getElementById("dashboardSection"),
  empresas: document.getElementById("empresasSection"),
  funcionarios: document.getElementById("funcionariosSection"),
  modulos: document.getElementById("modulosSection")
};

let currentUser = null;
let companies = [];
let employees = [];

const companyModal = document.getElementById("companyModal");
const employeeModal = document.getElementById("employeeModal");
const companyForm = document.getElementById("companyForm");
const employeeForm = document.getElementById("employeeForm");

const companyFields = {
  id: document.getElementById("companyId"),
  cnpj: document.getElementById("companyCnpj"),
  name: document.getElementById("companyName"),
  tradeName: document.getElementById("companyTradeName"),
  cnae: document.getElementById("companyCnae"),
  activity: document.getElementById("companyActivity"),
  risk: document.getElementById("companyRisk"),
  phone: document.getElementById("companyPhone"),
  address: document.getElementById("companyAddress")
};

const employeeFields = {
  id: document.getElementById("employeeId"),
  name: document.getElementById("employeeName"),
  cpf: document.getElementById("employeeCpf"),
  companyId: document.getElementById("employeeCompany"),
  ctps: document.getElementById("employeeCtps"),
  pis: document.getElementById("employeePis"),
  role: document.getElementById("employeeRole"),
  cbo: document.getElementById("employeeCbo"),
  admission: document.getElementById("employeeAdmission")
};

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = '/auth.html';
    return null;
  }

  currentUser = session.user;
  return currentUser;
}

async function handleLogout() {
  if (confirm('Deseja sair do sistema?')) {
    await supabase.auth.signOut();
    window.location.href = '/auth.html';
  }
}

async function loadCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar empresas:', error);
    return [];
  }

  return data || [];
}

async function loadEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar funcionários:', error);
    return [];
  }

  return data || [];
}

async function saveCompany(companyData) {
  const payload = {
    ...companyData,
    user_id: currentUser.id,
    updated_at: new Date().toISOString()
  };

  if (companyData.id) {
    const { data, error } = await supabase
      .from('companies')
      .update(payload)
      .eq('id', companyData.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('companies')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

async function deleteCompany(companyId) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) throw error;
}

async function saveEmployee(employeeData) {
  const payload = {
    ...employeeData,
    user_id: currentUser.id,
    updated_at: new Date().toISOString()
  };

  if (employeeData.id) {
    const { data, error } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', employeeData.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('employees')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

async function deleteEmployee(employeeId) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);

  if (error) throw error;
}

function toggleSidebar() {
  sidebar.classList.toggle("is-open");
  overlay.classList.toggle("is-visible");
}

function closeSidebar() {
  sidebar.classList.remove("is-open");
  overlay.classList.remove("is-visible");
}

function setActiveSection(sectionName) {
  Object.entries(sections).forEach(([key, section]) => {
    section.classList.toggle("is-visible", key === sectionName);
  });

  navLinks.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === sectionName);
  });

  if (window.innerWidth <= 820) closeSidebar();
}

function openModal(modal) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function formatDocument(value, type) {
  const digits = value.replace(/\D/g, "");

  if (type === "cnpj") {
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  }

  if (type === "cpf") {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
  }

  return value;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function getSelectedLaudos() {
  return Array.from(document.querySelectorAll('input[name="laudo"]:checked')).map((input) => input.value);
}

function setSelectedLaudos(values) {
  document.querySelectorAll('input[name="laudo"]').forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function companyEmployeeCount(companyId) {
  return employees.filter((employee) => employee.company_id === companyId).length;
}

function documentCounts() {
  const counts = { ASO: 0, PGR: 0, LTCAT: 0, PCMSO: 0, PPP: 0 };
  employees.forEach((employee) => {
    const empLaudos = employee.laudos || [];
    empLaudos.forEach((laudo) => {
      if (counts[laudo] !== undefined) counts[laudo] += 1;
    });
  });
  return counts;
}

function renderDashboard() {
  document.getElementById("companiesCount").textContent = companies.length;
  document.getElementById("employeesCount").textContent = employees.length;
  document.getElementById("companiesWithEmployeesCount").textContent = companies.filter((company) => companyEmployeeCount(company.id) > 0).length;

  const counts = documentCounts();
  document.getElementById("countASO").textContent = counts.ASO;
  document.getElementById("countPGR").textContent = counts.PGR;
  document.getElementById("countLTCAT").textContent = counts.LTCAT;
  document.getElementById("countPCMSO").textContent = counts.PCMSO;
  document.getElementById("countPPP").textContent = counts.PPP;

  const companyWithMostEmployees = companies
    .map((company) => ({ ...company, totalEmployees: companyEmployeeCount(company.id) }))
    .sort((a, b) => b.totalEmployees - a.totalEmployees)[0];
  const latestEmployee = [...employees].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  const items = [
    {
      label: "Empresa com mais funcionários",
      value: companyWithMostEmployees ? `${companyWithMostEmployees.name} (${companyWithMostEmployees.totalEmployees})` : "Nenhuma empresa cadastrada"
    },
    {
      label: "Último funcionário cadastrado",
      value: latestEmployee ? latestEmployee.name : "Nenhum funcionário cadastrado"
    },
    {
      label: "Total de laudos vinculados",
      value: Object.values(counts).reduce((total, current) => total + current, 0)
    }
  ];

  document.getElementById("dashboardSummary").innerHTML = items.map((item) => `
    <div class="summary-item">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </div>
  `).join("");
}

function renderCompanyOptions() {
  const currentValue = employeeFields.companyId.value;
  employeeFields.companyId.innerHTML = ['<option value="">Selecione a empresa</option>']
    .concat(companies.map((company) => `<option value="${company.id}">${company.name}</option>`))
    .join("");
  employeeFields.companyId.value = currentValue;
}

function renderCompanies() {
  const search = document.getElementById("companySearch").value.trim().toLowerCase();
  const filtered = companies.filter((company) => [company.name, company.trade_name, company.cnpj, company.address].join(" ").toLowerCase().includes(search));
  const list = document.getElementById("companiesList");

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">Nenhuma empresa encontrada. Clique em "Nova empresa" para cadastrar.</div>';
    return;
  }

  list.innerHTML = filtered.map((company) => `
    <article class="entity-card">
      <div class="entity-card__top">
        <div>
          <h3>${company.name}</h3>
          <p>${company.trade_name || "Sem nome fantasia"}</p>
        </div>
        <span class="tag">${company.risk || "Sem grau de risco"}</span>
      </div>
      <div class="entity-card__meta">
        <span class="tag">${company.cnpj || "Sem CNPJ"}</span>
        <span class="tag">${company.cnae || "Sem CNAE"}</span>
        <span class="tag">${companyEmployeeCount(company.id)} funcionário(s)</span>
      </div>
      <div class="entity-card__details">
        <div class="detail-item"><span>Atividade</span><strong>${company.activity || "Não informado"}</strong></div>
        <div class="detail-item"><span>Endereço</span><strong>${company.address || "Não informado"}</strong></div>
        <div class="detail-item"><span>Telefone</span><strong>${company.phone || "Não informado"}</strong></div>
      </div>
      <div class="entity-card__actions">
        <button class="text-button" data-edit-company="${company.id}">Editar</button>
        <button class="text-button text-button--danger" data-delete-company="${company.id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

function renderEmployees() {
  const search = document.getElementById("employeeSearch").value.trim().toLowerCase();
  const filtered = employees.filter((employee) => {
    const companyName = companies.find((company) => company.id === employee.company_id)?.name || "";
    return [employee.name, employee.cpf, employee.role, employee.cbo, companyName].join(" ").toLowerCase().includes(search);
  });
  const list = document.getElementById("employeesList");

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">Nenhum funcionário encontrado. Clique em "Novo funcionário" para cadastrar.</div>';
    return;
  }

  list.innerHTML = filtered.map((employee) => {
    const companyName = companies.find((company) => company.id === employee.company_id)?.name || "Sem empresa vinculada";
    const empLaudos = employee.laudos || [];
    const laudos = empLaudos.length ? empLaudos : ["Nenhum laudo"];

    return `
      <article class="entity-card">
        <div class="entity-card__top">
          <div>
            <h3>${employee.name}</h3>
            <p>${employee.role || "Função não informada"}</p>
          </div>
          <span class="tag">${companyName}</span>
        </div>
        <div class="entity-card__meta">
          <span class="tag">${employee.cpf}</span>
          <span class="tag">${employee.cbo || "Sem CBO"}</span>
          <span class="tag">${employee.admission || "Sem admissão"}</span>
        </div>
        <div class="entity-card__details">
          <div class="detail-item"><span>CTPS</span><strong>${employee.ctps || "Não informado"}</strong></div>
          <div class="detail-item"><span>PIS</span><strong>${employee.pis || "Não informado"}</strong></div>
        </div>
        <div class="laudo-list">${laudos.map((laudo) => `<span class="tag">${laudo}</span>`).join("")}</div>
        <div class="entity-card__actions">
          <button class="text-button" data-edit-employee="${employee.id}">Editar</button>
          <button class="text-button text-button--danger" data-delete-employee="${employee.id}">Excluir</button>
        </div>
      </article>
    `;
  }).join("");
}

async function refreshUI() {
  companies = await loadCompanies();
  employees = await loadEmployees();
  renderCompanyOptions();
  renderDashboard();
  renderCompanies();
  renderEmployees();
}

function resetCompanyForm() {
  companyForm.reset();
  companyFields.id.value = "";
  document.getElementById("companyModalTitle").textContent = "Nova empresa";
}

function resetEmployeeForm() {
  employeeForm.reset();
  employeeFields.id.value = "";
  setSelectedLaudos([]);
  document.getElementById("employeeModalTitle").textContent = "Novo funcionário";
  renderCompanyOptions();
}

function openCompanyForEdit(companyId) {
  const company = companies.find((item) => item.id === companyId);
  if (!company) return;
  companyFields.id.value = company.id;
  companyFields.cnpj.value = company.cnpj || "";
  companyFields.name.value = company.name || "";
  companyFields.tradeName.value = company.trade_name || "";
  companyFields.cnae.value = company.cnae || "";
  companyFields.activity.value = company.activity || "";
  companyFields.risk.value = company.risk || "";
  companyFields.phone.value = company.phone || "";
  companyFields.address.value = company.address || "";
  document.getElementById("companyModalTitle").textContent = "Editar empresa";
  openModal(companyModal);
}

function openEmployeeForEdit(employeeId) {
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return;
  renderCompanyOptions();
  employeeFields.id.value = employee.id;
  employeeFields.name.value = employee.name || "";
  employeeFields.cpf.value = employee.cpf || "";
  employeeFields.companyId.value = employee.company_id || "";
  employeeFields.ctps.value = employee.ctps || "";
  employeeFields.pis.value = employee.pis || "";
  employeeFields.role.value = employee.role || "";
  employeeFields.cbo.value = employee.cbo || "";
  employeeFields.admission.value = employee.admission || "";
  setSelectedLaudos(employee.laudos || []);
  document.getElementById("employeeModalTitle").textContent = "Editar funcionário";
  openModal(employeeModal);
}

async function lookupCnpj() {
  const cnpjDigits = companyFields.cnpj.value.replace(/\D/g, "");
  if (cnpjDigits.length !== 14) {
    alert("Digite um CNPJ válido com 14 números.");
    return;
  }

  const button = document.getElementById("lookupCnpjButton");
  button.disabled = true;
  button.textContent = "Buscando...";

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`);
    if (!response.ok) throw new Error("CNPJ não encontrado.");
    const data = await response.json();

    companyFields.name.value = data.razao_social || companyFields.name.value;
    companyFields.tradeName.value = data.nome_fantasia || companyFields.tradeName.value;
    companyFields.cnae.value = data.cnae_fiscal || companyFields.cnae.value;
    companyFields.activity.value = data.descricao_atividade_principal || companyFields.activity.value;
    companyFields.phone.value = data.ddd_telefone_1 ? formatPhone(data.ddd_telefone_1) : companyFields.phone.value;
    companyFields.address.value = [data.logradouro, data.numero, data.bairro, data.municipio, data.uf].filter(Boolean).join(", ");
  } catch (error) {
    alert(error.message || "Não foi possível consultar o CNPJ agora.");
  } finally {
    button.disabled = false;
    button.textContent = "Buscar CNPJ";
  }
}

menuToggle?.addEventListener("click", toggleSidebar);
overlay?.addEventListener("click", closeSidebar);
window.addEventListener("resize", () => { if (window.innerWidth > 820) closeSidebar(); });
navLinks.forEach((button) => button.addEventListener("click", () => setActiveSection(button.dataset.section)));

document.getElementById("logoutButton")?.addEventListener("click", handleLogout);

document.getElementById("newCompanyButton").addEventListener("click", () => {
  resetCompanyForm();
  openModal(companyModal);
});

document.getElementById("newEmployeeButton").addEventListener("click", () => {
  resetEmployeeForm();
  openModal(employeeModal);
});

document.getElementById("lookupCnpjButton").addEventListener("click", lookupCnpj);
companyFields.cnpj.addEventListener("input", (event) => { event.target.value = formatDocument(event.target.value, "cnpj"); });
companyFields.phone.addEventListener("input", (event) => { event.target.value = formatPhone(event.target.value); });
employeeFields.cpf.addEventListener("input", (event) => { event.target.value = formatDocument(event.target.value, "cpf"); });

companyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    id: companyFields.id.value || undefined,
    cnpj: companyFields.cnpj.value.trim(),
    name: companyFields.name.value.trim(),
    trade_name: companyFields.tradeName.value.trim(),
    cnae: companyFields.cnae.value.trim(),
    activity: companyFields.activity.value.trim(),
    risk: companyFields.risk.value,
    phone: companyFields.phone.value.trim(),
    address: companyFields.address.value.trim()
  };

  try {
    await saveCompany(payload);
    await refreshUI();
    closeModal(companyModal);
    resetCompanyForm();
  } catch (error) {
    alert('Erro ao salvar empresa: ' + error.message);
  }
});

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    id: employeeFields.id.value || undefined,
    name: employeeFields.name.value.trim(),
    cpf: employeeFields.cpf.value.trim(),
    company_id: employeeFields.companyId.value,
    ctps: employeeFields.ctps.value.trim(),
    pis: employeeFields.pis.value.trim(),
    role: employeeFields.role.value.trim(),
    cbo: employeeFields.cbo.value.trim(),
    admission: employeeFields.admission.value,
    laudos: getSelectedLaudos()
  };

  try {
    await saveEmployee(payload);
    await refreshUI();
    closeModal(employeeModal);
    resetEmployeeForm();
  } catch (error) {
    alert('Erro ao salvar funcionário: ' + error.message);
  }
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => closeModal(document.getElementById(button.dataset.closeModal)));
});

document.addEventListener("click", async (event) => {
  const editCompanyId = event.target.dataset.editCompany;
  const deleteCompanyId = event.target.dataset.deleteCompany;
  const editEmployeeId = event.target.dataset.editEmployee;
  const deleteEmployeeId = event.target.dataset.deleteEmployee;

  if (editCompanyId) openCompanyForEdit(editCompanyId);

  if (deleteCompanyId) {
    if (companyEmployeeCount(deleteCompanyId) > 0) {
      alert("Esta empresa possui funcionários vinculados. Remova ou edite esses funcionários antes de excluir.");
      return;
    }
    if (confirm("Deseja excluir esta empresa?")) {
      try {
        await deleteCompany(deleteCompanyId);
        await refreshUI();
      } catch (error) {
        alert('Erro ao excluir empresa: ' + error.message);
      }
    }
  }

  if (editEmployeeId) openEmployeeForEdit(editEmployeeId);

  if (deleteEmployeeId && confirm("Deseja excluir este funcionário?")) {
    try {
      await deleteEmployee(deleteEmployeeId);
      await refreshUI();
    } catch (error) {
      alert('Erro ao excluir funcionário: ' + error.message);
    }
  }
});

document.getElementById("companySearch").addEventListener("input", renderCompanies);
document.getElementById("employeeSearch").addEventListener("input", renderEmployees);

async function init() {
  await checkAuth();
  await refreshUI();
  setActiveSection("dashboard");
}

init();
