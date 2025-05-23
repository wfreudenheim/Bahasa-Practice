# Bahasa Indonesia Vocabulary Practice Tool

A modular, browser-based vocabulary practice application for Indonesian language learning that integrates local vocabulary files for dynamic content generation.

## Features

- Organized vocabulary management with folder hierarchy
- Multiple vocabulary selection and combination
- Interactive learning games and exercises
- Progress tracking and spaced repetition
- Modern, responsive user interface

## Vocabulary System

This app uses vocabulary files stored in the `/vocabulary` folder. Files are organized by learning progression and themes:

- `week01/`: Beginner vocabulary for first week
- `week02/`: Intermediate vocabulary for second week
- `themes/`: Thematic vocabulary sets (beach, animals, etc.)
- `advanced/`: Advanced vocabulary for experienced learners

### Adding Vocabulary
1. Navigate to `/vocabulary` folder
2. Choose appropriate subfolder (week01, themes, etc.)
3. Create or edit .txt files using tab-separated format
4. Commit changes - files are automatically available in app

For detailed instructions on vocabulary file format and organization, see [vocabulary/README.md](vocabulary/README.md).

## Getting Started

### Prerequisites
- Node.js 14.0.0 or later
- npm 6.0.0 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bahasa-vocab-app.git
cd bahasa-vocab-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Learn More

- [Project Roadmap](ROADMAP.md)
- [Documentation](docs/)
