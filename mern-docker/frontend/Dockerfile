FROM nginx:stable-alpine

# Copy static files into Nginx html folder
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
