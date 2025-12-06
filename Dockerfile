FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps

COPY . .

EXPOSE 4001

CMD ["npm", "start"]
