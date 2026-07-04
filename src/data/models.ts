export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Ratings {
  average: number;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface Book {
  id: string;
  title: string;
  coverUri: string;
  price: number;
  discount?: string;
  stock?: string;
  author?: string;
  genre?: string;
  condition?: string;
  conditionNote?: string;
  ratings?: Ratings;
  reviews?: Review[];
  empty?: boolean;
  categoryId?: string;
}

export interface Category {
  id: string;
  label: string;
  imageUri: string;
  subtitle?: string;
  books?: Book[]; // we can structure books either in left/right arrays or just one array and we split them.
}

export type FeedItemType = 'header' | 'book' | 'ad';

export interface BaseFeedItem {
  type: FeedItemType;
  id: string;
}

export interface HeaderFeedItem extends BaseFeedItem {
  type: 'header';
  title: string;
  subtitle: string;
}

export interface BookFeedItem extends BaseFeedItem {
  type: 'book';
  book: Book;
}

export interface AdFeedItem extends BaseFeedItem {
  type: 'ad';
  imageUrl?: string;
  text?: string;
  link?: string;
}

export type FeedItem = HeaderFeedItem | BookFeedItem | AdFeedItem;

// For masonry layout compatibility
export interface MasonryCategoryData {
  items: FeedItem[];
}
