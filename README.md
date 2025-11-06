# Casibase Helper

An Electron-based desktop application that helps manage and deploy Casibase instances.

## Features

- **Auto Update**: Automatically check and download the latest Casibase releases from GitHub
- **Configuration Management**: Easy-to-use interface for managing Casibase configuration
- **Deployment**: One-click deployment of Casibase backend and frontend
- **Logging**: Built-in logging system to track application events
- **Proxy Support**: HTTP/HTTPS and SOCKS proxy support for network requests
- **Multi-language**: Support for internationalization (i18n)

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/casibase/casibase-helper.git
cd casibase-helper
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Development

Start the development server:

```bash
npm start
# or
yarn start
```

This will start webpack-dev-server and launch the Electron application in development mode.

## Building

### Lint your code

```bash
npm run lint
```

### Build the application

```bash
npm run build
```

### Package the application

```bash
npm run postpackage
```

This will create distributable packages for your platform using electron-builder.

## Project Structure

```
casibase-helper/
├── src/
│   ├── backends/       # Backend logic and utilities
│   │   ├── appConf.js  # Application configuration management
│   │   ├── Conf.js     # Casibase config file management
│   │   ├── Deploy.js   # Deployment logic
│   │   ├── Log.js      # Logging system
│   │   └── version.js  # Version management and updates
│   ├── components/     # React components
│   │   ├── ConfigPage.js
│   │   ├── HomePage.js
│   │   ├── LogPage.js
│   │   ├── SettingPage.js
│   │   ├── Sidebar.js
│   │   └── Titlebar.js
│   ├── locales/       # i18n translation files
│   ├── assets/        # Static assets
│   ├── App.js         # Main React application
│   ├── i18n.js        # i18n configuration
│   └── index.js       # Application entry point
├── main.js            # Electron main process
└── IpcRegister.js     # IPC handlers for main-renderer communication
```

## Configuration

The application stores its configuration in the user data directory:
- Windows: `%APPDATA%/casibase-helper`
- macOS: `~/Library/Application Support/casibase-helper`
- Linux: `~/.config/casibase-helper`

## License

Apache License 2.0 - See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/casibase/casibase-helper/issues).