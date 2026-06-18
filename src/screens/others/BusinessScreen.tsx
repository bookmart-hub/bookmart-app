import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const BusinessScreen = () => {
    const data = CATEGORY_DATA['Business'];
    return (
        <CategoryMasonryLayout data={data.items} />
    );
};

export default BusinessScreen;