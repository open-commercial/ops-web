import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FiltroOrdenamientoComponent} from '../components/filtro-ordenamiento/filtro-ordenamiento.component';
import {FiltrosAplicadosComponent} from '../components/filtros-aplicados/filtros-aplicados.component';
import {FiltrosFormComponent} from '../components/filtros-form/filtros-form.component';
import {UbicacionFormFieldComponent} from '../components/ubicacion-form-field/ubicacion-form-field.component';
import {ListaComponent} from '../components/lista/lista.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import {
  faBars, faCircleNotch, faFileInvoice, faFilter,
  faSearch, faTrash, faCalendar, faPortrait,
  faTimes, faCheck, faExclamationTriangle, faCashRegister,
  faClipboardList, faPlus, faBarcode, faEdit,
  faBoxOpen, faMinus, faStore, faUser,
  faSignOutAlt, faInfoCircle, faQuestionCircle, faTimesCircle,
  faFileSignature, faFileDownload, faChevronLeft, faIndustry,
  faSuitcase, faPen, faEnvelope, faLink,
  faFolderOpen, faCopy, faArrowAltCircleDown, faExchangeAlt,
  faCheckSquare, faLockOpen, faLock, faSyncAlt, faCoins,
  faChevronDown, faChevronUp, faFileExport, faMapMarkerAlt,
  faUserCheck, faBook, faBalanceScaleRight, faBalanceScaleLeft,
  faTruck, faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';
import {BatchActionsBoxComponent} from '../components/batch-actions-box/batch-actions-box.component';
import { NgBoostrapModule } from './ng-boostrap.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    FiltroOrdenamientoComponent,
    FiltrosAplicadosComponent,
    FiltrosFormComponent,
    BatchActionsBoxComponent,
    ListaComponent,
    UbicacionFormFieldComponent,
  ],
  imports: [
    CommonModule,
    NgBoostrapModule,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  exports: [
    FiltroOrdenamientoComponent,
    FiltrosAplicadosComponent,
    FiltrosFormComponent,
    BatchActionsBoxComponent,
    ListaComponent,
    UbicacionFormFieldComponent,
  ]
})
export class ShareModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faBars, faCircleNotch, faFileInvoice, faFilter,
      faSearch, faTrash, faCalendar, faEye,
      faEyeSlash, faPortrait, faTimes, faCheck,
      faExclamationTriangle, faCashRegister, faClipboardList, faPlus,
      faBarcode, faEdit, faBoxOpen, faMinus,
      faStore, faUser, faSignOutAlt, faInfoCircle,
      faQuestionCircle, faTimesCircle, faFileSignature,
      faFileDownload, faChevronLeft, faIndustry, faSuitcase,
      faPen, faEnvelope, faLink, faFolderOpen,
      faCopy, faArrowAltCircleDown, faExchangeAlt, faCheckSquare,
      faLockOpen, faLock, faSyncAlt, faCoins,
      faChevronDown, faChevronUp, faCheckSquare, faFileExport,
      faMapMarkerAlt, faUserCheck, faBook, faBalanceScaleRight,
      faBalanceScaleLeft, faTruck, faFileInvoiceDollar
    );
  }
}
