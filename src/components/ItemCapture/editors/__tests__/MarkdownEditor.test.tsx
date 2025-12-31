/**
 * Unit tests for MarkdownEditor component
 *
 * @module ItemCapture/editors/__tests__/MarkdownEditor.test
 * @lastModified 2025-12-31 (REQ-045)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';

// Mock react-markdown for faster tests
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-preview">{children}</div>;
  };
});

describe('MarkdownEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders textarea with placeholder when empty', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Write your content here using markdown formatting...'
      );
    });

    it('renders value in textarea', () => {
      render(<MarkdownEditor {...defaultProps} value="Hello world" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Hello world');
    });

    it('renders custom placeholder', () => {
      render(
        <MarkdownEditor {...defaultProps} placeholder="Custom placeholder" />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('renders toolbar with 8 formatting buttons', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();

      // Should have 8 toolbar buttons
      const buttons = toolbar.querySelectorAll('button');
      expect(buttons).toHaveLength(8);
    });

    it('renders character counter with 0 / 5000 when empty', () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByText('0 / 5,000 characters')).toBeInTheDocument();
    });

    it('renders preview pane', () => {
      render(<MarkdownEditor {...defaultProps} value="Test content" />);

      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toHaveTextContent('Test content');
    });

    it('renders empty state in preview when value is empty', () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(
        screen.getByText(
          'Start typing to see a preview of your formatted content...'
        )
      ).toBeInTheDocument();
    });
  });

  describe('onChange', () => {
    it('calls onChange when typing', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'a');

      expect(onChange).toHaveBeenCalledWith('a');
    });

    it('updates character count when typing', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        return <MarkdownEditor value={value} onChange={setValue} />;
      };

      const React = require('react');
      render(<TestWrapper />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText('4 / 5,000 characters')).toBeInTheDocument();
      });
    });
  });

  describe('character counter', () => {
    it('shows normal state when below warning threshold', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(100)}
          maxLength={5000}
          warningThreshold={4500}
        />
      );

      const counter = screen.getByText('100 / 5,000 characters');
      expect(counter).toHaveClass('text-gray-500');
    });

    it('shows warning state at threshold', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(4500)}
          maxLength={5000}
          warningThreshold={4500}
        />
      );

      const counter = screen.getByText('4,500 / 5,000 characters');
      expect(counter).toHaveClass('text-yellow-600');
    });

    it('shows error state when over limit', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(5001)}
          maxLength={5000}
          warningThreshold={4500}
        />
      );

      const counter = screen.getByText('5,001 / 5,000 characters');
      expect(counter).toHaveClass('text-red-600');
      expect(counter).toHaveClass('font-medium');
    });

    it('displays error message when over limit', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(5001)}
          maxLength={5000}
        />
      );

      expect(
        screen.getByRole('alert')
      ).toHaveTextContent(
        'Content exceeds the maximum character limit. Please shorten your text.'
      );
    });

    it('disables toolbar when over limit', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(5001)}
          maxLength={5000}
        />
      );

      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('disabled state', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<MarkdownEditor {...defaultProps} disabled />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('disables toolbar buttons when disabled prop is true', () => {
      render(<MarkdownEditor {...defaultProps} disabled />);

      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes on toolbar', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-label', 'Text formatting');
    });

    it('has correct ARIA attributes on textarea', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          ariaLabel="Custom label"
          ariaDescribedBy="custom-desc"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Custom label');
      expect(textarea).toHaveAttribute('aria-describedby', 'custom-desc');
    });

    it('has aria-invalid when over limit', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(5001)}
          maxLength={5000}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-live on character counter', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const counter = screen.getByText('0 / 5,000 characters');
      expect(counter).toHaveAttribute('aria-live', 'polite');
      expect(counter).toHaveAttribute('aria-atomic', 'true');
    });

    it('toolbar buttons have aria-label', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      const buttons = toolbar.querySelectorAll('button');

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('has correct ARIA attributes on tab buttons', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const editorTab = screen.getByRole('tab', { name: /editor/i });
      const previewTab = screen.getByRole('tab', { name: /preview/i });

      expect(editorTab).toHaveAttribute('aria-selected', 'true');
      expect(editorTab).toHaveAttribute('aria-controls', 'editor-panel');
      expect(previewTab).toHaveAttribute('aria-selected', 'false');
      expect(previewTab).toHaveAttribute('aria-controls', 'preview-panel');
    });

    it('has correct ARIA attributes on tab panels', () => {
      render(<MarkdownEditor {...defaultProps} />);

      const editorPanel = document.getElementById('editor-panel');
      const previewPanel = document.getElementById('preview-panel');

      expect(editorPanel).toHaveAttribute('role', 'tabpanel');
      expect(editorPanel).toHaveAttribute('aria-labelledby', 'editor-tab');
      expect(previewPanel).toHaveAttribute('role', 'tabpanel');
      expect(previewPanel).toHaveAttribute('aria-labelledby', 'preview-tab');
    });
  });

  describe('tab switching', () => {
    it('switches to preview tab when clicked', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);

      const previewTab = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewTab);

      expect(previewTab).toHaveAttribute('aria-selected', 'true');
      expect(
        screen.getByRole('tab', { name: /editor/i })
      ).toHaveAttribute('aria-selected', 'false');
    });

    it('switches back to editor tab when clicked', async () => {
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} />);

      // First switch to preview
      const previewTab = screen.getByRole('tab', { name: /preview/i });
      await user.click(previewTab);

      // Then switch back to editor
      const editorTab = screen.getByRole('tab', { name: /editor/i });
      await user.click(editorTab);

      expect(editorTab).toHaveAttribute('aria-selected', 'true');
      expect(previewTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('formatting', () => {
    it('applies bold format via toolbar button', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} value="" />);

      const boldButton = screen.getByRole('button', { name: /bold/i });
      await user.click(boldButton);

      expect(onChange).toHaveBeenCalledWith('****');
    });

    it('applies italic format via toolbar button', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} value="" />);

      const italicButton = screen.getByRole('button', { name: /italic/i });
      await user.click(italicButton);

      expect(onChange).toHaveBeenCalledWith('**');
    });

    it('applies heading1 format via toolbar button', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} value="" />);

      const h1Button = screen.getByRole('button', { name: /heading 1/i });
      await user.click(h1Button);

      expect(onChange).toHaveBeenCalledWith('# ');
    });

    it('applies link format via toolbar button', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<MarkdownEditor {...defaultProps} onChange={onChange} value="" />);

      const linkButton = screen.getByRole('button', { name: /link/i });
      await user.click(linkButton);

      expect(onChange).toHaveBeenCalledWith('[](url)');
    });
  });

  describe('custom configuration', () => {
    it('uses custom maxLength', () => {
      render(
        <MarkdownEditor {...defaultProps} value="test" maxLength={100} />
      );

      expect(screen.getByText('4 / 100 characters')).toBeInTheDocument();
    });

    it('uses custom warningThreshold', () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          value={'a'.repeat(50)}
          maxLength={100}
          warningThreshold={50}
        />
      );

      const counter = screen.getByText('50 / 100 characters');
      expect(counter).toHaveClass('text-yellow-600');
    });

    it('uses custom minHeight', () => {
      render(<MarkdownEditor {...defaultProps} minHeight={400} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveStyle({ minHeight: '400px' });
    });

    it('applies custom className', () => {
      const { container } = render(
        <MarkdownEditor {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
