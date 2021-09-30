#!/bin/bash

# Certificates exist
if [ -d /etc/letsencrypt/live/circles.bacasable.toulouse-epsi.fr ]; then
  # Check certificates and renew them
  certbot renew --http-01-port=380
  # Concatenate certificates
  . /etc/scripts/concatenate-certificates.sh
  # Update certificates in HAProxy
  . /etc/scripts/update-haproxy-certificates.sh
# Certificates don't exist
else
  #  Execute certificate creation script
  . /etc/scripts/create-certificates.sh
fi
