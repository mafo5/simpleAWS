#!/usr/bin/env sh
set -e

sed -i "s|API_HOST|$API_HOST|g" /etc/nginx/conf.d/default.conf
cat /etc/nginx/conf.d/default.conf

exit 0
