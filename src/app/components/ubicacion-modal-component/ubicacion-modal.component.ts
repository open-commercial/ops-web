import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Ubicacion } from '../../models/ubicacion';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UbicacionesService } from '../../services/ubicaciones.service';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Provincia } from '../../models/provincia';
import { Localidad } from '../../models/localidad';
import { Observable, of, Subject } from "rxjs";
import { Cliente } from "../../models/cliente";
import { Pagination } from "../../models/pagination";

@Component({
  selector: 'app-ubicacion-modal-component',
  templateUrl: './ubicacion-modal.component.html',
  styleUrls: ['./ubicacion-modal.component.scss']
})
export class UbicacionModalComponent implements OnInit {
  private _ubicacion: Ubicacion;

  // @Input()
  set ubicacion(u: Ubicacion) {
    this._ubicacion = u;
  }

  get ubicacion(): Ubicacion { return this._ubicacion; }

  title = 'Ubicación';

  form: FormGroup;
  submitted = false;

  provinciasLoading = false;
  provincias: Provincia[] = [];


  localidadesLoading = false;
  localidades: Localidad[] = [];

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private ubicacionesService: UbicacionesService) { }

  ngOnInit() {
    this.createForm();
    this.getProvincias();
  }

  getProvincias() {
    this.form.disable();
    this.provinciasLoading = true;
    this.ubicacionesService.getProvincias()
      .pipe(finalize(() => {
        this.form.enable();
        this.provinciasLoading = false;
      }))
      .subscribe((ps: Provincia[]) => {
        this.provincias = ps;
        this.setFormValues();
      })
    ;
  }

  createForm() {
    this.form = this.fb.group({
      idProvincia: [null, Validators.required],
      idLocalidad: [null, Validators.required],
      calle: '',
      numero: '',
      piso: '',
      departamento: '',
      descripcion: '',
    });

    this.form.get('idProvincia').valueChanges.subscribe(v => {
      if (!v) {
        this.form.get('idLocalidad').setValue(null);
        this.localidades = [];
        return;
      }
      this.form.get('idLocalidad').disable();
      this.localidadesLoading = true;
      this.ubicacionesService.getLocalidades(v)
        .pipe(finalize(() => {
          this.form.get('idLocalidad').enable();
          this.localidadesLoading = false;
        }))
        .subscribe(locs => {
          const idLocalidad = this.form.get('idLocalidad').value;
          this.localidades = locs;
          if (idLocalidad) {
            const aux = this.localidades.filter((l: Localidad) => l.idLocalidad === idLocalidad);
            if (!aux.length) { this.form.get('idLocalidad').setValue(null); }
          }
        })
      ;
    });
  }

  setFormValues() {
    this.form.patchValue({
      idProvincia: this._ubicacion ? this._ubicacion.idProvincia : null,
      idLocalidad: this._ubicacion ? this._ubicacion.idLocalidad : null,
      calle: this._ubicacion ? this._ubicacion.calle : '',
      numero: this._ubicacion ? this._ubicacion.numero : '',
      piso: this._ubicacion ? this._ubicacion.piso : '',
      departamento: this._ubicacion ? this._ubicacion.departamento : '',
      descripcion: this._ubicacion ? this._ubicacion.descripcion : '',
    });
  }

  get f() { return this.form.controls; }

  submit() {
    if (this.form.get('idProvincia').invalid && this.form.get('idProvincia').untouched) {
      this.form.get('idProvincia').markAsTouched();
    }
    if (this.form.get('idLocalidad').invalid && this.form.get('idLocalidad').untouched) {
      this.form.get('idLocalidad').markAsTouched();
    }
    this.submitted = true;
    if (this.form.valid) {
      const ubicacion = this.getFormValues();
      this.activeModal.close(ubicacion);
    }
  }

  getFormValues(): Ubicacion {
    return {
      calle: this.form.get('calle').value,
      codigoPostal: this.ubicacion ? this.ubicacion.codigoPostal : null,
      departamento: this.form.get('departamento').value,
      descripcion: this.form.get('descripcion').value,
      idLocalidad: this.form.get('idLocalidad').value,
      idProvincia: this.form.get('idProvincia').value,
      idUbicacion: this.ubicacion ? this.ubicacion.idUbicacion : null,
      latitud: this.ubicacion ? this.ubicacion.latitud : null,
      longitud: this.ubicacion ? this.ubicacion.longitud : null,
      nombreLocalidad: '',
      nombreProvincia: '',
      numero: this.form.get('numero').value,
      piso: this.form.get('piso').value,
      eliminada: this.ubicacion ? this.ubicacion.eliminada : null,
    };
  }
}
