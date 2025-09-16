import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, CheckSquare, Square } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface BulkTransactionControlsProps {
  transactions: Transaction[];
  selectedTransactions: string[];
  onSelectionChange: (transactionIds: string[]) => void;
  onBulkDelete: (transactionIds: string[]) => void;
  showSelection: boolean;
  setShowSelection: (show: boolean) => void;
}

export function BulkTransactionControls({
  transactions,
  selectedTransactions,
  onSelectionChange,
  onBulkDelete,
  showSelection,
  setShowSelection
}: BulkTransactionControlsProps) {
  // Use showSelection from parent to sync state

  const allSelected = transactions.length > 0 && selectedTransactions.length === transactions.length;
  const someSelected = selectedTransactions.length > 0 && selectedTransactions.length < transactions.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(transactions.map(t => t.id));
    }
  };

  const toggleBulkActions = () => {
    const newState = !showSelection;
    setShowSelection(newState);
    if (!newState) {
      onSelectionChange([]);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant={showSelection ? "default" : "outline"}
        size="sm"
        onClick={toggleBulkActions}
        className="flex items-center gap-2"
      >
        {showSelection ? <CheckSquare size={16} /> : <Square size={16} />}
        <span>{showSelection ? 'Cancel Selection' : 'Select Multiple'}</span>
      </Button>

      {showSelection && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <Checkbox 
              checked={allSelected}
              className="w-4 h-4"
              style={{ 
                backgroundColor: someSelected && !allSelected ? '#6366f1' : undefined,
                opacity: someSelected && !allSelected ? 0.6 : 1
              }}
            />
            <span>
              {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
            </span>
          </Button>

          {selectedTransactions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Selected ({selectedTransactions.length})</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Selected Transactions</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedTransactions.length} selected transaction{selectedTransactions.length > 1 ? 's' : ''}? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onBulkDelete(selectedTransactions);
                      setShowSelection(false);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete {selectedTransactions.length} Transaction{selectedTransactions.length > 1 ? 's' : ''}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </div>
  );
}