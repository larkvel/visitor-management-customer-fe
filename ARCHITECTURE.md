# Visitor Management Customer Frontend - Three Repository Architecture

This is the customer frontend repository for the Visitor Management SaaS platform.

## Repository Structure

The Visitor Management system is split into three independent repositories:

1. **visitor-management-backend** - Node.js/Express API
   - Company, user, and visit management
   - Role-based access control
   - Database migrations
   - Shared business logic

2. **visitor-management-admin-fe** - React admin dashboard
   - Platform administration
   - Company management
   - Platform metrics
   - Deployed to `admin.larkvel.com`

3. **visitor-management-customer-fe** (this repo) - React customer dashboard
   - Company-specific visitor management
   - User check-in/check-out
   - Subdomain-based routing (`*.larkvel.com`)
   - Deployed to `<company>.larkvel.com`

## Why Separate Repositories?

- **Independent Deployment**: Each component can be deployed independently
- **Different Cadences**: Admin and customer frontends can have different release schedules
- **Clarity**: Clear separation of concerns
- **Scalability**: Backend can be scaled independently
- **Team Organization**: Teams can work independently on their components

## Deployment

Deploy this repository to your hosting platform:

```bash
# Build
docker build -t visitor-management-customer-fe \
  --build-arg VITE_API_BASE_URL=https://api.larkvel.com \
  .

# Run
docker run -p 80:80 \
  -e VITE_API_BASE_URL=https://api.larkvel.com \
  visitor-management-customer-fe
```