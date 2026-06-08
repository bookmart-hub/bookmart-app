export interface Author {
    id: string;
    name: string;
    bio: string;
    imageUri: string;
    category: string;
}

export const AUTHOR_CATEGORIES = [
    'All',
    'Poets',
    'Playwrights',
    'Novelists',
    'Journalists',
    'Biographers',
];

export const MOCK_AUTHORS: Author[] = [
    {
        id: '1',
        name: 'John Freeman',
        bio: 'American writer he was the editor of the',
        imageUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        category: 'Journalists',
    },
    {
        id: '2',
        name: 'Adam Dalva',
        bio: 'He is the senior fiction editor of guernica ma',
        imageUri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop',
        category: 'Novelists',
    },
    {
        id: '3',
        name: 'Abraham verghese',
        bio: 'He is the professor and Linda R . Meier and',
        imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        category: 'Novelists',
    },
    {
        id: '4',
        name: 'Tess Gunty',
        bio: 'Gunty was born and raised in south bend,indiana',
        imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
        category: 'Novelists',
    },
    {
        id: '5',
        name: 'Ann Napolitano',
        bio: 'She is the author of the novels A Good Hard',
        imageUri: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop',
        category: 'Novelists',
    },
    {
        id: '6',
        name: 'Hernan Diaz',
        bio: 'Lorem ipsum dolor sit amet...',
        imageUri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
        category: 'Playwrights',
    },
];
