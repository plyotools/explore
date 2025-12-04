// Utility script to clear featured/starred instances from localStorage
// Run this in the browser console while on the explore page

if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('featuredInstances');
  if (stored) {
    const featured = JSON.parse(stored);
    console.log('Currently featured instances:', featured);
    
    // Uncomment the line below to clear all featured instances:
    // localStorage.removeItem('featuredInstances');
    // console.log('Cleared all featured instances!');
    
    // Or to remove just byhagen:
    const updated = featured.filter(id => id !== 'byhagen');
    localStorage.setItem('featuredInstances', JSON.stringify(updated));
    console.log('Removed byhagen from featured. Remaining:', updated);
    console.log('Please refresh the page to see the changes.');
  } else {
    console.log('No featured instances found.');
  }
}
