// === CONFIGURACIÓN ===
const SHEET_MAPEO = 'Mapeo_Strava';
const SHEET_DATOS_STRAVA = 'Strava';
const SHEET_PRINCIPAL = 'Respuestas de formulario 5'; // Pestaña principal para nombres y sexo

/**
 * Sirve la página de instalación del marcador (Bookmarklet)
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  inicializarHojas(ss);

  const scriptUrl = ScriptApp.getService().getUrl();
  
  // Generar código minificado del marcador javascript
  const bookmarkletCode = `javascript:(function(){
    if (!window.location.hostname.includes('strava.com')) {
        alert('Este marcador solo funciona en la página de clasificación de tu Club en Strava. Abre Strava, ve a tu Club y vuelve a hacer clic.');
        return;
    }
    let table = null;
    const tables = document.querySelectorAll('table');
    for (const t of tables) {
        const text = t.textContent.toLowerCase();
        if ((text.includes('athlete') || text.includes('atleta') || text.includes('corredor') || text.includes('deportista')) && 
            (text.includes('distance') || text.includes('distancia') || text.includes('km'))) {
            table = t;
            break;
        }
    }
    if (!table) {
        table = document.querySelector('.leaderboard table') || document.querySelector('.table-leaderboard') || document.querySelector('table');
    }
    if (!table) {
        alert('No se encontró la tabla de clasificación. Asegúrate de estar en la página del club en Strava.');
        return;
    }
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim().toLowerCase());
    let athleteIdx = headers.findIndex(h => h.includes('athlete') || h.includes('atleta') || h.includes('corredor') || h.includes('deportista'));
    let distanceIdx = headers.findIndex(h => h.includes('distance') || h.includes('distancia') || h.includes('km'));
    let runsIdx = headers.findIndex(h => h.includes('carreras') || h.includes('runs') || h.includes('actividades') || h.includes('activities'));
    let longestIdx = headers.findIndex(h => h.includes('largo') || h.includes('longest') || h.includes('más largo'));
    let paceIdx = headers.findIndex(h => h.includes('ritmo') || h.includes('pace') || h.includes('promedio'));
    let elevationIdx = headers.findIndex(h => h.includes('desnivel') || h.includes('elevation') || h.includes('climb') || h.includes('positivo'));
    
    if (athleteIdx === -1) athleteIdx = 1;
    if (distanceIdx === -1) distanceIdx = 2;
    if (runsIdx === -1) runsIdx = 3;
    if (longestIdx === -1) longestIdx = 4;
    if (paceIdx === -1) paceIdx = 5;
    if (elevationIdx === -1) elevationIdx = 6;
    
    const rows = table.querySelectorAll('tbody tr');
    const leaderboard = [];
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > Math.max(athleteIdx, distanceIdx)) {
            const athleteCell = cells[athleteIdx];
            const nameLinks = Array.from(athleteCell.querySelectorAll('a'));
            const nameLink = nameLinks.reduce((longest, current) => {
                const currentText = current.textContent.trim();
                return currentText.length > longest.textContent.trim().length ? current : longest;
            }, nameLinks[0] || athleteCell);
            let rawName = nameLink ? nameLink.textContent.trim() : athleteCell.textContent.trim();
            if (!rawName) {
                rawName = athleteCell.textContent.trim();
            }
            let name = rawName.trim();
            const len = name.length;
            for (let i = 1; i <= len / 2; i++) {
                const s1 = name.substring(0, i);
                const s2 = name.substring(i);
                if (s1.toLowerCase() === s2.toLowerCase()) {
                    name = s1;
                    break;
                }
            }
            const distanceText = cells[distanceIdx].textContent.trim();
            const distance = parseFloat(distanceText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
            
            const runsText = runsIdx !== -1 && cells[runsIdx] ? cells[runsIdx].textContent.trim() : '0';
            const runs = parseInt(runsText.replace(/[^0-9]/g, '')) || 0;
            
            const longestText = longestIdx !== -1 && cells[longestIdx] ? cells[longestIdx].textContent.trim() : '0';
            const longest = parseFloat(longestText.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
            
            const pace = paceIdx !== -1 && cells[paceIdx] ? cells[paceIdx].textContent.trim() : '';
            
            const elevationText = elevationIdx !== -1 && cells[elevationIdx] ? cells[elevationIdx].textContent.trim() : '0';
            const elevation = parseInt(elevationText.replace(/[^0-9]/g, '')) || 0;
            
            if (name && distance > 0) {
                leaderboard.push({ name, distance, runs, longest, pace, elevation });
            }
        }
    });
    if (leaderboard.length === 0) {
        alert('No se encontraron corredores con kilómetros en la clasificación.');
        return;
    }
    let isLastWeek = false;
    if (window.location.search.includes('week_offset=1')) {
        isLastWeek = true;
    } else {
        const activeTabs = document.querySelectorAll('.active, .selected, [aria-selected=true]');
        for (const tab of activeTabs) {
            const text = tab.textContent.toLowerCase();
            if (text.includes('last week') || text.includes('semana pasada')) {
                isLastWeek = true;
                break;
            }
        }
    }
    const url = '${scriptUrl}';
    fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_leaderboard', data: leaderboard, week: isLastWeek ? 'last_week' : 'current_week' })
    }).then(() => {
        alert('¡Sincronización exitosa! Se han enviado ' + leaderboard.length + ' corredores al Excel de la Liga.');
    }).catch(err => {
        alert('Error al enviar los datos: ' + err.message);
    });
  })();`.replace(/\s+/g, ' ');


  return HtmlService.createTemplate(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; box-sizing: border-box; }
          .container { background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; max-width: 550px; width: 100%; border: 1px solid rgba(255,255,255,0.08); }
          h1 { color: #f97316; margin-top: 0; font-size: 1.8rem; font-weight: 800; }
          .bookmarklet-btn { display: inline-block; background: linear-gradient(135deg, #f97316, #ef4444); color: white; padding: 1rem 2rem; border-radius: 0.75rem; font-weight: bold; text-decoration: none; font-size: 1.1rem; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); border: none; cursor: grab; margin: 2rem 0; transition: transform 0.2s; }
          .bookmarklet-btn:active { cursor: grabbing; }
          p { color: #94a3b8; line-height: 1.6; font-size: 1rem; }
          ol { text-align: left; color: #cbd5e1; padding-left: 1.5rem; line-height: 1.8; margin-top: 1.5rem; }
          li strong { color: white; }
          .step-badge { display: inline-block; background: rgba(249, 115, 22, 0.15); color: #f97316; padding: 0.2rem 0.6rem; border-radius: 0.5rem; font-size: 0.8rem; font-weight: bold; margin-right: 0.5rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚡ Sincronizador Strava Club</h1>
          <p>Instala el marcador de la Liga Running arrastrando el botón naranja a tu barra de favoritos:</p>
          
          <a class="bookmarklet-btn" href="${bookmarkletCode}" onclick="alert('Arrastra este botón a tu barra de marcadores (favoritos) del navegador, no hagas clic aquí.'); return false;">
            Sincronizar Strava
          </a>
          
          <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
            <h3>¿Cómo usarlo?</h3>
            <ol>
              <li><span class="step-badge">1</span> Asegúrate de que la **barra de marcadores** de tu navegador esté visible (en Chrome/Edge: Ctrl + Mayús + B).</li>
              <li><span class="step-badge">2</span> **Arrastra el botón naranja** de arriba y suéltalo en tu barra de marcadores.</li>
              <li><span class="step-badge">3</span> Abre Strava, inicia sesión y ve a la página de tu **Club** (donde se ve la clasificación semanal).</li>
              <li><span class="step-badge">4</span> Haz clic en tu nuevo marcador **"Sincronizar Strava"** en la barra. ¡Y listo! Los datos se enviarán y guardarán en este Excel de forma instantánea.</li>
            </ol>
          </div>
        </div>
      </body>
    </html>
  `).evaluate();
}

/**
 * Recibe los datos enviados desde el marcador del navegador
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.action === 'sync_leaderboard') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      inicializarHojas(ss);
      
      const rawData = payload.data; // Array de {name, distance}
      const weekType = payload.week || 'current_week'; // 'current_week' o 'last_week'
      
      // Obtener el lunes de la semana correspondiente
      const now = new Date();
      if (weekType === 'last_week') {
        // Restar 7 días para obtener la fecha de la semana pasada
        now.setDate(now.getDate() - 7);
      }
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      startOfWeek.setHours(0, 0, 0, 0);
      const fechaLunesStr = startOfWeek.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      const dataSheet = ss.getSheetByName(SHEET_DATOS_STRAVA);
      
      // Cargar mapeos de nombres existentes
      const mappings = obtenerMapeos(ss);
      
      // Cargar géneros de corredores desde la pestaña principal para emparejamiento automático
      const runnerGenders = obtenerGenerosCorredores(ss);

      // Eliminar registros existentes en la pestaña 'Strava' para este lunes (evita duplicados si se vuelve a pulsar)
      eliminarRegistrosSemanaActual(dataSheet, fechaLunesStr);

      let guardadosCount = 0;
      
      // Escribir los nuevos datos mapeados
      rawData.forEach(item => {
        let stravaName = item.name.trim();
        // Clean duplicated name pattern (e.g. "NameName") from scraper
        const len = stravaName.length;
        for (let i = 1; i <= len / 2; i++) {
          const s1 = stravaName.substring(0, i);
          const s2 = stravaName.substring(i);
          if (s1.toLowerCase() === s2.toLowerCase()) {
            stravaName = s1;
            break;
          }
        }
        const distance = parseFloat(item.distance) || 0;
        const runs = parseInt(item.runs) || 0;
        const longest = parseFloat(item.longest) || 0;
        const pace = String(item.pace || '').trim();
        const elevation = parseInt(item.elevation) || 0;
        
        // Mapear nombre
        let officialName = stravaName;
        if (mappings.hasOwnProperty(stravaName)) {
          officialName = mappings[stravaName];
        }

        // Buscar género asociado
        let sexo = 'H'; // Valor por defecto
        if (runnerGenders.hasOwnProperty(officialName)) {
          sexo = runnerGenders[officialName];
        }

        // Añadir registro de la semana
        dataSheet.appendRow([
          "scraped_" + Utilities.getUuid().substring(0, 8), // ID Actividad dummy
          new Date(),                                      // Marca temporal
          officialName,                                    // Nombre, Apellidos
          "Strava Club Leaderboard",                       // Nombre de la Prueba
          distance,                                        // Distancia de la prueba
          fechaLunesStr,                                   // Fecha del Evento (Lunes de la semana)
          sexo,                                            // Sexo
          "Asfalto",                                       // Tipo de Carrera por defecto
          0,                                               // Puntuación adicional
          runs,                                            // Actividades (Columna J)
          longest,                                         // Salida mas larga (Columna K)
          pace,                                            // Ritmo medio (Columna L)
          elevation                                        // Desnivel (Columna M)
        ]);
        
        guardadosCount++;
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: guardadosCount }))
                           .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Inicializa hojas
 */
