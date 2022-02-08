import { Component, OnInit } from '@angular/core';
import {RecibosDirective} from '../../../../directives/recibos.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../../../services/sucursales.service';
import {LoadingOverlayService} from '../../../../services/loading-overlay.service';
import {MensajeService} from '../../../../services/mensaje.service';
import {FormBuilder, FormControl} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecibosService} from '../../../../services/recibos.service';
import {FormasDePagoService} from '../../../../services/formas-de-pago.service';
import {UsuariosService} from '../../../../services/usuarios.service';
import {AuthService} from '../../../../services/auth.service';
import {ConfiguracionesSucursalService} from '../../../../services/configuraciones-sucursal.service';
import {NotasService} from '../../../../services/notas.service';
import {Movimiento} from '../../../../models/movimiento';
import {Recibo} from '../../../../models/recibo';
import {Observable} from 'rxjs';
import {finalize, map} from 'rxjs/operators';
import {Proveedor} from '../../../../models/proveedor';
import {ProveedoresService} from '../../../../services/proveedores.service';
import {MensajeModalType} from '../../../../components/mensaje-modal/mensaje-modal.component';
import {
  NotaDebitoCompraReciboModalComponent
} from '../../../cuentas-corrientes-proveedor/components/nota-debito-compra-recibo-modal/nota-debito-compra-recibo-modal.component';
import {NuevaNotaDebitoDeRecibo} from '../../../../models/nueva-nota-debito-de-recibo';
import {NotaDebito} from '../../../../models/nota';
import {
  NotaDebitoCompraDetalleReciboModalComponent
} from '../../../cuentas-corrientes-proveedor/components/nota-debito-compra-detalle-recibo-modal/nota-debito-compra-detalle-recibo-modal.component';

@Component({
  selector: 'app-recibos-compra',
  templateUrl: './recibos-compra.component.html'
})
export class RecibosCompraComponent extends RecibosDirective implements OnInit {
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              protected fb: FormBuilder,
              protected modalService: NgbModal,
              protected recibosService: RecibosService,
              protected formasDePagoService: FormasDePagoService,
              protected usuariosService: UsuariosService,
              protected authService: AuthService,
              protected configuracionesSucursalService: ConfiguracionesSucursalService,
              protected notasService: NotasService,
              private proveedoresService: ProveedoresService) {
    super(
      route, router, sucursalesService, loadingOverlayService, mensajeService,
      fb, modalService, recibosService, formasDePagoService, usuariosService,
      authService, configuracionesSucursalService, notasService
    );
  }

  ngOnInit() {
    super.ngOnInit();
  }

  getMovimiento(): Movimiento {
    return Movimiento.COMPRA;
  }

  getTerminosFromQueryParams(ps) {
    const terminos = super.getTerminosFromQueryParams(ps);

    if (ps.idProveedor && !isNaN(ps.idProveedor)) {
      this.filterForm.get('idProveedor').setValue(Number(ps.idProveedor));
      terminos.idProveedor = Number(ps.idProveedor);
    }

    return terminos;
  }

  createFilterForm() {
    super.createFilterForm();
    this.filterForm.addControl('idProveedor', new FormControl(null));
  }

  resetFilterForm() {
    super.resetFilterForm();
    this.filterForm.get('idProveedor').setValue(null);
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    super.getAppliedFilters();
    if (values.idProveedor) {
      this.appliedFilters.push({ label: 'Proveedor', value: values.idProveedor, asyncFn: this.getProveedorInfoAsync(values.idProveedor) });
    }
  }

  getProveedorInfoAsync(id: number): Observable<string> {
    return this.proveedoresService.getProveedor(id).pipe(map((p: Proveedor) => p.razonSocial));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret = super.getFormValues();

    if (values.idProveedor) { ret.idProveedor = values.idProveedor; }

    return ret;
  }

  doCrearNotaDebitoRecibo(r: Recibo) {
    this.loadingOverlayService.activate();
    this.proveedoresService.getProveedor(r.idProveedor)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (p: Proveedor) => {
          const modalRef = this.modalService.open(NotaDebitoCompraReciboModalComponent, { backdrop: 'static' });
          modalRef.componentInstance.proveedor = p;
          modalRef.componentInstance.idRecibo = r.idRecibo;
          modalRef.result.then((data: [NuevaNotaDebitoDeRecibo, NotaDebito]) => {
            const modalRef2 = this.modalService.open(NotaDebitoCompraDetalleReciboModalComponent, { backdrop: 'static'});
            modalRef2.componentInstance.nndr = data[0];
            modalRef2.componentInstance.notaDebito = data[1];
            modalRef2.componentInstance.proveedor = p;
            modalRef2.result.then(
              (nota: NotaDebito) => this.showNotaCreationSuccessMessage(nota, 'Nota de Débito creada correctamente.'),
              () => { return; }
            );
          }, () => { return; });
        },
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }
}
