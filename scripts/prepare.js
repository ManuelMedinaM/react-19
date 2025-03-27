// Script multiplataforma para preparar archivos
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');

// Asegurarse de que la carpeta public existe
async function ensurePublicDirExists() {
  try {
    await fs.mkdir(publicDir, { recursive: true });
    console.log('✅ Carpeta public verificada');
  } catch (error) {
    console.error('Error al crear carpeta public:', error);
  }
}

// Copiar un archivo
async function copyFile(source, dest) {
  try {
    const content = await fs.readFile(source, 'utf8');
    await fs.writeFile(dest, content, 'utf8');
    console.log(`✅ Archivo copiado: ${source} -> ${dest}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al copiar ${source}:`, error);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔄 Preparando archivos para la aplicación...');
  
  // Crear carpeta public si no existe
  await ensurePublicDirExists();
  
  // Copiar README.md
  const readmePath = join(rootDir, 'README.md');
  const readmeDestPath = join(publicDir, 'README.md');
  await copyFile(readmePath, readmeDestPath);
  
  // Copiar REACT19_FEATURES.md
  const featuresPath = join(rootDir, 'REACT19_FEATURES.md');
  const featuresDestPath = join(publicDir, 'REACT19_FEATURES.md');
  await copyFile(featuresPath, featuresDestPath);
  
  console.log('✅ Preparación completada');
}

// Ejecutar el script
main().catch(error => {
  console.error('❌ Error en el script de preparación:', error);
  console.error('❌ No se pudo completar la preparación de archivos');
}); 