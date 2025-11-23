import React, { useCallback, useRef, useState } from 'react';
import Button from '@/shared/ui/Button';
import CardContainer from '@/shared/ui/CardContainer';
import Checklist from '@/shared/ui/Checklist';
import SearchBox, { type SearchVariant } from '@/shared/ui/SearchBox';
import SelectRS, { type Option, type SelectVariant } from '@/shared/ui/SelectRS';
import { Navbar } from '@/app/layout';

type SelectSize = 'sm' | 'md' | 'lg';

type SearchItem = {
  title: string;
  category: string;
  description: string;
};

const searchCatalog: SearchItem[] = [
  {
    title: 'Luminous Art Drop',
    category: 'Poster',
    description: 'A neon-toned poster set with layered gradients and metallic foil accents.'
  },
  {
    title: 'Aurora Gradient System',
    category: 'Color System',
    description: 'A curated palette that shifts between vivid hues without losing accessibility.'
  },
  {
    title: 'Minimal Commerce UI',
    category: 'Template',
    description: 'A template kit for checkout and catalog flows with clear microinteractions.'
  },
  {
    title: 'Nimbus Typeface Duo',
    category: 'Typography',
    description: 'A serif/sans pairing tuned for editorial and product marketing.'
  },
  {
    title: 'Framework Icon Set',
    category: 'Icon Pack',
    description: 'Line and filled icons built for dashboards and analytics experiences.'
  }
];

const searchPreviewStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.85rem',
    maxWidth: '640px'
  },
  searchRow: {
    display: 'flex',
    gap: '0.85rem',
    flexWrap: 'wrap' as const
  },
  variantLabel: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'capitalize' as const
  }
};

const searchBoxVariants: { variant: SearchVariant; label: string }[] = [
  { variant: 'primary', label: 'Primary style' },
  { variant: 'outline', label: 'Outline style' }
];

