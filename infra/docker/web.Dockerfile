FROM node:20-alpine AS builder

WORKDIR /app

# Copy the monorepo root package.json
COPY package.json ./
# Copy workspace package.json files
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/crypto/package.json ./packages/crypto/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the web app
RUN npm run build --workspace=apps/web

# Production image
FROM nginx:alpine

# Copy built assets to Nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy custom Nginx config for Single Page Application routing
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
