FROM node:12-alpine

LABEL maintainer="Telefonica I+D"

ARG GITHUB_TOKEN

COPY . /opt

WORKDIR /opt

RUN yarn --production
RUN rm -f /opt/.npmrc

EXPOSE 3000

CMD [ "yarn", "start" ]