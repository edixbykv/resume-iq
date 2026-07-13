# ResumeIQ - Complete AI Career Intelligence Platform

ResumeIQ is a premium, high-performance career intelligence platform built for Web & Android. It transcends traditional ATS checkers by providing a complete ecosystem to score, write, optimize, track, and export recruiter-grade resumes.

---

## 🚀 Core Platform Features

### 1. Interactive Resume Builder
- **Dynamic Previews**: Edit fields in real-time and see immediate changes in the preview layout.
- **Custom Stylings**: Toggle between premium font families (`font-sans`, `font-serif`, `font-mono`), color themes (`indigo`, `rose`, `emerald`, `amber`, `slate`), and spacing margins (`compact`, `normal`, `loose`).
- **ATS-Safe Templates**: Clean, grid-based layouts designed according to executive recruitment practices.
- **Print Optimization**: Automatic print styling hides menus, layout controls, and navbars. Removes scrolling restrictions to produce clean, page-truncated PDFs.
- **Inline Flow Navigation**: Integrated step-by-step Back and Next buttons at the bottom of the editor to guide users seamlessly.

### 2. Job-Specific AI Optimizer
- **Job Description Alignment**: Paste any job description to trigger the AI optimizer.
- **Profile Summary Customization**: Re-phrases candidate summaries to target core credentials from the job spec.
- **Keyword Injection**: Matches skills to missing tools, frameworks, and programming languages required by the JD.
- **Bullet Optimization**: Tailors experience bullet points to emphasize required project outcomes.
- **Fallback Engine**: Local deterministic engine extracts matching technologies for a zero-config demo mode.

### 3. One-Click Apply Tracker
- **Application CRUD Widget**: Directly embedded in the main User Dashboard.
- **Hiring Stage Management**: Change state options dynamically (`Applied`, `Interviewing`, `Offered`, `Rejected`).
- **Activity Logging**: Track company names, targets, application dates, and interview feedback notes.

### 4. Recruiter-Grade AI Analyzer
- **20+ Metrics Evaluation**: Deep analysis of formatting, contact presence, vocabulary, metrics quantification, and redundant statements.
- **Explainable Scoring**: Clear feedback on recruiter appeal, skills density, and content clarity.
- **Upskilling Path**: Automatic 90-day plan indicating certification targets and required projects.

### 5. Passwordless Email OTP Login
- **Seamless Auth**: Generates a 6-digit OTP code log stored in the database.
- **Resend Integration**: Sends dynamic, styled account verification emails directly to the user's inbox via Resend.
- **Auto-Account Creation**: Automatically provisions User accounts on the fly when verification succeeds.
- **Local Testing Helper**: Displays the code in a toast overlay for easy validation in sandbox testing environments.

### 6. Razorpay Live Billings
- **Premium Upgrades**: Implements Razorpay checkout for a flat-rate ₹9 resume unlock fee.
- **Transaction Logs**: Verifies order callbacks and records transactions securely inside the database.

### 7. Interactive Admin Panel (`/admin`)
- **System Monitoring**: Live counters for total accounts, paid transactions, revenue generated, and OTPs issued.
- **Live Logs Tables**: Real-time view of recently sent verification codes and successful transactions.

### 8. Premium Mobile Experience
- **Fluid WebView**: Wraps the live site in a high-speed container with top status bar safe area paddings.
- **Brand Splash Screen**: Glowing logo badge displaying "build by kvai.in" at the bottom with a 2.5-second load timer.
- **Custom App Icon**: Premium glowing neon purple and blue 'IQ' monogram metallic badge icon generated and mapped across mobile build configurations.

---

## 🗺️ Application Routing Index

### Web Routes (Frontend & Backend Pages)
- **`/`**: Premium Landing Page.
- **`/builder`**: Interactive builder workspace, styling customizer, and job optimization tab.
- **`/dashboard`**: Workspace showing saved analysis scorecards and the One-click Apply Tracker.
- **`/admin`**: Dark-themed monitoring terminal.
- **`/signin`**: OTP-driven authentication gateway.
- **`/privacy` & `/terms`**: Legal compliance and policy documents.

### API Routes (Backend Endpoints)
- **`/api/auth/otp/send`**: Issues and logs passwordless validation codes.
- **`/api/builder/optimize`**: Tailors structured resumes to target JDs.
- **`/api/payments/verify`**: Upgrades users upon Razorpay callback verification.
- **`/api/applications`**: REST CRUD handler for the Job Application Tracker.
- **`/api/resumes`**: Saves, queries, and deletes recruiter analysis histories.

---

## 🛠️ Mobile Build Configurations

- **Java Environment**: Local compilations use Java 21 (`set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`) to align with modern JNI parameters.
- **Desktop Deliverables**:
  - **`ResumeIQ.apk`** (`C:\Users\edixb\OneDrive\Desktop\ResumeIQ.apk`): Direct install debug and testing binary.
  - **`ResumeIQ.aab`** (`C:\Users\edixb\OneDrive\Desktop\ResumeIQ.aab`): Production Android App Bundle for Google Play Console distribution.
- **Live URL**: **https://resume.kvai.in**
