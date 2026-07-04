import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const LawScreen = () => {
    const data = CATEGORY_DATA['Law'];
    return (
        <CategoryMasonryLayout data={data.items} />
    );
};

export default LawScreen;
