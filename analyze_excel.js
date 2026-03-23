const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filesDir = 'c:\\Users\\anonimo\\Desktop\\Agraviti\\aRCHIVOS';
const files = fs.readdirSync(filesDir).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));

files.forEach(file => {
    console.log(`--- Analyzing ${file} ---`);
    const filePath = path.join(filesDir, file);
    try {
        const workbook = XLSX.readFile(filePath);
        console.log(`Sheet Names: ${workbook.SheetNames.join(', ')}`);

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
            const columns = Object.keys(jsonData[0]);
            console.log(`Columns: ${columns.join(', ')}`);
            console.log(`Sample Row: ${JSON.stringify(jsonData[0], null, 2)}`);

            const dateKey = columns.find(k => k.toLowerCase().includes('fecha del evento') || k.toLowerCase().includes('fecha'));
            const raceKey = columns.find(k => k.toLowerCase().includes('nombre de la prueba') || k.toLowerCase().includes('prueba') || k.toLowerCase().includes('carrera'));
            const runnerKey = columns.find(k =>
                k.toLowerCase().includes('nombre, apellidos') ||
                k.toLowerCase().includes('corredor') ||
                k.toLowerCase().includes('participante') ||
                (k.toLowerCase() === 'nombre' && k !== raceKey)
            );

            console.log(`Detected Date Key: ${dateKey}`);
            console.log(`Detected Race Key: ${raceKey}`);
            console.log(`Detected Runner Key: ${runnerKey}`);
        } else {
            console.log('No data found in the first sheet.');
        }
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
    console.log('\n');
});
