# AI Journaling - Landing Page

A modern, mobile-first landing page for an AI-powered journaling application built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern Design**: Clean, professional landing page with gradient accents and smooth animations
- **Mobile-First**: Responsive design that works perfectly on all device sizes
- **Dark Theme**: Beautiful dark theme with customizable color schemes
- **Interactive Components**: Hover effects, smooth transitions, and engaging user interactions
- **Accessibility**: Built with accessibility best practices and semantic HTML

## 🎯 Sections

### Hero Section
- Compelling headline with gradient text effects
- Clear value proposition
- Call-to-action buttons
- Feature highlights with icons

### Features Section
- 8 key features displayed in a responsive grid
- Interactive cards with hover effects
- Badge system for categorization
- Lucide React icons for visual appeal

### Demo Section
- Sample journal entry showcase
- AI insights demonstration
- Interactive cards showing different insight types
- Real-world examples of the app's capabilities

### Privacy Section
- Security features highlight
- Encryption details
- Trust indicators and compliance badges
- Visual security feature grid

### Pricing Section
- Three-tier pricing structure
- Feature comparison
- Popular plan highlighting
- Security feature guarantees

### Call-to-Action
- Final conversion section
- Multiple CTA buttons
- Trust indicators
- Feature highlights

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Theme**: Dark mode with CSS custom properties

## 📱 Mobile-First Design

The landing page is built with a mobile-first approach:

- Responsive grid layouts that adapt to screen size
- Touch-friendly button sizes and spacing
- Optimized typography for mobile reading
- Collapsible navigation menu for mobile devices
- Proper spacing and padding for all screen sizes

## 🎨 Design System

### Colors
- Primary: Customizable primary color with gradient effects
- Background: Dark theme with subtle variations
- Muted: Secondary text and background colors
- Accent: Interactive element highlights

### Typography
- Large, readable headings with gradient effects
- Consistent body text sizing
- Proper hierarchy and spacing
- Accessible font weights and sizes

### Components
- Consistent card designs with hover effects
- Badge system for categorization
- Button variants for different actions
- Responsive grid layouts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-journaling/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Header.tsx    # Navigation header
│   │   ├── Hero.tsx      # Hero section
│   │   ├── Features.tsx  # Features showcase
│   │   ├── Demo.tsx      # AI insights demo
│   │   ├── Privacy.tsx   # Privacy & security
│   │   ├── Pricing.tsx   # Pricing plans
│   │   ├── CTA.tsx       # Call-to-action
│   │   └── Footer.tsx    # Footer
│   ├── App.tsx           # Main application
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/                # Static assets
├── package.json           # Dependencies
└── README.md             # This file
```

## 🎯 Key Features Highlighted

### AI-Powered Journaling
- Voice and text input methods
- Real-time AI insights and analysis
- Mood tracking and pattern recognition
- Personalized growth recommendations

### Privacy & Security
- End-to-end encryption (AES-256)
- Zero-knowledge architecture
- Client-side encryption
- GDPR compliance
- Regular security audits

### User Experience
- Cross-platform synchronization
- Beautiful, customizable themes
- Progress tracking and analytics
- Export and backup capabilities

## 🔧 Customization

### Colors
Modify the CSS custom properties in `src/index.css` to change the color scheme:

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  /* ... other colors */
}
```

### Components
All components are built with shadcn/ui patterns and can be easily customized by modifying the component files or extending the base components.

### Content
Update the content in each component file to match your specific messaging and branding.

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (default)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚀 Performance

- Optimized bundle size with Vite
- Lazy loading for better performance
- Efficient CSS with Tailwind
- Optimized images and assets

## 🔒 Security Features

The landing page emphasizes the security features of the AI journaling app:

- **Encryption**: Military-grade AES-256 encryption
- **Privacy**: Zero-knowledge architecture
- **Compliance**: GDPR and international standards
- **Audits**: Regular security assessments
- **Transparency**: Open-source security methods

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions about the landing page:

- Create an issue in the repository
- Check the documentation
- Review the component examples

## 🎉 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Vite](https://vitejs.dev/) for the fast build tool

---

Built with ❤️ for the AI Journaling project
