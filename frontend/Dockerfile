FROM node:18-alpine as build
WORKDIR /app
# copy package.json and yarn.lock (if present)
COPY package.json yarn.lock* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi
COPY . .
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]