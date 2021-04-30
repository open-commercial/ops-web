import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

export interface OPOption {
  value: number|string;
  text: string;
}

@Component({
  selector: 'app-option-picker-modal',
  templateUrl: './option-picker-modal.component.html',
  styleUrls: ['./option-picker-modal.component.scss']
})
export class OptionPickerModalComponent implements OnInit {
  options: OPOption[] = [];
  title = '';
  label = 'Seleccione una opción';
  form: FormGroup;
  constructor(private fb: FormBuilder,
              public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      value: [null, Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      const value = this.form.get('value').value;
      this.activeModal.close(value);
    }
  }
}
