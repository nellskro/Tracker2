#!/bin/bash
echo "=== Installation du Tracker de Routine ==="
echo ""

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh" 2>/dev/null || { echo "NVM non trouvé. Installe NVM d'abord."; exit 1; }
nvm use 20 || nvm install 20

echo ""
echo "📦 Installation des dépendances serveur..."
cd "$(dirname "$0")"
npm install

echo ""
echo "📦 Installation des dépendances serveur (packages Express)..."
cd server && npm install && cd ..

echo ""
echo "📦 Installation des dépendances client (React)..."
cd client && npm install && cd ..

echo ""
echo "✅ Installation terminée !"
echo "Lance maintenant : bash LancerTracker.command"
