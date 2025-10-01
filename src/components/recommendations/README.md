# Recommendations Components

This directory contains the refactored recommendations page components built with Ant Design.

## Components

### RecommendationsInterface.tsx
Main interface component that combines all recommendation features:
- Chat-style interface similar to the existing chat page
- Competitiveness assessment with radar chart
- School recommendations sidebar
- Filtering by school categories (target, fit, safety)

### CompetitivenessChart.tsx
Custom canvas-based radar chart showing user competitiveness across different dimensions:
- Academic Performance
- Research Experience  
- Internship & Work Experience
- Extracurriculars
- Standardized Test Score
- Recommendation letters

### SchoolRecommendationCard.tsx
Individual school recommendation cards with:
- School information and program details
- Category-based color coding (target/fit/safety)
- Rating metrics with hexagonal indicators
- Action buttons for more details

### RatingMetric.tsx
Hexagonal rating display component showing:
- Admission rates
- Fit scores
- Custom SVG hexagon with drop shadows
- Color-coded based on school category

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Ant Design Integration**: Uses only Ant Design components as requested
- **Category Filtering**: Filter schools by target/fit/safety categories
- **Interactive Elements**: Hover effects, clickable tags, action buttons
- **Consistent Styling**: Matches the existing chat page design patterns

## Usage

```tsx
import RecommendationsInterface from '@/components/recommendations/RecommendationsInterface'

export default function RecommendationsPage() {
  return <RecommendationsInterface />
}
```

## Styling

- Uses Tailwind CSS for utility classes
- Custom CSS in `/src/styles/recommendations.css`
- No external dependencies beyond Ant Design
- Follows the design patterns from the demo prototype
