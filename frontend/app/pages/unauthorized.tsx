// @ts-nocheck
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-destructive">Access Denied</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
