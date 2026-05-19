FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
