# ---- Build Stage ----
    FROM node:lts-alpine AS build

    # Set working directory
    WORKDIR /app
    
    # Add build labels for better traceability
    LABEL stage=builder
    LABEL org.opencontainers.image.source="https://github.com/flowcus-tracker/flowcus-web"
    LABEL org.opencontainers.image.description="Build stage"
    
    # Add package files first to leverage Docker layer caching
    COPY package*.json ./
    
    # Install dependencies (use clean install for reproducible builds)
    RUN npm ci
    
    # Copy the rest of the code
    COPY . .
    
    # Build the app
    RUN npm run build
    
    # ---- Production Stage ----
    FROM nginx:stable-alpine
    
    # Add production labels
    LABEL org.opencontainers.image.authors="waheedullahkhan001"
    LABEL org.opencontainers.image.vendor="waheedullahkhan001"
    LABEL org.opencontainers.image.title="Vite React Application"
    LABEL org.opencontainers.image.description="Production image"
    
    # Set build arguments with defaults
    ARG BUILD_VERSION=unknown
    ARG NODE_ENV=production
    
    # Set environment variables
    ENV NODE_ENV=${NODE_ENV} \
        BUILD_VERSION=${BUILD_VERSION}
    
    # Copy custom nginx configuration
    COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy built files from build stage
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Add healthcheck
    HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
      CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
    
    # Create a non-root user to run Nginx
    RUN addgroup -g 1001 -S app && \
        adduser -S -D -H -u 1001 -h /usr/share/nginx/html -s /sbin/nologin -G app app && \
        chown -R app:app /usr/share/nginx/html && \
        chown -R app:app /var/cache/nginx && \
        chown -R app:app /var/log/nginx && \
        touch /var/run/nginx.pid && \
        chown -R app:app /var/run/nginx.pid && \
        rm /etc/nginx/conf.d/default.conf.default || true
    
    # Switch to non-root user
    USER app
    
    # Expose port
    EXPOSE 80
    
    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]