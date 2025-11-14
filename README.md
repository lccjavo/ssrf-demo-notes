# 📌 SSRF Demo Notes -- Express / Node.js

`ssrf-demo-notes` es una aplicación construida en **Node.js + Express +
SQLite** diseñada para demostrar vulnerabilidades **SSRF** y **XSS** en
entornos controlados.\
Incluye generación de PDF con Puppeteer, sanitización de HTML y rutas
vulnerables para fines educativos.

> ⚠️ **Propósito educativo únicamente.**\
> No debe utilizarse en producción ni para atacar sistemas reales.

------------------------------------------------------------------------

## 🚀 Características principales

-   CRUD básico de notas usando **SQLite**

-   Renderizado de contenido HTML enviado por el usuario

-   Ejemplo real de **SSRF**:

    -   El servidor hace peticiones HTTP a URLs definidas por el usuario
    -   Permite reproducir accesos a
        `http://169.254.169.254/latest/meta-data`

-   Ejemplos de **XSS** si se deshabilita el sanitizer

-   Generación de **PDF** usando Puppeteer/Chromium mediante:

        /notes/:id/pdf

-   Código simple, ideal para:

    -   Demostraciones de SSRF
    -   Explicar cómo evitarlo
    -   Uso correcto de IMDSv2
    -   Validación de input del lado del servidor

------------------------------------------------------------------------

## 📥 Instalación

### 1. Clona el repositorio

``` bash
git clone git@github.com:lccjavo/ssrf-demo-notes.git
cd ssrf-demo-notes
```

### 2. Instala dependencias

``` bash
npm install
```

Si tienes errores de permisos en Linux:

``` bash
sudo chown -R $USER:$USER ~/.npm
npm install
```

### 3. Inicia la aplicación

``` bash
npm start
```

Accede en:\
http://localhost:3000

------------------------------------------------------------------------

## ⚙️ Variables de entorno (opcional)

Crea un archivo `.env` si necesitas configuración adicional:

    PORT=3000
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

------------------------------------------------------------------------

## 📚 Endpoints principales

### ➤ `GET /notes`

Lista todas las notas.

### ➤ `GET /notes/:id`

Ver una nota específica.

### ➤ `POST /notes`

Crear nueva nota (puede incluir HTML).

### ➤ `POST /notes/:id/update`

Actualizar nota.

### ➤ `GET /notes/:id/pdf`

Genera un PDF de la nota usando Puppeteer.

------------------------------------------------------------------------

## 🧪 Demostración de SSRF

La app permite enviar una URL arbitraria que el servidor intentará
solicitar:

``` json
{
  "url": "http://169.254.169.254/latest/meta-data/"
}
```

Esto permite demostrar:

-   Cómo acceder al **IMDS** cuando no está protegido
-   Cómo un SSRF puede obtener credenciales IAM temporales
-   Cómo mitigar usando:
    -   IMDSv2
    -   Reglas de firewall
    -   Validación estricta de URLs (allowlist)

------------------------------------------------------------------------

## 🧪 Demostración de XSS

Ejemplo de payload:

``` html
<img src="x" onerror="alert('XSS de prueba')">
```

Si el `sanitize.js` está desactivado → el navegador lo ejecuta.

------------------------------------------------------------------------

## 🛡️ Seguridad y mitigaciones incluidas

-   Sanitización de HTML usando una allowlist
-   Bloqueo explícito de URLs internas (opcional)
-   Recomendaciones de uso de **IMDSv2**
-   Validación de URLs antes de realizar requests externas
-   Ejemplos de patrones de protección contra SSRF

------------------------------------------------------------------------

## 📦 Despliegue rápido en EC2

### Instalar Node.js:

``` bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Inicializa la app:

``` bash
npm install
npm start
```

Para correr en background con PM2:

``` bash
pm2 start server.js
```

------------------------------------------------------------------------

## 🤝 Contribuciones

Pull requests y mejoras son bienvenidas.\
Puedes abrir un issue si deseas sugerir nuevas vulnerabilidades,
mitigaciones, ejemplos o mejoras en el demo.

------------------------------------------------------------------------

## 📜 Licencia

MIT License.
