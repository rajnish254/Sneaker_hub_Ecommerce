
import SignupForm from './SignupForm';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-screen bg-[#0f1621]">
        
        <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-2">Join SneakHub</h1>
              <p className="text-[#bfc8e6]">Create your account and start shopping</p>
            </div>
            
            <SignupForm />

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-[#2d3f52]">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h3 className="text-white font-bold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-[#7a8ba8]">
                    <li><a href="#" className="hover:text-white transition">Home</a></li>
                    <li><a href="#" className="hover:text-white transition">Shop</a></li>
                    <li><a href="#" className="hover:text-white transition">About</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-4">Support</h3>
                  <ul className="space-y-2 text-sm text-[#7a8ba8]">
                    <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                    <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                    <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm text-[#7a8ba8]">
                    <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                    <li><a href="#" className="hover:text-white transition">Terms</a></li>
                    <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