const TestButtons: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [defaultSelect, setDefaultSelect] = useState('option-a');
  const [ghostSelect, setGhostSelect] = useState('option-b');
  const [outlineSelect, setOutlineSelect] = useState('option-c');
  const [pillSelect, setPillSelect] = useState('option-d');
  const [portalValue, setPortalValue] = useState('');
  const [portalItems, setPortalItems] = useState<Option[]>([]);
  const portalContainerRef = useRef<HTMLDivElement>(null);

  const selectVariants: SelectVariant[] = [
    'primary',
    'secondary',
    'outline',
    'ghost',
  ];

  const selectSizes: SelectSize[] = ['sm', 'md', 'lg'];

  const [variantValues, setVariantValues] = useState<Record<SelectVariant, string>>(() =>
    selectVariants.reduce(
      (acc, variant) => ({ ...acc, [variant]: 'option-a' }),
      {} as Record<SelectVariant, string>
    )
  );

  const [sizeValues, setSizeValues] = useState<Record<SelectSize, string>>(() =>
    selectSizes.reduce((acc, size) => ({ ...acc, [size]: 'option-a' }), {} as Record<SelectSize, string>)
  );

  const [searchMatches, setSearchMatches] = useState<SearchItem[]>([]);
  const [lastQuery, setLastQuery] = useState('');

  const handlePortalSelection = (value: string) => {
    setPortalValue(value);
    const newOption = selectOptions.find((option) => option.value === value);
    if (!newOption) return;

    setPortalItems((prev) => {
      const alreadySelected = prev.some((item) => item.value === newOption.value);
      if (alreadySelected) {
        return prev.filter((item) => item.value !== newOption.value);
      }

      return [...prev, newOption];
    });
  };

  const handleVariantChange = (variant: SelectVariant, value: string) => {
    setVariantValues((prev) => ({ ...prev, [variant]: value }));
  };

  const handleSizeChange = (size: SelectSize, value: string) => {
    setSizeValues((prev) => ({ ...prev, [size]: value }));
  };

  const handleTestSearch = useCallback((value: string) => {
    const trimmedValue = value.trim();
    setLastQuery(trimmedValue);
    if (!trimmedValue) {
      setSearchMatches([]);
      return;
    }

    const normalized = trimmedValue.toLowerCase();
    const matches = searchCatalog.filter((item) =>
      item.title.toLowerCase().includes(normalized) || item.category.toLowerCase().includes(normalized)
    );
    setSearchMatches(matches);
  }, []);

  const selectOptions: Option[] = [
    { value: 'option-a', label: 'Option A' },
    { value: 'option-b', label: 'Option B' },
    { value: 'option-c', label: 'Option C' },
    { value: 'option-d', label: 'Option D' },
  ];

  const cardWidgets = [
    {
      id: 'balance',
      title: 'Available Balance',
      value: '$28,900',
      subtitle: 'Funds ready for payout',
      badge: 'Realtime',
      description: 'Includes USD and CAD pools. Updated every 30 seconds as payouts clear.',
      footer: 'Synced 1m ago'
    },
    {
      id: 'holds',
      title: 'Pending Holds',
      value: '$3,750',
      subtitle: '28 items requiring review',
      badge: 'Attention',
      description: 'Holds that need confirmation before they can release funds to the payout account.',
      footer: 'Last scanned 4m ago'
    },
    {
      id: 'subscriptions',
      title: 'Active Subscriptions',
      value: '410',
      subtitle: 'Billing renewed this week',
      badge: 'Stable',
      description: 'Enterprise and growth plans auto-renew this cycle. Monitor for any failed payments.',
      footer: 'Refresh scheduled in 20m'
    }
  ];

  const checklistBlueprint = [
    {
      id: 'verify-bank',
      label: 'Verify bank details',
      description: 'Cross-check IBAN, swift codes, and payout account nicknames before transfers.'
    },
    {
      id: 'review-invoices',
      label: 'Review invoices > $10k',
      description: 'Ensure all large invoices have approvals and supporting docs attached.',
      badge: 'High priority'
    },
    {
      id: 'schedule-payout',
      label: 'Schedule next payout batch',
      description: 'Use the payout scheduler once holds are cleared.',
      badge: 'Automated'
    },
    {
      id: 'confirm-report',
      label: 'Confirm weekly report',
      description: 'Verify totals and commentary before sharing with leadership.',
      disabled: true
    }
  ];

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(
    () =>
      checklistBlueprint.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, {})
  );

  const triggerLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', background: 'var(--color-background)', minHeight: '100vh', color: 'var(--color-text-primary)' }}>
      <h1 style={{ marginBottom: '1rem' }}>Button Variants</h1>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Button variant="primary" leftIcon={<span>🚀</span>} elevated>
          Primary
        </Button>
        <Button variant="secondary" rightIcon={<span>➡️</span>}>
          Secondary
        </Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link Style</Button>
        <Button variant="success" leftIcon={<span>✅</span>}>
          Success
        </Button>
        <Button variant="danger" leftIcon={<span>⚠️</span>}>
          Danger
        </Button>
        <Button variant="warning" leftIcon={<span>🔔</span>}>
          Warning
        </Button>
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Sizes</h2>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg" elevated>
          Large
        </Button>
        <Button fullWidth>Full width (block)</Button>
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Loading</h2>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary" loading={loading} onClick={triggerLoading}>
          {loading ? 'Loading…' : 'Simulate Loading'}
        </Button>
        <Button variant="secondary" loading>
          Loading
        </Button>
        <Button variant="outline" loading>
          Loading
        </Button>
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Card Button</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Button
          variant="card"
          titleText="Create Transfer"
          subtitleText="Send available balance to payout account"
          elevated
        />
        <Button
          variant="card"
          titleText="Refresh Holds"
          subtitleText="Check for new pending or released holds"
        />
        <Button variant="card">
          Use children as card content
        </Button>
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>React Select Variants</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Default</p>
          <SelectRS
            options={selectOptions}
            value={defaultSelect}
            onChange={setDefaultSelect}
            placeholder="Choose an option"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Ghost / transparent</p>
          <SelectRS
            options={selectOptions}
            value={ghostSelect}
            onChange={setGhostSelect}
            placeholder="Ghost style"
            variant="ghost"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Outline focus</p>
          <SelectRS
            options={selectOptions}
            value={outlineSelect}
            onChange={setOutlineSelect}
            placeholder="Accent outline"
            variant="outline"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Pill / soft</p>
          <SelectRS
            options={selectOptions}
            value={pillSelect}
            onChange={setPillSelect}
            placeholder="Rounded pill"
            variant="pill"
          />
        </div>
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Button-inspired Select Variants</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {selectVariants.map((variant) => (
          <div key={variant}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600, textTransform: 'capitalize' }}>{variant} style</p>
            <SelectRS
              options={selectOptions}
              value={variantValues[variant]}
              onChange={(value) => handleVariantChange(variant, value)}
              placeholder={`Variant ${variant}`}
              variant={variant}
              fullWidth
            />
          </div>
        ))}
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Select Sizes</h2>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {selectSizes.map((size) => (
          <div key={size} style={{ flex: '1 1 120px' }}>
            <p style={{ marginBottom: '0.35rem', fontWeight: 600 }}>{size.toUpperCase()} size</p>
            <SelectRS
              options={selectOptions}
              value={sizeValues[size]}
              onChange={(value) => handleSizeChange(size, value)}
              placeholder={`${size} size`}
              size={size}
            />
          </div>
        ))}
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Custom Card Containers</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {cardWidgets.map((widget) => (
          <CardContainer
            key={widget.id}
            title={widget.title}
            value={widget.value}
            subtitle={widget.subtitle}
            badge={widget.badge}
            footer={<span>{widget.footer}</span>}
          >
            <p style={{ margin: 0 }}>{widget.description}</p>
          </CardContainer>
        ))}
      </div>

      <h2 style={{ margin: '2rem 0 1rem' }}>Portal Render Example</h2>
      <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px', marginBottom: '2rem' }}>
        <SelectRS
          options={selectOptions}
          value={portalValue}
          onChange={handlePortalSelection}
          placeholder="Select to render"
          selectedItemsContainerRef={portalContainerRef}
          renderSelectedItem={() => (
            portalItems.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  padding: '0.65rem 0',
                }}
              >
                {portalItems.map((item) => (
                  <span
                    key={item.value}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      background: 'color-mix(in srgb, var(--color-accent) 25%, var(--color-surface) 75%)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            ) : null
          )}
        />
      <div
        ref={portalContainerRef}
        style={{
          minHeight: '56px',
          borderRadius: '12px',
          border: '1px dashed var(--color-border)',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-surface-variant, rgba(255,255,255,0.8))'
        }}
      >
        {portalItems.length === 0 && (
          <span style={{ color: 'var(--color-text-muted)' }}>Portal output renders here</span>
        )}
      </div>
    </div>

    <h2 style={{ margin: '2rem 0 1rem' }}>Search Box Preview</h2>
    <div style={searchPreviewStyles.container}>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
        Try searching through a small catalog to see how the new SearchBox component behaves.
      </p>
      <div style={searchPreviewStyles.searchRow}>
        {searchBoxVariants.map(({ variant, label }) => (
          <div key={variant} style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={searchPreviewStyles.variantLabel}>{label}</span>
            <SearchBox
              onSearch={handleTestSearch}
              variant={variant}
              buttonLabel={variant === 'outline' ? 'Find' : 'Search'}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          padding: '1rem',
          background: 'var(--color-surface-variant, rgba(255,255,255,0.85))'
        }}
      >
        {lastQuery ? (
          searchMatches.length > 0 ? (
            <ul style={{ margin: 0, listStyle: 'none', padding: 0, display: 'grid', gap: '0.85rem' }}>
              {searchMatches.map((item) => (
                <li key={item.title} style={{ paddingBottom: '0.25rem', borderBottom: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <strong>{item.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{item.category}</span>
                  </div>
                  <p style={{ margin: '0.45rem 0 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>No matches for “{lastQuery}”. Try another keyword.</p>
          )
        ) : (
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Type any keyword, hit Search, and inspect the results here.</p>
        )}
      </div>
    </div>

    <h2 style={{ margin: '2rem 0 1rem' }}>Custom Checklist</h2>
      <Checklist
        title="Daily Release Checklist"
        subtitle="Checks to run before authorizing payouts"
        items={checklistBlueprint.map((item) => ({
          ...item,
          checked: checkedMap[item.id] ?? false
        }))}
        onChange={(id, checked) => setCheckedMap((prev) => ({ ...prev, [id]: checked }))}
      />
    </div>
    </>
  );
};

export default TestButtons;
