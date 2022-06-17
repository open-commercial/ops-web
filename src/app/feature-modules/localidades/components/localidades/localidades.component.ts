import { Localidad } from '../../../../models/localidad';
import { FiltroOrdenamientoComponent } from '../../../../components/filtro-ordenamiento/filtro-ordenamiento.component';
import { finalize } from 'rxjs/operators';
import { Provincia } from '../../../../models/provincia';
import { HelperService } from '../../../../services/helper.service';
import { FormBuilder } from '@angular/forms';
import { BusquedaLocalidadCriteria } from '../../../../models/criterias/busqueda-localidad-criteria';
import { UbicacionesService } from '../../../../services/ubicaciones.service';
import { Pagination } from '../../../../models/pagination';
import { Observable } from 'rxjs';
import { MensajeService } from 'src/app/services/mensaje.service';
import { LoadingOverlayService } from '../../../../services/loading-overlay.service';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ListadoDirective } from 'src/app/directives/listado.directive';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';

@Component({
  selector: 'app-localidades',
  templateUrl: './localidades.component.html'
})
export class LocalidadesComponent extends ListadoDirective implements OnInit {
  ordenArray = [
    { val: 'nombre', text: 'Nombre' },
    { val: 'provincia.nombre', text: 'Provincia' },
  ];
  sentidoArray = [
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  provincias: Provincia[] = [];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordenarPorL') ordenarPorLElement: FiltroOrdenamientoComponent;
  @ViewChild('sentidoL') sentidoLElement: FiltroOrdenamientoComponent;
  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              protected loadingOverlayService: LoadingOverlayService,
              protected mensajeService: MensajeService,
              private fb: FormBuilder,
              private ubicacionesService: UbicacionesService) {
    super(route, router, sucursalesService, loadingOverlayService, mensajeService)
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadingOverlayService.activate();
    this.ubicacionesService.getProvincias()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: provincias => this.provincias = provincias,
        error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
      })
    ;
  }

  getTerminosFromQueryParams(ps) {
    const terminos: BusquedaLocalidadCriteria = {
      pagina: this.page,
    }

    const { orden, sentido } = this.getDefaultOrdenYSentido();
    const config = {
      ordenarPor: { defaultValue: orden },
      sentido: { defaultValue: sentido },
    };

    if (ps.envioGratuito === 'true') {
      this.filterForm.get('envioGratuito').setValue(true);
      terminos.envioGratuito = true;
    }

    if (ps.envioGratuito === 'false') {
      this.filterForm.get('envioGratuito').setValue(false);
      terminos.envioGratuito = false;
    }

    return HelperService.paramsToTerminos<BusquedaLocalidadCriteria>(ps, config , terminos);
  }

  getItemsObservableMethod(terminos): Observable<Pagination> {
    return this.ubicacionesService.buscarLocalidades(terminos as BusquedaLocalidadCriteria);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      nombre: '',
      nombreProvincia: '',
      envioGratuito: false,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      nombre: '',
      nombreProvincia: '',
      envioGratuito: null,
      ordenarPor: '',
      sentido: '',
    })
  }

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.nombre) {
      this.appliedFilters.push({ label: 'Nombre', value: values.nombre });
    }

    if (values.nombreProvincia) {
      this.appliedFilters.push({ label: 'Provincia', value: values.nombreProvincia });
    }

    if (values.envioGratuito === true) {
      this.appliedFilters.push({ label: '', value: 'Envío Gratuito' });
    }

    if (values.envioGratuito === false) {
      this.appliedFilters.push({ label: '', value: 'Envío NO Gratuito' });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorLElement ? this.ordenarPorLElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoLElement ? this.sentidoLElement.getTexto() : '';
    }, 500);
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.nombre) { ret.nombre = values.nombre; }
    if (values.nombreProvincia) { ret.nombreProvincia = values.nombreProvincia; }
    if (values.envioGratuito !== null) { ret.envioGratuito = values.envioGratuito; }

    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  editarLocalidad(l: Localidad) {
    this.router.navigate(['/localidades/editar', l.idLocalidad]);
  }
}
