interface AppConfig {
  name: string
  description: string
  version: string
}

export const appConfig: AppConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Inventory Manager',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A simple inventory management system',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
}

// You can also export individual config values for convenience
export const { name: APP_NAME, description: APP_DESCRIPTION, version: APP_VERSION } = appConfig
