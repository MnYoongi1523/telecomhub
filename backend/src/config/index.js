// Configuración centralizada del servicio web TelecomHub API.
// Todas las variables de entorno tienen un valor por defecto para que el
// proyecto pueda ejecutarse sin configurar nada (entorno formativo).

const config = {
  // Puerto del servidor.
  puerto: process.env.PORT || 3001,

  // Secreto y duración del token de autenticación.
  jwtSecreto: process.env.JWT_SECRET || 'telecomhub-secreto-formativo',
  jwtExpiraEn: process.env.JWT_EXPIRES_IN || '2h',

  // Rondas de sal de bcrypt para cifrar contraseñas.
  bcryptRondas: Number(process.env.BCRYPT_ROUNDS || 10),
};

module.exports = config;
