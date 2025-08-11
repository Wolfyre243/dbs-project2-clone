# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=23.1.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
# ENV NODE_ENV production

USER root

WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies including devDependencies (needed for Prisma CLI)
RUN npm ci

# Copy prisma schema first for generation
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source files into the image.
COPY . .

# Run the application as a non-root user.
# USER node

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm run start
