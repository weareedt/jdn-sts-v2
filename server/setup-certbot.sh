#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Install Certbot
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Obtain SSL certificate
echo "Obtaining SSL certificate for jdn-relay.hiroshiaki.online..."
certbot certonly --standalone \
    -d jdn-relay.hiroshiaki.online \
    --agree-tos \
    --non-interactive \
    --preferred-challenges http \
    --email admin@hiroshiaki.online

# Check if certificate was obtained successfully
if [ -d "/etc/letsencrypt/live/jdn-relay.hiroshiaki.online" ]; then
    echo "SSL certificate obtained successfully!"
    echo "Certificate location: /etc/letsencrypt/live/jdn-relay.hiroshiaki.online/"
    echo "You can now run the HTTPS server with: sudo node server/https-server.js"
else
    echo "Failed to obtain SSL certificate. Check the Certbot logs for details."
    exit 1
fi

# Set up auto-renewal
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "Setup complete! Your certificates will auto-renew when needed."
