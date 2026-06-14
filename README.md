# Code-Me Brand MCP Server

Este es un servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) diseñado exclusivamente para inyectar la identidad de marca, filosofía, tono de voz y lineamientos visuales de **Code-Me** directamente en cualquier cliente LLM (como Claude Desktop, Antigravity, Cursor, etc.).

Al estar empaquetado con los archivos de contexto en formato `.mdx` directamente en el código fuente, este servidor responde con **latencia cero**, permitiendo a la IA acceder a todas las reglas de forma instantánea sin hacer consultas externas.

## 🚀 Instalación y Uso

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura el servidor en tu cliente MCP (ej. `claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "code-me-brand": {
         "command": "node",
         "args": [
           "/ruta/absoluta/a/este/repositorio/index.js"
         ]
       }
     }
   }
   ```

## 🛠 Herramientas (Tools)

El servidor expone herramientas para que la IA pueda leer activamente el manual de marca según lo necesite:

- **`get_brand_identity`**: Extrae la filosofía central, misión, visión y significado del nombre (Corporativa).
- **`get_tone_of_voice`**: Extrae las reglas de lenguaje, Spanglish, y cómo hablarle a papás o alumnos.
- **`get_visual_guidelines`**: Extrae la lógica detrás de logotipos, tipografías y el estilo visual técnico de la marca.
- **`get_mascota`**: Extrae la personalidad y reglas de comportamiento de Bitxo, nuestra mascota tipo *Rubber Duck*.

## ✍️ Plantillas Generativas (Prompts)

Para facilitar la creación de contenido, el servidor ofrece "Prompts" listos para usarse. Estos prompts empaquetan las instrucciones maestras de marca y guían a la IA para hacer el trabajo duro por ti:

- **`write_social_post`**: Crea publicaciones de redes sociales ajustando el tono a la audiencia (teens vs padres).
- **`generate_tagline`**: Genera slogans poderosos usando el framework "Regenera tu Futuro".
- **`write_sales_pitch`**: Redacta correos o mensajes de venta agresivos pero profesionales para escuelas/inversionistas.
- **`validate_tone`**: Actúa como un **Linter de Escritura**, revisando textos aburridos y reescribiéndolos con la actitud Hacker y Spanglish de la marca.
- **`write_class_intro`**: Diseña introducciones súper gamificadas para las clases de los alumnos.
- **`write_parent_newsletter`**: Genera boletines serios pero aspiracionales para tranquilizar e informar a los padres.
- **`generate_bitxo_dialogue`**: Genera mensajes de interfaz o tooltips como si los estuviera diciendo la mascota Bitxo.

---
> *Code-Me: Regenera tu futuro.*
