export interface NearestBook {
    id: string;
    title: string;
    discount: string;
    price: number;
    imageUri: string;
    distance: string;
}

export interface Category {
    id: string;
    name: string;
}

export const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Scince Finction' },
    { id: '2', name: 'Romance' },
    { id: '3', name: 'Self Help' },
    { id: '4', name: 'Biography' },
    { id: '5', name: 'Business' },
    { id: '6', name: 'Engineering' },
    { id: '7', name: 'Medical' },
    { id: '8', name: 'Law' },
    { id: '9', name: 'Competitive Exams' },
    { id: '10', name: 'Biography' },
];

export const DISTANCE_FILTERS = [
    'Nearest To You',
    'Upto 20KM',
    'Upto 50KM',
    'Upto 100KM',
];

export const MOCK_NEAREST_BOOKS: NearestBook[] = [
    {
        id: '1',
        title: 'IKIGAI',
        discount: '75%',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
        distance: 'Nearest To You',
    },
    {
        id: '2',
        title: 'Rich Dad Poor Dad',
        discount: '50%',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop',
        distance: 'Upto 20KM',
    },
    {
        id: '3',
        title: '1984',
        discount: '30%',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
        distance: 'Nearest To You',
    },
    {
        id: '4',
        title: 'Sarah Waters',
        discount: '50%',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1629196914225-ebdd4da6af5a?q=80&w=400&auto=format&fit=crop',
        distance: 'Upto 50KM',
    },
    {
        id: '5',
        title: 'The Skin and Its Girl',
        discount: '50%',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
        distance: 'Nearest To You',
    },
    {
        id: '6',
        title: 'Wood Chair',
        discount: '60%',
        price: 230,
        imageUri: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop',
        distance: 'Upto 20KM',
    },
];
