# MOM Generator

Convert free-form meeting notes into structured Minutes of Meeting (MOM) with Discussion, Agreement, Action Item, and PIC sections.

## Local Development

### Prerequisites
- Node.js 20+
- OpenAI API key
- Firebase project with Authentication enabled

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   cd web && npm install && cd ..
   ```

2. **Set up environment variables:**
   
   **Backend (.env):**
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="your_firebase_private_key_here"
   ALLOWLIST_EMAILS=your_email@example.com
   ```

   **Frontend (web/.env):**
   ```env
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   ```

3. **Firebase Setup:**
   - Create a Firebase project
   - Enable Authentication with Email/Password
   - Create a service account and download the key
   - Create a user account for testing

### Development Commands

```bash
# Run backend only
npm run dev

# Run frontend only
npm run dev:web

# Run both backend and frontend
npm run dev:both

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Testing Locally

1. Start both services:
   ```bash
   npm run dev:both
   ```

2. Open browser to `http://localhost:5173`

3. Sign in with your Firebase account

4. Paste meeting notes and generate MOM

### API Testing

Test the API directly:

```bash
# Health check
curl http://localhost:8080/health

# Generate MOM (requires Firebase auth token)
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "raw_notes": "We discussed the new feature implementation...",
    "style": "short"
  }'
```

## Production Deployment

See `.github/workflows/deploy.yml` for automated Cloud Run deployment.

Required GitHub Secrets:
- `OPENAI_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GCP_PROJECT_ID`
- `GCP_SA_KEY`