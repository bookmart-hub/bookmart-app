import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const MedicalScreen = () => {
    const data = CATEGORY_DATA['Medical'];
    return (
        <CategoryMasonryLayout 
            title="Medical" 
            subtitle={data?.subtitle || ''}
            leftColumnData={data?.left || []}
            rightColumnData={data?.right || []}
        />
    );
};

export default MedicalScreen;
