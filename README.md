# Project Completion Tracker

A full-stack web application for tracking project completion status across teams and departments.

## Features

- Team management with project details
- Student registration and role assignment
- Department-wise statistics
- Project completion tracking
- Dark theme UI with shadcn/ui components

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Project-Completion-Tracker
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/project-tracker
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Deployment on Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Ensure your repository structure looks like this:**
   ```
   Project-Completion-Tracker/
   ├── backend/
   │   ├── server.js
   │   ├── package.json
   │   ├── routes/
   │   ├── models/
   │   └── ...
   ├── frontend/
   │   ├── src/
   │   ├── package.json
   │   └── ...
   ├── render.yaml
   └── README.md
   ```

### Step 2: Set Up MongoDB Atlas

1. **Create a MongoDB Atlas account** (if you don't have one)
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account

2. **Create a new cluster**
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Set up database access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set up network access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Render deployment)
   - Click "Confirm"

5. **Get your connection string**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `project-tracker`

### Step 3: Deploy on Render

1. **Sign up for Render**
   - Go to [Render](https://render.com)
   - Sign up with your GitHub account

2. **Create a new Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository you just pushed

3. **Configure the service**
   - **Name**: `project-completion-tracker` (or any name you prefer)
   - **Environment**: `Node`
   - **Region**: Choose the closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`

4. **Add Environment Variables**
   - Click "Environment" in the left sidebar
   - Add the following variables:
     - **Key**: `MONGODB_URI`
     - **Value**: Your MongoDB Atlas connection string
     - **Key**: `NODE_ENV`
     - **Value**: `production`

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Wait for the build to complete (this may take 5-10 minutes)

### Step 4: Verify Deployment

1. **Check the deployment logs**
   - In your Render dashboard, click on your service
   - Go to the "Logs" tab to see build and runtime logs

2. **Test your application**
   - Once deployed, Render will provide you with a URL
   - Visit the URL to test your application
   - Try creating a department, adding teams, etc.

3. **Set up custom domain (optional)**
   - In your Render service settings, go to "Settings"
   - Under "Custom Domains", add your domain
   - Configure DNS as instructed by Render

## Troubleshooting

### Common Issues

1. **Build fails**
   - Check the build logs in Render
   - Ensure all dependencies are in package.json
   - Verify the build command is correct

2. **MongoDB connection fails**
   - Verify your MongoDB Atlas connection string
   - Ensure network access allows connections from anywhere
   - Check that your database user has the correct permissions

3. **Frontend not loading**
   - Check that the frontend build completed successfully
   - Verify the static file serving is working
   - Check browser console for errors

4. **API calls failing**
   - Ensure the API base URL is correctly configured
   - Check that CORS is properly set up
   - Verify all API routes are working

### Useful Commands

```bash
# Test the build locally
cd backend
npm run build

# Test the production server locally
cd backend
npm start

# Check if MongoDB is accessible
mongosh "your-connection-string"
```

## Support

If you encounter any issues during deployment, check:
1. Render's [documentation](https://render.com/docs)
2. MongoDB Atlas [documentation](https://docs.atlas.mongodb.com/)
3. The application logs in Render dashboard

## License

This project is open source and available under the [MIT License](LICENSE). 