FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["/bin/sh", "-c", "\
  npx prisma migrate deploy && \
  npx prisma db seed || true && \
  npm start \
"]