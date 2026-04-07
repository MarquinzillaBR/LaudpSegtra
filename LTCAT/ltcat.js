const STORAGE_KEYS = {
  companies: "sst_companies",
  employees: "sst_employees"
};

const companySelect = document.getElementById("companySelect");
const employeeSelect = document.getElementById("employeeSelect");
const activityType = document.getElementById("activityType");
const logoInput = document.getElementById("logoInput");
const photoInput = document.getElementById("photoInput");
const logoPreview = document.getElementById("logoPreview");
const previewLogo = document.getElementById("previewLogo");
const agentsTableBody = document.getElementById("agentsTableBody");
const previewAgentsTableBody = document.getElementById("previewAgentsTableBody");
const photoPreviewGrid = document.getElementById("photoPreviewGrid");
const previewPhotoGrid = document.getElementById("previewPhotoGrid");
const toast = document.getElementById("toast");
const confirmModal = document.getElementById("confirmModal");
const confirmBackdrop = document.getElementById("confirmBackdrop");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");

const fields = {
  reportNumber: document.getElementById("reportNumber"),
  issueDate: document.getElementById("issueDate"),
  assessmentDate: document.getElementById("assessmentDate"),
  sector: document.getElementById("sector"),
  evaluatedRole: document.getElementById("evaluatedRole"),
  purpose: document.getElementById("purpose"),
  introduction: document.getElementById("introduction"),
  legalBasis: document.getElementById("legalBasis"),
  technicalAnalysis: document.getElementById("technicalAnalysis"),
  activityDetails: document.getElementById("activityDetails"),
  exposureFramework: document.getElementById("exposureFramework"),
  neutralization: document.getElementById("neutralization"),
  conclusion: document.getElementById("conclusion"),
  technicalLead: document.getElementById("technicalLead"),
  technicalRegistry: document.getElementById("technicalRegistry"),
  photoMemory: document.getElementById("photoMemory")
};

let companies = loadStorage(STORAGE_KEYS.companies);
let employees = loadStorage(STORAGE_KEYS.employees).map((employee) => ({
  ...employee,
  laudos: Array.isArray(employee.laudos) ? employee.laudos : []
}));
let agentRows = [];
let uploadedPhotos = [];
let pendingDeleteRowId = null;
let toastTimer = null;

const SHARED_LEGAL_BASIS = `A legislacao utilizada na elaboracao deste laudo pericial segue abaixo:

- Lei 8.213/1991.
- Decretos n. 53.831, de 1964, e n. 83.080, de 1979.
- Anexo IV do Decreto n. 2.172, de 1997.
- Anexo IV do Decreto n. 3.048, de 1999.
- Ocupacoes previstas nos Anexos dos Decretos n. 53.831, de 1964, e n. 83.080, de 1979, codigo 2.0.0.
- Portaria Interministerial MTE/MS/MPS n. 9, de 2014.`;

const SHARED_TECHNICAL_ANALYSIS = `Para fins de Analise Tecnica e Cientifica deste Laudo Pericial, a seguir faremos inicialmente o detalhamento das atividades exercidas pelo trabalhador e em seguida a analise das atividades especiais, levando em consideracao a forma de exposicao, a forma de avaliacao, o enquadramento e a tecnologia de protecao. Abaixo serao informados os conceitos a serem utilizados:

I - Efetiva exposicao: exposicao a risco ocupacional ou agente ambiental do trabalho que cumpre a exigencia de nocividade e de permanencia, caracterizando, entao, a efetiva exposicao ao agente nocivo em atividades exercidas em condicoes especiais que prejudiquem a saude ou a integridade fisica;

II - Condicoes especiais que prejudiquem a saude ou a integridade fisica: exposicao a agentes nocivos quimicos, fisicos, biologicos ou a associacao de agentes, em concentracao ou intensidade e tempo de exposicao que ultrapasse os limites de tolerancia ou que, dependendo do agente, torne a simples exposicao em condicao especial prejudicial a saude;

III - Permanencia ate 18 de novembro de 2003: atividade habitual e permanente realizada todos os dias, durante todo o tempo exigido, em todas as funcoes e durante toda a jornada de trabalho exposta a agente nocivo;

IV - Permanencia a partir de 19 de novembro de 2003: trabalho nao ocasional nem intermitente, durante quinze, vinte ou 25 anos, no qual a exposicao ao agente nocivo seja indissociavel da producao do bem ou da prestacao de servico;

V - Limite de tolerancia: de acordo com a NR-15, e a concentracao ou intensidade maxima ou minima que nao causara danos a saude do trabalhador durante sua vida laboral;

VI - Agentes fisicos: diversas formas de energia, tais como ruido, vibracoes, temperaturas extremas, radiacoes ionizantes e nao ionizantes, infrassom e ultrassom;

VII - Agentes quimicos: substancias, compostos ou produtos que possam penetrar no organismo pela via respiratoria, pela pele ou por ingestao;

VIII - Agentes biologicos: bacterias, fungos, bacilos, parasitas, protozoarios, virus, entre outros;

IX - Associacao de agentes: exposicao aos agentes combinados, observando-se o enquadramento relativo ao que exigir menor tempo de exposicao quando acima do nivel de tolerancia;

X - Nocividade: situacao combinada ou nao de substancias, energias e demais fatores de risco capazes de trazer danos a saude ou a integridade fisica;

XI - Risco ocupacional: probabilidade de um agente ambiental do trabalho produzir efeitos nocivos no organismo do trabalhador;

XII - EPC: equipamentos de protecao coletiva, como ventilacao, sinalizacao, enclausuramento, barreiras, cabines, capelas e outros;

XIII - EPI: equipamento de protecao individual destinado a protecao dos riscos suscetiveis de ameacar a seguranca e a saude no trabalho;

XIV - Agentes reconhecidamente cancerigenos: agentes elencados no grupo 1 da LINACH com registro CAS e contidos no Anexo IV do Decreto n. 3.048, de 1999.`;

