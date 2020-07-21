import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-traspaso',
  templateUrl: './traspaso.component.html',
  styleUrls: ['./traspaso.component.scss']
})
export class TraspasoComponent implements OnInit {
  loading = false;
  form: FormGroup;

  constructor(private router: Router,
              private location: Location,
              private fb: FormBuilder) { }

  ngOnInit() {
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      sucursalOrigen: [null, Validators.required],
      sucursalDestino: [null, Validators.required],
    });
  }

}
