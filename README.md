## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/en/download) (Includes NPM)
- **Git** - [Download here](https://git-scm.com/downloads) (includes Git Bash for Windows)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/mohammed-ullah/Playwright-Demo.git
cd SR-Project
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

```bash
npm run test:all                    # Run all tests (unit + E2E)
npm run test:e2e                    # Run E2E tests (headless)
npx playwright test --headed        # Run E2E tests with visible browser
npx playwright show-report          # View detailed test report
```

## Test Location

The main test file is located at:
```
tests/e2e/StandardBattingFilter.spec.js
```

## CI/CD Process

### Branch Protection Strategy
- `main` branch is protected - no direct commits allowed
- All changes must go through Pull Request workflow
- Development workflow: feature/release branch → PR → main

### GitHub Actions Automation
- Pull requests to `main` automatically trigger GitHub Actions workflows
- Automated status checks execute in parallel:
  - **ESLint**: Code quality and style enforcement
  - **E2E Tests**: Full Playwright test suite execution
  - **Jest Unit Tests**: Component and utility function testing
- All status checks must pass (green) before merge is allowed
- Failed checks block merge and require fixes before proceeding

### Quality Gates
- Prevents broken code from reaching production
- Ensures consistent code standards across team
- Maintains test coverage and reliability
- Automated feedback loop for developers
