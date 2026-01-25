import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypeBadge } from '../../src/components/TypeBadge';

describe('TypeBadge', () => {
  const types = [
    ['TEXT', 'Text'],
    ['STRUCTURED', 'Structured'],
    ['IMAGE', 'Image'],
    ['VIDEO', 'Video'],
    ['AUDIO', 'Audio'],
  ] as const;

  it.each(types)('should render %s type with label "%s"', (type, label) => {
    render(<TypeBadge type={type} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<TypeBadge type="TEXT" className="custom-class" />);
    expect(screen.getByText('Text')).toHaveClass('custom-class');
  });

  it('should have correct styling for TEXT type', () => {
    render(<TypeBadge type="TEXT" />);
    expect(screen.getByText('Text')).toHaveClass('bg-blue-500/10', 'text-blue-500');
  });

  it('should have correct styling for STRUCTURED type', () => {
    render(<TypeBadge type="STRUCTURED" />);
    expect(screen.getByText('Structured')).toHaveClass('bg-purple-500/10', 'text-purple-500');
  });

  it('should default to TEXT styling for unknown types', () => {
    // @ts-expect-error - testing unknown type fallback
    render(<TypeBadge type="UNKNOWN" />);
    expect(screen.getByText('Text')).toHaveClass('bg-blue-500/10', 'text-blue-500');
  });
});
