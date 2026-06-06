import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const ScinceFinctionScreen = () => {
    const data = CATEGORY_DATA['ScinceFinction'];
    return (
        <CategoryMasonryLayout 
            title="Science Fiction" 
            subtitle={data.subtitle}
            leftColumnData={data.left}
            rightColumnData={data.right}
        />
    );
};

export default ScinceFinctionScreen;