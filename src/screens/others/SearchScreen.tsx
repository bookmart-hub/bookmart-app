import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '@/components/ui/Header';
import SearchBar from '@/components/ui/SearchBar';
import RecentSearches from '@/components/ui/RecentSearches';
import { COLORS } from '@/constants/colors';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 10;

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        try {
            const storedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (storedSearches) {
                setRecentSearches(JSON.parse(storedSearches));
            }
        } catch (error) {
            console.error('Failed to load recent searches', error);
        }
    };

    const saveRecentSearch = async (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        try {
            // Remove duplicates and prepend latest
            const filteredSearches = recentSearches.filter(
                (item) => item.toLowerCase() !== trimmedQuery.toLowerCase()
            );
            const updatedSearches = [trimmedQuery, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);

            setRecentSearches(updatedSearches);
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
        } catch (error) {
            console.error('Failed to save recent search', error);
        }
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            saveRecentSearch(searchQuery);
            // TODO: trigger actual search API or filter logic here
        }
    };

    const handleSelectSearch = (value: string) => {
        setSearchQuery(value);
        saveRecentSearch(value);
        // TODO: trigger actual search API or filter logic here
    };

    const handleClearAll = async () => {
        try {
            setRecentSearches([]);
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (error) {
            console.error('Failed to clear recent searches', error);
        }
    };

    return (
        <View style={styles.container}>
            <Header title="Search" backButton />

            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                autoFocus
            />

            <RecentSearches
                searches={recentSearches}
                onSelect={handleSelectSearch}
                onClear={handleClearAll}
            />
        </View>
    );
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});