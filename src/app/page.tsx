import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Build faster with{" "}
            <span className="text-primary">TemplateStack</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
            A production-ready fullstack starter template with authentication,
            database, and a modern UI — so you can focus on building your
            product.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center rounded-md px-8 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/BemnetMussa/TemplateStack"
              target="_blank"
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-11 items-center rounded-md border px-8 text-sm font-medium transition-colors"
            >
              GitHub
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
                <h3 className="mb-2 text-lg font-semibold">Authentication</h3>
                <p className="text-muted-foreground text-sm">
                  Email/password auth with BetterAuth. Session management,
                  protected routes, and middleware included.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Database Ready</h3>
                <p className="text-muted-foreground text-sm">
                  PostgreSQL with Prisma ORM. Type-safe database access with
                  migrations and a clean schema.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Modern UI</h3>
                <p className="text-muted-foreground text-sm">
                  TailwindCSS and shadcn/ui components. Dark mode support,
                  responsive layouts, and accessible design.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Built with Next.js, Prisma, BetterAuth, and shadcn/ui.
          </p>
        </div>
      </footer>
    </>
  );
}
