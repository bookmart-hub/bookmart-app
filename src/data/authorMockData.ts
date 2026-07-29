export interface Author {
  id: string;
  name: string;
  bio: string;
  imageUri: string;
  category: string;
}

export const AUTHOR_CATEGORIES = ["All", "Poets", "Novelists", "Playwrights", "Academic"];

export const MOCK_AUTHORS: Author[] = [
  {
    id: "1",
    name: "Rabindranath Tagore",
    bio: "Nobel Prize-winning poet, novelist, playwright, philosopher, and creator of India's national anthem.",
    imageUri: "https://www.nobelprize.org/images/tagore-12892-content-portrait-mobile-tiny.jpg",
    category: "Poet",
  },
  {
    id: "2",
    name: "Satyajit Ray",
    bio: "Legendary filmmaker, writer, illustrator, and creator of the iconic Feluda detective series.",
    imageUri:
      "https://m.media-amazon.com/images/M/MV5BMTQ4MDA1ODIzMF5BMl5BanBnXkFtZTcwNDU0OTkxOA@@._V1_FMjpg_UX1000_.jpg",
    category: "Novelist",
  },
  {
    id: "3",
    name: "Bibhutibhushan Bandyopadhyay",
    bio: "Renowned novelist best known for Pather Panchali and his vivid portrayal of rural Bengal.",
    imageUri:
      "https://m.media-amazon.com/images/M/MV5BNDA5NmVhMzAtY2E4My00NzgzLThiMDctNjU1ZTQxMWQyMzI4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    category: "Novelist",
  },
  {
    id: "4",
    name: "Bankim Chandra Chattopadhyay",
    bio: "Pioneer of modern Bengali literature and author of Anandamath, which introduced Vande Mataram.",
    imageUri:
      "https://www.sahapedia.org/sites/default/files/styles/sp_inline_images/public/inline-images/Bankim%20Chandra%20Chattopadhyay_Wikimedia%20Commons_0.jpg?itok=ud8o9B0n",
    category: "Novelist",
  },
  {
    id: "5",
    name: "Sarat Chandra Chattopadhyay",
    bio: "One of Bengal's most beloved novelists, known for Devdas, Parineeta, and Srikanta.",
    imageUri:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbeFEoT9pdFhMC5zkegpfozc5GR7Doxl6x-fjpOd0tAm3GY6k4Hzl3h7cKy98cOlG1KJk1m66KaxE6lk9d_qkl1JJGJZRXgQvLrsKnmt0&s=10",
    category: "Novelist",
  },
  {
    id: "6",
    name: "Jibanananda Das",
    bio: "One of the greatest Bengali poets of the modern era, famous for Banalata Sen.",
    imageUri: "https://pbs.twimg.com/media/GGhCjObXIAA8qBe.jpg",
    category: "Poet",
  },
  {
    id: "7",
    name: "Kazi Nazrul Islam",
    bio: "National poet of Bangladesh, celebrated for his revolutionary poetry and songs.",
    imageUri:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJaj7jZlse_7W0U6wZI4p1tsH8UrgsrArfKCy1Nk2TdqyRheTsUK82EW6OwDs1swWLSLhR&s",
    category: "Poet",
  },
  {
    id: "8",
    name: "Michael Madhusudan Dutt",
    bio: "Pioneering Bengali poet and playwright who introduced blank verse into Bengali literature.",
    imageUri: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Mudhusudan_Dutta.jpg",
    category: "Playwright",
  },
  {
    id: "9",
    name: "S. N. Dey",
    bio: "Widely known academic author whose mathematics textbooks are popular among school students.",
    imageUri: "https://media.drishtibhongi.in/wp-content/uploads/2020/08/S-N-DEY.jpg",
    category: "Academic",
  },
  {
    id: "10",
    name: "R. D. Sharma",
    bio: "Acclaimed mathematics educator and textbook author trusted by generations of students.",
    imageUri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-bTl0YmlHETcfOoYpwEYQIca2jH2ZqSMg9g&s",
    category: "Academic",
  },
];
