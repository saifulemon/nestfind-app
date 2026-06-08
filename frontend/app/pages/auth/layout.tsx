// @ts-nocheck
import { Link, Outlet } from 'react-router-dom';
import { GuestGuard } from '~/components/guards/GuestGuard';

export default function AuthLayout() {
  return (
    <div>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '18px', textDecoration: 'none', color: '#4A90D9' }}>
          NestFind
        </Link>
      </div>
      <GuestGuard>
        <Outlet />
      </GuestGuard>
    </div>
  );
}
