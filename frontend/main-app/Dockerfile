# Stage 1: Build the React Application
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
# In an actual deployment, use `npm install`
RUN npm ci || npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copy the built assets from Stage 1
COPY --from=builder /app/dist /srv

# Copy the local Caddyfile into the internal configuration target
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000
