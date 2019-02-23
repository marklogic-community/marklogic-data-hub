import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Component, Inject} from "@angular/core";

@Component({
  selector: 'confirmation-dialog',
  templateUrl: 'confirm-dialog.component.html',
  styleUrls: []
})
export class ConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmationMessage: string }) {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
