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
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
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
            background-color: #0A082D !important;
            color: #F0F2F9 !important;
          }
          [data-mantine-color-scheme="dark"] {
            background-color: #0A082D;
            color: #F0F2F9;
          }
          /* Ensure cards and surfaces have proper contrast */
          [data-mantine-color-scheme="dark"] .mantine-Paper-root,
          [data-mantine-color-scheme="dark"] .mantine-Card-root,
          [data-mantine-color-scheme="dark"] .mantine-Modal-content,
          [data-mantine-color-scheme="dark"] .mantine-Modal-inner,
          [data-mantine-color-scheme="dark"] .mantine-Popover-dropdown {
            background-color: #15133D !important;
            color: #F0F2F9 !important;
            border-color: #403B7D !important;
          }
          /* Ensure text in cards and containers is readable */
          [data-mantine-color-scheme="dark"] .mantine-Text-root,
          [data-mantine-color-scheme="dark"] .mantine-Title-root,
          [data-mantine-color-scheme="dark"] .mantine-Container-root {
            color: #F0F2F9 !important;
          }
          /* Dimmed text should still be readable (WCAG AA compliant) */
          [data-mantine-color-scheme="dark"] .mantine-Text-root[data-c="dimmed"],
          [data-mantine-color-scheme="dark"] [data-c="dimmed"] {
            color: #B2BAD3 !important;
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
          /* Badges should have readable text */
          [data-mantine-color-scheme="dark"] .mantine-Badge-root {
            color: #F0F2F9 !important;
          }
          /* Links should be visible */
          [data-mantine-color-scheme="dark"] a {
            color: #A355FF !important;
          }
          [data-mantine-color-scheme="dark"] a:hover {
            color: #C18CFF !important;
          }
          /* Card borders should be visible */
          [data-mantine-color-scheme="dark"] .mantine-Card-root[data-with-border="true"] {
            border-color: #403B7D !important;
          }
          /* Action icons should be visible */
          [data-mantine-color-scheme="dark"] .mantine-ActionIcon-root {
            color: #B2BAD3 !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-ActionIcon-root:hover {
            color: #F0F2F9 !important;
            background-color: #2A275D !important;
          }
          /* Select dropdowns */
          [data-mantine-color-scheme="dark"] .mantine-Select-dropdown {
            background-color: #15133D !important;
            border-color: #403B7D !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Select-option {
            color: #F0F2F9 !important;
          }
          [data-mantine-color-scheme="dark"] .mantine-Select-option:hover {
            background-color: #2A275D !important;
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
      <body style={{ fontFamily: 'Roboto, sans-serif', backgroundColor: '#0A082D', minHeight: '100vh' }}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}

