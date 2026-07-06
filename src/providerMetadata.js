window.AcademicProviderAdapters = {
  openai: {
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini", free: false },
      { id: "gpt-4o", label: "GPT-4o", free: false },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini", free: false },
      { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", free: false }
    ],
    freeNote: "OpenAI no tiene nivel gratuito permanente, solo creditos de prueba para cuentas nuevas.",
    url: () => "https://api.openai.com/v1/chat/completions",
    headers: (key) => ({ "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }),
    body: (prompt, model) => JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    extract: (data) => data?.choices?.[0]?.message?.content
  },
  anthropic: {
    defaultModel: "claude-3-5-haiku-20241022",
    models: [
      { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", free: false },
      { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", free: false },
      { id: "claude-3-opus-20240229", label: "Claude 3 Opus", free: false }
    ],
    freeNote: "Anthropic no ofrece nivel gratuito permanente por API.",
    url: () => "https://api.anthropic.com/v1/messages",
    headers: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "Content-Type": "application/json"
    }),
    body: (prompt, model) => JSON.stringify({ model, max_tokens: 900, messages: [{ role: "user", content: prompt }] }),
    extract: (data) => data?.content?.[0]?.text
  },
  gemini: {
    defaultModel: "gemini-1.5-flash",
    models: [
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", free: true },
      { id: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash 8B", free: true },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", free: false }
    ],
    freeNote: "Los modelos Flash tienen nivel gratuito generoso en Google AI Studio (con limites de uso vigentes).",
    url: (key, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    headers: () => ({ "Content-Type": "application/json" }),
    body: (prompt) => JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    extract: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text
  },
  openrouter: {
    defaultModel: "meta-llama/llama-3.1-8b-instruct:free",
    models: [
      { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (free)", free: true },
      { id: "google/gemini-flash-1.5:free", label: "Gemini Flash 1.5 (free)", free: true },
      { id: "openai/gpt-4o-mini", label: "GPT-4o mini", free: false },
      { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet", free: false }
    ],
    freeNote: "Los modelos con sufijo :free no tienen costo, pero con limites de uso mas bajos.",
    url: () => "https://openrouter.ai/api/v1/chat/completions",
    headers: (key) => ({ "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }),
    body: (prompt, model) => JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    extract: (data) => data?.choices?.[0]?.message?.content
  },
  groq: {
    defaultModel: "llama-3.1-8b-instant",
    models: [
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", free: true },
      { id: "llama-3.1-70b-versatile", label: "Llama 3.1 70B Versatile", free: true },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B", free: true }
    ],
    freeNote: "Groq ofrece un nivel gratuito con limites de solicitudes por minuto para todos sus modelos.",
    url: () => "https://api.groq.com/openai/v1/chat/completions",
    headers: (key) => ({ "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }),
    body: (prompt, model) => JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    extract: (data) => data?.choices?.[0]?.message?.content
  },
  mistral: {
    defaultModel: "open-mistral-7b",
    models: [
      { id: "open-mistral-7b", label: "Open Mistral 7B", free: true },
      { id: "mistral-small-latest", label: "Mistral Small", free: false },
      { id: "mistral-large-latest", label: "Mistral Large", free: false }
    ],
    freeNote: "Los modelos open-weight tienen nivel gratuito limitado en La Plateforme.",
    url: () => "https://api.mistral.ai/v1/chat/completions",
    headers: (key) => ({ "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }),
    body: (prompt, model) => JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    extract: (data) => data?.choices?.[0]?.message?.content
  },
  nvidia: {
    defaultModel: "meta/llama3-8b-instruct",
    models: [
      { id: "meta/llama3-8b-instruct", label: "Llama 3 8B Instruct", free: true },
      { id: "mistralai/mixtral-8x7b-instruct-v0.1", label: "Mixtral 8x7B Instruct", free: true }
    ],
    freeNote: "NVIDIA NIM entrega creditos gratuitos limitados al crear una cuenta.",
    url: () => "https://integrate.api.nvidia.com/v1/chat/completions",
    headers: (key) => ({ "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }),
    body: (prompt, model) => JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    extract: (data) => data?.choices?.[0]?.message?.content
  },
  cohere: {
    defaultModel: "command-r",
    models: [
      { id: "command-r", label: "Command R", free: true },
      { id: "command-r-plus", label: "Command R+", free: false },
      { id: "command-light", label: "Command Light", free: true }
    ],
    freeNote: "Cohere entrega una API key de prueba gratuita con limites de uso.",
    url: () => "https://api.cohere.com/v1/chat",
    headers: (key) => ({ "Authorization": `Bearer ${key}`, "Content-Type": "application/json" }),
    body: (prompt, model) => JSON.stringify({ model, message: prompt }),
    extract: (data) => data?.text
  }
};

window.AcademicProviderMetadata = {
  openai: {
    label: "OpenAI",
    endpointNote: "Compatible con chat completions y respuestas estructuradas segun la cuenta configurada.",
    guidance: "Suele ser fuerte en redaccion academica, resumen breve y razonamiento. Revisa disponibilidad actual antes de elegir modelos.",
    categories: {
      "Redaccion academica": ["Modelos GPT recientes orientados a escritura y razonamiento"],
      "Resumen breve": ["Modelos GPT ligeros o de baja latencia"],
      "Clasificacion de fuentes": ["Modelos rapidos con salida JSON"],
      "Analisis largo": ["Modelos con contexto amplio"],
      "Respuesta rapida": ["Modelos mini o fast"],
      "Bajo costo o free tier": ["Opciones mini segun plan vigente"]
    }
  },
  gemini: {
    label: "Gemini",
    endpointNote: "Usa la API de Google AI Studio o Vertex AI segun el entorno.",
    guidance: "Buena opcion para contexto largo, resumen y analisis multimodal cuando este disponible.",
    categories: {
      "Redaccion academica": ["Modelos Pro actuales"],
      "Resumen breve": ["Modelos Flash actuales"],
      "Clasificacion de fuentes": ["Modelos Flash o ligeros"],
      "Analisis largo": ["Modelos con ventana de contexto amplia"],
      "Respuesta rapida": ["Modelos Flash"],
      "Bajo costo o free tier": ["Opciones Flash segun cuota vigente"]
    }
  },
  anthropic: {
    label: "Anthropic",
    endpointNote: "Requiere API key de Anthropic o un agregador compatible.",
    guidance: "Fuerte en lectura cuidadosa, escritura academica y analisis de documentos extensos.",
    categories: {
      "Redaccion academica": ["Familias Claude Sonnet u Opus vigentes"],
      "Resumen breve": ["Familias Claude Haiku o Sonnet vigentes"],
      "Clasificacion de fuentes": ["Modelos Haiku o Sonnet de baja latencia"],
      "Analisis largo": ["Modelos Claude con contexto amplio"],
      "Respuesta rapida": ["Familias Haiku"],
      "Bajo costo o free tier": ["Depende del plan o agregador"]
    }
  },
  openrouter: {
    label: "OpenRouter",
    endpointNote: "Permite enrutar a varios modelos con una API key de OpenRouter.",
    guidance: "Util para comparar proveedores, costos y modelos con contexto largo desde un solo panel.",
    categories: {
      "Redaccion academica": ["Modelos premium de escritura disponibles en OpenRouter"],
      "Resumen breve": ["Modelos compactos y rapidos"],
      "Clasificacion de fuentes": ["Modelos economicos con buena instruccion"],
      "Analisis largo": ["Modelos long-context disponibles"],
      "Respuesta rapida": ["Modelos low-latency"],
      "Bajo costo o free tier": ["Modelos marcados como free o low cost en OpenRouter"]
    }
  },
  groq: {
    label: "Groq",
    endpointNote: "Optimizado para baja latencia con modelos alojados por Groq.",
    guidance: "Muy util para respuesta rapida, clasificacion y resumen corto cuando se prioriza velocidad.",
    categories: {
      "Redaccion academica": ["Modelos instruct de mayor calidad disponibles"],
      "Resumen breve": ["Modelos rapidos tipo instruct"],
      "Clasificacion de fuentes": ["Modelos de baja latencia"],
      "Analisis largo": ["Depende del contexto admitido por el modelo elegido"],
      "Respuesta rapida": ["Modelos optimizados para velocidad"],
      "Bajo costo o free tier": ["Opciones gratuitas o promocionales segun disponibilidad"]
    }
  },
  mistral: {
    label: "Mistral",
    endpointNote: "Usa API de Mistral o proveedores compatibles.",
    guidance: "Buena relacion costo-calidad para resumen, clasificacion y redaccion con modelos instruct.",
    categories: {
      "Redaccion academica": ["Modelos Large o instruct vigentes"],
      "Resumen breve": ["Modelos Small o Ministral vigentes"],
      "Clasificacion de fuentes": ["Modelos Small/instruct"],
      "Analisis largo": ["Modelos con contexto extendido disponibles"],
      "Respuesta rapida": ["Modelos Small o low-latency"],
      "Bajo costo o free tier": ["Modelos pequenos segun plan"]
    }
  },
  nvidia: {
    label: "NVIDIA",
    endpointNote: "Puede usarse mediante NVIDIA NIM o endpoints compatibles.",
    guidance: "Conveniente para probar modelos abiertos optimizados y flujos empresariales.",
    categories: {
      "Redaccion academica": ["Modelos instruct alojados en NIM"],
      "Resumen breve": ["Modelos ligeros disponibles"],
      "Clasificacion de fuentes": ["Modelos instruct rapidos"],
      "Analisis largo": ["Modelos con contexto amplio si estan habilitados"],
      "Respuesta rapida": ["Endpoints optimizados"],
      "Bajo costo o free tier": ["Depende del catalogo NIM vigente"]
    }
  },
  cohere: {
    label: "Cohere",
    endpointNote: "Orientado a RAG, clasificacion, embeddings y generacion empresarial.",
    guidance: "Fuerte para clasificacion, busqueda semantica, RAG y resumen de fuentes.",
    categories: {
      "Redaccion academica": ["Modelos Command vigentes"],
      "Resumen breve": ["Modelos Command rapidos"],
      "Clasificacion de fuentes": ["Classify, Command o embeddings segun flujo"],
      "Analisis largo": ["Modelos Command con contexto ampliado"],
      "Respuesta rapida": ["Modelos Command ligeros"],
      "Bajo costo o free tier": ["Opciones trial o gratuitas segun cuenta"]
    }
  }
};
