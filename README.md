# MetaTrader Backend API

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

API REST robusta para gestión de usuarios y servicios de CopyTrade en MetaTrader. Esta aplicación permite a los usuarios registrarse, gestionar sus suscripciones y realizar operaciones de trading automatizado.

## 🚀 Características

- **Autenticación segura**: Sistema de registro y login con JWT y bcrypt
- **Gestión de sesiones**: Sesiones persistentes almacenadas en MongoDB
- **CopyTrade**: Integración con MetaTrader para operaciones automatizadas
- **Sistema de suscripciones**: Control de acceso basado en suscripciones activas
- **Pasarela de pagos**: Integración con ePayco para procesamiento de pagos
- **Activación automática**: Los usuarios se activan por 30 días tras el pago
- **Seguridad avanzada**: Implementación de Helmet, CORS y headers de seguridad
- **Gestión de archivos**: Subida y manejo de archivos con express-fileupload
- **Envío de emails**: Notificaciones automáticas con Nodemailer

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v14.0.0 o superior)
- [MongoDB](https://www.mongodb.com/) (v4.0 o superior)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/victalejo/metaTraderBack.git
cd metaTraderBack
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Base de datos
MONGOURI=mongodb://localhost:27017/metatrader

# JWT y Sesiones
JWT_SECRET=tu_secreto_jwt_super_seguro
SECRETSESSION=tu_secreto_sesion_super_seguro

# ePayco
EPAYCO_PUBLIC_KEY=tu_clave_publica_epayco
EPAYCO_PRIVATE_KEY=tu_clave_privada_epayco

# Nodemailer
EMAIL_HOST=smtp.tu-servidor.com
EMAIL_PORT=587
EMAIL_USER=tu_email@dominio.com
EMAIL_PASSWORD=tu_password_email

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

4. **Iniciar el servidor**

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará corriendo en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
metaTraderBack/
├── public/
│   └── assets/
│       └── images/          # Imágenes estáticas
├── src/
│   ├── auth/               # Lógica de autenticación
│   ├── config/             # Configuración de la aplicación
│   │   ├── database.js     # Conexión a MongoDB
│   │   └── files/          # Configuración de archivos
│   ├── controllers/        # Controladores de las rutas
│   │   ├── activarUserController.js
│   │   ├── adminLoginController.js
│   │   ├── apiMT.js        # API de MetaTrader
│   │   ├── methodsUserController.js
│   │   ├── pagesController.js
│   │   ├── sendEmails.js
│   │   └── userController.js
│   ├── jwt/                # Manejo de JSON Web Tokens
│   ├── lib/                # Librerías externas
│   │   └── epayco.js       # Integración con ePayco
│   ├── models/             # Modelos de MongoDB
│   │   ├── countries.js
│   │   ├── Session.js
│   │   └── User.js
│   ├── routes/             # Definición de rutas
│   │   ├── activeUser.routes.js
│   │   ├── epayco.routes.js
│   │   ├── index.routes.js
│   │   ├── metaApi.routes.js
│   │   ├── methodsUser.routes.js
│   │   └── user.routes.js
│   └── index.js            # Punto de entrada
├── .env                    # Variables de entorno (no incluido en git)
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Autenticación

```
POST   /api/users/register       - Registrar nuevo usuario
POST   /api/users/login          - Iniciar sesión
POST   /api/users/logout         - Cerrar sesión
GET    /api/users/verify         - Verificar token JWT
```

### Usuarios

```
GET    /api/users/profile        - Obtener perfil del usuario
PUT    /api/users/profile        - Actualizar perfil
DELETE /api/users/:id            - Eliminar usuario
```

### MetaTrader

```
POST   /api/metatrader/connect   - Conectar cuenta MetaTrader
GET    /api/metatrader/status    - Estado de la conexión
POST   /api/metatrader/trade     - Ejecutar operación
```

### Suscripciones y Pagos

```
POST   /api/epayco/payment       - Procesar pago
GET    /api/epayco/confirmation  - Confirmar pago
GET    /api/users/subscription   - Estado de suscripción
```

## 🛡️ Seguridad

Este proyecto implementa múltiples capas de seguridad:

- **Helmet.js**: Headers de seguridad HTTP
- **CORS**: Control de origen cruzado configurado
- **bcrypt**: Hashing de contraseñas
- **JWT**: Tokens de autenticación
- **Express-session**: Sesiones seguras con MongoDB
- **XSS Protection**: Protección contra ataques XSS
- **Content Security Policy**: CSP configurado

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén disponibles)
npm test
```

## 📦 Dependencias Principales

- **Express**: Framework web
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación con tokens
- **bcrypt**: Encriptación de contraseñas
- **Helmet**: Seguridad HTTP
- **Nodemailer**: Envío de correos
- **ePayco**: Pasarela de pagos
- **CORS**: Control de acceso

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles sobre nuestro código de conducta y el proceso para enviarnos pull requests.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

**victalejo** - [GitHub](https://github.com/victalejo)

## 🙏 Agradecimientos

- A la comunidad de Node.js
- A los contribuidores de las librerías utilizadas
- A todos los que han apoyado este proyecto

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un [issue](https://github.com/victalejo/metaTraderBack/issues).

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub