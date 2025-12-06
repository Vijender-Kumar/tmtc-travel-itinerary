# TMTC Travel Itinerary API  
A **Node.js + Express + MongoDB REST API** to create, manage, and share travel itineraries.

---

## Prerequisites

Make sure the following are installed:

| Tool | Version |
|------|---------|
| **Node.js** | ≥ v18.20.8 (Recommended: 18.20.8) |
| **npm** | Comes with Node.js |
| **MongoDB Atlas** or Local MongoDB |
| **Redis (optional)** | For caching |
| **Docker (optional)** | For container deployment |

---

## Node.js Installation (Recommended via `nvm`)

```bash
nvm install 18.20.8
nvm use 18.20.8
node -v
# v18.20.8


#Step 1:
git clone <your-repo-url>
cd travel-itinerary-api

#Step 2:
npm install --legacy-peer-deps
npm install --save-dev jest supertest mongodb-memory-server --legacy-peer-deps 

#Step 3:
PORT=4001
DB_URI=<Your MongoDB Atlas URI>
SECRET_KEY=<Your Secret Key>
ENVIRONMENT=sandbox
REDIS_URL="redis://redis:6379"
MAIL_CONFIG_HOST=smtp.gmail.com
MAIL_CONFIG_PORT=587
MAIL_FROM_NAME="TMTC Travel Itinerary"
MAIL_CONFIG_USER=<YOUR GMAIL> #Use GMAIL
MAIL_CONFIG_PWD=<16 Digit App Passsword> 
#Generate the APP passwords below are the steps
# 1. Enable 2-Step Verification
# App passwords only work if 2-Step Verification is enabled.
# Go to Google Account Security
# Under "Signing in to Google", check 2-Step Verification.
# Click Get Started and complete the verification setup (phone number, etc.).
# 2. Generate an App Password
# After enabling 2-Step Verification, go back to Google Account Security
# Click App Passwords (under "Signing in to Google").
# You may need to sign in again.
# Select the App and Device:
# App: Mail
# Device: Other (give a custom name, e.g., TravelApp)
# Click Generate.

#Step 4: 
#Redis Setup
#If Redis is installed on macOS:
brew services start redis
redis-server /opt/homebrew/etc/redis.conf
#To stop:
brew services stop redis
#Default Redis URL:
redis://127.0.0.1:6379
##### FOR THIS CHANGE IN THE server.js FILE which is Commented for the REDIS CLIENT

Step 4:
#Run the Project
#Start the server:
npm run server


==========
#Docker Deployment
#Stop previous containers
#Build (no cache)
#Run containers 

#### RUN ALL THREE COMMANDS TOGETHER in the terminal
docker-compose down
docker-compose build --no-cache
docker-compose up

###RUNNING THE TEST
##RUN THE CODE in LOCAL or in DOCKER
##Open NEW Terminal
#Run the command
npm test