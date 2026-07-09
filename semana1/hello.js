const fecha = new Date();

const formateador = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const fechaFormateada = formateador.format(fecha);

console.log(`Hoy es ${fechaFormateada}`);
