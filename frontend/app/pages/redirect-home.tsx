// @ts-nocheck
import { redirect } from 'react-router';
import type { Route } from './+types/redirect-home';

export function loader(_: Route.LoaderArgs) {
  return redirect('/search');
}

export default function RedirectHome() {
  return null;
}
