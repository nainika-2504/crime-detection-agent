# AI DIGITAL CRIME INVESTIGATION AGENT
### Classified Forensic Archive & Algorithmic Triage System

An atmospheric, dark academia, gothic vintage digital crime investigation agent combining an interactive pendant lamp introductory experience with a real-time machine-learning forensic dashboard.

---

## 1. Technical Architecture & Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, JavaScript, CSS Design Tokens | Dark academia classified archive, SVG pendant lamp, procedural glass shatter physics, and responsive dossier UI. |
| **Backend API** | Java 21, Spring Boot 3.3.4, Maven | RESTful service for case management, audit log persistence, and ML service communication. |
| **Machine Learning** | Python 3.11/3.13, FastAPI, scikit-learn | `RandomForestClassifier` trained on multi-factor digital financial crime datasets. |
| **Persistence** | Supabase PostgreSQL / Spring Data JPA | Stores incident dossiers, historical behavioral baselines, and investigation logs (with local in-memory fallback). |
| **Testing** | Selenium WebDriver & Python unittest | Headless end-to-end UI automation testing lamp interaction, form submission, and assistant queries. |
| **Containerization** | Docker & Docker Compose | Multi-stage production container builds for frontend, backend, and ML services. |
| **Orchestration** | Kubernetes (`k8s/`) | Deployments, Services, ConfigMaps, and Nginx Ingress reverse proxying `/api` requests to backend services. |

---

## 2. Design System & Palette

The design system strictly adheres to the 5-color dark academia palette:

1. **Existential Angst (`#0A0A0A`)**: Foundation page backdrop, cinematic opening base.
2. **Dryad Bark (`#33312F`)**: Cards, panels, navigation containers, elevated containers.
3. **Ashes (`#B7B4AE`)**: Primary readable text, hairline borders, neutral details.
4. **Light Charcoal (`#726E68`)**: Secondary muted text, subdued labels, disabled states.
5. **Black Kite (`#371E1E`)**: Burgundy accents, active navigation states, warm shadows.
6. **Candlelight / Brass Accent (`#D4A359`)**: Restrained antique pendant lamp glow.

---

## 3. The Cinematic Opening Sequence

1. **Restrained Veil**: Initial full-screen opening veil frosted over the actual live investigation dashboard.
2. **Vintage Pendant Lamp**: Antique metal shade with aged brass fittings hanging on a chain from viewport top, swinging with slow pendulum motion (3–6 degrees).
3. **Warm Light Cone & Dust**: Conical light beam illuminating drifting dust motes.
4. **Interactive Shatter (Phase A–E)**:
   - User clicks or presses `Enter`/`Space` on the lamp.
   - Lamp settles, impact shake triggers.
   - Real-time SVG fractures branch outward across the translucent glass bulb.
   - Glass breaks into flying polygon shards and glowing dust sparks (Web Audio synthesized acoustic crack).
   - Light flashes gently, sharpens background, reveals the exact title:
     **AI DIGITAL CRIME INVESTIGATION AGENT**
     *"Every clue has a story. Every shadow leaves evidence."*
   - Clicking **"ENTER INVESTIGATION"** transitions directly to the active dashboard.
5. **Session Management & Replay**:
   - Completed state preserved in `sessionStorage`.
   - Accessible **"REPLAY INTRO"** button available in the navigation bar anytime.
   - **"SKIP INTRO"** button for immediate access.

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Java (JDK 21) & Apache Maven (3.9+)
- Python (3.10+)

### A. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run at `http://localhost:3000` (or `http://localhost:5173`).*

### B. Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
*The Spring Boot API will run at `http://localhost:8080`.*

### C. Run Machine Learning Service (FastAPI)
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```
*The FastAPI service will run at `http://localhost:8000`.*

---

## 5. Running with Docker & Kubernetes

### Docker Compose
```bash
docker-compose up --build
```

### Kubernetes Orchestration
Apply manifests in the `k8s/` directory:
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/ml-service-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

The frontend container contains an Nginx reverse proxy configured to forward `/api/` traffic directly to `http://backend:8080/api/` inside the cluster.

---

## 6. Running Selenium UI Tests
```bash
cd tests
pip install -r requirements.txt
python selenium_investigation_test.py
```
Validates:
- `[data-testid='intro-lamp']`
- `[data-testid='intro-skip']`
- `[data-testid='intro-title']`
- `[data-testid='enter-investigation']`
- `[data-testid='investigation-form']`
- `[data-testid='start-investigation']`
- `[data-testid='investigation-result']`
- `[data-testid='investigation-prediction']`
- `[data-testid='risk-score']`
- `[data-testid='investigation-assistant']`
- `[data-testid='assistant-question']`
- `[data-testid='assistant-submit']`
### Deployment and Testing Verification

- Built Docker images for the frontend, backend, and ML service.
- Deployed the three services on local Kubernetes using Docker Desktop.
- Verified that the frontend was accessible locally.
- Executed the Selenium UI test suite: **10 tests passed, 0 failed**.
