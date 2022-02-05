import {Component, OnInit} from '@angular/core';
import {ListadoDirective} from '../../directives/listado.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {SucursalesService} from '../../services/sucursales.service';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeService} from '../../services/mensaje.service';
import {FormBuilder} from '@angular/forms';
import {CajasService} from '../../services/cajas.service';
import {BusquedaCajaCriteria} from '../../models/criterias/busqueda-caja-criteria';
import {Observable} from 'rxjs';
import {Pagination} from '../../models/pagination';
import * as moment from 'moment';
import {HelperService} from '../../services/helper.service';
import {map} from 'rxjs/operators';
import {Usuario} from '../../models/usuario';
import {UsuariosService} from '../../services/usuarios.service';
import {EstadoCaja} from '../../models/estado-caja';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MontoModalComponent} from '../monto-modal/monto-modal.component';
import {Caja} from '../../models/caja';
import {Rol} from '../../models/rol';
import {AuthService} from '../../services/auth.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-cajas',
  templateUrl: './cajas.component.html',
  styleUrls: ['./cajas.component.scss']
})
export class CajasComponent extends ListadoDirective implements OnInit {
  estado = EstadoCaja;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  rolesEnFiltrosDeUsuario = [ Rol.ENCARGADO, Rol.ADMINISTRADOR ];

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private authService: AuthService,
              private fb: FormBuilder,
              private cajasService: CajasService,
              private usuariosService: UsuariosService,
              private modalService: NgbModal) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaCajaCriteria = {
      idSucursal: Number(this.sucursalesService.getIdSucursal()),
      pagina: this.page,
    };

    if (ps.fechaDesde || ps.fechaHasta) {
      const aux = { desde: null, hasta: null };

      if (ps.fechaDesde) {
        const d = moment.unix(ps.fechaDesde).local();
        aux.desde = { year: d.year(), month: d.month() + 1, day: d.date() };
        terminos.fechaDesde = d.toDate();
      }

      if (ps.fechaHasta) {
        const h = moment.unix(ps.fechaHasta).local();
        aux.hasta = { year: h.year(), month: h.month() + 1, day: h.date() };
        terminos.fechaHasta = h.toDate();
      }

      this.filterForm.get('rangoFecha').setValue(aux);
    }

    if (ps.idUsuarioApertura && !isNaN(ps.idUsuarioApertura)) {
      this.filterForm.get('idUsuarioApertura').setValue(Number(ps.idUsuarioApertura));
      terminos.idUsuarioApertura = Number(ps.idUsuarioApertura);
    }

    if (ps.idUsuarioCierre && !isNaN(ps.idUsuarioCierre)) {
      this.filterForm.get('idUsuarioCierre').setValue(Number(ps.idUsuarioCierre));
      terminos.idUsuarioCierre = Number(ps.idUsuarioCierre);
    }
    return terminos;
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      rangoFecha: null,
      idUsuarioApertura: null,
      idUsuarioCierre: null,
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      rangoFecha: null,
      idUsuarioApertura: null,
      idUsuarioCierre: null,
    });
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.rangoFecha && values.rangoFecha.desde) {
      this.appliedFilters.push({
        label: 'Fecha (desde)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.desde)
      });
    }

    if (values.rangoFecha && values.rangoFecha.hasta) {
      this.appliedFilters.push({
        label: 'Fecha (hasta)', value: HelperService.getFormattedDateFromNgbDate(values.rangoFecha.hasta)
      });
    }

    if (values.idUsuarioApertura) {
      this.appliedFilters.push({
        label: 'Usuario de Apertura', value: values.idUsuarioApertura, asyncFn: this.getUsuarioInfoAsync(values.idUsuarioApertura)
      });
    }

    if (values.idUsuarioCierre) {
      this.appliedFilters.push({
        label: 'Usuario de Cierre', value: values.idUsuarioCierre, asyncFn: this.getUsuarioInfoAsync(values.idUsuarioCierre)
      });
    }
  }

  getUsuarioInfoAsync(id: number): Observable<string> {
    return this.usuariosService.getUsuario(id).pipe(map((u: Usuario) => u.nombre + ' ' + u.apellido));
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.rangoFecha && values.rangoFecha.desde) {
      ret.fechaDesde = HelperService.getUnixDateFromNgbDate(values.rangoFecha.desde);
    }
    if (values.rangoFecha && values.rangoFecha.hasta) {
      ret.fechaHasta = HelperService.getUnixDateFromNgbDate(values.rangoFecha.hasta);
    }

    if (values.idUsuarioApertura) { ret.idUsuarioApertura = values.idUsuarioApertura; }
    if (values.idUsuarioCierre) { ret.idUsuarioCierre = values.idUsuarioCierre; }

    return ret;
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.cajasService.getCajas(terminos as BusquedaCajaCriteria);
  }

  abrirCaja() {
    const modalRef = this.modalService.open(MontoModalComponent, {scrollable: true});
    modalRef.componentInstance.title = 'Abrir Caja';
    modalRef.componentInstance.label = 'Saldo Apertura';
    modalRef.result.then((monto: number) => {
      this.loadingOverlayService.activate();
      this.cajasService.abrirCaja(monto)
        /*
        hacer this.loadingOverlayService.deactivate() en pipe(finalize) produce un mal efecto visual,
        es por eso que el loading overlay no se desactiva en finalize (el reload lo sustituye). Si se hace en error.
        */
        .subscribe(
          () => location.reload(),
          err => {
            this.loadingOverlayService.deactivate();
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          }
        )
      ;
    }, () => { return; });
  }

  reabrirCaja(caja: Caja) {
    const modalRef = this.modalService.open(MontoModalComponent, {scrollable: true});
    modalRef.componentInstance.title = 'Reabrir Caja';
    modalRef.componentInstance.label = 'Saldo Apertura';
    modalRef.result.then((monto: number) => {
      this.loadingOverlayService.activate();
      this.cajasService.reabrirCaja(caja.idCaja, monto)
        /*
        hacer this.loadingOverlayService.deactivate() en pipe(finalize) produce un mal efecto visual,
        es por eso que el loading overlay no se desactiva en finalize (el reload lo sustituye). Si se hace en error.
        */
        .subscribe(
          () => location.reload(),
          err => {
            this.loadingOverlayService.deactivate();
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          }
        )
      ;
    }, () => { return; });
  }

  verCaja(caja: Caja) {
    this.router.navigate(['/cajas/ver', caja.idCaja]);
  }

  eliminarCaja(caja: Caja) {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar una caja.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Está seguro que desea eliminar la caja?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.cajasService.eliminarCaja(caja.idCaja)
          /*
          hacer this.loadingOverlayService.deactivate() en pipe(finalize) produce un mal efecto visual,
          es por eso que el loading overlay no se desactiva en finalize (el reload lo sustituye). Si se hace en error.
          */
          .subscribe(
            () => location.reload(),
            err => {
              this.loadingOverlayService.deactivate();
              this.mensajeService.msg(err.error, MensajeModalType.ERROR);
            },
          )
        ;
      }
    }, () => { return; });
  }
}
