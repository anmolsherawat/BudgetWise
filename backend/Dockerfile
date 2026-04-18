# Use the official Node.js 18 image as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production to save space)
RUN npm ci --only=production

# Copy the rest of the backend files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the default Hugging Face space port (7860) or fallback to 5000
EXPOSE 7860

# Command to run the application
CMD ["node", "server.js"]
