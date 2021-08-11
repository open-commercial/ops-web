import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BatchActionElement, BatchActionKey, BatchActionsService} from '../../services/batch-actions.service';
import {Location} from '@angular/common';
import {Medida} from '../../models/medida';
import {Rubro} from '../../models/rubro';
import {MedidaService} from '../../services/medida.service';
import {RubrosService} from '../../services/rubros.service';
import {combineLatest, Observable} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';
import {MensajeService} from '../../services/mensaje.service';
import {ProductosParaActualizar} from '../../models/productos-para-actualizar';
import {CalculosPrecio, CalculosPrecioValues} from '../../models/calculos-precio';
import {ProductosService} from '../../services/productos.service';
import {Rol} from '../../models/rol';
import {AuthService} from '../../services/auth.service';

enum OpcionPorcentaje {
  PORCENTAJE_RECARGO = '% Recargo',
  PORCENTAJE_DESCUENTO = '% Descuento',
}

@Component({
  selector: 'app-producto-multi-editor',
  templateUrl: './producto-multi-editor.component.html',
  styleUrls: ['./producto-multi-editor.component.scss']
})
export class ProductoMultiEditorComponent implements OnInit {
  form: FormGroup;
  submitted = false;

  medidas: Medida[] = [];
  rubros: Rubro[] = [];

  allowedRolesToEditCantidades = [ Rol.ADMINISTRADOR ];
  hasRolToEditCantidades = false;

  baElements: BatchActionElement[] = [];
  opcionPorcentaje = OpcionPorcentaje;

  @ViewChild('calculosPrecioCheck') calculosPrecioCheck: ElementRef;
  @ViewChild('descuentoRecargoPorcentajeCheck') descuentoRecargoPorcentajeCheck: ElementRef;

  constructor(private fb: FormBuilder,
              private batchActionsService: BatchActionsService,
              private loadingOverlayService: LoadingOverlayService,
              private medidaService: MedidaService,
              private rubrosService: RubrosService,
              private mensajeService: MensajeService,
              private productosService: ProductosService,
              private location: Location,
              private authService: AuthService) { }

  ngOnInit() {
    this.creatForm();
    this.baElements = this.batchActionsService.getElements(BatchActionKey.PRODUCTOS);

    if (!this.baElements.length) {
      this.mensajeService.msg('No se han seleccionado productos para editar', MensajeModalType.ERROR);
      this.location.back();
    }

    const obvs: Observable<any>[] = [
      this.medidaService.getMedidas(),
      this.rubrosService.getRubros(),
    ];

    this.loadingOverlayService.activate();
    combineLatest(obvs)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (recursos: [Medida[], Rubro[]]) => {
          this.medidas = recursos[0];
          this.rubros = recursos[1];
        },
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.location.back();
        }
      )
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  creatForm() {
    this.hasRolToEditCantidades = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEditCantidades);

    this.form = this.fb.group({
      idProveedor: this.fb.group({ check: false, value: [{ value: null, disabled: true }, Validators.required] }),
      idRubro: this.fb.group({ check: false, value: [{ value: null, disabled: true }, Validators.required] }),
      idMedida: this.fb.group({ check: false, value: [{ value: null, disabled: true }, Validators.required] }),
      publico: this.fb.group({ check: false, value: [{ value: false, disabled: true }] }),
      calculosPrecio: this.fb.group({ check: false, value: [{ value: CalculosPrecio.getEmtpyValues(), disabled: true }] }),
      cantidadVentaMinima: this.fb.group({
        check: [{ value: this.hasRolToEditCantidades, disabled: true }],
        value: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]] }
      ),
      descuentoRecargoPorcentaje: this.fb.group({
        check: false,
        value: this.fb.group({
          opcion: [OpcionPorcentaje.PORCENTAJE_RECARGO, Validators.required],
          porcentaje: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
        })
      }),
    });
    this.form.get('descuentoRecargoPorcentaje').get('value').disable();
  }

  get f() { return this.form.controls; }

  checkChange(fieldName: string, $event) {
    const checked = $event.target.checked;
    const valueControl = this.form.get(fieldName).get('value');

    if (checked && valueControl.disabled) {
      valueControl.enable();
      this.togglePreciosYPorcentajesChecks(fieldName);
      return;
    }

    if (!checked && !valueControl.disabled) {
      valueControl.disable();
    }
  }

  togglePreciosYPorcentajesChecks(fieldName: string) {
    if (['calculosPrecio', 'descuentoRecargoPorcentaje'].indexOf(fieldName) < 0) {
      return;
    }

    const fieldNameToDisable = fieldName === 'calculosPrecio' ? 'descuentoRecargoPorcentaje' : 'calculosPrecio';
    const control = this.form.get(fieldNameToDisable);
    control.get('check').setValue(false);
    control.get('value').disable();
  }

  submit() {
    this.submitted = true;
    if (this.form.valid) {
      if (!this.hasCheckedAnything()) {
        this.mensajeService.msg('No ha seleccionado ningún campo para editar!', MensajeModalType.INFO);
        return;
      }
      const formValues = this.form.value;
      const ppa: ProductosParaActualizar = {
        idProducto: this.baElements.map(bae => bae.id),
      };
      if (formValues.idProveedor.check) {
        ppa.idProveedor = Number(formValues.idProveedor.value);
      }
      if (formValues.idRubro.check) {
        ppa.idRubro = Number(formValues.idRubro.value);
      }
      if (formValues.idMedida.check) {
        ppa.idMedida = Number(formValues.idMedida.value);
      }
      if (formValues.publico.check) {
        ppa.publico = formValues.publico.value;
      }
      if (formValues.calculosPrecio.check) {
        const cp: CalculosPrecioValues = formValues.calculosPrecio.value;
        ppa.gananciaPorcentaje = cp.gananciaPorcentaje.toString();
        ppa.ivaPorcentaje = cp.ivaPorcentaje.toString();
        ppa.precioCosto = cp.precioCosto.toString();
        ppa.porcentajeBonificacionPrecio = cp.porcentajeBonificacionPrecio.toString();
        ppa.porcentajeBonificacionOferta = cp.porcentajeBonificacionOferta.toString();
      }
      if (formValues.descuentoRecargoPorcentaje.check) {
        ppa.descuentoRecargoPorcentaje = (formValues.descuentoRecargoPorcentaje.value.opcion === OpcionPorcentaje.PORCENTAJE_RECARGO
          ? 1 : -1) * formValues.descuentoRecargoPorcentaje.value.porcentaje;
      }
      if (formValues.cantidadVentaMinima && formValues.cantidadVentaMinima.check) {
        ppa.cantidadVentaMinima = formValues.cantidadVentaMinima.value;
      }

      this.loadingOverlayService.activate();
      this.productosService.actualizarMultiplesProductos(ppa)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
          () => {
            this.batchActionsService.clear(BatchActionKey.PRODUCTOS);
            this.mensajeService.msg('Productos actualizados correctamente!', MensajeModalType.INFO);
            this.location.back();
          },
          err => this.mensajeService.msg(err.error, MensajeModalType.ERROR),
        )
      ;
    }
  }

  hasCheckedAnything(): boolean {
    const formValues = this.form.value;
    return Object.values(formValues).some((e: { check: boolean, value: any }) => e.check);
  }
}
