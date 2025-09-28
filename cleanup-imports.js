const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function cleanupFile(file) {
  if (!file.endsWith('.js') && !file.endsWith('.jsx')) return;

  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let seen = new Set();
  let cleaned = [];

  for (let line of lines) {
    if (line.startsWith('import')) {
      if (seen.has(line.trim())) continue; // skip duplicate
      seen.add(line.trim());
    }
    cleaned.push(line);
  }

  fs.writeFileSync(file, cleaned.join('\n'), 'utf8');
  console.log(`Cleaned: ${file}`);
}

// run through src folder
walkDir(path.join(__dirname, 'src'), cleanupFile);
