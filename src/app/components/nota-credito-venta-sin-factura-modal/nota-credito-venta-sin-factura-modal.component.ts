import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotasService} from '../../services/notas.service';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {finalize} from 'rxjs/operators';
import {TipoDeComprobante} from '../../models/tipo-de-comprobante';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {NuevaNotaCreditoSinFactura} from '../../models/nueva-nota-credito-sin-factura';
import {Cliente} from '../../models/cliente';
import {HelperService} from '../../services/helper.service';

@Component({
  selector: 'app-nota-credito-venta-sin-factura-modal',
  templateUrl: './nota-credito-venta-sin-factura-modal.component.html'
})
export class NotaCreditoVentaSinFacturaModalComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  loading = false;

  cliente: Cliente;
  tiposDeComprobantes: TipoDeComprobante[] = [];

  helper = HelperService;

  constructor(public activeModal: NgbActiveModal,
              private fb: FormBuilder,
              public loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private sucursalesService: SucursalesService,
              private notasService: NotasService) { }

  ngOnInit() {
    this.createForm();
    this.loading = true;
    this.notasService.getTiposDeNotaCreditoClienteSucursal(
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
      descripcion: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(0.1)]],
    });
  }

  get f() { return this.form.controls; }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      const formValues = this.form.value;
      const nnc: NuevaNotaCreditoSinFactura = {
        idCliente: this.cliente.idCliente,
        idSucursal: this.sucursalesService.getIdSucursal(),
        tipo: formValues.tipoDeComprobante,
        detalle: formValues.descripcion,
        monto: formValues.monto,
      };

      this.loadingOverlayService.activate();
      this.notasService.calcularNotaCreditoSinFactura(nnc)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          nc => this.activeModal.close([nnc, nc]),
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
      ;
    }
  }
}
