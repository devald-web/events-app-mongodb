const fs = require('fs');
const path = require('path');

// Configuración - carpetas a ignorar
const IGNORED_DIRS = ['node_modules', 'venv', '.git', '.vscode', '__pycache__'];

/**
 * Genera una representación en árbol de la estructura de directorios
 * @param {string} dirPath - Ruta del directorio a explorar
 * @param {string} prefix - Prefijo para el formato del árbol (usado en la recursión)
 * @param {boolean} isLast - Indica si es el último elemento en su nivel (usado en la recursión)
 * @returns {string} Representación de la estructura en formato árbol
 */
function generateDirectoryTree(dirPath, prefix = '', isLast = true) {
    const dirName = path.basename(dirPath);
    const connector = isLast ? '└── ' : '├── ';
    let tree = prefix + connector + dirName + '\n';
    
    try {
        const items = fs.readdirSync(dirPath);
        const dirs = [];
        const files = [];
        
        // Separar archivos y directorios
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                // Ignorar directorios configurados
                if (!IGNORED_DIRS.includes(item)) {
                    dirs.push(item);
                }
            } else {
                files.push(item);
            }
        });
        
        // Ordenar alfabéticamente
        dirs.sort();
        files.sort();
        
        // Generar extensión para el siguiente nivel
        const extension = isLast ? '    ' : '│   ';
        
        // Procesar subdirectorios
        dirs.forEach((dir, index) => {
            const isLastDir = index === dirs.length - 1 && files.length === 0;
            tree += generateDirectoryTree(
                path.join(dirPath, dir),
                prefix + extension,
                isLastDir
            );
        });
        
        // Procesar archivos
        files.forEach((file, index) => {
            const isLastFile = index === files.length - 1;
            const fileConnector = isLastFile ? '└── ' : '├── ';
            tree += prefix + extension + fileConnector + file + '\n';
        });
        
        return tree;
    } catch (err) {
        return tree + prefix + '    ├── Error al leer el directorio: ' + err.message + '\n';
    }
}

/**
 * Función principal para generar y mostrar el árbol de directorios
 */
function showDirectoryTree() {
    // Obtener la ruta desde los argumentos o usar el directorio actual
    const targetPath = process.argv[2] || '.';
    
    // Obtener la ruta absoluta
    const absolutePath = path.resolve(targetPath);
    
    console.log(`Estructura de directorios para: ${absolutePath}`);
    console.log('.');
    
    try {
        // Verificar si la ruta existe y es un directorio
        const stats = fs.statSync(absolutePath);
        if (!stats.isDirectory()) {
            console.error(`Error: "${absolutePath}" no es un directorio`);
            process.exit(1);
        }
        
        // Generar y mostrar el árbol
        const items = fs.readdirSync(absolutePath);
        const dirs = [];
        const files = [];
        
        // Separar archivos y directorios
        items.forEach(item => {
            const itemPath = path.join(absolutePath, item);
            try {
                if (fs.statSync(itemPath).isDirectory()) {
                    // Ignorar directorios configurados
                    if (!IGNORED_DIRS.includes(item)) {
                        dirs.push(item);
                    }
                } else {
                    files.push(item);
                }
            } catch (err) {
                console.error(`Error al acceder a "${item}": ${err.message}`);
            }
        });
        
        // Ordenar alfabéticamente
        dirs.sort();
        files.sort();
        
        // Mostrar directorios
        dirs.forEach((dir, index) => {
            const isLast = index === dirs.length - 1 && files.length === 0;
            console.log(generateDirectoryTree(path.join(absolutePath, dir), '', isLast));
        });
        
        // Mostrar archivos
        files.forEach((file, index) => {
            const isLast = index === files.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            console.log(connector + file);
        });
        
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

// Ejecutar la función principal
showDirectoryTree();