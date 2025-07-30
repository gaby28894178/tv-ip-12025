import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapeo de nombres de canales a archivos de logo
const logoMapping = {
  // Canales principales
  'T N  Todo Noticias': 'tn.svg',
  'TN Todo Noticias': 'tn.svg',
  'TN': 'tn.svg',
  'Todo Noticias': 'tn.svg',
  
  'C5N': 'c5n.svg',
  'C5N Noticias': 'c5n.svg',
  
  'Canal 13': 'canal13.svg',
  'Canal Trece': 'canal13.svg',
  'Trece': 'canal13.svg',
  '1 3 Max Televisión HD': 'canal13-hd.svg',
  '1 3 Max Televisión 720p': 'canal13-hd.svg',
  
  'Telefe': 'telefe.svg',
  'Telefé': 'telefe.svg',
  
  'TV Pública': 'tvpublica.svg',
  'Canal 7': 'tvpublica.svg',
  'Canal Siete': 'tvpublica.svg',
  
  'América': 'america-tv.svg',
  'América TV': 'america-tv.svg',
  'America': 'america-tv.svg',
  
  'El Nueve': 'el-nueve.svg',
  'Canal 9': 'el-nueve.svg',
  'Nueve': 'el-nueve.svg',
  
  'Net TV': 'net-tv.svg',
  'NetTV': 'net-tv.svg',
  
  'Canal 26': 'canal-26.svg',
  'Canal Veintiséis': 'canal-26.svg',
  
  'Crónica': 'cronica-tv.svg',
  'Crónica TV': 'cronica-tv.svg',
  'Cronica': 'cronica-tv.svg',
  
  'A24': 'a24.svg',
  'A 24': 'a24.svg',
  
  'La Nación +': 'la-nacion-plus.svg',
  'La Nación Plus': 'la-nacion-plus.svg',
  'LN+': 'la-nacion-plus.svg',
  
  // Canales regionales
  '5TV Corrientes': '5tv-corrientes.svg',
  '5 TV Corrientes': '5tv-corrientes.svg',
  
  'Canal 7 Neuquén': 'canal-7-neuquen.svg',
  'Canal 7 Neuquen': 'canal-7-neuquen.svg',
  
  'Canal 9 Litoral': 'canal-9-litoral.svg',
  'Canal 9 del Litoral': 'canal-9-litoral.svg',
  
  'Chaco TV': 'chaco-tv.svg',
  'Canal Chaco': 'chaco-tv.svg',
  
  'Canal 22': 'canal-22.svg',
  'Canal Veintidós': 'canal-22.svg',
  
  'Aire Santa Fe': 'aire-santa-fe.svg',
  'Aire de Santa Fe': 'aire-santa-fe.svg',
  
  'Argentinísima Satelital': 'argentinisima-satelital.svg',
  'Argentinisima Satelital': 'argentinisima-satelital.svg',
  
  'Celta TV': 'celta-tv.svg',
  'Celta Televisión': 'celta-tv.svg',
  
  'Canal 2 de Ushuaia': 'canal-2-ushuaia.svg',
  'Canal 2 Ushuaia': 'canal-2-ushuaia.svg',
  
  'Canal 2 Misiones': 'canal-2-misiones.svg',
  'Canal 2 de Misiones': 'canal-2-misiones.svg',
  
  'Canal 3 La Pampa': 'canal-3-la-pampa.svg',
  'Canal 3 de La Pampa': 'canal-3-la-pampa.svg',
  
  'Canal 4 Posadas': 'canal-4-posadas.svg',
  'Canal 4 de Posadas': 'canal-4-posadas.svg',
  
  'Canal 4 San Juan': 'canal-4-san-juan.svg',
  'Canal 4 de San Juan': 'canal-4-san-juan.svg',
  
  'Canal 5 Santa Fe': 'canal-5-santa-fe.svg',
  'Canal 5 de Santa Fe': 'canal-5-santa-fe.svg',
  
  'Canal 6 Posadas': 'canal-6-posadas.svg',
  'Canal 6 de Posadas': 'canal-6-posadas.svg',
  
  'Beats Radio': 'beats-radio.svg',
  'Beats Radio Multimedia': 'beats-radio.svg',
  
  'Azahares Radio Multimedia': 'azahares-radio.svg',
  'Azahares Radio': 'azahares-radio.svg',
  
  // Otros
  'WOW TV': 'wowtv.svg',
  'Wow TV': 'wowtv.svg',
  'WOWTV': 'wowtv.svg',
  
  'CSI': 'csi.svg',
  'C.S.I.': 'csi.svg',
  
  'Garage TV': 'garage-tv.svg',
  'Garage TV Latin America': 'garage-tv.svg',
  'GARAGE TV': 'garage-tv.svg',
  
  'CPEtv': 'cpetv.svg',
  'CPE TV': 'cpetv.svg',
  'CPE tv': 'cpetv.svg'
};

