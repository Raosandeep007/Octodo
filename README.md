# Octodo

Your todos, backed by GitHub. A React Native / Expo app inspired by [TodoHub](https://github.com/martinwoodward/todohub).

## Features

- **Issue-backed todos** - Every todo is a GitHub Issue
- **Project integration** - Uses GitHub Projects for ordering and custom fields
- **Due dates** - Set and track deadlines
- **Priorities** - High, Medium, Low priority levels
- **Quick complete** - Swipe to mark tasks done
- **All issues view** - See all issues assigned to you across GitHub
- **Dark mode** - Full support for light and dark themes

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A GitHub Personal Access Token with `repo` and `project` scopes

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/octodo.git
cd octodo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Add your GitHub Personal Access Token to `.env`:
```
EXPO_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
octodo/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # My Todos screen
│   │   ├── issues.tsx     # All Issues screen
│   │   └── add.tsx        # Add tab placeholder
│   ├── settings.tsx       # Settings screen
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services (GitHub)
│   ├── store/             # Zustand state management
│   ├── theme/             # Theme configuration
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── assets/                # Images and static assets
└── app.json              # Expo configuration
```

## Configuration

The app can be configured through environment variables or in-app settings:

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_GITHUB_TOKEN` | GitHub Personal Access Token |
| `EXPO_PUBLIC_GITHUB_OWNER` | Default repository owner |
| `EXPO_PUBLIC_GITHUB_REPO` | Default repository name |

## Tech Stack

- **React Native** with Expo
- **Expo Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **GitHub REST & GraphQL API** for data

## License

MIT
