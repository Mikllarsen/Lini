# Til min Lini ❤️ Website

This repository contains a simple, professional, and responsive static website.

## How to host and access this website using GitHub Pages

Since this is a static website (HTML, CSS, JS), you can easily host it for free using **GitHub Pages**. Follow these steps to make the website accessible via a public URL:

1. **Push your code to GitHub**: Make sure this repository is pushed to your own GitHub account.
2. **Go to Repository Settings**: On your GitHub repository page, click on the **Settings** tab near the top.
3. **Navigate to Pages**: In the left sidebar, under the "Code and automation" section, click on **Pages**.
4. **Select the Source**:
   - Under the "Build and deployment" section, look for the **Source** dropdown.
   - Select **Deploy from a branch**.
   - Under the **Branch** section, select your main branch (usually `main` or `master`) and select the `/ (root)` folder.
   - Click **Save**.
5. **Wait for Deployment**: GitHub will now build and deploy your site. This usually takes a minute or two.
6. **Access your website**: Once deployed, the URL to your live website will be displayed at the top of the GitHub Pages settings page (typically `https://<your-username>.github.io/<repository-name>/`). Click the link to view your site!

## Local Development

To view the website locally on your computer:
1. Open a terminal in the project directory.
2. Run a local web server, for example with Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`.
