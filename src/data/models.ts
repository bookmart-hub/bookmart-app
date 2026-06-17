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

// For masonry layout compatibility
export interface MasonryCategoryData {
  subtitle: string;
  left: Book[];
  right: Book[];
}
