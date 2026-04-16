# 🚀 EMPEZAR AQUÍ - Selenium Setup

## ✅ Lo Que Ya Tienes

- **Chrome**: ✅ INSTALADO en Windows
- **Python**: ✅ Instalado
- **Scripts**: ✅ Listos para usar

## ❌ Lo Que Falta Instalar

- **pip3** (gestor de paquetes Python)
- **Selenium** (librería de automatización)

---

## 🎯 INSTALACIÓN (2 Opciones)

### OPCIÓN A: Script Automático (Recomendado) ⭐

```bash
cd /mnt/c/Users/Napo/Desktop/front/intitech-main/scripts
bash install-selenium.sh
```

El script hará TODO automáticamente. Si pide contraseña (sudo), introdúcela.

---

### OPCIÓN B: Manual (Si Opción A falla)

```bash
# 1. Instalar pip
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py --user

# 2. Agregar pip al PATH
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 3. Verificar pip
pip3 --version

# 4. Instalar Selenium
pip3 install selenium

# 5. Verificar Selenium
python3 -c "import selenium; print('✅ Selenium OK')"
```

---

## 🧪 TEST (Después de Instalar)

```bash
cd /mnt/c/Users/Napo/Desktop/front/intitech-main/scripts

python3 -c "
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')

driver = webdriver.Chrome(options=options)
driver.get('https://www.google.com')
print('✅ Chrome funcionando!')
print('Title:', driver.title)
driver.quit()
"
```

Si ves "✅ Chrome funcionando!", estás listo!

---

## 🎬 EJECUTAR SCRAPER

```bash
cd /mnt/c/Users/Napo/Desktop/front/intitech-main/scripts

# Limpiar carpeta anterior
rm -rf downloaded_images

# EJECUTAR
python3 image-scraper-selenium-google.py
```

### Lo Que Hará:

1. ✅ Abrirá Chrome (modo invisible)
2. ✅ Buscará en Google Images
3. ✅ Descargará de MILES de sitios web
4. ✅ Guardará en `downloaded_images/`

**Tiempo estimado:** 5-10 minutos para 15 productos

---

## 📊 Resultados Esperados

```
downloaded_images/
├── iphone-15-pro-max/
│   ├── iphone-15-pro-max-1-abc123.jpg (de apple.com)
│   ├── iphone-15-pro-max-2-def456.jpg (de gsmarena.com)
│   ├── iphone-15-pro-max-3-ghi789.jpg (de techcrunch.com)
│   └── ...
├── macbook-pro-m3/
│   └── ...
```

**Cada imagen de un sitio diferente!**

---

## 🐛 Problemas Comunes

### "pip3: command not found"

```bash
# Agregar al PATH
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc
```

### "No module named 'selenium'"

```bash
pip3 install selenium
```

### "Chrome not found"

Chrome YA está instalado. Si el error persiste:
```python
# Editar image-scraper-selenium-google.py
# Agregar antes de webdriver.Chrome():
chrome_options.binary_location = "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
```

---

## 📁 Archivos Importantes

- **install-selenium.sh** - Script de instalación automática
- **image-scraper-selenium-google.py** - Scraper principal
- **scraper-config.json** - Productos a scrapear (editable)
- **SELENIUM-SETUP.md** - Guía detallada
- **FINAL-SCRAPING-GUIDE.md** - Todas las opciones

---

## ⏭️ Próximos Pasos

1. **Ejecutar:** `bash install-selenium.sh`
2. **Test:** Código de prueba arriba
3. **Scrapear:** `python3 image-scraper-selenium-google.py`
4. **Revisar:** `ls downloaded_images/`

---

## 💡 Notas

- **Headless mode**: No verás ventanas (más rápido)
- **Visible mode**: Puedes ver Chrome trabajando (para debugging)
- **Velocidad**: ~1-2 minutos por producto
- **Fuentes**: Imágenes de miles de sitios diferentes

---

## ❓ ¿Necesitas Ayuda?

Si algo falla:
1. Copia el mensaje de error completo
2. Muéstramelo
3. Te ayudo a resolverlo

**¡Comienza con Opción A arriba!** ⬆️
