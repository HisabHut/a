# HisabHut - Single Page Application

A modern, responsive single-page application for managing orders, products, customers, credits, and business operations.

## Features

### Core Pages
- **Dashboard** - Overview with statistics and recent activity
- **Orders** - Complete order management and tracking
- **Credits** - Credit transactions and balance management
- **Products** - Product catalog and inventory
- **Customers** - Customer database and analytics
- **History** - Activity log and audit trail
- **Settings** - Application configuration and preferences

### Key Features
- ✅ Single Page Application (SPA) architecture
- ✅ Client-side routing with browser history support
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Modern UI with card-based layouts
- ✅ Data tables with status badges
- ✅ Database synchronization with admin app
- ✅ Clean and intuitive navigation

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Architecture**: Single Page Application (SPA)
- **Design**: Responsive, Mobile-First
- **Database**: Shared database with admin app (configurable in settings)

## Getting Started

### Quick Start

1. Clone the repository
2. Open `index.html` in a web browser
3. Or serve with any HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8080
```

4. Navigate to `http://localhost:8080`

### Project Structure

```
├── index.html          # Main HTML file
├── styles.css          # Application styles
├── app.js             # Application logic and routing
└── README.md          # Documentation
```

## Application Usage

### Navigation
- Click on sidebar menu items to navigate between pages
- Use browser back/forward buttons for navigation history
- Active page is highlighted in the sidebar

### Responsive Behavior
- **Desktop (>768px)**: Full sidebar with icons and labels
- **Tablet (640-768px)**: Compact sidebar
- **Mobile (<640px)**: Icon-only sidebar

### Settings Configuration

The Settings page allows you to:
- Configure general application settings
- Set up database connection
- Enable/disable admin app synchronization
- Manage user profile
- Configure notifications

## Database Synchronization

This application is designed to share the same database as the admin app. Enable synchronization in Settings > Database Settings > "Sync with Admin App".

## Customization

### Styling
Edit `styles.css` to customize:
- Color scheme (CSS variables in `:root`)
- Layout and spacing
- Typography
- Component styles

### Adding New Pages
1. Add navigation link in `index.html`
2. Create page content method in `app.js`
3. Add routing logic in `getPageContent()`

### Data Integration
Currently uses static mock data. To connect to a real database:
1. Create API endpoints for data operations
2. Update page content methods in `app.js` to fetch from API
3. Add error handling and loading states

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: No external dependencies
- Fast page transitions (client-side routing)
- Optimized CSS with minimal reflows
- Efficient DOM updates

## Future Enhancements

- [ ] Real-time data synchronization
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) features

## License

Copyright © 2026 HisabHut. All rights reserved.

## Support

For issues or questions, please contact the development team.