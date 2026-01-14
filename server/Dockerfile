# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma client (need a dummy DATABASE_URL for generation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript (this will compile src/generated/prisma to dist/generated/prisma)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema, config and migrations
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

# Copy built files (includes compiled generated Prisma client)
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
