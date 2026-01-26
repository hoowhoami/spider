# AI Spider

An intelligent web crawler powered by Claude Agent SDK.

## Features

- **Smart Content Extraction**: AI-powered extraction of main content, titles, and key information
- **Structured Data Extraction**: Extract specific fields from web pages in JSON format
- **Intelligent Link Discovery**: Automatically discover and categorize relevant links
- **Content Analysis**: Comprehensive AI analysis of web page content
- **Real-time Crawling**: Interactive crawling with instant results
- **Deep Crawling**: Multi-level crawling with progress tracking

## Tech Stack

- **Frontend**: React 19
- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v3
- **Type System**: TypeScript 5.9
- **AI Engine**: Claude Agent SDK (@anthropic-ai/claude-agent-sdk + @anthropic-ai/sdk)
- **Code Quality**: ESLint + Prettier + Commitlint

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd spider
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Single Page Crawl

1. Enter a URL in the input field
2. Select an extraction type:
   - **Content**: Extract main content and title
   - **Structured**: Extract specific data fields
   - **Links**: Discover and analyze links
   - **Analysis**: Get comprehensive AI analysis
3. Click "Crawl Now" to start

### Deep Crawl

1. Configure the URL and extraction type
2. Click "Deep Crawl" to start multi-level crawling
3. Watch real-time progress as pages are crawled
4. View results for each discovered page

## API Routes

### POST /api/crawl

Single page crawl endpoint.

**Request Body:**

```json
{
  "url": "https://example.com",
  "extractionType": "content",
  "structuredFields": ["title", "price", "description"]
}
```

### POST /api/crawl/stream

Streaming deep crawl endpoint with real-time updates.

**Request Body:**

```json
{
  "url": "https://example.com",
  "extractionType": "links",
  "maxDepth": 2
}
```

## Development

### Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Quality

This project uses:

- ESLint for code linting
- Prettier for code formatting (with Tailwind CSS class sorting)
- Commitlint for commit message validation
- Husky for git hooks
- lint-staged for pre-commit checks

Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
