# A Tiny CMS

A modernized CMS written in Node.js with a React-based frontend. Features user authentication, blog management, and Markdown support.

## Installation

### Clone and Setup
```shell
git clone github.com/oduortoni/tiny-blog.git
cd tiny-blog
npm install
```

### Create Admin User
```shell
node create-admin.js
```
This creates an admin user with:
- **Email:** admin@drojd.com
- **Password:** admin123

### Start the Server
```shell
node server/app.js
```
Default port: 8090 (or set with `PORT=3000 node server/app.js`)

## Usage

### Frontend Interface
Access the CMS at: `http://localhost:8090/`

**Features:**
- User registration and login
- Create, edit, delete blog posts
- Markdown content support
- Blog post listing with clickable titles
- Individual post view pages
- Tags and categorization
- Author attribution

### API Endpoints

**Authentication:**
- `POST /api/login` - User login
- `POST /api/register` - User registration

**Blog Management:**
- `GET /api/page` - List all posts
- `POST /api/page` - Create post (auth required)
- `GET /api/page/:id` - Get specific post
- `PUT /api/page/:id` - Update post (auth required)
- `DELETE /api/page/:id` - Delete post (auth required)

**Content Types:**
- `post` - Blog posts with author, tags, excerpts
- `page` - Static pages
- `blog_section` - Category landing pages

## Configuration

### config.json
```json
{
    "db":"mongodb://localhost/drojd",
    "secret":"somuchsecret",
    "jwtexpires":86400,
    "api_url":"/api",
    "url":"http://localhost"
}
```

### Environment Variables
```shell
# Development
node server/app.js

# Production
NODE_ENV=production PORT=8080 node server/app.js

# With custom config
PORT=3000 SECRET=mysecret DB=mongodb://localhost/mycms node server/app.js
```

## Features

- **Modern Dependencies** - Updated to latest Node.js packages
- **User Authentication** - JWT-based login/register system
- **Blog Management** - Full CRUD operations via web interface
- **Markdown Support** - Write content in Markdown with HTML rendering
- **Responsive Design** - Clean, mobile-friendly interface
- **API-First** - RESTful API for all operations
- **MongoDB Integration** - Flexible document storage

## Examples
- [pt.al](https://pt.al) - Original blog example
- Frontend: `http://localhost:8090/`
- Admin API: `http://localhost:8090/api/`
