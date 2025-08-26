# ViewSellerAccount Component

A premium, design system-compliant component for displaying seller account information in the Designia marketplace.

## Features

- **Premium Design**: Follows Designia design system guidelines with luxurious yet playful aesthetics
- **Flexible Display**: Configurable sections for contact info, professional details, and social media
- **Responsive Layout**: Mobile-first design with adaptive layouts
- **Verification Badge**: Prominent display of seller verification status
- **Profile Completion**: Visual progress indicator for profile completeness
- **Social Media Integration**: Platform-specific styling for social media links
- **Avatar Support**: Handles both image avatars and fallback initials

## Usage

```tsx
import ViewSellerAccount from '../components/Common/ViewSellerAccount';

// Basic usage
<ViewSellerAccount seller={sellerData} />

// Customized display
<ViewSellerAccount 
  seller={sellerData}
  showContactInfo={true}
  showSocialMedia={true}
  showProfessionalInfo={false}
  className="custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `seller` | `SellerProfile` | **Required** | Seller profile data object |
| `showContactInfo` | `boolean` | `true` | Whether to show contact information section |
| `showSocialMedia` | `boolean` | `true` | Whether to show social media links section |
| `showProfessionalInfo` | `boolean` | `true` | Whether to show professional information section |
| `className` | `string` | `''` | Additional CSS class names |

## SellerProfile Interface

```tsx
interface SellerProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  job_title?: string;
  company?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  is_verified_seller?: boolean;
  seller_type?: string;
  created_at?: string;
}
```

## Design System Compliance

### Colors
- Uses Designia color palette (Deep Black, Platinum Gray, Steel Gray, etc.)
- Semantic colors for verification badges and status indicators
- Platform-specific colors for social media hover states

### Typography
- **Primary Font**: Inter for UI elements and body text
- **Secondary Font**: Playfair Display for premium headlines
- Consistent type scale following design system guidelines

### Spacing
- 8px base spacing system
- Responsive spacing adjustments for mobile devices
- Proper visual hierarchy with consistent margins and padding

### Components
- **Cards**: Premium styling with subtle shadows and borders
- **Buttons**: Hover effects with transform animations
- **Progress Bars**: Gradient fills with smooth transitions

## Responsive Behavior

### Desktop (768px+)
- Horizontal layout with avatar, info, and completion side by side
- Full social media grid with 4-column layout
- Optimal spacing for larger screens

### Tablet (480px - 768px)
- Stacked layout for header section
- Reduced avatar size
- Adaptive social media grid

### Mobile (<480px)
- Compact layout with reduced padding
- Single-column social media layout
- Optimized touch targets (44px minimum)

## Accessibility Features

- Semantic HTML structure
- Proper ARIA labels for interactive elements
- High contrast color ratios
- Keyboard navigation support
- Screen reader friendly content

## Examples

### Full Featured Seller
```tsx
const fullSeller = {
  username: 'designer_jane',
  first_name: 'Jane',
  last_name: 'Designer',
  avatar: 'path/to/avatar.jpg',
  bio: 'Professional furniture designer...',
  location: 'San Francisco, CA',
  website: 'www.janedesigner.com',
  job_title: 'Senior Furniture Designer',
  company: 'Designia Studios',
  instagram_url: 'https://instagram.com/janedesigner',
  is_verified_seller: true,
  profile_completion_percentage: 95
};

<ViewSellerAccount seller={fullSeller} />
```

### Minimal Seller
```tsx
const minimalSeller = {
  username: 'craftsman_mike',
  first_name: 'Mike',
  last_name: 'Craftsman',
  bio: 'Handcrafted wooden furniture...',
  location: 'Portland, OR',
  is_verified_seller: false,
  profile_completion_percentage: 65
};

<ViewSellerAccount 
  seller={minimalSeller}
  showSocialMedia={false}
  showProfessionalInfo={false}
/>
```

## Styling Customization

The component uses CSS custom properties for easy theming:

```css
:root {
  --designia-deep: #0A0A0A;
  --designia-white: #FFFFFF;
  --designia-platinum: #F5F5F5;
  --space-md: 16px;
  --space-lg: 24px;
  /* ... more variables */
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Lazy loading of avatar images
- Efficient CSS with minimal repaints
- Optimized animations using transform properties
- Responsive images with proper sizing

## Future Enhancements

- [ ] AR preview integration for seller products
- [ ] Real-time profile updates
- [ ] Enhanced social media previews
- [ ] Dark mode support
- [ ] Internationalization (i18n) support
