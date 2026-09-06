# Contributing to Campus OS

Thank you for your interest in contributing to **Campus OS**! We welcome contributions from developers, designers, educators, and students to build the next-generation Student Operating System.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all interactions within issues, pull requests, and discussions.

---

## How Can I Contribute?

You can contribute in many ways:
- **Reporting Bugs**: Open an issue describing the bug, steps to reproduce, and environment details.
- **Suggesting Features**: Share ideas for new focus pillars, administrative analytics, or AI mentor capabilities.
- **Improving Documentation**: Fix typos, add explanations, or clarify setup steps.
- **Submitting Code**: Fix open issues or implement approved enhancements.

---

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/[your-username]/Campus-OS-.git
cd Campus-OS-
```

### 2. Set Up the Environment
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Run database migrations:
   ```bash
   npm run db:migrate
   ```

### 3. Branching Convention
Create a descriptive branch for your work:
- `feat/feature-name` for new features
- `fix/bug-description` for bug fixes
- `docs/documentation-update` for documentation changes
- `refactor/clean-up` for code refactoring

```bash
git checkout -b feat/add-new-focus-track
```

### 4. Code Standards
- **TypeScript**: Strict typing without `any` wherever possible.
- **Frontend Components**: Functional React components with hooks, formatted with clean Tailwind CSS utility classes.
- **Backend Handlers**: Parameterized PostgreSQL queries to avoid SQL injection.
- **Linting**: Ensure code passes type checks before committing:
  ```bash
  npm run lint
  ```

### 5. Verification
Run the automated verification suite to confirm that core systems remain functional:
```bash
npx tsx scripts/verify_e2e.ts
npx tsx scripts/verify_focus_pillars.ts
```

### 6. Commit Messages
Write clear, conventional commit messages:
```
feat(student): add interactive semester progress visualizer
fix(auth): handle expired JWT tokens gracefully
docs(readme): add troubleshooting section for Supabase connection
```

### 7. Creating a Pull Request
1. Push your branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Navigate to the repository on GitHub and open a Pull Request against the `main` branch.
3. Provide a clear summary of your changes, screenshots for visual updates, and link any related issues.

---

## Questions or Support

If you have questions or encounter setup issues, feel free to open a GitHub Discussion or submit an issue.
