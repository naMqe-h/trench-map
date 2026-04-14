# TrenchMap

[![TrenchMap Live](https://img.shields.io/badge/Live-TrenchMap.xyz-brightgreen?style=for-the-badge)](https://www.trenchmap.xyz/)

Welcome to the trenches. TrenchMap transforms the chaotic Solana memecoin ecosystem into a living, breathing 3D world. Ditch the boring 2D charts and fly through a voxel landscape where every plot of land is a token.

Visit the live map at [www.trenchmap.xyz](https://www.trenchmap.xyz/).

![TrenchMap Screenshot](https://www.trenchmap.xyz/trenchmap.png)

## What is TrenchMap?

TrenchMap provides a novel, immersive way to explore the fast-paced world of Solana memecoins. Instead of scrolling through lists and charts, TrenchMap allows you to fly through a 3D landscape where the terrain, buildings, and activity are driven by market data. It's a data visualization tool, a discovery engine, and a unique way to engage with the crypto community, all built on a high performance WebGL foundation.

## Features

-   **High-Performance 3D Graphics**: Utilizes merged geometries and instancing to render a vast and complex world smoothly in your browser.
-   **Shader-Based Interactions**: Interactive hover and selection effects are implemented directly on the GPU with custom shaders for maximum performance.
-   **Real-Time Data Integration**: Key market data, such as trading volume and price action, is streamed from DexScreener to dynamically alter the visual landscape.
-   **Minimap HUD**: A responsive Heads-Up Display provides a 2D overview of the map, helping you navigate the world and quickly identify points of interest.
-   **Dynamic Voxel World**: The map is built from procedurally generated chunks, allowing for a scalable and ever-expanding universe of tokens.

## Tech Stack

TrenchMap is built with a modern, performant web technology stack:

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **3D Rendering**: [Three.js](https://threejs.org/)
-   **React-Three Bridge**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Database & Auth**: [Supabase](https://supabase.io/)
-   **Data Sources**: [Helius RPC](https://www.helius.dev/), [DexScreener API](https://docs.dexscreener.com/api/reference)

## Architecture & Local Development (Mock Data)

Our production backend data pipeline is proprietary and closed-source. To enable community contributions, running the project locally defaults to using `NEXT_PUBLIC_USE_MOCK_DATA=true`. This setting loads data from `public/mock-villages.json`, allowing contributors to do full UI/WebGL development and testing without needing access to the live production database.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need [Node.js](https://nodejs.org/en/download/) (version 18.x or higher) and npm installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/naMqe-h/trench-map.git
    cd trench-map
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env.local` file in the root of the project. You can copy the example file first.

    *   On Linux or macOS:
        ```sh
        cp .env.example .env.local
        ```
    *   On Windows (Command Prompt):
        ```cmd
        copy .env.example .env.local
        ```
    *   On Windows (PowerShell):
        ```powershell
        Copy-Item .env.example -Destination .env.local
        ```

4.  **Populate `.env.local`:**
    You will need to fill in the values in your new `.env.local` file.
    ```
    # For Solana blockchain data
    HELIUS_API_KEY=your_helius_api_key

    # For Supabase database
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
    ```
    **WARNING**: The `SUPABASE_SERVICE_ROLE` key has admin privileges and must **NEVER** be exposed on the client side. Only use it in server-side code (e.g., Next.js API routes or server functions).

    #### Obtaining Credentials
    *   **Supabase**:
        1.  Go to [supabase.com](https://supabase.com/) and create a new project.
        2.  Navigate to your project's **Settings** > **API**.
        3.  Under "Project API keys", you will find the **Project URL** (`SUPABASE_URL`) and the public **anon key** (`SUPABASE_ANON_KEY`).
        4.  Under the same section, you will find the secret **service_role key** (`SUPABASE_SERVICE_ROLE`). Treat this key like a password.
    *   **Helius API Key**:
        1.  Go to [helius.dev](https://www.helius.dev/) and sign up for an account.
        2.  Create a new project to get a free RPC API key.
        3.  Copy your API key and set it as the `HELIUS_API_KEY` value.

5.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
