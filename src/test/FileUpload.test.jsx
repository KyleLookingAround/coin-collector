import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '../components/FileUpload';

describe('FileUpload — full-size drop zone', () => {
  it('renders the heading and tagline', () => {
    render(<FileUpload onFile={vi.fn()} />);
    expect(screen.getByText('DataLens')).toBeInTheDocument();
    expect(screen.getByText(/Drop a CSV or JSON file/i)).toBeInTheDocument();
  });

  it('shows accepted format badges', () => {
    render(<FileUpload onFile={vi.fn()} />);
    expect(screen.getByText('.csv')).toBeInTheDocument();
    expect(screen.getByText('.json')).toBeInTheDocument();
  });

  it('calls onFile when a file is selected via input', async () => {
    const onFile = vi.fn();
    render(<FileUpload onFile={onFile} />);
    const input = document.querySelector('input[type="file"]');
    const file = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });
    await userEvent.upload(input, file);
    expect(onFile).toHaveBeenCalledOnce();
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('calls onFile when a file is dropped', () => {
    const onFile = vi.fn();
    render(<FileUpload onFile={onFile} />);
    const label = document.querySelector('label');
    const file = new File(['{}'], 'data.json', { type: 'application/json' });
    fireEvent.drop(label, { dataTransfer: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('applies highlight styles when dragging over', () => {
    render(<FileUpload onFile={vi.fn()} />);
    const label = document.querySelector('label');
    fireEvent.dragOver(label, { preventDefault: () => {} });
    expect(label.className).toMatch(/border-accent-teal/);
  });

  it('removes highlight styles when drag leaves', () => {
    render(<FileUpload onFile={vi.fn()} />);
    const label = document.querySelector('label');
    fireEvent.dragOver(label, { preventDefault: () => {} });
    fireEvent.dragLeave(label);
    expect(label.className).not.toMatch(/scale-\[1\.02\]/);
  });
});

describe('FileUpload — compact mode', () => {
  it('renders the upload label text', () => {
    render(<FileUpload onFile={vi.fn()} compact />);
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  it('does not render the DataLens heading', () => {
    render(<FileUpload onFile={vi.fn()} compact />);
    expect(screen.queryByText('DataLens')).not.toBeInTheDocument();
  });

  it('calls onFile when a file is selected', async () => {
    const onFile = vi.fn();
    render(<FileUpload onFile={onFile} compact />);
    const input = document.querySelector('input[type="file"]');
    const file = new File(['x,y\n1,2'], 'data.csv', { type: 'text/csv' });
    await userEvent.upload(input, file);
    expect(onFile).toHaveBeenCalledWith(file);
  });
});
