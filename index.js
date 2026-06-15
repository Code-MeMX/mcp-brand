import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const contexts = {
  corporativa: await fs.readFile(path.join(__dirname, "context/corporativa.mdx"), "utf-8"),
  lenguaje: await fs.readFile(path.join(__dirname, "context/lenguaje.mdx"), "utf-8"),
  visual: await fs.readFile(path.join(__dirname, "context/visual.mdx"), "utf-8"),
  mascota: await fs.readFile(path.join(__dirname, "context/mascota.mdx"), "utf-8")
};

const server = new Server(
  {
    name: "code-me-brand-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Helper to read all mdx files in a directory and return their contents combined.
 */
async function readDocsFromDirectory(dirName) {
  try {
    const dirPath = path.join(DOCS_BASE_PATH, dirName);
    const files = await fs.readdir(dirPath);
    const mdxFiles = files.filter(f => f.endsWith(".mdx"));
    
    let combinedContent = `--- Content from ${dirName} ---\n\n`;
    for (const file of mdxFiles) {
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, "utf-8");
      combinedContent += `## File: ${file}\n\n${content}\n\n`;
    }
    return combinedContent;
  } catch (err) {
    return `Error reading docs for ${dirName}: ${err.message}`;
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_brand_identity",
        description: "Retrieves the Code-Me brand identity (naming, philosophy, tagline). Use this to understand the core mission and vision.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_tone_of_voice",
        description: "Retrieves the Code-Me tone of voice rules and language guidelines. Use this to validate or generate text for different audiences (parents, students, teachers).",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_visual_guidelines",
        description: "Retrieves the Code-Me visual guidelines including colors, typography, logos, and illustration rules.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_mascota",
        description: "Retrieves the Code-Me mascot rules and personality (Bitxo).",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  switch (name) {
    case "get_brand_identity": {
      return {
        content: [{ type: "text", text: contexts.corporativa }],
      };
    }

    case "get_tone_of_voice": {
      return { content: [{ type: "text", text: contexts.lenguaje }] };
    }

    case "get_visual_guidelines": {
      return { content: [{ type: "text", text: contexts.visual }] };
    }

    case "get_mascota": {
      return { content: [{ type: "text", text: contexts.mascota }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Prompts Implementation
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "write_social_post",
        description: "Escribe un post para redes sociales de Code-Me",
        arguments: [
          { name: "topic", description: "Tema del post", required: true },
          { name: "audience", description: "Audiencia objetivo (ej. padres, teens)", required: true }
        ]
      },
      {
        name: "generate_tagline",
        description: "Genera slogans basados en la filosofía Code-Me",
        arguments: [
          { name: "context", description: "Contexto de la campaña", required: true }
        ]
      },
      {
        name: "write_sales_pitch",
        description: "Genera un pitch de ventas para Code-Me",
        arguments: [
          { name: "target", description: "A quién va dirigido (inversores, escuelas)", required: true }
        ]
      },
      {
        name: "validate_tone",
        description: "Analiza un texto existente y sugiere cambios para que suene 100% como Code-Me",
        arguments: [
          { name: "draft_text", description: "El texto a evaluar", required: true }
        ]
      },
      {
        name: "write_class_intro",
        description: "Escribe la introducción para una nueva clase o módulo, enfocada en Kids & Teens",
        arguments: [
          { name: "topic", description: "Tema de la clase (ej. HTML, Python, IA)", required: true }
        ]
      },
      {
        name: "write_parent_newsletter",
        description: "Redacta un boletín o actualización para padres (modo Inversor)",
        arguments: [
          { name: "updates", description: "Puntos clave a comunicar a los padres", required: true }
        ]
      },
      {
        name: "generate_bitxo_dialogue",
        description: "Escribe líneas de diálogo de Bitxo (la mascota) para tooltips o feedback",
        arguments: [
          { name: "situation", description: "Situación (ej. error de código, felicitación)", required: true }
        ]
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const systemMessage = `
Eres un copywriter experto trabajando para Code-Me. 
Debes seguir estrictamente nuestras reglas de marca.
Aquí tienes el contexto de la marca:

=== CORPORATIVA ===
${contexts.corporativa}

=== LENGUAJE ===
${contexts.lenguaje}

=== MASCOTA (Bitxo) ===
${contexts.mascota}
  `;

  switch (name) {
    case "write_social_post":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Escribe un post para redes sociales sobre el tema: "${args.topic}". Va dirigido a la audiencia: "${args.audience}". Asegúrate de aplicar el Tono de Voz adecuado de Code-Me.` } }
        ]
      };
    case "generate_tagline":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Genera 5 opciones de slogans o taglines para la siguiente campaña: "${args.context}". Sigue el formato "REGENERA TU FUTURO" y las reglas de nuestra filosofía.` } }
        ]
      };
    case "write_sales_pitch":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Escribe un pitch de ventas o correo persuasivo dirigido a: "${args.target}". Utiliza los argumentos de nuestra misión ("Hackear la desigualdad") y mantén un nivel de "Brave Heart".` } }
        ]
      };
    case "validate_tone":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Por favor actúa como el Linter de Escritura de Code-Me. Evalúa el siguiente texto: "${args.draft_text}". Identifica si suena muy corporativo, aburrido o tradicional. Reescríbelo aplicando el Spanglish, la actitud Hacker y nuestro Tono de Voz oficial.` } }
        ]
      };
    case "write_class_intro":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Escribe la introducción o "misión" para una clase de Code-Me sobre: "${args.topic}". Va dirigida a Kids & Teens. Usa gamificación, habla como un "Sensei" o Tech Lead, y haz que suene como una aventura o hackathon, no como una clase de escuela tradicional.` } }
        ]
      };
    case "write_parent_newsletter":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Redacta una actualización o newsletter para los Padres de familia. Puntos a incluir: "${args.updates}". Mantén un tono aspiracional, seguro y aterrizado, explicando el valor tecnológico de lo que aprenden sus hijos sin asustarlos.` } }
        ]
      };
    case "generate_bitxo_dialogue":
      return {
        messages: [
          { role: "user", content: { type: "text", text: systemMessage } },
          { role: "user", content: { type: "text", text: `Escribe 3 opciones de diálogo corto (como un tooltip o mensaje de interfaz) dichas por nuestra mascota Bitxo. La situación es: "${args.situation}". Recuerda su personalidad de "Rubber Duck" amigable, interactivo y tecnológico.` } }
        ]
      };
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

