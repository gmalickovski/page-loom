import type { Meta, StoryObj } from '@storybook/react';
import { PlannerBlockRenderer } from '../../components/planner/blocks/PlannerBlockRenderer';
import { PlannerLayoutBlock } from '../../types/library';

const meta = {
  title: 'Planner/Blocks',
  component: PlannerBlockRenderer,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', backgroundColor: '#e8e4da', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlannerBlockRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseBlock: PlannerLayoutBlock = {
  id: 'test-1',
  type: 'notes',
  title: '',
  variant: '',
  xMm: 10,
  yMm: 10,
  widthMm: 60,
  heightMm: 40,
};

export const Notes: Story = {
  args: {
    block: { ...baseBlock, type: 'notes', title: 'Anotações' },
    paperPattern: 'lined',
    pageZoom: 1,
    isSelected: true,
    onSelect: () => {},
    onUpdate: () => {},
    onDelete: () => {},
  },
};

export const TodoList: Story = {
  args: {
    block: { ...baseBlock, type: 'checklist', title: 'Prioridades', heightMm: 50 },
    paperPattern: 'dot_grid',
    pageZoom: 1,
    isSelected: false,
    onSelect: () => {},
    onUpdate: () => {},
    onDelete: () => {},
  },
};

export const Schedule: Story = {
  args: {
    block: { ...baseBlock, type: 'schedule', title: 'Agenda Diária', heightMm: 100, widthMm: 50 },
    paperPattern: 'blank',
    pageZoom: 1,
    isSelected: false,
    onSelect: () => {},
    onUpdate: () => {},
    onDelete: () => {},
  },
};

export const DateBoxed: Story = {
  args: {
    block: { ...baseBlock, type: 'date_header', variant: 'boxed', heightMm: 15, widthMm: 50 },
    paperPattern: 'grid',
    pageZoom: 1,
    isSelected: false,
    onSelect: () => {},
    onUpdate: () => {},
    onDelete: () => {},
  },
};

export const Quote: Story = {
  args: {
    block: { ...baseBlock, type: 'quote', heightMm: 40, widthMm: 80 },
    paperPattern: 'blank',
    pageZoom: 1,
    isSelected: false,
    onSelect: () => {},
    onUpdate: () => {},
    onDelete: () => {},
  },
};

export const PasswordTracker: Story = {
  args: {
    block: { ...baseBlock, type: 'password_tracker', title: 'Minhas Senhas', heightMm: 60, widthMm: 90 },
    paperPattern: 'lined',
    pageZoom: 1,
    isSelected: false,
    onSelect: () => {},
    onUpdate: () => {},
    onDelete: () => {},
  },
};
