import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const LawScreen = () => {
    const data = CATEGORY_DATA['Law'];
    return (
        <CategoryMasonryLayout 
            title="Law" 
            subtitle={data?.subtitle || ''}
            leftColumnData={data?.left || []}
            rightColumnData={data?.right || []}
        />
    );
};

export default LawScreen;
