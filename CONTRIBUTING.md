# Guía de Contribución

¡Gracias por tu interés en contribuir a MetaTrader Backend API! 🎉

Esta guía te ayudará a entender cómo puedes participar en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Puedo Contribuir](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guía de Estilo](#guía-de-estilo)
- [Estructura de Commits](#estructura-de-commits)
- [Pull Requests](#pull-requests)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta que todos los contribuidores deben seguir. Al participar, se espera que mantengas un ambiente respetuoso y profesional.

### Nuestros Estándares

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

## 🤝 Cómo Puedo Contribuir

### Reportar Bugs

Los bugs se rastrean como [issues de GitHub](https://github.com/victalejo/metaTraderBack/issues). Si encuentras un bug:

1. **Verifica** que el bug no haya sido reportado previamente
2. **Crea un issue** incluyendo:
   - Un título claro y descriptivo
   - Pasos detallados para reproducir el problema
   - Comportamiento esperado vs. comportamiento actual
   - Screenshots si es aplicable
   - Información del entorno (Node.js version, OS, etc.)
   - Logs o mensajes de error relevantes

**Ejemplo de reporte de bug:**

```markdown
**Descripción:**
El endpoint de login devuelve un 500 cuando la contraseña contiene caracteres especiales.

**Pasos para reproducir:**
1. Crear usuario con contraseña que incluya "@" 
2. Intentar hacer login
3. Observar error 500

**Comportamiento esperado:**
Login exitoso con cualquier contraseña válida.

**Entorno:**
- Node.js: v16.14.0
- MongoDB: 5.0.6
- OS: Windows 11
```

### Sugerir Mejoras

Las sugerencias de mejora también son bienvenidas como issues:

1. **Usa un título claro** que identifique la sugerencia
2. **Proporciona una descripción detallada** de la mejora propuesta
3. **Explica por qué** esta mejora sería útil
4. **Lista ejemplos** de cómo funcionaría

### Contribuir con Código

¿Quieres escribir código? ¡Excelente! Aquí está el proceso:

## 🔄 Proceso de Desarrollo

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/TU_USUARIO/metaTraderBack.git
cd metaTraderBack
```

### 2. Configurar el Entorno

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración de ejemplo
cp .env.example .env

# Configurar variables de entorno
# Edita .env con tus valores
```

### 3. Crear una Rama

```bash
# Crear una rama descriptiva
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/descripcion-del-bug
```

Convención de nombres de ramas:
- `feature/`: Para nuevas características
- `fix/`: Para corrección de bugs
- `docs/`: Para cambios en documentación
- `refactor/`: Para refactorización de código
- `test/`: Para añadir o modificar tests

### 4. Hacer Cambios

- Escribe código limpio y mantenible
- Sigue las [guías de estilo](#guía-de-estilo)
- Añade comentarios cuando sea necesario
- Actualiza la documentación si es relevante

### 5. Probar tus Cambios

```bash
# Ejecutar el servidor en modo desarrollo
npm run dev

# Probar manualmente los endpoints afectados
# Asegurarte de que todo funciona correctamente
```

### 6. Commit

```bash
# Añadir archivos modificados
git add .

# Hacer commit con mensaje descriptivo
git commit -m "tipo: descripción breve del cambio"
```

## 📝 Estructura de Commits

Usamos commits semánticos para mantener un historial claro:

```
tipo(ámbito): descripción breve

[cuerpo opcional]

[pie opcional]
```

**Tipos permitidos:**
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltante, etc; sin cambios de código
- `refactor`: Refactorización de código
- `test`: Añadir tests
- `chore`: Mantenimiento, actualización de dependencias

**Ejemplos:**

```bash
feat(auth): añadir autenticación con Google OAuth

fix(payment): corregir validación de tarjetas vencidas

docs(readme): actualizar instrucciones de instalación

refactor(users): simplificar lógica de validación de email
```

## 🎨 Guía de Estilo

### JavaScript

- **Indentación**: 4 espacios (o según la configuración actual del proyecto)
- **Punto y coma**: Usar al final de cada sentencia
- **Comillas**: Usar comillas simples `'` preferentemente
- **Nombres**: 
  - Variables y funciones: `camelCase`
  - Clases: `PascalCase`
  - Constantes: `UPPER_SNAKE_CASE`

### Estructura de Archivos

```javascript
// 1. Imports
const express = require('express');
const mongoose = require('mongoose');

// 2. Constantes
const PORT = process.env.PORT || 3000;

// 3. Funciones/Clases
const miControlador = async (req, res) => {
    // código
};

// 4. Exports
module.exports = miControlador;
```

### Comentarios

```javascript
// ✅ Buenos comentarios - explican el "por qué"
// Usamos bcrypt con 10 rounds para balancear seguridad y performance
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ Malos comentarios - explican el "qué" (obvio del código)
// Hashear la contraseña
const hashedPassword = await bcrypt.hash(password, 10);
```

### Manejo de Errores

```javascript
// ✅ Siempre manejar errores apropiadamente
try {
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ 
            error: 'Usuario no encontrado' 
        });
    }
    res.json(user);
} catch (error) {
    console.error('Error al buscar usuario:', error);
    res.status(500).json({ 
        error: 'Error interno del servidor' 
    });
}
```

### Async/Await

```javascript
// ✅ Preferir async/await sobre callbacks o promises
const getUserData = async (userId) => {
    try {
        const user = await User.findById(userId);
        const subscriptions = await Subscription.find({ userId });
        return { user, subscriptions };
    } catch (error) {
        throw new Error(`Error obteniendo datos: ${error.message}`);
    }
};

// ❌ Evitar callback hell
getUserById(userId, (err, user) => {
    if (err) return handleError(err);
    getSubscriptions(userId, (err, subs) => {
        if (err) return handleError(err);
        // ...
    });
});
```

## 🔍 Pull Requests

### Antes de Enviar

- [ ] El código sigue las guías de estilo del proyecto
- [ ] Has probado tus cambios localmente
- [ ] Has actualizado la documentación relevante
- [ ] Tus commits siguen la convención establecida
- [ ] No hay conflictos con la rama principal

### Proceso de PR

1. **Push tu rama**

```bash
git push origin feature/tu-feature
```

2. **Crear el PR en GitHub**
   - Ve a tu fork en GitHub
   - Haz clic en "New Pull Request"
   - Selecciona tu rama

3. **Completar la plantilla del PR**

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Descripción de las pruebas realizadas

## Checklist
- [ ] Mi código sigue las guías de estilo
- [ ] He revisado mi propio código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
```

4. **Esperar revisión**
   - Los maintainers revisarán tu PR
   - Pueden solicitar cambios
   - Responde a los comentarios y haz los ajustes necesarios

### Después de la Aprobación

Una vez aprobado, tu PR será fusionado a la rama principal. ¡Gracias por tu contribución! 🎉

## 🆘 Necesitas Ayuda?

- 📖 Lee la [documentación](README.md)
- 💬 Abre un [issue de pregunta](https://github.com/victalejo/metaTraderBack/issues/new)
- 📧 Contacta a los maintainers

## 🏆 Reconocimientos

Todos los contribuidores serán reconocidos en el proyecto. Tu nombre aparecerá en la lista de colaboradores de GitHub automáticamente.

---

¡Gracias por contribuir a MetaTrader Backend API! 💙
