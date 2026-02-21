# Soporte Estelar Bot

Bot oficial de soporte para el servidor **ESTELAR OFICIAL** en Discord.
Gestiona tickets, comandos slash y un panel de soporte interactivo.

---

## Caracteristicas

- Panel de soporte con botones interactivos
- Sistema de tickets privados con formulario modal
- Comandos slash: `/panel`, `/cerrar`, `/anadir`, `/remover`, `/renombrar`
- Deteccion automatica de roles Staff/Mod/Admin
- Botones: Cerrar ticket, Reclamar, Transcript
- Embeds con colores e informacion del usuario
- Actividad personalizada del bot

---

## Instalacion

### Requisitos
- Node.js v18 o superior
- npm
- Una cuenta de Discord con acceso al Developer Portal

### Pasos

1. Clona el repositorio:
```bash
git clone https://github.com/estelarlatam/soporte-estelar-bot.git
cd soporte-estelar-bot
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env` con tus credenciales:
```env
TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
```

4. Registra los slash commands:
```bash
node deploy-commands.js
```

5. Inicia el bot:
```bash
node index.js
```

---

## Comandos

| Comando | Descripcion | Permiso |
|---|---|---|
| `/panel` | Envia el panel de soporte al canal | Gestionar servidor |
| `/cerrar` | Cierra el ticket actual | Cualquiera en el ticket |
| `/anadir @usuario` | Anade un usuario al ticket | Staff |
| `/remover @usuario` | Remueve un usuario del ticket | Staff |
| `/renombrar nombre` | Renombra el canal del ticket | Staff |

---

## Configuracion del servidor

El bot detecta automaticamente:
- **Categorias de tickets**: busca una categoria cuyo nombre contenga `ticket`
- **Roles de staff**: busca roles con nombres que incluyan `staff`, `mod`, `admin`, `soporte` o `moderador`

---

## Estructura de archivos

```
soporte-estelar-bot/
|-- index.js            # Archivo principal del bot
|-- deploy-commands.js  # Registro de slash commands
|-- package.json        # Dependencias del proyecto
|-- .env                # Variables de entorno (no subir a git)
|-- .gitignore
```

---

## Hosting recomendado

- **Railway** (gratis para empezar)
- **Render**
- **VPS propio** con PM2: `pm2 start index.js --name soporte-estelar`

---

## Servidor

Este bot fue creado para **ESTELAR OFICIAL**
Unete al servidor: https://discord.gg/gKyAEUZ58P

---

## Tecnologias

- [discord.js v14](https://discord.js.org)
- [Node.js](https://nodejs.org)
- [dotenv](https://www.npmjs.com/package/dotenv)
