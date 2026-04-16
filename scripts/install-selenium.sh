#!/bin/bash
# Script de instalación de Selenium
# Ejecutar con: bash install-selenium.sh

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         Instalador de Selenium para Web Scraping         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Chrome
echo "🔍 Verificando Chrome..."
if [ -f "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
    echo -e "${GREEN}✅ Chrome encontrado en Windows${NC}"
else
    echo -e "${YELLOW}⚠️  Chrome no encontrado${NC}"
    echo "   Descarga desde: https://www.google.com/chrome"
    exit 1
fi

# Método 1: Intentar con apt (requiere sudo)
echo ""
echo "📦 Instalando pip3..."
echo -e "${YELLOW}(Esto puede pedir tu contraseña de sudo)${NC}"

if sudo apt update && sudo apt install -y python3-pip; then
    echo -e "${GREEN}✅ pip3 instalado con apt${NC}"
else
    echo -e "${RED}❌ apt falló o no tienes permisos sudo${NC}"
    echo ""
    echo "📥 Intentando instalación sin sudo..."

    # Método 2: Descarga directa de pip
    curl -s https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
    python3 /tmp/get-pip.py --user

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ pip instalado sin sudo${NC}"

        # Agregar pip al PATH
        export PATH="$HOME/.local/bin:$PATH"
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

        echo -e "${YELLOW}⚠️  Ejecuta: source ~/.bashrc${NC}"
    else
        echo -e "${RED}❌ Instalación de pip falló${NC}"
        echo "   Consulta: SELENIUM-SETUP.md"
        exit 1
    fi
fi

# Verificar pip
echo ""
echo "🧪 Verificando pip..."
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version)
    echo -e "${GREEN}✅ $PIP_VERSION${NC}"
else
    echo -e "${RED}❌ pip3 no encontrado en PATH${NC}"
    echo "   Prueba: source ~/.bashrc"
    echo "   O: export PATH=\"\$HOME/.local/bin:\$PATH\""
    exit 1
fi

# Instalar Selenium
echo ""
echo "🚀 Instalando Selenium..."
pip3 install selenium

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Selenium instalado correctamente${NC}"
else
    echo -e "${RED}❌ Error instalando Selenium${NC}"
    exit 1
fi

# Verificar instalación
echo ""
echo "🧪 Verificando instalación de Selenium..."
if python3 -c "import selenium; print('Selenium version:', selenium.__version__)" 2>/dev/null; then
    echo -e "${GREEN}✅ Selenium funciona correctamente${NC}"
else
    echo -e "${RED}❌ Selenium no se importa correctamente${NC}"
    exit 1
fi

# Success
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  ✅ ¡INSTALACIÓN EXITOSA! ✅               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. cd scripts"
echo "   2. python3 image-scraper-selenium-google.py"
echo ""
echo "📚 Documentación:"
echo "   - SELENIUM-SETUP.md (guía completa)"
echo "   - FINAL-SCRAPING-GUIDE.md (todas las opciones)"
echo ""
