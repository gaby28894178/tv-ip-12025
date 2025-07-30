import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio si no existe
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'channels');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Leer el archivo de canales
const canalesPath = path.join(__dirname, '..', 'public', 'canales.json');
const canalesData = JSON.parse(fs.readFileSync(canalesPath, 'utf8'));

// Función para descargar una imagen
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url || url === '#' || url === '') {
      console.log(`❌ Saltando ${filename} - URL vacía o inválida`);
      resolve(false);
      return;
    }

    const protocol = url.startsWith('https:') ? https : http;
    const filePath = path.join(imagesDir, filename);

    // Si el archivo ya existe, saltarlo
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filename} ya existe, saltando...`);
      resolve(true);
      return;
    }

    console.log(`📥 Descargando ${filename} desde ${url}`);

    const file = fs.createWriteStream(filePath);
    
    const request = protocol.get(url, (response) => {
      // Verificar si la respuesta es exitosa
      if (response.statusCode !== 200) {
        console.log(`❌ Error ${response.statusCode} al descargar ${filename}`);
        fs.unlinkSync(filePath); // Eliminar archivo parcial
        resolve(false);
        return;
      }

      // Verificar tipo de contenido
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        console.log(`❌ ${filename} no es una imagen válida (${contentType})`);
        fs.unlinkSync(filePath); // Eliminar archivo parcial
        resolve(false);
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ ${filename} descargado exitosamente`);
        resolve(true);
      });

      file.on('error', (err) => {
        console.log(`❌ Error al escribir ${filename}:`, err.message);
        fs.unlinkSync(filePath); // Eliminar archivo parcial
        resolve(false);
      });
    });

    request.on('error', (err) => {
      console.log(`❌ Error al descargar ${filename}:`, err.message);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Eliminar archivo parcial
      }
      resolve(false);
    });

    request.setTimeout(10000, () => {
      console.log(`❌ Timeout al descargar ${filename}`);
      request.destroy();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Eliminar archivo parcial
      }
      resolve(false);
    });
  });
}

// Función para obtener extensión de archivo desde URL
function getFileExtension(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname);
    
    // Si no hay extensión, intentar detectar desde parámetros
    if (!ext) {
      if (url.includes('gstatic.com') || url.includes('imgur.com')) {
        return '.png'; // Asumir PNG para estos servicios
      }
      return '.jpg'; // Asumir JPG por defecto
    }
    
    return ext;
  } catch {
    return '.jpg'; // Fallback
  }
}

// Función principal
async function downloadAllImages() {
  console.log('🚀 Iniciando descarga de imágenes de canales...\n');
  
  const downloadPromises = [];
  const updatedCanales = [];

  for (const canal of canalesData.canales) {
    if (canal.logo && canal.logo !== '#' && canal.logo !== '') {
      const extension = getFileExtension(canal.logo);
      const filename = `canal-${canal.id}${extension}`;
      
      downloadPromises.push(
        downloadImage(canal.logo, filename).then(success => ({
          canal,
          filename: success ? filename : null,
          success
        }))
      );
    } else {
      // Canal sin logo válido
      updatedCanales.push({
        ...canal,
        logo: '/images/channels/default.svg' // Usar logo por defecto
      });
    }
  }

  // Esperar a que todas las descargas terminen
  const results = await Promise.all(downloadPromises);
  
  // Actualizar los canales con las rutas locales
  for (const result of results) {
    if (result.success && result.filename) {
      updatedCanales.push({
        ...result.canal,
        logo: `/images/channels/${result.filename}`
      });
    } else {
      // Si falló la descarga, usar logo por defecto
      updatedCanales.push({
        ...result.canal,
        logo: '/images/channels/default.svg'
      });
    }
  }

  // Crear logo por defecto si no existe
  const defaultLogoPath = path.join(imagesDir, 'default.svg');
  if (!fs.existsSync(defaultLogoPath)) {
    const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1f2937" rx="8"/>
  <rect x="20" y="30" width="60" height="40" fill="#374151" rx="4"/>
  <circle cx="35" cy="45" r="3" fill="#6b7280"/>
  <polygon points="45,40 45,50 55,45" fill="#6b7280"/>
  <text x="50" y="80" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="8">TV</text>
</svg>`;
    fs.writeFileSync(defaultLogoPath, defaultSvg);
    console.log('✅ Logo por defecto creado');
  }

  // Guardar el archivo actualizado
  const updatedData = {
    ...canalesData,
    canales: updatedCanales
  };

  fs.writeFileSync(canalesPath, JSON.stringify(updatedData, null, 2));
  
  console.log('\n🎉 Descarga completada!');
  console.log(`✅ ${results.filter(r => r.success).length} imágenes descargadas exitosamente`);
  console.log(`❌ ${results.filter(r => !r.success).length} imágenes fallaron`);
  console.log('📝 Archivo canales.json actualizado con rutas locales');
}

// Ejecutar el script
downloadAllImages().catch(console.error);