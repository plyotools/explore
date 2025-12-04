// Utility to check what instances are currently featured/starred in localStorage
// Run this in the browser console while on the explore page

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('featuredInstances');
  if (stored) {
    const featured = JSON.parse(stored);
    console.log('Currently featured instances:', featured);
    console.log('Is byhagen featured?', featured.includes('byhagen'));
  } else {
    console.log('No featured instances found in localStorage.');
  }
  
  // Also check user role
  const role = localStorage.getItem('explore_user_role');
  const isAdmin = localStorage.getItem('explore_is_admin');
  const session = localStorage.getItem('explore_session');
  console.log('User role:', role);
  console.log('Is admin:', isAdmin);
  console.log('Session:', session);
}