function inicializarHojas(ss) {
  if (!ss.getSheetByName(SHEET_MAPEO)) {
    const mapSheet = ss.insertSheet(SHEET_MAPEO);
    mapSheet.appendRow(['Nombre en Strava (Exacto)', 'Nombre Oficial en Excel (Nombre, Apellidos)']);
    mapSheet.getRange('A1:B1').setFontWeight('bold').setBackground('#fed7aa');
    // Ejemplo
    mapSheet.appendRow(['Ejemplo Deportista S.', 'Ejemplo Deportista Solis']);
  }
  
  let dataSheet = ss.getSheetByName(SHEET_DATOS_STRAVA);
  if (!dataSheet) {
    dataSheet = ss.insertSheet(SHEET_DATOS_STRAVA);
    dataSheet.appendRow([
      'ID Actividad', 'Marca temporal', 'Nombre, Apellidos', 'Nombre de la Prueba', 
      'Distancia de la prueba ', 'Fecha del Evento', 'Sexo', 'Tipo de Carrera', 'Puntuacion adicional',
      'Actividades', 'Salida mas larga', 'Ritmo medio', 'Desnivel'
    ]);
    dataSheet.getRange('A1:M1').setFontWeight('bold').setBackground('#cbd5e1');
  } else {
    // Si la hoja ya existe, comprobar que tenga las columnas adicionales y si no agregarlas
    const lastCol = dataSheet.getLastColumn();
    if (lastCol < 13) {
      dataSheet.getRange(1, 10, 1, 4).setValues([['Actividades', 'Salida mas larga', 'Ritmo medio', 'Desnivel']]);
      dataSheet.getRange('J1:M1').setFontWeight('bold').setBackground('#cbd5e1');
    }
  }
}