// Función para encontrar el logo más apropiado
function findBestLogo(nombreCanal) {
  // Buscar coincidencia exacta
  if (logoMapping[nombreCanal]) {
    return logoMapping[nombreCanal];
  }
  
  // Buscar coincidencia parcial (insensible a mayúsculas)
  const nombreLower = nombreCanal.toLowerCase();
  
  for (const [key, logo] of Object.entries(logoMapping)) {
    if (nombreLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nombreLower)) {
      return logo;
    }
  }
  
  // Buscar por palabras clave
  if (nombreLower.includes('tn') || nombreLower.includes('todo noticias')) {
    return 'tn.svg';
  }
  if (nombreLower.includes('c5n')) {
    return 'c5n.svg';
  }
  if (nombreLower.includes('canal 13') || nombreLower.includes('trece')) {
    return 'canal13.svg';
  }
  if (nombreLower.includes('telefe')) {
    return 'telefe.svg';
  }
  if (nombreLower.includes('tv pública') || nombreLower.includes('canal 7')) {
    return 'tvpublica.svg';
  }
  if (nombreLower.includes('américa') || nombreLower.includes('america')) {
    return 'america-tv.svg';
  }
  if (nombreLower.includes('nueve') || nombreLower.includes('canal 9')) {
    return 'el-nueve.svg';
  }
  if (nombreLower.includes('net tv')) {
    return 'net-tv.svg';
  }
  if (nombreLower.includes('canal 26')) {
    return 'canal-26.svg';
  }
  if (nombreLower.includes('crónica') || nombreLower.includes('cronica')) {
    return 'cronica-tv.svg';
  }
  if (nombreLower.includes('a24') || nombreLower.includes('a 24')) {
    return 'a24.svg';
  }
  if (nombreLower.includes('la nación') || nombreLower.includes('ln+')) {
    return 'la-nacion-plus.svg';
  }
  if (nombreLower.includes('corrientes') && nombreLower.includes('5')) {
    return '5tv-corrientes.svg';
  }
  if (nombreLower.includes('neuquén') && nombreLower.includes('7')) {
    return 'canal-7-neuquen.svg';
  }
  if (nombreLower.includes('litoral') && nombreLower.includes('9')) {
    return 'canal-9-litoral.svg';
  }
  if (nombreLower.includes('wow')) {
    return 'wowtv.svg';
  }
  if (nombreLower.includes('csi')) {
    return 'csi.svg';
  }
  if (nombreLower.includes('garage')) {
    return 'garage-tv.svg';
  }
  if (nombreLower.includes('cpe')) {
    return 'cpetv.svg';
  }
  if (nombreLower.includes('chaco')) {
    return 'chaco-tv.svg';
  }
  if (nombreLower.includes('canal 22') || nombreLower.includes('canal22')) {
    return 'canal-22.svg';
  }
  if (nombreLower.includes('aire') && nombreLower.includes('santa fe')) {
    return 'aire-santa-fe.svg';
  }
  if (nombreLower.includes('argentinísima') || nombreLower.includes('argentinisima')) {
    return 'argentinisima-satelital.svg';
  }
  if (nombreLower.includes('celta')) {
    return 'celta-tv.svg';
  }
  if (nombreLower.includes('ushuaia') && nombreLower.includes('2')) {
    return 'canal-2-ushuaia.svg';
  }
  if (nombreLower.includes('misiones') && nombreLower.includes('2')) {
    return 'canal-2-misiones.svg';
  }
  if (nombreLower.includes('la pampa') && nombreLower.includes('3')) {
    return 'canal-3-la-pampa.svg';
  }
  if (nombreLower.includes('posadas') && nombreLower.includes('4')) {
    return 'canal-4-posadas.svg';
  }
  if (nombreLower.includes('san juan') && nombreLower.includes('4')) {
    return 'canal-4-san-juan.svg';
  }
  if (nombreLower.includes('santa fe') && nombreLower.includes('5')) {
    return 'canal-5-santa-fe.svg';
  }
  if (nombreLower.includes('posadas') && nombreLower.includes('6')) {
    return 'canal-6-posadas.svg';
  }
  if (nombreLower.includes('beats')) {
    return 'beats-radio.svg';
  }
  if (nombreLower.includes('azahares')) {
    return 'azahares-radio.svg';
  }
  
  // Si no encuentra nada, usar el logo por defecto
  return 'default.svg';
}

// Función principal
async function updateLogos() {
  console.log('🚀 Actualizando logos de canales...\n');
  
  // Leer el archivo de canales
  const canalesPath = path.join(__dirname, '..', 'public', 'canales.json');
  const canalesData = JSON.parse(fs.readFileSync(canalesPath, 'utf8'));
  
  let updatedCount = 0;
  
  // Actualizar cada canal
  for (const canal of canalesData.canales) {
    const logoAnterior = canal.logo;
    const nuevoLogo = findBestLogo(canal.nombre);
    
    canal.logo = `/images/channels/${nuevoLogo}`;
    
    if (logoAnterior !== canal.logo) {
      console.log(`✅ ${canal.nombre}: ${logoAnterior} → ${canal.logo}`);
      updatedCount++;
    }
  }
  
  // Guardar el archivo actualizado
  fs.writeFileSync(canalesPath, JSON.stringify(canalesData, null, 2));
  
  console.log(`\n🎉 Actualización completada!`);
  console.log(`✅ ${updatedCount} canales actualizados`);
  console.log(`📝 Archivo canales.json guardado`);
}

// Ejecutar el script
updateLogos().catch(console.error);