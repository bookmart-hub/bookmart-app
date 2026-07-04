import React from 'react';
import CategoryMasonryLayout from '@/components/ui/CategoryMasonryLayout';
import { CATEGORY_DATA } from '@/data/categoryMockData';

const SelfHelpScreen = () => {
    const data = CATEGORY_DATA['SelfHelp'];
    return (
        <CategoryMasonryLayout data={data.items} />
    );
};

export default SelfHelpScreen;