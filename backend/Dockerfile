# ---- Builder Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Install all dependencies, including devDependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Command to run migrations and start the app
# Render will use this command to start the service.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
