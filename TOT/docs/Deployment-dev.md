# Setting Up and Running a Node.js Express Server with OpenSSL for Local Development

## Prerequisites
- Ensure you have [Node.js](https://nodejs.org/) installed.
- Ensure you have [OpenSSL](https://www.openssl.org/) installed.
- A React app with a `server/` folder containing `index.js`.

---

## Steps to Set Up and Run the Server

### 1. Clone the Repository
```sh
# Replace <your-repo-url> with the actual repository URL
git clone <your-repo-url>
cd <your-repo-name>
```

### 2. Navigate to the Server Directory
```sh
cd server
```

### 3. Install Dependencies
```sh
npm install
```

### 4. Start the Development Server
```sh
npm run dev
```

### 5. Run the Express Server Manually
```sh
node server index.js
```

---

## Setting Up OpenSSL for Local HTTPS

### 6. Generate a Self-Signed SSL Certificate
Run the following command inside the `server/` directory:
```sh
openssl req -nodes -new -x509 -keyout server.key -out server.crt
```
- Follow the prompts and enter the required information (Country, State, Organization, etc.).
- This generates `server.key` (private key) and `server.crt` (certificate) files in the current directory.

### 7. Modify `.env` to Use HTTPS (If Not Already Configured)
Ensure your Express server uses HTTPS:
```dotenv
REACT_APP_BASE_URL=https://localhost:3001
```

### 8. Run the Server with HTTPS
```sh
node index.js
```
Now, your Express server should be running with HTTPS at `https://localhost:3001/`.

---

## Notes
- If you see an SSL warning in your browser, it's because the certificate is self-signed.
- You can add the `server.crt` certificate to your system's trusted certificates to bypass this warning.
- Use a `.gitignore` file to exclude `server.key` from version control for security reasons.

