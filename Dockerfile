# Build stage
FROM node:lts-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Create non-privileged user but run as root for port binding below 1024
# We'll configure Nginx properly instead of running as non-root

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure nginx can write to its directories even with read-only filesystem
RUN mkdir -p /var/cache/nginx /var/run \
    && chown -R nginx:nginx /var/cache/nginx /var/run

# Remove default Nginx configuration
RUN rm -f /etc/nginx/conf.d/default.conf.default

# Expose port
EXPOSE 80

# Use bash as shell to fix health check issues
RUN apk add --no-cache bash curl

# Add health check script
RUN echo '#!/bin/bash\ncurl -f http://localhost:80/ || exit 1' > /usr/local/bin/healthcheck.sh \
    && chmod +x /usr/local/bin/healthcheck.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]