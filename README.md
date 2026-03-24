# PAL - Your Everyday School Assistant

![PAL Logo](public/favicon.png)

A comprehensive all-in-one platform designed for students, by students. PAL provides unblocked access to educational resources, AI assistance, forums, games, and more - all in one secure and user-friendly environment.

## 🚀 Features

### 🎓 Core Features
- **Forums** - Engage with fellow students, share knowledge, and collaborate on projects
- **AI Assistance** - Get help with homework and questions from our personal Pal AI or other professional AI models
- **Games** - Take breaks with a wide range of entertaining games
- **News** - Stay updated with the latest news and updates without leaving the site
- **Apps** - Explore useful applications to enhance daily productivity
- **Contacts** - Connect with our staff team and find links to Discord, Instagram, and more

### 🛠️ Technical Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Monitoring** - Comprehensive admin dashboard with detailed system diagnostics
- **User Management** - Secure authentication with role-based access control
- **Premium Features** - Enhanced functionality for premium users
- **Search System** - Powerful search functionality across users and content
- **Report System** - Maintain a safe community with robust reporting tools

## 🏗️ Architecture

### Frontend
- **HTML5/CSS3/JavaScript** - Modern web standards with semantic markup
- **Responsive CSS Grid/Flexbox** - Mobile-first design approach
- **Progressive Enhancement** - Works without JavaScript, enhanced with it
- **Accessibility** - WCAG 2.1 AA compliant with ARIA labels and keyboard navigation

### Backend
- **Cloudflare Workers** - Serverless functions for API endpoints
- **KV Storage** - Distributed key-value store for user data and content
- **JWT Authentication** - Secure token-based authentication system
- **Stripe Integration** - Payment processing for premium features

### Key Components
- **Navigation System** - Responsive navbar with mobile menu
- **User Interface** - Consistent design system with loading states and error handling
- **Admin Dashboard** - Comprehensive statistics and diagnostic tools
- **Authentication Flow** - Secure login/signup with profile management

## 📦 Project Structure

```
pal/
├── public/                     # Static assets and pages
│   ├── admin/                 # Admin dashboard
│   ├── applicable/            # Apps section
│   ├── assist/                # Games section
│   ├── daily/                 # Daily features
│   ├── intel/                 # AI assistance
│   ├── latest/                # News section
│   ├── pages/                 # Forums
│   ├── premium/               # Premium features
│   ├── profile/               # User profiles
│   ├── resources/             # Contact information
│   ├── search/                # Search functionality
│   ├── settings/              # User settings
│   ├── signup/                # User registration
│   ├── users/                 # User directory
│   ├── index.html             # Homepage
│   ├── stats.html             # Admin statistics
│   ├── style.css              # Main stylesheet
│   ├── script.js              # Homepage interactions
│   ├── navbar.js              # Navigation component
│   ├── global-auth.js         # Authentication system
│   ├── global-settings.js     # Site configuration
│   └── ui-utils.js           # UI utilities and error handling
├── functions/                # Cloudflare Workers API
│   └── api/                  # API endpoints
├── package.json              # Dependencies and scripts
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (for local development)
- Cloudflare account (for deployment)
- Stripe account (for premium features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sashain6-netizen/pal.git
   cd pal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file with your configuration
   - Add your Stripe keys, JWT secrets, and other API keys

4. **Deploy to Cloudflare Workers**
   ```bash
   npm run deploy
   ```

### Local Development

1. **Start local development server**
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Open `http://localhost:8787` in your browser
   - Use the admin dashboard at `http://localhost:8787/stats.html`

## 🔧 Configuration

### Environment Variables
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `STRIPE_PUBLISHABLE_KEY` - Stripe client-side key
- `JWT_SECRET` - JWT token signing secret
- `ADMIN_USERS` - Comma-separated list of admin usernames

### Site Settings
Edit `public/global-settings.js` to configure:
- Site title and description
- Feature flags
- API endpoints
- UI preferences

## 👥 User Roles

### Member
- Basic access to all features
- Can post in forums
- Can use AI assistance
- Can play games

