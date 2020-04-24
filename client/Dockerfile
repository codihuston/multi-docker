FROM node:alpine
WORKDIR './app'
COPY ./package.json ./
RUN npm install
COPY . .
# build the react app
RUN npm run build

# plug is app into an nginx container
# NOTE: this is a separate nginx service than the one defined in proj. root
# the point of using 2 copies of nginx is to:
# - if it were the case that we were to serve flat files here (instead of react)
# we would still need an nginx server to route traffic to our those assets...
# scrapping this nginx service would be a valid design choice
# - we could have 1 nginx server that routes to a prod react server and api
# server (i.e. we served the react app with the node http module, express, or
# apache/any other web server technology); our client image would have to
# reflect that...
FROM nginx
# expose this nginx service to the root nginx service (which on port 3000)
EXPOSE 3000
# copy over the nginx config from our client project
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy build into the directory in which they'll be served from this service
COPY --from=0 ./app/build ./usr/share/nginx/html
# no default cmd needed, since the base img configures this already