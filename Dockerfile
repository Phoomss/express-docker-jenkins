#Build stage for development and testing
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Production stage for production development
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean.--force

COPY --from=builder /app/dist ./dist 

EXPOSE 3000

CMD [ "npm","start" ]
