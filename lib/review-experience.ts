export type ReviewRecord = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
};

export type ReviewSort = 'recent' | 'highest' | 'lowest';
export type ReviewRatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

export function buildReviewSummary(reviews: ReviewRecord[]) {
  const count = reviews.length;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = count ? Math.round((total / count) * 10) / 10 : 0;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const review of reviews) {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }

  return { count, average, distribution };
}

export function filterAndSortReviews(
  reviews: ReviewRecord[],
  options: { rating: ReviewRatingFilter; sort: ReviewSort },
) {
  const filtered = options.rating === 'all'
    ? [...reviews]
    : reviews.filter((review) => review.rating === options.rating);

  return filtered.sort((a, b) => {
    if (options.sort === 'highest') return b.rating - a.rating || b.created_at.localeCompare(a.created_at);
    if (options.sort === 'lowest') return a.rating - b.rating || b.created_at.localeCompare(a.created_at);
    return b.created_at.localeCompare(a.created_at);
  });
}

export function getReviewSortOptions(): { value: ReviewSort; label: string }[] {
  return [
    { value: 'recent', label: 'Most recent' },
    { value: 'highest', label: 'Highest rated' },
    { value: 'lowest', label: 'Lowest rated' },
  ];
}
