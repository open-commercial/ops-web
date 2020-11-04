import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-monto-modal',
  templateUrl: './monto-modal.component.html',
  styleUrls: ['./monto-modal.component.scss']
})
export class MontoModalComponent implements OnInit {
  monto: number = null;
  form: FormGroup;
  submitted = false;
  title = '';
  htmlInfo = '';
  label = 'Monto';

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private sanitaizer: DomSanitizer) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      monto: [this.monto , [Validators.required, Validators.min(0)]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const saldoApertura = this.form.get('monto').value;
      this.activeModal.close(saldoApertura);
    }
  }

  getSafeHtml(): SafeHtml {
    return this.sanitaizer.bypassSecurityTrustHtml(this.htmlInfo);
  }
}
