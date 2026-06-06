import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const BiographyScreen = () => {
    const data = CATEGORY_DATA['Biography'];
    return (
        <CategoryMasonryLayout 
            title="Biography" 
            subtitle={data.subtitle}
            leftColumnData={data.left}
            rightColumnData={data.right}
        />
    );
};

export default BiographyScreen;