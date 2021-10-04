import {Component, EventEmitter, Input, Output} from '@angular/core';
import { BatchActionKey, BatchActionsService } from '../../services/batch-actions.service';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {MensajeService} from '../../services/mensaje.service';
import {MensajeModalType} from '../mensaje-modal/mensaje-modal.component';

export interface ActionConfiguration {
  description: string;
  icon: IconProp;
  clickFn: (ids: number[]) => any;
  isVisible?: () => boolean;
}

@Component({
  selector: 'app-batch-actions-box',
  templateUrl: './batch-actions-box.component.html',
  styleUrls: ['./batch-actions-box.component.scss']
})
export class BatchActionsBoxComponent {
  private pBatchActionKey: BatchActionKey = null;
  @Input() set batchActionKey(value: BatchActionKey) { this.pBatchActionKey = value; }
  get batchActionKey(): BatchActionKey { return this.pBatchActionKey; }

  private pActions: ActionConfiguration[];
  @Input() set actions(value: ActionConfiguration[]) { this.pActions = value; }
  get actions(): ActionConfiguration[] { return this.pActions; }

  @Output() emptySelection = new EventEmitter<void>();

  constructor(public batchActionsService: BatchActionsService,
              private mensajeService: MensajeService) { }

  clearAll() {
    const msg = '¿Desea quitar todos los elementos de la selección?';
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.batchActionsService.clear(this.batchActionKey);
        this.emptySelection.emit();
      }
    });
  }

  removeItem(elementId: number) {
    this.batchActionsService.removeElememt(this.batchActionKey, elementId);
    if (!this.batchActionsService.count(this.batchActionKey)) {
      this.emptySelection.emit();
    }
  }

  actionClick(a: ActionConfiguration) {
    const elements = this.batchActionsService.getElements(this.batchActionKey);
    const ids = elements.map(e => e.id);
    a.clickFn(ids);
  }

  isButtonVisible(a: ActionConfiguration) {
    /* if a.isVisible is a function */
    if (a.isVisible && {}.toString.call(a.isVisible) === '[object Function]') {
      return a.isVisible();
    }
    if (typeof a.isVisible === 'boolean') {
      return a.isVisible;
    }
    return true;
  }
}