### Premium
- All Member features plus:
- Enhanced AI capabilities
- Ad-free experience
- Priority support
- Exclusive content

### Staff Roles
- **Moderator** - Can moderate forums and handle reports
- **Manager** - Can manage users and content
- **Admin** - Full administrative access
- **Owner** - Complete system control

## 📊 Monitoring & Diagnostics

The admin dashboard (`/stats.html`) provides comprehensive monitoring:

### System Metrics
- Page load times
- API response times
- Memory usage
- Active connections
- Error rates
- User activity

### Diagnostic Tools
- API endpoint health checks
- Database connection testing
- Real-time performance monitoring
- System log export
- Error tracking

### Performance Optimization
- Lazy loading for images
- Code splitting for JavaScript
- Optimized CSS delivery
- Service worker caching
- Image compression

## 🔒 Security

### Authentication
- JWT-based authentication
- Secure password hashing
- Session management
- Rate limiting

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Content Security Policy

### Privacy
- No tracking cookies
- Minimal data collection
- User data encryption
- GDPR compliance

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb`
- **Deep Blue**: `#1e40af`
- **Soft Blue**: `#64748b`
- **White**: `#ffffff`
- **Off White**: `#f8faff`

### Typography
- **Primary**: 'Varela Round' - Friendly rounded font
- **Secondary**: 'Montserrat' - Clean sans-serif

### Components
- **Cards** - Rounded corners with subtle shadows
- **Buttons** - Consistent styling with hover states
- **Forms** - Validation and error handling
- **Navigation** - Responsive with mobile menu

## 🌐 API Documentation

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `GET /api/me` - Current user info
- `POST /api/logout` - User logout

### User Management
- `GET /api/users-search` - Search users
- `GET /api/get-profile` - Get user profile
- `PUT /api/update-profile` - Update profile

### Content Management
- `GET /api/forum` - Get forum threads
- `POST /api/create-thread` - Create new thread
- `POST /api/reply` - Reply to thread

### Admin Functions
- `GET /api/report-user` - Get reports
- `POST /api/ban-user` - Ban user
- `DELETE /api/ban-user` - Unban user
- `GET /api/premium-stats` - Premium statistics

## 🚀 Deployment

### Cloudflare Workers
1. Install Wrangler CLI
2. Authenticate with Cloudflare
3. Deploy using `wrangler publish`

### Custom Domain
1. Add domain to Cloudflare
2. Update DNS records
3. Configure SSL certificates
4. Update environment variables

## 🧪 Testing

### Manual Testing
- Test all user flows
- Verify responsive design
- Check accessibility
- Validate forms

### Automated Testing
- API endpoint testing
- Performance monitoring
- Security scanning
- Cross-browser testing

## 📈 Performance

### Optimization Techniques
- Image lazy loading
- Code minification
- Gzip compression
- CDN delivery
- Browser caching

### Metrics
- Page load time: < 2 seconds
- First Contentful Paint: < 1.5 seconds
- Largest Contentful Paint: < 2.5 seconds
- Cumulative Layout Shift: < 0.1

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Code Style
- Use ES6+ JavaScript
- Follow CSS naming conventions
- Write semantic HTML
- Add accessibility attributes

### Commit Messages
- Use conventional commits
- Be descriptive
- Reference issues
- Keep messages concise

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

### Getting Help
- **Documentation** - Check this README and inline comments
- **Issues** - Report bugs on GitHub Issues
- **Discord** - Join our community server
- **Contact** - Use the contact form on the site

### Common Issues
- **Login Problems** - Clear cookies and cache
- **Performance** - Check internet connection
- **Mobile Issues** - Update browser app
- **API Errors** - Check server status page

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app development
- [ ] Advanced AI features
- [ ] Video conferencing
- [ ] File sharing system
- [ ] Advanced analytics
- [ ] Multi-language support

### Improvements
- [ ] Enhanced security features
- [ ] Better mobile experience
- [ ] Performance optimizations
- [ ] More accessibility features
- [ ] Expanded admin tools

---

**PAL** - *Your Everyday School Assistant*

Made with ❤️ by students, for students.

For more information, visit the site or contact our support team.
