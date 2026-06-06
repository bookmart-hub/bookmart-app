import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const SelfHelpScreen = () => {
    const data = CATEGORY_DATA['SelfHelp'];
    return (
        <CategoryMasonryLayout 
            title="Self Help" 
            subtitle={data.subtitle}
            leftColumnData={data.left}
            rightColumnData={data.right}
        />
    );
};

export default SelfHelpScreen;