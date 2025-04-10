FROM node:20-alpine as prodBackendExpress

ENV NODE_ENV=production

ENV PORT=3000

WORKDIR /app

COPY package*.json .

RUN npm install --production

COPY . .

CMD ["npm", "run", "start:prod"]

