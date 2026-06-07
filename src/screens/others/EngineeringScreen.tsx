import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const EngineeringScreen = () => {
    const data = CATEGORY_DATA['Engineering'];
    return (
        <CategoryMasonryLayout 
            title="Engineering" 
            subtitle={data?.subtitle || ''}
            leftColumnData={data?.left || []}
            rightColumnData={data?.right || []}
        />
    );
};

export default EngineeringScreen;
