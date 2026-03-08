# launch_saludcompartida

Repositorio de despliegue para [www.saludcompartida.app](https://www.saludcompartida.app).

---

## ¿Por qué hay dos nombres distintos?

Es una pregunta muy natural. Aquí está la explicación:

| Lugar | Nombre que ves | ¿Qué es? |
|---|---|---|
| **GitHub / Vercel** | `launch_saludcompartida` | Este repositorio — el que Vercel vigila para publicar cambios automáticamente. |
| **VS Code (tu computadora)** | `MVP-SaludCompartida` | La carpeta local donde escribes el código de la aplicación Next.js. |

Son **el mismo proyecto**, pero con nombres distintos en distintos lugares:

```
Tu computadora (VS Code)          GitHub                  Vercel (producción)
┌────────────────────────┐        ┌──────────────────────┐   ┌───────────────────────┐
│  Carpeta local:        │  push  │  Repositorio:        │   │  Proyecto:            │
│  MVP-SaludCompartida/  │ ──────▶│  launch_             │──▶│  launch_              │
│  mvp-saludcompartida/  │        │  saludcompartida     │   │  saludcompartida      │
└────────────────────────┘        └──────────────────────┘   └───────────────────────┘
                                                                       │
                                                              www.saludcompartida.app
```

### ¿Por qué la carpeta local se llama "MVP"?

**MVP** (Minimum Viable Product / Producto Mínimo Viable) es el nombre de la fase de desarrollo. Cuando creaste el proyecto en tu computadora, lo nombraste `MVP-SaludCompartida` para indicar que estabas construyendo la primera versión funcional del producto.

### ¿Por qué el repositorio de GitHub se llama "launch"?

`launch_saludcompartida` hace referencia al **lanzamiento** del producto. Este repositorio es el que está conectado directamente a Vercel, y cada vez que haces `git push` a la rama `main`, Vercel vuelve a desplegar el sitio automáticamente en `www.saludcompartida.app`.

---

## Flujo de trabajo

```
1. Escribes código en VS Code
   → carpeta: MVP-SaludCompartida/mvp-saludcompartida

2. Haces commit y push a GitHub
   → repositorio: fabiolafrancoc-lab/launch_saludcompartida  (rama main)

3. Vercel detecta el push automáticamente
   → proyecto Vercel: launch_saludcompartida

4. Vercel despliega en segundos
   → sitio en vivo: www.saludcompartida.app
```

---

## Estructura del proyecto

```
launch_saludcompartida/        ← raíz de este repositorio
├── README.md                  ← esta guía
├── vercel.json                ← configuración de Vercel
├── index.html                 ← página de inicio (estática)
└── mvp-saludcompartida/       ← aplicación Next.js principal
    ├── app/
    │   ├── api/
    │   │   ├── validar-codigo/
    │   │   ├── verificar-codigo/
    │   │   └── webhooks/
    │   ├── bienvenida/
    │   ├── dashboard/
    │   └── ...
    ├── components/
    └── package.json
```

---

## Variables de entorno necesarias en Vercel

Para que la aplicación funcione en producción, configura estas variables en el panel de Vercel → **Settings → Environment Variables**:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |
| `SUPABASE_URL_MAIN` | URL principal de Supabase (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY_MAIN` | Service role key principal |
| `SUPABASE_URL_ALT` | URL alternativa de Supabase (fallback) |
| `SUPABASE_SERVICE_ROLE_KEY_ALT` | Service role key alternativa |

---

## Dominio en producción

| Dominio | Estado |
|---|---|
| `www.saludcompartida.app` | ✅ Activo |
| `launchsaludcompartida-*.vercel.app` | ✅ Activo (preview URL de Vercel) |
