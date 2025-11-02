import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render as customRender } from '../utils';
import ColumnSelector from '../../components/ColumnSelector';
import { ALL_COLUMNS } from '../../components/ColumnSelector';

describe('ColumnSelector', () => {
  const COLUMN_LABELS: Record<string, string> = {
    'timestamp': 'Timestamp',
    'attacker.id': 'Attacker ID',
    'attacker.ip': 'Attacker IP',
    'attacker.name': 'Attacker Name',
    'type': 'Type',
    'decoy.name': 'Decoy',
    'severity': 'Severity'
  };

  it('renders all columns as checkboxes', () => {
    customRender(<ColumnSelector />);
    
    ALL_COLUMNS.forEach(column => {
      const label = COLUMN_LABELS[column] || column;
      const checkbox = screen.getByLabelText(new RegExp(`Toggle ${label}`, 'i'));
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });
  });

  it('shows default visible columns as checked', () => {
    customRender(<ColumnSelector />);
    
    // Default columns should be checked
    const defaultColumns = ['timestamp', 'attacker.id', 'attacker.ip', 'attacker.name', 'type', 'decoy.name'];
    defaultColumns.forEach(column => {
      const label = COLUMN_LABELS[column] || column;
      const checkbox = screen.getByLabelText(new RegExp(`Toggle ${label}`, 'i'));
      expect(checkbox).toBeChecked();
    });
    
    // Severity should not be checked by default
    const severityCheckbox = screen.getByLabelText(/Toggle Severity/i);
    expect(severityCheckbox).not.toBeChecked();
  });

  it('toggles column visibility when checkbox is clicked', async () => {
    const user = userEvent.setup();
    customRender(<ColumnSelector />);
    
    const timestampCheckbox = screen.getByLabelText(/Toggle Timestamp/i);
    expect(timestampCheckbox).toBeChecked();
    
    await user.click(timestampCheckbox);
    expect(timestampCheckbox).not.toBeChecked();
    
    await user.click(timestampCheckbox);
    expect(timestampCheckbox).toBeChecked();
  });

  it('selects all columns when "Select all" button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<ColumnSelector />);
    
    // First uncheck one column
    const severityCheckbox = screen.getByLabelText(/Toggle Severity/i);
    expect(severityCheckbox).not.toBeChecked();
    
    // Click select all
    const selectAllButton = screen.getByLabelText('Select all columns');
    await user.click(selectAllButton);
    
    // All columns should now be checked
    ALL_COLUMNS.forEach(column => {
      const label = COLUMN_LABELS[column] || column;
      const checkbox = screen.getByLabelText(new RegExp(`Toggle ${label}`, 'i'));
      expect(checkbox).toBeChecked();
    });
    
    // Footer should show all columns visible
    expect(screen.getByText(/All columns visible/i)).toBeInTheDocument();
  });

  it('clears all columns when "Clear All" button is clicked', async () => {
    const user = userEvent.setup();
    customRender(<ColumnSelector />);
    
    const clearAllButton = screen.getByLabelText('Select no columns');
    await user.click(clearAllButton);
    
    // All columns should be unchecked
    ALL_COLUMNS.forEach(column => {
      const label = COLUMN_LABELS[column] || column;
      const checkbox = screen.getByLabelText(new RegExp(`Toggle ${label}`, 'i'));
      expect(checkbox).not.toBeChecked();
    });
  });

  it('displays correct selection count in footer', async () => {
    const user = userEvent.setup();
    customRender(<ColumnSelector />);
    
    // Default should show selection count
    const defaultColumns = ['timestamp', 'attacker.id', 'attacker.ip', 'attacker.name', 'type', 'decoy.name'];
    expect(screen.getByText(new RegExp(`${defaultColumns.length} of ${ALL_COLUMNS.length} columns selected`, 'i'))).toBeInTheDocument();
    
    // Uncheck one column
    const timestampCheckbox = screen.getByLabelText(/Toggle Timestamp/i);
    await user.click(timestampCheckbox);
    
    const newCount = defaultColumns.length - 1;
    expect(screen.getByText(new RegExp(`${newCount} of ${ALL_COLUMNS.length} columns selected`, 'i'))).toBeInTheDocument();
  });

  it('shows "All columns visible" when all columns are selected', async () => {
    const user = userEvent.setup();
    customRender(<ColumnSelector />);
    
    // Check the unchecked column
    const severityCheckbox = screen.getByLabelText(/Toggle Severity/i);
    await user.click(severityCheckbox);
    
    expect(screen.getByText(/All columns visible/i)).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    customRender(<ColumnSelector />);
    
    const group = screen.getByRole('group', { name: /column visibility/i });
    expect(group).toBeInTheDocument();
    
    ALL_COLUMNS.forEach(column => {
      const label = COLUMN_LABELS[column] || column;
      const checkbox = screen.getByLabelText(new RegExp(`Toggle ${label}`, 'i'));
      expect(checkbox).toHaveAttribute('aria-checked');
    });
  });
});

