# ResumeIQ - Complete AI Career Intelligence Platform

ResumeIQ is a premium, high-performance career intelligence platform built for Web & Android. It transcends traditional ATS checkers by providing a complete ecosystem to score, write, optimize, track, and export recruiter-grade resumes.

---

## 🚀 Core Platform Features

### 1. Interactive Resume Builder
- **Dynamic Previews**: Edit fields in real-time and see immediate changes in the preview layout.
- **Custom Stylings**: Toggle between premium font families (`font-sans`, `font-serif`, `font-mono`), color themes (`indigo`, `rose`, `emerald`, `amber`, `slate`), and spacing margins (`compact`, `normal`, `loose`).
- **3D Glassmorphic Cards**: Beautiful translucent dark card layouts (`bg-[#0e1322]/80 border-slate-800/80 shadow-xl`) with smooth hover state enhancements.
- **Sleek Inputs & Textareas**: Completely customized text fields, bullet textareas, and select drop-down selectors to ensure an integrated, futuristic editing interface.
- **ATS-Safe Templates**: Clean, grid-based layouts designed according to executive recruitment practices.
- **Print Optimization**: Automatic print styling hides menus, layout controls, and navbars. Removes scrolling restrictions to produce clean, page-truncated PDFs.
- **Inline Flow Navigation**: Integrated step-by-step Back and Next buttons at the bottom of the editor to guide users seamlessly.
- **Mobile Responsive Switcher**: A segmented view controller allows mobile/tablet users to switch between the **Editor Form** and the **Resume Preview** easily. Button sizes and tap targets are optimized to be thumb-friendly.
- **Custom Placeholders**: All inputs render clear example placeholder text (e.g. `e.g. John Doe` or `e.g. Software Engineer`) to guide inputs.

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
- **Visual Monograms**: Dynamically generates minimal, colorful vector-like initials badges for each tracked company.

### 4. Recruiter-Grade AI Analyzer
- **20+ Metrics Evaluation**: Deep analysis of formatting, contact presence, vocabulary, metrics quantification, and redundant statements.
- **Explainable Scoring**: Clear feedback on recruiter appeal, skills density, and content clarity.
- **Upskilling Path**: Automatic 90-day plan indicating certification targets and required projects.

### 5. Passwordless Email OTP Login
- **Only Email OTP Authentication**: Simplified and secure authentication. Google and GitHub sign-in buttons have been completely removed.
- **Seamless Auth**: Generates a 6-digit OTP code log stored in the database.
- **Unified Portal Access**: OTP verification is integrated into both the builder checkout flow and the main `/signin` portal page.
- **Resend Integration**: Sends dynamic, styled account verification emails directly to the user's inbox via Resend. Support custom sender domains via `RESEND_FROM_EMAIL` environment variable.
- **Auto-Account Creation**: Automatically provisions User accounts on the fly when verification succeeds.

### 6. Free Resume Exports (Bypassed Billing)
- **Free PDF Downloads**: The Razorpay billing check is bypassed for now, allowing users to export PDF resumes completely for free.
- **Preserved Code Blocks**: Razorpay order verification code is kept intact but commented out inside the codebase for future billing launches.

### 7. Interactive Admin Panel (`/admin`)
- **System Monitoring**: Live counters for total accounts, paid transactions, revenue generated, and OTPs issued.
- **Live Logs Tables**: Real-time view of recently sent verification codes and successful transactions.

### 8. Premium Mobile Experience
- **Fluid WebView**: Wraps the live site in a high-speed container with top status bar safe area paddings.
- **Brand Splash Screen**: Glowing logo badge displaying "build by kvai.in" at the bottom with a 2.5-second load timer.
- **Minimal Flat App Icon**: High-end flat vector logo design featuring an overlapping document sheet and smart lightning bolt, mapped across the website favicons and mobile app configs.

---

## 🗺️ Application Routing Index

### Web Routes (Frontend & Backend Pages)
- **`/`**: Premium Landing Page.
- **`/builder`**: Interactive builder workspace, styling customizer, and job optimization tab.
- **`/dashboard`**: Workspace showing saved analysis scorecards and the One-click Apply Tracker.
- **`/admin`**: Dark-themed monitoring terminal.
- **`/signin`**: Unified gateway supporting secure passwordless Email OTP verification.
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
