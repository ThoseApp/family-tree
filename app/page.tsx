import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, ImageIcon, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kith & Kin</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Connect With Your Family
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Preserve your family history, share memories, and stay connected
            with your loved ones through our comprehensive family platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything Your Family Needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Tree</h3>
              <p className="text-gray-600">
                Build and explore your family connections across generations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Family Events</h3>
              <p className="text-gray-600">
                Plan and organize family gatherings, reunions, and celebrations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Photo Gallery</h3>
              <p className="text-gray-600">
                Share and preserve your family memories in organized albums.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private & Secure</h3>
              <p className="text-gray-600">
                Your family information stays private and secure within your
                network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Families Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "Kith & Kin has transformed how our family stays connected. We're spread across three continents but feel closer than ever.",
                name: "The Johnson Family",
              },
              {
                quote:
                  "The family tree feature helped us discover relatives we didn't know we had. It's been an amazing journey of discovery.",
                name: "The Garcia Family",
              },
              {
                quote:
                  "Planning our annual reunion became so much easier. Everyone can see the details and RSVP in one place.",
                name: "The Smith Family",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg border border-gray-200"
              >
                <p className="italic text-gray-600 mb-4">
                  &quot;{testimonial.quote}&quot;
                </p>
                <p className="font-semibold">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Your Family Journey Today
          </h2>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-primary-foreground/90">
            Join thousands of families who are preserving their history and
            strengthening their bonds.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Create Your Family Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">Kith & Kin</h2>
              <p className="text-gray-600">
                Connecting families, preserving legacies
              </p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="font-semibold mb-2">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-600 hover:text-primary">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} Kith & Kin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
