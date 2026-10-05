FROM node:20-alpine AS builder

WORKDIR /app

# Copy the monorepo root package.json
COPY package.json ./
# Copy workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/crypto/package.json ./packages/crypto/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the api and dependencies
RUN npm run build --workspace=apps/api

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages ./packages

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/api"]
