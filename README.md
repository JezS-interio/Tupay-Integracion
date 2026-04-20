# Free eCommerce Template for Next.js - NextMerce

The free Next.js eCommerce template is a lite version of the NextMerce Next.js eCommerce boilerplate, designed to streamline the launch and management of your online store.

![NextMerce](https://github.com/user-attachments/assets/57155689-a756-4222-8af7-134e556acae2)


While NextMerce Pro features advanced functionalities, seamless integration, and customizable options, providing all the essential tools needed to build and expand your business, the lite version offers a basic Next.js template specifically crafted for eCommerce websites. Both versions ensure superior performance and flexibility, all powered by Next.js.

### NextMerce Free VS NextMerce Pro

| ✨ Features                         | 🎁 NextMerce Free                 | 🔥 NextMerce Pro                        |
|----------------------------------|--------------------------------|--------------------------------------|
| Next.js Pages                    | Static                         | Dynamic Boilerplate Template         |
| Components                       | Limited                        | All According to Demo                |
| eCommerce Functionality          | Included                       | Included                             |
| Integrations (DB, Auth, etc.)    | Not Included                   | Included                             |
| Community Support                | Included                       | Included                             |
| Premium Email Support            | Not Included                   | Included                             |
| Lifetime Free Updates            | Included                       | Included                             |


#### [🚀 Live Demo](https://demo.nextmerce.com/)

#### [🌐 Visit Website](https://nextmerce.com/)

## Despliegue en Vercel (para pruebas Tupay)

Sigue estos pasos para desplegar el proyecto en Vercel y permitir que Tupay pruebe el flujo con variables de staging. No subas credenciales en repositorios públicos; usa las variables de entorno del dashboard de Vercel.

- **Crear el proyecto en Vercel:** Conecta el repositorio y selecciona la rama a desplegar.
- **Configurar variables de entorno en Vercel (Settings → Environment Variables):** Añade las siguientes variables (valores de ejemplo en `.env.example`):
	- `NEXT_PUBLIC_FIREBASE_API_KEY`
	- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
	- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
	- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
	- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
	- `NEXT_PUBLIC_FIREBASE_APP_ID`
	- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
	- `R2_ACCESS_KEY_ID` (server)
	- `R2_SECRET_ACCESS_KEY` (server)
	- `R2_ENDPOINT` (server)
	- `R2_BUCKET_NAME` (server)
	- `NEXT_PUBLIC_R2_PUBLIC_URL`
	- `MOBILEAPI_KEY`
	- `RESEND_API_KEY`
	- `TUPAY_API_KEY` (staging key for Tupay)
	- `TUPAY_API_PASSPHRASE` (staging)
	- `TUPAY_API_SIGNATURE` (staging)
	- `TUPAY_BASE_URL` = `https://api-stg.tupayonline.com`
	- `TUPAY_ENVIRONMENT` = `staging`
	- `NEXT_PUBLIC_APP_URL` = `https://<your-project>.vercel.app`

- **Rutas webhooks / callbacks:** TuPay enviará notificaciones a `https://<your-project>.vercel.app/api/tupay/webhook`. Asegúrate que `NEXT_PUBLIC_APP_URL` apunte correctamente al dominio de Vercel.
- **Probar el flujo:** Pide a Tupay las credenciales de staging (o usa las que ya están en `.env.local` para pruebas locales). Haz un deploy y realiza un pago de prueba desde la UI; la aplicación llamará a `/api/tupay/create-deposit`.
- **Seguridad:** Nunca pongas claves reales en el repositorio. Para pasar a producción, solicita las credenciales *live* a Tupay y actualiza las variables en Vercel (cambia `TUPAY_ENVIRONMENT=production`).

Si quieres, puedo automatizar una checklist para el despliegue (variables a crear en Vercel, dominios, y pruebas a ejecutar). ¿Quieres que la cree? 
