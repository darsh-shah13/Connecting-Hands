# Development Guide

## Prerequisites

Before you start, ensure you have:

- **Node.js** 18+ and **pnpm** 8+
  ```bash
  node --version  # Should be v18+
  pnpm --version  # Should be 8+
  ```

- **Python** 3.11+ and **Poetry**
  ```bash
  python --version  # Should be 3.11+
  poetry --version
  ```

## Quick Start

### 1. Install Dependencies

```bash
# Install all Node dependencies
pnpm install

# Install Python dependencies for the backend
cd services/hand-modeler
poetry install
cd ../..
```

### 2. Environment Setup

```bash
# Create environment files
cp apps/mobile/.env.example apps/mobile/.env.local
cp services/hand-modeler/.env.example services/hand-modeler/.env
```

### 3. Run the Full Stack

From the root directory:

```bash
# Run both mobile and backend simultaneously
pnpm dev
```

Or run them separately:

```bash
# Terminal 1: Run mobile app
pnpm dev:mobile

# Terminal 2: Run backend
pnpm dev:backend
```

## Project Commands

### Development

```bash
# Start all services
pnpm dev

# Start mobile app only
pnpm dev:mobile

# Start backend only
pnpm dev:backend

# Or with Poetry directly
cd services/hand-modeler
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Code Quality

```bash
# Lint all workspaces
pnpm lint

# Format all code
pnpm format

# Type checking
pnpm type-check

# Build all packages
pnpm build
```

### Backend Specific

```bash
cd services/hand-modeler

# Using Makefile
make help          # See all available commands
make dev           # Run development server
make test          # Run tests
make lint          # Lint code
make format        # Format code

# Or directly with Poetry
poetry run pytest  # Run tests
poetry run black .  # Format with black
poetry run ruff .   # Lint with ruff
```

## Project Structure

```
connecting-hands/
├── apps/
│   └── mobile/              # Expo Router mobile app
│       ├── src/
│       │   ├── app/         # Screens and navigation (file-based)
│       │   ├── components/  # React Native components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── services/    # API client and utilities
│       │   ├── store/       # Zustand state management
│       │   ├── types/       # TypeScript types
│       │   └── theme.ts     # Theme configuration
│       ├── assets/          # Images, icons, splash
│       ├── app.json         # Expo configuration
│       └── package.json
│
├── services/
│   └── hand-modeler/        # FastAPI backend
│       ├── app/
│       │   ├── main.py      # FastAPI app entry point
│       │   ├── config.py    # Configuration and settings
│       │   ├── models/      # Pydantic request/response models
│       │   └── routers/     # API route handlers
│       ├── tests/           # Test suite
│       ├── pyproject.toml   # Poetry configuration
│       ├── Makefile         # Development scripts
│       └── pytest.ini       # Pytest configuration
│
├── packages/
│   ├── types/               # Shared TypeScript types
│   ├── ui-primitives/       # Reusable React Native components
│   └── api-client/          # Shared HTTP client
│
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # pnpm workspaces
├── tsconfig.json            # TypeScript root config
├── .eslintrc.json          # ESLint config
├── .prettierrc              # Prettier config
└── README.md                # Project overview
```

## Workflow Tips

### Adding Dependencies

```bash
# Add to mobile app
pnpm -C apps/mobile add axios

# Add to root
pnpm add -w -D typescript

# Add to Python backend
cd services/hand-modeler && poetry add fastapi
```

### Creating New Features

1. **Mobile Feature**
   - Add screen to `apps/mobile/src/app/(tabs)/`
   - Create components in `apps/mobile/src/components/`
   - Add API calls to `apps/mobile/src/services/`

2. **Backend Endpoint**
   - Add Pydantic model to `services/hand-modeler/app/models/`
   - Create router in `services/hand-modeler/app/routers/`
   - Include router in `app/main.py`

3. **Shared Package**
   - Add to appropriate package in `packages/`
   - Update `packages/*/src/index.ts` to export

## API Documentation

Once the backend is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Testing

### Backend Tests

```bash
cd services/hand-modeler
poetry run pytest
poetry run pytest -v  # Verbose
poetry run pytest -s  # Show print statements
```

### Mobile Tests

```bash
# TypeScript type checking
pnpm -C apps/mobile type-check

# Linting
pnpm -C apps/mobile lint
```

## Troubleshooting

### Port already in use

If `8000` is already in use:
```bash
# Kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change the port
cd services/hand-modeler
poetry run uvicorn app.main:app --port 8001
```

### pnpm workspace issues

```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Poetry lock issues

```bash
cd services/hand-modeler
rm poetry.lock
poetry install
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run linting and formatting: `pnpm lint && pnpm format`
4. Commit with conventional messages: `git commit -m "feat: add new feature"`
5. Push and create a PR: `git push origin feature/your-feature`

## Code Style

- **Mobile**: ESLint + Prettier (100 char line width)
- **Backend**: Black + Ruff (100 char line width)
- **Types**: Strict TypeScript (`strict: true`)
- **Python**: Type annotations required (`disallow_untyped_defs`)
