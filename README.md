# FAQBNB - QR Item Display System

FAQBNB is a modern, mobile-optimized system for displaying appliance and item information via QR codes. Built with Next.js, TypeScript, and Supabase.

![QR Item Display System](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)

## 🚀 Features

### For End Users
- **Instant Access**: Scan QR codes to instantly view item information
- **Mobile Optimized**: Perfect experience on smartphones and tablets
- **Rich Media Support**: Videos, PDFs, images, and web links
- **No Login Required**: Zero friction access to information
- **Fast Loading**: Optimized for quick access and minimal data usage

### For Administrators
- **Easy Management**: Intuitive admin interface for managing items
- **Rich Content**: Support for multiple media types with thumbnails
- **Drag & Drop**: Reorder resources with simple drag and drop
- **Bulk Operations**: Efficient management of multiple items
- **Real-time Updates**: Changes reflect immediately on QR code pages

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📱 Screenshots

### Home Page
Professional landing page with feature highlights and sample items.

### Item Display Page
Clean, mobile-optimized display of item information and resources.

### Admin Panel
Comprehensive management interface for items and resources.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qr-item-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_SECRET=your_random_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Follow the guide in `database/README.md`
   - Run the SQL scripts in your Supabase dashboard
   - Seed with sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

### Items Table
- `id`: UUID primary key
- `public_id`: User-friendly identifier for QR codes
- `name`: Item name
- `description`: Optional description
- `created_at`, `updated_at`: Timestamps

### Item Links Table
- `id`: UUID primary key
- `item_id`: Foreign key to items
- `title`: Link title
- `link_type`: Type (youtube, pdf, image, text)
- `url`: Resource URL
- `thumbnail_url`: Optional custom thumbnail
- `display_order`: Sort order

## 🔗 API Endpoints

### Public API
- `GET /api/items/[publicId]` - Get item by public ID

### Admin API
- `GET /api/admin/items` - List all items
- `POST /api/admin/items` - Create new item
- `PUT /api/admin/items/[publicId]` - Update item
- `DELETE /api/admin/items/[publicId]` - Delete item

## 📱 Usage

### Creating Items

1. Go to `/admin`
2. Click "Add Item"
3. Fill in item details
4. Add resources (videos, PDFs, images, links)
5. Save the item

### Accessing Items

1. Generate QR code pointing to `/item/[publicId]`
2. Users scan QR code
3. Instant access to item information and resources

### Managing Resources

- **YouTube Videos**: Automatic thumbnail extraction
- **PDF Documents**: Custom thumbnails supported
- **Images**: Direct display with lightbox
- **Web Links**: External link handling

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository**
   ```bash
   vercel --prod
   ```

2. **Set environment variables**
   Add your Supabase credentials in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The application is compatible with:
- Netlify
- Railway
- DigitalOcean App Platform
- Any Node.js hosting service

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXTAUTH_SECRET` | Random secret for sessions | Yes |
| `NEXTAUTH_URL` | App URL for production | Yes |

### Customization

- **Styling**: Modify `src/app/globals.css` and Tailwind config
- **Branding**: Update logos and colors in components
- **Features**: Extend API endpoints and components as needed

## 📝 Development

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin interface
│   ├── api/            # API routes
│   └── item/           # Public item pages
├── components/         # Reusable components
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

### Key Components

- `ItemDisplay`: Main item display component
- `LinkCard`: Individual resource card
- `ItemForm`: Admin form for creating/editing items
- `AdminPanel`: Main admin interface

### Adding Features

1. **New Link Types**: Extend `LinkType` enum and update components
2. **Custom Fields**: Add to database schema and forms
3. **Analytics**: Integrate tracking in item pages
4. **Authentication**: Add user management for admin access

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 📚 Documentation

- [Database Setup Guide](database/README.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Customization Guide](docs/customization.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🎯 Roadmap

- [ ] QR code generation
- [ ] User authentication
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Offline support
- [ ] Mobile app

---

**Built with ❤️ using Next.js and Supabase**

