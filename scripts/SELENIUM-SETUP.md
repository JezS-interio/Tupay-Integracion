# 🚀 Configuración de Selenium - Paso a Paso

## ✅ Estado Actual

- **Chrome**: ✅ YA INSTALADO en Windows (`/mnt/c/Program Files/Google/Chrome/Application/chrome.exe`)
- **pip3**: ❌ Necesita instalarse
- **Selenium**: ❌ Necesita instalarse

---

## 📋 Instalación Rápida (5 minutos)

### Paso 1: Instalar pip (Python Package Manager)

```bash
# Opción A: Con apt (requiere sudo password)
sudo apt update
sudo apt install python3-pip

# Opción B: Sin sudo (descarga directa)
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py --user
```

### Paso 2: Verificar instalación

```bash
pip3 --version
# Debería mostrar: pip 20.x.x from ...
```

### Paso 3: Instalar Selenium

```bash
pip3 install selenium
```

### Paso 4: Verificar Selenium

```bash
python3 -c "import selenium; print('Selenium version:', selenium.__version__)"
# Debería mostrar: Selenium version: 4.x.x
```

---

## 🎯 Instalación Manual (Si Opción A y B no funcionan)

### Método Alternativo: Instalar en Windows

Si WSL da problemas, puedes instalar en Windows y ejecutar desde allí:

1. **Abrir PowerShell en Windows**
2. **Instalar Selenium:**
   ```powershell
   pip install selenium
   ```
3. **Ejecutar scraper desde Windows:**
   ```powershell
   cd C:\Users\Napo\Desktop\front\intitech-main\scripts
   python image-scraper-selenium-windows.py
   ```

---

## 🧪 Test Rápido (Después de Instalar)

```bash
cd /mnt/c/Users/Napo/Desktop/front/intitech-main/scripts

# Test básico
python3 -c "
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

print('Iniciando Chrome...')
driver = webdriver.Chrome(options=options)
driver.get('https://www.google.com')
print('✅ Chrome funcionando!')
print('Title:', driver.title)
driver.quit()
print('✅ Test completado!')
"
```

Si esto funciona, ¡estás listo para scraping real!

---

## 🐛 Solución de Problemas

### Error: "chromedriver not found"

**Solución:**
```bash
# Selenium 4.6+ incluye ChromeDriver Manager automático
# Solo asegúrate de tener Selenium >= 4.6
pip3 install --upgrade selenium
```

### Error: "Chrome binary not found"

**Solución - Especificar ruta de Chrome manualmente:**
```python
from selenium.webdriver.chrome.service import Service

chrome_path = "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
service = Service(executable_path=chrome_path)
driver = webdriver.Chrome(service=service, options=options)
```

### Error: "Permission denied"

**Solución:**
```bash
# Dar permisos de ejecución
chmod +x /mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe
```

### Error: "Display not found" (en headless mode)

**Esto es NORMAL en WSL sin interfaz gráfica.**

Usa `--headless` en las opciones:
```python
options.add_argument('--headless')
```

---

## 📁 Scripts Disponibles

Después de instalar Selenium, tienes estos scrapers listos:

1. **image-scraper-selenium-google.py** - Google Images scraper (RECOMENDADO)
2. **image-scraper-selenium.py** - Versión básica
3. **test-selenium.py** - Script de prueba

---

## ⚡ Inicio Rápido (Después de Instalar)

```bash
cd scripts

# Limpiar carpeta anterior
rm -rf downloaded_images

# Ejecutar scraper
python3 image-scraper-selenium-google.py

# Esperar... el navegador trabajará en segundo plano

# Ver resultados
ls -lh downloaded_images/
```

---

## 🎬 Próximos Pasos

1. **Instalar pip** (Opción A o B arriba)
2. **Instalar Selenium** (`pip3 install selenium`)
3. **Ejecutar test** (código de prueba arriba)
4. **Ejecutar scraper** (`python3 image-scraper-selenium-google.py`)

---

## 💡 Notas Importantes

- **Headless mode**: El navegador corre invisible (sin ventana)
- **Velocidad**: Más lento que HTTP scraping (pero funciona!)
- **Consumo**: Usa más RAM (Chrome completo)
- **Éxito**: ✅ Bypasses ALL anti-bot protections

---

## ❓ ¿Necesitas Ayuda?

Si algún paso falla, copia el mensaje de error y te ayudo a resolverlo.

**Comienza con Paso 1 arriba** ⬆️
