
#stage 1, build

FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build --prod


#stage 2, serve with nginx

FROM nginx:alpine


WORKDIR /usr/share/nginx/html

RUN rm -rf ./*


# Copy built assets
COPY --from=builder /app/dist/halal-eats/browser /usr/share/nginx/html

# Copy our nginx config
COPY nginx.conf /etc/nginx/templates/default.conf.template



#COPY --from=builder /app/dist/halal-eats/browser .

#COPY nginx.conf /etc/nginx/conf.d/default.conf

#RUN envsubst '${PORT}' < /etc/nginx/nginx.conf > /etc/nginx/conf.d/default.conf

RUN chmod -R 755 /usr/share/nginx/html



EXPOSE 8080





CMD ["nginx", "-g", "daemon off;"]