/**
 * Carga el mapa de nombres desde SHEET_MAPEO
 */
function obtenerMapeos(ss) {
  const sheet = ss.getSheetByName(SHEET_MAPEO);
  const map = {};
  if (!sheet) return map;
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return map;

  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  data.forEach(row => {
    const stravaName = String(row[0]).trim();
    const officialName = String(row[1]).trim();
    if (stravaName && officialName) {
      map[stravaName] = officialName;
    }
  });
  return map;
}

/**
 * Carga los géneros de los corredores de la pestaña principal para emparejamiento automático
 */
function obtenerGenerosCorredores(ss) {
  const sheet = ss.getSheetByName(SHEET_PRINCIPAL);
  const genders = {};
  if (!sheet) return genders;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return genders;

  // Obtenemos los valores de las filas. Buscaremos las columnas de nombre y sexo dinámicamente.
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const nameColIdx = headers.findIndex(h => h.toLowerCase().includes('nombre, apellidos') || h.toLowerCase() === 'nombre') + 1;
  const genderColIdx = headers.findIndex(h => h.toLowerCase().includes('sexo') || h.toLowerCase().includes('género') || h.toLowerCase().includes('genero')) + 1;

  if (nameColIdx === 0 || genderColIdx === 0) return genders;

  const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  rows.forEach(row => {
    const name = String(row[nameColIdx - 1]).trim();
    const genderVal = String(row[genderColIdx - 1]).trim().toUpperCase();
    if (name && genderVal) {
      const mappedGender = (genderVal.startsWith('M') && !genderVal.startsWith('MASC') || genderVal.startsWith('FEM') || genderVal.startsWith('F')) ? 'M' : 'H';
      genders[name] = mappedGender;
    }
  });

  return genders;
}

/**
 * Elimina todas las filas de la tabla Strava que tengan la fecha de lunes indicada
 */
function eliminarRegistrosSemanaActual(sheet, fechaLunesStr) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const data = sheet.getRange(2, 6, lastRow - 1, 1).getValues(); // Columna F es 'Fecha del Evento'
  
  // Vamos de abajo hacia arriba para evitar problemas al eliminar filas
  for (let i = data.length - 1; i >= 0; i--) {
    let dateVal = data[i][0];
    let dateStr = "";
    if (dateVal instanceof Date) {
      const yyyy = dateVal.getFullYear();
      const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
      const dd = String(dateVal.getDate()).padStart(2, '0');
      dateStr = yyyy + "-" + mm + "-" + dd;
    } else {
      dateStr = String(dateVal).split('T')[0].trim();
    }
    
    if (dateStr === fechaLunesStr) {
      sheet.deleteRow(i + 2); // +2 por offset (1-based index y fila de cabecera)
    }
  }
}
