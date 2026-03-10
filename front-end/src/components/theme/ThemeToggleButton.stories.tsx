import React from "react";
import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import ThemeToggleButton from '@/components/theme/ThemeToggleButton';

const meta = {
  title: 'Components/ThemeToggleButton',
  component: ThemeToggleButton,
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem", display: "inline-block", border: "1px solid #cbd5e1", borderRadius: "8px" }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ThemeToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