const PRESETS = {
  custom: {
    introduction: `O controle do ambiente ocupacional, com a prevencao de doencas profissionais no contexto humano e social do pais, e ainda incipiente e muitas vezes negligenciado.

Tornar mais saudavel o ambiente de trabalho, e para a empresa uma maneira de prevenir perdas e investir no homem.

As providencias para melhoria das condicoes ambientais ocupacionais deverao ter objetivos mais amplos que o de apenas atender a legislacao, pois e sabido que manter os valores dentro dos limites de tolerancia nao sera suficiente, se levarmos em conta o bem estar do trabalhador e a susceptibilidade do homem, a qual o leva a reagir de maneira diferente de outrem, em condicoes iguais.

Portanto, a busca da otimizacao das condicoes de trabalho conduzira a melhoria da produtividade, ao aumento da vida util dos equipamentos, e a maior satisfacao dos funcionarios, o que resultara na preservacao da boa imagem da empresa na comunidade, a qual esta inserida.

Este trabalho foi realizado por solicitacao da empresa, para avaliacao do ambiente e atendimento das exigencias tecnicas aplicaveis.

A metodologia adotada e os criterios de avaliacao, bem como as caracteristicas do instrumental utilizado, estao descritos neste relatorio conforme recomendacao tecnica aplicavel aos agentes enquadraveis dentre aqueles previstos nos subitens do item 1.0 do Anexo IV do RBPS, dos Decretos 2.172/98 e 3.048/99.`,
    legalBasis: SHARED_LEGAL_BASIS,
    technicalAnalysis: SHARED_TECHNICAL_ANALYSIS,
    activityDetails: `Baseado nas informacoes obtidas durante a inspecao pericial, deve-se detalhar no quadro tecnico o periodo analisado, as atividades executadas, os agentes nocivos identificados, a forma de exposicao e as condicoes do ambiente de trabalho.

Periodo: informar o periodo conforme contrato de trabalho.

Atividades: descrever detalhadamente as tarefas e procedimentos operacionais padrao. Informar o tempo e a frequencia de exposicao a cada tarefa.

Agentes nocivos: qualificar os agentes de risco encontrados, como fisicos, quimicos e biologicos.

Exposicao: informar se a exposicao e habitual, intermitente, permanente, nao ocasional e nem intermitente, conforme o caso tecnico analisado.

Ambiente de trabalho: descrever detalhadamente as condicoes das instalacoes, piso, edificacao, cobertura, iluminacao, ventilacao natural e artificial, alteracoes de layout, implantacao de EPC e utilizacao de EPI.`,
    exposureFramework: `Conforme a legislacao previdenciaria, a concessao da aposentadoria especial dependera da comprovacao da exposicao do segurado aos agentes nocivos quimicos, fisicos, biologicos ou associacao de agentes prejudiciais a saude ou a integridade fisica, pelo periodo equivalente ao exigido para a concessao do beneficio.

- Ate 05/03/1997 serao analisados em conformidade com os Decretos n. 53.831, de 1964, e n. 83.080, de 1979.
- De 06/03/1997 a 05/05/1999 serao analisados conforme o Anexo IV do Decreto n. 2.172, de 1997.
- Apos 06/05/1999 serao analisados conforme o Anexo IV do Decreto n. 3.048, de 1999.`,
    neutralization: `Somente sera considerada a adocao de Equipamento de Protecao Individual - EPI, desde que comprovadamente elimine ou neutralize a nocividade e seja respeitado o disposto na NR-06 do MTE, havendo ainda a necessidade de que seja assegurada e devidamente registrada pela empresa.

I - A hierarquia estabelecida no item 9.3.5.4 da NR-9, ou seja, medidas de protecao coletiva, medidas de carater administrativo ou de organizacao do trabalho e utilizacao de EPI, nesta ordem.

II - As condicoes de funcionamento e do uso ininterrupto do EPI ao longo do tempo, conforme especificacao tecnica do fabricante.

III - O prazo de validade, conforme Certificado de Aprovacao do MTE.

IV - A periodicidade de troca definida pelos programas ambientais, comprovada mediante recibo assinado pelo usuario em epoca propria.

V - A higienizacao.`,
    conclusion: `O parecer conclusivo deve consolidar a analise dos agentes nocivos avaliados, a forma de exposicao, a eficacia das medidas de controle e o enquadramento tecnico-previdenciario aplicavel, indicando de forma fundamentada se a atividade foi ou nao exercida em condicoes especiais.`,
    agents: []
  },
  odontologia: {
    introduction: `O presente Laudo Tecnico das Condicoes Ambientais do Trabalho foi elaborado com base na avaliacao das condicoes ambientais do estabelecimento odontologico, considerando a rotina operacional, os ambientes clinicos, os processos de atendimento, os equipamentos utilizados e os agentes nocivos potencialmente presentes nas atividades desenvolvidas.

No segmento odontologico, a avaliacao deve considerar a organizacao do fluxo de pacientes, a manipulacao de materiais, a higienizacao, a esterilizacao de instrumental e os controles de biosseguranca existentes no ambiente.`,
    legalBasis: SHARED_LEGAL_BASIS,
    technicalAnalysis: `${SHARED_TECHNICAL_ANALYSIS}\n\nPara ambientes odontologicos, a analise tecnica deve observar especialmente a exposicao a agentes biologicos, quimicos utilizados em higienizacao e desinfeccao, aerossois, ruido de equipamentos, organizacao do ambiente clinico e medidas de controle adotadas pela empresa.`,
    activityDetails: `As atividades avaliadas compreendem atendimentos clinicos, preparo do ambiente de atendimento, manipulacao de instrumental, procedimentos assistenciais, lavagem e esterilizacao, organizacao da sala clinica, higienizacao de superficies e suporte operacional ao consultorio.

O ambiente deve ser descrito com atencao para areas clinicas, esterilizacao, armazenamento, recepcao e fluxo entre setores.`,
    exposureFramework: `No segmento odontologico, o enquadramento deve considerar a efetiva exposicao aos agentes nocivos eventualmente presentes no ambiente, observando habitualidade, permanencia, intensidade, tempo de exposicao, natureza das atividades e medidas de controle existentes, especialmente em relacao aos agentes biologicos e quimicos.`,
    neutralization: `Devem ser analisadas as medidas de protecao coletiva e individual existentes, incluindo barreiras fisicas, ventilacao, organizacao do fluxo, protocolos de biosseguranca, higienizacao, esterilizacao, treinamento e uso adequado de EPI.`,
    conclusion: `O parecer conclusivo deve considerar a avaliacao qualitativa e, quando aplicavel, quantitativa dos agentes nocivos, a eficacia das medidas de controle e o enquadramento tecnico-previdenciario pertinente ao caso concreto em ambiente odontologico.`,
    agents: [
      { agente: "Agentes biologicos", tipo: "Biologico", fonte: "Contato com pacientes, aerossois e instrumental contaminado", intensidade: "Avaliacao qualitativa", protecao: "Luvas, mascara, face shield, barreiras e protocolo de biosseguranca" },
      { agente: "Produtos de desinfeccao", tipo: "Quimico", fonte: "Higienizacao e esterilizacao", intensidade: "Avaliacao qualitativa", protecao: "Ventilacao, luvas e procedimentos padronizados" },
      { agente: "Ruido de equipamentos", tipo: "Fisico", fonte: "Canetas, sugadores, compressores e equipamentos auxiliares", intensidade: "Verificar necessidade de medicao", protecao: "Manutencao e controle de fonte" }
    ]
  },
  clinica: {
    introduction: `O presente LTCAT foi desenvolvido para avaliacao das condicoes ambientais das atividades realizadas em ambiente clinico e assistencial, considerando circulacao de pacientes, areas de apoio, materiais, equipamentos e processos inerentes ao servico de saude.`,
    legalBasis: SHARED_LEGAL_BASIS,
    technicalAnalysis: `${SHARED_TECHNICAL_ANALYSIS}\n\nEm ambiente clinico, a analise deve considerar a exposicao potencial a agentes biologicos, quimicos de limpeza e desinfeccao, alem de possiveis fatores fisicos ligados ao processo de trabalho.`,
    activityDetails: `As atividades envolvem recepcao, apoio clinico, atendimento, higienizacao, preparo de materiais, circulacao em ambientes assistenciais e suporte a procedimentos conforme a estrutura da empresa.`,
    exposureFramework: `A exposicao deve ser analisada conforme a natureza das atividades, a frequencia de contato com pacientes e materiais, o ambiente assistencial e os agentes ocupacionais efetivamente presentes.`,
    neutralization: `Devem ser avaliadas barreiras, treinamento, EPI, EPC, segregacao de areas, higienizacao, descarte e rotinas operacionais.`,
    conclusion: `O parecer deve indicar de forma fundamentada se as atividades avaliadas, no ambiente clinico em questao, configuram ou nao condicoes especiais.`,
    agents: []
  },
  escritorio: {
    introduction: `O presente LTCAT foi elaborado com foco nas condicoes ambientais de atividades administrativas e de apoio interno, considerando as caracteristicas do ambiente, da organizacao do trabalho e das rotinas desenvolvidas.`,
    legalBasis: SHARED_LEGAL_BASIS,
    technicalAnalysis: `${SHARED_TECHNICAL_ANALYSIS}\n\nEm atividades administrativas, a avaliacao costuma direcionar-se para a inexistencia de agentes nocivos enquadraveis, sem prejuizo da analise do ambiente real de trabalho e de suas particularidades.`,
    activityDetails: `As atividades compreendem servicos administrativos, digitacao, atendimento interno, organizacao documental, uso de equipamentos de escritorio e rotinas de apoio operacional interno.`,
    exposureFramework: `Em regra, avalia-se a inexistencia de exposicao habitual a agentes nocivos enquadraveis, devendo a conclusao observar a realidade do ambiente e eventuais exposicoes especificas existentes.`,
    neutralization: `Sao observadas condicoes de ergonomia, conforto ambiental, manutencao predial, organizacao do trabalho e boas praticas operacionais.`,
    conclusion: `O parecer deve refletir a analise do ambiente administrativo e indicar, com base tecnica, a existencia ou nao de condicoes especiais.`,
    agents: []
  },
  industria: {
    introduction: `O presente LTCAT foi elaborado para avaliacao das condicoes ambientais de trabalho em ambiente industrial, com observacao dos processos produtivos, maquinarios, insumos, operacoes e rotinas desempenhadas.`,
    legalBasis: SHARED_LEGAL_BASIS,
    technicalAnalysis: `${SHARED_TECHNICAL_ANALYSIS}\n\nEm ambiente industrial, a analise deve considerar agentes fisicos, quimicos e biologicos, bem como o processo produtivo, a organizacao da planta, a manutencao e os sistemas de controle existentes.`,
    activityDetails: `As atividades envolvem operacao, abastecimento, manutencao, circulacao em area produtiva, controle de processo e apoio operacional, devendo ser descritos equipamentos, materias-primas, insumos e condicoes do ambiente.`,
    exposureFramework: `O enquadramento tecnico deve considerar os agentes fisicos, quimicos, biologicos e suas associacoes conforme o processo produtivo, o tempo de exposicao, a intensidade e a efetiva nocividade.`,
    neutralization: `Devem ser avaliados EPC, EPI, enclausuramento, ventilacao, manutencao, exaustao, medidas administrativas e monitoramentos ambientais.`,
    conclusion: `O parecer conclusivo deve refletir a realidade do processo produtivo, os agentes avaliados, os controles implantados e o enquadramento tecnico aplicavel.`,
    agents: []
  },
  laboratorio: {
    introduction: `O presente LTCAT foi elaborado para avaliacao das condicoes ambientais de trabalho em ambiente laboratorial, observando manipulacao, armazenamento, analise, preparo de amostras e descarte de materiais.`,
    legalBasis: SHARED_LEGAL_BASIS,
    technicalAnalysis: `${SHARED_TECHNICAL_ANALYSIS}\n\nEm ambiente laboratorial, a avaliacao deve considerar agentes quimicos, biologicos e fatores fisicos, assim como os sistemas de exaustao, contencao, armazenamento e descarte.`,
    activityDetails: `As atividades envolvem processamento de amostras, higienizacao, manipulacao de reagentes, uso de equipamentos laboratoriais, organizacao de bancada, armazenamento e descarte.`,
    exposureFramework: `A avaliacao deve observar exposicao eventual ou habitual a agentes quimicos, biologicos e fisicos conforme o ambiente, as substancias manuseadas e as tecnicas empregadas.`,
    neutralization: `Devem ser observadas capelas, barreiras, exaustao, EPI, treinamentos, protocolos de seguranca, controle de acesso e procedimentos de emergencia.`,
    conclusion: `O parecer deve consolidar as condicoes ambientais do laboratorio e o enquadramento aplicavel segundo os agentes efetivamente presentes.`,
    agents: []
  }
};

function loadStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2500);
}

function openConfirmModal(rowId) {
  pendingDeleteRowId = rowId;
  confirmModal.classList.add("is-open");
  confirmModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  pendingDeleteRowId = null;
  confirmModal.classList.remove("is-open");
  confirmModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function selectedCompany() {
  return companies.find((company) => company.id === companySelect.value);
}

function selectedEmployee() {
  return employees.find((employee) => employee.id === employeeSelect.value);
}

function formatDate(value) {
  if (!value) return "Nao informada";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderRichText(text) {
  const lines = (text || "").split("\n").filter((line) => line.trim());
  if (!lines.length) return "<p>Nao informado.</p>";
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function populateCompanies() {
  companySelect.innerHTML = ['<option value="">Selecione a empresa</option>']
    .concat(companies.map((company) => `<option value="${company.id}">${escapeHtml(company.name)}</option>`))
    .join("");
}

function populateEmployees(companyId = "") {
  const filteredEmployees = companyId
    ? employees.filter((employee) => employee.companyId === companyId)
    : employees;

  employeeSelect.innerHTML = ['<option value="">Nao vincular funcionario</option>']
    .concat(filteredEmployees.map((employee) => `<option value="${employee.id}">${escapeHtml(employee.name)}</option>`))
    .join("");
}

function applyPreset(type) {
  const preset = PRESETS[type] || PRESETS.custom;
  fields.introduction.value = preset.introduction || "";
  fields.legalBasis.value = preset.legalBasis || SHARED_LEGAL_BASIS;
  fields.technicalAnalysis.value = preset.technicalAnalysis || SHARED_TECHNICAL_ANALYSIS;
  fields.activityDetails.value = preset.activityDetails || "";
  fields.exposureFramework.value = preset.exposureFramework || "";
  fields.neutralization.value = preset.neutralization || "";
  fields.conclusion.value = preset.conclusion || "";

  if (preset.agents && preset.agents.length) {
    agentRows = preset.agents.map((row) => ({ id: makeId(), ...row }));
  } else if (!agentRows.length || type !== "custom") {
    agentRows = [createEmptyAgentRow()];
  }

  renderAgentRows();
  updatePreview();
  showToast(`Conteudo base aplicado para ${activityType.options[activityType.selectedIndex]?.text || "o segmento selecionado"}.`);
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function createEmptyAgentRow() {
  return {
    id: makeId(),
    agente: "",
    tipo: "Quimico",
    fonte: "",
    intensidade: "",
    protecao: ""
  };
}

function renderAgentRows() {
  if (!agentRows.length) {
    agentRows = [createEmptyAgentRow()];
  }

  agentsTableBody.innerHTML = agentRows.map((row) => `
    <tr data-row-id="${row.id}">
      <td><input type="text" data-key="agente" value="${escapeHtml(row.agente)}" placeholder="Ex.: ruido ocupacional"></td>
      <td>
        <select data-key="tipo">
          ${["Fisico", "Quimico", "Biologico", "Ergonomico", "Acidente"].map((tipo) => `<option value="${tipo}" ${row.tipo === tipo ? "selected" : ""}>${tipo}</option>`).join("")}
        </select>
      </td>
      <td><input type="text" data-key="fonte" value="${escapeHtml(row.fonte)}" placeholder="Fonte ou atividade"></td>
      <td><input type="text" data-key="intensidade" value="${escapeHtml(row.intensidade)}" placeholder="Medicao ou avaliacao"></td>
      <td><input type="text" data-key="protecao" value="${escapeHtml(row.protecao)}" placeholder="EPI / EPC"></td>
      <td><button type="button" class="danger-button" data-remove-row="${row.id}">Remover</button></td>
    </tr>
  `).join("");

  previewAgentsTableBody.innerHTML = agentRows.map((row) => `
    <tr>
      <td>${escapeHtml(row.agente || "-")}</td>
      <td>${escapeHtml(row.tipo || "-")}</td>
      <td>${escapeHtml(row.fonte || "-")}</td>
      <td>${escapeHtml(row.intensidade || "-")}</td>
      <td>${escapeHtml(row.protecao || "-")}</td>
    </tr>
  `).join("");
}

function updateAgentField(rowId, key, value) {
  const row = agentRows.find((item) => item.id === rowId);
  if (!row) return;
  row[key] = value;
  renderAgentRows();
}

function renderLogo(file) {
  if (!file) {
    logoPreview.innerHTML = "<span>Nenhuma imagem selecionada.</span>";
    previewLogo.innerHTML = "<span>Logo</span>";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("A imagem deve ter no maximo 2 MB.");
    logoInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const imageMarkup = `<img src="${reader.result}" alt="Logo do cliente">`;
    logoPreview.innerHTML = imageMarkup;
    previewLogo.innerHTML = imageMarkup;
    showToast("Logo adicionada ao laudo.");
  };
  reader.readAsDataURL(file);
}

function renderPhotos(files) {
  uploadedPhotos = [];

  if (!files.length) {
    photoPreviewGrid.innerHTML = "";
    previewPhotoGrid.innerHTML = "";
    return;
  }

  Array.from(files).forEach((file) => {
    if (file.size > 4 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedPhotos.push({ name: file.name, src: reader.result });
      drawPhotoCollections();
    };
    reader.readAsDataURL(file);
  });

  showToast("Fotos adicionadas a memoria fotografica.");
}

function drawPhotoCollections() {
  const markup = uploadedPhotos.map((photo) => `
    <div class="photo-card">
      <img src="${photo.src}" alt="${escapeHtml(photo.name)}">
      <span>${escapeHtml(photo.name)}</span>
    </div>
  `).join("");

  photoPreviewGrid.innerHTML = markup;
  previewPhotoGrid.innerHTML = markup || "<p>Nenhuma foto anexada.</p>";
}

function buildCompanyBlock(company) {
  if (!company) return "<p>Nenhuma empresa selecionada.</p>";
  return `
    <p><strong>Razao social:</strong> ${escapeHtml(company.name || "Nao informado")}</p>
    <p><strong>Nome fantasia:</strong> ${escapeHtml(company.tradeName || "Nao informado")}</p>
    <p><strong>CNPJ:</strong> ${escapeHtml(company.cnpj || "Nao informado")}</p>
    <p><strong>CNAE primario:</strong> ${escapeHtml(company.cnae || "Nao informado")}</p>
    <p><strong>Atividade do estabelecimento:</strong> ${escapeHtml(company.activity || "Nao informado")}</p>
    <p><strong>Grau de risco:</strong> ${escapeHtml(company.risk || "Nao informado")}</p>
    <p><strong>Endereco:</strong> ${escapeHtml(company.address || "Nao informado")}</p>
  `;
}

function buildEmployeeBlock(employee) {
  if (!employee) return "<p>Laudo sem funcionario vinculado. Utilize quando o documento for geral da empresa ou por funcao.</p>";
  return `
    <p><strong>Nome:</strong> ${escapeHtml(employee.name || "Nao informado")}</p>
    <p><strong>CPF:</strong> ${escapeHtml(employee.cpf || "Nao informado")}</p>
    <p><strong>CTPS:</strong> ${escapeHtml(employee.ctps || "Nao informado")}</p>
    <p><strong>PIS:</strong> ${escapeHtml(employee.pis || "Nao informado")}</p>
    <p><strong>Funcao:</strong> ${escapeHtml(employee.role || fields.evaluatedRole.value || "Nao informado")}</p>
    <p><strong>CBO:</strong> ${escapeHtml(employee.cbo || "Nao informado")}</p>
    <p><strong>Admissao:</strong> ${escapeHtml(employee.admission || "Nao informado")}</p>
  `;
}

function buildTechnicalLeadBlock() {
  return `
    <p><strong>Responsavel tecnico:</strong> ${escapeHtml(fields.technicalLead.value || "Nao informado")}</p>
    <p><strong>Registro profissional:</strong> ${escapeHtml(fields.technicalRegistry.value || "Nao informado")}</p>
  `;
}

function buildPreviewDocument() {
  const company = selectedCompany();
  const employee = selectedEmployee();
  const style = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join("");

  return `<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(fields.reportNumber.value.trim() || "LTCAT")}</title>
    ${style}
  </head>
  <body>
    <main class="doc-page">
      <section class="layout preview-collapsed">
        <aside class="preview is-open">
          <article class="panel preview-card">
            <div class="preview-logo">${previewLogo.innerHTML}</div>
            <p class="eyebrow">Visualizacao do laudo</p>
            <h2>${escapeHtml(fields.reportNumber.value.trim() || "LTCAT sem numero definido")}</h2>
            <p class="preview-subtitle">${escapeHtml(company ? company.name : "Sem empresa selecionada")}</p>

            <div class="preview-list">
              <div class="preview-item"><span>Funcionario</span><strong>${escapeHtml(employee ? employee.name : "Nao vinculado")}</strong></div>
              <div class="preview-item"><span>Tipo</span><strong>${escapeHtml(activityType.options[activityType.selectedIndex]?.text || "Personalizado")}</strong></div>
              <div class="preview-item"><span>Data do laudo</span><strong>${escapeHtml(formatDate(fields.issueDate.value))}</strong></div>
              <div class="preview-item"><span>Data da avaliacao</span><strong>${escapeHtml(formatDate(fields.assessmentDate.value))}</strong></div>
            </div>

            <section class="preview-section"><h3>1. Caracterizacao da empresa</h3><div class="preview-rich">${buildCompanyBlock(company)}</div></section>
            <section class="preview-section"><h3>2. Dados do funcionario</h3><div class="preview-rich">${buildEmployeeBlock(employee)}</div></section>
            <section class="preview-section"><h3>3. Introducao</h3><div class="preview-rich">${renderRichText(fields.introduction.value || fields.purpose.value)}</div></section>
            <section class="preview-section"><h3>4. Fundamentacao legal</h3><div class="preview-rich">${renderRichText(fields.legalBasis.value)}</div></section>
            <section class="preview-section"><h3>5. Analise tecnica e cientifica</h3><div class="preview-rich">${renderRichText(fields.technicalAnalysis.value)}</div></section>
            <section class="preview-section"><h3>5.1. Detalhamento das atividades e do local avaliado</h3><div class="preview-rich">${renderRichText(fields.activityDetails.value)}</div></section>
            <section class="preview-section"><h3>5.2. Enquadramento por exposicao a agentes nocivos</h3><div class="preview-rich">${renderRichText(fields.exposureFramework.value)}</div></section>
            <section class="preview-section"><h3>5.3. Eliminacao ou neutralizacao da nocividade</h3><div class="preview-rich">${renderRichText(fields.neutralization.value)}</div></section>
            <section class="preview-section"><h3>6. Avaliacao dos agentes nocivos encontrados no ambiente de trabalho</h3><div class="table-wrap"><table class="agents-table preview-table"><thead><tr><th>Agente</th><th>Tipo</th><th>Fonte / atividade</th><th>Intensidade / avaliacao</th><th>EPI / EPC</th></tr></thead><tbody>${previewAgentsTableBody.innerHTML}</tbody></table></div></section>
            <section class="preview-section"><h3>7. Parecer conclusivo</h3><div class="preview-rich">${renderRichText(fields.conclusion.value)}</div></section>
            <section class="preview-section"><h3>8. Responsavel tecnico</h3><div class="preview-rich">${buildTechnicalLeadBlock()}</div></section>
            <section class="preview-section"><h3>9. Memoria fotografica</h3><div class="preview-rich">${renderRichText(fields.photoMemory.value)}</div><div class="photo-grid photo-grid--preview">${previewPhotoGrid.innerHTML || "<p>Nenhuma foto anexada.</p>"}</div></section>
          </article>
        </aside>
      </section>
    </main>
  </body>
  </html>`;
}

function updatePreview() {
  const company = selectedCompany();
  const employee = selectedEmployee();
  const typeLabel = activityType.options[activityType.selectedIndex]?.text || "Personalizado";

  document.getElementById("previewTitle").textContent = fields.reportNumber.value.trim() || "LTCAT sem numero definido";
  document.getElementById("previewCompany").textContent = company ? company.name : "Selecione uma empresa";
  document.getElementById("previewEmployee").textContent = employee ? employee.name : "Nao vinculado";
  document.getElementById("previewActivityType").textContent = typeLabel;
  document.getElementById("previewIssueDate").textContent = formatDate(fields.issueDate.value);
  document.getElementById("previewAssessmentDate").textContent = formatDate(fields.assessmentDate.value);
  document.getElementById("previewLead").textContent = fields.technicalLead.value.trim() || "Nao informado";

  document.getElementById("previewCompanyBlock").innerHTML = buildCompanyBlock(company);
  document.getElementById("previewEmployeeBlock").innerHTML = buildEmployeeBlock(employee);
  document.getElementById("previewIntroduction").innerHTML = renderRichText(fields.introduction.value || fields.purpose.value);
  document.getElementById("previewLegalBasis").innerHTML = renderRichText(fields.legalBasis.value);
  document.getElementById("previewTechnicalAnalysis").innerHTML = renderRichText(fields.technicalAnalysis.value);
  document.getElementById("previewActivityDetails").innerHTML = renderRichText(fields.activityDetails.value);
  document.getElementById("previewExposureFramework").innerHTML = renderRichText(fields.exposureFramework.value);
  document.getElementById("previewNeutralization").innerHTML = renderRichText(fields.neutralization.value);
  document.getElementById("previewConclusion").innerHTML = renderRichText(fields.conclusion.value);
  document.getElementById("previewTechnicalLeadBlock").innerHTML = buildTechnicalLeadBlock();
  document.getElementById("previewPhotoMemory").innerHTML = renderRichText(fields.photoMemory.value);
}

function markEmployeeLtcat() {
  const employee = selectedEmployee();
  if (!employee) return;

  if (!employee.laudos.includes("LTCAT")) {
    employee.laudos.push("LTCAT");
    localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees));
  }
}

function openPreviewWindow() {
  const previewWindow = window.open("", "_blank", "width=1200,height=900,resizable=yes,scrollbars=yes");
  if (!previewWindow) {
    alert("Nao foi possivel abrir a janela de visualizacao. Verifique se o navegador bloqueou pop-up.");
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(buildPreviewDocument());
  previewWindow.document.close();
}

function printPdf() {
  openPreviewWindow();
}

companySelect.addEventListener("change", () => {
  populateEmployees(companySelect.value);
  updatePreview();
});

employeeSelect.addEventListener("change", () => {
  markEmployeeLtcat();
  updatePreview();
});

activityType.addEventListener("change", () => {
  applyPreset(activityType.value);
});

Object.values(fields).forEach((field) => {
  field.addEventListener("input", updatePreview);
  field.addEventListener("change", updatePreview);
});

logoInput.addEventListener("change", (event) => {
  renderLogo(event.target.files[0]);
});

photoInput.addEventListener("change", (event) => {
  renderPhotos(event.target.files);
});

document.getElementById("addAgentRowButton").addEventListener("click", () => {
  agentRows.push(createEmptyAgentRow());
  renderAgentRows();
  updatePreview();
  showToast("Linha adicionada na tabela de agentes.");
});

document.getElementById("openPreviewWindowButton").addEventListener("click", openPreviewWindow);
document.getElementById("printPdfButton").addEventListener("click", printPdf);

agentsTableBody.addEventListener("input", (event) => {
  const row = event.target.closest("tr");
  if (!row || !event.target.dataset.key) return;
  updateAgentField(row.dataset.rowId, event.target.dataset.key, event.target.value);
  updatePreview();
});

agentsTableBody.addEventListener("change", (event) => {
  const row = event.target.closest("tr");
  if (!row || !event.target.dataset.key) return;
  updateAgentField(row.dataset.rowId, event.target.dataset.key, event.target.value);
  updatePreview();
});

agentsTableBody.addEventListener("click", (event) => {
  const rowId = event.target.dataset.removeRow;
  if (!rowId) return;
  openConfirmModal(rowId);
});

confirmDeleteButton.addEventListener("click", () => {
  if (!pendingDeleteRowId) return;
  agentRows = agentRows.filter((row) => row.id !== pendingDeleteRowId);
  renderAgentRows();
  updatePreview();
  closeConfirmModal();
  showToast("Linha removida da tabela de agentes.");
});

cancelDeleteButton.addEventListener("click", closeConfirmModal);
confirmBackdrop.addEventListener("click", closeConfirmModal);

populateCompanies();
populateEmployees();

fields.issueDate.value = new Date().toISOString().slice(0, 10);
agentRows = [createEmptyAgentRow()];
applyPreset(activityType.value);
renderAgentRows();
drawPhotoCollections();
updatePreview();
