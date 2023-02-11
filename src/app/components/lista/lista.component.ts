import { BatchActionsService } from './../../services/batch-actions.service';
import { Component } from '@angular/core';
import { ListaDirective } from 'src/app/directives/lista.directive';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ListaComponent extends ListaDirective {
  constructor(protected batchActionsService: BatchActionsService) {
    super(batchActionsService);
  }
}
