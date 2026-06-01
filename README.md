# Kelem - Parent-School Engagement Platform

A modern Next.js application for managing school-parent communication and engagement.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend repository)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your settings:

```env
# Backend API - REQUIRED
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com
NEXT_PUBLIC_API_TIMEOUT=30000

# Google Services (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_key

# Feature Flags - Enable/disable API integrations
NEXT_PUBLIC_FF_REAL_AUTH=true
NEXT_PUBLIC_FF_REAL_SCHOOLS=true
NEXT_PUBLIC_FF_REAL_BRANCHES=false
NEXT_PUBLIC_FF_REAL_ANALYTICS=false
NEXT_PUBLIC_FF_REAL_BILLING=false
NEXT_PUBLIC_FF_REAL_SETTINGS=false
NEXT_PUBLIC_FF_REAL_ONBOARDING=true
```

**Important:** 
- Always use environment variables for configuration
- Never hardcode URLs or API keys in the source code
- The `NEXT_PUBLIC_` prefix is required for client-side access
- Restart the dev server after changing environment variables

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory (routes)
├── src/
│   ├── components/        # Reusable React components
│   ├── config/           # Configuration files
│   ├── context/          # React context providers
│   ├── features/         # Feature-based modules
│   ├── lib/              # Utilities and API clients
│   │   ├── api/         # API client and configuration
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API service layers
│   │   └── types/       # TypeScript type definitions
│   └── ...
├── components/           # shadcn/ui components
└── public/              # Static assets
```

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components.

To add components:

```bash
npx shadcn@latest add button
```

This will place the UI components in the `components/ui` directory.

### Using Components

```tsx
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

## Feature Flags

The application uses feature flags to gradually enable backend integrations:

- `NEXT_PUBLIC_FF_REAL_AUTH` - Use real authentication API
- `NEXT_PUBLIC_FF_REAL_SCHOOLS` - Use real schools API
- `NEXT_PUBLIC_FF_REAL_BRANCHES` - Use real branches API
- `NEXT_PUBLIC_FF_REAL_ANALYTICS` - Use real analytics API
- `NEXT_PUBLIC_FF_REAL_BILLING` - Use real billing API
- `NEXT_PUBLIC_FF_REAL_SETTINGS` - Use real settings API
- `NEXT_PUBLIC_FF_REAL_ONBOARDING` - Use real onboarding API

Set to `true` to enable, `false` to use mock data.

## Development Guidelines

### Configuration Best Practices

1. **Never hardcode URLs or secrets** - Always use environment variables
2. **Use the config module** - Import from `@/lib/api/config` or `@/config/featureFlags`
3. **Validate environment variables** - The config module validates required variables
4. **Document new variables** - Update `.env.example` when adding new variables

### API Integration

All API calls go through the centralized API client in `src/lib/api/client.ts`:

```typescript
import { apiRequest } from '@/lib/api/client';

const response = await apiRequest({
  method: 'GET',
  path: '/api/schools/',
});
```

The client automatically:
- Adds authentication headers
- Handles token refresh
- Provides error normalization
- Implements retry logic
- Manages request caching

## Troubleshooting

### Environment Variables Not Loading

1. Ensure the variable name starts with `NEXT_PUBLIC_` for client-side access
2. Restart the development server after changing `.env.local`
3. Check the browser console for configuration logs (development mode only)

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in `.env.local`
2. Check that the backend server is running
3. Look for CORS issues in the browser console
4. Verify authentication tokens are valid

## License

MIT License
