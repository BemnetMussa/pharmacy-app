import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar role="PHARMACIST" />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-primary">leyuMed</span> — your pharmacy,
            in focus
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            Track inventory, record sales in seconds, and see how the pharmacy
            is doing — from the counter or your phone.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center rounded-md px-8 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-11 items-center rounded-md border px-8 text-sm font-medium transition-colors"
            >
              Log In
            </Link>
          </div>
        </section>

        <section className="border-t py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              Everything you need
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Inventory</h3>
                <p className="text-muted-foreground text-sm">
                  Keep track of all your medicines — quantities, prices,
                  categories, and expiry dates with low-stock alerts.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Sales</h3>
                <p className="text-muted-foreground text-sm">
                  Record sales in seconds with automatic totals and stock
                  updates — optimized for the counter.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Reports</h3>
                <p className="text-muted-foreground text-sm">
                  See your revenue trends, best-selling medicines, and monthly
                  summaries with clear visual charts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            leyuMed — built for your pharmacy.
          </p>
        </div>
      </footer>
    </>
  );
}
