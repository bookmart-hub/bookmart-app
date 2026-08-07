import { MasonryCategoryData, Book, Ratings, FeedItem } from "./models";

const mockRatings: Ratings = {
  average: 4.6,
  totalReviews: 128,
  fiveStar: 80,
  fourStar: 30,
  threeStar: 10,
  twoStar: 5,
  oneStar: 3,
};

const createMockBook = (
  id: string,
  title: string,
  coverUri: string,
  price: number,
  genre: string,
  author: string,
  discount?: string,
  stock?: string
): Book => ({
  id,
  title,
  coverUri,
  price,
  discount: discount || "20% off",
  genre,
  author,
  condition: "Used • Good",
  ratings: mockRatings,
  stock: stock,
});

export const GENRE_DATA: Record<string, MasonryCategoryData> = {
  ScienceFiction: {
    items: [
      {
        type: "header",
        id: "h_ScienceFiction",
        title: "Science Fiction",
        subtitle: "The Art of the Possible",
      },
      {
        type: "book",
        id: "bl_0_ScienceFiction",
        book: createMockBook(
          "1",
          "Project Hail Mary",
          "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop",
          290,
          "Science Fiction",
          "Andy Weir"
        ),
      },
      {
        type: "book",
        id: "br_0_ScienceFiction",
        book: createMockBook(
          "4",
          "The War of the Worlds",
          "https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=400&h=600&fit=crop",
          290,
          "Science Fiction",
          "H.G. Wells",
          "60% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_ScienceFiction",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_ScienceFiction",
        book: createMockBook(
          "2",
          "1984",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          290,
          "Science Fiction",
          "George Orwell"
        ),
      },
      {
        type: "book",
        id: "br_1_ScienceFiction",
        book: createMockBook(
          "5",
          "The Martian Chronicles",
          "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop",
          290,
          "Science Fiction",
          "Ray Bradbury",
          "60% off"
        ),
      },
      {
        type: "book",
        id: "bl_2_ScienceFiction",
        book: createMockBook(
          "3",
          "Dune",
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
          290,
          "Science Fiction",
          "Frank Herbert"
        ),
      },
      {
        type: "book",
        id: "br_2_ScienceFiction",
        book: createMockBook(
          "6",
          "The Time Machine",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
          290,
          "Science Fiction",
          "H.G. Wells"
        ),
      },
    ],
  },
  Romance: {
    items: [
      {
        type: "header",
        id: "h_Romance",
        title: "Romance",
        subtitle: "Stories of Love",
      },
      {
        type: "book",
        id: "bl_0_Romance",
        book: createMockBook(
          "r1",
          "Pride and Prejudice",
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
          250,
          "Romance",
          "Jane Austen"
        ),
      },
      {
        type: "book",
        id: "br_0_Romance",
        book: createMockBook(
          "r3",
          "Me Before You",
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          290,
          "Romance",
          "Jojo Moyes",
          "50% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_Romance",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_Romance",
        book: createMockBook(
          "r2",
          "The Notebook",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          199,
          "Romance",
          "Nicholas Sparks",
          "10% off"
        ),
      },
      {
        type: "book",
        id: "br_1_Romance",
        book: createMockBook(
          "r4",
          "A Walk to Remember",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
          180,
          "Romance",
          "Nicholas Sparks"
        ),
      },
      {
        type: "book",
        id: "bl_2_Romance",
        book: createMockBook(
          "r5_1",
          "Jane Eyre",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          220,
          "Romance",
          "Charlotte Brontë"
        ),
      },
      {
        type: "book",
        id: "br_2_Romance",
        book: createMockBook(
          "r5_2",
          "Jane Eyre",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          200,
          "Romance",
          "Charlotte Brontë"
        ),
      },
      {
        type: "book",
        id: "bl_2_Romance_extra",
        book: createMockBook(
          "r5_3",
          "Jane Eyre",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          190,
          "Romance",
          "Charlotte Brontë"
        ),
      },
      {
        type: "book",
        id: "br_3_Romance",
        book: createMockBook(
          "r6",
          "Sense and Sensibility",
          "https://images.unsplash.com/photo-1629196914225-eb488db9f0eb?w=400&h=600&fit=crop",
          210,
          "Romance",
          "Jane Austen",
          "10% off"
        ),
      },
      {
        type: "book",
        id: "bl_3_Romance",
        book: createMockBook(
          "r7",
          "The Notebook",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          150,
          "Romance",
          "Nicholas Sparks"
        ),
      },
      {
        type: "book",
        id: "br_3_Romance",
        book: createMockBook(
          "r8",
          "The Notebook",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          175,
          "Romance",
          "Nicholas Sparks",
          "15% off"
        ),
      },
      {
        type: "book",
        id: "bl_4_Romance",
        book: createMockBook(
          "r9",
          "The Notebook",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          210,
          "Romance",
          "Nicholas Sparks"
        ),
      },
    ],
  },
  SelfHelp: {
    items: [
      {
        type: "header",
        id: "h_SelfHelp",
        title: "Self Help",
        subtitle: "Improve Your Life",
      },
      {
        type: "book",
        id: "bl_0_SelfHelp",
        book: createMockBook(
          "s1",
          "Atomic Habits",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          450,
          "Self Help",
          "James Clear"
        ),
      },
      {
        type: "book",
        id: "br_0_SelfHelp",
        book: createMockBook(
          "s3",
          "Deep Work",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
          350,
          "Self Help",
          "Cal Newport",
          "20% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_SelfHelp",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_SelfHelp",
        book: createMockBook(
          "s2",
          "The Power of Habit",
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          300,
          "Self Help",
          "Charles Duhigg"
        ),
      },
      {
        type: "book",
        id: "br_1_SelfHelp",
        book: createMockBook(
          "s4",
          "Think and Grow Rich",
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
          250,
          "Self Help",
          "Napoleon Hill"
        ),
      },
      {
        type: "book",
        id: "bl_2_SelfHelp",
        book: createMockBook(
          "s5",
          "Mindset",
          "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop",
          320,
          "Self Help",
          "Carol S. Dweck"
        ),
      },
      {
        type: "book",
        id: "br_2_SelfHelp",
        book: createMockBook(
          "s6",
          "The 5AM Club",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          280,
          "Self Help",
          "Robin Sharma",
          "15% off"
        ),
      },
    ],
  },
  Biography: {
    items: [
      {
        type: "header",
        id: "h_Biography",
        title: "Biography",
        subtitle: "Lives of the Greats",
      },
      {
        type: "book",
        id: "bl_0_Biography",
        book: createMockBook(
          "b1",
          "Steve Jobs",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
          500,
          "Biography",
          "Walter Isaacson"
        ),
      },
      {
        type: "book",
        id: "br_0_Biography",
        book: createMockBook(
          "b2",
          "Becoming",
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          400,
          "Biography",
          "Michelle Obama",
          "10% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_Biography",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_Biography",
        book: createMockBook(
          "b3",
          "Einstein",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          450,
          "Biography",
          "Walter Isaacson"
        ),
      },
      {
        type: "book",
        id: "br_1_Biography",
        book: createMockBook(
          "b4",
          "Shoe Dog",
          "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop",
          350,
          "Biography",
          "Phil Knight"
        ),
      },
      {
        type: "book",
        id: "bl_2_Biography",
        book: createMockBook(
          "b5",
          "Long Walk to Freedom",
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
          380,
          "Biography",
          "Nelson Mandela"
        ),
      },
      {
        type: "book",
        id: "br_2_Biography",
        book: createMockBook(
          "b6",
          "The Diary of a Young Girl",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          200,
          "Biography",
          "Anne Frank",
          "5% off"
        ),
      },
    ],
  },
  Business: {
    items: [
      {
        type: "header",
        id: "h_Business",
        title: "Business",
        subtitle: "Master the Market",
      },
      {
        type: "book",
        id: "bl_0_Business",
        book: createMockBook(
          "bus1",
          "Zero to One",
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop",
          300,
          "Business",
          "Peter Thiel"
        ),
      },
      {
        type: "book",
        id: "br_0_Business",
        book: createMockBook(
          "bus4",
          "Rich Dad Poor Dad",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
          280,
          "Business",
          "Robert T. Kiyosaki",
          "20% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_Business",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_Business",
        book: createMockBook(
          "bus3",
          "The Lean Startup",
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
          380,
          "Business",
          "Eric Ries"
        ),
      },
      {
        type: "book",
        id: "br_1_Business",
        book: createMockBook(
          "bus2",
          "Good to Great",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
          350,
          "Business",
          "Jim Collins"
        ),
      },
      {
        type: "book",
        id: "bl_2_Business",
        book: createMockBook(
          "bus5",
          "Dare to Lead",
          "https://images.unsplash.com/photo-1614214560195-2eb49ebde0be?w=400&h=600&fit=crop",
          410,
          "Business",
          "Brené Brown"
        ),
      },
      {
        type: "book",
        id: "br_2_Business",
        book: createMockBook(
          "bus6",
          "Built to Last",
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
          330,
          "Business",
          "Jim Collins",
          "30% off"
        ),
      },
    ],
  },
  Engineering: {
    items: [
      {
        type: "header",
        id: "h_Engineering",
        title: "Engineering",
        subtitle: "Build the Future",
      },
      {
        type: "book",
        id: "bl_0_Engineering",
        book: createMockBook(
          "eng1",
          "Introduction to Algorithms",
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=600&fit=crop",
          800,
          "Engineering",
          "Thomas H. Cormen",
          "10% off"
        ),
      },
      {
        type: "book",
        id: "br_0_Engineering",
        book: createMockBook(
          "eng4",
          "The Pragmatic Programmer",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop",
          550,
          "Engineering",
          "Andrew Hunt",
          "15% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_Engineering",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_Engineering",
        book: createMockBook(
          "eng2",
          "Clean Code",
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=600&fit=crop",
          600,
          "Engineering",
          "Robert C. Martin"
        ),
      },
      {
        type: "book",
        id: "br_1_Engineering",
        book: createMockBook(
          "eng5",
          "Structure and Interpretation",
          "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&h=600&fit=crop",
          700,
          "Engineering",
          "Harold Abelson"
        ),
      },
      {
        type: "book",
        id: "bl_2_Engineering",
        book: createMockBook(
          "eng3",
          "Design Patterns",
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=600&fit=crop",
          650,
          "Engineering",
          "Erich Gamma"
        ),
      },
      {
        type: "book",
        id: "br_2_Engineering",
        book: createMockBook(
          "eng6",
          "Code Complete",
          "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=600&fit=crop",
          850,
          "Engineering",
          "Steve McConnell",
          "5% off"
        ),
      },
    ],
  },
  Medical: {
    items: [
      {
        type: "header",
        id: "h_Medical",
        title: "Medical",
        subtitle: "Healing and Science",
      },
      {
        type: "book",
        id: "bl_0_Medical",
        book: createMockBook(
          "med1",
          "Gray's Anatomy",
          "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=600&fit=crop",
          1200,
          "Medical",
          "Henry Gray",
          "20% off"
        ),
      },
      {
        type: "book",
        id: "br_0_Medical",
        book: createMockBook(
          "med4",
          "Guyton Physiology",
          "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=600&fit=crop",
          1100,
          "Medical",
          "Arthur Guyton",
          "10% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_Medical",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_Medical",
        book: createMockBook(
          "med2",
          "Harrison's Principles",
          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=600&fit=crop",
          1500,
          "Medical",
          "Tinsley R. Harrison"
        ),
      },
      {
        type: "book",
        id: "br_1_Medical",
        book: createMockBook(
          "med5",
          "Netter's Atlas",
          "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=600&fit=crop",
          1300,
          "Medical",
          "Frank H. Netter"
        ),
      },
      {
        type: "book",
        id: "bl_2_Medical",
        book: createMockBook(
          "med3",
          "Robbins Pathology",
          "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&h=600&fit=crop",
          900,
          "Medical",
          "Stanley Robbins"
        ),
      },
      {
        type: "book",
        id: "br_2_Medical",
        book: createMockBook(
          "med6",
          "First Aid for the USMLE",
          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=600&fit=crop",
          800,
          "Medical",
          "Tao Le",
          "5% off"
        ),
      },
    ],
  },
  Law: {
    items: [
      {
        type: "header",
        id: "h_Law",
        title: "Law",
        subtitle: "Justice and Order",
      },
      {
        type: "book",
        id: "bl_0_Law",
        book: createMockBook(
          "law1",
          "The Rule of Law",
          "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
          500,
          "Law",
          "Tom Bingham"
        ),
      },
      {
        type: "book",
        id: "br_0_Law",
        book: createMockBook(
          "law4",
          "Contracts",
          "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=600&fit=crop",
          550,
          "Law",
          "E. Allan Farnsworth",
          "5% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_Law",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_Law",
        book: createMockBook(
          "law2",
          "Constitutional Law",
          "https://images.unsplash.com/photo-1505664159891-b9b5a88ba881?w=400&h=600&fit=crop",
          650,
          "Law",
          "Erwin Chemerinsky",
          "10% off"
        ),
      },
      {
        type: "book",
        id: "br_1_Law",
        book: createMockBook(
          "law5",
          "Torts",
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=600&fit=crop",
          400,
          "Law",
          "William Prosser"
        ),
      },
      {
        type: "book",
        id: "bl_2_Law",
        book: createMockBook(
          "law3",
          "Criminal Law",
          "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=400&h=600&fit=crop",
          450,
          "Law",
          "Wayne R. LaFave"
        ),
      },
      {
        type: "book",
        id: "br_2_Law",
        book: createMockBook(
          "law6",
          "Property Law",
          "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
          600,
          "Law",
          "Jesse Dukeminier",
          "15% off"
        ),
      },
    ],
  },
  CompetitiveExams: {
    items: [
      {
        type: "header",
        id: "h_CompetitiveExams",
        title: "Competitive Exams",
        subtitle: "Prepare to Succeed",
      },
      {
        type: "book",
        id: "bl_0_CompetitiveExams",
        book: createMockBook(
          "comp1",
          "Quantitative Aptitude",
          "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=600&fit=crop",
          400,
          "Competitive Exams",
          "R.S. Aggarwal",
          "25% off"
        ),
      },
      {
        type: "book",
        id: "br_0_CompetitiveExams",
        book: createMockBook(
          "comp4",
          "UPSC Prelims Guide",
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=600&fit=crop",
          800,
          "Competitive Exams",
          "Nitin Singhania",
          "30% off"
        ),
      },
      {
        type: "ad",
        id: "ad_0_CompetitiveExams",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=200&fit=crop",
      },
      {
        type: "book",
        id: "bl_1_CompetitiveExams",
        book: createMockBook(
          "comp2",
          "Verbal Reasoning",
          "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=400&h=600&fit=crop",
          350,
          "Competitive Exams",
          "R.S. Aggarwal"
        ),
      },
      {
        type: "book",
        id: "br_1_CompetitiveExams",
        book: createMockBook(
          "comp5",
          "Bank PO Solved Papers",
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop",
          450,
          "Competitive Exams",
          "Kiran Prakashan"
        ),
      },
      {
        type: "book",
        id: "bl_2_CompetitiveExams",
        book: createMockBook(
          "comp3",
          "General Knowledge 2024",
          "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop",
          250,
          "Competitive Exams",
          "Arihant Experts"
        ),
      },
      {
        type: "book",
        id: "br_2_CompetitiveExams",
        book: createMockBook(
          "comp6",
          "CAT Data Interpretation",
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop",
          500,
          "Competitive Exams",
          "Arun Sharma",
          "10% off"
        ),
      },
    ],
  },
};

export interface GenreItem {
  id: string;
  label: string;
  imageUri: string;
  screenName: string;
}

export const GENRES_LIST: GenreItem[] = [
  {
    id: "1",
    label: "Romance",
    imageUri: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200",
    screenName: "Romance",
  },
  {
    id: "2",
    label: "Self Help",
    imageUri: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200",
    screenName: "SelfHelp",
  },
  {
    id: "3",
    label: "Science Fiction",
    imageUri: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200",
    screenName: "ScienceFiction",
  },
  {
    id: "4",
    label: "Biography",
    imageUri: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200",
    screenName: "Biography",
  },
  {
    id: "5",
    label: "Business",
    imageUri: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=200",
    screenName: "Business",
  },
  {
    id: "6",
    label: "Engineering",
    imageUri: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200",
    screenName: "Engineering",
  },
  {
    id: "7",
    label: "Medical",
    imageUri: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=200",
    screenName: "Medical",
  },
  {
    id: "8",
    label: "Law",
    imageUri: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=200",
    screenName: "Law",
  },
  {
    id: "9",
    label: "Competitive Exams",
    imageUri: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200",
    screenName: "CompetitiveExams",
  },
];
