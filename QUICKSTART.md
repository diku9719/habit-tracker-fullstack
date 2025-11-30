# 🚀 Quick Start Guide

Get your Habit Tracker running in 5 minutes!

## Prerequisites

- Node.js installed (v14+)
- MongoDB installed locally OR MongoDB Atlas account

## Option 1: Local MongoDB

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=my_super_secret_key_12345
NODE_ENV=development
```

### Step 3: Start MongoDB
```bash
# In a new terminal
mongod
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Open Frontend
Open `public/index.html` in your browser or:
```bash
npx serve public
```

Visit: `http://localhost:3000`

## Option 2: MongoDB Atlas (Cloud)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string

### Step 2: Setup
```bash
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habit-tracker
JWT_SECRET=my_super_secret_key_12345
NODE_ENV=production
```

### Step 3: Start
```bash
npm start
```

## Testing the API

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Save the token from response!

### Create Habit
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Morning Run",
    "category": "health",
    "frequency": "daily",
    "color": "#667eea"
  }'
```

### Get All Habits
```bash
curl http://localhost:5000/api/habits \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas: Whitelist your IP address

### Port Already in Use
Change PORT in `.env` to different number (e.g., 5001)

### CORS Error
Make sure backend is running on port 5000 or update `API_URL` in `public/app.js`

## Next Steps

1. ✅ Create your account
2. ✅ Add your first habit
3. ✅ Start tracking!
4. 🚀 Deploy to production (see README.md)

## Production Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

### Render
1. Create Web Service
2. Connect repository
3. Add environment variables
4. Deploy

## Support

Having issues? Check:
- MongoDB is running
- All dependencies installed (`npm install`)
- Environment variables set correctly
- Port 5000 is available

---

Happy habit tracking! 🎯
