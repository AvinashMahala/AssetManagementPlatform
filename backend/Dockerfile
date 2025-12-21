FROM node:18-alpine
WORKDIR /app
# copy package.json and yarn.lock (if present)
COPY package.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi
COPY . .
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi
EXPOSE 5000
CMD if [ -f yarn.lock ]; then yarn start; else npm start; fi