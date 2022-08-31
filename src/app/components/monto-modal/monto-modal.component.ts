import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-monto-modal',
  templateUrl: './monto-modal.component.html',
  styleUrls: ['./monto-modal.component.scss']
})
export class MontoModalComponent implements OnInit {
  monto: number = null;
  form: UntypedFormGroup;
  submitted = false;
  title = '';
  htmlInfo = '';
  label = 'Monto';

  constructor(public activeModal: NgbActiveModal,
              private fb: UntypedFormBuilder,
              private sanitaizer: DomSanitizer) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      monto: [this.monto , [Validators.required]]
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const monto = this.form.get('monto').value;
      this.activeModal.close(monto);
    }
  }

  getSafeHtml(): SafeHtml {
    return this.sanitaizer.bypassSecurityTrustHtml(this.htmlInfo);
  }
}
