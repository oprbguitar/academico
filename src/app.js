(function () {
  const CREATOR_KEY = "PERULABS-CREATOR-2026";
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
    return activeSources()
      .map((source) => ({ ...source, score: scoreSource(source, state.query, state.mode) }))
      .filter((source) => source.score > 0)
      .filter((source) => !isFutureDate(source.date))
      .filter((source) => state.sourceType === "all" || source.type === state.sourceType)
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
          <p>Busca fuentes academicas, prioriza coincidencias reales, guarda resultados y prepara citas con un asistente IA opcional.</p>
        </div>
        <div class="hero-actions">
          <button class="btn btn-secondary" data-action="open-premium">Premium</button>
          ${surface !== "web" ? '<button class="btn btn-primary" data-action="open-sidepanel">Panel lateral</button>' : '<a class="btn btn-primary" href="#demo">Ver demo</a>'}
        </div>
      </section>

      ${!state.premium && !state.premiumDismissed ? premiumBanner() : ""}

      <section class="explorer-panel" aria-label="Explorador academico">
        <div class="section-heading compact-heading">
          <h2>Explorador academico</h2>
          <p>Rutas rapidas para revisar tesis, articulos, instituciones y criterios de confiabilidad sin perder el orden por resultados recientes.</p>
        </div>
        <div class="explorer-grid">
          ${explorerRoutes.map(explorerCard).join("")}
        </div>
      </section>

      <section id="demo" class="workspace">
        <aside class="control-panel">
          <form class="search-form" data-action="search-submit">
            <label class="field">
              <span>Busqueda academica</span>
              <input data-field="query" type="search" value="${escapeHtml(state.query)}" placeholder="Autor, titulo exacto, institucion o tema">
            </label>
            <button class="btn btn-primary" type="submit">Buscar</button>
          </form>
          <div class="segmented" role="group" aria-label="Modo de busqueda">
            <button class="${state.mode === "exact" ? "active" : ""}" data-mode="exact">Busqueda exacta</button>
            <button class="${state.mode === "broad" ? "active" : ""}" data-mode="broad">Busqueda exploratoria</button>
          </div>
          <label class="field">
            <span>Tipo de fuente</span>
            <select data-field="sourceType">
              ${sourceTypeOptions().map((option) => `<option value="${option.value}" ${state.sourceType === option.value ? "selected" : ""}>${option.label}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Resultados por pagina</span>
            <select data-field="pageSize">
              ${[10, 50, 100].map((size) => `<option value="${size}" ${state.pageSize === size ? "selected" : ""}>${size} resultados</option>`).join("")}
            </select>
          </label>
          <p class="ordering">Ordenado desde los resultados mas recientes hasta los mas antiguos.</p>
          <div class="repository-status">
            <strong>Repositorios consultados</strong>
            ${repositoryStatus()}
          </div>
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
              <p>${state.isSearching ? "Buscando en repositorios academicos..." : `${results.length} coincidencias estrictas o relevantes`}</p>
            </div>
            <div class="pager">
              <button data-action="prev-page" ${state.page === 1 ? "disabled" : ""}>Anterior</button>
              <span>${state.page} / ${totalPages}</span>
              <button data-action="next-page" ${state.page === totalPages ? "disabled" : ""}>Siguiente</button>
            </div>
          </div>
          <div class="result-list">
            ${state.isSearching ? '<div class="empty">Consultando OpenAlex, Crossref, DOAJ, arXiv y Semantic Scholar...</div>' : pageResults.map(resultCard).join("") || '<div class="empty">No hay resultados relacionados. Prueba busqueda exploratoria o una frase menos restrictiva.</div>'}
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
    root.innerHTML = surface === "web" ? renderDocsPage(appMarkup) : appMarkup;
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
        </nav>
        <a class="btn btn-primary" href="dist/academic-finder-ia-extension.zip" download>Descargar app</a>
      </header>

      <section id="inicio" class="docs-hero">
        <div>
          <h1>Documentacion de Academic Finder IA</h1>
          <p>Demo publica y extension Chrome para buscar en repositorios academicos abiertos, ordenar resultados desde lo mas reciente, generar citas y preparar resumenes IA breves en espanol.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#demo">Probar demo</a>
            <a class="btn btn-secondary" href="dist/academic-finder-ia-extension.zip" download>Descargar extension</a>
          </div>
        </div>
        <div class="docs-preview" aria-label="Vista previa de extension">
          <div class="preview-bar">
            <span></span><span></span><span></span>
          </div>
          <div class="preview-panel">
            <strong>Panel lateral Chrome</strong>
            <p>Abierto junto a repositorios, tesis, papers y paginas institucionales.</p>
            <div class="mini-control">Busqueda exacta</div>
            <div class="mini-result"></div>
            <div class="mini-result short"></div>
          </div>
        </div>
      </section>

      <section class="docs-grid" aria-label="Funciones principales">
        ${docsCard("Orden reciente", "Los resultados se muestran desde la fecha de busqueda hacia fuentes mas antiguas.")}
        ${docsCard("Precision", "Busqueda exacta para nombres, autores, instituciones, frases y titulos especificos.")}
        ${docsCard("Paginacion", "Selector claro de 10, 50 o 100 resultados por pagina en demo y extension.")}
        ${docsCard("Premium amable", "La ventana premium puede cerrarse y el modo basico sigue disponible.")}
      </section>

      <section id="demo" class="docs-section">
        <div class="section-heading">
          <h2>Demo funcional para GitHub Pages</h2>
          <p>Usa el explorador, escribe una busqueda, presiona <strong>Buscar</strong> o Enter y la pagina consultara indices y repositorios abiertos como OpenAlex, Crossref, DOAJ, Europe PMC, arXiv y Semantic Scholar.</p>
        </div>
        ${appMarkup}
      </section>

      <section id="descarga" class="docs-section docs-two-col">
        <div>
          <h2>Descargar la app</h2>
          <p>Descarga el paquete de extension Chrome listo para cargar en modo desarrollador. Incluye popup, panel lateral, busqueda federada, exportacion, proveedor IA y configuracion premium demo.</p>
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
          <h3>Clave demo</h3>
          <p><code>PERULABS-CREATOR-2026</code></p>
          <p>Solo sirve para pruebas, demo comercial y presentacion. No es autenticacion segura de produccion.</p>
        </div>
      </section>

      <section id="extension" class="docs-section docs-two-col">
        <div>
          <h2>Extension Chrome</h2>
          <p>El popup incluye busqueda, modo exacto/exploratorio, resultados por pagina, guardado, citas, exportacion, resumen IA premium, proveedor, perfil y captura de contenido visible.</p>
        </div>
        <div class="docs-note">
          <h3>Panel lateral corregido</h3>
          <p>La interfaz ahora usa ancho fluido, evita desbordamiento horizontal y se adapta cuando Chrome reduce el panel lateral.</p>
        </div>
      </section>

      <section id="ia" class="docs-section docs-two-col">
        <div>
          <h2>IA y proveedores</h2>
          <p>Los metadatos de proveedores viven en <code>src/providerMetadata.js</code> para actualizar modelos y notas sin tocar la interfaz principal.</p>
        </div>
        <div class="docs-note">
          <h3>Perfiles</h3>
          <p>Buscador academico, analista de investigacion, estudiante escolar, universitario, tesista, docente y asesor academico.</p>
        </div>
      </section>
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

  function explorerCard(route) {
    return `
      <button class="explorer-card" data-explorer-query="${escapeHtml(route.query)}" type="button">
        <span>${escapeHtml(route.title)}</span>
        <small>${escapeHtml(route.description)}</small>
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

  function repositoryStatus() {
    const statuses = state.liveStatuses.length
      ? state.liveStatuses
      : academicRepositories.map((repo) => ({ name: repo.name, status: "Listo" }));
    return `
      <div class="repo-list">
        ${statuses.map((item) => `<span><b>${escapeHtml(item.name)}</b>${escapeHtml(item.status)}</span>`).join("")}
      </div>
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

  function renderCategories(categories = {}) {
    return `<div class="model-tags">${Object.entries(categories).map(([label, values]) => `<span><b>${label}:</b> ${escapeHtml(values.join(", "))}</span>`).join("")}</div>`;
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
      persist();
      return;
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
    else if (action === "close-premium") state.premiumDismissed = true;
    else if (action === "open-premium") state.premiumDismissed = false;
    else if (action === "activate-premium") {
      const key = state.premiumKey.trim();
      state.premium = key === CREATOR_KEY;
      state.output = state.premium ? "Premium demo activado correctamente." : "Clave no valida para esta demo.";
    } else if (action === "save-selected") selectedSources().forEach((item) => state.saved.add(item.id));
    else if (action === "toggle-save") state.saved.has(actionTarget.dataset.id) ? state.saved.delete(actionTarget.dataset.id) : state.saved.add(actionTarget.dataset.id);
    else if (action === "cite-selected") state.output = selectedSources().map(citation).join("\n\n") || "Selecciona una fuente para generar cita.";
    else if (action === "cite-one") state.output = citation(activeSources().find((item) => item.id === actionTarget.dataset.id));
    else if (action === "export-selected") return exportSelected();
    else if (action === "run-ai") generateSummary();
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
