import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const CompetitiveExamsScreen = () => {
    const data = CATEGORY_DATA['CompetitiveExams'];
    return (
        <CategoryMasonryLayout 
            title="Competitive Exams" 
            subtitle={data?.subtitle || ''}
            leftColumnData={data?.left || []}
            rightColumnData={data?.right || []}
        />
    );
};

export default CompetitiveExamsScreen;
