## Installation

1. Clone this repository:
```bash
git clone https://github.com/mohammed-ullah/phillies-batting-tests.git
cd phillies-batting-tests
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Test Location

The main test file is located at:
```
tests/e2e/StandardBattingFilter.spec.js
```

## CI/CD Process

- `main` branch is protected - no direct commits allowed
- Development workflow: feature/release branch → PR → main
- Automated status checks run on merge to main:
  - ESLint code quality checks
  - E2E test execution
  - Jest unit tests
- All checks must pass before merge completion
