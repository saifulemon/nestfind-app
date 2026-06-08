// @ts-nocheck
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t py-8 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap justify-between gap-8">
        <div>
          <Link to="/" className="text-lg font-bold">NestFind</Link>
          <p className="text-sm text-muted-foreground mt-2">Find your perfect rental.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-8">
          <div>
            <h4 className="font-semibold mb-2">Renters</h4>
            <Link to="/search" className="block text-sm text-muted-foreground">Search</Link>
            <Link to="/favorites" className="block text-sm text-muted-foreground">Favorites</Link>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Company</h4>
            <Link to="/" className="block text-sm text-muted-foreground">About</Link>
            <Link to="/" className="block text-sm text-muted-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
