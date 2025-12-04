import '@mantine/core/styles.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from './theme';

export const metadata = {
  title: 'Explore Showcases',
  description: 'Manage and view Explore instances',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get basePath for favicon links (works in both dev and production)
  // For static export, basePath is set in next.config.js
  const basePath = process.env.NODE_ENV === 'production' ? '/explore' : '';
  
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="icon" type="image/x-icon" href={`${basePath}/favicon.ico`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${basePath}/favicon-16x16.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/apple-touch-icon.png`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root[data-mantine-color-scheme="dark"] {
            --mantine-color-dark-0: #0A082D;
            --mantine-color-dark-1: #15133D;
            --mantine-color-dark-2: #1F1D4D;
            --mantine-color-dark-3: #2A275D;
            --mantine-color-dark-4: #35316D;
            --mantine-color-dark-5: #403B7D;
            --mantine-color-dark-6: #4B458D;
            --mantine-color-dark-7: #564F9D;
            --mantine-color-dark-8: #6159AD;
            --mantine-color-dark-9: #6B63BD;
            /* Ensure proper text contrast */
            --mantine-color-text: #F0F2F9;
            --mantine-color-dimmed: #B2BAD3;
          }
          body {
            background-color: #19191B !important;
            color: #F0F2F9 !important;
          }
          [data-mantine-color-scheme="dark"] {
            background-color: #19191B;
            color: #F0F2F9;
          }
          /* Container and main background */
          [data-mantine-color-scheme="dark"] .mantine-Container-root {
            background-color: #19191B !important;
          }
          /* Cards have light background - use high specificity */
          [data-mantine-color-scheme="dark"] .mantine-Card-root,
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-with-border],
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-with-border="true"],
          body[data-mantine-color-scheme="dark"] .mantine-Card-root,
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-shadow],
          [data-mantine-color-scheme="dark"] a.mantine-Card-root,
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-shadow="sm"],
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-shadow="md"],
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-shadow="lg"],
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-shadow="xl"],
          [data-mantine-color-scheme="dark"] div.mantine-Card-root {
            background-color: #E0E4EB !important;
            background: #E0E4EB !important;
            color: #19191B !important;
            border-color: rgba(25, 25, 27, 0.2) !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          /* CSS Grid layout for cards - 1 to 8 columns with 16px gap */
          /* Cards will be around 340px, automatically fitting 1-8 columns based on container width */
          [data-mantine-color-scheme="dark"] .mantine-Card-root {
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          /* Modals and popovers - light/positive background */
          [data-mantine-color-scheme="dark"] .mantine-Popover-dropdown {
            background-color: #E0E4EB !important;
            color: #19191B !important;
            border-color: rgba(25, 25, 27, 0.2) !important;
          }
          /* Paper and modals keep dark background for contrast */
          [data-mantine-color-scheme="dark"] .mantine-Paper-root,
          [data-mantine-color-scheme="dark"] .mantine-Modal-content,
          [data-mantine-color-scheme="dark"] .mantine-Modal-inner {
            background-color: #19191B !important;
            color: #F0F2F9 !important;
            border-color: #403B7D !important;
          }
          /* Text in containers (dark background) */
          [data-mantine-color-scheme="dark"] .mantine-Container-root .mantine-Text-root,
          [data-mantine-color-scheme="dark"] .mantine-Container-root .mantine-Title-root {
            color: #F0F2F9 !important;
          }
          /* Text in cards (light background) */
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Text-root,
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Title-root {
            color: #19191B !important;
          }
          /* Dimmed text should still be readable (WCAG AA compliant) */
          [data-mantine-color-scheme="dark"] .mantine-Text-root[data-c="dimmed"],
          [data-mantine-color-scheme="dark"] [data-c="dimmed"] {
            color: #B2BAD3 !important;
          }
          /* Dimmed text in cards (light background) */
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Text-root[data-c="dimmed"],
          [data-mantine-color-scheme="dark"] .mantine-Card-root [data-c="dimmed"] {
            color: #666666 !important;
          }
          /* Input fields should have good contrast */
          [data-mantine-color-scheme="dark"] .mantine-Input-input,
          [data-mantine-color-scheme="dark"] .mantine-TextInput-input,
          [data-mantine-color-scheme="dark"] .mantine-Select-input,
          [data-mantine-color-scheme="dark"] .mantine-PasswordInput-input {
            background-color: #1F1D4D !important;
            color: #F0F2F9 !important;
            border-color: #403B7D !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Input-input:focus,
          [data-mantine-color-scheme="dark"] .mantine-TextInput-input:focus,
          [data-mantine-color-scheme="dark"] .mantine-Select-input:focus {
            border-color: #8027F4 !important;
          }
          /* Tabs should be readable */
          [data-mantine-color-scheme="dark"] .mantine-Tabs-tab {
            color: #B2BAD3 !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Tabs-tab[data-active="true"],
          [data-mantine-color-scheme="dark"] .mantine-Tabs-tab:hover {
            color: #F0F2F9 !important;
          }
          /* Buttons with light variant should be readable */
          [data-mantine-color-scheme="dark"] .mantine-Button-root[data-variant="light"] {
            color: #F0F2F9 !important;
          }
          /* Checkboxes and form elements */
          [data-mantine-color-scheme="dark"] .mantine-Checkbox-label {
            color: #F0F2F9 !important;
          }
          /* Badges in containers (dark background) */
          [data-mantine-color-scheme="dark"] .mantine-Container-root .mantine-Badge-root {
            color: #F0F2F9 !important;
          }
          /* Status badges in cards (light background) - make colors more vibrant */
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Badge-root[data-variant="filled"][data-color="green"] {
            background-color: #22c55e !important;
            color: white !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Badge-root[data-variant="light"][data-color="red"] {
            background-color: rgba(239, 68, 68, 0.2) !important;
            color: #dc2626 !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
          }
          /* Ensure badge text is readable on light background */
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Badge-root {
            font-weight: 600 !important;
          }
          /* Feature badges on cards - ensure proper text color based on background */
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Badge-root[data-feature-badge="true"][data-is-dark="false"] {
            color: #19191B !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Card-root .mantine-Badge-root[data-feature-badge="true"][data-is-dark="true"] {
            color: #FFFFFF !important;
          }
          /* Links should be visible */
          [data-mantine-color-scheme="dark"] a {
            color: #F0F2F9 !important;
          }
          [data-mantine-color-scheme="dark"] a:hover {
            color: #FFFFFF !important;
          }
          /* Card borders should be visible */
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-with-border="true"] {
            border-color: rgba(25, 25, 27, 0.2) !important;
          }
          /* Action icons should be visible */
          [data-mantine-color-scheme="dark"] .mantine-ActionIcon-root {
            color: #B2BAD3 !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-ActionIcon-root:hover {
            color: #F0F2F9 !important;
            background-color: #2A275D !important;
          }
          /* Select dropdowns - light/positive background */
          [data-mantine-color-scheme="dark"] .mantine-Select-dropdown {
            background-color: #E0E4EB !important;
            border-color: rgba(25, 25, 27, 0.2) !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Select-option {
            color: #19191B !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Select-option:hover {
            background-color: rgba(25, 25, 27, 0.1) !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Select-option[data-selected] {
            background-color: rgba(25, 25, 27, 0.15) !important;
          }
          /* Group labels in Select dropdowns */
          [data-mantine-color-scheme="dark"] .mantine-Select-label {
            color: #666666 !important;
            font-weight: 600 !important;
          }
          /* Other menu types - light background */
          [data-mantine-color-scheme="dark"] .mantine-Menu-dropdown,
          [data-mantine-color-scheme="dark"] .mantine-ActionMenu-dropdown,
          [data-mantine-color-scheme="dark"] .mantine-ContextMenu-dropdown {
            background-color: #E0E4EB !important;
            color: #19191B !important;
            border-color: rgba(25, 25, 27, 0.2) !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Menu-item,
          [data-mantine-color-scheme="dark"] .mantine-ActionMenu-item,
          [data-mantine-color-scheme="dark"] .mantine-ContextMenu-item {
            color: #19191B !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Menu-item:hover,
          [data-mantine-color-scheme="dark"] .mantine-ActionMenu-item:hover,
          [data-mantine-color-scheme="dark"] .mantine-ContextMenu-item:hover {
            background-color: rgba(25, 25, 27, 0.1) !important;
          }
          /* Select placeholder text should be visible - consistent styling for all Selects */
          /* Default all Select inputs to placeholder color */
          [data-mantine-color-scheme="dark"] .mantine-Select-input[readonly],
          [data-mantine-color-scheme="dark"] .select-input-with-visible-placeholder[readonly] {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          /* Override when there's a selected value - check for data-value attribute */
          [data-mantine-color-scheme="dark"] .mantine-Select-input[readonly][data-value]:not([data-value=""]):not([data-value="undefined"]),
          [data-mantine-color-scheme="dark"] .select-input-with-visible-placeholder[readonly][data-value]:not([data-value=""]):not([data-value="undefined"]) {
            color: var(--mantine-color-text) !important;
          }
          /* Also check for value attribute (some Mantine versions use this) */
          [data-mantine-color-scheme="dark"] .mantine-Select-input[readonly][value]:not([value=""]):not([value="undefined"]),
          [data-mantine-color-scheme="dark"] .select-input-with-visible-placeholder[readonly][value]:not([value=""]):not([value="undefined"]) {
            color: var(--mantine-color-text) !important;
          }
          /* Ensure Select wrapper has consistent styling */
          [data-mantine-color-scheme="dark"] .mantine-Select-root {
            color: inherit;
          }
          /* Handle grouped Select data - ensure input styling is consistent */
          [data-mantine-color-scheme="dark"] .mantine-Select-input {
            background-color: #1F1D4D !important;
            border-color: #403B7D !important;
          }
          /* Filter text-link dropdowns - override global Select styles with higher specificity */
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input,
          [data-mantine-color-scheme="dark"] .filter-text-link.mantine-Select-input,
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input[readonly],
          [data-mantine-color-scheme="dark"] .filter-text-link.mantine-Select-input[readonly],
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input[readonly][value=""],
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input[readonly]:not([data-value]),
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input[readonly][data-value=""],
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input[readonly][data-value="undefined"],
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input[readonly][data-value="null"] {
            background-color: transparent !important;
            border: none !important;
            padding: 4px 8px !important;
            color: #F0F2F9 !important;
            cursor: pointer !important;
            font-size: 14px !important;
            min-height: auto !important;
            height: auto !important;
          }
          /* Placeholder text color for filter dropdowns */
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input::placeholder,
          [data-mantine-color-scheme="dark"] .filter-text-link.mantine-Select-input::placeholder {
            color: #F0F2F9 !important;
            opacity: 1 !important;
          }
          /* Ensure text wrapper elements in filter dropdowns use the correct color */
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input .mantine-Select-value,
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input .mantine-Select-placeholder {
            color: #F0F2F9 !important;
          }
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input:hover,
          [data-mantine-color-scheme="dark"] .filter-text-link.mantine-Select-input:hover {
            color: #FFFFFF !important;
            text-decoration: underline !important;
          }
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input:hover::placeholder,
          [data-mantine-color-scheme="dark"] .filter-text-link.mantine-Select-input:hover::placeholder {
            color: #FFFFFF !important;
          }
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-root {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            flex-direction: row !important;
          }
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-input {
            order: 1 !important;
            flex: 0 0 auto !important;
          }
          [data-mantine-color-scheme="dark"] .filter-text-link .mantine-Select-rightSection {
            order: 2 !important;
            position: static !important;
            margin-left: 4px !important;
            margin-right: 0 !important;
            color: #F0F2F9 !important;
            pointer-events: none !important;
            width: auto !important;
            padding: 0 !important;
          }
          /* Accordion styling */
          [data-mantine-color-scheme="dark"] .mantine-Accordion-item {
            background-color: #19191B !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Accordion-control {
            color: #F0F2F9 !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Accordion-control:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Accordion-panel {
            background-color: #19191B !important;
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }
        ` }} />
      </head>
      <body style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#19191B', minHeight: '100vh' }}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}

