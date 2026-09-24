# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mantralok is a spiritual wellbeing platform website. The repository contains a multi-page static HTML site showcasing the Mantralok ecosystem, including platforms for Spiritual Growth, Guidance, and Engagement, along with company information and contact pages.

## Architecture

**Static Multi-Page HTML Site with Inline Tailwind CSS**
- Multiple HTML files for different pages (no build process required)
- Uses Tailwind CSS via CDN with custom configuration
- All pages can be opened directly in browser
- Dark mode toggle implemented with vanilla JavaScript
- Consistent navigation and footer across all pages

**Design System**
- Primary color: `#E6AB45` (Gold)
- Secondary color: `#FAF5EA` (Off-white)
- Display font: "Poltawski Nowy" (serif)
- Body font: "Poppins" (sans-serif)
- Material Icons Round for iconography
- Custom Tailwind config extends default with brand colors and dark mode support

**Site Structure**
The site consists of the following pages:

**Main Pages:**
- `index.html` - Homepage with platform overview and site ecosystem
- `about.html` - About Us page with mission, values, and company information
- `contact.html` - Contact page with form and contact information
- `partners.html` - Partners & Institutions page; routes both audiences to the partner portal at https://partner.mantraloktech.com

**Platform Detail Pages:**
1. `spiritual-growth.html` - Personal evolution tools (meditation, devotionals, prayer journal)
2. `guidance.html` - Learning experiences (mentors, astrology, workshops, courses)
3. `engagement.html` - Marketplace for services, content, and community connections

**Navigation Structure:**
- Home → `index.html`
- About → `about.html`
- Platforms → `index.html#platforms` (anchor link to platforms section on homepage)
- Partners → `partners.html`
- Contact → `contact.html`
- Platform cards on homepage link to their respective detail pages
- The nav's "Get Started" button is `hidden lg:block`: with five links the row
  overflows at the `md` breakpoint where the desktop nav appears

**Forms**
Both the contact form and the footer newsletter signup post to a Google Apps
Script endpoint (source and setup in `apps-script/`), which logs submissions to
a Google Sheet and emails `info@mantraloktech.com`. The site is on GitHub Pages
and cannot run server code, so there is no other backend.

- `forms.js` is shared by every page and holds the endpoint URL in `ENDPOINT`
- Form fields must carry `name` attributes — `forms.js` collects by name
- Each form needs `data-form="contact|newsletter"`, a `[data-form-status]`
  element for the result message, and a hidden `name="company"` honeypot
- With `ENDPOINT` unset both forms say so rather than faking success

## Development Workflow

**Viewing Changes**
- Open any HTML file directly in a browser
- No local server required
- Refresh browser to see changes

**Editing the Site**
- Each page is a standalone HTML file with inline styles
- All pages share the same navigation bar and footer structure
- Tailwind classes are defined inline using CDN
- Custom Tailwind config is in `<script>` tag at top of each file
- Dark mode: Toggle via JavaScript that adds/removes `dark` class on `<html>`

**Adding New Pages**
1. Create a new HTML file based on existing page structure
2. Copy the `<head>` section with Tailwind config from any existing page
3. Copy the navigation bar and update the active link styling
4. Add page-specific content in the main sections
5. Copy the footer from any existing page
6. Update navigation links in all pages to include the new page

**Color Customization**
To modify brand colors, edit the Tailwind config in the `<script>` tag:
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#E6AB45",
        // ... other colors
      }
    }
  }
}
```

## Key Implementation Notes

**Dark Mode**
- Implemented using Tailwind's `dark:` prefix classes
- Toggle button calls: `document.documentElement.classList.toggle('dark')`
- Dark mode variants are applied throughout for all colors and backgrounds

**Responsive Design**
- Mobile-first approach with breakpoints: `sm:`, `md:`, `lg:`
- Mobile menu button visible on small screens (`md:hidden`)
- Grid layouts adapt: single column on mobile, multi-column on larger screens

**Navigation**
- Sticky navigation bar with blur backdrop effect
- Logo with animated infinity icon (10s rotation)
- Links navigate between pages: Home, About, Platforms, Contact
- Active page is highlighted with `text-primary font-semibold` classes
- Dark mode toggle button in navigation

**Page Templates**
Each page follows a consistent structure:
1. **Header/Hero Section** - Large title, description, and decorative background
2. **Main Content Sections** - Features, benefits, or information relevant to the page
3. **CTA Section** - Call-to-action with primary button (usually with primary gold background)
4. **Footer** - Consistent across all pages with links, newsletter signup, and social icons

**Content Guidelines**
- Homepage (`index.html`): Overview of all platforms, site structure/sitemap, app download CTA
- About (`about.html`): Mission statement, values (3 cards), "Why Mantralok?" section
- Contact (`contact.html`): Contact form with name/email/subject/message fields, contact info cards
- Platform pages: Hero with platform icon, detailed features (6 cards), benefits, CTA, links to other platforms