// Run the server
async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Code-Me Brand MCP Server running on stdio");
}

async function runSSE(port) {
  const app = express();
  app.use(cors());

  let transport;

  app.get("/", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>>_ Code-Me Brand MCP</title>
  <style>
    :root {
      --cm-obsidiana: #0F172A;
      --cm-cyan-electrico: #00F0FF;
      --cm-rosa-ajolote: #FF2A6D;
      --cm-verde-terminal: #05FF00;
      --cm-blanco-consola: #F8FAFC;
    }
    body {
      background-color: var(--cm-obsidiana);
      color: var(--cm-blanco-consola);
      font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
      margin: 0;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      max-width: 800px;
      width: 100%;
      border: 1px solid var(--cm-cyan-electrico);
      padding: 2rem;
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
    }
    h1 {
      color: var(--cm-rosa-ajolote);
      text-transform: uppercase;
      border-bottom: 2px solid var(--cm-rosa-ajolote);
      padding-bottom: 0.5rem;
    }
    h2 {
      color: var(--cm-cyan-electrico);
      margin-top: 2rem;
    }
    p, li {
      line-height: 1.6;
    }
    code {
      background: rgba(248, 250, 252, 0.1);
      color: var(--cm-verde-terminal);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
    }
    pre {
      background: rgba(0,0,0,0.5);
      padding: 1rem;
      border-left: 2px solid var(--cm-verde-terminal);
      overflow-x: auto;
    }
    .endpoint {
      background: rgba(0, 240, 255, 0.1);
      border-left: 4px solid var(--cm-cyan-electrico);
      padding: 1rem;
      margin: 1.5rem 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>>_ Code-Me Brand MCP Server</h1>
    <p>El servidor de identidad de marca está <strong>EN LÍNEA</strong> y ejecutándose correctamente.</p>
    
    <h2>Conexión para Clientes de IA</h2>
    <p>Este no es un sitio web tradicional. Es un servidor Model Context Protocol (MCP) diseñado para comunicarse directamente con clientes e IAs (como Cursor o Claude Desktop).</p>
    
    <div class="endpoint">
      URL del Endpoint SSE: <code>${baseUrl}/mcp</code>
    </div>

    <h2>Cómo vincularlo a tu cliente (ej. Cursor)</h2>
    <ol>
      <li>Abre la configuración de tu cliente compatible con MCP.</li>
      <li>Busca la sección de <strong>MCP Servers</strong>.</li>
      <li>Añade un nuevo servidor y elige el tipo de conexión <strong>SSE</strong>.</li>
      <li>Ingresa la URL del endpoint proporcionada arriba.</li>
    </ol>
    
    <p style="color: var(--cm-verde-terminal); margin-top: 2rem;">>_ system.status: 200 OK</p>
  </div>
</body>
</html>`;
    res.send(html);
  });

  app.get("/mcp", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
    console.error("Client connected to SSE (MCP endpoint)");
  });

  app.post("/message", async (req, res) => {
    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(503).send("No active SSE connection");
    }
  });

  app.listen(port, () => {
    console.error(`Code-Me Brand MCP Server running on SSE at http://localhost:${port}`);
    console.error(`Client MCP Endpoint: http://localhost:${port}/mcp`);
    console.error(`Client POST Endpoint: http://localhost:${port}/message`);
  });
}

const PORT = process.env.PORT;
if (PORT) {
  runSSE(PORT).catch(console.error);
} else {
  runStdio().catch(console.error);
}
