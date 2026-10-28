// Pruebas de unidad e integración de SeparaBien. Ejecutar con:  node tests/test_logic.js
const assert = require('assert');
const SB = require('../logic.js');

const resultados = [];
function prueba(id, tipo, descripcion, fn) {
  try { fn(); resultados.push({ id, tipo, descripcion, ok: true }); }
  catch (e) { resultados.push({ id, tipo, descripcion, ok: false, error: e.message }); }
}
const memoria = () => { const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; };

// ---------- UNIDAD ----------
prueba('PU-01', 'Unidad', 'buscar() encuentra «botella» y la manda a la caneca blanca', () => {
  const r = SB.buscar('botella'); assert.ok(r.length >= 1); assert.strictEqual(r[0].caneca, 'blanca');
});
prueba('PU-02', 'Unidad', 'buscar() ignora tildes y mayúsculas («CÁSCARA»)', () => {
  const r = SB.buscar('CÁSCARA'); assert.ok(r.some(i => i.caneca === 'verde'));
});
prueba('PU-03', 'Unidad', 'buscar() devuelve lista vacía con menos de 2 letras', () => {
  assert.deepStrictEqual(SB.buscar('a'), []); assert.deepStrictEqual(SB.buscar(''), []);
});
prueba('PU-04', 'Unidad', 'buscar() devuelve lista vacía si el residuo no existe', () => {
  assert.deepStrictEqual(SB.buscar('xyzabc'), []);
});
prueba('PU-05', 'Unidad', 'buscar(«pila») clasifica como punto especial', () => {
  assert.strictEqual(SB.buscar('pila')[0].caneca, 'especial');
});
prueba('PU-06', 'Unidad', 'armarQuiz(5) devuelve 5 preguntas sin repetir', () => {
  const q = SB.armarQuiz(5, SB.crearRng(1));
  assert.strictEqual(q.length, 5); assert.strictEqual(new Set(q.map(x => x.item.nombre)).size, 5);
});
prueba('PU-07', 'Unidad', 'armarQuiz con la misma semilla da el mismo orden (reproducible)', () => {
  const a = SB.armarQuiz(5, SB.crearRng(7)).map(x => x.item.nombre);
  const b = SB.armarQuiz(5, SB.crearRng(7)).map(x => x.item.nombre);
  assert.deepStrictEqual(a, b);
});
prueba('PU-08', 'Unidad', 'responder() suma 10 puntos con respuesta correcta', () => {
  const p = { correcta: 'blanca' }; const r = SB.responder(SB.estadoInicial(), p, 'blanca', '2026-10-21');
  assert.strictEqual(r.estado.puntos, 10); assert.strictEqual(r.acierto, true);
});
prueba('PU-09', 'Unidad', 'responder() no suma puntos con respuesta incorrecta', () => {
  const r = SB.responder(SB.estadoInicial(), { correcta: 'blanca' }, 'negra', '2026-10-21');
  assert.strictEqual(r.estado.puntos, 0); assert.strictEqual(r.estado.intentos, 1); assert.strictEqual(r.acierto, false);
});
prueba('PU-10', 'Unidad', 'La racha sube al jugar días consecutivos', () => {
  let e = SB.actualizarRacha(SB.estadoInicial(), '2026-10-19');
  e = SB.actualizarRacha(e, '2026-10-20'); e = SB.actualizarRacha(e, '2026-10-21');
  assert.strictEqual(e.racha, 3);
});
prueba('PU-11', 'Unidad', 'La racha se reinicia a 1 si se salta un día', () => {
  let e = SB.actualizarRacha(SB.estadoInicial(), '2026-10-19'); e = SB.actualizarRacha(e, '2026-10-22');
  assert.strictEqual(e.racha, 1);
});
prueba('PU-12', 'Unidad', 'La racha no cambia si se juega dos veces el mismo día', () => {
  let e = SB.actualizarRacha(SB.estadoInicial(), '2026-10-21'); e = SB.actualizarRacha(e, '2026-10-21');
  assert.strictEqual(e.racha, 1);
});
prueba('PU-13', 'Unidad', 'La racha funciona al cambiar de mes (31 oct → 1 nov)', () => {
  let e = SB.actualizarRacha(SB.estadoInicial(), '2026-10-31'); e = SB.actualizarRacha(e, '2026-11-01');
  assert.strictEqual(e.racha, 2);
});
prueba('PU-14', 'Unidad', 'Se otorga «Vecino Reciclador» al llegar a 50 puntos', () => {
  let e = SB.estadoInicial(); let nuevas = [];
  for (let i = 0; i < 5; i++) { const r = SB.responder(e, { correcta: 'blanca' }, 'blanca', '2026-10-21'); e = r.estado; nuevas = nuevas.concat(r.nuevas); }
  assert.ok(e.insignias.includes('vecino_reciclador')); assert.ok(nuevas.includes('vecino_reciclador'));
});
prueba('PU-15', 'Unidad', 'Una insignia ya ganada no se entrega dos veces', () => {
  let e = SB.estadoInicial();
  for (let i = 0; i < 8; i++) e = SB.responder(e, { correcta: 'blanca' }, 'blanca', '2026-10-21').estado;
  assert.strictEqual(e.insignias.filter(x => x === 'vecino_reciclador').length, 1);
});
prueba('PU-16', 'Unidad', 'Se otorga «Experto en Orgánicos» tras 5 aciertos en verde', () => {
  let e = SB.estadoInicial();
  for (let i = 0; i < 5; i++) e = SB.responder(e, { correcta: 'verde' }, 'verde', '2026-10-21').estado;
  assert.ok(e.insignias.includes('experto_organicos'));
});
prueba('PU-17', 'Unidad', 'proximaRecoleccion() encuentra el siguiente día configurado', () => {
  const cal = SB.estadoInicial().calendario; cal[3] = 'blanca'; // miércoles
  const p = SB.proximaRecoleccion(cal, new Date(2026, 9, 19)); // lunes 19 oct 2026
  assert.strictEqual(p.dia, 'Miércoles'); assert.strictEqual(p.enDias, 2); assert.strictEqual(p.tipo, 'blanca');
});
prueba('PU-18', 'Unidad', 'proximaRecoleccion() devuelve null si no hay días configurados', () => {
  assert.strictEqual(SB.proximaRecoleccion(SB.estadoInicial().calendario, new Date(2026, 9, 19)), null);
});
prueba('PU-19', 'Unidad', 'Todos los residuos del catálogo tienen una caneca válida', () => {
  SB.ITEMS.forEach(i => assert.ok(SB.BINS[i.caneca], 'Caneca inválida en: ' + i.nombre));
});

