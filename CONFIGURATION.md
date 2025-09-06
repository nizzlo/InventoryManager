# Configuration Guide

This inventory manager is fully configurable through environment variables. You can easily customize the application name and branding to match your company or organization.

## Quick Configuration

### Method 1: Using the Configuration Script (Recommended)

Run the interactive configuration script:

```bash
./configure.sh
```

This script will guide you through setting:
- Application name
- Application description

### Method 2: Manual Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your settings:**
   ```bash
   # Application Configuration
   NEXT_PUBLIC_APP_NAME="Samantha Communication Inventory Manager"
   NEXT_PUBLIC_APP_DESCRIPTION="Inventory management system for Samantha Communication"
   NEXT_PUBLIC_APP_VERSION="1.0.0"
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Available Configuration Options

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name shown in header and browser title | `"Samantha Communication Inventory Manager"` |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Application description for metadata | `"Inventory management system for Samantha Communication"` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `"1.0.0"` |

## Where the Configuration Appears

- **Browser Title**: The app name appears in the browser tab
- **Header Navigation**: The app name is displayed in the top header
- **Page Metadata**: Used for SEO and social media sharing

## Examples

### Default Configuration
```bash
NEXT_PUBLIC_APP_NAME="Inventory Manager"
NEXT_PUBLIC_APP_DESCRIPTION="A simple inventory management system"
```

### Company-Specific Configuration
```bash
NEXT_PUBLIC_APP_NAME="ABC Corp Inventory Manager"
NEXT_PUBLIC_APP_DESCRIPTION="Inventory management system for ABC Corporation"
```

### Department-Specific Configuration
```bash
NEXT_PUBLIC_APP_NAME="Warehouse Operations Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Inventory tracking for warehouse operations"
```

## Important Notes

- Environment variables starting with `NEXT_PUBLIC_` are included in the browser bundle
- You must restart the development server after changing environment variables
- In production, make sure to set these variables in your hosting environment
- The configuration file `/src/config/app.ts` handles the logic for reading these variables

## Troubleshooting

### Changes Not Appearing
1. Make sure you've restarted the development server with `npm run dev`
2. Clear your browser cache and refresh the page
3. Check that your `.env.local` file is in the root directory
4. Verify the variable names are exactly as shown (case-sensitive)

### Environment File Not Found
If you don't have a `.env.local` file:
1. Copy from the example: `cp .env.example .env.local`
2. Or run the configuration script: `./configure.sh`

### Testing Your Configuration
You can verify your configuration is working by:
1. Checking the browser title bar
2. Looking at the header text in the application
3. Running: `npm run dev` and watching for "Environments: .env.local" in the output
