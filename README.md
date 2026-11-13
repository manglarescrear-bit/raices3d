# Raíces 3D · una línea de Manglares Creativos

Sitio estático (HTML, CSS y JavaScript). No necesita instalar nada ni compilar.

## Estructura

```
raices3d/
├── index.html            Página principal (SEO, contenido y taller)
├── 404.html              Página de error
├── css/styles.css        Todos los estilos
├── js/site.js            Comportamiento del sitio y carga diferida del taller
├── js/generador.js       Generador de STL, vista 3D y cotizador
├── js/vendor/three.min.js   Librería 3D (three.js r128, incluida para no depender de internet)
├── img/                  Logos, íconos, imagen para redes y fondo de capas
├── robots.txt            Reglas para buscadores
├── sitemap.xml           Mapa del sitio
├── site.webmanifest      Datos para instalar la página como app
└── vercel.json           Cabeceras de seguridad y caché para Vercel
```

## Cómo publicarlo en Vercel (sin tocar tu página principal)

1. Crea un repositorio nuevo en GitHub (por ejemplo `raices3d`) y sube el contenido de esta carpeta.
2. En Vercel pulsa **Add New → Project**, elige ese repositorio y, cuando pida el nombre, escribe **raices3d**.
   Framework: **Other**. Deja vacíos el comando de build y la carpeta de salida.
3. Pulsa **Deploy**. Quedará en `https://raices3d.vercel.app` si el nombre está libre.

Es un proyecto aparte: tu proyecto `manglarescreativos` no cambia.

Alternativa sin GitHub: instala la CLI (`npm i -g vercel`), entra a la carpeta y ejecuta `vercel --prod`.
Otra opción rápida para pruebas: arrastrar la carpeta a https://app.netlify.com/drop

## Si tu dirección es distinta a raices3d.vercel.app

El sitio usa `https://raices3d.vercel.app` en estos archivos: `index.html`, `robots.txt` y `sitemap.xml`.
Si tu dirección final es otra (por ejemplo un subdominio propio), usa Buscar y reemplazar
en todo el proyecto (en VS Code: Ctrl+Mayús+H) y cambia `https://raices3d.vercel.app` por la tuya.

## SEO: pasos después de publicar

1. Entra a Google Search Console, agrega la dirección y envía `https://TU-DIRECCION/sitemap.xml`.
2. Pega la dirección en https://search.google.com/test/rich-results para revisar los datos estructurados.
3. Pruébala en https://pagespeed.web.dev y en https://www.opengraph.xyz (vista previa al compartir).
4. Enlaza la página desde tu sitio principal con el texto "Raíces 3D" y desde tus redes.
5. El botón "Conocer más" ya apunta a https://manglarescreativos.vercel.app/index.html.
   Si quieres que el sitio principal también enlace de vuelta, agrega allí un enlace a esta página.

## Cambios frecuentes

- **WhatsApp:** busca `573016939278` (en `index.html` y `js/site.js`) y `+57 301 693 9278`.
- **Colores:** variables al inicio de `css/styles.css`.
- **Textos de preguntas frecuentes:** si los cambias en la página, cámbialos también en el bloque
  `FAQPage` del JSON-LD dentro de `<head>`, para que coincidan.
- **Fuentes del generador:** lista `FONTS` al inicio de `js/generador.js` y enlace en `js/site.js`.
