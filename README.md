# 📌 SSRF Demo Notes – Express / Node.js

`ssrf-demo-notes` is a small application built with **Node.js + Express + SQLite** designed to demonstrate **SSRF** and **XSS** vulnerabilities in a controlled environment.  
It includes PDF generation with Puppeteer, HTML sanitization, and intentionally vulnerable routes for educational purposes.

> ⚠️ **Educational use only.**  
> Do not use this in production or for attacking real systems.

---

## 🚀 Main Features

- Basic CRUD for notes using **SQLite**
- Renders user-supplied HTML
- Real **SSRF** demonstration:
  - The server performs HTTP requests to user-provided URLs
  - Includes examples accessing `http://169.254.169.254/latest/meta-data`
- **XSS** demonstration if sanitization is disabled
- PDF generation using Puppeteer/Chromium via:
  ```
  /notes/:id/pdf
  ```
- Simple, readable code ideal for:
  - Teaching SSRF
  - Showing server-side protection patterns
  - Demonstrating IMDSv2 usage
  - Explaining server-side HTML sanitization and URL validation

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone git@github.com:lccjavo/ssrf-demo-notes.git
cd ssrf-demo-notes
```

### 2. Install dependencies

```bash
npm install
```

If you get permission errors on Linux:

```bash
sudo chown -R $USER:$USER ~/.npm
npm install
```

### 3. Run the application

```bash
npm start
```

Open in browser:  
http://localhost:3000

---

## ⚙️ Optional Environment Variables

Create a `.env` file if needed:

```
PORT=3000
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

---

## 📚 Main Endpoints

### ➤ `GET /notes`
List all notes.

### ➤ `GET /notes/:id`
View a specific note.

### ➤ `POST /notes`
Create a new note (HTML allowed).

### ➤ `POST /notes/:id/update`
Update existing note.

### ➤ `GET /notes/:id/pdf`
Generate a PDF of a note using Puppeteer.

---

## 🧪 SSRF Demonstration

The app allows users to send any URL, and the server will attempt to fetch it:

```json
{
  "url": "http://169.254.169.254/latest/meta-data/"
}
```

This demonstrates:

- How IMDS can be accessed if not protected
- How SSRF can leak temporary AWS IAM credentials
- Mitigation examples:
  - IMDSv2 usage
  - Firewall restrictions
  - Strict URL validation (allowlist)

---

## 🧪 XSS Demonstration

Example payload:

```html
<img src="x" onerror="alert('Test XSS')">
```

If `sanitize.js` is disabled → the browser executes it.

---

## 🛡️ Security & Mitigation Patterns Included

- HTML sanitization through allowlist
- Optional blocking of internal/private IP ranges
- IMDSv2 security recommendations
- URL validation before making server-side requests
- Examples of common SSRF protection patterns

---

## 📦 Quick Deployment on EC2

### Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Start the app

```bash
npm install
npm start
```

Run in background with PM2:

```bash
pm2 start app.js
```

---

## 🤝 Contributing

Pull requests and improvements are welcome.  
You can also open an issue for new vulnerability examples, improvements, or documentation enhancements.

---

## 📜 License

MIT License.
