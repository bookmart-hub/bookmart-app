import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const RomanceScreen = () => {
    const data = CATEGORY_DATA['Romance'];
    return (
        <CategoryMasonryLayout data={data.items} />
    );
};

export default RomanceScreen;