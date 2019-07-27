import { NgModule } from '@angular/core';
import {MenubarModule} from 'primeng/menubar';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {PanelModule} from 'primeng/panel';
import {ToastModule} from 'primeng/toast';

import {MessageService} from 'primeng/api';
import {MessageModule} from 'primeng/message';

@NgModule({
  imports: [
    MenubarModule, ButtonModule, InputTextModule, PanelModule, ToastModule, MessageModule
  ],
  exports: [
    MenubarModule, ButtonModule, InputTextModule, PanelModule, ToastModule, MessageModule
  ],
  providers: [
    MessageService,
  ]
})
export class SicOpsPrimeNgModule { }
