// @ts-nocheck
import { Link, Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div>
      <header style={{ padding: '12px 24px', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '20px', textDecoration: 'none', color: '#4A90D9' }}>
          NestFind
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
