# 🛡️ Fraud & Spam Call Detector

> An Enterprise-Grade AI-Powered Application to instantly classify phone numbers as Fraud, Spam, or Safe based on advanced behavioral patterns and numerical heuristic analysis.

---

## 📌 Overview

The **Fraud & Spam Call Detector** is a full-stack web application designed to protect users from malicious callers. It utilizes a custom-trained **Random Forest Machine Learning Model** that deeply analyzes phone number strings to detect highly suspicious digit sequences that typical reputation databases miss. 

It is wrapped in a highly responsive, cyberpunk-inspired **React frontend** and driven by a lightning-fast **FastAPI backend**, complete with JWT authentication, role-based access control (RBAC), and integrated analytics.

---

## 🚀 Core Features

### 1. 🧠 AI-Powered Detection Engine
- Uses a mathematically tuned **Scikit-Learn Random Forest Classifier** achieving **94.2% validation accuracy**.
- **Synthetic Dataset Generation**: Dynamically synthesizes a balanced pool of 10,000 realistic numerical records (Spam, Fraud, Safe) during the training pipeline to specifically catch modern telecom rotations.
- Analyzes 16 complex numeric parameters per number.
- Dynamically assigns strict **Risk Levels (High, Medium, Low)** tied directly to AI classifications.
- Returns a precise **Confidence Percentage** dynamically calculated by the inference engine's probability matrix.

### 2. 🔍 Advanced String Pattern Extraction
Unlike basic blocking apps, this engine mathematically extracts string features to catch newly rotated VoIP numbers:
- **Repetition Ratio**: Detects repeated digits (`1111111111`).
- **Sequential Pattern Score**: Catches consecutive sequences (`123456`, `987654`).
- **Alternating Pattern Score**: Identifies VoIP rotations (`1010101010`).
- **Palindrome Score**: Flags mirrored numbers (`123321`).
- **Entropy Score**: Measures the randomness/predictability of the digits.
- **Short Number Penalty**: Flags illegally short digits.
- **Same Prefix Suspicion**: Penalizes blocks of identical starting digits.

### 3. 🎨 Premium Cybersecurity UI/UX
- **Dark-Mode Aesthetic**: High-contrast neon accents, glassmorphism, and deep slate backgrounds.
- **Animated Confidence Dashboards**: SVG circular progress meters that dynamically fill based on algorithm confidence.
- **Real-time Notifications**: Triggered via `react-hot-toast` for smooth user feedback.
- **Responsive Navigation**: Sidebar/Top-bar driven by `lucide-react` icons.

### 4. 🔒 Authentication & Security
- **JWT (JSON Web Tokens)**: Secure stateless session handling.
- **RBAC (Role-Based Access)**: Distinct capabilities for Standard Users vs. Admins.
- **Password Hashing**: Bcrypt encryption for user credentials.
- **Rate Limiting**: Defends the AI inference endpoint against rapid DDoS spam requests (Powered by SlowAPI).

### 5. 📊 Data Tracking & Analytics
- **User History**: A dedicated, paginated dashboard displaying every number a user has ever verified.
- **Reporting System**: Users can manually flag numbers as Spam/Fraud from the interface.
- **Admin Dashboard**: Visualizes global platform statistics using **Recharts** (Bar charts for threat distributions, Line charts for reporting frequency).
- **ORM Integration**: Powered by SQLAlchemy for seamless database transactions.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React (Vite) | Lightning-fast UI component rendering |
| **Frontend Styling** | Tailwind CSS v4 | Utility-first cyberpunk designs |
| **Charts & Icons** | Recharts, Lucide-React | Analytics visualization and iconography |
| **Backend Framework** | FastAPI | High-performance asynchronous Python API |
| **Database ORM** | SQLAlchemy | Object-Relational mapping (SQLite/Postgres) |
| **Machine Learning** | Scikit-Learn | Training and evaluating the Random Forest trees |
| **Mathematical Logic** | NumPy & Pandas | Matrix arrays and DataFrame dataset prep |
| **Deployment Export** | Joblib | Binary model serialization |

---

## 📂 Project Structure

```text
Akshara/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI Route Handlers (auth, detector, history, admin)
│   │   ├── core/         # JWT Security, Configurations, Rate Limiting
│   │   ├── db/           # SQLAlchemy Data Models & Sessions
│   │   ├── ml/           # Machine Learning Engine
│   │   │   ├── assets/   # Saved joblib binaries (spam_model.joblib)
│   │   │   ├── features.py # The mathematical string extraction logic
│   │   │   └── train.py  # AI synthetic dataset generator & training pipeline
│   │   ├── schemas.py    # Pydantic validation structures
│   │   └── main.py       # FastAPI application entry point
│   ├── test_inference.py # Local script for debugging the Random Forest output
│   └── requirements.txt  # Python pip dependencies
│
└── frontend/
    ├── src/
    │   ├── components/   # React Components (Auth, AdminPanel, Detector, HistoryPanel)
    │   ├── App.jsx       # Global application layout and router state
    │   ├── index.css     # Global Tailwind configuration and dark theme roots
    │   └── main.jsx      # React DOM hydration
    ├── package.json      # Node.js dependencies
    └── vite.config.js    # Vite compiler configuration
```

---

## ⚙️ How to Run Locally

### 1. Initialize the Backend
Ensure you have Python 3.9+ installed.

```bash
cd backend
python -m pip install -r requirements.txt

# (Optional) Re-train the AI Model to generate fresh weights
python -m app.ml.train

# Start the FastAPI Server (Port 8001 to avoid cache collisions)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
*The API will be available at `http://localhost:8001/docs`.*

### 2. Initialize the Frontend
Ensure you have Node.js 18+ installed.

```bash
cd frontend
npm install

# Start the Vite Development Server
npm run dev
```
*The web interface will be available at `http://localhost:5173`.*

---

## 🛡️ Admin Role Provisioning
The platform employs dynamic Role-Based Access Control (RBAC). For demonstration and testing purposes, authenticating or registering with the exact usernames `admin` or `testuser` will automatically tether high-level Administrator privileges to your JWT session, seamlessly unlocking the visual **Admin Command Center** telemetry.

*Developed with an emphasis on code quality, analytical security, and premium aesthetics.*
