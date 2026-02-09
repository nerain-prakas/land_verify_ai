# LandVerify AI - AI-Powered Land Verification Platform

A revolutionary platform that uses Gemini 3 Pro multimodal AI to verify land certificates, analyze property videos, and provide intelligent insights for secure land transactions.

## 🚀 Features

- **AI Document Verification**: Advanced OCR and authenticity verification using Gemini 3 Pro
- **Video Land Analysis**: Multimodal analysis of property walkthrough videos with terrain, soil, and boundary verification
- **Interactive Map**: OpenStreetMap integration with polygon overlays for verified properties
- **AI Chat Assistant**: Chat with Gemini about specific properties for due diligence
- **Smart Matching**: AI-powered buyer-seller matching with automated meeting scheduling

## 🔐 Environment Setup

**For deployed website:** Visitors use your API keys automatically (stored securely on Vercel)  
**For local development:** Create `.env.local` file with API keys (never committed to GitHub)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Maps**: Google Maps JavaScript API, React Google Maps
- **AI**: Gemini 3 Pro API for multimodal analysis
- **Auth**: Clerk
- **Storage**: Google Cloud Storage
- **Database**: PostgreSQL with PostGIS (planned)

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landverify-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your API keys
   ```
   
   Verify setup:
   ```bash
   npm run check-env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
landverify-ai/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Seller dashboard
│   ├── explore/           # Buyer map explorer
│   └── page.tsx           # Home page
├── components/
│   ├── dashboard/         # Seller components
│   ├── explore/           # Buyer components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

## 🔑 Key Components

### Seller Flow
1. **Document Upload**: Drag & drop land certificates for AI verification
2. **Video Recording**: Record land walkthrough videos for multimodal analysis
3. **Listing Review**: Review AI analysis and create live listings

### Buyer Flow
1. **Map Discovery**: Interactive Google Maps with red zone overlays
2. **AI Due Diligence**: Chat with Gemini about specific properties
3. **Meeting Coordination**: AI-powered scheduling and transaction coordination

## 🤖 AI Integration

### Gemini 3 Pro Capabilities
- **Document OCR**: Extract owner name, plot number, area, coordinates
- **Video Analysis**: Terrain classification, soil quality, boundary verification
- **Audio Analysis**: Traffic noise, environmental sounds, decibel estimation
- **Cross-Validation**: Match video findings with certificate data

## 🗺️ Map Features

- Custom polygon overlays for property boundaries
- Color-coded status indicators (available, pending, sold)
- Interactive property details on click
- Video thumbnail overlays
- Filter by price, area, soil quality, noise level

## 📱 Responsive Design

Built with mobile-first approach using Tailwind CSS:
- Responsive navigation
- Mobile-friendly map interface
- Touch-friendly controls
- Optimized for all screen sizes

## 🚀 Deployment

### Deploy to Vercel

```bash
# Check environment
npm run check-env

# Push to GitHub
git push origin main

# Deploy
vercel --prod
```

**📖 Full guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🏆 Hackathon

Built for the Gemini 3 Global Hackathon 2024.

## 📞 Support

For support, email support@landverify.ai or join our Discord community.

## 🙏 Acknowledgments

- Google Gemini team for the amazing multimodal AI capabilities
- Clerk for seamless authentication
- Vercel for hosting platform
- shadcn for the beautiful UI components