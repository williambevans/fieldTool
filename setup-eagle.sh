#!/data/data/com.termux/files/usr/bin/bash
################################################################################
#
#   🦅 EAGLE Setup Script - HH Holdings Energy Intel
#
#   Termux installation and configuration script
#   Author: Bevans Real Estate / HH Holdings
#   Location: Bosque County, Texas
#
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🦅  EAGLE INSTALLER - Energy Infrastructure Intelligence 🦅  ║
║                                                                ║
║          HH Holdings / Bevans Real Estate                      ║
║          Bosque County, Texas                                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Starting EAGLE installation...${NC}\n"

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${RED}❌ Error: This script must be run in Termux on Android${NC}"
    echo -e "${YELLOW}   Download Termux from F-Droid: https://f-droid.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Termux environment detected"

# Update package list
echo -e "\n${BLUE}📦 Updating Termux packages...${NC}"
pkg update -y || {
    echo -e "${YELLOW}⚠️  Warning: Package update had issues, continuing...${NC}"
}

# Upgrade existing packages
echo -e "\n${BLUE}⬆️  Upgrading existing packages...${NC}"
pkg upgrade -y || {
    echo -e "${YELLOW}⚠️  Warning: Package upgrade had issues, continuing...${NC}"
}

# Install Python
echo -e "\n${BLUE}🐍 Installing Python...${NC}"
if command -v python &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python already installed: $(python --version)"
else
    pkg install python -y
    echo -e "${GREEN}✓${NC} Python installed: $(python --version)"
fi

# Install termux-api package
echo -e "\n${BLUE}📡 Installing termux-api...${NC}"
if command -v termux-location &> /dev/null; then
    echo -e "${GREEN}✓${NC} termux-api already installed"
else
    pkg install termux-api -y
    echo -e "${GREEN}✓${NC} termux-api installed"
fi

# Check for Termux:API app
echo -e "\n${YELLOW}📱 IMPORTANT: You must install the 'Termux:API' app from F-Droid${NC}"
echo -e "${YELLOW}   for GPS functionality to work!${NC}"
echo -e "${YELLOW}   Download: https://f-droid.org/packages/com.termux.api/${NC}"

# Install git (if needed for future updates)
echo -e "\n${BLUE}🔧 Installing git...${NC}"
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} git already installed"
else
    pkg install git -y
    echo -e "${GREEN}✓${NC} git installed"
fi

# Setup storage access
echo -e "\n${BLUE}💾 Setting up storage access...${NC}"
if [ ! -d "$HOME/storage" ]; then
    echo -e "${YELLOW}📂 Requesting storage permissions...${NC}"
    echo -e "${YELLOW}   Please grant storage access when prompted!${NC}"
    termux-setup-storage
    sleep 2
    echo -e "${GREEN}✓${NC} Storage access configured"
else
    echo -e "${GREEN}✓${NC} Storage already configured"
fi

# Create data directory
echo -e "\n${BLUE}📁 Creating data directory...${NC}"
DATA_DIR="$HOME/storage/shared/EnergyIntel"
mkdir -p "$DATA_DIR"
echo -e "${GREEN}✓${NC} Data directory: $DATA_DIR"

# Get installation directory
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "\n${BLUE}📍 Installation directory: ${INSTALL_DIR}${NC}"

# Make Python scripts executable
echo -e "\n${BLUE}🔐 Making scripts executable...${NC}"
if [ -d "$INSTALL_DIR/src" ]; then
    chmod +x "$INSTALL_DIR/src/"*.py
    echo -e "${GREEN}✓${NC} Scripts are now executable"
else
    echo -e "${YELLOW}⚠️  Warning: src/ directory not found${NC}"
fi

# Create launcher script
echo -e "\n${BLUE}🚀 Creating launcher command...${NC}"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

LAUNCHER="$BIN_DIR/energy-intel"
cat > "$LAUNCHER" << EOFSCRIPT
#!/data/data/com.termux/files/usr/bin/bash
# EAGLE Launcher
cd "$INSTALL_DIR/src"
python energy-intel-eagle.py "\$@"
EOFSCRIPT

chmod +x "$LAUNCHER"
echo -e "${GREEN}✓${NC} Launcher created: $LAUNCHER"

# Add to PATH if not already there
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo -e "\n${BLUE}🔧 Adding launcher to PATH...${NC}"

    # Add to .bashrc
    if ! grep -q "$BIN_DIR" "$HOME/.bashrc" 2>/dev/null; then
        echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.bashrc"
        echo -e "${GREEN}✓${NC} PATH updated in .bashrc"
    fi

    # Add to current session
    export PATH="$PATH:$BIN_DIR"
    echo -e "${GREEN}✓${NC} PATH updated for current session"
fi

# Create alias
echo -e "\n${BLUE}📝 Creating alias 'eagle'...${NC}"
if ! grep -q "alias eagle=" "$HOME/.bashrc" 2>/dev/null; then
    echo "alias eagle='energy-intel'" >> "$HOME/.bashrc"
    echo -e "${GREEN}✓${NC} Alias 'eagle' created"
else
    echo -e "${GREEN}✓${NC} Alias already exists"
fi

# Test GPS functionality
echo -e "\n${BLUE}🛰️  Testing GPS functionality...${NC}"
if command -v termux-location &> /dev/null; then
    echo -e "${YELLOW}   Testing GPS (this may take a moment)...${NC}"
    timeout 10s termux-location -p network > /dev/null 2>&1 && {
        echo -e "${GREEN}✓${NC} GPS test successful!"
    } || {
        echo -e "${YELLOW}⚠️  GPS test timed out (normal if no fix available)${NC}"
        echo -e "${YELLOW}   GPS will work when you're outside with clear sky view${NC}"
    }
else
    echo -e "${YELLOW}⚠️  termux-location command not found${NC}"
    echo -e "${YELLOW}   Make sure Termux:API app is installed from F-Droid${NC}"
fi

# Installation complete
echo -e "\n${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✅  EAGLE INSTALLATION COMPLETE!                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}🦅 HH Holdings Energy Infrastructure Intelligence${NC}"
echo -e "${CYAN}   Bosque County, Texas - Soaring Above the Energy Frontier${NC}\n"

echo -e "${GREEN}Installation Summary:${NC}"
echo -e "  ✓ Python installed"
echo -e "  ✓ termux-api installed"
echo -e "  ✓ Storage access configured"
echo -e "  ✓ Data directory: $DATA_DIR"
echo -e "  ✓ Launcher command: energy-intel (or 'eagle')"
echo -e ""

echo -e "${YELLOW}To launch EAGLE:${NC}"
echo -e "  ${GREEN}energy-intel${NC}  or  ${GREEN}eagle${NC}"
echo -e ""

echo -e "${YELLOW}Important Notes:${NC}"
echo -e "  📱 Install 'Termux:API' app from F-Droid for GPS features"
echo -e "  🛰️  GPS works best outdoors with clear sky view"
echo -e "  💾 Data saved to: ~/storage/shared/EnergyIntel/"
echo -e "  📂 Access files via Android file manager"
echo -e ""

echo -e "${BLUE}For best results:${NC}"
echo -e "  1. Grant location permissions when prompted"
echo -e "  2. Enable GPS on your device"
echo -e "  3. Go outside for accurate GPS coordinates"
echo -e ""

echo -e "${GREEN}Ready to analyze energy infrastructure sites! 🦅${NC}\n"

# Offer to launch now
read -p "Launch EAGLE now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${CYAN}🦅 Launching EAGLE...${NC}\n"
    sleep 1
    cd "$INSTALL_DIR/src"
    python energy-intel-eagle.py
fi

exit 0
