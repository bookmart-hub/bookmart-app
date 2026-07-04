import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const BiographyScreen = () => {
    const data = CATEGORY_DATA['Biography'];
    console.log(data.items);
    return (
        <CategoryMasonryLayout data={data.items} />
    );
};

export default BiographyScreen;