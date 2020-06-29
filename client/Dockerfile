FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
# RUN rm /etc/nginx/conf.d/examplessl.conf

COPY dist/client /usr/share/nginx/html
COPY nginx /etc/nginx/conf.d

EXPOSE 80
