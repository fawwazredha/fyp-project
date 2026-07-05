# CKD Early Risk Assessment System

A full-stack rule-based Chronic Kidney Disease early screening tool built with Python Flask and React + TypeScript.

## Features

- Multi-section CKD risk questionnaire
- Rule-based scoring engine (no machine learning)
- BMI calculation and risk classification
- Contributing risk factors list
- Responsive modern UI with dark mode
- Axios API integration and loading/error handling
- Local storage draft saving and result persistence

## Backend

### Run backend

1. Create a Python environment and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Copy environment values from `.env.example` and set your database URL:

```bash
copy .env.example .env
```

3. Start the Flask app:

```bash
python run.py
```

The API server will run at `http://localhost:5000`.

### Backend API endpoint

- `POST /api/predict-risk`
  - Accepts questionnaire data as JSON
  - Returns BMI, total score, risk level, contributing factors, and recommendation

## Frontend

### Run frontend

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Start the Vite development server:

```bash
npm run dev
```

3. Open the local address shown by Vite (usually `http://localhost:5173`).

## Project structure

- `backend/` — Flask backend and CKD scoring API
- `frontend/` — Vite React TypeScript application
- `.env.example` — example environment values
- `backend/requirements.txt` — Python dependencies

## Notes

This application is intentionally rule-based and does not use any machine learning libraries.
  