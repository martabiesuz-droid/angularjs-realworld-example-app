# Stage 1: build the Angular app
FROM node:22-alpine AS build
WORKDIR /app
COPY app/conduit/package.json app/conduit/package-lock.json ./
RUN npm ci
COPY app/conduit/ ./
RUN npm run build

# Stage 2: serve the built app with nginx
FROM nginx:alpine
COPY --from=build /app/dist/conduit/browser/ /usr/share/nginx/html/
EXPOSE 80
