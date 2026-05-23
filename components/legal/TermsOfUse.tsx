import React from 'react'

export function TermsOfUse() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
            <h1 className="text-3xl font-bold mb-8 text-white">Terms of Use</h1>
            
            <section className="mb-8">
                <p className="mb-4">
                    Effective Date: May 23, 2026
                </p>
                <p className="mb-4">
                    Welcome to Trenchmap. By accessing or using our application, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use our services.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">1. Nature of Service</h2>
                <p className="mb-4">
                    Trenchmap is a 3D data visualization tool for the Solana blockchain ecosystem. It provides visual representations of public on-chain data, including market capitalization, volume, and holder distribution.
                </p>
                <p className="mb-4 font-semibold text-yellow-500">
                    Important: Trenchmap is strictly an informational tool. It does not provide financial, investment, legal, or tax advice.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">2. No Financial Advice (NFA)</h2>
                <p className="mb-4">
                    All information provided by Trenchmap is for educational and entertainment purposes only. You should not treat any information provided by the application as a recommendation to buy, sell, or hold any cryptocurrency or digital asset. We encourage you to consult with a qualified financial advisor before making any investment decisions.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">3. Data Accuracy and Availability</h2>
                <p className="mb-4">
                    Trenchmap relies on external RPC (Remote Procedure Call) providers and third-party APIs to fetch blockchain data. While we strive to provide accurate and up-to-date information:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>We do not guarantee the accuracy, completeness, or reliability of any data presented.</li>
                    <li>Data may be delayed, incomplete, or incorrect due to issues with external providers or blockchain latency.</li>
                    <li>The application is provided "as is" and "as available" without any warranties of any kind.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">4. Non-Custodial Nature</h2>
                <p className="mb-4">
                    Trenchmap is a non-custodial application. We:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>DO NOT store your private keys or seed phrases.</li>
                    <li>DO NOT manage user funds or facilitate the exchange of assets.</li>
                    <li>DO NOT have access to your wallet or its contents.</li>
                </ul>
                <p className="mb-4">
                    You are solely responsible for the security of your own digital assets and wallets.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">5. Risk Disclosure</h2>
                <p className="mb-4">
                    The cryptocurrency market, particularly the memecoin ecosystem, is highly volatile and speculative. By using Trenchmap, you acknowledge that you are aware of the risks associated with digital assets, including the potential for total loss of funds.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">6. Limitation of Liability</h2>
                <p className="mb-4">
                    To the maximum extent permitted by law, Trenchmap and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the application or any information contained therein.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">7. Intellectual Property</h2>
                <p className="mb-4">
                    The software, design, and original content of Trenchmap are the intellectual property of the project creators. You may not reproduce, distribute, or create derivative works without explicit permission.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">8. Changes to Terms</h2>
                <p className="mb-4">
                    We reserve the right to modify these terms at any time. Your continued use of the application after changes are posted constitutes your acceptance of the new terms.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">9. Governing Law</h2>
                <p className="mb-4">
                    These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the project operates, without regard to its conflict of law provisions.
                </p>
            </section>
        </div>
    )
}
