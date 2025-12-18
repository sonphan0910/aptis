# Tests

## Structure

```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for API endpoints
└── fixtures/       # Test data and fixtures
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/unit/services/scoringService.test.js

# Watch mode
npm test -- --watch
```

## Test Framework

- **Jest**: Testing framework
- **Supertest**: HTTP assertions
- **faker**: Generate test data

## Writing Tests

### Unit Test Example
```javascript
const { scoreMultipleChoice } = require('../../src/services/ScoringService');

describe('ScoringService', () => {
  describe('scoreMultipleChoice', () => {
    it('should return true when answer is correct', () => {
      const result = scoreMultipleChoice(1, 1);
      expect(result).toBe(true);
    });
    
    it('should return false when answer is incorrect', () => {
      const result = scoreMultipleChoice(1, 2);
      expect(result).toBe(false);
    });
  });
});
```

### Integration Test Example
```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@aptis.com',
          password: 'Admin@123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

## Test Coverage Goals

- Unit tests: 80%+ coverage
- Integration tests: All API endpoints
- Critical paths: 100% coverage (scoring, authentication, payment)

## TODO

- [ ] Setup Jest configuration
- [ ] Write unit tests for services
- [ ] Write integration tests for API endpoints
- [ ] Add E2E tests for critical workflows
- [ ] Setup CI/CD pipeline with test automation
