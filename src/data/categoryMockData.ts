import { MasonryCategoryData, Book, Ratings } from './models';

const mockRatings: Ratings = {
  average: 4.6,
  totalReviews: 128,
  fiveStar: 80,
  fourStar: 30,
  threeStar: 10,
  twoStar: 5,
  oneStar: 3,
};


const createMockBook = (id: string, title: string, imageUri: string, price: number, discount?: string): Book => ({
  id,
  title,
  imageUri,
  price,
  discount,
  author: 'Sample Author',
  condition: 'Used • Good',
  ratings: mockRatings,
});

export const CATEGORY_DATA: Record<string, MasonryCategoryData> = {
  'ScinceFinction': {
    subtitle: 'The Art of the Possible',
    left: [
      createMockBook('1', 'Project Hail Mary', 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', 290),
      createMockBook('2', '1984', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', 290),
      createMockBook('3', 'Dune', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 290),
    ],
    right: [
      createMockBook('4', 'The War of the Worlds', 'https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=400&h=600&fit=crop', 290, '60% off'),
      createMockBook('5', 'The Martian Chronicles', 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', 290, '60% off'),
      createMockBook('6', 'The 101', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 290),
    ]
  },
  'Romance': {
    subtitle: 'Stories of Love',
    left: [
      createMockBook('r1', 'Pride and Prejudice', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 250),
      createMockBook('r2', 'The Notebook', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 199),
      createMockBook('r5', 'Jane Eyre', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', 220),
    ],
    right: [
      createMockBook('r3', 'Me Before You', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 290, '50% off'),
      createMockBook('r4', 'A Walk to Remember', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 180),
      createMockBook('r6', 'Sense and Sensibility', 'https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=400&h=600&fit=crop', 210, '10% off'),
    ]
  },
  'SelfHelp': {
    subtitle: 'Improve Your Life',
    left: [
      createMockBook('s1', 'Atomic Habits', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 450),
      createMockBook('s2', 'The Power of Habit', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 300),
      createMockBook('s5', 'Mindset', 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', 320),
    ],
    right: [
      createMockBook('s3', 'Deep Work', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 350, '20% off'),
      createMockBook('s4', 'Think and Grow Rich', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 250),
      createMockBook('s6', 'The 5AM Club', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', 280, '15% off'),
    ]
  },
  'Biography': {
    subtitle: 'Lives of the Greats',
    left: [
      createMockBook('b1', 'Steve Jobs', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 500),
      createMockBook('b3', 'Einstein', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', 450),
      createMockBook('b5', 'Long Walk to Freedom', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 380),
    ],
    right: [
      createMockBook('b2', 'Becoming', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 400, '10% off'),
      createMockBook('b4', 'Shoe Dog', 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', 350),
      createMockBook('b6', 'The Diary of a Young Girl', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 200, '5% off'),
    ]
  },
  'Business': {
    subtitle: 'Master the Market',
    left: [
      createMockBook('bus1', 'Zero to One', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop', 300),
      createMockBook('bus3', 'The Lean Startup', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 380),
      createMockBook('bus5', 'Dare to Lead', 'https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop', 410),
    ],
    right: [
      createMockBook('bus4', 'Rich Dad Poor Dad', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 280, '20% off'),
      createMockBook('bus2', 'Good to Great', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 350),
      createMockBook('bus6', 'Built to Last', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop', 330, '30% off'),
    ]
  },
  'Engineering': {
    subtitle: 'Build the Future',
    left: [
      createMockBook('eng1', 'Introduction to Algorithms', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=600&fit=crop', 800, '10% off'),
      createMockBook('eng2', 'Clean Code', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop', 600),
      createMockBook('eng3', 'Design Patterns', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=600&fit=crop', 650),
    ],
    right: [
      createMockBook('eng4', 'The Pragmatic Programmer', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop', 550, '15% off'),
      createMockBook('eng5', 'Structure and Interpretation', 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=600&fit=crop', 700),
      createMockBook('eng6', 'Code Complete', 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=600&fit=crop', 850, '5% off'),
    ]
  },
  'Medical': {
    subtitle: 'Healing and Science',
    left: [
      createMockBook('med1', 'Gray\'s Anatomy', 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=600&fit=crop', 1200, '20% off'),
      createMockBook('med2', 'Harrison\'s Principles', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=600&fit=crop', 1500),
      createMockBook('med3', 'Robbins Pathology', 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=600&fit=crop', 900),
    ],
    right: [
      createMockBook('med4', 'Guyton Physiology', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=600&fit=crop', 1100, '10% off'),
      createMockBook('med5', 'Netter\'s Atlas', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=600&fit=crop', 1300),
      createMockBook('med6', 'First Aid for the USMLE', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=600&fit=crop', 800, '5% off'),
    ]
  },
  'Law': {
    subtitle: 'Justice and Order',
    left: [
      createMockBook('law1', 'The Rule of Law', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 500),
      createMockBook('law2', 'Constitutional Law', 'https://images.unsplash.com/photo-1505664159891-b9b5a88ba881?w=400&h=600&fit=crop', 650, '10% off'),
      createMockBook('law3', 'Criminal Law', 'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=400&h=600&fit=crop', 450),
    ],
    right: [
      createMockBook('law4', 'Contracts', 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=600&fit=crop', 550, '5% off'),
      createMockBook('law5', 'Torts', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=600&fit=crop', 400),
      createMockBook('law6', 'Property Law', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop', 600, '15% off'),
    ]
  },
  'CompetitiveExams': {
    subtitle: 'Prepare to Succeed',
    left: [
      createMockBook('comp1', 'Quantitative Aptitude', 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=600&fit=crop', 400, '25% off'),
      createMockBook('comp2', 'Verbal Reasoning', 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=400&h=600&fit=crop', 350),
      createMockBook('comp3', 'General Knowledge 2024', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop', 250),
    ],
    right: [
      createMockBook('comp4', 'UPSC Prelims Guide', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=600&fit=crop', 800, '30% off'),
      createMockBook('comp5', 'Bank PO Solved Papers', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop', 450),
      createMockBook('comp6', 'CAT Data Interpretation', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop', 500, '10% off'),
    ]
  }
};

export interface CategoryItem {
  id: string;
  label: string;
  imageUri: string;
  screenName: string;
}

export const CATEGORIES_LIST: CategoryItem[] = [
  { id: '1', label: 'Romance', imageUri: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200', screenName: 'Romance' },
  { id: '2', label: 'Self Help', imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200', screenName: 'SelfHelp' },
  { id: '3', label: 'Science Fiction', imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200', screenName: 'ScinceFinction' },
  { id: '4', label: 'Biography', imageUri: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200', screenName: 'Biography' },
  { id: '5', label: 'Business', imageUri: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200', screenName: 'Business' },
  { id: '6', label: 'Engineering', imageUri: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200', screenName: 'Engineering' },
  { id: '7', label: 'Medical', imageUri: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=200', screenName: 'Medical' },
  { id: '8', label: 'Law', imageUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200', screenName: 'Law' },
  { id: '9', label: 'Competitive Exams', imageUri: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200', screenName: 'CompetitiveExams' },
];
