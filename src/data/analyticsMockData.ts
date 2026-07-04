export interface ChartDataPoint {
    value: number;
    label: string;
}

export interface MetricData {
    total: number;
    trend: string;
    daily: ChartDataPoint[];
    weekly: ChartDataPoint[];
    monthly: ChartDataPoint[];
}

export interface AnalyticsData {
    views: MetricData;
    clicks: MetricData;
    waContacts: MetricData;
}

export interface TopBook {
    id: string;
    rank: number;
    title: string;
    author: string;
    cover: string;
    views: number;
    clicks: number;
    waContacts: number;
    earnings: number;
    trend: 'up' | 'down';
}

export const MOCK_ANALYTICS_DATA: AnalyticsData = {
    views: {
        total: 553,
        trend: '+12%',
        daily: [
            { label: '4 AM', value: 10 },
            { label: '8 AM', value: 25 },
            { label: '12 PM', value: 30 },
            { label: '4 PM', value: 55 },
            { label: '8 PM', value: 10 },
            { label: '12 AM', value: 25 },
        ],
        weekly: [
            { label: 'Mon', value: 40 },
            { label: 'Tue', value: 65 },
            { label: 'Wed', value: 55 },
            { label: 'Thu', value: 90 },
            { label: 'Fri', value: 75 },
            { label: 'Sat', value: 120 },
            { label: 'Sun', value: 105 },
        ],
        monthly: [
            { label: 'Week1', value: 200 },
            { label: 'Week2', value: 450 },
            { label: 'Week3', value: 300 },
            { label: 'Week4', value: 553 },
        ],
    },
    clicks: {
        total: 242,
        trend: '+8%',
        daily: [
            { label: '4 AM', value: 2 },
            { label: '8 AM', value: 12 },
            { label: '12 PM', value: 15 },
            { label: '4 PM', value: 25 },
            { label: '8 PM', value: 2 },
            { label: '12 AM', value: 12 },
        ],
        weekly: [
            { label: 'Mon', value: 15 },
            { label: 'Tue', value: 25 },
            { label: 'Wed', value: 20 },
            { label: 'Thu', value: 40 },
            { label: 'Fri', value: 30 },
            { label: 'Sat', value: 60 },
            { label: 'Sun', value: 52 },
        ],
        monthly: [
            { label: 'Week 1', value: 80 },
            { label: 'Week 2', value: 190 },
            { label: 'Week 3', value: 140 },
            { label: 'Week 4', value: 242 },
        ],
    },
    waContacts: {
        total: 67,
        trend: '+21%',
        daily: [
            { label: '4 AM', value: 1 },
            { label: '8 AM', value: 3 },
            { label: '12 PM', value: 2 },
            { label: '4 PM', value: 8 },
            { label: '8 PM', value: 1 },
            { label: '12 AM', value: 3 },
        ],
        weekly: [
            { label: 'Mon', value: 5 },
            { label: 'Tue', value: 8 },
            { label: 'Wed', value: 6 },
            { label: 'Thu', value: 12 },
            { label: 'Fri', value: 10 },
            { label: 'Sat', value: 15 },
            { label: 'Sun', value: 11 },
        ],
        monthly: [
            { label: 'Week 1', value: 20 },
            { label: 'Week 2', value: 45 },
            { label: 'Week 3', value: 35 },
            { label: 'Week 4', value: 67 },
        ],
    },
};

export const MOCK_TOP_BOOKS: TopBook[] = [
    {
        id: '1',
        rank: 1,
        title: 'Atomic Habits',
        author: 'James Clear',
        cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop',
        views: 312,
        clicks: 89,
        waContacts: 22,
        earnings: 350,
        trend: 'up',
    },
    {
        id: '2',
        rank: 2,
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop',
        views: 241,
        clicks: 74,
        waContacts: 18,
        earnings: 280,
        trend: 'up',
    },
    {
        id: '3',
        rank: 3,
        title: 'Deep Work',
        author: 'Cal Newport',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200&auto=format&fit=crop',
        views: 198,
        clicks: 56,
        waContacts: 12,
        earnings: 420,
        trend: 'down',
    },
    {
        id: '4',
        rank: 4,
        title: 'Rich Dad Poor Dad',
        author: 'Robert T. Kiyosaki',
        cover: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=200&auto=format&fit=crop',
        views: 156,
        clicks: 45,
        waContacts: 9,
        earnings: 300,
        trend: 'up',
    },
    {
        id: '5',
        rank: 5,
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200&auto=format&fit=crop',
        views: 142,
        clicks: 38,
        waContacts: 7,
        earnings: 250,
        trend: 'up',
    },
    {
        id: '6',
        rank: 6,
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop',
        views: 120,
        clicks: 31,
        waContacts: 5,
        earnings: 400,
        trend: 'down',
    },
    {
        id: '7',
        rank: 7,
        title: '1984',
        author: 'George Orwell',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop',
        views: 95,
        clicks: 22,
        waContacts: 4,
        earnings: 200,
        trend: 'up',
    },
    {
        id: '8',
        rank: 8,
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=200&auto=format&fit=crop',
        views: 88,
        clicks: 19,
        waContacts: 3,
        earnings: 180,
        trend: 'down',
    },
    {
        id: '9',
        rank: 9,
        title: 'Start with Why',
        author: 'Simon Sinek',
        cover: 'https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=200&auto=format&fit=crop',
        views: 76,
        clicks: 15,
        waContacts: 2,
        earnings: 220,
        trend: 'up',
    },
    {
        id: '10',
        rank: 10,
        title: 'Dune',
        author: 'Frank Herbert',
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=200&auto=format&fit=crop',
        views: 65,
        clicks: 12,
        waContacts: 1,
        earnings: 310,
        trend: 'up',
    },
];
