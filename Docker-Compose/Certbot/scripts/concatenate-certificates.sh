#!/bin/bash

if [ -f /etc/letsencrypt/live/circles.bacasable.toulouse-epsi.fr/fullchain.pem -a -f /etc/letsencrypt/live/circles.bacasable.toulouse-epsi.fr/privkey.pem ]; then
  cat /etc/letsencrypt/live/circles.bacasable.toulouse-epsi.fr/fullchain.pem /etc/letsencrypt/live/circles.bacasable.toulouse-epsi.fr/privkey.pem > /etc/certificates/circles.bacasable.toulouse-epsi.fr.pem
fi