import { BookItem } from '@/components/ui/CategoryMasonryLayout';

export const CATEGORY_DATA: Record<string, { subtitle: string, left: BookItem[], right: BookItem[] }> = {
  'ScinceFinction': {
    subtitle: 'The Art of the Possible',
    left: [
      { id: '1', title: 'Project Hail Mary', imageUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', price: 290 },
      { id: '2', title: '1984', imageUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', price: 290 },
      { id: '3', title: 'Dune', imageUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', price: 290 },
    ],
    right: [
      { id: '4', title: 'The War of the Worlds', imageUri: 'https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=400&h=600&fit=crop', price: 290, discount: '60% off', stock: '2 left' },
      { id: 'empty', title: '', imageUri: '', price: 0, empty: true },
      { id: '5', title: 'The Martian Chronicles', imageUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', price: 290, discount: '60% off', stock: '2 left' },
      { id: '6', title: 'The 101', imageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', price: 290 },
    ]
  },
  'Romance': {
    subtitle: 'Stories of Love',
    left: [
      { id: 'r1', title: 'Pride and Prejudice', imageUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', price: 250 },
      { id: 'r2', title: 'The Notebook', imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', price: 199 },
      { id: 'r5', title: 'Jane Eyre', imageUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', price: 220 },
    ],
    right: [
      { id: 'r3', title: 'Me Before You', imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', price: 290, discount: '50% off', stock: '1 left' },
      { id: 'empty', title: '', imageUri: '', price: 0, empty: true },
      { id: 'r4', title: 'A Walk to Remember', imageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', price: 180 },
      { id: 'r6', title: 'Sense and Sensibility', imageUri: 'https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=400&h=600&fit=crop', price: 210, discount: '10% off', stock: '4 left' },
    ]
  },
  'SelfHelp': {
    subtitle: 'Improve Your Life',
    left: [
      { id: 's1', title: 'Atomic Habits', imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', price: 450 },
      { id: 's2', title: 'The Power of Habit', imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', price: 300 },
      { id: 's5', title: 'Mindset', imageUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', price: 320 },
    ],
    right: [
      { id: 's3', title: 'Deep Work', imageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', price: 350, discount: '20% off', stock: '5 left' },
      { id: 'empty', title: '', imageUri: '', price: 0, empty: true },
      { id: 's4', title: 'Think and Grow Rich', imageUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', price: 250 },
      { id: 's6', title: 'The 5AM Club', imageUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', price: 280, discount: '15% off', stock: '2 left' },
    ]
  },
  'Biography': {
    subtitle: 'Lives of the Greats',
    left: [
      { id: 'b1', title: 'Steve Jobs', imageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', price: 500 },
      { id: 'b3', title: 'Einstein', imageUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', price: 450 },
      { id: 'b5', title: 'Long Walk to Freedom', imageUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', price: 380 },
    ],
    right: [
      { id: 'b2', title: 'Becoming', imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', price: 400, discount: '10% off', stock: '3 left' },
      { id: 'empty', title: '', imageUri: '', price: 0, empty: true },
      { id: 'b4', title: 'Shoe Dog', imageUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', price: 350 },
      { id: 'b6', title: 'The Diary of a Young Girl', imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', price: 200, discount: '5% off', stock: '10 left' },
    ]
  },
  'Business': {
    subtitle: 'Master the Market',
    left: [
      { id: 'bus1', title: 'Zero to One', imageUri: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', price: 300 },
      { id: 'bus3', title: 'The Lean Startup', imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', price: 380 },
      { id: 'bus5', title: 'Dare to Lead', imageUri: 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', price: 410 },
    ],
    right: [
      { id: 'bus4', title: 'Rich Dad Poor Dad', imageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', price: 280, discount: '20% off', stock: '8 left' },
      { id: 'empty', title: '', imageUri: '', price: 0, empty: true },
      { id: 'bus2', title: 'Good to Great', imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', price: 350 },
      { id: 'bus6', title: 'Built to Last', imageUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', price: 330, discount: '30% off', stock: '1 left' },
    ]
  }
};
