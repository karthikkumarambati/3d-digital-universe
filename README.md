# Digital Universe 🌌

An immersive cyberpunk 3D experience built with **HTML5, CSS3, vanilla JavaScript, Three.js, and GSAP**. Explore a living digital dimension with procedural stars, a glowing 3D core, orbital rings, scroll-driven reveals, responsive world selection, and a futuristic interface.

## Features

- Real-time 3D scene rendered with Three.js/WebGL.
- Procedural star field, glowing planetary core, orbital rings, and floating objects.
- Cursor-responsive camera movement and animated environment.
- GSAP entrance and scroll-triggered reveal animations.
- Three selectable worlds that update the core's accent color and transmission.
- Responsive layout with a mobile navigation menu.
- Reduced-motion support, including the system preference and an in-page motion toggle.
- No build step, framework, backend, or package installation required.
- Performance-conscious pixel ratio, mobile star count, and geometry reuse.

## Preview

Add a screenshot or GIF of the running site here, for example:

```md
![Digital Universe preview](assets/preview.gif)
```

## Project structure

```text
3d-digital-universe/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   └── .gitkeep
├── .gitignore
├── LICENSE
└── README.md
```

## Run locally

Because the project uses JavaScript ES modules, serve it over HTTP rather than opening `index.html` directly from the filesystem.

### Option 1: Python

Install Python 3 if it is not already installed, open a terminal in the project folder, and run:

```bash
python -m http.server 8000
```

On Windows, this may also work:

```powershell
py -m http.server 8000
```

Open <http://localhost:8000>.

### Option 2: VS Code

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.

Libraries are loaded from public CDNs, so an internet connection is needed.

## Controls

- Move the pointer to influence the camera.
- Scroll to move through the page and shift the camera.
- Select a world card to change the core's color and transmission.
- Use **Meet the core** to jump to the experience section.
- Use the lower-left **MOTION ON/OFF** control to pause decorative motion.
- On small screens, use the navigation menu.

## Deploy with GitHub Pages

1. Create a new GitHub repository named `3d-digital-universe`.
2. Add the project files and push them to the repository's default branch.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select your default branch and `/ (root)`, then save.
6. Wait for the Pages deployment to finish. The site URL appears in the Pages settings.

This is a static website, so no build command or output folder is needed.

## Performance notes

- The renderer caps device pixel ratio (lower on mobile) to reduce GPU cost.
- The star count is reduced on narrow screens.
- Geometry is reused for repeated distant objects.
- No external 3D model files or large texture downloads are required.
- `prefers-reduced-motion` is respected and a motion toggle is provided.
- If performance is low, reduce the star counts in `js/main.js`, disable antialiasing, or lower the pixel-ratio caps.

## Accessibility and browser support

Use a current browser with WebGL support. The 3D background is decorative; the main content remains normal HTML. Interactive world cards are buttons, navigation has labels, and keyboard focus is visible. Reduced-motion preferences are respected.

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript (ES modules)
- [Three.js](https://threejs.org/)
- [GSAP](https://gsap.com/)
- Google Fonts: Orbitron and Space Grotesk

## Customization

- Change the palette in `:root` in `css/style.css`.
- Update `worldColors` and `worldMessages` in `js/main.js`.
- Edit copy and project sections in `index.html`.
- Replace the GitHub link in the Architecture section with your repository URL.

## Known limitations

- CDN dependencies require an internet connection.
- WebGL may be unavailable or restricted on some devices; in that case, the 3D background may not render, but the HTML content is still available.
- The current world cards are interactive visual states, not separate navigable 3D levels.
- The project has no backend, user accounts, or analytics.

## License

See [LICENSE](LICENSE). Replace the license and attribution details if you choose a different distribution model.
