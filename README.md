# PillCare - Medication Management & Adherence Platform

PillCare is a comprehensive, AI-powered medication management platform designed to improve patient adherence and facilitate seamless communication between patients and caregivers. Built with React, TypeScript, and Firebase, it leverages the Gemini API to provide personalized health insights, drug interaction analysis, and proactive medical advice.

---

## 🚀 Deployment

### Current Status
The project is currently in the **development phase**. The core application logic, UI components, and service integrations are complete. However, the project is currently **incomplete without a deployment agent**.

### Future Deployment (Deployment Agent)
In the future, a dedicated **Deployment Agent** will be integrated to handle:
- **Automated CI/CD**: Seamlessly pushing updates to production environments (e.g., Google Cloud Run, Vercel).
- **Environment Management**: Automated configuration of production secrets and environment variables.
- **Health Monitoring**: Real-time tracking of application uptime and performance.
- **Database Migrations**: Managing Firestore schema updates and data integrity.

---

## 🔑 Environment Variables

To run PillCare locally or in production, you must configure the following environment variables in a `.env` file at the root of the project:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase project's API Key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (e.g., `project-id.firebaseapp.com`). |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket URL. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging Sender ID. |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID. |
| `GEMINI_API_KEY` | Your Google Gemini API Key (used for AI insights and TTS). |

---

## 🏗️ System Architecture

PillCare follows a **Serverless / Backend-as-a-Service (BaaS)** architecture:

1.  **Frontend**: A Single Page Application (SPA) built with **React 18** and **Vite**.
2.  **Authentication**: Managed by **Firebase Authentication** (Email/Password).
3.  **Database**: **Cloud Firestore** stores user profiles, medication schedules, and adherence logs.
4.  **AI Layer**: **Google Gemini API** (via `@google/genai`) provides:
    -   **Health Insights**: Analyzing medication lists for patterns and interactions.
    -   **Text-to-Speech (TTS)**: Reading insights aloud for accessibility.
    -   **Conversational AI**: A health-focused chatbot for patient queries.
5.  **Styling**: **Tailwind CSS** for a modern, responsive, and "crafted" UI.

---

## 🔄 Core Workflows

### 1. User Onboarding
- **Patient Signup**: Generates a unique `PC-XXXXX` ID.
- **Caregiver Signup**: Requires a valid `Patient ID` to link the caregiver to a patient's data.
- **Skip Login**: Allows guest access to explore the UI (Patient/Caregiver roles supported).

### 2. Medication Management
- **Add/Edit Medication**: Patients or caregivers can define dosage, frequency, and timing.
- **Adherence Tracking**: Patients mark medications as "Taken". The system calculates a real-time adherence percentage.
- **Refill Requests**: Patients can trigger refill alerts that notify their linked caregiver.

### 3. AI Insights & Safety
- **Interaction Analysis**: Gemini scans the medication list for potential drug-drug interactions.
- **Smart Scheduling**: If a patient consistently takes a med late, the AI suggests updating the schedule to match their habit.
- **Proactive Advice**: Personalized tips based on the specific medications (e.g., "Take with food").

---

## 📂 Project Structure & File Details

### Root Files
- `App.tsx`: The main application entry point, handling routing, global state, and authentication views.
- `firebase.ts`: Firebase SDK initialization and service exports (Auth, Firestore).
- `types.ts`: Global TypeScript interfaces and enums (User, Medication, MedicationLog).
- `vite.config.ts`: Vite configuration including Tailwind CSS integration.

### `/services` - Business Logic
- `authService.ts`: Wraps Firebase Auth for login, signup, and password resets. Handles the unique Patient ID generation logic.
- `medicationService.ts`: CRUD operations for medications and adherence logs in Firestore.
- `geminiService.ts`: Integration with Gemini API for health insights, interaction checks, and TTS.

### `/components` - UI Components
- `Home.tsx`: The primary dashboard for patients, featuring the adherence ring and medication list.
- `Navigation.tsx`: Responsive bottom navigation bar for mobile-first experience.
- `MedicationForm.tsx`: Modal for adding or editing medication details.
- `AIChat.tsx`: Floating AI assistant for health-related questions.
- `CalendarView.tsx` / `History.tsx`: Visualizing past adherence and upcoming schedules.
- `Settings.tsx`: User profile management and Patient ID display.

### `/components/Auth`
- `Login.tsx` / `Signup.tsx`: Role-based authentication screens with validation and "Skip" options.
- `BiometricPrompt.tsx`: UI for simulated biometric authentication.

### `/components/Caregiver`
- `CaregiverDashboard.tsx`: Overview of linked patients and their adherence rates.
- `PatientDetail.tsx`: Detailed view for caregivers to manage a specific patient's medications and refill requests.

---

## 🛠️ Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**: `npm install`.
3.  **Configure Environment**: Create a `.env` file based on `.env.example`.
4.  **Run Development Server**: `npm run dev`.
5.  **Build for Production**: `npm run build`.
