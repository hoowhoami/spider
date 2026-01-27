# AI Spider

An intelligent web crawler powered by Claude Agent SDK with visual workflow editor.

## Features

### Simple Mode

- **Smart Content Extraction**: AI-powered extraction of main content, titles, and key information
- **Structured Data Extraction**: Extract specific fields from web pages in JSON format
- **Intelligent Link Discovery**: Automatically discover and categorize relevant links
- **Content Analysis**: Comprehensive AI analysis of web page content
- **Real-time Crawling**: Interactive crawling with instant results
- **Deep Crawling**: Multi-level crawling with progress tracking

### Workflow Editor Mode (NEW)

- **Visual Workflow Design**: Drag-and-drop interface for building complex crawling pipelines
- **Multiple Node Types**: 9 different node types for various operations
- **AI-Powered Processing**: Extract, analyze, and filter content using AI
- **Batch Operations**: Process multiple URLs in parallel
- **Data Transformation**: Transform and export data in various formats
- **Workflow Management**: Save, export, and import workflows as JSON

## Tech Stack

- **Frontend**: React 19
- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Workflow Engine**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS v3
- **Type System**: TypeScript 5.9
- **AI Engine**: Claude Agent SDK (@anthropic-ai/claude-agent-sdk)
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

### Simple Mode

Navigate to the home page (http://localhost:3000) for quick crawling tasks.

#### Single Page Crawl

1. Enter a URL in the input field
2. Select an extraction type:
   - **Content**: Extract main content and title
   - **Structured**: Extract specific data fields
   - **Links**: Discover and analyze links
   - **Analysis**: Get comprehensive AI analysis
3. Click "Crawl Now" to start

#### Deep Crawl

1. Configure the URL and extraction type
2. Click "Deep Crawl" to start multi-level crawling
3. Watch real-time progress as pages are crawled
4. View results for each discovered page

### Workflow Editor Mode

Navigate to the Workflow Editor (http://localhost:3000/workflow) for advanced crawling pipelines.

#### Available Node Types

**Input Nodes**

- **URL Input**: Input single or multiple URLs
  - Single URL mode
  - Multiple URLs mode (one per line)
  - Search Query mode (planned)

**AI Processing Nodes**

- **AI Extract**: Extract content using AI
  - Content extraction
  - Structured data extraction
  - Link extraction
  - Content analysis

- **AI Analyze**: Analyze content with AI
  - Summary generation
  - Sentiment analysis
  - Content classification
  - Custom analysis

- **AI Filter**: Filter results intelligently
  - Keyword filtering
  - AI condition filtering
  - Regex pattern filtering

**Crawling Nodes**

- **Batch Crawl**: Crawl multiple pages
  - Configure max depth
  - Configure max pages
  - Follow links automatically

- **Search Engine**: Search and crawl (planned)
  - Google search
  - Bing search
  - DuckDuckGo search

**Data Processing Nodes**

- **Transform**: Transform data structure
  - Map transformations
  - Filter operations
  - Reduce operations
  - Custom scripts

**Output Nodes**

- **Export**: Export data to files
  - JSON format
  - CSV format
  - Excel format
  - Database (planned)

- **Output**: Display or download results
  - Display in UI
  - Download as file
  - API response

#### Creating a Workflow

1. **Add Nodes**: Drag nodes from the left panel to the canvas
2. **Connect Nodes**: Click and drag from a node's output (bottom) to another node's input (top)
3. **Configure Nodes**: Click on a node to open the configuration panel on the right
4. **Execute**: Click the "Execute" button to run your workflow
5. **Save**: Click "Save" to store in browser localStorage or "Export" to download as JSON

#### Example Workflows

**Simple Content Extraction**

```
[URL Input] → [AI Extract] → [Output]
```

**Batch Crawl with Filtering**

```
[URL Input] → [Batch Crawl] → [AI Filter] → [Export]
```

**Content Analysis Pipeline**

```
[URL Input] → [AI Extract] → [AI Analyze] → [Transform] → [Export]
```

**Multi-Source Data Aggregation**

```
[URL Input 1] ↘
                → [AI Extract] → [Transform] → [Output]
[URL Input 2] ↗
```

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

**Response:** Server-Sent Events (SSE) stream

### POST /api/workflow/execute

Execute a workflow pipeline.

**Request Body:**

```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "input",
      "position": { "x": 0, "y": 0 },
      "data": {
        "label": "URL Input",
        "inputType": "single",
        "url": "https://example.com"
      }
    }
  ],
  "edges": []
}
```

**Response:**

```json
{
  "success": true,
  "results": [...],
  "nodesExecuted": 2
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
