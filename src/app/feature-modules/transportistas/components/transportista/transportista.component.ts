import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Transportista} from '../../../../models/transportista';
import {ActivatedRoute} from '@angular/router';
import {TransportistasService} from '../../../../services/transportistas.service';
import {finalize} from 'rxjs/operators';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {Location} from '@angular/common';
import {MensajeService} from '../../../../services/mensaje.service';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-transportista',
  templateUrl: './transportista.component.html'
})
export class TransportistaComponent implements OnInit {
  transportista: Transportista;
  form: UntypedFormGroup;
  submitted = false;
  constructor(private route: ActivatedRoute,
              private fb: UntypedFormBuilder,
              private loadingOverlayService: LoadingOverlayService,
              private location: Location,
              private transportistasService: TransportistasService,
              private mensajeService: MensajeService) { }

  ngOnInit(): void {
    this.createForm();
    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loadingOverlayService.activate();
      this.transportistasService.getTransportista(id)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: (t: Transportista) => {
            this.transportista = t;
            this.populateForm();
          },
          error: err => {
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            this.volverAlListado();
          }
        })
      ;
    }
  }

  populateForm() {
    this.form.patchValue(this.transportista);
  }

  volverAlListado() {
    this.location.back();
  }

  createForm() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      ubicacion: null,
      telefono: '',
      web: '',
    });
  }

  get f() {  return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const t: Transportista = {
        idTransportista: this.transportista ? this.transportista.idTransportista : null,
        nombre: formValues.nombre,
        ubicacion: formValues.ubicacion,
        telefono: formValues.telefono,
        web: formValues.web,
      };
      this.loadingOverlayService.activate();
      this.transportistasService.guardarTransportista(t)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe({
          next: () => {
            this.mensajeService
              .msg('Los datos del transportistas fueron guardados exitosamente.', MensajeModalType.INFO)
              .then(() => this.volverAlListado())
            ;
          },
          error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        })
      ;
    }
  }
}
