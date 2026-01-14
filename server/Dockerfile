FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including tsx for runtime)
RUN npm ci --omit=dev

# Copy Prisma schema and config
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client (need a dummy DATABASE_URL for generation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 3001

# Start server with tsx
CMD ["npm", "start"]
