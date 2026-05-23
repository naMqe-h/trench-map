import { TermsOfUse } from "../../components/legal/TermsOfUse"
import Link from "next/link"

export default function TermsPage() {
    return (
        <main className="h-screen w-screen overflow-y-auto bg-[#202020] relative">
            <div className="absolute top-6 left-6">
                <Link 
                    href="/"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Back to Map
                </Link>
            </div>
            <TermsOfUse />
            <footer className="py-12 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>&copy; 2026 Trenchmap. All rights reserved.</p>
                <div className="mt-4 flex justify-center gap-6">
                    <Link href="/privacy" className="hover:text-gray-300 cursor-pointer">Privacy Policy</Link>
                </div>
            </footer>
        </main>
    )
}
