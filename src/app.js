(function () {
  const CREATOR_KEY = "PERULABS-CREATOR-2026";
  const providers = window.AcademicProviderMetadata || {};
  const root = document.getElementById("academic-finder-root");
  const surface = document.body.dataset.surface || "web";
  const isExtension = typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

  const sources = [
    {
      id: "s1",
      title: "Inteligencia artificial generativa en educacion superior: revision sistematica",
      author: "Mariana Torres; Luis Paredes",
      institution: "Universidad Nacional Mayor de San Marcos",
      date: "2026-06-12",
      type: "Articulo",
      url: "https://example.edu/ia-educacion-superior",
      abstract: "Revision sobre aplicaciones, riesgos y criterios de evaluacion de IA generativa en cursos universitarios.",
      methodology: "Revision sistematica",
      reliability: "Alta: incluye criterios de inclusion y matriz PRISMA."
    },
    {
      id: "s2",
      title: "Repositorio institucional y visibilidad de tesis peruanas en acceso abierto",
      author: "Camila Rojas",
      institution: "Pontificia Universidad Catolica del Peru",
      date: "2025-11-03",
      type: "Tesis",
      url: "https://example.edu/repositorios-tesis",
      abstract: "Analiza la recuperacion de tesis por metadatos, autor, titulo exacto e institucion.",
      methodology: "Estudio descriptivo con analisis documental",
      reliability: "Media-alta: datos institucionales, muestra limitada."
    },
    {
      id: "s3",
      title: "Seguridad y salud ocupacional en obras civiles de Lima Metropolitana",
      author: "Diego Fernandez",
      institution: "Universidad Nacional de Ingenieria",
      date: "2024-08-21",
      type: "Tesis",
      url: "https://example.edu/sso-obras-lima",
      abstract: "Evalua practicas de prevencion y cumplimiento normativo en obras civiles.",
      methodology: "Encuestas y observacion en campo",
      reliability: "Media: requiere verificar anexos y tamano muestral."
    },
    {
      id: "s4",
      title: "Aprendizaje automatico para clasificacion de fuentes academicas",
      author: "Andrea Salazar; Mateo Quiroz",
      institution: "Universidad de Chile",
      date: "2023-04-15",
      type: "Articulo",
      url: "https://example.edu/clasificacion-fuentes",
      abstract: "Propone un modelo de clasificacion de documentos academicos por relevancia y confiabilidad.",
      methodology: "Modelo supervisado con validacion cruzada",
      reliability: "Alta: reporta metricas y datos de validacion."
    },
    {
      id: "s5",
      title: "La alfabetizacion informacional en estudiantes escolares",
      author: "Elena Vargas",
      institution: "Ministerio de Educacion del Peru",
      date: "2022-10-10",
      type: "Informe",
      url: "https://example.edu/alfabetizacion-informacional",
      abstract: "Guia de competencias para buscar, evaluar y citar fuentes confiables en secundaria.",
      methodology: "Revision curricular y entrevistas",
      reliability: "Media: documento util, no es estudio experimental."
    },
    {
      id: "s6",
      title: "Criterios de confiabilidad para articulos cientificos en ciencias sociales",
      author: "Jorge Medina",
      institution: "CLACSO",
      date: "2021-02-18",
      type: "Libro",
      url: "https://example.edu/confiabilidad-ciencias-sociales",
      abstract: "Explica indicadores de calidad, citas, arbitraje y trazabilidad metodologica.",
      methodology: "Ensayo metodologico",
      reliability: "Media-alta: buena base teorica, no presenta datos nuevos."
    }
  ];

  const state = {
    query: "",
    mode: "exact",
    pageSize: 10,
    page: 1,
    premium: false,
    premiumDismissed: false,
    selected: new Set(["s1"]),
    saved: new Set(),
    provider: "openai",
    profile: "Buscador academico",
    apiKey: "",
    premiumKey: "",
    analysisText: "",
    output: "",
    exportFormat: "json"
  };

  const profiles = [
    "Buscador academico",
    "Analista de investigacion",
    "Estudiante escolar",
    "Estudiante universitario",
    "Tesista",
    "Docente",
    "Asesor academico"
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function tokenize(value) {
    return normalize(value).split(/\s+/).filter(Boolean);
  }

  function inferMode(query) {
    const q = query.trim();
    if (!q) return state.mode;
    const words = tokenize(q);
    const hasQuote = /["'“”]/.test(q);
    const hasInstitution = /universidad|instituto|repositorio|ministerio|facultad|escuela|congreso/i.test(q);
    const hasTopicConnector = /\b(en|de|del|la|el|y|para|sobre|con)\b/i.test(q);
    const capitalizedWords = q.split(/\s+/).filter((word) => /^[A-Z]/.test(word)).length;
    const looksLikeName = words.length >= 2 && words.length <= 5 && capitalizedWords >= 2 && !hasTopicConnector;
    const looksLikeLongTitle = words.length > 6;
    return hasQuote || hasInstitution || looksLikeName || looksLikeLongTitle ? "exact" : "broad";
  }

  function scoreSource(source, query, mode) {
    const q = normalize(query);
    if (!q) return 1;
    const haystack = normalize([source.title, source.author, source.institution, source.type, source.abstract].join(" "));
    const exactFields = [source.title, source.author, source.institution].map(normalize);
    if (exactFields.some((field) => field.includes(q))) return 100;
    const terms = tokenize(query).filter((term) => term.length > 2);
    const matches = terms.filter((term) => haystack.includes(term));
    if (mode === "exact") {
      const ratio = terms.length ? matches.length / terms.length : 0;
      return ratio >= 0.75 ? 50 + matches.length : 0;
    }
    return matches.length;
  }

  function getResults() {
    return sources
      .map((source) => ({ ...source, score: scoreSource(source, state.query, state.mode) }))
      .filter((source) => source.score > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.score - a.score);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function render() {
    const results = getResults();
    const totalPages = Math.max(1, Math.ceil(results.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const pageResults = results.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    const provider = providers[state.provider] || {};
    root.innerHTML = `
      <section class="hero">
        <div>
          <h1>Academic Finder IA</h1>
          <p>Busca fuentes academicas, prioriza coincidencias reales, guarda resultados y prepara citas con un asistente IA opcional.</p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-secondary" data-action="open-premium">Premium</button>
          ${surface !== "web" ? '<button class="btn btn-primary" data-action="open-sidepanel">Panel lateral</button>' : '<a class="btn btn-primary" href="#demo">Ver demo</a>'}
        </div>
      </section>

      ${!state.premium && !state.premiumDismissed ? premiumBanner() : ""}

      <section id="demo" class="workspace">
        <aside class="control-panel">
          <label class="field">
            <span>Busqueda academica</span>
            <input data-field="query" type="search" value="${escapeHtml(state.query)}" placeholder="Autor, titulo exacto, institucion o tema">
          </label>
          <div class="segmented" role="group" aria-label="Modo de busqueda">
            <button class="${state.mode === "exact" ? "active" : ""}" data-mode="exact">Busqueda exacta</button>
            <button class="${state.mode === "broad" ? "active" : ""}" data-mode="broad">Busqueda exploratoria</button>
          </div>
          <label class="field">
            <span>Resultados por pagina</span>
            <select data-field="pageSize">
              ${[10, 50, 100].map((size) => `<option value="${size}" ${state.pageSize === size ? "selected" : ""}>${size} resultados</option>`).join("")}
            </select>
          </label>
          <p class="ordering">Ordenado desde los resultados mas recientes hasta los mas antiguos.</p>
          <div class="button-row">
            <button class="btn btn-secondary" data-action="save-selected">Guardar fuente</button>
            <button class="btn btn-secondary" data-action="cite-selected">Generar cita</button>
          </div>
          <div class="export-box">
            <select data-field="exportFormat">
              <option value="json" ${state.exportFormat === "json" ? "selected" : ""}>Exportar JSON</option>
              <option value="csv" ${state.exportFormat === "csv" ? "selected" : ""}>Exportar CSV</option>
              <option value="bibtex" ${state.exportFormat === "bibtex" ? "selected" : ""}>Exportar BibTeX</option>
            </select>
            <button class="btn btn-primary" data-action="export-selected">Exportar seleccion</button>
          </div>
        </aside>

        <section class="results-panel">
          <div class="panel-head">
            <div>
              <h2>Resultados academicos</h2>
              <p>${results.length} coincidencias estrictas o relevantes</p>
            </div>
            <div class="pager">
              <button data-action="prev-page" ${state.page === 1 ? "disabled" : ""}>Anterior</button>
              <span>${state.page} / ${totalPages}</span>
              <button data-action="next-page" ${state.page === totalPages ? "disabled" : ""}>Siguiente</button>
            </div>
          </div>
          <div class="result-list">
            ${pageResults.map(resultCard).join("") || '<div class="empty">No hay resultados relacionados. Prueba busqueda exploratoria o una frase menos restrictiva.</div>'}
          </div>
        </section>
      </section>

      <section class="ai-grid">
        <section class="ai-panel ${state.premium ? "" : "locked-soft"}">
          <div class="panel-head">
            <div>
              <h2>Resumen IA premium</h2>
              <p>${state.premium ? "Activo con clave demo o futura licencia." : "Bloqueado, pero puedes seguir usando la version basica."}</p>
            </div>
            ${!state.premium ? '<button class="btn btn-primary" data-action="open-premium">Activar</button>' : '<span class="status-ok">Premium activo</span>'}
          </div>
          <div class="provider-grid">
            <label class="field">
              <span>Proveedor IA</span>
              <select data-field="provider">
                ${Object.entries(providers).map(([key, value]) => `<option value="${key}" ${state.provider === key ? "selected" : ""}>${value.label}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>Perfil de analisis</span>
              <select data-field="profile">
                ${profiles.map((profile) => `<option value="${profile}" ${state.profile === profile ? "selected" : ""}>${profile}</option>`).join("")}
              </select>
            </label>
            <label class="field">
              <span>API key personal</span>
              <input data-field="apiKey" type="password" value="${escapeHtml(state.apiKey)}" placeholder="Opcional para proveedores reales">
            </label>
          </div>
          <div class="provider-note">
            <strong>${provider.label || ""}</strong>
            <p>${provider.guidance || ""}</p>
            <p>${provider.endpointNote || ""}</p>
            ${renderCategories(provider.categories)}
          </div>
          <label class="field">
            <span>Texto o pagina para analizar</span>
            <textarea data-field="analysisText" rows="6" placeholder="Pega texto academico, resumen, abstract o contenido copiado">${escapeHtml(state.analysisText)}</textarea>
          </label>
          <div class="button-row">
            <button class="btn btn-secondary" data-action="capture-page">Copiar contenido para analizar</button>
            <button class="btn btn-primary" data-action="run-ai">Generar resumen IA</button>
          </div>
          <div class="output">${state.output ? escapeHtml(state.output).replace(/\n/g, "<br>") : "La respuesta aparecera aqui en puntos breves y utiles."}</div>
        </section>

        <section class="premium-panel">
          <h2>Activacion demo</h2>
          <p>Ingresa la clave de creador para desbloquear funciones premium en esta version estatica.</p>
          <label class="field">
            <span>Clave premium</span>
            <input data-field="premiumKey" type="text" value="${escapeHtml(state.premiumKey)}" placeholder="PERULABS-CREATOR-2026">
          </label>
          <div class="button-row">
            <button class="btn btn-primary" data-action="activate-premium">Activar premium</button>
            <button class="btn btn-secondary" data-action="close-premium">Cerrar y seguir gratis</button>
          </div>
          <p class="fine-print">Sistema demo no seguro para produccion. La validacion real debe moverse a un backend de licencias.</p>
        </section>
      </section>
    `;
  }

  function premiumBanner() {
    return `
      <section class="premium-banner">
        <div>
          <strong>Funciones premium disponibles</strong>
          <p>Resumen IA, perfiles avanzados y analisis de pagina estan bloqueados hasta activar premium. La busqueda basica sigue funcionando.</p>
        </div>
        <div class="button-row">
          <button class="btn btn-primary" data-action="open-premium">Ver premium</button>
          <button class="icon-btn" data-action="close-premium" aria-label="Cerrar ventana premium">x</button>
        </div>
      </section>
    `;
  }

  function resultCard(item) {
    const checked = state.selected.has(item.id) ? "checked" : "";
    return `
      <article class="result-card">
        <label class="check-line">
          <input type="checkbox" data-select="${item.id}" ${checked}>
          <span>${escapeHtml(item.type)} - ${formatDate(item.date)}</span>
        </label>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="meta">${escapeHtml(item.author)} · ${escapeHtml(item.institution)}</p>
        <p>${escapeHtml(item.abstract)}</p>
        <div class="card-actions">
          <button data-action="toggle-save" data-id="${item.id}">${state.saved.has(item.id) ? "Guardado" : "Guardar fuente"}</button>
          <button data-action="cite-one" data-id="${item.id}">Generar cita</button>
          <a href="${item.url}" target="_blank" rel="noreferrer">Abrir fuente</a>
        </div>
      </article>
    `;
  }

  function renderCategories(categories = {}) {
    return `<div class="model-tags">${Object.entries(categories).map(([label, values]) => `<span><b>${label}:</b> ${escapeHtml(values.join(", "))}</span>`).join("")}</div>`;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("es-PE", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(date));
  }

  function selectedSources() {
    return sources.filter((item) => state.selected.has(item.id));
  }

  function citation(item) {
    const year = new Date(item.date).getFullYear();
    return `${item.author} (${year}). ${item.title}. ${item.institution}. ${item.url}`;
  }

  function bibtex(item) {
    const key = `${normalize(item.author).split(" ")[0] || "fuente"}${new Date(item.date).getFullYear()}`;
    return `@misc{${key},\n  author = {${item.author}},\n  title = {${item.title}},\n  year = {${new Date(item.date).getFullYear()}},\n  institution = {${item.institution}},\n  url = {${item.url}}\n}`;
  }

  function exportSelected() {
    const items = selectedSources();
    if (!items.length) {
      state.output = "Selecciona al menos una fuente para exportar.";
      return render();
    }
    let content = "";
    let type = "application/json";
    let ext = state.exportFormat;
    if (state.exportFormat === "json") {
      content = JSON.stringify(items, null, 2);
    } else if (state.exportFormat === "csv") {
      type = "text/csv";
      content = ["titulo,autor,institucion,fecha,tipo,url", ...items.map((item) => [item.title, item.author, item.institution, item.date, item.type, item.url].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))].join("\n");
    } else {
      type = "text/plain";
      ext = "bib";
      content = items.map(bibtex).join("\n\n");
    }
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `academic-finder-export.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function generateSummary() {
    if (!state.premium) {
      state.output = "Funcion premium bloqueada. Puedes cerrar la ventana premium y seguir con busqueda, citas y exportacion basica.";
      return;
    }
    const text = state.analysisText || selectedSources().map((item) => `${item.title}. ${item.abstract}`).join("\n");
    if (!text.trim()) {
      state.output = "Agrega texto o selecciona una fuente antes de generar el resumen.";
      return;
    }
    state.output = [
      `Perfil: ${state.profile}`,
      "- Idea principal: " + text.trim().slice(0, 160) + (text.length > 160 ? "..." : ""),
      "- Relevancia academica: util para ubicar argumentos, antecedentes y palabras clave.",
      "- Metodologia: verificar si el texto declara muestra, enfoque, tecnica o criterios de revision.",
      "- Datos de cita: revisar autor, ano, titulo, institucion, URL y fecha de consulta antes de usar.",
      "- Posible uso: tesis, trabajo escolar, articulo, informe o marco teorico segun el perfil elegido.",
      "- Advertencia de confiabilidad: si faltan autores, metodologia o fuente original, citar con cautela."
    ].join("\n");
  }

  async function capturePageText() {
    if (!isExtension) {
      state.analysisText = "Demo web: pega aqui el texto seleccionado o el contenido visible que quieres analizar.";
      state.output = "En GitHub Pages no se puede leer la pagina actual de Chrome. Usa el boton como guia para copiar contenido al cuadro de analisis.";
      return render();
    }
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selected = String(window.getSelection?.() || "").trim();
          const visible = document.body?.innerText || "";
          return (selected || visible).slice(0, 12000);
        }
      });
      state.analysisText = result?.result || "";
      state.output = state.analysisText ? "Contenido copiado al cuadro de analisis." : "No se pudo capturar texto visible. Copia y pega manualmente.";
      render();
    } catch (error) {
      state.output = "Chrome limito el acceso a esta pagina. Copia el texto visible y pegalo en el cuadro de analisis.";
      render();
    }
  }

  async function openSidePanel() {
    if (!isExtension || !chrome.sidePanel?.open) {
      state.output = "El panel lateral esta disponible al cargar la extension en Chrome compatible.";
      return render();
    }
    const window = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: window.id });
  }

  function persist() {
    const data = {
      premium: state.premium,
      premiumDismissed: state.premiumDismissed,
      provider: state.provider,
      profile: state.profile,
      apiKey: state.apiKey,
      premiumKey: state.premiumKey
    };
    localStorage.setItem("academicFinderState", JSON.stringify(data));
    if (isExtension) chrome.storage.local.set(data);
  }

  function load() {
    try {
      Object.assign(state, JSON.parse(localStorage.getItem("academicFinderState") || "{}"));
    } catch (_) {}
  }

  root.addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    if (!field) return;
    if (field === "query") {
      state.query = event.target.value;
      state.mode = inferMode(state.query);
      state.page = 1;
    } else if (field === "pageSize") {
      state.pageSize = Number(event.target.value);
      state.page = 1;
    } else {
      state[field] = event.target.value;
    }
    persist();
    render();
  });

  root.addEventListener("change", (event) => {
    if (event.target.dataset.select) {
      const id = event.target.dataset.select;
      event.target.checked ? state.selected.add(id) : state.selected.delete(id);
      render();
    }
  });

  root.addEventListener("click", async (event) => {
    const actionTarget = event.target.closest("[data-action], [data-mode]");
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (actionTarget.dataset.mode) {
      state.mode = actionTarget.dataset.mode;
      state.page = 1;
    } else if (action === "prev-page") state.page -= 1;
    else if (action === "next-page") state.page += 1;
    else if (action === "close-premium") state.premiumDismissed = true;
    else if (action === "open-premium") state.premiumDismissed = false;
    else if (action === "activate-premium") {
      const key = state.premiumKey.trim();
      state.premium = key === CREATOR_KEY;
      state.output = state.premium ? "Premium demo activado correctamente." : "Clave no valida para esta demo.";
    } else if (action === "save-selected") selectedSources().forEach((item) => state.saved.add(item.id));
    else if (action === "toggle-save") state.saved.has(actionTarget.dataset.id) ? state.saved.delete(actionTarget.dataset.id) : state.saved.add(actionTarget.dataset.id);
    else if (action === "cite-selected") state.output = selectedSources().map(citation).join("\n\n") || "Selecciona una fuente para generar cita.";
    else if (action === "cite-one") state.output = citation(sources.find((item) => item.id === actionTarget.dataset.id));
    else if (action === "export-selected") return exportSelected();
    else if (action === "run-ai") generateSummary();
    else if (action === "capture-page") return capturePageText();
    else if (action === "open-sidepanel") return openSidePanel();
    persist();
    render();
  });

  load();
  render();
})();
