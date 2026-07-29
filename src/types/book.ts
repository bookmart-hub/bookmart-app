export interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  condition: "new" | "used";
}
