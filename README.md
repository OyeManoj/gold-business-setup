# Gold Ease Receipt - Windows Desktop App

A beautiful, offline-first gold business transaction manager for Windows.

## Features
- ✅ **Completely Offline** - No internet required
- ✅ **Local Data Storage** - All transactions stored on your device
- ✅ **Receipt Printing** - Generate and print transaction receipts
- ✅ **Transaction Types** - Exchange, Purchase, and Sale transactions
- ✅ **Live Calculations** - Real-time fine gold and amount calculations
- ✅ **Export Data** - Export transaction history to Excel
- ✅ **Multi-language** - English and Arabic support

## Quick Start

### For End Users (Simple Installation)

1. **Download** the installer from the releases page
2. **Run** `Gold-Ease-Receipt-Setup-1.0.0.exe`
3. **Install** following the setup wizard
4. **Launch** the app from your desktop or start menu

### For Developers

#### Prerequisites
- Node.js 18+ installed
- Git installed

#### Installation & Development

```bash
# Clone the repository
git clone <your-repo-url>
cd gold-ease-receipt

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

#### Building for Distribution

```bash
# Build Windows installer
npm run electron:dist

# The installer will be created in dist-electron/
```

## Project Structure

```
gold-ease-receipt/
├── electron/           # Electron main process
├── src/               # React application source
├── public/            # Static assets
├── dist/              # Built web application
└── dist-electron/     # Built desktop application
```

## Data Storage

All transaction data is stored locally using Electron's localStorage, ensuring:
- Complete privacy - no data leaves your device
- Offline functionality - works without internet
- Fast performance - instant access to your data

## Support

For issues or questions, please open an issue in the repository.