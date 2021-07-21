import {OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {SucursalesService} from '../../services/sucursales.service';
import {NotasService} from '../../services/notas.service';
import {Cliente} from '../../models/cliente';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {finalize} from 'rxjs/operators';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {HelperService} from '../../services/helper.service';

export abstract class NotaDebitoVentaModalComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  loading = false;

  title = 'Nueva Nota de Débito';
  cliente: Cliente;
  tiposDeComprobantes: TipoDeComprobante[] = [];

  helper = HelperService;

  protected constructor(public activeModal: NgbActiveModal,
                        protected fb: FormBuilder,
                        protected loadingOverlayService: LoadingOverlayService,
                        protected mensajeService: MensajeService,
                        protected sucursalesService: SucursalesService,
                        protected notasService: NotasService) { }

  ngOnInit() {
    this.createForm();
    this.loading = true;
    this.notasService.getTiposDeNotaDebitoClienteSucursal(
      this.cliente.idCliente, this.sucursalesService.getIdSucursal()
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        data => this.tiposDeComprobantes = data,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      )
    ;
  }

  createForm() {
    this.form = this.fb.group({
      tipoDeComprobante: [null, Validators.required],
      gastoAdministrativo: [0, Validators.required],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      this.doSubmit();
    }
  }

  abstract doSubmit();
}
