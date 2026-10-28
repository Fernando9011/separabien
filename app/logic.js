/* SeparaBien - lógica de negocio (sin dependencias del navegador).
   Funciona en el navegador (window.SB) y en Node (module.exports) para poder probarla. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SB = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Canecas según el código de colores de Colombia (Resolución 2184 de 2019)
  const BINS = {
    blanca:   { nombre: 'Caneca blanca',  sub: 'Aprovechables' },
    negra:    { nombre: 'Caneca negra',   sub: 'No aprovechables' },
    verde:    { nombre: 'Caneca verde',   sub: 'Orgánicos' },
    especial: { nombre: 'Punto especial', sub: 'No va a las canecas' }
  };

  const ITEMS = [
    { nombre: 'Botella plástica (PET)', caneca: 'blanca', nota: 'Vacíala, aplástala y ciérrala con su tapa.', kw: ['botella', 'gaseosa', 'agua', 'pet', 'plastico'] },
    { nombre: 'Envase de detergente o champú', caneca: 'blanca', nota: 'Enjuágalo antes de botarlo.', kw: ['shampoo', 'champu', 'detergente', 'envase', 'frasco'] },
    { nombre: 'Bolsa plástica limpia', caneca: 'blanca', nota: 'Debe estar limpia y seca.', kw: ['bolsa', 'plastico'] },
    { nombre: 'Tapas plásticas', caneca: 'blanca', nota: 'Pueden ir sueltas o puestas en la botella.', kw: ['tapa', 'tapas', 'plastico'] },
    { nombre: 'Caja de cartón', caneca: 'blanca', nota: 'Desármala y mantenla seca.', kw: ['carton', 'caja'] },
    { nombre: 'Periódico y revistas', caneca: 'blanca', nota: 'Mantenlos secos y sin grasa.', kw: ['periodico', 'revista', 'papel'] },
    { nombre: 'Cuadernos y papel de oficina', caneca: 'blanca', nota: 'Sin restos de comida ni grasa.', kw: ['cuaderno', 'hoja', 'papel', 'impresion'] },
    { nombre: 'Lata de gaseosa o atún', caneca: 'blanca', nota: 'Enjuágala; no hace falta quitar la etiqueta.', kw: ['lata', 'aluminio', 'atun', 'metal'] },
    { nombre: 'Frasco de vidrio', caneca: 'blanca', nota: 'Si está roto, envuélvelo en papel y márcalo.', kw: ['vidrio', 'frasco', 'botella'] },
    { nombre: 'Caja de leche o jugo (Tetra Pak)', caneca: 'blanca', nota: 'Aplástala, enjuágala y sécala.', kw: ['tetrapak', 'tetra', 'leche', 'jugo'] },
    { nombre: 'Cáscaras de fruta y verdura', caneca: 'verde', nota: 'Sin bolsas plásticas ni empaques.', kw: ['cascara', 'cascaras', 'fruta', 'verdura', 'platano', 'naranja'] },
    { nombre: 'Restos de comida', caneca: 'verde', nota: 'Escúrrelos para evitar malos olores.', kw: ['comida', 'sobras', 'arroz', 'restos'] },
    { nombre: 'Borra de café y bolsas de té', caneca: 'verde', nota: 'Retira las grapas de las bolsas de té.', kw: ['cafe', 'te', 'borra', 'infusion'] },
    { nombre: 'Cáscaras de huevo', caneca: 'verde', nota: 'Pueden ir trituradas o enteras.', kw: ['huevo', 'cascara'] },
    { nombre: 'Hojas y restos de poda', caneca: 'verde', nota: 'Sin plástico ni piedras.', kw: ['hojas', 'poda', 'jardin', 'pasto', 'ramas'] },
    { nombre: 'Papel higiénico usado', caneca: 'negra', nota: 'Envuélvelo bien antes de botarlo.', kw: ['higienico', 'bano', 'papel'] },
    { nombre: 'Servilletas y pañuelos usados', caneca: 'negra', nota: 'El papel con grasa o comida no se recicla.', kw: ['servilleta', 'panuelo', 'grasa'] },
    { nombre: 'Pañales y toallas higiénicas', caneca: 'negra', nota: 'Ciérralos en una bolsa aparte.', kw: ['panal', 'panales', 'toalla', 'higienica'] },
    { nombre: 'Colillas de cigarrillo', caneca: 'negra', nota: 'Apágalas por completo antes de botarlas.', kw: ['colilla', 'cigarrillo'] },
    { nombre: 'Empaque metalizado de papas o dulces', caneca: 'negra', nota: 'Los empaques metalizados no se reciclan.', kw: ['empaque', 'papas', 'dulce', 'snack', 'galleta'] },
    { nombre: 'Barrido y polvo', caneca: 'negra', nota: 'Embólsalo antes de sacarlo.', kw: ['barrido', 'polvo'] },
    { nombre: 'Cerámica y espejos rotos', caneca: 'negra', nota: 'Envuélvelos en papel para proteger a quien recoge.', kw: ['ceramica', 'espejo', 'plato'] },
    { nombre: 'Pilas y baterías', caneca: 'especial', nota: 'Llévalas a un punto de recolección posconsumo.', kw: ['pila', 'pilas', 'bateria'] },
    { nombre: 'Bombillos y tubos fluorescentes', caneca: 'especial', nota: 'Contienen sustancias peligrosas; no los rompas.', kw: ['bombillo', 'bombilla', 'fluorescente', 'led'] },
    { nombre: 'Equipos electrónicos (RAEE)', caneca: 'especial', nota: 'Entrégalos en campañas o puntos de acopio de electrónicos.', kw: ['celular', 'computador', 'cargador', 'cable', 'electronico', 'raee', 'teclado'] },
    { nombre: 'Medicamentos vencidos', caneca: 'especial', nota: 'Llévalos a un punto azul o a una farmacia con recolección.', kw: ['medicamento', 'pastilla', 'jarabe', 'vencido', 'droga'] },
    { nombre: 'Aceite de cocina usado', caneca: 'especial', nota: 'Guárdalo en una botella cerrada; no lo botes al desagüe.', kw: ['aceite', 'fritura'] }
  ];

  const INSIGNIAS = {
    primer_acierto:   { nombre: 'Primer acierto',      desc: 'Responde bien tu primera pregunta.' },
    vecino_reciclador:{ nombre: 'Vecino Reciclador',   desc: 'Suma 50 puntos.' },
    experto_organicos:{ nombre: 'Experto en Orgánicos',desc: 'Acierta 5 veces con residuos orgánicos.' },
    racha_3:          { nombre: 'Racha de 3 días',     desc: 'Juega 3 días seguidos.' }
  };

  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const TIPOS_RECOLECCION = { ninguna: 'Sin recolección', blanca: 'Aprovechables', negra: 'No aprovechables', verde: 'Orgánicos' };

  const PUNTOS_ACIERTO = 10;

  function normalizar(s) {
    return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  // RF-01: buscar un residuo y decir en qué caneca va
  function buscar(consulta, items) {
    items = items || ITEMS;
    const q = normalizar(consulta);
    if (q.length < 2) return [];
    const res = items.filter(it =>
      normalizar(it.nombre).includes(q) || it.kw.some(k => normalizar(k).includes(q)));
    return res.sort((a, b) =>
      Number(normalizar(b.nombre).startsWith(q)) - Number(normalizar(a.nombre).startsWith(q)));
  }

  // generador pseudoaleatorio reproducible (para poder probar el quiz)
  function crearRng(semilla) {
    let a = semilla >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // RF-03: armar un quiz con n preguntas distintas
  function armarQuiz(n, rng, items) {
    items = (items || ITEMS).slice();
    rng = rng || Math.random;
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items.slice(0, Math.min(n, items.length)).map(it => ({ item: it, correcta: it.caneca }));
  }

  function estadoInicial() {
    return { puntos: 0, aciertos: 0, intentos: 0, aciertosVerde: 0, racha: 0, ultimoDia: null, insignias: [],
             calendario: { 0: 'ninguna', 1: 'ninguna', 2: 'ninguna', 3: 'ninguna', 4: 'ninguna', 5: 'ninguna', 6: 'ninguna' } };
  }

  function aFecha(str) { const [y, m, d] = str.split('-').map(Number); return Date.UTC(y, m - 1, d); }
  function hoyTexto(d) {
    d = d || new Date();
    const p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  // RF-05: racha de días seguidos
  function actualizarRacha(estado, hoy) {
    if (estado.ultimoDia === hoy) return estado;
    const ayer = estado.ultimoDia && (aFecha(hoy) - aFecha(estado.ultimoDia)) === 86400000;
    return Object.assign({}, estado, { racha: ayer ? estado.racha + 1 : 1, ultimoDia: hoy });
  }

  function evaluarInsignias(e) {
    const ganadas = [];
    if (e.aciertos >= 1) ganadas.push('primer_acierto');
    if (e.puntos >= 50) ganadas.push('vecino_reciclador');
    if (e.aciertosVerde >= 5) ganadas.push('experto_organicos');
    if (e.racha >= 3) ganadas.push('racha_3');
    return ganadas;
  }

  // RF-04: registrar una respuesta (suma puntos, racha e insignias)
  function responder(estado, pregunta, eleccion, hoy) {
    let e = actualizarRacha(estado, hoy);
    const acierto = eleccion === pregunta.correcta;
    e = Object.assign({}, e, {
      intentos: e.intentos + 1,
      aciertos: e.aciertos + (acierto ? 1 : 0),
      puntos: e.puntos + (acierto ? PUNTOS_ACIERTO : 0),
      aciertosVerde: e.aciertosVerde + (acierto && pregunta.correcta === 'verde' ? 1 : 0)
    });
    const todas = evaluarInsignias(e);
    const nuevas = todas.filter(k => !e.insignias.includes(k));
    e.insignias = e.insignias.concat(nuevas);
    return { estado: e, acierto, nuevas };
  }

  // RF-02: próxima recolección según los días que marcó el usuario
  function proximaRecoleccion(calendario, desde) {
    for (let off = 0; off <= 7; off++) {
      const d = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + off);
      const tipo = calendario[d.getDay()];
      if (tipo && tipo !== 'ninguna') return { enDias: off, dia: DIAS[d.getDay()], tipo };
    }
    return null;
  }

  // Persistencia (RNF: funcionar sin conexión). Recibe un "storage" para poder simular en pruebas.
  function crearAlmacen(storage, clave) {
    clave = clave || 'separabien:estado';
    return {
      cargar() {
        try {
          const raw = storage.getItem(clave);
          return raw ? Object.assign(estadoInicial(), JSON.parse(raw)) : estadoInicial();
        } catch (err) { return estadoInicial(); }
      },
      guardar(estado) {
        try { storage.setItem(clave, JSON.stringify(estado)); return true; } catch (err) { return false; }
      }
    };
  }

  return { BINS, ITEMS, INSIGNIAS, DIAS, TIPOS_RECOLECCION, PUNTOS_ACIERTO, normalizar, buscar, crearRng, armarQuiz,
           estadoInicial, hoyTexto, actualizarRacha, evaluarInsignias, responder, proximaRecoleccion, crearAlmacen };
});
