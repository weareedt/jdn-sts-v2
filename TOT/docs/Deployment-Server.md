# Step 1: Clone the Repository

## Description:
This step ensures that you retrieve your React project from a Git repository and place it in the appropriate directory for deployment.

## Instructions:

1. Update your package lists:

    ```bash
    sudo apt update
    ```

2. Install Git if it is not already installed:

    ```bash
    sudo apt install git -y
    ```

3. Navigate to the directory where your application files will be stored:

    ```bash
    cd /var/www
    ```

4. Clone your Git repository into `/var/www/myapp`:

    ```bash
    git clone https://your-git-repository-url.git myapp
    ```

5. Navigate to the cloned repository:

    ```bash
    cd /var/www/myapp
    ```

# Step 2: Install Node.js, Set Up Environment Variables, and Build React App

## Description:
React applications need dependencies installed and must be built into static files before serving with Apache. We will also configure environment variables.

## Instructions:

1. Update your package lists:

    ```bash
    sudo apt update
    ```

2. Install Node.js and npm:

    ```bash
    sudo apt install nodejs npm -y
    ```

3. Navigate to the project directory:

    ```bash
    cd /var/www/myapp
    ```

4. Install all dependencies:

    ```bash
    npm install
    ```

5. Copy the environment file template:

    ```bash
    cp .env.example .env
    ```

6. Open the `.env` file and configure it with the correct values:

    ```bash
    nano .env
    ```

7. Save and exit the file after making changes.

8. Build the application:

    ```bash
    npm run build
    ```

The build files will be created in `/var/www/myapp/build`.

# Step 3: Install and Start Apache Web Server

## Description:
Apache is required to serve the React application as a static website.

## Instructions:

1. Install Apache:

    ```bash
    sudo apt install apache2 -y
    ```

2. Start and enable Apache:

    ```bash
    sudo systemctl start apache2
    sudo systemctl enable apache2
    ```

3. Check the status of Apache:

    ```bash
    sudo systemctl status apache2
    ```

# Step 4: Configure Apache to Serve React Application

## Description:
Apache needs to be configured to serve the built React files as a static website.

## Instructions:

1. Copy the React build files to Apache's root directory:

    ```bash
    sudo cp -r /var/www/myapp/build/* /var/www/dist/
    ```

2. Create a new Apache configuration file:

    ```bash
    sudo nano /etc/apache2/sites-available/myapp.conf
    ```

3. Add the following configuration:

    ```apacheconf
    <VirtualHost *:80>
        ServerName your-domain.com
        DocumentRoot /var/www/dist

        <Directory /var/www/dist>
            Options Indexes FollowSymLinks
            AllowOverride All
            Require all granted
        </Directory>

        ErrorLog ${APACHE_LOG_DIR}/myapp_error.log
        CustomLog ${APACHE_LOG_DIR}/myapp_access.log combined
    </VirtualHost>
    ```

4. Save and exit the file.

5. Disable the default site and enable the new configuration:

    ```bash
    sudo a2dissite 000-default.conf
    sudo a2ensite myapp.conf
    ```

6. Enable Apache's rewrite module:

    ```bash
    sudo a2enmod rewrite
    ```

7. Restart Apache:

    ```bash
    sudo systemctl restart apache2
    ```

Your React app should now be available at `http://your-domain.com`.

# Step 5: Secure the Website with SSL Using Certbot

## Description:
SSL certificates encrypt traffic to and from your website. Certbot automates the SSL certificate installation.

## Instructions:

1. Install Certbot and the Apache plugin:

    ```bash
    sudo apt install certbot python3-certbot-apache -y
    ```

2. Obtain an SSL certificate:

    ```bash
    sudo certbot --apache -d your-domain.com
    ```

3. Follow the prompts to complete SSL installation.

4. Test the renewal process:

    ```bash
    sudo certbot renew --dry-run
    ```

Certbot will automatically renew the certificate when it expires.

# Step 6: Restart Apache and Verify Deployment

## Description:
Ensure that all services are running correctly and that the website is accessible over HTTPS.

## Instructions:

1. Restart Apache:

    ```bash
    sudo systemctl restart apache2
    ```

2. Open a browser and visit:

    - `http://your-domain.com` (Should redirect to HTTPS)
    - `https://your-domain.com`

3. If there are any issues, check the Apache logs:

    ```bash
    sudo journalctl -u apache2 --no-pager | tail -n 50
    ```

Your React application is now fully deployed and secured with SSL.

# Step 7: Deploy the backend server

## Description:
Ensure that all services are connecting through apis and bypassing CORS in development

## Instructions:

1. Open file ssl conf file from certbot and add this line to the file

   ```bash
   sudo nano /etc/apache2/sites-available/myapp-ssl.conf
   ```
   
   ```apacheconf
   # Proxy settings to forward API requests to Express backend
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass /api http://127.0.0.1:3001/api retry=0 timeout=60 Keepalive=On
    ProxyPassReverse /api http://127.0.0.1:3001/api
   ```

2. Enable required module and restart the apache

   ```bash
   sudo a2enmod proxy proxy_http ssl rewrite
   sudo systemctl restart apache
   ```
3. Install ```pm2```
   ```bash
   npm install -g pm2
   ```
4. Make sure all the certs are in correct folder

   ```bash
   cd /var/www/myapp/server
   openssl req -nodes -new -x509 -keyout server.key -out server.crt
   ```

5. Run backend application using ```pm2```

   ```bash
   cd /var/www/myapp/server
   pm2 start server/index.js --name backend
   pm2 save
   pm2 startup
   ```
6. Make sure ```pm2``` running properly

   ```bash
   pm2 status
   pm2 logs backend
   ```
   