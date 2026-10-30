# VedViki (वेदविकी) — AI-Powered Vedic Astrology & Kundli Assistant

VedViki is a full-stack web application designed for beginners to explore and understand their Vedic birth chart (Kundli). Users can upload Kundli files (images or PDFs), review and correct Gemini-extracted chart data (Lagna, Bhavas, Grahas, Rashis, Nakshatras), confirm their placements, and interact with an AI astrologer in English or Hindi powered by Google Gemini and ChromaDB RAG.

---

## Key Features

1. **Elegant Indian-Inspired Visual Design**:
   - Palette: Warm ivory backgrounds (`#FAF7F2`), deep imperial purple (`#2A0845`), subtle gold highlights (`#D4AF37`), clean cards, and responsive desktop/mobile layouts.
   - Dual Chart Visualizer: Interactive SVG rendering of **North Indian diamond** charts and **South Indian square grid** charts, plus detailed tabular planetary matrices.

2. **Multimodal AI Chart Digitization**:
   - Accepts JPG, JPEG, PNG, WEBP, and PDF birth chart documents.
   - Validates file content using binary magic signatures (preventing MIME/extension spoofing), enforces strict file size (10MB) and PDF page limits (5 pages).
   - PyMuPDF extracts embedded text and renders high-resolution page images for **Google Gemini 2.5 Flash** multimodal analysis.
   - Preserves unknown fields as unknown; **never fabricates or hallucinates missing planetary placements**.

3. **Human-in-the-Loop Placement Verification**:
   - Extracted chart data is presented in an editable review form.
   - Users can correct their Lagna, signs, houses (1-12), degrees (0-30°), Nakshatras, and Retrograde/Combust flags.
   - **Explicit User Confirmation**: Chart-specific AI readings are strictly gated until the user confirms their placements.

4. **Grounded Astrologer Chatbot (English & Hindi)**:
   - Full support for English and Hindi (हिंदी).
   - Multi-turn conversation persistence tied securely to user sessions and charts.
   - Suggestion prompt chips for beginners.

5. **ChromaDB RAG Vector Knowledge Base**:
   - Curated reference collection covering:
     - The 9 Navagrahas (Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, Ketu)
     - The 12 Bhavas (Purusharthas, Kendras, Trikonas, Dusthanas)
     - The 12 Rashis (Elements, Lords, Qualities)
     - The 27 Nakshatras & Lords
     - Core Parashari Principles (Lagna primacy, Vakri, Asta, Vimshottari timing)
   - Real-time semantic similarity retrieval with citations.
   - Safe baseline mode if RAG is unconfigured or empty.

6. **Ethical Astrological Charter**:
   - Strict separation of verified chart facts from traditional interpretations.
   - Zero fatalism: no predictions of exact dates of marriage, death, or wealth.
   - Absolute prohibition on medical diagnoses, legal judgments, or financial trading advice.
   - Transparent disclaimer: Astrology is a traditional symbolic cultural system, not an empirical science.

7. **Extensible Ephemeris Engine Interface**:
   - Pluggable interface for astronomical calculation engines (e.g. Swiss Ephemeris / pyswisseph).
   - Explicit calculation provenance: uploaded charts are never falsely claimed to be independently calculated.

---

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React.
- **Backend**: Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (asyncio + aiosqlite / asyncpg), Alembic.
- **AI**: Google Gemini API via official `google-genai` SDK (`from google import genai`).
- **Vector DB**: ChromaDB for local persistent RAG vector storage.
- **Document Processing**: PyMuPDF (`pymupdf`) and Pillow (`PIL`).
- **Testing**: Pytest (15 automated unit & integration tests) and Vite TypeScript production build.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Python 3.12 or 3.13
- Node.js v18+ and npm
- (Optional) Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY (optional: if omitted, development fallback mode is active)

# Apply database migrations
alembic upgrade head

# Ingest curated Vedic reference texts into ChromaDB vector store
python scripts/ingest_knowledge.py

# Start FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
Health status endpoint: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server with proxy to backend
npm run dev
```

Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## One-Click Demo Mode

If you don't have a scanned Kundli document handy, simply click the **"Try Demo Chart"** button on the Navbar. This will:
1. Seed a sample Aries Lagna Kundli with all 9 planetary placements.
2. Mark the chart as verified.
3. Automatically launch an interactive consultation session so you can explore queries immediately.

---

## Running Automated Tests

### Backend Tests (Pytest)
```bash
cd backend
source venv/bin/activate
pytest tests -v
```
*Runs 15 test suites covering magic byte file validation, Gemini schema normalization, chart review & confirmation, multi-tenant access control isolation, and RAG retrieval.*

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## Docker Deployment

To launch both PostgreSQL and the backend with ChromaDB persistence via Docker Compose:

```bash
docker-compose up --build
```
