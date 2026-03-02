# archviz - Architecture Visualizer

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-cyan?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Mermaid-10-green?style=for-the-badge&logo=mermaid" alt="Mermaid" />
</p>

<p align="center">
  <strong>Visualize your repository architecture automatically.</strong><br/>
  Generate C4 diagrams from any GitHub repository in seconds.
</p>

---

## ✨ Features

- 🔍 **Automatic Analysis** - Analyzes any public GitHub repository
- 📊 **C4 Diagrams** - Generates Context, Container, and Component diagrams
- 🎨 **Beautiful UI** - Dark-themed, responsive interface with Tailwind CSS
- ⚡ **Fast** - Server-side analysis with GitHub API
- 📱 **Responsive** - Works on desktop and mobile devices

## 🚀 Demo

[Live Demo](https://archviz.vercel.app) - Try it with any GitHub repository!

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Diagrams**: [Mermaid](https://mermaid.js.org/)
- **GitHub API**: [Octokit](https://github.com/octokit/octokit.js)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/archviz.git
cd archviz

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

1. Enter a GitHub repository URL (e.g., `https://github.com/vercel/next.js`)
2. Click "Analyze"
3. View your architecture diagrams:
   - **System Context** - High-level system view
   - **Containers** - Application containers
   - **Components** - Internal components

## 🏗️ Architecture

```
archviz/
├── app/
│   ├── api/analyze/     # API route for repo analysis
│   ├── page.tsx         # Main application page
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   └── diagrams/        # Mermaid diagram component
├── lib/
│   ├── analyzer.ts      # Repository analysis logic
│   ├── diagrams.ts      # C4 diagram generation
│   └── types/           # TypeScript types
└── next.config.ts       # Next.js configuration
```

## 🔮 Future Enhancements

- [ ] Support for private repositories
- [ ] Code class diagrams
- [ ] Sequence diagram generation
- [ ] Export diagrams as PNG/SVG
- [ ] Repository comparison
- [ ] Architecture recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ using the power of AI and 86 specialized skills
</p>
