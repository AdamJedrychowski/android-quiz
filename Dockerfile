# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package*.json ./

# Copy frontend and backend directories
COPY frontend ./frontend
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Copy backend source and built frontend
COPY backend/src ./backend/src
COPY backend/prisma ./backend/prisma
COPY backend/tsconfig.json ./backend/
COPY backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

# Install production dependencies only
WORKDIR /app/backend
RUN npm ci --omit=dev

# Create database directory
RUN mkdir -p /app/backend/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the backend server
CMD ["npm", "start"]
