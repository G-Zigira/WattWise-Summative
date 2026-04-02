# WattWise
 
**WattWise** is a web application that helps users in Rwanda track their home electricity consumption, estimate costs, get AI powered efficiency tips, and verify whether their prepaid electricity tokens gave them their money's worth.
its curently running on https://watwise.rezenith.tech/
 
---
 
## About the Project
 
WattWise was built to solve a real problem faced by households in Rwanda: understanding electricity usage. Rwanda uses a prepaid electricity token system  you buy a pack of kWh upfront and use it until it runs out. Many people have no way to tell if their token gave them the right amount of power, or if they are consuming more than they realize.
 
WattWise lets you log every device in your home, see your estimated daily and monthly costs, check whether your token lasted as long as it should have, and get personalized AI advice on how to cut your electricity bill.
 
---
 
## Features
 
- **Dashboard** — Live stats: total kWh/day, daily cost, monthly cost, device count, and top consumer
- **Device Tracker** — Add devices by name, wattage, and hours of use per day; sorted by consumption
- **AI Insights** — Groq-powered analysis of your device list with specific saving tips
- **Token Checker** — Enter the kWh you purchased and how many days it lasted; WattWise tells you if you got your money's worth
- **Account System** — Sign up and log in with local browser storage
- **Dark/Light Mode** — Toggle between themes
 
---
 
## APIs Used
 
### Groq API
Used to power the AI suggestions feature. Sends the user's device list to a Groq-hosted LLM (Llama 3.1 8B Instant) and returns personalized electricity-saving tips.
 
- **Documentation:** https://console.groq.com/docs/overview
- **Models Reference:** https://console.groq.com/docs/models
- **Endpoint used:** `POST https://api.groq.com/openai/v1/chat/completions`

### Google Fonts API
Used to load the application's custom fonts (`Exo 2` and `Share Tech Mono`) for the dark tech aesthetic.
 
- **Documentation:** https://developers.google.com/fonts
 
---
 
## Running Locally
 
WattWise is a pure frontend application — no build step, no framework, no Node.js required.
 
**1. Clone the repository:**

**2. Open the app:**
 
Simply open `index.html` in your browser:
```bash
# On Linux/Mac
open index.html
 
# Or just double-click index.html in your file explorer
```
 
Alternatively, use a simple local server for a more accurate environment:
```bash
# Python 3
python3 -m http.server 8000
 
# Then visit http://localhost:8000 in your browser
```
 
**3. Set your API key** (LOOK AT THE section below).
 
That's it — no npm install, no compilation needed.
 
---
 
## API Key Setup
 
The Groq API key is stored directly in `app.js`. Open the file and find this line near the top:
 
```javascript
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
```
 
Replace `YOUR_GROQ_API_KEY_HERE` with your actual Groq API key, which starts with `gsk_`.
 
> **Note:** The actual API key is not included in this repository for security reasons. It is provided separately in the assignment submission comment section on the course portal.
 
To get your own key:
1. Go to https://console.groq.com
2. Sign up for a free account
3. Navigate to **API Keys** and create a new key
 
---
 
## Deployment
 
The application is deployed across two web servers (`server1` and `server2`) with a load balancer distributing traffic between them.
 
### Web Servers (server1 & server2)
 
1. SSH into the server
2. Make sure Nginx is installed and running
3. Copy the project files to the web root
 
**Repeat these steps for both `server1` and `server2`.**
 
---
 
### Load Balancer 
 
The load balancer uses Nginx's `upstream` directive to round-robin traffic between the two web servers.
 
1. SSH into the load balancer
2. Install Nginx
3. Edit the default Nginx config
4. Replace the contents with this configuration
5. Test the configuration and reload Nginx
 
### Testing the Deployment
 
**1. Test each web server directly:**
```bash
curl http://<WEB_01_PUBLIC_IP>
curl http://<WEB_02_PUBLIC_IP>
```
Both should return the WattWise HTML.
 
**2. Test the load balancer:**
```bash
curl http://<LB_01_PUBLIC_IP>
```
Should return the same HTML, proxied through lb-01.
 
**3. Test via domain:**
 
Visit `http://yourdomain` in your browser. The full application should load and be fully functional, including the AI suggestions feature.
 
---
 
## Project Structure
 
```
wattwise/
├── index.html       # Application markup and structure
├── styles.css       # All styles (dark/light theme, layout, components)
├── app.js           # All application logic and API calls
├── .gitignore       # Excludes sensitive files from version control
└── README.md        # This file
```
 
---
 
## Credits & Attributions
 
| Resource | Use | Link |
|----------|-----|------|
| **Groq** | AI inference API (LLM suggestions) | https://groq.com |
| **Meta / Llama** | Underlying LLM model (Llama 3.1 8B) | https://ai.meta.com/llama/ |
| **Google Fonts** | Exo 2 and Share Tech Mono typefaces | https://fonts.google.com |
| **Nginx** | Web server and load balancer | https://nginx.org |
 
---
 
## Author
 **Zigira Luc Guevara**  
 