// ---------- INTEGRACIÓN ----------
prueba('PI-01', 'Integración', 'Jugar una ronda y guardar: al recargar se conservan puntos e insignias', () => {
  const m = memoria(); const alm = SB.crearAlmacen(m);
  let e = alm.cargar();
  SB.armarQuiz(5, SB.crearRng(3)).forEach(p => { e = SB.responder(e, p, p.correcta, '2026-10-21').estado; });
  alm.guardar(e);
  const recargado = SB.crearAlmacen(m).cargar();
  assert.strictEqual(recargado.puntos, 50); assert.ok(recargado.insignias.includes('vecino_reciclador'));
});
prueba('PI-02', 'Integración', 'Calendario configurado se guarda y la próxima recolección se calcula tras recargar', () => {
  const m = memoria(); const alm = SB.crearAlmacen(m); const e = alm.cargar();
  e.calendario[5] = 'verde'; alm.guardar(e); // viernes
  const p = SB.proximaRecoleccion(SB.crearAlmacen(m).cargar().calendario, new Date(2026, 9, 21)); // miércoles 21 oct
  assert.strictEqual(p.dia, 'Viernes'); assert.strictEqual(p.tipo, 'verde');
});
prueba('PI-03', 'Integración', 'Búsqueda y quiz son coherentes: cada pregunta coincide con el resultado del buscador', () => {
  SB.armarQuiz(SB.ITEMS.length, SB.crearRng(5)).forEach(p => {
    const hallado = SB.buscar(p.item.nombre.split(' ')[0]).find(i => i.nombre === p.item.nombre);
    assert.ok(hallado, 'No se encuentra: ' + p.item.nombre); assert.strictEqual(hallado.caneca, p.correcta);
  });
});
prueba('PI-04', 'Integración', 'Si el almacenamiento falla o está dañado, la app arranca con estado inicial', () => {
  const roto = { getItem: () => '{no es json', setItem: () => { throw new Error('lleno'); } };
  const alm = SB.crearAlmacen(roto); assert.strictEqual(alm.cargar().puntos, 0); assert.strictEqual(alm.guardar({}), false);
});

const ok = resultados.filter(r => r.ok).length;
resultados.forEach(r => console.log((r.ok ? 'PASA  ' : 'FALLA ') + r.id + ' [' + r.tipo + '] ' + r.descripcion + (r.ok ? '' : '  -> ' + r.error)));
console.log('\nResumen: ' + ok + ' de ' + resultados.length + ' pruebas aprobadas');
require('fs').writeFileSync(__dirname + '/resultados.json', JSON.stringify(resultados, null, 2));
process.exit(ok === resultados.length ? 0 : 1);
