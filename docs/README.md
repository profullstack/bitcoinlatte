# BitcoinLatte Documentation

Welcome to the BitcoinLatte project documentation. This directory contains all technical documentation, architecture diagrams, and implementation guides.

## 📚 Documentation Structure

### Core Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture, technology stack, and design decisions
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Detailed database schema with SQL definitions, RLS policies, and functions
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation guide with code examples
- **[USER_FLOWS.md](USER_FLOWS.md)** - User journey diagrams and interaction flows

### Diagrams

All PlantUML diagrams are stored in the [`diagrams/`](diagrams/) directory:

#### System Diagrams
- [`system-architecture.puml`](diagrams/system-architecture.puml) - Overall system architecture
- [`database-schema.puml`](diagrams/database-schema.puml) - Database entity relationship diagram

#### User Flow Diagrams
- [`flow-browse-shops.puml`](diagrams/flow-browse-shops.puml) - Anonymous user browsing flow
- [`flow-submit-shop.puml`](diagrams/flow-submit-shop.puml) - Shop submission flow
- [`flow-vote-comment.puml`](diagrams/flow-vote-comment.puml) - Voting and commenting flow
- [`flow-track-submissions.puml`](diagrams/flow-track-submissions.puml) - Submission tracking flow
- [`flow-admin-review.puml`](diagrams/flow-admin-review.puml) - Admin review process
- [`flow-admin-manage-users.puml`](diagrams/flow-admin-manage-users.puml) - User management flow
- [`flow-shop-discovery.puml`](diagrams/flow-shop-discovery.puml) - Shop discovery flow
- [`flow-pwa-installation.puml`](diagrams/flow-pwa-installation.puml) - PWA installation flow
- [`flow-image-upload.puml`](diagrams/flow-image-upload.puml) - Image upload flow
- [`flow-search-filter.puml`](diagrams/flow-search-filter.puml) - Search and filter flow

## 🎯 Quick Start

1. **Understand the Architecture**: Start with [ARCHITECTURE.md](ARCHITECTURE.md) to get an overview of the system
2. **Review the Database**: Check [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for data structure
3. **Follow Implementation**: Use [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for step-by-step development
4. **Study User Flows**: Review [USER_FLOWS.md](USER_FLOWS.md) to understand user interactions

## 🔧 Technology Stack

- **Frontend**: Next.js 14+, Tailwind CSS, Leaflet.js
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: HERE.com (geocoding), ValueSERP (Google venue data)
- **PWA**: next-pwa for Progressive Web App features

## 📊 Viewing PlantUML Diagrams

To view the PlantUML diagrams, you can:

1. **VS Code**: Install the PlantUML extension
2. **Online**: Use [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
3. **Local**: Install PlantUML locally with Java

## 🤝 Contributing

When updating documentation:

1. Keep diagrams in separate `.puml` files in the `diagrams/` directory
2. Reference diagrams in markdown files using relative paths
3. Update this README when adding new documentation files
4. Follow the existing structure and formatting conventions

## 📝 License

This project is open source. See the main LICENSE file in the project root.

## 🔗 Related Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [HERE.com API Documentation](https://developer.here.com/)
- [PlantUML Documentation](https://plantuml.com/)