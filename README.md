# Connecting-Hands

A monorepo housing a mobile client and AI service for hand gesture recognition and interaction.

## Tech Stack

### Mobile Client (`apps/mobile`)
- **Framework**: Expo + React Native
- **Router**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: Zustand
- **UI Framework**: React Native Paper (Material Design)
- **HTTP Client**: Axios
- **Linting/Formatting**: ESLint + Prettier

### Backend Service (`services/hand-modeler`)
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Package Manager**: Poetry
- **Code Quality**: Ruff + Black
- **Model Serving**: TensorFlow/PyTorch (TBD)

### Shared Packages (`packages/`)
- `ui-primitives`: Reusable React Native UI components
- `types`: Shared TypeScript types and interfaces
- `api-client`: HTTP client with environment-based configuration

## Project Structure

```
.
├── apps/
│   └── mobile/              # Expo Router mobile app
│       ├── app/             # Navigation and screens
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API client and utilities
│       ├── store/           # Zustand store
│       ├── types/           # TypeScript type definitions
│       └── package.json
├── services/
│   └── hand-modeler/        # FastAPI backend service
│       ├── app/
│       │   ├── main.py      # Application entry point
│       │   ├── routers/     # API route handlers
│       │   └── models/      # Pydantic models
│       ├── pyproject.toml   # Poetry configuration
│       └── Makefile         # Development scripts
├── packages/
│   ├── ui-primitives/       # Shared UI components
│   ├── types/               # Shared types
│   └── api-client/          # HTTP client
├── package.json             # Root workspace configuration
├── pnpm-workspace.yaml      # pnpm workspaces
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm 8+
- Python 3.11+
- Poetry for Python package management

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connecting-hands
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   cd services/hand-modeler && poetry install && cd ../..
   ```

3. **Set up environment variables**
   ```bash
   # Mobile app
   cp apps/mobile/.env.example apps/mobile/.env.local

   # Backend service
   cp services/hand-modeler/.env.example services/hand-modeler/.env
   ```

## Development

### Running the Full Stack

Start both mobile and backend servers in parallel:

```bash
pnpm dev
```

This runs:
- Mobile app: `pnpm dev:mobile` (Expo development server on port 8081)
- Backend: `pnpm dev:backend` (FastAPI server on http://localhost:8000)

### Running Individual Services

**Mobile client only:**
```bash
pnpm dev:mobile
```

**Backend service only:**
```bash
pnpm dev:backend
```

Or with Poetry directly:
```bash
cd services/hand-modeler
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Code Quality

**Lint all workspaces:**
```bash
pnpm lint
```

**Format all workspaces:**
```bash
pnpm format
```

**Type check:**
```bash
pnpm type-check
```

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and type checks: `pnpm lint && pnpm type-check`
4. Commit with conventional commit messages
5. Push and create a pull request

## License

TBD
