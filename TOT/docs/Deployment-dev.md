# Step 1: Update Webpack Configuration for HTTPS

To enable SSL in your Webpack development server, modify `webpack.dev.js` as follows:

## **1. Modify `webpack.dev.js`**
Replace your `devServer` configuration with this:

```js
const { merge } = require('webpack-merge');
const commonConfiguration = require('./webpack.common.js');
const ip = require('internal-ip');
const portFinderSync = require('portfinder-sync');
const Dotenv = require('dotenv-webpack');
const fs = require('fs');
const path = require('path');

const infoColor = (_message) => {
    return `[1m[34m${_message}[39m[22m`;
};

// Load SSL certificates
const httpsOptions = {
    key: fs.readFileSync(path.resolve(__dirname, '../server.key')),
    cert: fs.readFileSync(path.resolve(__dirname, '../server.crt'))
};

module.exports = merge(commonConfiguration, {
    mode: 'development',
    devServer: {
        host: '0.0.0.0', // Bind to all available network interfaces
        port: portFinderSync.getPort(8080),
        static: './dist',
        watchFiles: ['src/**/*'],
        open: true,
        https: httpsOptions,  // Enable HTTPS with SSL certificates
        allowedHosts: 'all',
        client: {
            overlay: true,
        },
        onListening: function(devServer) {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            const port = devServer.server.address().port;
            const localIp = ip.v4.sync();
            const domain1 = `https://${localIp}:${port}`;
            const domain2 = `https://localhost:${port}`;

            console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`);
        }
    },
    plugins: [new Dotenv()]
});
```

## **2. Save the Changes**
Ensure `server.crt` and `server.key` exist in your **project root**.

# Step 2: Install Required Dependencies

To ensure your Webpack development server runs properly with HTTPS, install the required packages.

## **1. Install Dependencies**
Run the following command in your project root:

```sh
npm install internal-ip portfinder-sync dotenv-webpack --save-dev
```

This ensures:
- `internal-ip` gets your local IP address.
- `portfinder-sync` helps find an available port.
- `dotenv-webpack` loads environment variables.

# Step 3: Start the Development Server

Now that Webpack is configured with SSL, start the server:

```sh
npm run dev
```

If everything is set up correctly, you should see output like:

```
Project running at:
  - https://192.168.X.X:8080
  - https://localhost:8080
```

# Step 4: Access the App from Other Devices

Once your server is running, access your React app on any device in the same network.

## **1. Find Your Local IP Address**
Run:

```sh
ipconfig # Windows
ifconfig | grep "inet " # macOS/Linux
```

Example result:
```
192.168.1.100
```

## **2. Open the App on Another Device**
In a browser, enter:

```
https://192.168.1.100:8080
```

⚠️ **Note**: If you see a security warning, it's because the SSL certificate is self-signed. Move to **Step 5** to fix this.

# Step 5: Trust the Self-Signed Certificate

Since we are using a self-signed certificate, browsers may flag it as **"Not Secure"**. Follow these steps to trust it:

## **Windows**
1. Double-click `server.crt`.
2. Click **Install Certificate**.
3. Choose **Trusted Root Certification Authorities**.
4. Restart your browser.

## **macOS**
1. Open **Keychain Access**.
2. Drag `server.crt` into the **System** keychain.
3. Right-click → **Get Info** → Change **When using this certificate** to **Always Trust**.
4. Restart your browser.

## **Mobile Devices**
- Download and install the certificate manually.

Now your browser should accept the SSL connection without warnings! 🚀

# Step 6: Troubleshooting "Connection Refused" Issue

If you are unable to access your development server from another computer on the same network, follow these steps:

## **1. Get Your Local Network IP**
Run:

```sh
ipconfig # Windows
ifconfig | grep "inet " | grep -v 127.0.0.1 # macOS/Linux
```

Look for your **IPv4 Address** (e.g., `192.168.1.100`).

## **2. Update Your .env File**
Modify your `.env` file:

```env
# Change from this:
REACT_APP_BASE_URL=https://localhost:3001

# To this (Replace with your actual network IP)
REACT_APP_BASE_URL=https://192.168.1.100:3001
```

## **3. Modify Your React Server Host**
Ensure React runs on `0.0.0.0` in `package.json`:

```json
"scripts": {
  "start": "react-scripts start --host 0.0.0.0"
}
```

Or for **Vite**, in `vite.config.js`:

```js
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: true
  }
});
```

## **4. Update Express Server (server.js)**
Modify `spdy.createServer`:

```js
spdy.createServer(options, app).listen(PORT, '0.0.0.0', (err) => {
```
## **5. Restart Everything**
```sh
npm start  # Restart React app
node server.js  # Restart backend server
```

Now try accessing:

```
https://192.168.1.100:3001
```

🚀 Your app should now be accessible from another computer on the same network!
