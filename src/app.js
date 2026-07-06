(function () {
  const providers = window.AcademicProviderMetadata || {};
  const root = document.getElementById("academic-finder-root");
  const surface = document.body.dataset.surface || "web";
  const isExtension = typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

  const demoSources = [
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
    },
    {
      id: "s7",
      title: "Uso de repositorios academicos para revision de literatura en tesis",
      author: "Paola Benites",
      institution: "Universidad Peruana Cayetano Heredia",
      date: "2026-01-30",
      type: "Guia",
      url: "https://example.edu/repositorios-revision-literatura",
      abstract: "Presenta un flujo practico para explorar repositorios, filtrar fuentes y organizar evidencia para tesis.",
      methodology: "Guia aplicada con criterios de evaluacion",
      reliability: "Media-alta: util como guia, verificar cada fuente primaria."
    },
    {
      id: "s8",
      title: "Evaluacion de articulos cientificos con matrices de relevancia academica",
      author: "Rafael Molina; Sofia Acosta",
      institution: "Universidad de Buenos Aires",
      date: "2025-05-19",
      type: "Articulo",
      url: "https://example.edu/matrices-relevancia-academica",
      abstract: "Describe una matriz para clasificar fuentes por actualidad, metodologia, citabilidad y pertinencia.",
      methodology: "Diseno metodologico y validacion por expertos",
      reliability: "Alta: criterios claros y validacion documentada."
    }
  ];

  const state = {
    query: "",
    mode: "exact",
    sourceType: "all",
    pageSize: 10,
    page: 1,
    liveResults: [],
    liveStatuses: [],
    isSearching: false,
    lastSearch: "",
    selected: new Set(["s1"]),
    saved: new Set(),
    provider: "openai",
    profile: "Buscador academico",
    apiKey: "",
    model: (window.AcademicProviderAdapters?.openai?.defaultModel) || "",
    analysisText: "",
    output: "",
    isGenerating: false,
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

  const explorerRoutes = [
    {
      title: "Explorar tesis",
      query: "repositorio tesis universidad",
      description: "Encuentra tesis, autores, instituciones y temas para marco teorico."
    },
    {
      title: "Explorar articulos",
      query: "articulo metodologia revision sistematica",
      description: "Prioriza papers con metodologia, fecha y datos de citacion claros."
    },
    {
      title: "Explorar instituciones",
      query: "Universidad Nacional Mayor de San Marcos",
      description: "Busca por universidad, repositorio, facultad o entidad publica."
    },
    {
      title: "Explorar confiabilidad",
      query: "criterios de confiabilidad fuentes academicas",
      description: "Filtra fuentes con advertencias de fiabilidad y uso academico."
    }
  ];

  const academicRepositories = [
    {
      name: "OpenAlex",
      description: "Indice abierto de literatura academica, instituciones, autores y obras.",
      search: searchOpenAlex
    },
    {
      name: "Crossref",
      description: "Metadatos DOI de articulos, libros, proceedings y documentos academicos.",
      search: searchCrossref
    },
    {
      name: "DOAJ",
      description: "Revistas y articulos de acceso abierto revisados.",
      search: searchDoaj
    },
    {
      name: "Europe PMC",
      description: "Repositorio abierto de articulos cientificos, PubMed Central y literatura biomédica.",
      search: searchEuropePmc
    },
    {
      name: "arXiv",
      description: "Preprints de fisica, computacion, matematicas, estadistica y areas afines.",
      search: searchArxiv
    },
    {
      name: "Semantic Scholar",
      description: "Indice academico semantico con resumenes, autores y enlaces.",
      search: searchSemanticScholar
    }
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
    if (terms.length > 1 && matches.length < 2) return 0;
    return matches.length;
  }

  function activeSources() {
    return state.lastSearch ? state.liveResults : demoSources;
  }

  function getResults() {
    const base = activeSources()
      .filter((source) => !isFutureDate(source.date))
      .filter((source) => state.sourceType === "all" || source.type === state.sourceType);
    // Los resultados en vivo ya vienen filtrados por relevancia desde cada repositorio;
    // re-puntuarlos localmente descartaba casi todo. Solo se re-puntua la coleccion demo.
    if (state.lastSearch) {
      return base.sort((a, b) => sortableDate(b.date) - sortableDate(a.date));
    }
    return base
      .map((source) => ({ ...source, score: scoreSource(source, state.query, state.mode) }))
      .filter((source) => source.score > 0)
      .sort((a, b) => sortableDate(b.date) - sortableDate(a.date) || b.score - a.score);
  }

  function isFutureDate(value) {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date > today;
  }

  function sortableDate(value) {
    const date = new Date(value || "1900-01-01");
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function toIsoDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }

  function compactText(value, max = 360) {
    const text = Array.isArray(value) ? value.join(" ") : String(value || "");
    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  }

  function inferTypeFromText(...values) {
    const text = normalize(values.join(" "));
    if (/tesis|thesis|dissertation/.test(text)) return "Tesis";
    if (/book|libro/.test(text)) return "Libro";
    if (/report|informe/.test(text)) return "Informe";
    if (/guide|guia|manual/.test(text)) return "Guia";
    if (/preprint/.test(text)) return "Preprint";
    return "Articulo";
  }

  function uniqueResults(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = normalize(item.title).replace(/[^\w]+/g, " ").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function fetchJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function fetchText(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  async function searchOpenAlex(query, limit) {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}&sort=publication_date:desc`;
    const data = await fetchJson(url);
    return (data.results || []).map((item) => ({
      id: `openalex-${item.id || item.doi || item.title}`,
      repository: "OpenAlex",
      title: item.title || "Sin titulo",
      author: (item.authorships || []).slice(0, 4).map((auth) => auth.author?.display_name).filter(Boolean).join("; ") || "Autor no indicado",
      institution: item.primary_location?.source?.display_name || item.host_venue?.display_name || "Repositorio academico",
      date: item.publication_date || item.created_date || "",
      type: inferTypeFromText(item.type, item.title),
      url: item.primary_location?.landing_page_url || item.doi || item.id || "#",
      abstract: item.abstract_inverted_index ? invertedAbstract(item.abstract_inverted_index) : "Metadatos academicos recuperados desde OpenAlex.",
      methodology: "No especificada en metadatos",
      reliability: item.doi ? "Alta: registro academico con DOI o metadatos abiertos." : "Media: verificar fuente original.",
      sourceProvider: "OpenAlex"
    }));
  }

  async function searchCrossref(query, limit) {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}&sort=published&order=desc`;
    const data = await fetchJson(url);
    return (data.message?.items || []).map((item) => {
      const authors = (item.author || []).slice(0, 4).map((author) => [author.given, author.family].filter(Boolean).join(" ")).filter(Boolean);
      const dateParts = item.published?.["date-parts"]?.[0] || item.created?.["date-parts"]?.[0] || [];
      return {
        id: `crossref-${item.DOI || item.URL || item.title?.[0]}`,
        repository: "Crossref",
        title: item.title?.[0] || "Sin titulo",
        author: authors.join("; ") || "Autor no indicado",
        institution: item["container-title"]?.[0] || item.publisher || "Crossref",
        date: toIsoDate(dateParts.length ? dateParts.join("-") : ""),
        type: inferTypeFromText(item.type, item.subtype, item.title?.[0]),
        url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : "#"),
        abstract: compactText(item.abstract || "Metadatos DOI recuperados desde Crossref."),
        methodology: "No especificada en metadatos",
        reliability: item.DOI ? "Alta: registro DOI en Crossref." : "Media: verificar fuente original.",
        sourceProvider: "Crossref"
      };
    });
  }

  async function searchDoaj(query, limit) {
    const url = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=${limit}`;
    const data = await fetchJson(url);
    return (data.results || []).map((entry) => {
      const item = entry.bibjson || {};
      const authors = (item.author || []).slice(0, 4).map((author) => author.name).filter(Boolean);
      const journal = item.journal?.title || item.publisher || "DOAJ";
      const link = (item.link || []).find((candidate) => candidate.url)?.url;
      return {
        id: `doaj-${entry.id || item.identifier?.[0]?.id || item.title}`,
        repository: "DOAJ",
        title: item.title || "Sin titulo",
        author: authors.join("; ") || "Autor no indicado",
        institution: journal,
        date: toIsoDate(item.year ? `${item.year}-01-01` : item.month ? `${item.year}-${item.month}-01` : ""),
        type: "Articulo",
        url: link || "#",
        abstract: compactText(item.abstract || "Articulo de revista de acceso abierto recuperado desde DOAJ."),
        methodology: "No especificada en metadatos",
        reliability: "Alta: fuente registrada en DOAJ, verificar revista y articulo original.",
        sourceProvider: "DOAJ"
      };
    });
  }

  async function searchEuropePmc(query, limit) {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=${limit}&sort=FIRST_PDATE_D desc`;
    const data = await fetchJson(url);
    return (data.resultList?.result || []).map((item) => ({
      id: `europepmc-${item.id || item.doi || item.title}`,
      repository: "Europe PMC",
      title: item.title || "Sin titulo",
      author: item.authorString || "Autor no indicado",
      institution: item.journalTitle || item.source || "Europe PMC",
      date: item.firstPublicationDate || item.pubYear || "",
      type: inferTypeFromText(item.pubType, item.title),
      url: item.doi ? `https://doi.org/${item.doi}` : item.pmcid ? `https://europepmc.org/article/PMC/${item.pmcid.replace(/^PMC/i, "")}` : `https://europepmc.org/article/${item.source || "MED"}/${item.id}`,
      abstract: compactText(item.abstractText || "Resultado academico recuperado desde Europe PMC."),
      methodology: "No especificada en metadatos",
      reliability: item.doi ? "Alta: registro cientifico con DOI." : "Media-alta: verificar texto completo y revista.",
      sourceProvider: "Europe PMC"
    }));
  }

  async function searchArxiv(query, limit) {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=submittedDate&sortOrder=descending`;
    const xml = await fetchText(url);
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.querySelectorAll("entry")).map((entry) => ({
      id: `arxiv-${entry.querySelector("id")?.textContent || entry.querySelector("title")?.textContent}`,
      repository: "arXiv",
      title: compactText(entry.querySelector("title")?.textContent || "Sin titulo", 220),
      author: Array.from(entry.querySelectorAll("author name")).slice(0, 4).map((node) => node.textContent).join("; ") || "Autor no indicado",
      institution: "arXiv",
      date: toIsoDate(entry.querySelector("published")?.textContent),
      type: "Preprint",
      url: entry.querySelector("id")?.textContent || "#",
      abstract: compactText(entry.querySelector("summary")?.textContent || "Preprint recuperado desde arXiv."),
      methodology: "No especificada en metadatos",
      reliability: "Media-alta: preprint academico, puede no estar revisado por pares.",
      sourceProvider: "arXiv"
    }));
  }

  async function searchSemanticScholar(query, limit) {
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,abstract,url,venue,publicationDate,externalIds,isOpenAccess,openAccessPdf`;
    const data = await fetchJson(url);
    return (data.data || []).map((item) => ({
      id: `semantic-${item.paperId || item.url || item.title}`,
      repository: "Semantic Scholar",
      title: item.title || "Sin titulo",
      author: (item.authors || []).slice(0, 4).map((author) => author.name).filter(Boolean).join("; ") || "Autor no indicado",
      institution: item.venue || "Semantic Scholar",
      date: item.publicationDate || (item.year ? `${item.year}-01-01` : ""),
      type: "Articulo",
      url: item.openAccessPdf?.url || item.url || "#",
      abstract: compactText(item.abstract || "Resultado academico recuperado desde Semantic Scholar."),
      methodology: "No especificada en metadatos",
      reliability: item.externalIds?.DOI ? "Alta: registro con DOI enlazado." : "Media: verificar fuente original.",
      sourceProvider: "Semantic Scholar"
    }));
  }

  function invertedAbstract(index = {}) {
    const words = [];
    Object.entries(index).forEach(([word, positions]) => {
      (positions || []).forEach((position) => {
        words[position] = word;
      });
    });
    return compactText(words.filter(Boolean).join(" ") || "Metadatos academicos recuperados desde OpenAlex.");
  }

  async function runFederatedSearch() {
    const query = state.query.trim();
    state.page = 1;
    if (!query) {
      state.lastSearch = "";
      state.liveResults = [];
      state.liveStatuses = [];
      state.selected = new Set(["s1"]);
      render();
      return;
    }
    state.isSearching = true;
    state.liveStatuses = academicRepositories.map((repo) => ({ name: repo.name, status: "Buscando" }));
    render();
    const perProvider = Math.min(20, Math.max(8, Math.ceil(state.pageSize / 2)));
    const settled = await Promise.allSettled(academicRepositories.map((repo) => repo.search(query, perProvider)));
    const results = [];
    const statuses = [];
    settled.forEach((result, index) => {
      const repo = academicRepositories[index];
      if (result.status === "fulfilled") {
        results.push(...result.value);
        statuses.push({ name: repo.name, status: `${result.value.length} resultados` });
      } else {
        statuses.push({ name: repo.name, status: "No disponible desde el navegador" });
      }
    });
    state.liveResults = uniqueResults(results).sort((a, b) => sortableDate(b.date) - sortableDate(a.date));
    state.liveStatuses = statuses;
    state.lastSearch = query;
    state.selected = new Set();
    state.isSearching = false;
    persist();
    render();
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
    const appMarkup = `
      <section class="hero">
        <div>
          <h1>Academic Finder IA</h1>
          <p>Busca fuentes academicas confiables y resumelas con la IA de tu preferencia.</p>
        </div>
        <div class="hero-actions">
          ${surface !== "web" ? '<button class="btn btn-primary" data-action="open-sidepanel">Abrir panel lateral</button>' : '<a class="btn btn-primary" href="#demo">Ir al buscador</a>'}
        </div>
      </section>

      <section id="demo" class="search-panel">
        <span class="step-badge">1</span>
        <h2 class="panel-title">Busca en repositorios academicos</h2>
        <form class="search-form toolbar-row" data-action="search-submit">
          <label class="field grow">
            <span>Autor, titulo, institucion o tema</span>
            <input data-field="query" type="search" value="${escapeHtml(state.query)}" placeholder="Ej.: inteligencia artificial en educacion">
          </label>
          <button class="btn btn-primary btn-lg" type="submit">Buscar</button>
        </form>
        <div class="quick-links toolbar-row">
          ${explorerRoutes.map(explorerChip).join("")}
        </div>
        <div class="toolbar-row">
          <div class="segmented" role="group" aria-label="Modo de busqueda">
            <button class="${state.mode === "exact" ? "active" : ""}" data-mode="exact">Exacta</button>
            <button class="${state.mode === "broad" ? "active" : ""}" data-mode="broad">Exploratoria</button>
          </div>
          <label class="field inline">
            <span>Tipo de fuente</span>
            <select data-field="sourceType">
              ${sourceTypeOptions().map((option) => `<option value="${option.value}" ${state.sourceType === option.value ? "selected" : ""}>${option.label}</option>`).join("")}
            </select>
          </label>
          <label class="field inline">
            <span>Por pagina</span>
            <select data-field="pageSize">
              ${[10, 50, 100].map((size) => `<option value="${size}" ${state.pageSize === size ? "selected" : ""}>${size}</option>`).join("")}
            </select>
          </label>
        </div>
        <p class="status-line">${statusLine()}</p>
      </section>

      <section class="results-panel">
        <span class="step-badge">2</span>
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Resultados</h2>
            <p>${state.isSearching ? "Buscando en repositorios academicos..." : `${results.length} resultados, del mas reciente al mas antiguo`}</p>
          </div>
          <div class="pager">
            <button data-action="prev-page" ${state.page === 1 ? "disabled" : ""}>Anterior</button>
            <span>${state.page} / ${totalPages}</span>
            <button data-action="next-page" ${state.page === totalPages ? "disabled" : ""}>Siguiente</button>
          </div>
        </div>
        <div class="toolbar-row results-actions">
          <span class="actions-label">Con lo seleccionado:</span>
          <button class="btn btn-secondary" data-action="save-selected">Guardar</button>
          <button class="btn btn-secondary" data-action="cite-selected">Citar</button>
          <select data-field="exportFormat">
            <option value="json" ${state.exportFormat === "json" ? "selected" : ""}>JSON</option>
            <option value="csv" ${state.exportFormat === "csv" ? "selected" : ""}>CSV</option>
            <option value="bibtex" ${state.exportFormat === "bibtex" ? "selected" : ""}>BibTeX</option>
          </select>
          <button class="btn btn-secondary" data-action="export-selected">Exportar</button>
        </div>
        <div class="result-list">
          ${state.isSearching ? '<div class="empty">Consultando OpenAlex, Crossref, DOAJ, Europe PMC, arXiv y Semantic Scholar...</div>' : pageResults.map(resultCard).join("") || '<div class="empty">Sin resultados. Prueba busqueda exploratoria o una frase mas simple.</div>'}
        </div>
      </section>

      <section class="ai-panel">
        <span class="step-badge">3</span>
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Resume con IA</h2>
            <p>Elige proveedor y modelo (los gratuitos dicen "Gratis"), pega tu API key y genera un resumen real.</p>
          </div>
        </div>
        <div class="provider-grid">
          <label class="field">
            <span>Proveedor</span>
            <select data-field="provider">
              ${Object.entries(providers).map(([key, value]) => `<option value="${key}" ${state.provider === key ? "selected" : ""}>${value.label}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Modelo</span>
            <select data-field="model">
              ${modelOptions()}
            </select>
          </label>
          <label class="field">
            <span>Perfil</span>
            <select data-field="profile">
              ${profiles.map((profile) => `<option value="${profile}" ${state.profile === profile ? "selected" : ""}>${profile}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>API key</span>
            <input data-field="apiKey" type="password" value="${escapeHtml(state.apiKey)}" placeholder="Pega aqui tu API key">
          </label>
        </div>
        <p class="provider-hint">${provider.guidance || ""} ${escapeHtml(currentAdapter().freeNote || "")}</p>
        <label class="field">
          <span>Texto, pregunta o pagina para analizar</span>
          <textarea data-field="analysisText" rows="5" placeholder="Escribe una pregunta, pega texto academico o el contenido copiado de una pagina">${escapeHtml(state.analysisText)}</textarea>
        </label>
        <div class="button-row">
          <button class="btn btn-secondary" data-action="capture-page">Copiar contenido de la pagina</button>
          <button class="btn btn-primary" data-action="run-ai" ${state.isGenerating ? "disabled" : ""}>${state.isGenerating ? "Generando..." : "Generar resumen"}</button>
        </div>
        <div class="output">${state.output ? escapeHtml(state.output).replace(/\n/g, "<br>") : "La respuesta aparecera aqui."}</div>
      </section>
    `;
    root.innerHTML = surface === "web" ? renderDocsPage(appMarkup) : appMarkup + appFooter();
  }

  function appFooter() {
    return `
      <footer class="app-footer">
        <span>Creado por <strong>Pierre R.</strong></span>
        <a href="mailto:peru.labs.pe@gmail.com">peru.labs.pe@gmail.com</a>
      </footer>
    `;
  }

  function renderDocsPage(appMarkup) {
    return `
      <header class="docs-nav">
        <a class="brand" href="#inicio" aria-label="Academic Finder IA">
          <span class="brand-mark">AF</span>
          <span>Academic Finder IA</span>
        </a>
        <nav>
          <a href="#demo">Demo</a>
          <a href="#descarga">Descargar</a>
          <a href="#instalacion">Instalacion</a>
          <a href="#extension">Chrome</a>
          <a href="#ia">IA</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <a class="btn btn-primary" href="dist/academic-finder-ia-extension.zip" download>Descargar app</a>
      </header>

      <section id="inicio" class="docs-hero">
        <div>
          <h1>Encuentra y resume fuentes academicas en minutos</h1>
          <p>Academic Finder IA busca a la vez en 6 repositorios academicos abiertos (OpenAlex, Crossref, DOAJ, Europe PMC, arXiv y Semantic Scholar), ordena por lo mas reciente, genera citas y resume con la IA que tu elijas usando tu propia API key.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#demo">Probar demo gratis</a>
            <a class="btn btn-secondary" href="dist/academic-finder-ia-extension.zip" download>Descargar extension Chrome</a>
          </div>
        </div>
        <div class="docs-preview" aria-label="Vista previa de extension">
          <div class="preview-bar">
            <span></span><span></span><span></span>
          </div>
          <div class="preview-panel">
            <strong>Panel lateral Chrome</strong>
            <p>Trabaja junto a repositorios, tesis, papers y paginas institucionales.</p>
            <div class="mini-control">1. Buscar &middot; 2. Resultados &middot; 3. IA</div>
            <div class="mini-result"></div>
            <div class="mini-result short"></div>
          </div>
        </div>
      </section>

      <section class="docs-grid" aria-label="Funciones principales">
        ${docsCard("6 repositorios a la vez", "Una sola busqueda consulta OpenAlex, Crossref, DOAJ, Europe PMC, arXiv y Semantic Scholar.")}
        ${docsCard("Siempre lo mas reciente", "Los resultados se ordenan desde la fecha actual hacia las fuentes mas antiguas.")}
        ${docsCard("Citas y exportacion", "Genera citas al instante y exporta tu seleccion en JSON, CSV o BibTeX.")}
        ${docsCard("IA con modelos gratis", "Elige proveedor y modelo (los gratuitos estan marcados) y pega tu propia API key.")}
      </section>

      <section id="demo" class="docs-section">
        <div class="section-heading">
          <h2>Pruebala aqui mismo</h2>
          <p>Escribe una busqueda y presiona <strong>Buscar</strong>: la pagina consulta los repositorios academicos en vivo, sin registro ni instalacion.</p>
        </div>
        ${appMarkup}
      </section>

      <section id="descarga" class="docs-section docs-two-col">
        <div>
          <h2>Descargar la app</h2>
          <p>Descarga el paquete de extension Chrome listo para cargar en modo desarrollador. Incluye popup, panel lateral, busqueda federada, exportacion y resumen IA con tu propia API key.</p>
          <a class="btn btn-primary" href="dist/academic-finder-ia-extension.zip" download>Descargar Academic Finder IA</a>
        </div>
        <div class="docs-note">
          <h3>Contenido del paquete</h3>
          <p><code>manifest.json</code>, <code>popup.html</code>, <code>sidepanel.html</code> y carpeta <code>src/</code>.</p>
        </div>
      </section>

      <section id="instalacion" class="docs-section docs-two-col">
        <div>
          <h2>Como funciona</h2>
          <ol class="steps">
            <li>Descarga el ZIP desde esta pagina y descomprimelo en una carpeta.</li>
            <li>Abre <code>chrome://extensions</code> y activa <strong>Modo desarrollador</strong>.</li>
            <li>Presiona <strong>Cargar extension sin empaquetar</strong> y elige la carpeta descomprimida.</li>
            <li>Abre el icono de Academic Finder IA o usa <strong>Panel lateral</strong> para trabajar junto a paginas academicas.</li>
            <li>Busca por autor, titulo, institucion o tema; luego guarda, cita, exporta o analiza texto.</li>
          </ol>
        </div>
        <div class="docs-note">
          <h3>Tu API key, tus datos</h3>
          <p>La key se guarda solo en tu navegador y se usa unicamente para llamar directamente al proveedor de IA que elijas.</p>
        </div>
      </section>

      <section id="extension" class="docs-section docs-two-col">
        <div>
          <h2>Extension Chrome</h2>
          <p>El popup incluye busqueda, modo exacto/exploratorio, resultados por pagina, guardado, citas, exportacion, resumen IA con tu propia key, proveedor, perfil y captura de contenido visible.</p>
        </div>
        <div class="docs-note">
          <h3>Panel lateral corregido</h3>
          <p>La interfaz ahora usa ancho fluido, evita desbordamiento horizontal y se adapta cuando Chrome reduce el panel lateral.</p>
        </div>
      </section>

      <section id="ia" class="docs-section docs-two-col">
        <div>
          <h2>IA y proveedores</h2>
          <p>Soporta OpenAI, Anthropic, Gemini, OpenRouter, Groq, Mistral, NVIDIA y Cohere. El selector de modelos marca con <strong>(Gratis)</strong> los que tienen nivel gratuito: por ejemplo Gemini Flash, los modelos de Groq y los modelos :free de OpenRouter. Tu API key se guarda solo en tu navegador.</p>
        </div>
        <div class="docs-note">
          <h3>Perfiles</h3>
          <p>Buscador academico, analista de investigacion, estudiante escolar, universitario, tesista, docente y asesor academico.</p>
        </div>
      </section>

      <footer id="contacto" class="docs-footer">
        <div>
          <strong>Academic Finder IA</strong>
          <p>Buscador y resumidor academico gratuito y de codigo abierto.</p>
        </div>
        <div>
          <strong>Creador</strong>
          <p>Pierre R.</p>
          <a href="mailto:peru.labs.pe@gmail.com">peru.labs.pe@gmail.com</a>
        </div>
      </footer>
    `;
  }

  function docsCard(title, text) {
    return `
      <article class="docs-card">
        <h3>${title}</h3>
        <p>${text}</p>
      </article>
    `;
  }

  function explorerChip(route) {
    return `
      <button class="chip" data-explorer-query="${escapeHtml(route.query)}" type="button" title="${escapeHtml(route.description)}">
        ${escapeHtml(route.title)}
      </button>
    `;
  }

  function sourceTypeOptions() {
    return [
      { value: "all", label: "Todas las fuentes" },
      { value: "Articulo", label: "Articulos" },
      { value: "Tesis", label: "Tesis" },
      { value: "Preprint", label: "Preprints" },
      { value: "Informe", label: "Informes" },
      { value: "Libro", label: "Libros" },
      { value: "Guia", label: "Guias" }
    ];
  }

  function currentAdapter() {
    return window.AcademicProviderAdapters?.[state.provider] || {};
  }

  function modelOptions() {
    const adapter = currentAdapter();
    const models = adapter.models || (adapter.defaultModel ? [{ id: adapter.defaultModel, label: adapter.defaultModel, free: false }] : []);
    return models.map((model) => `<option value="${escapeHtml(model.id)}" ${state.model === model.id ? "selected" : ""}>${escapeHtml(model.label)}${model.free ? " (Gratis)" : ""}</option>`).join("");
  }

  function statusLine() {
    if (state.isSearching) return "Buscando en 6 repositorios academicos abiertos...";
    if (!state.liveStatuses.length) return "6 repositorios listos: OpenAlex, Crossref, DOAJ, Europe PMC, arXiv, Semantic Scholar.";
    const found = state.liveStatuses.filter((item) => /\d/.test(item.status)).length;
    return `Consultados 6 repositorios, ${found} respondieron con resultados.`;
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
        <p class="source-chip">${escapeHtml(item.repository || item.sourceProvider || "Fuente academica")}</p>
        <p>${escapeHtml(item.abstract)}</p>
        <div class="card-actions">
          <button data-action="toggle-save" data-id="${item.id}">${state.saved.has(item.id) ? "Guardado" : "Guardar fuente"}</button>
          <button data-action="cite-one" data-id="${item.id}">Generar cita</button>
          <a href="${item.url}" target="_blank" rel="noreferrer">Abrir fuente</a>
        </div>
      </article>
    `;
  }

  function formatDate(date) {
    if (!date || Number.isNaN(new Date(date).getTime())) return "s/f";
    return new Intl.DateTimeFormat("es-PE", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(date));
  }

  function selectedSources() {
    return activeSources().filter((item) => state.selected.has(item.id));
  }

  function citation(item) {
    if (!item) return "";
    const year = Number.isNaN(new Date(item.date).getTime()) ? "s/f" : new Date(item.date).getFullYear();
    return `${item.author} (${year}). ${item.title}. ${item.institution}. ${item.url}`;
  }

  function bibtex(item) {
    const year = Number.isNaN(new Date(item.date).getTime()) ? "s/f" : new Date(item.date).getFullYear();
    const key = `${normalize(item.author).split(" ")[0] || "fuente"}${year}`;
    return `@misc{${key},\n  author = {${item.author}},\n  title = {${item.title}},\n  year = {${year}},\n  institution = {${item.institution}},\n  url = {${item.url}}\n}`;
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

  function buildAiPrompt(text) {
    return [
      `Actua como asistente de investigacion academica para el perfil: ${state.profile}.`,
      "Analiza el siguiente texto o consulta de busqueda y responde en espanol, en puntos breves y utiles que incluyan: idea principal, relevancia academica, metodologia detectada (si aplica), datos de cita disponibles y una advertencia de confiabilidad si falta informacion.",
      "",
      "Texto o consulta:",
      text
    ].join("\n");
  }

  async function callAiProvider(providerKey, apiKey, prompt, model) {
    const adapter = window.AcademicProviderAdapters?.[providerKey];
    if (!adapter) throw new Error("Proveedor no soportado.");
    const finalModel = model || adapter.defaultModel;
    const response = await fetch(adapter.url(apiKey, finalModel), {
      method: "POST",
      headers: adapter.headers(apiKey),
      body: adapter.body(prompt, finalModel)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data?.error?.message || data?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }
    const text = adapter.extract(data);
    if (!text) throw new Error("El proveedor no devolvio contenido reconocible.");
    return text;
  }

  async function generateSummary() {
    const apiKey = state.apiKey.trim();
    if (!apiKey) {
      state.output = "Pega tu API key del proveedor elegido para generar un resumen real con IA.";
      return render();
    }
    const text = state.analysisText.trim() || selectedSources().map((item) => `${item.title}. ${item.abstract}`).join("\n");
    if (!text.trim()) {
      state.output = "Agrega texto, una consulta de busqueda o selecciona una fuente antes de generar el resumen.";
      return render();
    }
    state.isGenerating = true;
    state.output = "Consultando al proveedor de IA...";
    render();
    try {
      const prompt = buildAiPrompt(text);
      const result = await callAiProvider(state.provider, apiKey, prompt, state.model);
      state.output = result.trim();
    } catch (error) {
      state.output = `No se pudo generar el resumen: ${error.message}. Revisa la API key, el modelo o si el proveedor permite llamadas desde el navegador.`;
    } finally {
      state.isGenerating = false;
      persist();
      render();
    }
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
      provider: state.provider,
      profile: state.profile,
      apiKey: state.apiKey,
      model: state.model
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
      persist();
      return;
    } else if (field === "pageSize") {
      state.pageSize = Number(event.target.value);
      state.page = 1;
    } else if (field === "provider") {
      state.provider = event.target.value;
      state.model = window.AcademicProviderAdapters?.[state.provider]?.defaultModel || "";
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
    } else if (event.target.dataset.field === "sourceType") {
      state.sourceType = event.target.value;
      state.page = 1;
      persist();
      render();
    }
  });

  root.addEventListener("click", async (event) => {
    const actionTarget = event.target.closest("[data-action], [data-mode]");
    const explorerTarget = event.target.closest("[data-explorer-query]");
    if (!actionTarget && !explorerTarget) return;
    if (actionTarget?.tagName === "FORM") return;
    if (explorerTarget) {
      state.query = explorerTarget.dataset.explorerQuery || "";
      state.mode = inferMode(state.query);
      state.page = 1;
      persist();
      await runFederatedSearch();
      return;
    }
    const action = actionTarget.dataset.action;
    if (actionTarget.dataset.mode) {
      state.mode = actionTarget.dataset.mode;
      state.page = 1;
    } else if (action === "prev-page") state.page -= 1;
    else if (action === "next-page") state.page += 1;
    else if (action === "save-selected") selectedSources().forEach((item) => state.saved.add(item.id));
    else if (action === "toggle-save") state.saved.has(actionTarget.dataset.id) ? state.saved.delete(actionTarget.dataset.id) : state.saved.add(actionTarget.dataset.id);
    else if (action === "cite-selected") state.output = selectedSources().map(citation).join("\n\n") || "Selecciona una fuente para generar cita.";
    else if (action === "cite-one") state.output = citation(activeSources().find((item) => item.id === actionTarget.dataset.id));
    else if (action === "export-selected") return exportSelected();
    else if (action === "run-ai") return generateSummary();
    else if (action === "capture-page") return capturePageText();
    else if (action === "open-sidepanel") return openSidePanel();
    persist();
    render();
  });

  root.addEventListener("submit", async (event) => {
    if (!event.target.matches('[data-action="search-submit"]')) return;
    event.preventDefault();
    const input = event.target.querySelector('[data-field="query"]');
    state.query = input?.value || "";
    state.mode = inferMode(state.query);
    state.page = 1;
    persist();
    await runFederatedSearch();
  });

  load();
  render();
})();
