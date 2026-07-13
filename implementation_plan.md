# Implementation Plan — End-to-End Product Completion (v2)

We will implement the remaining features from the Master PRD v2, focusing on custom Email OTP logins, Razorpay transaction logging, SEO optimization, and an Admin dashboard.

## Proposed Changes

### Database schema
#### [MODIFY] [schema.prisma](file:///c:/Users/edixb/OneDrive/Desktop/github/resume-iq/prisma/schema.prisma)
- Add `OtpLog` table to log and verify 6-digit verification codes.
- Add `Payment` table to persist Razorpay transactions (UPI, cards, wallet records).
- Add relations to the `User` model.

### NextAuth configuration
#### [MODIFY] [auth.ts](file:///c:/Users/edixb/OneDrive/Desktop/github/resume-iq/src/auth.ts)
- Add NextAuth `Credentials` provider for Email OTP authentication.
- Update session strategy to `"jwt"` for database adapter compatibility with Credentials.

### API Routes
#### [NEW] [route.ts](file:///c:/Users/edixb/OneDrive/Desktop/github/resume-iq/src/app/api/auth/otp/send/route.ts)
- Generate a 6-digit random code, store it in `OtpLog`, and return a mock success response (printing code to console/logs for local testing).
#### [NEW] [route.ts](file:///c:/Users/edixb/OneDrive/Desktop/github/resume-iq/src/app/api/payments/verify/route.ts)
- Accept Razorpay transaction parameters and create a `Payment` record in the database for tracking.

### UI & Flow Updates
#### [MODIFY] [page.tsx](file:///c:/Users/edixb/OneDrive/Desktop/github/resume-iq/src/app/builder/page.tsx)
- Replace the Google-only login modal with a dynamic, premium Email OTP Login modal:
  1. User enters Email.
  2. Clicks "Send OTP" -> hits `/api/auth/otp/send`. Displays code on-screen for testing.
  3. User enters 6-digit code.
  4. Clicks "Verify" -> calls NextAuth `signIn("credentials", { email, code })`.
- Link checkout payment success directly to the verification endpoint to create a `Payment` db record before printing/download.
- Add custom color selections, spacing, and margining controls to the sidebar editor.

### Admin Dashboard & Analytics
#### [NEW] [page.tsx](file:///c:/Users/edixb/OneDrive/Desktop/github/resume-iq/src/app/admin/page.tsx)
- Create a beautiful dark-themed Admin Panel dashboard displaying key stats:
  - Total users, payments, and generated resumes.
  - Interactive table of OTP Verification logs.
  - Interactive table of payment history and status.
  - Admin quick controls.

## Verification Plan

### Automated Checks
- Run `npm run build` to verify Next.js/Prisma schemas compile without errors.
- Run `npm run lint` to ensure zero ESLint/TS check failures.
