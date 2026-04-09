# Goal Tracking Application

## Project Description
The Goal Tracking Application is designed to help users set, track, and achieve their personal goals. It offers a user-friendly interface, allowing users to create various goals, monitor their progress, and stay motivated by visualizing their achievements.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Supabase account and project ([Sign up here](https://supabase.com))

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/serg32441/my-dream-life.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd my-dream-life
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update the values in `.env` with your Supabase credentials:
     - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
     - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   
   > Get these values from your Supabase project settings at [app.supabase.com](https://app.supabase.com)

5. **Set up Supabase database**:
   - Create a new project in Supabase
   - Create a table named `goals` with the following columns:
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `title` (text)
     - `description` (text)
     - `priority` (text: 'low', 'medium', 'high')
     - `status` (text: 'active', 'completed', 'paused')
     - `created_at` (timestamp)
   
   - Enable Row Level Security (RLS) on the `goals` table
   - Add a policy to allow users to access only their own goals

6. **Run the application**:
   ```bash
   npm start
   ```

## Feature List
- User registration and authentication (Email/Password & Google OAuth)
- Create, edit, and delete goals
- Track progress on goals
- Filter goals by priority and status
- Search functionality
- Visual progress reports (graphs and charts)
- Goal reminders and notifications
- Share goals with friends for extra motivation
- Mobile responsive design

## Tech Stack
- **Frontend**: React 18, CSS3
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **Authentication**: Supabase Auth (Email/Password, Google OAuth)

## Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── GoalForm.jsx
│   ├── GoalCard.jsx
│   └── SearchFilter.jsx
├── pages/           # Page components
│   ├── Auth.jsx
│   └── Dashboard.jsx
├── lib/             # Utility libraries
│   └── supabaseClient.js
├── styles/          # CSS stylesheets
│   ├── Auth.css
│   └── Dashboard.css
└── App.jsx          # Main application component
```

## Environment Variables
See `.env.example` for required environment variables.

**Important**: Never commit your `.env` file to version control. The `.env.example` file contains placeholder values and should be used as a template.

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License.