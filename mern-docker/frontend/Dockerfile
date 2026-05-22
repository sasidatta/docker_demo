# Build stage
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VERSION=dev
ARG PRIMARY_COLOR=#111827
ENV VITE_APP_VERSION=$VERSION
ENV VITE_PRIMARY_COLOR=$PRIMARY_COLOR
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
