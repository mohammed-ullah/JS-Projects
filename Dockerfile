FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx playwright install

ENV CI=true
ENV PWTEST_SKIP_TEST_OUTPUT=1

RUN mkdir -p test-results

CMD ["npm", "test"]