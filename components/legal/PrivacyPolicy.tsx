import React from 'react'

export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
            <h1 className="text-3xl font-bold mb-8 text-white">Privacy Policy</h1>
            
            <section className="mb-8">
                <p className="mb-4">
                    Effective Date: May 23, 2026
                </p>
                <p className="mb-4">
                    Your privacy is important to us. This Privacy Policy explains how Trenchmap handles information when you use our 3D data visualization dApp.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">1. Information We Do Not Collect</h2>
                <p className="mb-4">
                    Trenchmap is designed with privacy in mind. We:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>DO NOT collect, store, or sell Personal Identifiable Information (PII) such as your name, email address, or physical address.</li>
                    <li>DO NOT store your IP address in any persistent database.</li>
                    <li>DO NOT track your activity across other websites or applications.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">2. Blockchain Data</h2>
                <p className="mb-4">
                    Trenchmap functions by reading public data from the Solana blockchain. This data is already publicly available to anyone with access to the blockchain. When you use Trenchmap:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>We process public wallet addresses to visualize token holdings and transactions.</li>
                    <li>This information is retrieved via public RPC nodes and third-party APIs.</li>
                    <li>We do not link blockchain addresses to any real-world identity.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">3. Local Storage and Cookies</h2>
                <p className="mb-4">
                    As a Progressive Web App (PWA), Trenchmap may use local storage and standard browser cookies to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Save your preferences (e.g., UI settings, favorite tokens).</li>
                    <li>Ensure the application functions correctly while offline or during low connectivity.</li>
                    <li>Improve performance by caching non-sensitive visualization data.</li>
                </ul>
                <p className="mb-4">
                    This data remains on your device and is not transmitted to our servers for the purpose of identifying you.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">4. Third-Party Services</h2>
                <p className="mb-4">
                    Trenchmap interacts with third-party service providers to function:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>RPC Providers:</strong> We use Solana RPC nodes to fetch live blockchain data. These providers may have their own privacy policies regarding temporary logging of requests.</li>
                    <li><strong>Market Data APIs:</strong> We may use third-party APIs for price and market capitalization data.</li>
                    <li><strong>Hosting:</strong> The application is hosted on platforms like Vercel or similar providers, which may collect minimal technical logs for security and performance monitoring.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">5. Data Security</h2>
                <p className="mb-4">
                    Since we do not collect personal information, there is no personal data database for us to secure. However, we employ industry-standard security practices to ensure the integrity of the application itself.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">6. Children's Privacy</h2>
                <p className="mb-4">
                    Trenchmap is not intended for use by children under the age of 18. We do not knowingly collect information from children.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">7. Changes to This Policy</h2>
                <p className="mb-4">
                    We may update our Privacy Policy from time to time. Any changes will be reflected by the "Effective Date" at the top of this page.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">8. Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, you can reach out through our official community channels or social media.
                </p>
            </section>
        </div>
    )
}
