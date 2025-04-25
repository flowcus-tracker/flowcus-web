FROM nginx:alpine

# Copy the built files from the dist directory to nginx's serve directory
COPY ./dist /usr/share/nginx/html

# Copy a custom nginx config if you have one
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (matches the port in the GitHub Actions workflow)
EXPOSE 8080

# Update nginx config to listen on port 8080
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]