FROM node:lts
WORKDIR /src
ADD . /src/
RUN npm run build

FROM node:lts
WORKDIR /src
ADD . /src/
RUN npm install
COPY --from=0 /src/web/dist/spa /src/web/dist/spa
ENV EGG_SERVER_ENV=local
CMD npm run docker