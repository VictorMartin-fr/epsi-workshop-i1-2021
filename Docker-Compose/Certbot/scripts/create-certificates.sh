#!/bin/bash

# Request certificates
certbot certonly --standalone \
  --non-interactive --agree-tos --email victor.martin3@epsi.fr --http-01-port=380 \
  --cert-name circles.bacasable.toulouse-epsi.fr \
  -d circles.bacasable.toulouse-epsi.fr
# Concatenate certificates
. /etc/scripts/concatenate-certificates.sh
# Update certificates in HAProxy
. /etc/scripts/update-haproxy-certificates.sh