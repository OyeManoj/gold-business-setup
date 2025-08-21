# Gold Ease Receipt - Professional Business Management Platform

A beautiful, cloud-powered gold business transaction manager with multi-user support.

## Features
- ✅ **User Authentication** - Secure login and data isolation
- ✅ **Cloud Storage** - Data synced across devices with offline fallback
- ✅ **Multi-User Support** - Each user's data is completely separate
- ✅ **Transaction Types** - Exchange, Purchase, and Sale transactions
- ✅ **Live Calculations** - Real-time fine gold and amount calculations
- ✅ **Export Data** - Export transaction history to Excel
- ✅ **Multi-language** - English and Arabic support
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

### For End Users

1. **Visit** the website at your deployed URL
2. **Sign up** for a new account or sign in with existing credentials
3. **Start managing** your gold business transactions

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

# Set up Supabase (optional for development)
# The app includes fallback to localStorage for offline development

# Run in development mode
npm run dev
```

#### Building for Production

```bash
# Build for production
npm run build

# The built files will be in the dist/ directory
```

## Project Structure

```
gold-ease-receipt/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── pages/          # Application pages
│   ├── utils/          # Utility functions
│   └── integrations/   # Supabase integration
├── public/             # Static assets
└── dist/               # Built web application
```

## Data Storage & Security

- **Cloud Storage**: User data is securely stored in Supabase with Row-Level Security (RLS)
- **User Isolation**: Each user's data is completely separate and private
- **Offline Fallback**: Local storage backup for offline functionality
- **Authentication**: Secure email/password authentication with Supabase Auth
- **Data Persistence**: User data persists across devices and sessions

## Support

For issues or questions, please open an issue in the repository.