FROM node:16

WORKDIR /usr/src/app
EXPOSE 3000

COPY . .
# aws secrets must be fetched and saved to local file beforehand
# COPY .env.aws.local /usr/src/app/.env

RUN npm ci
# copy packages from host
RUN npm run build

CMD npm run preview --host
