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
