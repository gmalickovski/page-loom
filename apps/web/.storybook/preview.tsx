import type { Preview } from '@storybook/react-vite'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (iPhone 14/15)',
          styles: {
            width: '390px',
            height: '844px',
          },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (iPad Air)',
          styles: {
            width: '768px',
            height: '1024px',
          },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: {
            width: '1280px',
            height: '800px',
          },
          type: 'desktop',
        },
      },
      defaultViewport: 'desktop',
    },
  },
};

export default preview;