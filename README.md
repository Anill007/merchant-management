# Merchant Management Application

A modern, responsive merchant onboarding and lifecycle management portal where administrators and reviewers can manage merchants, review registration applications, and oversee document verification workflows.

---

## 📌 Overview & User Types

The application supports three distinct user personas with granular role-based permissions:

1. **Admin**: Has full administrative privileges (`merchant.read`, `merchant.create`, `merchant.update`, `merchant.delete`, `merchant.review`). Can manage all merchants, assign/reassign reviewers to specific applications, and approve or reject submissions.
2. **Reviewer**: Focused on evaluation (`merchant.read`, `merchant.review`). Can inspect merchant profiles, review submitted compliance documents, and approve or reject applications assigned to them.
3. **Sales / User**: Focused on onboarding (`merchant.create`, `merchant.update`, `merchant.delete`). Can initiate new merchant profiles, enter business and financial details, upload required compliance documents, and submit applications for review.

---

## 🔄 Application Use Case Scenario

1. **Application Submission (Sales)**:
   - Sales representative logs in and navigates to the multi-step application form.
   - Fills in merchant profile information, contact details, business entity information, and banking details.
   - Uploads required verification documents (PAN / Tax certificates, Business Registration, Address Proof, Bank Statements).
   - Submits the application, setting its initial status for review.

2. **Reviewer Assignment (Admin)**:
   - Admin monitors the applications queue in the review table.
   - Admin assigns specific reviewers to each application via the interactive inline reviewer dropdown (accessible only to Admins).

3. **Application Review & Decision (Reviewer & Admin)**:
   - Reviewer or Admin opens the detailed application in review mode.
   - Inspects submitted details and verifies compliance documents.
   - Approves or rejects the application, updating the application status across the system.

---

## 🧪 Application Flow Testing & Credentials

The application includes predefined mock user credentials for rapid end-to-end testing of the role-based workflows:

| Role | Email | Password | Allowed Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `admin1` | Read, Create, Update, Delete, Review, Assign Reviewers |
| **Reviewer 1** | `reviewer1@test.com` | `reviewer1` | Read, Review (Approve / Reject) |
| **Reviewer 2** | `reviewer2@test.com` | `reviewer2` | Read, Review (Approve / Reject) |
| **Sales 1** | `sales1@test.com` | `sales1` | Create, Update, Delete Applications |
| **Sales 2** | `sales2@test.com` | `sales2` | Create, Update, Delete Applications |

---

## 🛠️ Implementation Details & Architecture

### Technology Stack
- **Frontend Framework**: Angular 22 (Standalone Components, Signals, Reactive Forms)
- **UI Components & Styling**: Angular Material 22 (Stepper, Table, Form Fields, Dialogs, Chips, Icons) + SCSS
- **State & Data Management**: Angular Signals, RxJS, Mock data service (`app-mock.ts`)
- **Backend & Auth**: Node.js & Express (`backend/server.js`) with JSON Web Tokens (`jsonwebtoken`, HMAC SHA-256)
- **HTTP Client**: Angular HTTP Client with `auth.interceptor.ts` injecting Bearer tokens

### Key Technical Features Implemented
- **Role-Based Access Control (RBAC)**:
  - Route guards (`authGuard`, `permissionGuard`) preventing unauthorized route access.
  - Custom structural directive (`*appElementHasPermission`) for granular button and action visibility.
- **Dynamic Application Workflow Modes**:
  - `create`: Multi-step stepper wizard for creating new applications.
  - `edit`: Prefilled form for updating application details.
  - `review`: Read-only audit view for reviewers and admins to inspect documents and issue decisions.
- **Interactive Review Table**:
  - Angular Material Table with pagination, column sorting, search filtering, and status badges.
  - Admin-only inline reviewer assignment dropdown with instant state synchronization.
- **Document Upload Simulation**:
  - Multi-file upload handlers supporting PDF, TXT, and image verification with file size and type validation.

---

## 📁 Project Structure

```
merchant-management/
├── backend/
│   └── server.js                  # Express mock JWT authentication & reviewer API
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── auth/              # AuthService, AuthGuard, PermissionGuard, Interceptor
│   │   ├── directives/            # Permission-based UI directives (*appElementHasPermission)
│   │   ├── features/
│   │   │   └── shared/
│   │   │       ├── application-create/  # Multi-step creation & review form (stepper)
│   │   │       ├── application-review/  # Application management data table
│   │   │       ├── header/              # Navigation bar, user profile, logout
│   │   │       ├── login/               # Authentication page
│   │   │       └── page-404/            # Not found fallback view
│   │   ├── mock-data/
│   │   │   └── app-mock.ts        # Seed data for merchant applications and documents
│   │   ├── app.routes.ts          # Application routing definitions
│   │   └── app.config.ts          # Application providers and HTTP configuration
│   └── styles.scss                # Global styles and Material theme tokens
├── angular.json                   # Angular workspace configuration
├── package.json                   # Project dependencies and npm scripts
└── README.md                      # Project documentation
```

---

## 🚀 How to Run the Project

The application requires running both the mock backend API and the Angular development server in separate terminals.

### 1. Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Backend API (Port 5000)
In your first terminal:
```bash
node backend/server.js
# Or via npm script:
npm run server
```
*Note: The mock backend server runs on `http://localhost:5000` (serving `/api/auth/login`, `/api/auth/me`, `/api/auth/permissions`, and `/api/auth/reviewers`).*

### 4. Start the Frontend Development Server (Port 4200)
In your second terminal:
```bash
ng serve
# Or via npm script:
npm start
```
Navigate your browser to `http://localhost:4200/`. The application will automatically reload if you change any source files.


## 🤖 AI Assistance Acknowledgment

AI assistance was utilized during the development of this project:
- **Google Gemini 3.8 Flash** and **Antigravity** were used for code generation, architectural design, debugging, design implementation, refactoring, and iterative UI improvements.
- Readme updated and expanded by **Antigravity** after the first draft created by project admin.