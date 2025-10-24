FROM node:23-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

##################

FROM base AS dev

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

##################

FROM base AS build

RUN npm install

COPY . .

RUN npm run build

##################

FROM nginx:alpine AS prod

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

